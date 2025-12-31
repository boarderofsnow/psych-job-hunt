const express = require('express');
const router = express.Router();
const axios = require('axios');
const { supabase } = require('../db/supabase');

const SCRAPER_URL = process.env.SCRAPER_URL || 'http://localhost:5001';

// POST /api/scrape - Trigger manual scrape
router.post('/', async (req, res) => {
  try {
    console.log('Starting manual scrape...');

    // Call Python scraper service
    const response = await axios.post(`${SCRAPER_URL}/scrape`, {}, {
      timeout: 300000 // 5 minute timeout for scraping
    });

    const jobs = response.data.jobs || [];
    console.log(`Received ${jobs.length} jobs from scraper`);

    let inserted = 0;
    let updated = 0;

    for (const job of jobs) {
      // Check if job already exists by external_id
      const { data: existing } = await supabase
        .from('jobs')
        .select('id')
        .eq('external_id', job.external_id)
        .single();

      if (existing) {
        // Update existing job
        await supabase
          .from('jobs')
          .update({
            title: job.title,
            company: job.company,
            location: job.location,
            description: job.description,
            url: job.url,
            salary_min: job.salary_min,
            salary_max: job.salary_max,
            date_posted: job.date_posted,
            date_scraped: new Date().toISOString(),
            source: job.source
          })
          .eq('id', existing.id);
        updated++;
      } else {
        // Insert new job
        await supabase
          .from('jobs')
          .insert({
            external_id: job.external_id,
            title: job.title,
            company: job.company,
            location: job.location,
            description: job.description,
            url: job.url,
            salary_min: job.salary_min,
            salary_max: job.salary_max,
            date_posted: job.date_posted,
            date_scraped: new Date().toISOString(),
            source: job.source,
            search_location: job.search_location
          });
        inserted++;
      }
    }

    // Update scrape status
    await supabase
      .from('scrape_log')
      .insert({
        jobs_found: jobs.length,
        jobs_inserted: inserted,
        jobs_updated: updated,
        status: 'success',
        completed_at: new Date().toISOString()
      });

    res.json({
      success: true,
      jobs_found: jobs.length,
      jobs_inserted: inserted,
      jobs_updated: updated
    });
  } catch (error) {
    console.error('Scrape error:', error.message);

    // Log failed scrape
    await supabase
      .from('scrape_log')
      .insert({
        jobs_found: 0,
        jobs_inserted: 0,
        jobs_updated: 0,
        status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString()
      });

    res.status(500).json({
      error: 'Scrape failed',
      message: error.message
    });
  }
});

// GET /api/scrape/status - Get last scrape info
router.get('/status', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('scrape_log')
      .select('*')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    res.json(data || { message: 'No scrapes yet' });
  } catch (error) {
    console.error('Error fetching scrape status:', error);
    res.status(500).json({ error: 'Failed to fetch scrape status' });
  }
});

module.exports = router;
