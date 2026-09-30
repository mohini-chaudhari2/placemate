import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [job, setJob] = useState(null);
  const [match, setMatch] = useState(null);

  const [applying, setApplying] = useState(false);
  const [application, setApplication] = useState(null);
  const [applicationError, setApplicationError] = useState('');

  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get(`/jobs/${id}`);

        setJob(response.data);
      } catch (err) {
        console.error('Failed to load job:', err);

        setError(
          err.response?.data?.message ||
            'Unable to load this job.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleCheckMatch = async () => {
    try {
      setMatchLoading(true);
      setMatch(null);

      const response = await api.get(`/jobs/${id}/match`);

      setMatch(response.data);
    } catch (err) {
      console.error(
        'Failed to calculate job match:',
        err
      );

      if (err.response?.status === 401) {
        setMatch({
          error:
            'Please login as a student to check your skill match.',
        });
      } else {
        setMatch({
          error:
            err.response?.data?.message ||
            'Unable to calculate skill match.',
        });
      }
    } finally {
      setMatchLoading(false);
    }
  };

  const handleApply = async () => {
    setApplicationError('');

    if (!user) {
      setApplicationError(
        'Please login as a student before applying.'
      );
      return;
    }

    if (user.role !== 'student') {
      setApplicationError(
        'Only student accounts can apply for jobs.'
      );
      return;
    }

    try {
      setApplying(true);

      const response = await api.post(
        '/applications',
        {
          jobId: id,
        }
      );

      setApplication(response.data.application);
      toast.success('Application submitted successfully!');
    } catch (err) {
      console.error(
        'Failed to apply for job:',
        err
      );

      const msg = err.response?.data?.message || 'Unable to submit your application.';
      setApplicationError(msg);
      toast.error(msg);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <main className="page-wrapper">
        <div className="container">
          <div className="card job-details-state">
            <div className="loading-spinner" />

            <h3>Loading job details...</h3>

            <p>
              Please wait while we fetch the job
              posting.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !job) {
    return (
      <main className="page-wrapper">
        <div className="container">
          <div className="card job-details-state">

            <div className="job-details-state-icon">
              ⚠️
            </div>

            <h2>Job not found</h2>

            <p>
              {error ||
                'This job is no longer available.'}
            </p>

            <Link
              to="/jobs"
              className="btn btn-primary"
            >
              ← Back to Jobs
            </Link>

          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-wrapper">
      <div className="container job-details-page">

        <Link
          to="/jobs"
          className="job-back-link"
        >
          ← Back to Jobs
        </Link>

        <div className="job-details-layout">

          {/* LEFT SIDE */}

          <section className="job-details-main">

            <div className="card job-details-header">

              <div className="job-details-company-icon">
                {job.companyName
                  ?.charAt(0)
                  ?.toUpperCase() || 'C'}
              </div>

              <div className="job-details-header-content">

                <span className="section-eyebrow">
                  Placement Opportunity
                </span>

                <h1>{job.title}</h1>

                <h2>{job.companyName}</h2>

                <div className="job-details-meta">

                  {job.location && (
                    <span>
                      📍 {job.location}
                    </span>
                  )}

                  {job.jobType && (
                    <span>
                      💼 {job.jobType}
                    </span>
                  )}

                  {job.experience && (
                    <span>
                      🎓 {job.experience}
                    </span>
                  )}

                  {job.salary && (
                    <span>
                      💰 {job.salary}
                    </span>
                  )}

                </div>

              </div>

              <span className="status-badge status-open">
                Open
              </span>

            </div>

            {/* DESCRIPTION */}

            <div className="card job-details-section">

              <h2>Job Description</h2>

              <p className="job-description">
                {job.description}
              </p>

            </div>

            {/* SKILLS */}

            {job.requiredSkills?.length > 0 && (
              <div className="card job-details-section">

                <h2>Required Skills</h2>

                <div className="job-detail-skills">

                  {job.requiredSkills.map(
                    (skill) => (
                      <span
                        className="skill-chip"
                        key={skill}
                      >
                        {skill}
                      </span>
                    )
                  )}

                </div>

              </div>
            )}

            {/* ELIGIBILITY */}

            {job.eligibility && (
              <div className="card job-details-section">

                <h2>Eligibility</h2>

                <div className="eligibility-grid">

                  {job.eligibility.minCgpa !==
                    undefined && (
                    <div className="eligibility-item">
                      <span>
                        Minimum CGPA
                      </span>

                      <strong>
                        {job.eligibility.minCgpa}
                      </strong>
                    </div>
                  )}

                  {job.eligibility.branches
                    ?.length > 0 && (
                    <div className="eligibility-item">

                      <span>Branches</span>

                      <strong>
                        {job.eligibility.branches.join(
                          ', '
                        )}
                      </strong>

                    </div>
                  )}

                  {job.eligibility.batch
                    ?.length > 0 && (
                    <div className="eligibility-item">

                      <span>
                        Eligible Batches
                      </span>

                      <strong>
                        {job.eligibility.batch.join(
                          ', '
                        )}
                      </strong>

                    </div>
                  )}

                </div>

              </div>
            )}

          </section>

          {/* RIGHT SIDE */}

          <aside className="job-details-sidebar">

            {/* APPLY CARD */}

            <div className="card job-apply-card">

              <h2>
                Interested in this opportunity?
              </h2>

              <p>
                Apply for this position and track
                your application status from your
                student dashboard.
              </p>

              {!application ? (
                <button
                  type="button"
                  className="btn btn-primary job-apply-button"
                  onClick={handleApply}
                  disabled={applying}
                >
                  {applying
                    ? 'Submitting Application...'
                    : '🚀 Apply Now'}
                </button>
              ) : (
                <div className="application-success-box">

                  <div className="application-success-icon">
                    ✓
                  </div>

                  <strong>
                    Application Submitted!
                  </strong>

                  <p>
                    Your application has been
                    successfully submitted.
                  </p>

                  <Link
                    to="/applications"
                    className="btn btn-secondary"
                  >
                    View My Applications
                  </Link>

                </div>
              )}

              {applicationError && (
                <div className="application-error">
                  ⚠️ {applicationError}
                </div>
              )}

              {!user && (
                <Link
                  to="/login"
                  className="job-login-link"
                >
                  Login as a student to apply
                </Link>
              )}

            </div>

            {/* SKILL MATCH */}

            <div className="card job-apply-card">

              <h2>Skill Compatibility</h2>

              <p>
                See how your current skills compare
                with this job's requirements.
              </p>

              <button
                type="button"
                className="btn btn-outline job-match-button"
                onClick={handleCheckMatch}
                disabled={matchLoading}
              >
                {matchLoading
                  ? 'Checking Match...'
                  : '🎯 Check My Skill Match'}
              </button>

            </div>

            {/* MATCH RESULT */}

            {match && (
              <div className="card job-match-card">

                {match.error ? (
                  <>
                    <div className="job-match-icon">
                      🔐
                    </div>

                    <h3>
                      Login Required
                    </h3>

                    <p>
                      {match.error}
                    </p>

                    <Link
                      to="/login"
                      className="btn btn-primary"
                    >
                      Login
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="job-match-header">

                      <div>
                        <span>
                          Skill Match
                        </span>

                        <strong>
                          {match.matchPercentage}%
                        </strong>
                      </div>

                      <div className="match-circle">
                        {match.matchPercentage}%
                      </div>

                    </div>

                    {match.matchedSkills
                      ?.length > 0 && (
                      <div className="match-skill-group">

                        <h4>
                          ✅ Matched Skills
                        </h4>

                        <div className="job-detail-skills">

                          {match.matchedSkills.map(
                            (skill) => (
                              <span
                                className="skill-chip skill-chip-success"
                                key={skill}
                              >
                                {skill}
                              </span>
                            )
                          )}

                        </div>

                      </div>
                    )}

                    {match.missingSkills
                      ?.length > 0 && (
                      <div className="match-skill-group">

                        <h4>
                          📚 Skills to Improve
                        </h4>

                        <div className="job-detail-skills">

                          {match.missingSkills.map(
                            (skill) => (
                              <span
                                className="skill-chip skill-chip-warning"
                                key={skill}
                              >
                                {skill}
                              </span>
                            )
                          )}

                        </div>

                      </div>
                    )}

                    {match.missingSkills
                      ?.length === 0 && (
                      <div className="match-success-message">
                        🎉 You have all the required
                        skills for this job!
                      </div>
                    )}

                  </>
                )}

              </div>
            )}

            {/* DEADLINE */}

            {job.applicationDeadline && (
              <div className="card job-deadline-card">

                <span>
                  Application Deadline
                </span>

                <strong>
                  {new Date(
                    job.applicationDeadline
                  ).toLocaleDateString(
                    'en-IN',
                    {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    }
                  )}
                </strong>

              </div>
            )}

          </aside>

        </div>

      </div>
    </main>
  );
};

export default JobDetails;