import React from "react";
import axios from 'axios';
import { useState } from 'react';

const API_URL = "http://localhost:4999/scrape";

const getScrapeData = (location, beds, baths) => {
    const payload = {
                "location": location,
                "beds": beds,
                "baths": baths
            }
    
    axios.post(API_URL, payload)
    .then((response) => console.log(response))
    .catch((error) => console.error(error))
}

const PgOneForm = () => {
    const [location, setLocation] = useState('Blacksburg_VA');
    const [beds, setBeds] = useState(3);
    const [baths, setBaths] = useState(2);
    return(
        <>
            <h2>Test Front End with REACT!</h2>
                <form id="scrape" onSubmit={(e) => {e.preventDefault(); getScrapeData(location, beds, baths);}}>
                    <label htmlFor="pname">Location:</label><br/>
                    <input type="text" id="pname" name="pname" value={location} onChange={(e) => setLocation(e.target.value)} required/><br/>
                    <label htmlFor="beds">Beds:</label><br/>
                    <input type="number" id="beds" name="beds" value={beds} onChange={(e) => setBeds(e.target.value)} required/><br/>
                    <label htmlFor="baths">Baths:</label><br/>
                    <input type="number" id="baths" name="baths" value={baths} onChange={(e) => setBaths(e.target.value)} required/><br/>
                    <button type='submit'>Submit</button>
                </form>
        </>
    );
}

const App = () => {
    return(
        <>
        <h1>Try number 2</h1>
        <PgOneForm />
        </>
   );
}

export default App;