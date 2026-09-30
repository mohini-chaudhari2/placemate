import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get('/admin/dashboard');

        setStats(response.data.stats);
        setAnalytics(response.data.analytics || null);
        setRecentUsers(response.data.recentUsers || []);
        setRecentJobs(response.data.recentJobs || []);
        setRecentApplications(
          response.data.recentApplications || []
        );
      } catch (err) {
        console.error(
          'Failed to load admin dashboard:',
          err
        );

        setError(
          err.response?.data?.message ||
            'Unable to load admin dashboard.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const formatDate = (date) => {
    if (!date) return 'N/A';

    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getRoleClass = (role) => {
    switch (role) {
      case 'admin':
        return 'admin-role-badge admin';

      case 'recruiter':
        return 'admin-role-badge recruiter';

      default:
        return 'admin-role-badge student';
    }
  };

  const getApplicationStatusClass = (status) => {
    switch (status) {
      case 'Shortlisted':
        return 'shortlisted';

      case 'Interview':
        return 'interview';

      case 'Selected':
        return 'selected';

      case 'Rejected':
        return 'rejected';

      default:
        return 'applied';
    }
  };

  const getAnalyticsCount = (status) => {
    const item =
      analytics?.applicationStatusAnalytics?.find(
        (entry) => entry._id === status
      );

    return item?.count || 0;
  };

  const totalAnalyticsApplications =
    analytics?.applicationStatusAnalytics?.reduce(
      (total, item) => total + (item.count || 0),
      0
    ) || 0;

  const selectedAnalyticsCount =
    getAnalyticsCount('Selected');

  const selectedRate =
    totalAnalyticsApplications > 0
      ? (
          (selectedAnalyticsCount /
            totalAnalyticsApplications) *
          100
        ).toFixed(1)
      : '0.0';

  const getStatusPercentage = (status) => {
    if (!totalAnalyticsApplications) return 0;

    return Math.round(
      (getAnalyticsCount(status) /
        totalAnalyticsApplications) *
        100
    );
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-loading">
          <div className="loading-spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container admin-dashboard-page">
        <div className="admin-dashboard-error">
          <div className="admin-error-icon">⚠️</div>

          <h2>Unable to load dashboard</h2>

          <p>{error}</p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container admin-dashboard-page">
      {/* ==================== HEADER ==================== */}

      <div className="admin-dashboard-header">
        <div>
          <span className="section-eyebrow">
            ADMIN PORTAL
          </span>

          <h1>Platform Overview</h1>

          <p>
            Monitor PlaceMate users, jobs, and application
            activity from one dashboard.
          </p>
        </div>

        <Link
          to="/admin/users"
          className="btn btn-primary"
        >
          👥 Manage Users
        </Link>
      </div>

      {/* ==================== STATS ==================== */}

      <section className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">👥</div>

          <div>
            <span>Total Users</span>
            <strong>{stats?.totalUsers || 0}</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">🎓</div>

          <div>
            <span>Students</span>
            <strong>{stats?.totalStudents || 0}</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">💼</div>

          <div>
            <span>Recruiters</span>
            <strong>{stats?.totalRecruiters || 0}</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">📋</div>

          <div>
            <span>Applications</span>
            <strong>{stats?.totalApplications || 0}</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">💼</div>

          <div>
            <span>Total Jobs</span>
            <strong>{stats?.totalJobs || 0}</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">🟢</div>

          <div>
            <span>Open Jobs</span>
            <strong>{stats?.openJobs || 0}</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">✅</div>

          <div>
            <span>Selected</span>
            <strong>
              {stats?.selectedApplications || 0}
            </strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">🛡️</div>

          <div>
            <span>Admins</span>
            <strong>{stats?.totalAdmins || 0}</strong>
          </div>
        </div>
      </section>

      {/* ==================== APPLICATION STATUS ==================== */}

      <section className="admin-application-status-section">
        <div className="admin-section-heading">
          <div>
            <span className="section-eyebrow">
              APPLICATION ACTIVITY
            </span>

            <h2>Application Status Breakdown</h2>

            <p>
              Track how student applications are progressing
              across the PlaceMate platform.
            </p>
          </div>

          <Link
            to="/admin/applications"
            className="admin-panel-link"
          >
            Manage Applications →
          </Link>
        </div>

        <div className="admin-application-status-grid">
          {/* Applied */}

          <Link
            to="/admin/applications?status=Applied"
            className="admin-application-status-card applied"
          >
            <div className="admin-application-status-icon">
              📋
            </div>

            <div className="admin-application-status-content">
              <span>Applied</span>

              <strong>
                {stats?.appliedApplications || 0}
              </strong>

              <small>New applications</small>
            </div>
          </Link>

          {/* Shortlisted */}

          <Link
            to="/admin/applications?status=Shortlisted"
            className="admin-application-status-card shortlisted"
          >
            <div className="admin-application-status-icon">
              ⭐
            </div>

            <div className="admin-application-status-content">
              <span>Shortlisted</span>

              <strong>
                {stats?.shortlistedApplications || 0}
              </strong>

              <small>Candidates shortlisted</small>
            </div>
          </Link>

          {/* Interview */}

          <Link
            to="/admin/applications?status=Interview"
            className="admin-application-status-card interview"
          >
            <div className="admin-application-status-icon">
              🎯
            </div>

            <div className="admin-application-status-content">
              <span>Interview</span>

              <strong>
                {stats?.interviewApplications || 0}
              </strong>

              <small>Interviews in progress</small>
            </div>
          </Link>

          {/* Selected */}

          <Link
            to="/admin/applications?status=Selected"
            className="admin-application-status-card selected"
          >
            <div className="admin-application-status-icon">
              ✅
            </div>

            <div className="admin-application-status-content">
              <span>Selected</span>

              <strong>
                {stats?.selectedApplications || 0}
              </strong>

              <small>Successful applications</small>
            </div>
          </Link>

          {/* Rejected */}

          <Link
            to="/admin/applications?status=Rejected"
            className="admin-application-status-card rejected"
          >
            <div className="admin-application-status-icon">
              ❌
            </div>

            <div className="admin-application-status-content">
              <span>Rejected</span>

              <strong>
                {stats?.rejectedApplications || 0}
              </strong>

              <small>Applications rejected</small>
            </div>
          </Link>
        </div>
      </section>

      {/* ==================== APPLICATION ANALYTICS ==================== */}

      <section className="admin-analytics-section">
        <div className="admin-section-heading">
          <div>
            <span className="section-eyebrow">
              PLATFORM INSIGHTS
            </span>

            <h2>Application Analytics</h2>

            <p>
              Understand application distribution and the
              jobs attracting the most student interest.
            </p>
          </div>

          <Link
            to="/admin/applications"
            className="admin-panel-link"
          >
            View Applications →
          </Link>
        </div>

        <div className="admin-analytics-summary-grid">
          <div className="admin-analytics-summary-card">
            <div className="admin-analytics-summary-icon">
              📊
            </div>

            <div>
              <span>Total Tracked</span>

              <strong>
                {totalAnalyticsApplications}
              </strong>

              <small>Applications analyzed</small>
            </div>
          </div>

          <div className="admin-analytics-summary-card">
            <div className="admin-analytics-summary-icon">
              ✅
            </div>

            <div>
              <span>Selected</span>

              <strong>{selectedAnalyticsCount}</strong>

              <small>Successful applications</small>
            </div>
          </div>

          <div className="admin-analytics-summary-card">
            <div className="admin-analytics-summary-icon">
              🎯
            </div>

            <div>
              <span>Selection Rate</span>

              <strong>{selectedRate}%</strong>

              <small>Of tracked applications</small>
            </div>
          </div>
        </div>

        <div className="admin-analytics-grid">
          {/* Status Distribution */}

          <div className="admin-analytics-panel">
            <div className="admin-analytics-panel-header">
              <div>
                <h3>Status Distribution</h3>

                <p>Current application pipeline</p>
              </div>
            </div>

            <div className="admin-analytics-status-list">
              {[
                {
                  label: 'Applied',
                  status: 'Applied',
                  icon: '📋',
                  className: 'applied',
                },
                {
                  label: 'Shortlisted',
                  status: 'Shortlisted',
                  icon: '⭐',
                  className: 'shortlisted',
                },
                {
                  label: 'Interview',
                  status: 'Interview',
                  icon: '🎯',
                  className: 'interview',
                },
                {
                  label: 'Selected',
                  status: 'Selected',
                  icon: '✅',
                  className: 'selected',
                },
                {
                  label: 'Rejected',
                  status: 'Rejected',
                  icon: '❌',
                  className: 'rejected',
                },
              ].map((item) => {
                const count = getAnalyticsCount(
                  item.status
                );

                const percentage =
                  getStatusPercentage(item.status);

                return (
                  <div
                    key={item.status}
                    className="admin-analytics-status-row"
                  >
                    <div className="admin-analytics-status-label">
                      <span
                        className={`admin-analytics-status-icon ${item.className}`}
                      >
                        {item.icon}
                      </span>

                      <span>{item.label}</span>
                    </div>

                    <div className="admin-analytics-status-bar">
                      <div className="admin-analytics-bar-track">
                        <div
                          className={`admin-analytics-bar-fill ${item.className}`}
                          style={{
                            width: `${percentage}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="admin-analytics-status-value">
                      <strong>{count}</strong>
                      <small>{percentage}%</small>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Applied Jobs */}

          <div className="admin-analytics-panel">
            <div className="admin-analytics-panel-header">
              <div>
                <h3>Top Applied Jobs</h3>

                <p>
                  Jobs receiving the most applications
                </p>
              </div>

              <span className="admin-analytics-trophy">
                🏆
              </span>
            </div>

            {analytics?.topAppliedJobs?.length === 0 ||
            !analytics?.topAppliedJobs ? (
              <div className="admin-analytics-empty">
                <span>📭</span>

                <p>
                  No application data available yet.
                </p>
              </div>
            ) : (
              <div className="admin-top-jobs-list">
                {analytics.topAppliedJobs.map(
                  (item, index) => (
                    <div
                      key={
                        item.jobId ||
                        item.job?._id ||
                        index
                      }
                      className="admin-top-job-row"
                    >
                      <div className="admin-top-job-rank">
                        {index + 1}
                      </div>

                      <div className="admin-top-job-info">
                        <strong>
                          {item.job?.title ||
                            'Untitled Job'}
                        </strong>

                        <span>
                          {item.job?.companyName ||
                            'Company not specified'}
                        </span>

                        <small>
                          {item.job?.location ||
                            'Location not specified'}
                        </small>
                      </div>

                      <div className="admin-top-job-count">
                        <strong>
                          {item.applicationCount || 0}
                        </strong>

                        <span>applications</span>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ==================== RECENT APPLICATIONS ==================== */}

      <section className="admin-panel admin-recent-applications-panel">
        <div className="admin-panel-header">
          <div>
            <h2>Recent Applications</h2>

            <p>
              Latest applications submitted by students
            </p>
          </div>

          <Link
            to="/admin/applications"
            className="admin-panel-link"
          >
            View All →
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <div className="admin-empty-state">
            <span>📋</span>
            <p>No applications found.</p>
          </div>
        ) : (
          <div className="admin-recent-applications-list">
            {recentApplications.map((application) => (
              <div
                key={application._id}
                className="admin-recent-application-row"
              >
                <div className="admin-application-avatar">
                  {application.studentId?.name
                    ?.charAt(0)
                    ?.toUpperCase() || 'S'}
                </div>

                <div className="admin-recent-application-info">
                  <strong>
                    {application.studentId?.name ||
                      'Unknown Student'}
                  </strong>

                  <span>
                    {application.jobId?.title ||
                      'Untitled Job'}
                  </span>

                  <small>
                    {application.jobId?.companyName ||
                      'Company not specified'}

                    {application.jobId?.location
                      ? ` • ${application.jobId.location}`
                      : ''}
                  </small>
                </div>

                <div className="admin-recent-application-meta">
                  <span
                    className={`admin-application-status ${getApplicationStatusClass(
                      application.status
                    )}`}
                  >
                    {application.status || 'Applied'}
                  </span>

                  <small>
                    {formatDate(
                      application.appliedAt ||
                        application.createdAt
                    )}
                  </small>

                  <Link
                    to={`/admin/applications/${application._id}`}
                    className="admin-recent-application-view"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ==================== RECENT DATA ==================== */}

      <div className="admin-dashboard-grid">
        {/* Recent Users */}

        <section className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Recent Users</h2>

              <p>
                Latest accounts registered on PlaceMate
              </p>
            </div>

            <Link
              to="/admin/users"
              className="admin-panel-link"
            >
              View All →
            </Link>
          </div>

          {recentUsers.length === 0 ? (
            <div className="admin-empty-state">
              <span>👥</span>
              <p>No users found.</p>
            </div>
          ) : (
            <div className="admin-users-list">
              {recentUsers.map((user) => (
                <div
                  key={user._id}
                  className="admin-user-row"
                >
                  <div className="admin-user-avatar">
                    {user.name
                      ?.charAt(0)
                      ?.toUpperCase() || 'U'}
                  </div>

                  <div className="admin-user-info">
                    <strong>
                      {user.name || 'Unnamed User'}
                    </strong>

                    <span>{user.email}</span>
                  </div>

                  <div className="admin-user-meta">
                    <span
                      className={getRoleClass(user.role)}
                    >
                      {user.role}
                    </span>

                    <small>
                      {formatDate(user.createdAt)}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Jobs */}

        <section className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Recent Jobs</h2>

              <p>
                Latest jobs posted by recruiters
              </p>
            </div>

            <Link
              to="/admin/jobs"
              className="admin-panel-link"
            >
              View All →
            </Link>
          </div>

          {recentJobs.length === 0 ? (
            <div className="admin-empty-state">
              <span>💼</span>
              <p>No jobs found.</p>
            </div>
          ) : (
            <div className="admin-jobs-list">
              {recentJobs.map((job) => (
                <div
                  key={job._id}
                  className="admin-job-row"
                >
                  <div className="admin-job-icon">
                    💼
                  </div>

                  <div className="admin-job-info">
                    <strong>
                      {job.title || 'Untitled Job'}
                    </strong>

                    <span>
                      {job.companyName ||
                        'Company not specified'}
                    </span>

                    <small>
                      {job.location ||
                        'Location not specified'}
                    </small>
                  </div>

                  <div className="admin-job-meta">
                    <span
                      className={`admin-job-status ${
                        job.status || 'open'
                      }`}
                    >
                      {job.status || 'open'}
                    </span>

                    <small>
                      {formatDate(job.createdAt)}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ==================== QUICK ACTIONS ==================== */}

      <section className="admin-quick-actions">
        <div>
          <span className="section-eyebrow">
            ADMIN TOOLS
          </span>

          <h2>Quick Actions</h2>

          <p>
            Manage important areas of the PlaceMate
            platform.
          </p>
        </div>

        <div className="admin-action-buttons">
          {/* Manage Users */}

          <Link
            to="/admin/users"
            className="admin-action-card"
          >
            <span>👥</span>

            <div>
              <strong>Manage Users</strong>

              <small>
                Search and review registered users
              </small>
            </div>
          </Link>

          {/* Manage Jobs */}

          <Link
            to="/admin/jobs"
            className="admin-action-card"
          >
            <span>💼</span>

            <div>
              <strong>Manage Jobs</strong>

              <small>
                Search and review job postings
              </small>
            </div>
          </Link>

          {/* Manage Applications */}

          <Link
            to="/admin/applications"
            className="admin-action-card"
          >
            <span>📋</span>

            <div>
              <strong>Manage Applications</strong>

              <small>
                Review student applications
              </small>
            </div>
          </Link>

          {/* Notifications */}

          <Link
            to="/admin/notifications"
            className="admin-action-card"
          >
            <span>🔔</span>

            <div>
              <strong>Notifications</strong>

              <small>
                View platform alerts and updates
              </small>
            </div>
          </Link>

          {/* Browse Jobs */}

          <Link
            to="/jobs"
            className="admin-action-card"
          >
            <span>🔎</span>

            <div>
              <strong>Browse Jobs</strong>

              <small>
                View jobs currently available
              </small>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;