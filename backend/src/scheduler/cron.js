const cron = require('node-cron');
const axios = require('axios');

const SCRAPER_URL = process.env.SCRAPER_URL || 'http://localhost:5001';
const BACKEND_URL = `http://localhost:${process.env.PORT || 5000}`;

function initScheduler() {
  // Run daily at 6 AM
  cron.schedule('0 6 * * *', async () => {
    console.log('Running scheduled daily scrape...');

    try {
      const response = await axios.post(`${BACKEND_URL}/api/scrape`, {}, {
        timeout: 300000
      });
      console.log('Scheduled scrape completed:', response.data);
    } catch (error) {
      console.error('Scheduled scrape failed:', error.message);
    }
  }, {
    timezone: 'America/Chicago' // Central time
  });

  console.log('Scheduler initialized - daily scrape at 6 AM CT');
}

module.exports = { initScheduler };
