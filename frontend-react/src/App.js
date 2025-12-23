import React from "react";
import axios from 'axios';
import { useState } from 'react';
import { TextSearch, ChartLine, HardDriveDownload, List } from 'lucide-react';
import { mean, min, max } from "simple-statistics";
import { BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CSV from './data.csv';
import XLSX from './data.xlsx';


//TODO: Add download, listings, and fix errors. Perhaps also add a way to know if it is scraping or not...

// Gloabal Variables
const API_URL = "http://192.168.86.34:4999/scrape";

const data = [];
var query = null;

// Calls scrape api
const getScrapeData = async (location, beds, baths) => {
    const payload = {
                "location": location,
                "beds": beds,
                "baths": baths
            }
    query = payload;
    try {
        const response = await axios.post(API_URL, payload);
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
} catch (error) {
    console.log(error);
}   
}

const convertCsv = (df) => {
  try {
    axios.post('http://192.168.86.34:4999/download-csv', df);
  }
  catch (error) {
    console.error(error);
  }
}

const convertXlsx = (df) => {
  try {
    axios.post('http://192.168.86.34:4999/download-xlsx', df);
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
          <h1 className="text-2xl font-bold text-gray-800">Simple Rental Dashboard</h1>
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
      {activeTab === 'home' && <Collection />}
      {activeTab === 'analytics' && <Stats />}
      {activeTab === 'download' && <DownloadCsv />}
    </div>
    );
}

const Collection = () => {
    // Sets default States for data collection
    const [location, setLocation] = useState('Blacksburg_VA');
    const [beds, setBeds] = useState(3);
    const [baths, setBaths] = useState(2);
    return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Search Rental Properties</h2>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-2xl">
        <form 
          id="scrape" 
          onSubmit={async (e) => {
            e.preventDefault(); 
            await getScrapeData(location, beds, baths);
            convertCsv(data);
            convertXlsx(data);
          }}
          className="space-y-6"
        >
          <div>
            <label htmlFor="pname" className="block text-sm font-medium text-gray-700 mb-2">
              Location
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
              Bedrooms
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
              Bathrooms
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
            Search Properties
          </button>
        </form>
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
          <p className="text-3xl font-bold text-gray-800">WIP</p>
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
  return(
    <div>
      <a
        href={CSV}
        download="data"
        target="_blank"
        rel="noreferrer"
      >
        <button>Download as .csv</button>
      </a>
      <a
        href={XLSX}
        download="data"
        target="_blank"
        rel="noreferrer"
      >
        <button>Download as .xlsx</button>
      </a>
    </div>
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