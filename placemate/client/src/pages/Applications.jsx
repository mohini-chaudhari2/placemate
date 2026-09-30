import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get('/applications');

        setApplications(response.data.applications || []);
      } catch (err) {
        console.error('Failed to load applications:', err);

        setError(
          err.response?.data?.message ||
            'Unable to load your applications.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const formatDate = (date) => {
    if (!date) return 'N/A';

    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Selected':
        return 'application-status selected';

      case 'Shortlisted':
        return 'application-status shortlisted';

      case 'Interview':
        return 'application-status interview';

      case 'Rejected':
        return 'application-status rejected';

      default:
        return 'application-status applied';
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-loading">
          <div className="loading-spinner"></div>
          <p>Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container applications-page">
      <div className="applications-header">
        <div>
          <span className="section-eyebrow">APPLICATION TRACKER</span>

          <h1>My Applications</h1>

          <p>
            Track all the jobs you have applied for and monitor
            your application status.
          </p>
        </div>

        <Link to="/jobs" className="btn btn-primary">
          🚀 Browse Jobs
        </Link>
      </div>

      {error && (
        <div className="application-error">
          ⚠️ {error}
        </div>
      )}

      {!error && applications.length === 0 && (
        <div className="applications-empty">
          <div className="applications-empty-icon">📄</div>

          <h2>No applications yet</h2>

          <p>
            You haven't applied to any jobs yet. Explore available
            opportunities and submit your first application.
          </p>

          <Link to="/jobs" className="btn btn-primary">
            Explore Jobs
          </Link>
        </div>
      )}

      {!error && applications.length > 0 && (
        <div className="applications-list">
          {applications.map((application) => {
            const job = application.jobId;

            if (!job) return null;

            return (
              <div
                key={application._id}
                className="application-card"
              >
                <div className="application-card-main">
                  <div className="application-company-icon">
                    {job.companyName?.charAt(0)?.toUpperCase() || 'C'}
                  </div>

                  <div className="application-job-info">
                    <h2>{job.title}</h2>

                    <h3>{job.companyName}</h3>

                    <div className="application-meta">
                      {job.location && (
                        <span>📍 {job.location}</span>
                      )}

                      {job.jobType && (
                        <span>💼 {job.jobType}</span>
                      )}

                      <span>
                        📅 Applied {formatDate(application.appliedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="application-card-side">
                  <span className={getStatusClass(application.status)}>
                    {application.status}
                  </span>

                  <Link
                    to={`/jobs/${job._id}`}
                    className="btn btn-secondary"
                  >
                    View Job
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Applications;