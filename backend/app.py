from flask import Flask, request, jsonify
from functions import make_url, scrape_url
import pandas as pd
import json
from flask_cors import CORS

# Initializes Flask app
app = Flask(__name__)
CORS(app)

# Adds post route for scraper
@app.route('/scrape', methods=['POST'])
def scrape():
    """
    Scrape realtor.com with optional filters,
    Expected JSON:
    
    {
        "location": "Austin_TX",
        "beds": 3,
        "baths": 2
    }
    """
    try:
        # Parses post request as json
        data = request.json
        location = data.get('location', 'Austin_TX')
        beds = data.get('beds', None)
        baths = data.get('baths', None)

        url = make_url(location, beds, baths)
        results = scrape_url(url)

        # Return results as a json string
        return jsonify({"status": "success",
                         "data": results
                         }), 200
    
    except Exception as e:

        # Logs error message
        return jsonify({"status": "error", 
                        "message": str(e)
                        }), 500

# Detects if script is being imported directly
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4999, debug=True)