import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const CandidateProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCandidateProfile = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get(
          `/recruiter/applications/${id}/candidate`
        );

        setApplication(response.data.application);
        setCandidate(response.data.candidate);
      } catch (err) {
        console.error(
          'Failed to load candidate profile:',
          err
        );

        setError(
          err.response?.data?.message ||
            'Unable to load candidate profile.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCandidateProfile();
    }
  }, [id]);

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
        return 'candidate-profile-status selected';

      case 'Shortlisted':
        return 'candidate-profile-status shortlisted';

      case 'Interview':
        return 'candidate-profile-status interview';

      case 'Rejected':
        return 'candidate-profile-status rejected';

      default:
        return 'candidate-profile-status applied';
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-loading">
          <div className="loading-spinner"></div>
          <p>Loading candidate profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container candidate-profile-page">
        <div className="candidate-profile-error">
          <div className="candidate-profile-error-icon">
            ⚠️
          </div>

          <h2>Unable to load candidate</h2>

          <p>{error}</p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/recruiter/applications')}
          >
            ← Back to Applications
          </button>
        </div>
      </div>
    );
  }

  if (!candidate || !application) {
    return null;
  }

  const job = application.job;

  return (
    <div className="page-container candidate-profile-page">
      {/* Header */}

      <div className="candidate-profile-header">
        <div>
          <Link
            to="/recruiter/applications"
            className="candidate-profile-back"
          >
            ← Back to Applications
          </Link>

          <span className="section-eyebrow">
            CANDIDATE PROFILE
          </span>

          <h1>Candidate Details</h1>

          <p>
            Review the candidate's profile and application
            information.
          </p>
        </div>

        <span className={getStatusClass(application.status)}>
          {application.status}
        </span>
      </div>

      {/* Candidate hero */}

      <section className="candidate-profile-hero">
        <div className="candidate-profile-avatar">
          {candidate.name?.charAt(0)?.toUpperCase() || 'S'}
        </div>

        <div className="candidate-profile-identity">
          <h2>{candidate.name || 'Student Applicant'}</h2>

          <p>{candidate.email || 'Email unavailable'}</p>

          {candidate.college && (
            <span>
              🎓 {candidate.college}
            </span>
          )}
        </div>
      </section>

      {/* Main grid */}

      <div className="candidate-profile-grid">
        {/* Personal / academic information */}

        <section className="candidate-profile-card">
          <div className="candidate-profile-card-header">
            <div className="candidate-profile-card-icon">
              👤
            </div>

            <div>
              <h2>Personal & Academic</h2>
              <p>Candidate background information</p>
            </div>
          </div>

          <div className="candidate-profile-info-grid">
            <div>
              <span>Full Name</span>
              <strong>
                {candidate.name || 'Not provided'}
              </strong>
            </div>

            <div>
              <span>Email</span>
              <strong>
                {candidate.email || 'Not provided'}
              </strong>
            </div>

            <div>
              <span>Phone</span>
              <strong>
                {candidate.phone || 'Not provided'}
              </strong>
            </div>

            <div>
              <span>College</span>
              <strong>
                {candidate.college || 'Not provided'}
              </strong>
            </div>

            <div>
              <span>Branch</span>
              <strong>
                {candidate.branch || 'Not provided'}
              </strong>
            </div>

            <div>
              <span>Graduation Year</span>
              <strong>
                {candidate.graduationYear || 'Not provided'}
              </strong>
            </div>

            <div>
              <span>CGPA</span>
              <strong>
                {candidate.cgpa !== null &&
                candidate.cgpa !== undefined &&
                candidate.cgpa !== ''
                  ? candidate.cgpa
                  : 'Not provided'}
              </strong>
            </div>

            <div>
              <span>Profile Completion</span>
              <strong>
                {candidate.profileCompletion || 0}%
              </strong>
            </div>
          </div>
        </section>

        {/* Application information */}

        <section className="candidate-profile-card">
          <div className="candidate-profile-card-header">
            <div className="candidate-profile-card-icon">
              📋
            </div>

            <div>
              <h2>Application</h2>
              <p>Current application information</p>
            </div>
          </div>

          <div className="candidate-profile-info-grid">
            <div>
              <span>Position</span>
              <strong>
                {job?.title || 'Not available'}
              </strong>
            </div>

            <div>
              <span>Company</span>
              <strong>
                {job?.companyName || 'Not available'}
              </strong>
            </div>

            <div>
              <span>Location</span>
              <strong>
                {job?.location || 'Not specified'}
              </strong>
            </div>

            <div>
              <span>Job Type</span>
              <strong>
                {job?.jobType || 'Not specified'}
              </strong>
            </div>

            <div>
              <span>Applied On</span>
              <strong>
                {formatDate(application.appliedAt)}
              </strong>
            </div>

            <div>
              <span>Status</span>
              <strong className="candidate-profile-status-text">
                {application.status}
              </strong>
            </div>
          </div>

          {application.recruiterNote && (
            <div className="candidate-profile-note">
              <span>Recruiter Note</span>
              <p>{application.recruiterNote}</p>
            </div>
          )}
        </section>

        {/* Skills */}

        <section className="candidate-profile-card">
          <div className="candidate-profile-card-header">
            <div className="candidate-profile-card-icon">
              🛠️
            </div>

            <div>
              <h2>Skills</h2>
              <p>Candidate's technical and professional skills</p>
            </div>
          </div>

          {candidate.skills &&
          candidate.skills.length > 0 ? (
            <div className="candidate-skills-list">
              {candidate.skills.map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="candidate-skill"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="candidate-profile-muted">
              No skills have been added to the candidate profile.
            </p>
          )}
        </section>

        {/* Preferences */}

        <section className="candidate-profile-card">
          <div className="candidate-profile-card-header">
            <div className="candidate-profile-card-icon">
              🎯
            </div>

            <div>
              <h2>Job Preferences</h2>
              <p>Candidate's preferred opportunities</p>
            </div>
          </div>

          <div className="candidate-preferences">
            <div>
              <span>Preferred Locations</span>

              <div className="candidate-preference-list">
                {candidate.preferredLocations &&
                candidate.preferredLocations.length > 0 ? (
                  candidate.preferredLocations.map(
                    (location, index) => (
                      <span key={`${location}-${index}`}>
                        {location}
                      </span>
                    )
                  )
                ) : (
                  <em>Not specified</em>
                )}
              </div>
            </div>

            <div>
              <span>Preferred Job Types</span>

              <div className="candidate-preference-list">
                {candidate.preferredJobTypes &&
                candidate.preferredJobTypes.length > 0 ? (
                  candidate.preferredJobTypes.map(
                    (jobType, index) => (
                      <span key={`${jobType}-${index}`}>
                        {jobType}
                      </span>
                    )
                  )
                ) : (
                  <em>Not specified</em>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Bio */}

        <section className="candidate-profile-card candidate-profile-full">
          <div className="candidate-profile-card-header">
            <div className="candidate-profile-card-icon">
              📝
            </div>

            <div>
              <h2>About the Candidate</h2>
              <p>Candidate's personal introduction</p>
            </div>
          </div>

          <div className="candidate-bio">
            {candidate.bio ? (
              <p>{candidate.bio}</p>
            ) : (
              <p className="candidate-profile-muted">
                No bio has been added to this profile.
              </p>
            )}
          </div>
        </section>

        {/* Resume */}

        <section className="candidate-profile-card candidate-profile-full">
          <div className="candidate-profile-card-header">
            <div className="candidate-profile-card-icon">
              📄
            </div>

            <div>
              <h2>Resume</h2>
              <p>Candidate's uploaded resume</p>
            </div>
          </div>

          {candidate.resumeUrl ? (
            <a
              href={candidate.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="candidate-resume-button"
            >
              📄 View Candidate Resume
              <span>↗</span>
            </a>
          ) : (
            <p className="candidate-profile-muted">
              No resume link has been provided.
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default CandidateProfile;