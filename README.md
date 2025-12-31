# Psychiatry Job Search App

A full-stack application for tracking psychiatry job opportunities in Madison WI, Boulder CO, Fort Collins CO, and Raleigh-Durham NC.

## Features

- **Job Scraping**: Automatically scrapes psychiatry jobs from Indeed, LinkedIn, and Glassdoor using JobSpy
- **Job Tracking**: Mark jobs as favorites, track application status (applied, interviewing, offer, rejected)
- **Notes**: Add personal notes to each job
- **Daily Updates**: Scheduled daily scraping at 6 AM CT
- **Manual Scrape**: Trigger scraping on-demand from the UI

## Tech Stack

- **Frontend**: React 18, React Router, Axios
- **Backend**: Node.js, Express, node-cron
- **Database**: Supabase (PostgreSQL)
- **Scraper**: Python, Flask, JobSpy

## Setup

### 1. Supabase Database

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to SQL Editor and run the contents of `supabase_schema.sql`
4. Go to Settings > API to get your URL and anon key

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your Supabase credentials
npm install
npm run dev
```

### 3. Python Scraper Setup

```bash
cd scraper
pip install -r requirements.txt
python app.py
```

### 4. Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm start
```

## Environment Variables

### Backend (.env)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
PORT=5000
SCRAPER_URL=http://localhost:5001
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Running the Application

1. Start the Python scraper (port 5001)
2. Start the backend server (port 5000)
3. Start the frontend (port 3000)

## Target Locations

- Madison, WI
- Boulder, CO
- Fort Collins, CO
- Raleigh, NC
- Durham, NC

## API Endpoints

### Jobs
- `GET /api/jobs` - List jobs with filters
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs/:id/favorite` - Toggle favorite
- `PUT /api/jobs/:id/status` - Update application status
- `PUT /api/jobs/:id/notes` - Update notes

### Scraper
- `POST /api/scrape` - Trigger manual scrape
- `GET /api/scrape/status` - Get last scrape info
