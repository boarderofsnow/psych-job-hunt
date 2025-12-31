import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJob, toggleFavorite, updateStatus, updateNotes } from '../services/api';

const STATUSES = ['new', 'applied', 'interviewing', 'offer', 'rejected'];

function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const data = await getJob(id);
      setJob(data);
      setNotes(data.user_jobs?.[0]?.notes || '');
    } catch (err) {
      setError('Failed to load job');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    try {
      await toggleFavorite(id);
      fetchJob();
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateStatus(id, newStatus);
      fetchJob();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleNotesBlur = async () => {
    try {
      setSaving(true);
      await updateNotes(id, notes);
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Not specified';
    const fmt = (n) => '$' + n.toLocaleString();
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `${fmt(min)}+`;
    return `Up to ${fmt(max)}`;
  };

  if (loading) {
    return <div className="loading">Loading job...</div>;
  }

  if (error || !job) {
    return <div className="error">{error || 'Job not found'}</div>;
  }

  const userJob = job.user_jobs?.[0];
  const status = userJob?.status || 'new';
  const isFavorite = userJob?.is_favorite || false;

  return (
    <div>
      <Link to="/" className="back-link">← Back to Jobs</Link>

      <div className="job-detail">
        <div className="job-detail-header">
          <h1>{job.title}</h1>
          <p className="job-company">{job.company}</p>
          <div className="job-meta">
            <span>{job.location}</span>
            <span>{job.source}</span>
            <span>Posted: {formatDate(job.date_posted)}</span>
          </div>
          <div className="job-detail-actions">
            <button
              className={`favorite-btn ${isFavorite ? 'active' : ''}`}
              onClick={handleFavorite}
            >
              {isFavorite ? '♥ Favorited' : '♡ Add to Favorites'}
            </button>
            {job.url && (
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                View Original Posting
              </a>
            )}
          </div>
        </div>

        <div className="job-detail-body">
          <div className="job-description">
            {job.description || 'No description available.'}
          </div>

          <div className="job-sidebar">
            <div className="sidebar-section">
              <h3>Salary</h3>
              <p className="salary">{formatSalary(job.salary_min, job.salary_max)}</p>
            </div>

            <div className="sidebar-section">
              <h3>Application Status</h3>
              <select
                className="status-select"
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
              {userJob?.applied_date && (
                <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#7f8c8d' }}>
                  Applied: {formatDate(userJob.applied_date)}
                </p>
              )}
            </div>

            <div className="sidebar-section">
              <h3>Notes {saving && '(Saving...)'}</h3>
              <textarea
                className="notes-textarea"
                placeholder="Add your notes about this job..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={handleNotesBlur}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetail;
