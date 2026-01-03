import React from "react";
import axios from 'axios';
import { useState } from 'react';
import { TextSearch, ChartLine, HardDriveDownload, List } from 'lucide-react';
import { mean, min, max } from "simple-statistics";
import { BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';



//TODO: Add a way to know if it is scraping or not...

// Global Variables -> Changed to work with changing local ip (.env duplication for local development)
const API_URL = process.env.REACT_APP_API_URL;

const data = [];
var query = null;

// Calls scrape api
const getScrapeData = async (location, beds, baths) => {
    const payload = {
                "location": location,
                "beds": beds,
                "baths": baths
            }
    query = location + ", " + beds + " beds, " + baths + " baths";
    try {
        const response = await axios.post(API_URL + "/scrape", payload);
        const listings = response.data.data;
        console.log(listings);
        // Clears data list Each time
        while (data.length) { data.pop(); }
        for (let index = 0; index < listings.length; index++) {
            data.push({
                address: listings[index].address,
                rent: listings[index].rent_price,
                link: listings[index].link,
                beds: listings[index].beds,
                baths: listings[index].baths,
                sqft: listings[index].sqft
            });
        }
        console.log(data);
} catch (error) {
    console.log(error);
}   
}
// Convert CSV
const convertCsv = (df) => {
  try {
    axios.post(API_URL + '/convert-csv', df);
  }
  catch (error) {
    console.error(error);
  }
}
// Convert Xlsx
const convertXlsx = (df) => {
  try {
    axios.post(API_URL + '/convert-xlsx', df);
  }
  catch (error) {
    console.error(error);
  }
}

// Test Case
const PgOneForm = () => {
    const [location, setLocation] = useState('Blacksburg_VA');
    const [beds, setBeds] = useState(3);
    const [baths, setBaths] = useState(2);
    return(
        <>
            <h2>Test Front End with REACT!</h2>
                <form id="scrape" onSubmit={async (e) => {e.preventDefault(); await getScrapeData(location, beds, baths);}}>
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

const Dashboard = () => {
    // Main Dashboard Component
    const [activeTab, setActiveTab] = useState('home');
    // Different Tabs
    const tabs = [
    { id: 'home', name: 'Scrape', icon: TextSearch },
    { id: 'analytics', name: 'Market Analytics', icon: ChartLine },
    { id: 'download', name: 'Download', icon: HardDriveDownload },
    { id: 'list', name: 'Listings', icon: List },
  ];

return(
    <div className="flex h-screen bg-white">
        {/*Menu Bar*/}
      <div className="w-64 border-r border-gray-200 p-4">
        <div className="mb-8">
          <h1 className="text-center text-2xl font-bold text-gray-800">Simple Rental Dashboard</h1>
        </div>
        <nav className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
      {/*Wraps all content in something that centers it to make it look nicer*/}
      <div className="flex-1 overflow">
      {activeTab === 'home' && <Collection />}
      {/*Only displays the next two pages if there is data scraped.*/}
      {activeTab === 'analytics' && (data.length > 1 ? <Stats /> : <EmptyState />)}
      {activeTab === 'download' && (data.length > 1 ? <DownloadCsv /> : <EmptyState />)}
      {activeTab === 'list' && (data.length > 1 ? <ListingsPanel /> : <EmptyState />)}
      </div>
    </div>
    );
}

const Collection = () => {
    // Sets default States for data collection
    const [isLoading, setisLoading] = useState(false);
    const [location, setLocation] = useState('Blacksburg_VA');
    const [beds, setBeds] = useState(3);
    const [baths, setBaths] = useState(2);

    return (
    <div className="flex items-center justify-center h-full w-full">
    <div className="w-full max-w-2xl p-8">
      <h2 className="text-center text-3xl font-bold text-gray-800 mb-6">Search Rental Properties</h2>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-2xl">
        <form 
          id="scrape" 
          onSubmit={async (e) => {
            e.preventDefault();
            // Logic for allowing loading
            setisLoading(true);
            await getScrapeData(location, beds, baths);
            convertCsv(data);
            convertXlsx(data);
            setisLoading(false);
          }}
          className="space-y-6"
        >
          <div>
            <label htmlFor="pname" className="block text-sm font-medium text-gray-700 mb-2">
              Location:
            </label>
            <input 
              type="text" 
              id="pname" 
              name="pname" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Blacksburg_VA"
            />
          </div>

          <div>
            <label htmlFor="beds" className="block text-sm font-medium text-gray-700 mb-2">
              Bedrooms:
            </label>
            <input 
              type="number" 
              id="beds" 
              name="beds" 
              value={beds} 
              onChange={(e) => setBeds(e.target.value)} 
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>

          <div>
            <label htmlFor="baths" className="block text-sm font-medium text-gray-700 mb-2">
              Bathrooms:
            </label>
            <input 
              type="number" 
              id="baths" 
              name="baths" 
              value={baths} 
              onChange={(e) => setBaths(e.target.value)} 
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>

          <button 
            type="submit"
            className="w-full px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            {isLoading ? "Scraping properties..." : "Scrape Properties"}
          </button>
        </form>
      </div>
    </div>
    </div>
  );

}

const Stats = () => {
    // Does basic Statistics
    const rents = data.map(listing => listing.rent);
    const sqfts = data.map(listing => listing.sqft);

    const avgRent = mean(rents).toFixed(2);
    const avgSqft = mean(sqfts).toFixed(2);

    const avgRentBySqft = (avgRent/avgSqft).toFixed(2);
    const totalHouses = data.length;

    // Gets and sorts scatter data
    const scatterData = data.map(listing => ({
        x: listing.rent,
        y: listing.sqft
    })).sort((a, b) => a.x - b.x);

    // Generating distribution
    const binSize = 250;
    const distribution = [];

    // Gets bins and number of entries in bins
    for(let i = 0; i< rents.length; i++) {
        const bin = Math.floor(rents[i] / binSize) * binSize;
        const label = `${bin}-${bin + binSize}`;
        distribution[label] = (distribution[label] || 0) + 1;
        
    }


    // Maps chart data to a list that can be read by Barchart Class
    const chartData = Object.entries(distribution)
    .map(([label, count]) => ({'label': label, 'count': count}));
    console.log(chartData);

    // Statistical Analysis Page
    return(
    <div className="p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Property Analytics</h2>
      
      {/* 4 Stat Boxes */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-gray-600 text-sm mb-2">Mean Price</h3>
          <p className="text-3xl font-bold text-gray-800">${avgRent}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-gray-600 text-sm mb-2">Mean Rent/Sqft</h3>
          <p className="text-3xl font-bold text-gray-800">${avgRentBySqft} per sqft</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-gray-600 text-sm mb-2">Total Homes</h3>
          <p className="text-3xl font-bold text-gray-800">{totalHouses}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-gray-600 text-sm mb-2">Search Query</h3>
          <p className="text-3xl font-bold text-gray-800">{query}</p>
        </div>
      </div>

      {/* Bar Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Rent Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="label" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#107f0dff" />
            </BarChart>
        </ResponsiveContainer>
        </div>
        {/* Scatter Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Rent vs Square Feet</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="x" name="Rent" stroke="#6b7280" />
            <YAxis dataKey="y" name="Square Feet" stroke="#6b7280" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            <Scatter name="Properties" data={scatterData} fill="#10b981" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const DownloadCsv = () => {
  // CSV Download Function
const handleCsvDownload = async () => {
  try {
    const response = await axios.get(API_URL + '/download-csv', {
      responseType: 'blob' //This is IMPORTANT for file management
    });
    
    // Generates Download url based off of response and append to document
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    // Sets the action of download and the file name to data.xlsx
    link.setAttribute('download', 'data.csv');
    document.body.appendChild(link);
    // Simulates Clicking the link and then removes it
    link.click();
    link.remove();
    // Removes through the window
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('csv Download failed:', error);
  }
};
// Xlsx Download function
const handleXlsxDownload = async () => {
  try {
    const response = await axios.get(API_URL + '/download-xlsx', {
      responseType: 'blob'
    });
    
    // Generates Download url based off of response and append to document
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    // Sets the action of download and the file name to data.xlsx
    link.setAttribute('download', 'data.xlsx');
    document.body.appendChild(link);
    // Simulates Clicking the link and then removes it
    link.click();
    link.remove();
    // Removes through the window
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('xlsx Download failed:', error);
  }
};

  return(
    <div className="flex items-center justify-center h-full w-full">
    <div className="w-full max-w-2xl p-8">
       <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold text-gray-800">Download Data</h2>
        <p className="text-gray-600 mt-3">Export data in your preferred format</p>
      </div>
       <div className="space-y-5">
          <a
        
        download="data"
        target="_blank"
        rel="noreferrer"
        className="block"
      >
        <button onClick={handleCsvDownload} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg transition-colors bg-gray-100 text-gray-900 hover:bg-gray-200 font-medium">Download as .csv</button>
      </a>
      <a
        
        download="data"
        target="_blank"
        rel="noreferrer"
        className="block"
      >
        <button onClick={handleXlsxDownload} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg transition-colors bg-gray-100 text-gray-900 hover:bg-gray-200 font-medium">Download as .xlsx</button>
      </a>
       </div>
      
    </div>
    </div>
  );
}

// Empty state that activates when there is no data scraped
const EmptyState = () => {
  return (
    <div className="flex items-center justify-center min-h-[200px] text-gray-600 text-base">
      Nothing here yet :(
    </div>
  );
}

const ListingsPanel = () => {
  return(
    <ul id='homes-list' className="space-y-4 p-4">
      {data.map((listing, index) => (
        <li key={index} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <strong className="text-lg font-semibold text-gray-900 block mb-2">{listing.address}</strong>
          <br />
          <span className="text-gray-700 text-sm block mb-3">
            ${listing.rent} ⋆ {listing.beds} bd ⋆ {listing.baths} bth ⋆ {listing.sqft} sqft
          </span>
          <a href={listing.link} target='_blank' className="inline-block px-4 py-2 bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors">
            View
          </a>
        </li>
      ))}
    </ul>
  );
}

const App = () => {
    return(
        <>
        <Dashboard />
        </>
   );
}

export default App;