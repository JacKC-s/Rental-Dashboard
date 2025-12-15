import undetected_chromedriver as uc
import time as t
import pandas as pd
from bs4 import BeautifulSoup
import json
from pyvirtualdisplay import Display

## TODO fix line 41 to line 60

# Visual progress bar
def progress_bar(progress, total):
    percent = 100 * (progress / total) 
    bar = '█' * int(percent) + '-' * (100 - int(percent)) 
    print(f"\r|{bar}| {percent:.2f}%", end = "\r")

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
    # Setting up headless display
    display = Display(visible=False, size=(1920, 1080))
    display.start()

    driver = uc.Chrome(headless=False,use_subprocess=False)
    driver.get(url)

    # Storing information
    results = []
    seen_links = set()
    
    # Finding number of pages
    # base_html = driver.page_source
    # base_soup = BeautifulSoup(base_html, "html.parser")
    # while True:
    #     try:
            
    #         container = base_soup.find("div", attrs={
    #         "aria-label": "pagination",
    #         "role": "navigation"
    #         })

    #         # card_list = []
    #         # for a in container.find_all('a', class_='pagination-item'):
    #         #     page_num = int(a.text)
    #         #     print(page_num)
    #         if container is not None:
    #             print(container)
    #             break
    #     except Exception as e:
    #         print(e)
        
            

    pg = 1
    last_page = False
    driver.execute_script("window.scrollTo(0, 0);")

    try: 
        while True:
            # Introducing progress bar

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
                print(f"Number of Listings on page {pg}: {len(listings)}")
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
                        print("Empty (no link)")
                        continue

                    href = link_elem.get("href")
                    if not href:
                        print("Empty (no href)")
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

            
                    
                    

                # Checking for new height
                new_height = driver.execute_script("return document.body.scrollHeight")
                if new_height == last_height:
                    break
                last_height = new_height

            # Increments page
            pg = pg + 1
            # t.sleep(3)
    finally:
        driver.quit()

    return results
            

    

    
