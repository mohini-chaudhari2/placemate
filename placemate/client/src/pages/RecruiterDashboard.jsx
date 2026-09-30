import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';



import api from '../services/api';

import { useAuth } from '../context/AuthContext';



const RecruiterDashboard = () => {

  const { user } = useAuth();



  const [jobs, setJobs] = useState([]);

  const [applicationCount, setApplicationCount] = useState(0);

  const [interviews, setInterviews] = useState([]);



  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [interviewLoading, setInterviewLoading] = useState(true);



  const fetchDashboardData = async () => {

    try {

      setLoading(true);

      setInterviewLoading(true);

      setError('');



      const [

        jobsResponse,

        applicationsResponse,

        interviewsResponse,

      ] = await Promise.all([

        api.get('/recruiter/jobs'),

        api.get('/recruiter/applications'),

        api.get('/interviews/recruiter'),

      ]);



      setJobs(jobsResponse.data.jobs || []);



      setApplicationCount(

        applicationsResponse.data.count ||

        applicationsResponse.data.applications?.length ||

        0

      );



      setInterviews(

        interviewsResponse.data.interviews || []

      );

    } catch (err) {

      console.error(

        'Failed to load recruiter dashboard:',

        err

      );



      setError(

        err.response?.data?.message ||

        'Unable to load recruiter dashboard.'

      );

    } finally {

      setLoading(false);

      setInterviewLoading(false);

    }

  };



  useEffect(() => {

    fetchDashboardData();

  }, []);



  const openJobs = jobs.filter(

    (job) => job.status === 'open'

  ).length;



  const closedJobs = jobs.filter(

    (job) => job.status === 'closed'

  ).length;



  const draftJobs = jobs.filter(

    (job) => job.status === 'draft'

  ).length;



  const now = new Date();



  const activeInterviews = interviews.filter(

    (interview) =>

      interview.status !== 'Cancelled' &&

      interview.status !== 'Completed'

  );



  const upcomingInterviews = activeInterviews

    .filter((interview) => {

      if (!interview.scheduledDate) {

        return false;

      }



      const interviewDate = new Date(

        interview.scheduledDate

      );



      return interviewDate >= now;

    })

    .sort((a, b) => {

      return (

        new Date(a.scheduledDate) -

        new Date(b.scheduledDate)

      );

    });



  const nextInterview = upcomingInterviews[0];



  const formatInterviewDate = (date) => {

    if (!date) {

      return 'Date not available';

    }



    return new Date(date).toLocaleDateString(

      'en-IN',

      {

        day: 'numeric',

        month: 'short',

        year: 'numeric',

      }

    );

  };



  const getStudentName = (interview) => {

    return (

      interview.studentId?.name ||

      interview.student?.name ||

      interview.candidateName ||

      'Candidate'

    );

  };



  const getJobTitle = (interview) => {

    return (

      interview.jobId?.title ||

      interview.job?.title ||

      'Job Interview'

    );

  };



  return (

    <main className="page-wrapper">

      <div className="container recruiter-dashboard">



        {/* Header */}

        <section className="recruiter-dashboard-header">

          <div>

            <span className="section-eyebrow">

              Recruiter Workspace

            </span>



            <h1>

              Welcome, {user?.name || 'Recruiter'} 👋

            </h1>



            <p>

              Manage your job openings, candidates and

              interviews through PlaceMate.

            </p>

          </div>



          <div className="recruiter-header-actions">

            <Link
              to="/recruiter/interviews"
              className="btn btn-secondary"
            >
              📅 Interview Calendar
            </Link>

            <Link

              to="/recruiter/applications"

              className="btn btn-secondary"

            >

              📋 View Applications

            </Link>



            <Link

              to="/recruiter/jobs/new"

              className="btn btn-primary"

            >

              + Post New Job

            </Link>

          </div>

        </section>



        {/* Statistics */}

        <section className="recruiter-stat-grid">



          <div className="recruiter-stat-card">

            <div className="recruiter-stat-icon">

              💼

            </div>



            <div>

              <span>Total Jobs</span>

              <strong>{jobs.length}</strong>

            </div>

          </div>



          <div className="recruiter-stat-card">

            <div className="recruiter-stat-icon">

              🟢

            </div>



            <div>

              <span>Open Jobs</span>

              <strong>{openJobs}</strong>

            </div>

          </div>



          <div className="recruiter-stat-card">

            <div className="recruiter-stat-icon">

              👥

            </div>



            <div>

              <span>Applications</span>

              <strong>{applicationCount}</strong>

            </div>

          </div>



          <div className="recruiter-stat-card">

            <div className="recruiter-stat-icon">

              📅

            </div>



            <div>

              <span>Upcoming Interviews</span>

              <strong>

                {interviewLoading

                  ? '...'

                  : upcomingInterviews.length}

              </strong>

            </div>

          </div>



        </section>



        {/* Interview Management */}

        {!loading && !error && (

          <section className="recruiter-interview-dashboard-card">



            <div className="recruiter-interview-dashboard-header">

              <div>

                <span className="section-eyebrow">

                  Interview Management

                </span>



                <h2>

                  Upcoming Interviews

                </h2>



                <p>

                  Keep track of scheduled candidate

                  interviews and manage your interview

                  schedule.

                </p>

              </div>



              <div className="recruiter-interview-dashboard-actions">
                <Link
                  to="/recruiter/interviews"
                  className="btn btn-secondary"
                >
                  📅 Open Calendar
                </Link>

                <Link

                  to="/recruiter/interviews"

                  className="btn btn-primary"

                >

                  View All Interviews

                </Link>
              </div>

            </div>



            {interviewLoading && (

              <div className="recruiter-interview-dashboard-loading">

                <div className="loading-spinner" />

                <span>

                  Loading interview schedule...

                </span>

              </div>

            )}



            {!interviewLoading &&

              upcomingInterviews.length === 0 && (

                <div className="recruiter-interview-empty">

                  <div className="recruiter-interview-empty-icon">

                    📅

                  </div>



                  <div>

                    <h3>

                      No upcoming interviews

                    </h3>



                    <p>

                      Interviews scheduled with shortlisted

                      candidates will appear here.

                    </p>

                  </div>



                  <Link

                    to="/recruiter/applications"

                    className="btn btn-secondary"

                  >

                    Review Candidates

                  </Link>

                </div>

              )}



            {!interviewLoading &&

              nextInterview && (

                <div className="recruiter-next-interview">



                  <div className="recruiter-next-interview-badge">

                    NEXT INTERVIEW

                  </div>



                  <div className="recruiter-next-interview-content">



                    <div className="recruiter-next-interview-main">

                      <h3>

                        {getJobTitle(nextInterview)}

                      </h3>



                      <p className="recruiter-next-candidate">

                        👤 {getStudentName(nextInterview)}

                      </p>



                      <div className="recruiter-next-interview-meta">



                        <span>

                          📅{' '}

                          {formatInterviewDate(

                            nextInterview.scheduledDate

                          )}

                        </span>



                        {nextInterview.startTime && (

                          <span>

                            🕐 {nextInterview.startTime}

                            {nextInterview.endTime

                              ? ` - ${nextInterview.endTime}`

                              : ''}

                          </span>

                        )}



                        <span>

                          {nextInterview.interviewType ===

                            'online'

                            ? '💻 Online'

                            : '📍 Offline'}

                        </span>



                      </div>

                    </div>



                    <div className="recruiter-next-interview-actions">



                      <span

                        className={`status-badge status-${String(

                          nextInterview.status || 'Scheduled'

                        )

                          .toLowerCase()

                          .replace(/\s+/g, '-')}`}

                      >

                        {nextInterview.status ||

                          'Scheduled'}

                      </span>



                      <Link

                        to={`/recruiter/interviews/${nextInterview._id}`}

                        className="btn btn-outline"

                      >

                        Manage Interview

                      </Link>



                    </div>



                  </div>



                </div>

              )}



            {!interviewLoading &&

              upcomingInterviews.length > 1 && (

                <div className="recruiter-interview-more">

                  <span>

                    +{upcomingInterviews.length - 1}{' '}

                    more upcoming{' '}

                    {upcomingInterviews.length - 1 === 1

                      ? 'interview'

                      : 'interviews'}

                  </span>



                  <Link to="/recruiter/interviews">

                    Open Interview Calendar →

                  </Link>

                </div>

              )}



          </section>

        )}



        {/* Application Management */}

        <section className="recruiter-applications-banner">

          <div className="recruiter-applications-banner-content">

            <div className="recruiter-applications-banner-icon">

              📋

            </div>



            <div>

              <h2>

                Manage Student Applications

              </h2>



              <p>

                Review candidates who applied to your jobs

                and update their application status.

              </p>

            </div>

          </div>



          <Link

            to="/recruiter/applications"

            className="btn btn-primary"

          >

            View Applications

          </Link>

        </section>



        {/* Main content */}

        <section className="recruiter-jobs-section">



          <div className="section-heading-row">

            <div>

              <h2>Your Job Postings</h2>



              <p>

                View and manage jobs posted by your account.

              </p>

            </div>



            <Link

              to="/recruiter/jobs/new"

              className="btn btn-secondary"

            >

              Create Job

            </Link>

          </div>



          {loading && (

            <div className="card recruiter-state-card">

              <div className="loading-spinner" />



              <p>

                Loading your recruiter dashboard...

              </p>

            </div>

          )}



          {!loading && error && (

            <div className="card recruiter-state-card error-state">

              <div className="state-icon">

                ⚠️

              </div>



              <h3>

                Unable to load dashboard

              </h3>



              <p>{error}</p>



              <button

                type="button"

                className="btn btn-primary"

                onClick={fetchDashboardData}

              >

                Try Again

              </button>

            </div>

          )}



          {!loading &&

            !error &&

            jobs.length === 0 && (

              <div className="card recruiter-state-card">

                <div className="empty-state-icon">

                  💼

                </div>



                <h3>

                  No jobs posted yet

                </h3>



                <p>

                  Create your first job posting to start

                  finding suitable candidates.

                </p>



                <Link

                  to="/recruiter/jobs/new"

                  className="btn btn-primary"

                >

                  Post Your First Job

                </Link>

              </div>

            )}



          {!loading &&

            !error &&

            jobs.length > 0 && (

              <div className="recruiter-job-list">



                {jobs.map((job) => (

                  <article

                    className="card recruiter-job-card"

                    key={job._id}

                  >



                    <div className="recruiter-job-main">



                      <div className="recruiter-job-title-row">



                        <div>

                          <h3>

                            {job.title}

                          </h3>



                          <p className="recruiter-company">

                            {job.companyName}

                          </p>

                        </div>



                        <span

                          className={`status-badge status-${job.status}`}

                        >

                          {job.status}

                        </span>



                      </div>



                      <div className="recruiter-job-meta">



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



                      {job.requiredSkills?.length > 0 && (

                        <div className="recruiter-job-skills">



                          {job.requiredSkills

                            .slice(0, 6)

                            .map((skill) => (

                              <span

                                className="skill-chip"

                                key={skill}

                              >

                                {skill}

                              </span>

                            ))}



                          {job.requiredSkills.length > 6 && (

                            <span className="skill-chip">

                              +

                              {job.requiredSkills.length - 6}

                            </span>

                          )}



                        </div>

                      )}



                    </div>



                    <div className="recruiter-job-actions">



                      <Link

                        to={`/recruiter/jobs/${job._id}`}

                        className="btn btn-outline"

                      >

                        Manage

                      </Link>



                      <Link

                        to={`/recruiter/jobs/${job._id}/edit`}

                        className="btn btn-secondary"

                      >

                        Edit

                      </Link>



                    </div>



                  </article>

                ))}



              </div>

            )}



        </section>



      </div>

    </main>

  );

};



export default RecruiterDashboard;