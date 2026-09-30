import { useEffect, useState } from 'react';




import './StudentDashboard.css';


import { Link } from 'react-router-dom';







import api from '../services/api';







import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';















function StudentDashboard() {







  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();















  const [dashboard, setDashboard] = useState(null);







  const [recommendations, setRecommendations] = useState([]);







  const [savedJobCount, setSavedJobCount] = useState(0);

  const [resume, setResume] = useState(null);

  const [resumeLoading, setResumeLoading] = useState(true);







  const [interviewCount, setInterviewCount] = useState(0);



  const [nextInterview, setNextInterview] = useState(null);



  const [interviewCountdown, setInterviewCountdown] = useState('');















  const [loading, setLoading] = useState(true);







  const [recommendationsLoading, setRecommendationsLoading] =







    useState(true);







  const [savedJobsLoading, setSavedJobsLoading] =







    useState(true);















  const [applyingJobId, setApplyingJobId] = useState(null);







  const [appliedJobIds, setAppliedJobIds] = useState([]);







  const [error, setError] = useState('');







  const [recommendationError, setRecommendationError] =







    useState('');















  useEffect(() => {







    const fetchDashboard = async () => {







      if (authLoading) return;















      if (!isAuthenticated) {







        setError(







          'Please log in to access your student dashboard.'







        );







        setLoading(false);







        return;







      }















      try {







        setLoading(true);







        setError('');















        const response = await api.get('/student/dashboard');















        setDashboard(response.data);















        const recentApplications =







          response.data?.recentApplications || [];















        setAppliedJobIds(







          recentApplications







            .map(







              (application) =>







                application.jobId?._id







            )







            .filter(Boolean)







        );







      } catch (err) {







        console.error('Dashboard error:', err);















        setError(







          err.response?.data?.message ||







          'Unable to load your dashboard. Please try again.'







        );







      } finally {







        setLoading(false);







      }







    };















    fetchDashboard();







  }, [authLoading, isAuthenticated]);















  useEffect(() => {







    const fetchRecommendations = async () => {







      if (authLoading || !isAuthenticated) return;















      try {







        setRecommendationsLoading(true);







        setRecommendationError('');















        const response = await api.get(







          '/student/recommendations'







        );















        setRecommendations(







          response.data?.recommendations || []







        );







      } catch (err) {







        console.error(







          'Recommendations error:',







          err







        );















        setRecommendationError(







          err.response?.data?.message ||







          'Unable to load job recommendations.'







        );







      } finally {







        setRecommendationsLoading(false);







      }







    };















    fetchRecommendations();







  }, [authLoading, isAuthenticated]);















  useEffect(() => {







    const fetchSavedJobs = async () => {







      if (authLoading || !isAuthenticated) return;















      try {







        setSavedJobsLoading(true);















        const response = await api.get(







          '/saved-jobs/ids'







        );















        setSavedJobCount(







          Array.isArray(response.data?.jobIds)







            ? response.data.jobIds.length







            : 0







        );







      } catch (err) {







        console.error(







          'Saved jobs error:',







          err







        );















        setSavedJobCount(0);







      } finally {







        setSavedJobsLoading(false);







      }







    };















    fetchSavedJobs();







  }, [authLoading, isAuthenticated]);















  useEffect(() => {

    const fetchResume = async () => {

      if (authLoading || !isAuthenticated) return;



      try {

        setResumeLoading(true);

        const response = await api.get('/resume');

        setResume(response.data?.resume || null);

      } catch (err) {

        console.error('Resume dashboard error:', err);

        setResume(null);

      } finally {

        setResumeLoading(false);

      }

    };



    fetchResume();

  }, [authLoading, isAuthenticated]);



  const getInterviewDateTime = (interview) => {



    if (!interview?.scheduledDate || !interview?.startTime) return null;



    const date = new Date(interview.scheduledDate);



    const [hours, minutes] = String(interview.startTime).split(':').map(Number);



    date.setHours(Number.isFinite(hours) ? hours : 0, Number.isFinite(minutes) ? minutes : 0, 0, 0);



    return date;



  };







  const getCountdownLabel = (date) => {



    if (!date) return '';



    const diff = date.getTime() - Date.now();



    if (diff <= 0) return 'Starting now';



    const totalMinutes = Math.floor(diff / 60000);



    const days = Math.floor(totalMinutes / 1440);



    const hours = Math.floor((totalMinutes % 1440) / 60);



    const minutes = totalMinutes % 60;



    if (days > 0) return `${days}d ${hours}h ${minutes}m`;



    if (hours > 0) return `${hours}h ${minutes}m`;



    return `${minutes}m`;



  };







  const fetchInterviews = async () => {



    if (authLoading || !isAuthenticated) return;



    try {



      const response = await api.get('/interviews/student');



      const interviews = response.data?.interviews || [];



      const now = new Date();



      const upcomingInterviews = interviews



        .filter((interview) => {



          if (!interview?.scheduledDate || !interview?.startTime) return false;



          if (interview.status === 'Cancelled' || interview.status === 'Completed') return false;



          const date = getInterviewDateTime(interview);



          return date && date >= now;



        })



        .sort((a, b) => getInterviewDateTime(a) - getInterviewDateTime(b));



      setInterviewCount(upcomingInterviews.length);



      setNextInterview(upcomingInterviews[0] || null);



      setInterviewCountdown(upcomingInterviews[0] ? getCountdownLabel(getInterviewDateTime(upcomingInterviews[0])) : '');



    } catch (err) {



      console.error('Interviews dashboard error:', err);



      setInterviewCount(0);



      setNextInterview(null);



      setInterviewCountdown('');



    }



  };







  useEffect(() => {



    fetchInterviews();



  }, [authLoading, isAuthenticated]);







  useEffect(() => {



    if (!nextInterview) return undefined;



    const updateCountdown = () => {



      const date = getInterviewDateTime(nextInterview);



      setInterviewCountdown(getCountdownLabel(date));



      if (date && date.getTime() <= Date.now()) fetchInterviews();



    };



    updateCountdown();



    const interval = window.setInterval(updateCountdown, 30000);



    return () => window.clearInterval(interval);



  }, [nextInterview]);







  const handleApply = async (jobId) => {







    if (!jobId) return;















    try {







      setApplyingJobId(jobId);















      await api.post('/applications', {







        jobId,







      });















      toast.success('Successfully applied for the job!');
      setAppliedJobIds((previous) => [







        ...previous,







        jobId,







      ]);















      setDashboard((previous) => {







        if (!previous) return previous;















        return {







          ...previous,







          statistics: {







            ...(previous.statistics || {}),







            applicationCount:







              Number(







                previous.statistics







                  ?.applicationCount || 0







              ) + 1,







          },







        };







      });







    } catch (err) {







      console.error('Apply error:', err);















      const message =







        err.response?.data?.message ||







        'Unable to apply for this job. Please try again.';















      toast.error(message);







    } finally {







      setApplyingJobId(null);







    }







  };















  const getMatchClass = (percentage) => {







    if (percentage >= 80) return 'match-excellent';







    if (percentage >= 60) return 'match-good';







    if (percentage >= 40) return 'match-average';







    return 'match-low';







  };















  if (authLoading || loading) {







    return (







      <main className="dashboard-page">







        <div className="dashboard-container">







          <div className="dashboard-loading">







            <div className="dashboard-loading-icon">







              ⏳







            </div>















            <h2>







              Loading your dashboard...







            </h2>















            <p>







              Please wait while we load your placement







              information.







            </p>







          </div>







        </div>







      </main>







    );







  }















  if (error) {







    return (







      <main className="dashboard-page">







        <div className="dashboard-container">







          <div className="dashboard-error">







            <div className="dashboard-error-icon">







              ⚠️







            </div>















            <h2>







              Unable to load dashboard







            </h2>















            <p>{error}</p>















            {!isAuthenticated && (







              <Link







                to="/login"







                className="dashboard-button"







              >







                Go to Login







              </Link>







            )}







          </div>







        </div>







      </main>







    );







  }















  const dashboardUser =







    dashboard?.user || user || {};















  const profile =







    dashboard?.profile || {};















  const statistics =







    dashboard?.statistics || {};















  const recentApplications =







    dashboard?.recentApplications || [];















  const notifications =







    dashboard?.notifications || [];















  return (







    <main className="dashboard-page">







      <div className="dashboard-container">















        {/* Dashboard Header */}







        <section className="dashboard-header">







          <div>







            <p className="dashboard-eyebrow">







              Student Portal







            </p>















            <h1>







              Welcome,{' '}







              {dashboardUser.name || 'Student'} 👋







            </h1>















            <p>







              Track your placement journey, applications,







              skills, and opportunities from one place.







            </p>







          </div>















          <Link







            to="/jobs"







            className="dashboard-button"







          >







            Browse Jobs







          </Link>







        </section>















        {/* Statistics */}







        <section className="dashboard-stats">















          <div className="stat-card">







            <span>







              Profile Completion







            </span>















            <strong>







              {statistics.profileCompletion || 0}%







            </strong>







          </div>















          <div className="stat-card">







            <span>Skills</span>















            <strong>







              {statistics.skillsCount || 0}







            </strong>







          </div>















          <div className="stat-card">







            <span>My Applications</span>















            <strong>







              {statistics.applicationCount || 0}







            </strong>







          </div>















          <div className="stat-card">







            <span>Shortlisted</span>















            <strong>







              {statistics.shortlistedCount || 0}







            </strong>







          </div>















          <div className="stat-card">







            <span>Upcoming Interviews</span>















            <strong>







              {statistics.interviewCount || 0}







            </strong>







          </div>















          <div className="stat-card">







            <span>Selected</span>















            <strong>







              {statistics.selectedCount || 0}







            </strong>







          </div>















        </section>















        {/* Saved Jobs Highlight */}







        <section className="dashboard-section">







          <div







            className="saved-jobs-dashboard-card"







            style={{







              background:







                'linear-gradient(135deg, #eef2ff 0%, #f8fafc 100%)',







              border:







                '1px solid rgba(99, 102, 241, 0.18)',







              borderRadius:







                'var(--radius-xl)',







              padding: '1.5rem',







              display: 'flex',







              alignItems: 'center',







              justifyContent: 'space-between',







              gap: '1.5rem',







              flexWrap: 'wrap',







              boxShadow:







                'var(--shadow-sm)',







            }}







          >







            <div







              style={{







                display: 'flex',







                alignItems: 'center',







                gap: '1rem',







              }}







            >







              <div







                style={{







                  width: '58px',







                  height: '58px',







                  borderRadius: '18px',







                  background: '#ffffff',







                  display: 'flex',







                  alignItems: 'center',







                  justifyContent: 'center',







                  fontSize: '26px',







                  boxShadow:







                    '0 8px 24px rgba(79, 70, 229, 0.10)',







                }}







              >







                🔖







              </div>















              <div>







                <p







                  style={{







                    margin: 0,







                    color: 'var(--text-muted)',







                    fontSize: '0.82rem',







                    fontWeight: 700,







                    textTransform: 'uppercase',







                    letterSpacing: '0.05em',







                  }}







                >







                  Your Shortlist







                </p>















                <h2







                  style={{







                    margin:







                      '0.25rem 0 0.35rem',







                    fontSize: '1.35rem',







                  }}







                >







                  {savedJobsLoading







                    ? 'Loading...'







                    : `${savedJobCount} Saved ${savedJobCount === 1







                      ? 'Job'







                      : 'Jobs'







                    }`}







                </h2>















                <p







                  style={{







                    margin: 0,







                    color: 'var(--text-muted)',







                  }}







                >







                  Keep interesting opportunities







                  ready for your next application.







                </p>







              </div>







            </div>















            <Link







              to="/saved-jobs"







              className="dashboard-button"







            >







              🔖 View Saved Jobs →







            </Link>







          </div>







        </section>















        {/* Interview Highlight */}



        <section className="dashboard-section">



          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-xl)', padding: '1.5rem', background: 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 55%, #ecfeff 100%)', border: '1px solid rgba(99, 102, 241, 0.18)', boxShadow: 'var(--shadow-sm)' }}>



            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>



              <div style={{ flex: '1 1 420px' }}>



                <p className="dashboard-eyebrow" style={{ marginBottom: '0.35rem' }}>Interview Journey</p>



                <h2 style={{ margin: 0 }}>Your Interviews 📅</h2>



                {nextInterview ? (



                  <>



                    <p style={{ color: 'var(--text-muted)', margin: '0.55rem 0 1rem' }}>Your next interview is scheduled. Review the details and be ready on time.</p>



                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>



                      <div style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: '14px', padding: '0.85rem' }}><span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Role</span><strong style={{ display: 'block', marginTop: '0.25rem' }}>{nextInterview.jobId?.title || 'Interview'}</strong></div>



                      <div style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: '14px', padding: '0.85rem' }}><span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>When</span><strong style={{ display: 'block', marginTop: '0.25rem' }}>{getInterviewDateTime(nextInterview)?.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })} · {nextInterview.startTime}</strong></div>



                      <div style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: '14px', padding: '0.85rem' }}><span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Format</span><strong style={{ display: 'block', marginTop: '0.25rem' }}>{nextInterview.interviewType === 'online' ? '💻 Online' : '📍 Offline'}</strong></div>



                    </div>



                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}><span style={{ background: '#fff', border: '1px solid rgba(99,102,241,0.18)', borderRadius: '999px', padding: '0.5rem 0.8rem', fontWeight: 800 }}>⏳ {interviewCountdown || 'Calculating...'}</span>{nextInterview.interviewerName && <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Interviewer: {nextInterview.interviewerName}</span>}</div>



                  </>



                ) : (<p style={{ color: 'var(--text-muted)', margin: '0.55rem 0 0' }}>No upcoming interviews right now. Scheduled interviews will appear here automatically.</p>)}



              </div>



              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', minWidth: '190px' }}>



                {nextInterview?.interviewType === 'online' && nextInterview.meetingLink && <a href={nextInterview.meetingLink} target="_blank" rel="noreferrer" className="dashboard-button" style={{ textAlign: 'center', textDecoration: 'none' }}>🎥 Join Meeting</a>}



                <Link to="/interviews" className="dashboard-button" style={{ textAlign: 'center', textDecoration: 'none' }}>{nextInterview ? 'View Interview Details →' : 'View Interviews →'}</Link>



              </div>



            </div>



          </div>



        </section>







        {/* Smart Job Recommendations */}







        <section className="dashboard-section smart-match-section">















          <div className="section-heading">







            <div>







              <p className="dashboard-eyebrow">







                AI-Powered Matching







              </p>















              <h2>







                Recommended Jobs For You ✨







              </h2>















              <p className="section-description">







                Jobs matched with your skills,







                preferences, eligibility, and profile.







              </p>







            </div>















            <Link







              to="/jobs"







              className="section-link"







            >







              Browse All Jobs →







            </Link>







          </div>















          {recommendationsLoading ? (







            <div className="recommendation-loading">







              <div className="recommendation-loading-icon">







                🔎







              </div>















              <h3>







                Finding your best matches...







              </h3>















              <p>







                We are comparing your profile with







                available opportunities.







              </p>







            </div>







          ) : recommendationError ? (







            <div className="empty-state">







              <div className="empty-icon">







                ⚠️







              </div>















              <h3>







                Recommendations unavailable







              </h3>















              <p>







                {recommendationError}







              </p>















              <Link







                to="/profile"







                className="dashboard-button"







              >







                Complete Profile







              </Link>







            </div>







          ) : recommendations.length > 0 ? (







            <div className="recommendation-grid">















              {recommendations.map(







                (recommendation) => {







                  const job =







                    recommendation.job || {};















                  const isApplied =







                    appliedJobIds.includes(







                      job._id







                    );















                  const isApplying =







                    applyingJobId === job._id;















                  const matchPercentage =







                    recommendation.matchPercentage ||







                    0;















                  return (







                    <article







                      className="recommendation-card"







                      key={job._id}







                    >







                      <div className="recommendation-card-top">















                        <div className="recommendation-company-icon">







                          {String(







                            job.companyName || 'C'







                          )







                            .charAt(0)







                            .toUpperCase()}







                        </div>















                        <div className="recommendation-match">







                          <span







                            className={getMatchClass(







                              matchPercentage







                            )}







                          >







                            {matchPercentage}% Match







                          </span>







                        </div>















                      </div>















                      <div className="recommendation-content">















                        <h3>







                          {job.title ||







                            'Job Opportunity'}







                        </h3>















                        <p className="recommendation-company">







                          {job.companyName ||







                            'Company'}







                        </p>















                        <div className="recommendation-meta">















                          <span>







                            📍{' '}







                            {job.location ||







                              'Not specified'}







                          </span>















                          <span>







                            💼{' '}







                            {job.jobType ||







                              'Not specified'}







                          </span>















                          {job.salary && (







                            <span>







                              💰 {job.salary}







                            </span>







                          )}















                        </div>















                        {recommendation







                          .matchingSkills







                          ?.length > 0 && (







                            <div className="skill-match-block">















                              <strong>







                                Matching Skills







                              </strong>















                              <div className="skill-tags">















                                {recommendation







                                  .matchingSkills







                                  .slice(0, 5)







                                  .map((skill) => (







                                    <span







                                      className="skill-tag matched"







                                      key={skill}







                                    >







                                      ✓ {skill}







                                    </span>







                                  ))}















                              </div>















                            </div>







                          )}















                        {recommendation







                          .missingSkills







                          ?.length > 0 && (







                            <div className="skill-match-block missing">















                              <strong>







                                Skills to Improve







                              </strong>















                              <div className="skill-tags">















                                {recommendation







                                  .missingSkills







                                  .slice(0, 4)







                                  .map((skill) => (







                                    <span







                                      className="skill-tag missing"







                                      key={skill}







                                    >







                                      + {skill}







                                    </span>







                                  ))}















                              </div>















                            </div>







                          )}















                        {recommendation







                          .reasons







                          ?.length > 0 && (







                            <div className="match-reasons">















                              {recommendation







                                .reasons







                                .slice(0, 3)







                                .map((reason) => (







                                  <span







                                    key={reason}







                                  >







                                    ✓ {reason}







                                  </span>







                                ))}















                            </div>







                          )}















                      </div>















                      <div className="recommendation-actions">















                        <Link







                          to={`/jobs/${job._id}`}







                          className="recommendation-view-button"







                        >







                          View Job







                        </Link>















                        <button







                          type="button"







                          className="recommendation-apply-button"







                          disabled={







                            isApplied ||







                            isApplying







                          }







                          onClick={() =>







                            handleApply(







                              job._id







                            )







                          }







                        >







                          {isApplied







                            ? '✓ Applied'







                            : isApplying







                              ? 'Applying...'







                              : 'Apply Now'}







                        </button>















                      </div>







                    </article>







                  );







                }







              )}















            </div>







          ) : (







            <div className="empty-state">







              <div className="empty-icon">







                🎯







              </div>















              <h3>







                No strong job matches yet







              </h3>















              <p>







                Complete your profile and add your







                skills, preferred locations, and job







                types to get personalized







                recommendations.







              </p>















              <Link







                to="/profile"







                className="dashboard-button"







              >







                Improve My Profile







              </Link>







            </div>







          )}















        </section>















        {/* Profile Overview */}







        <section className="dashboard-section">















          <div className="section-heading">







            <div>







              <p className="dashboard-eyebrow">







                Your Profile







              </p>















              <h2>







                Profile Overview







              </h2>







            </div>















            <Link







              to="/profile"







              className="section-link"







            >







              Edit Profile →







            </Link>







          </div>















          <div className="profile-card">















            <div className="profile-info">















              <h3>







                {dashboardUser.name ||







                  'Student'}







              </h3>















              <p>







                {dashboardUser.email ||







                  'No email available'}







              </p>















              <div className="profile-details">















                <span>







                  <strong>College:</strong>{' '}







                  {profile.college ||







                    'Not added'}







                </span>















                <span>







                  <strong>Branch:</strong>{' '}







                  {profile.branch ||







                    'Not added'}







                </span>















                <span>







                  <strong>Graduation:</strong>{' '}







                  {profile.graduationYear ||







                    'Not added'}







                </span>















                <span>







                  <strong>CGPA:</strong>{' '}







                  {profile.cgpa ||







                    'Not added'}







                </span>















              </div>















            </div>















            <div className="completion-circle">















              <strong>







                {statistics.profileCompletion ||







                  0}%







              </strong>















              <span>







                Complete







              </span>















            </div>















          </div>















        </section>















        {/* Skills Overview */}







        <section className="dashboard-section skills-overview-section">















          <div className="section-heading">















            <div>







              <p className="dashboard-eyebrow">







                Skills & Capabilities







              </p>















              <h2>







                Your Skill Set







              </h2>







            </div>















            <Link







              to="/skills"







              className="section-link"







              id="manage-skills-header-link"







            >







              Manage Skills →







            </Link>















          </div>















          <div







            className="skills-overview-card"







            style={{







              background:







                'var(--surface)',







              border:







                '1.5px solid var(--border)',







              borderRadius:







                'var(--radius-xl)',







              padding: '1.5rem',







              boxShadow:







                'var(--shadow-sm)',







              display: 'flex',







              flexDirection: 'column',







              gap: '1.25rem',







            }}







          >















            <div







              style={{







                display: 'flex',







                justifyContent:







                  'space-between',







                alignItems: 'center',







                flexWrap: 'wrap',







                gap: '0.75rem',







              }}







            >















              <div>















                <span







                  style={{







                    fontSize: '0.85rem',







                    color:







                      'var(--text-muted)',







                    fontWeight: 600,







                    textTransform:







                      'uppercase',







                    letterSpacing:







                      '0.05em',







                  }}







                >







                  Verified Skills







                </span>















                <h3







                  style={{







                    fontSize: '1.35rem',







                    fontWeight: 800,







                    color:







                      'var(--text)',







                    marginTop:







                      '0.2rem',







                  }}







                >







                  {Array.isArray(







                    profile.skills







                  )







                    ? profile.skills.length







                    : 0}{' '}







                  skills added







                </h3>















              </div>















              <Link







                to="/skills"







                className="dashboard-button"







                id="manage-skills-btn"







                style={{







                  padding:







                    '0.55rem 1.25rem',







                }}







              >







                ⚙️ Manage Skills







              </Link>















            </div>















            {Array.isArray(







              profile.skills







            ) &&







              profile.skills.length > 0 ? (







              <div







                style={{







                  display: 'flex',







                  flexWrap: 'wrap',







                  gap: '0.5rem',







                  alignItems:







                    'center',







                }}







              >















                {profile.skills







                  .slice(0, 6)







                  .map((skill) => (







                    <span







                      key={skill}







                      style={{







                        background:







                          'var(--primary-bg)',







                        color:







                          'var(--primary-dark)',







                        padding:







                          '0.4rem 0.85rem',







                        borderRadius:







                          '9999px',







                        fontSize:







                          '0.875rem',







                        fontWeight: 600,







                        border:







                          '1px solid #c7d2fe',







                      }}







                    >







                      ✓ {skill}







                    </span>







                  ))}















                {profile.skills.length >







                  6 && (







                    <Link







                      to="/skills"







                      style={{







                        background:







                          'var(--surface-alt)',







                        color:







                          'var(--text-muted)',







                        padding:







                          '0.4rem 0.85rem',







                        borderRadius:







                          '9999px',







                        fontSize:







                          '0.85rem',







                        fontWeight: 700,







                        border:







                          '1px solid var(--border)',







                        textDecoration:







                          'none',







                      }}







                    >







                      +







                      {profile.skills.length -







                        6}{' '}







                      more







                    </Link>







                  )}















              </div>







            ) : (







              <div







                style={{







                  background:







                    'var(--surface-alt)',







                  padding: '1.25rem',







                  borderRadius:







                    'var(--radius-lg)',







                  border:







                    '1px dashed var(--border)',







                  display: 'flex',







                  alignItems:







                    'center',







                  justifyContent:







                    'space-between',







                  flexWrap: 'wrap',







                  gap: '1rem',







                }}







              >















                <div>















                  <strong







                    style={{







                      color:







                        'var(--text)',







                      display:







                        'block',







                    }}







                  >







                    No skills added yet







                  </strong>















                  <p







                    style={{







                      color:







                        'var(--text-muted)',







                      fontSize:







                        '0.875rem',







                      margin: 0,







                    }}







                  >







                    Add your technical skills







                    to unlock smart job







                    recommendations and higher







                    match scores.







                  </p>















                </div>















                <Link







                  to="/skills"







                  className="dashboard-button"







                  style={{







                    padding:







                      '0.45rem 1rem',







                    fontSize:







                      '0.85rem',







                  }}







                >







                  + Add Skills Now







                </Link>















              </div>







            )}















          </div>















        </section>















        {/* Quick Actions */}







        <section className="dashboard-section">















          <div className="section-heading">















            <div>







              <p className="dashboard-eyebrow">







                Quick Actions







              </p>















              <h2>







                Continue Your Placement Journey







              </h2>







            </div>















          </div>















          <div className="quick-actions">















            <Link







              to="/profile"







              className="action-card"







            >







              <span className="action-icon">







                👤







              </span>















              <div>







                <h3>







                  Complete Profile







                </h3>















                <p>







                  Add your academic and







                  personal information.







                </p>







              </div>







            </Link>















            <Link







              to="/jobs"







              className="action-card"







            >







              <span className="action-icon">







                💼







              </span>















              <div>







                <h3>







                  Find Jobs







                </h3>















                <p>







                  Explore available placement







                  opportunities.







                </p>







              </div>







            </Link>















            <Link







              to="/saved-jobs"







              className="action-card"







            >







              <span className="action-icon">







                🔖







              </span>















              <div>







                <h3>







                  Saved Jobs







                </h3>















                <p>







                  {savedJobsLoading







                    ? 'Loading your saved opportunities...'







                    : savedJobCount > 0







                      ? `${savedJobCount} ${savedJobCount === 1







                        ? 'job'







                        : 'jobs'







                      } saved for later.`







                      : 'Save interesting jobs and come back to them later.'}







                </p>







              </div>







            </Link>















            <Link



              to="/interviews"



              className="action-card"



            >



              <span className="action-icon">📅</span>



              <div>



                <h3>My Interviews</h3>



                <p>



                  {interviewCount > 0



                    ? `${interviewCount} upcoming ${interviewCount === 1 ? 'interview' : 'interviews'}. View details and meeting information.`



                    : 'View your upcoming interviews, meeting links, locations and history.'}



                </p>



              </div>



            </Link>







            <Link to="/resume" className="action-card">

              <span className="action-icon">📄</span>

              <div>

                <h3>Resume Management</h3>

                <p>{resume ? 'Review, replace or download your resume.' : 'Upload your resume for placement applications.'}</p>

              </div>

            </Link>



            <Link







              to="/skills"







              className="action-card"







            >







              <span className="action-icon">







                🧠







              </span>















              <div>







                <h3>







                  Improve Skills







                </h3>















                <p>







                  Build the skills needed for







                  your target roles.







                </p>







              </div>







            </Link>















          </div>















        </section>















        {/* Recent Applications */}







        <section className="dashboard-section">















          <div className="section-heading">















            <div>







              <p className="dashboard-eyebrow">







                Applications







              </p>















              <h2>







                Recent Applications







              </h2>







            </div>















          </div>















          {recentApplications.length >







            0 ? (







            <div className="application-list">















              {recentApplications.map(







                (application) => (







                  <div







                    className="application-card"







                    key={application._id}







                  >















                    <div>















                      <h3>







                        {application







                          .jobId?.title ||







                          'Job Opportunity'}







                      </h3>















                      <p>







                        Applied on{' '}







                        {application.appliedAt







                          ? new Date(







                            application.appliedAt







                          ).toLocaleDateString()







                          : 'N/A'}







                      </p>















                    </div>















                    <span className="application-status">







                      {application.status ||







                        'Applied'}







                    </span>















                  </div>







                )







              )}















            </div>







          ) : (







            <div className="empty-state">















              <div className="empty-icon">







                📄







              </div>















              <h3>







                No applications yet







              </h3>















              <p>







                Start exploring jobs and apply







                to opportunities that match







                your skills.







              </p>















              <Link







                to="/jobs"







                className="dashboard-button"







              >







                Explore Jobs







              </Link>















            </div>







          )}















        </section>















        {/* Notifications */}







        <section className="dashboard-section">















          <div className="section-heading">















            <div>







              <p className="dashboard-eyebrow">







                Updates







              </p>















              <h2>







                Notifications







              </h2>







            </div>















          </div>















          {notifications.length > 0 ? (







            <div className="notification-list">















              {notifications.map(







                (notification) => (







                  <div







                    className="notification-card"







                    key={notification._id}







                  >















                    <div className="notification-icon">







                      🔔







                    </div>















                    <div>















                      <h3>







                        {notification.title}







                      </h3>















                      <p>







                        {notification.message}







                      </p>















                    </div>















                  </div>







                )







              )}















            </div>







          ) : (







            <div className="empty-state compact">















              <div className="empty-icon">







                🔔







              </div>















              <p>







                You don't have any new







                notifications.







              </p>















            </div>







          )}















        </section>















      </div>







    </main>







  );







}















export default StudentDashboard;