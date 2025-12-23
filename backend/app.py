from flask import Flask, request, jsonify
from functions import make_url, scrape_url
import pandas as pd
import json
from flask_cors import CORS
import redis
import io
## TODO I believe this is complete!

# Intitializes Redis
redis_host = 'localhost'
redis_port = '6379'

r = redis.Redis(redis_host, redis_port, decode_responses=True)


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

        # Makes key for caching
        cache_key = f"{location}-{beds}-{baths}"

        # Uses Redis Cache
        if r.get(cache_key):
            cache = r.get(cache_key)
            results = json.loads(cache)
            results = results['data']
        else:
            # Makes request to scraper
            url = make_url(location, beds, baths)
            results = scrape_url(url)

            # Caches to redis
            r.set(cache_key, json.dumps({'data': results}), ex=600)

        # Return results as a json string
        return jsonify({"status": "success",
                         "data": results
                         }), 200
    
    except Exception as e:

        # Logs error message
        return jsonify({"status": "error", 
                        "message": str(e)
                        }), 500

@app.route('/download-csv', methods=['POST'])
def download_csv():
    data = request.get_json()
    df = pd.read_json(io.StringIO(json.dumps(data)))

    df.to_csv('./frontend-react/src/data.csv', encoding='utf-8', index=False)
    return "Sent!"


@app.route('/download-xlsx', methods=['POST'])
def download_xlsx():
    try:
        data = request.get_json()
        df = pd.read_json(io.StringIO(json.dumps(data)))

        df.to_excel('./frontend-react/src/data.xlsx')
        return "Sent!"
    except Exception as e:
        print(e) 
        return "oops!"

       



# Detects if script is being imported directly
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4999, debug=True)