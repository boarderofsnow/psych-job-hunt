import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getJobs } from '../services/api';

const STATUS_COLUMNS = [
  { key: 'applied', label: 'Applied', color: '#3498db' },
  { key: 'interviewing', label: 'Interviewing', color: '#9b59b6' },
  { key: 'offer', label: 'Offers', color: '#27ae60' },
  { key: 'rejected', label: 'Rejected', color: '#e74c3c' }
];

function Applications() {
  const [jobsByStatus, setJobsByStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllJobs();
  }, []);

  const fetchAllJobs = async () => {
    try {
      setLoading(true);
      const data = await getJobs({ limit: 500 });

      // Group jobs by status
      const grouped = {};
      STATUS_COLUMNS.forEach(col => {
        grouped[col.key] = [];
      });

      (data.jobs || []).forEach(job => {
        const status = job.user_jobs?.[0]?.status;
        if (status && grouped[status]) {
          grouped[status].push(job);
        }
      });

      setJobsByStatus(grouped);
    } catch (err) {
      setError('Failed to load applications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  if (loading) {
    return <div className="loading">Loading applications...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const totalApplications = Object.values(jobsByStatus).reduce(
    (sum, jobs) => sum + jobs.length, 0
  );

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>
        Application Tracker ({totalApplications} total)
      </h2>

      {totalApplications === 0 ? (
        <div className="empty-state">
          <p>No applications yet. Update a job's status to 'Applied' to start tracking.</p>
        </div>
      ) : (
        <div className="applications-grid">
          {STATUS_COLUMNS.map(column => (
            <div key={column.key} className="application-column">
              <h2 style={{ borderBottomColor: column.color }}>
                {column.label} ({jobsByStatus[column.key]?.length || 0})
              </h2>
              {jobsByStatus[column.key]?.map(job => {
                const userJob = job.user_jobs?.[0];
                return (
                  <div
                    key={job.id}
                    className="job-card"
                    onClick={() => navigate(`/job/${job.id}`)}
                  >
                    <h3 className="job-title">{job.title}</h3>
                    <p className="job-company">{job.company}</p>
                    <div className="job-meta">
                      <span>{job.location}</span>
                      {userJob?.applied_date && (
                        <span>Applied: {formatDate(userJob.applied_date)}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Applications;
