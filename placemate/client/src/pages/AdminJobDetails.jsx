import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';

const AdminJobDetails = () => {
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchJob = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get(`/admin/jobs/${id}`);
      setJob(response.data);
    } catch (err) {
      console.error('Failed to load admin job:', err);

      setError(
        err.response?.data?.message ||
          'Unable to load job details.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  const formatDate = (date) => {
    if (!date) return 'Not specified';

    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
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

  if (loading) {
    return (
      <div className="page-container">
        <div className="admin-users-loading">
          <div className="loading-spinner"></div>
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="admin-users-error">
          <div className="admin-error-icon">⚠️</div>

          <h2>Unable to load job</h2>

          <p>{error}</p>

          <div className="admin-error-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={fetchJob}
            >
              Try Again
            </button>

            <Link
              to="/admin/jobs"
              className="btn btn-secondary"
            >
              ← Back to Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <div className="page-container admin-job-details-page">
      <div className="admin-job-details-header">
        <div>
          <span className="section-eyebrow">
            ADMIN PORTAL
          </span>

          <h1>Job Details</h1>

          <p>
            Review complete information about this job posting.
          </p>
        </div>

        <Link
          to="/admin/jobs"
          className="btn btn-secondary"
        >
          ← Back to Jobs
        </Link>
      </div>

      <section className="admin-job-details-hero">
        <div className="admin-job-details-icon">
          💼
        </div>

        <div className="admin-job-details-main">
          <div className="admin-job-title-row">
            <div>
              <h2>{job.title || 'Untitled Job'}</h2>

              <p className="admin-job-company-name">
                {job.companyName || 'Company not specified'}
              </p>
            </div>

            <span className={getStatusClass(job.status)}>
              {job.status || 'unknown'}
            </span>
          </div>

          <div className="admin-job-meta-row">
            <span>
              📍 {job.location || 'Location not specified'}
            </span>

            <span>
              💼 {job.jobType || 'Job type not specified'}
            </span>

            <span>
              📅 Posted {formatDate(job.createdAt)}
            </span>
          </div>
        </div>
      </section>

      <div className="admin-job-details-layout">
        <div className="admin-job-details-main-column">
          <section className="admin-detail-card">
            <div className="admin-detail-card-header">
              <h3>Job Description</h3>
            </div>

            <div className="admin-job-description">
              {job.description ? (
                <p>{job.description}</p>
              ) : (
                <p className="admin-muted-text">
                  No description provided.
                </p>
              )}
            </div>
          </section>

          <section className="admin-detail-card">
            <div className="admin-detail-card-header">
              <h3>Required Skills</h3>
            </div>

            {job.requiredSkills &&
            job.requiredSkills.length > 0 ? (
              <div className="admin-job-skills">
                {job.requiredSkills.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="admin-job-skill"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="admin-muted-text">
                No specific skills listed.
              </p>
            )}
          </section>

          <section className="admin-detail-card">
            <div className="admin-detail-card-header">
              <h3>Eligibility</h3>
            </div>

            <div className="admin-eligibility-grid">
              <div className="admin-info-item">
                <span>Minimum CGPA</span>
                <strong>
                  {job.eligibility?.minCgpa !== undefined &&
                  job.eligibility?.minCgpa !== null
                    ? job.eligibility.minCgpa
                    : 'Not specified'}
                </strong>
              </div>

              <div className="admin-info-item">
                <span>Eligible Branches</span>
                <strong>
                  {job.eligibility?.branches?.length
                    ? job.eligibility.branches.join(', ')
                    : 'All branches'}
                </strong>
              </div>

              <div className="admin-info-item">
                <span>Eligible Batch</span>
                <strong>
                  {job.eligibility?.batch?.length
                    ? job.eligibility.batch.join(', ')
                    : 'All batches'}
                </strong>
              </div>
            </div>
          </section>
        </div>

        <aside className="admin-job-details-sidebar">
          <section className="admin-detail-card">
            <div className="admin-detail-card-header">
              <h3>Job Information</h3>
            </div>

            <div className="admin-info-list">
              <div className="admin-info-item">
                <span>Job Type</span>
                <strong>
                  {job.jobType || 'Not specified'}
                </strong>
              </div>

              <div className="admin-info-item">
                <span>Experience</span>
                <strong>
                  {job.experience || 'Not specified'}
                </strong>
              </div>

              <div className="admin-info-item">
                <span>Salary</span>
                <strong>
                  {job.salary || 'Not specified'}
                </strong>
              </div>

              <div className="admin-info-item">
                <span>Location</span>
                <strong>
                  {job.location || 'Not specified'}
                </strong>
              </div>

              <div className="admin-info-item">
                <span>Application Deadline</span>
                <strong>
                  {formatDate(job.applicationDeadline)}
                </strong>
              </div>

              <div className="admin-info-item">
                <span>Posted On</span>
                <strong>
                  {formatDate(job.createdAt)}
                </strong>
              </div>

              <div className="admin-info-item">
                <span>Last Updated</span>
                <strong>
                  {formatDate(job.updatedAt)}
                </strong>
              </div>
            </div>
          </section>

          <section className="admin-detail-card">
            <div className="admin-detail-card-header">
              <h3>Recruiter</h3>
            </div>

            <div className="admin-recruiter-card">
              <div className="admin-recruiter-avatar">
                {job.recruiterId?.name
                  ?.charAt(0)
                  ?.toUpperCase() || 'R'}
              </div>

              <div>
                <strong>
                  {job.recruiterId?.name ||
                    'Unknown Recruiter'}
                </strong>

                <span>
                  {job.recruiterId?.email ||
                    'Email not available'}
                </span>
              </div>
            </div>
          </section>

          <section className="admin-detail-card">
            <div className="admin-detail-card-header">
              <h3>Job ID</h3>
            </div>

            <p className="admin-job-id">
              {job._id}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default AdminJobDetails;