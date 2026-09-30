import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const AdminApplications = () => {
  const [searchParams] = useSearchParams();

  const statusFromUrl = searchParams.get('status') || '';

  const [applications, setApplications] = useState([]);
  const [count, setCount] = useState(0);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(statusFromUrl);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchApplications = async () => {
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

      const response = await api.get(
        '/admin/applications',
        { params }
      );

      setApplications(
        response.data.applications || []
      );

      setCount(response.data.count || 0);
    } catch (err) {
      console.error(
        'Failed to load admin applications:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Unable to load applications.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [status]);

  const handleSearch = (event) => {
    event.preventDefault();
    fetchApplications();
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('');
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';

    return new Date(date).toLocaleDateString(
      'en-IN',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }
    );
  };

  const getStatusClass = (applicationStatus) => {
    switch (applicationStatus) {
      case 'Applied':
        return 'admin-application-status applied';

      case 'Shortlisted':
        return 'admin-application-status shortlisted';

      case 'Interview':
        return 'admin-application-status interview';

      case 'Selected':
        return 'admin-application-status selected';

      case 'Rejected':
        return 'admin-application-status rejected';

      default:
        return 'admin-application-status';
    }
  };

  return (
    <div className="page-container admin-applications-page">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="admin-applications-header">

        <div>
          <span className="section-eyebrow">
            ADMIN PORTAL
          </span>

          <h1>Application Management</h1>

          <p>
            Search and review applications submitted
            through PlaceMate.
          </p>
        </div>

        <Link
          to="/dashboard/admin"
          className="btn btn-secondary"
        >
          ← Back to Dashboard
        </Link>

      </div>


      {/* =========================================
          FILTER BAR
      ========================================= */}

      <section className="admin-applications-toolbar">

        <form
          className="admin-application-search-form"
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
              placeholder="Search student, job, company or recruiter..."
            />

          </div>


          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            className="admin-application-status-filter"
          >
            <option value="">
              All Status
            </option>

            <option value="Applied">
              Applied
            </option>

            <option value="Shortlisted">
              Shortlisted
            </option>

            <option value="Interview">
              Interview
            </option>

            <option value="Selected">
              Selected
            </option>

            <option value="Rejected">
              Rejected
            </option>
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


        <div className="admin-applications-count">

          <strong>{count}</strong>

          <span>
            {count === 1
              ? 'application found'
              : 'applications found'}
          </span>

        </div>

      </section>


      {/* =========================================
          CONTENT
      ========================================= */}

      {loading ? (

        <div className="admin-users-loading">

          <div className="loading-spinner"></div>

          <p>
            Loading applications...
          </p>

        </div>

      ) : error ? (

        <div className="admin-users-error">

          <div className="admin-error-icon">
            ⚠️
          </div>

          <h2>
            Unable to load applications
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={fetchApplications}
          >
            Try Again
          </button>

        </div>

      ) : applications.length === 0 ? (

        <div className="admin-users-empty">

          <div className="admin-empty-icon">
            📄
          </div>

          <h2>
            No applications found
          </h2>

          <p>
            Applications will appear here when
            students apply for jobs.
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

        <section className="admin-applications-table-card">

          <div className="admin-applications-table-wrapper">

            <table className="admin-applications-table">

              <thead>

                <tr>
                  <th>Student</th>
                  <th>Job</th>
                  <th>Company</th>
                  <th>Recruiter</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th>View</th>
                </tr>

              </thead>


              <tbody>

                {applications.map(
                  (application) => (

                    <tr
                      key={application._id}
                    >

                      {/* Student */}

                      <td>

                        <div className="admin-application-person">

                          <div className="admin-application-avatar">
                            {application
                              .studentId
                              ?.name
                              ?.charAt(0)
                              ?.toUpperCase() || 'S'}
                          </div>

                          <div>

                            <strong>
                              {application
                                .studentId
                                ?.name ||
                                'Unknown Student'}
                            </strong>

                            <span>
                              {application
                                .studentId
                                ?.email ||
                                'N/A'}
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* Job */}

                      <td>

                        <Link
                          to={`/admin/jobs/${application.jobId?._id}`}
                          className="admin-application-job-link"
                        >

                          <strong>
                            {application
                              .jobId
                              ?.title ||
                              'Unknown Job'}
                          </strong>

                          <span>
                            {application
                              .jobId
                              ?.location ||
                              'Location not specified'}
                          </span>

                        </Link>

                      </td>


                      {/* Company */}

                      <td>

                        <div className="admin-application-company">

                          {application
                            .jobId
                            ?.companyName ||
                            'N/A'}

                        </div>

                      </td>


                      {/* Recruiter */}

                      <td>

                        <div className="admin-application-recruiter">

                          <strong>
                            {application
                              .recruiterId
                              ?.name ||
                              'Unknown'}
                          </strong>

                          <span>
                            {application
                              .recruiterId
                              ?.email ||
                              'N/A'}
                          </span>

                        </div>

                      </td>


                      {/* Status */}

                      <td>

                        <span
                          className={getStatusClass(
                            application.status
                          )}
                        >
                          {application.status ||
                            'Unknown'}
                        </span>

                      </td>


                      {/* Date */}

                      <td>

                        <span className="admin-table-date">
                          {formatDate(
                            application.appliedAt ||
                              application.createdAt
                          )}
                        </span>

                      </td>


                      {/* View Details */}

                      <td>

                        <Link
                          to={`/admin/applications/${application._id}`}
                          className="admin-application-view-button"
                        >
                          View →
                        </Link>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </section>

      )}

    </div>
  );
};

export default AdminApplications;