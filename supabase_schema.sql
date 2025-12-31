-- Psychiatry Job Hunt Database Schema
-- Run this in your Supabase SQL Editor

-- Jobs table - stores scraped job listings
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    external_id VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500),
    company VARCHAR(255),
    location VARCHAR(255),
    description TEXT,
    url VARCHAR(1000),
    salary_min INTEGER,
    salary_max INTEGER,
    date_posted DATE,
    date_scraped TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source VARCHAR(50),
    search_location VARCHAR(100)
);

-- User jobs table - stores user's tracking data
CREATE TABLE IF NOT EXISTS user_jobs (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    is_favorite BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'new',
    notes TEXT,
    applied_date DATE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_id)
);

-- Scrape log table - tracks scraping history
CREATE TABLE IF NOT EXISTS scrape_log (
    id SERIAL PRIMARY KEY,
    jobs_found INTEGER DEFAULT 0,
    jobs_inserted INTEGER DEFAULT 0,
    jobs_updated INTEGER DEFAULT 0,
    status VARCHAR(50),
    error_message TEXT,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_jobs_search_location ON jobs(search_location);
CREATE INDEX IF NOT EXISTS idx_jobs_date_scraped ON jobs(date_scraped DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_external_id ON jobs(external_id);
CREATE INDEX IF NOT EXISTS idx_user_jobs_job_id ON user_jobs(job_id);
CREATE INDEX IF NOT EXISTS idx_user_jobs_status ON user_jobs(status);
CREATE INDEX IF NOT EXISTS idx_user_jobs_is_favorite ON user_jobs(is_favorite);

-- Enable Row Level Security (optional, for future multi-user support)
-- ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_jobs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE scrape_log ENABLE ROW LEVEL SECURITY;
