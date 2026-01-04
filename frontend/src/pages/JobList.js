import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getJobs, toggleFavorite, triggerScrape, getScrapeStatus } from '../services/api';

const LOCATIONS = [
  'Madison, WI',
  'Boulder, CO',
  'Fort Collins, CO',
  'Raleigh, NC',
  'Durham, NC'
];

function JobList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [scraping, setScraping] = useState(false);
  const [scrapeStatus, setScrapeStatus] = useState(null);
  const navigate = useNavigate();

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (location) params.location = location;
      if (search) params.search = search;

      const data = await getJobs(params);
      setJobs(data.jobs || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError('Failed to load jobs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, location, search]);

  useEffect(() => {
    fetchJobs();
    fetchScrapeStatus();
  }, [fetchJobs]);

  const fetchScrapeStatus = async () => {
    try {
      const status = await getScrapeStatus();
      setScrapeStatus(status);
    } catch (err) {
      console.error('Failed to fetch scrape status:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const handleFavorite = async (e, jobId) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Favorite clicked for job:', jobId);
    try {
      const result = await toggleFavorite(jobId);
      console.log('Favorite toggled:', result);
      await fetchJobs();
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleScrape = async () => {
    try {
      setScraping(true);
      await triggerScrape();
      await fetchJobs();
      await fetchScrapeStatus();
    } catch (err) {
      console.error('Scrape failed:', err);
      alert('Scrape failed. Make sure the Python scraper service is running.');
    } finally {
      setScraping(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return null;
    const fmt = (n) => '$' + (n / 1000).toFixed(0) + 'k';
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `${fmt(min)}+`;
    return `Up to ${fmt(max)}`;
  };

  if (loading && jobs.length === 0) {
    return <div className="loading">Loading jobs...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div>
      {scrapeStatus && (
        <div className={`scrape-status ${scrapeStatus.status === 'failed' ? 'error' : ''}`}>
          <span>
            Last scrape: {formatDate(scrapeStatus.completed_at)}
            {scrapeStatus.jobs_found > 0 && ` - Found ${scrapeStatus.jobs_found} jobs`}
          </span>
          <button
            className="btn btn-primary"
            onClick={handleScrape}
            disabled={scraping}
          >
            {scraping ? 'Scraping...' : 'Scrape Now'}
          </button>
        </div>
      )}

      <form className="filter-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={location} onChange={(e) => { setLocation(e.target.value); setPage(1); }}>
          <option value="">All Locations</option>
          {LOCATIONS.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {jobs.length === 0 ? (
        <div className="empty-state">
          <p>No jobs found. Try adjusting your filters or run a scrape to fetch new jobs.</p>
        </div>
      ) : (
        <>
          <div className="job-list">
            {jobs.map(job => {
              const userJob = job.user_jobs?.[0];
              const status = userJob?.status || 'new';
              const isFavorite = userJob?.is_favorite || false;
              const salary = formatSalary(job.salary_min, job.salary_max);

              return (
                <div
                  key={job.id}
                  className="job-card"
                  onClick={() => navigate(`/job/${job.id}`)}
                >
                  <div className="job-card-header">
                    <div className="job-card-content">
                      <h3 className="job-title">{job.title}</h3>
                      <p className="job-company">{job.company}</p>
                      <p className="job-location">{job.location}</p>
                      <div className="job-meta">
                        <span>{job.source}</span>
                        <span>{formatDate(job.date_posted)}</span>
                        {salary && <span className="job-salary">{salary.replace('$', '')}</span>}
                      </div>
                    </div>
                    <div className="job-actions">
                      <span className={`status-badge status-${status}`}>{status}</span>
                      <button
                        className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                        onClick={(e) => handleFavorite(e, job.id)}
                      >
                        {isFavorite ? '♥' : '♡'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default JobList;
