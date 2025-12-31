import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getJobs, toggleFavorite } from '../services/api';

function Favorites() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const data = await getJobs({ favorite: 'true', limit: 100 });
      setJobs(data.jobs || []);
    } catch (err) {
      setError('Failed to load favorites');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async (e, jobId) => {
    e.stopPropagation();
    try {
      await toggleFavorite(jobId);
      fetchFavorites();
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
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

  if (loading) {
    return <div className="loading">Loading favorites...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Favorite Jobs ({jobs.length})</h2>

      {jobs.length === 0 ? (
        <div className="empty-state">
          <p>No favorites yet. Click the heart icon on any job to add it to your favorites.</p>
        </div>
      ) : (
        <div className="job-list">
          {jobs.map(job => {
            const userJob = job.user_jobs?.[0];
            const status = userJob?.status || 'new';
            const salary = formatSalary(job.salary_min, job.salary_max);

            return (
              <div
                key={job.id}
                className="job-card"
                onClick={() => navigate(`/job/${job.id}`)}
              >
                <div className="job-card-header">
                  <div>
                    <h3 className="job-title">{job.title}</h3>
                    <p className="job-company">{job.company}</p>
                  </div>
                  <div className="job-actions">
                    <span className={`status-badge status-${status}`}>{status}</span>
                    <button
                      className="favorite-btn active"
                      onClick={(e) => handleFavorite(e, job.id)}
                    >
                      ♥
                    </button>
                  </div>
                </div>
                <div className="job-meta">
                  <span>{job.location}</span>
                  <span>{job.source}</span>
                  <span>{formatDate(job.date_posted)}</span>
                  {salary && <span className="salary">{salary}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Favorites;
