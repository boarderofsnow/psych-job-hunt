require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jobRoutes = require('./routes/jobs');
const scraperRoutes = require('./routes/scraper');
const { initScheduler } = require('./scheduler/cron');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://psych-job-hunt.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

console.log('Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/jobs', jobRoutes);
app.use('/api/scrape', scraperRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize scheduler for daily scraping
initScheduler();

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
