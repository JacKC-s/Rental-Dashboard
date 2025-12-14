
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
    } catch (error) {
        console.error(error.message)
    }
}


getScrapeData("Blacksburg_VA", 3, 2);