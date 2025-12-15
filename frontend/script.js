//// TODO: Implement REDIS
async function getScrapeData(location, beds, baths) {
    // The local url
    const url = "http://localhost:4999/scrape";
    // Tries to send POST request
    try {
        const response = await fetch(url, {
            method: "POST",
              headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "location": location,
                "beds": beds,
                "baths": baths
            })
        });
        // Gets results
        const result = await response.json();
        console.log("Success", result);
        // Prints Length for debug
        console.log(result.data.length);
        return result;
    } catch (error) {
        console.error(error.message)
        return null;
    }
}

// async function to handle button click
async function handleButtonClick(e) {
    // Prevents page reload
    e.preventDefault();

    // Retrieves data from html
    const place = document.getElementById('pname').value.trim();
    const bed = Number(document.getElementById('beds').value);
    const bath = Number(document.getElementById('baths').value);

    // Calls api on button press
    const result = await getScrapeData(place, bed, bath);
    const listings = result.data;

    // Iterates and adds to list
    for (let index = 0; index < listings.length; index++) {

        // Takes data from array listtings
        const address = listings[index].address;
        const rent = listings[index].rent_price;
        const link = listings[index].link;
        const beds = listings[index].beds;
        const baths = listings[index].baths;
        const sqft = listings[index].sqft;

        // Creation of list item
        const li = document.createElement("li");
        
        // HTML Formatting
        li.innerHTML = `
        <strong>${address}</strong><br>
        $${rent} ⋆ ${beds} bd ⋆ ${baths} ba ⋆ ${sqft} sqft<br>
        <a href="${link}" target="_blank">View</a>
    `;
        // Append to document as a child of 'homes-list'
        document.getElementById('homes-list').appendChild(li);
    }
    
}

// Adding event Listener for content loading
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("scrape");
    form.addEventListener("submit", handleButtonClick);
});
