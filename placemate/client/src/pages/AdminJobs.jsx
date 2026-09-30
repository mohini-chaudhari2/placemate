import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [count, setCount] = useState(0);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (status) {
        params.status = status;
      }

      const response = await api.get('/admin/jobs', {
        params,
      });

      setJobs(response.data.jobs || []);
      setCount(response.data.count || 0);
    } catch (err) {
      console.error('Failed to load admin jobs:', err);

      setError(
        err.response?.data?.message ||
          'Unable to load jobs.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [status]);

  const handleSearch = (event) => {
    event.preventDefault();
    fetchJobs();
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('');

    setTimeout(() => {
      fetchJobs();
    }, 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';

    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusClass = (jobStatus) => {
    switch (jobStatus) {
      case 'open':
        return 'admin-job-status open';

      case 'closed':
        return 'admin-job-status closed';

      case 'draft':
        return 'admin-job-status draft';

      default:
        return 'admin-job-status';
    }
  };

  return (
    <div className="page-container admin-jobs-page">
      <div className="admin-jobs-header">
        <div>
          <span className="section-eyebrow">
            ADMIN PORTAL
          </span>

          <h1>Job Management</h1>

          <p>
            Search and review jobs posted on PlaceMate.
          </p>
        </div>

        <Link
          to="/dashboard/admin"
          className="btn btn-secondary"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <section className="admin-jobs-toolbar">
        <form
          className="admin-job-search-form"
          onSubmit={handleSearch}
        >
          <div className="admin-search-field">
            <span>🔍</span>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by job title, company or location..."
            />
          </div>

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            className="admin-job-status-filter"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="draft">Draft</option>
          </select>

          <button
            type="submit"
            className="btn btn-primary"
          >
            Search
          </button>

          {(search || status) && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearFilters}
            >
              Clear
            </button>
          )}
        </form>

        <div className="admin-jobs-count">
          <strong>{count}</strong>

          <span>
            {count === 1 ? 'job found' : 'jobs found'}
          </span>
        </div>
      </section>

      {loading ? (
        <div className="admin-users-loading">
          <div className="loading-spinner"></div>

          <p>Loading jobs...</p>
        </div>
      ) : error ? (
        <div className="admin-users-error">
          <div className="admin-error-icon">⚠️</div>

          <h2>Unable to load jobs</h2>

          <p>{error}</p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={fetchJobs}
          >
            Try Again
          </button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="admin-users-empty">
          <div className="admin-empty-icon">💼</div>

          <h2>No jobs found</h2>

          <p>
            Try changing your search or status filter.
          </p>

          {(search || status) && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <section className="admin-jobs-table-card">
          <div className="admin-jobs-table-wrapper">
            <table className="admin-jobs-table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Company</th>
                  <th>Recruiter</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Posted</th>
                </tr>
              </thead>

              <tbody>
                {jobs.map((job) => (
                  <tr key={job._id}>
                   <td>
  <Link
    to={`/admin/jobs/${job._id}`}
    className="admin-job-title-link"
  >
    <div className="admin-job-title-cell">
      <div className="admin-job-icon">
        💼
      </div>

      <div>
        <strong>
          {job.title || 'Untitled Job'}
        </strong>

        <span>
          {job.jobType || 'Job'}
        </span>
      </div>
    </div>
  </Link>
</td>
                    <td>
                      <div className="admin-job-company">
                        {job.companyName || 'N/A'}
                      </div>
                    </td>

                    <td>
                      <div className="admin-job-recruiter">
                        <strong>
                          {job.recruiterId?.name ||
                            'Unknown'}
                        </strong>

                        <span>
                          {job.recruiterId?.email ||
                            'N/A'}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="admin-job-location">
                        📍 {job.location || 'Not specified'}
                      </span>
                    </td>

                    <td>
                      <span
                        className={getStatusClass(
                          job.status
                        )}
                      >
                        {job.status || 'unknown'}
                      </span>
                    </td>

                    <td>
                      <span className="admin-table-date">
                        {formatDate(job.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default AdminJobs;