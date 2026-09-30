import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const AdminApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);

        const response = await api.get(`/admin/applications/${id}`);

        setApplication(response.data);
      } catch (err) {
        console.error('Error fetching application:', err);
        setError(
          err.response?.data?.message ||
            'Failed to load application details.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  if (loading) {
    return (
      <div className="admin-application-details-page">
        <div className="admin-details-loading">
          Loading application details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-application-details-page">
        <div className="admin-details-error">
          <h2>Unable to load application</h2>
          <p>{error}</p>

          <button
            className="btn btn-primary"
            onClick={() => navigate('/admin/applications')}
          >
            ← Back to Applications
          </button>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="admin-application-details-page">
        <div className="admin-details-error">
          <h2>Application not found</h2>

          <button
            className="btn btn-primary"
            onClick={() => navigate('/admin/applications')}
          >
            ← Back to Applications
          </button>
        </div>
      </div>
    );
  }

  const student = application.studentId;
  const job = application.jobId;
  const recruiter = application.recruiterId;

  return (
    <div className="admin-application-details-page">

      {/* Header */}
      <div className="admin-application-details-header">
        <div>
          <span className="section-eyebrow">
            APPLICATION DETAILS
          </span>

          <h1>Application Overview</h1>

          <p>
            Review student, job, recruiter, and application information.
          </p>
        </div>

        <Link
          to="/admin/applications"
          className="btn btn-secondary"
        >
          ← Back to Applications
        </Link>
      </div>

      {/* Status */}
      <div className="admin-application-details-status-card">
        <div>
          <span>Application Status</span>

          <strong
            className={`admin-application-detail-status ${application.status?.toLowerCase()}`}
          >
            {application.status}
          </strong>
        </div>

        <div>
          <span>Applied On</span>

          <strong>
            {application.appliedAt
              ? new Date(application.appliedAt).toLocaleDateString(
                  'en-IN',
                  {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  }
                )
              : 'N/A'}
          </strong>
        </div>
      </div>

      {/* Student + Job */}
      <div className="admin-application-details-grid">

        {/* Student */}
        <section className="admin-application-detail-card">
          <div className="admin-detail-card-heading">
            <div className="admin-detail-icon">
              👨‍🎓
            </div>

            <div>
              <span>STUDENT</span>
              <h2>Student Information</h2>
            </div>
          </div>

          <div className="admin-detail-info-list">
            <div>
              <span>Name</span>
              <strong>{student?.name || 'N/A'}</strong>
            </div>

            <div>
              <span>Email</span>
              <strong>{student?.email || 'N/A'}</strong>
            </div>
          </div>

          {student?._id && (
            <Link
              to={`/admin/users/${student._id}`}
              className="admin-detail-link"
            >
              View Student →
            </Link>
          )}
        </section>

        {/* Job */}
        <section className="admin-application-detail-card">
          <div className="admin-detail-card-heading">
            <div className="admin-detail-icon">
              💼
            </div>

            <div>
              <span>JOB</span>
              <h2>Job Information</h2>
            </div>
          </div>

          <div className="admin-detail-info-list">
            <div>
              <span>Job Title</span>
              <strong>{job?.title || 'N/A'}</strong>
            </div>

            <div>
              <span>Company</span>
              <strong>{job?.companyName || 'N/A'}</strong>
            </div>

            <div>
              <span>Location</span>
              <strong>{job?.location || 'N/A'}</strong>
            </div>

            <div>
              <span>Job Type</span>
              <strong>{job?.jobType || 'N/A'}</strong>
            </div>
          </div>

          {job?._id && (
            <Link
              to={`/admin/jobs/${job._id}`}
              className="admin-detail-link"
            >
              View Job →
            </Link>
          )}
        </section>

        {/* Recruiter */}
        <section className="admin-application-detail-card">
          <div className="admin-detail-card-heading">
            <div className="admin-detail-icon">
              🏢
            </div>

            <div>
              <span>RECRUITER</span>
              <h2>Recruiter Information</h2>
            </div>
          </div>

          <div className="admin-detail-info-list">
            <div>
              <span>Name</span>
              <strong>{recruiter?.name || 'N/A'}</strong>
            </div>

            <div>
              <span>Email</span>
              <strong>{recruiter?.email || 'N/A'}</strong>
            </div>
          </div>

          {recruiter?._id && (
            <Link
              to={`/admin/users/${recruiter._id}`}
              className="admin-detail-link"
            >
              View Recruiter →
            </Link>
          )}
        </section>

        {/* Application */}
        <section className="admin-application-detail-card">
          <div className="admin-detail-card-heading">
            <div className="admin-detail-icon">
              📄
            </div>

            <div>
              <span>APPLICATION</span>
              <h2>Application Information</h2>
            </div>
          </div>

          <div className="admin-detail-info-list">
            <div>
              <span>Current Status</span>
              <strong>{application.status || 'N/A'}</strong>
            </div>

            <div>
              <span>Applied Date</span>
              <strong>
                {application.appliedAt
                  ? new Date(
                      application.appliedAt
                    ).toLocaleDateString('en-IN')
                  : 'N/A'}
              </strong>
            </div>
          </div>
        </section>

      </div>

      {/* Recruiter Note */}
      <section className="admin-application-note-card">
        <div className="admin-detail-card-heading">
          <div className="admin-detail-icon">
            📝
          </div>

          <div>
            <span>RECRUITER NOTE</span>
            <h2>Application Note</h2>
          </div>
        </div>

        <div className="admin-application-note">
          {application.recruiterNote?.trim()
            ? application.recruiterNote
            : 'No recruiter note has been added for this application.'}
        </div>
      </section>

    </div>
  );
};

export default AdminApplicationDetails;