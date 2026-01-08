import undetected_chromedriver as uc
import time as t
import pandas as pd
from bs4 import BeautifulSoup
import json
from pyvirtualdisplay import Display
import subprocess
import os
import signal
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options


## TODO should be good
# Start and stop XVFB -> These are not used anymore, just for legacy
def start_xvfb():
    process = subprocess.Popen(['Xvfb', ':99', '-screen', '0', '1920x1080x24'])
    os.environ['DISPLAY'] = ':99'
    return process

def stop_xvfb(process):
    process.send_signal(signal.SIGTERM)
    process.wait()


def make_url(location='Austin_TX', beds=None, baths=None):
    match beds, baths:
        case None, None:
            return f"https://realtor.com/apartments/{location}/type-single-family-home/"
        case int(), None:
            return f"https://realtor.com/apartments/{location}/type-single-family-home/beds-{beds}"
        case None, int():
            return f"https://realtor.com/apartments/{location}/type-single-family-home/baths-{baths}"
        case int(), int():
            return f"https://realtor.com/apartments/{location}/type-single-family-home/beds-{beds}/baths-{baths}"



def scrape_url(url):
    # Setting up web driver
    options = Options()

    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    # Massively Speeds up scraping process
    options.page_load_strategy = 'eager'

    driver = uc.Chrome(headless=False,use_subprocess=True, options=options)
    driver.get(url)

    # Measures speed of scraper
    start_time = t.perf_counter()

    # Handles Error where closes instantly
    wait = WebDriverWait(driver, 15)
    wait.until(
        EC.presence_of_element_located(
            (By.CSS_SELECTOR, '.CardContentstyles__StyledCardContent-rui__m7hjnf-0')
        )
    )

    # Storing information
    results = []
    seen_links = set()
    total_pages = 0
    
            

    pg = 1
    last_page = False
    driver.execute_script("window.scrollTo(0, 0);")

    try: 
        while True:
            # Finds out if the page is the last page
            if last_page:
                break
        
            if pg != 1:
                pageurl = f"{url}/pg-{pg}"
            else:
                pageurl = url
            # Gets Website
            driver.get(pageurl)

            
            # Finds the max height of the page
            last_height = driver.execute_script("return document.body.scrollHeight")
            driver.execute_script("window.scrollTo(0, 0);")


            while True:
                # Scrolls the page by 1/7th max height
                driver.execute_script(f"window.scrollBy(0, {last_height/7});")

                # Checking for new height
                new_height = driver.execute_script("return document.body.scrollHeight")
                if new_height == last_height:
                    # t.sleep(0.5)
                    # Scan through the listings and append them to a data frame in pandas, figure out how to add to database
                    html = driver.page_source
                    soup = BeautifulSoup(html, "html.parser")

                    # Deletes unwanted div
                    unwanted = soup.find('div', class_='InRiverBrowseModule_inRiverBrowseModule__EHCdk')
                    if unwanted:
                        unwanted.decompose()

                    # Gather Listings into an array 
                    listings = soup.select(".CardContentstyles__StyledCardContent-rui__m7hjnf-0")
                    # print(f"Number of Listings on page {pg}: {len(listings)}")
                    if len(listings) == 0:
                        last_page = True
                        break


                    for listing in listings:
                        address_elem = listing.find('div', attrs={'data-testid': 'card-address-1'})
                        price_elem = listing.find("div", attrs={"data-testid": "card-price"})
                        beds_elem = listing.find('li', attrs={"data-testid": "property-meta-beds"})
                        baths_elem = listing.find('li', attrs={"data-testid": "property-meta-baths"})
                        sqft_elem = listing.find('li', attrs={"data-testid": "property-meta-sqft"})
                        link_elem = listing.find('a', attrs={"data-testid": "card-link"})

                        if not link_elem:
                            # print("Empty (no link)")
                            continue

                        href = link_elem.get("href")
                        if not href:
                            # print("Empty (no href)")
                            continue

                        full_link = "https://realtor.com" + href

                        # Deduplicate
                        if full_link in seen_links:
                            continue
                        seen_links.add(full_link)

                        address = address_elem.get_text(strip=True) if address_elem else None
                        price = price_elem.get_text(strip=True) if price_elem else None
                        beds = beds_elem.get_text(strip=True) if beds_elem else None
                        baths = baths_elem.get_text(strip=True) if baths_elem else None
                        sqft = sqft_elem.get_text(strip=True) if sqft_elem else None


                        try:
                            # Clean Data
                            v = int(price.replace("$","").replace(",","").replace("From",""))
                            price = v if v <= 50000 else None
                            beds = float(beds.replace("bed",""))
                            baths = float(baths.replace("bath", ""))
                            sqft = int(sqft.replace(',', '').split('sqft')[0])

                        except Exception as e:
                            # print(e)
                            price = None

                        if price is None:
                            continue

                        # Store listing data
                        results.append({
                            "address": address,
                            "rent_price": price,
                            "link": full_link,
                            "beds": beds,
                            "baths": baths,
                            "sqft": sqft
                        })

                    if total_pages == 0:
                        card_list = []
                        pages = soup.find_all(class_="base__StyledAnchor-rui__sc-7dk5je-0 gOIZFL pagination-item")
                        if pages:
                            for page in pages:
                                card_list.append(int(page.get_text(strip=True)))
                            print(max(card_list))
                            total_pages = max(card_list)
                    break
                last_height = new_height

            # Increments page
            if total_pages > 0:
                print(f"Page {pg} out of {total_pages} scanned.")
            pg = pg + 1
    finally:
        end_time = t.perf_counter()
        print(f"Total Listings Captured: {len(results)} in {end_time - start_time:0.02f} seconds.")
        driver.quit()

    return results
            

    

    
