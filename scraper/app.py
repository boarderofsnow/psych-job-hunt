from flask import Flask, jsonify, request
from flask_cors import CORS
from scraper import scrape_all_locations
import traceback

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

@app.route('/scrape', methods=['POST'])
def scrape():
    try:
        print("Starting scrape for all locations...")
        jobs = scrape_all_locations()
        print(f"Scrape complete. Found {len(jobs)} jobs.")
        return jsonify({
            'success': True,
            'jobs': jobs,
            'count': len(jobs)
        })
    except Exception as e:
        print(f"Scrape error: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e),
            'jobs': []
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
