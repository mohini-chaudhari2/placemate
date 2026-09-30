import { useEffect, useMemo, useState } from 'react';

import { Link } from 'react-router-dom';

import api from '../services/api';
import { useToast } from '../context/ToastContext';

import './RecruiterApplications.css';



const STATUS_CONFIG = {

  Applied: {

    label: 'Applied',

    icon: '📩',

  },

  Shortlisted: {

    label: 'Shortlisted',

    icon: '⭐',

  },

  Interview: {

    label: 'Interview',

    icon: '🎯',

  },

  Selected: {

    label: 'Selected',

    icon: '🎉',

  },

  Rejected: {

    label: 'Rejected',

    icon: '✕',

  },

};



const RecruiterApplications = () => {

  const [applications, setApplications] = useState([]);
  const { toast } = useToast();



  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [success, setSuccess] = useState('');



  const [search, setSearch] = useState('');

  const [statusFilter, setStatusFilter] = useState('All');



  const [updatingId, setUpdatingId] = useState('');

  const [profileLoadingId, setProfileLoadingId] = useState('');



  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [candidateModalOpen, setCandidateModalOpen] = useState(false);



  const [statusOptions, setStatusOptions] = useState({});

  const [notes, setNotes] = useState({});

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleApplication, setScheduleApplication] = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    interviewType: 'online', scheduledDate: '', startTime: '', endTime: '',
    meetingLink: '', location: '', interviewerName: '', interviewerEmail: '', instructions: '',
  });



  const fetchApplications = async () => {

    try {

      setLoading(true);

      setError('');



      const response = await api.get('/recruiter/applications');



      const loadedApplications =

        response.data.applications || [];



      setApplications(loadedApplications);



      const initialNotes = {};



      loadedApplications.forEach((application) => {

        initialNotes[application._id] =

          application.recruiterNote || '';

      });



      setNotes(initialNotes);



      /*

        Fetch valid next statuses for each application.

        This keeps the UI aligned with backend workflow rules.

      */

      const optionsMap = {};



      await Promise.all(

        loadedApplications.map(async (application) => {

          try {

            const response = await api.get(

              `/recruiter/applications/${application._id}/status-options`

            );



            optionsMap[application._id] =

              response.data.availableStatuses || [];

          } catch (statusError) {

            console.error(

              'Failed to load status options:',

              statusError

            );



            optionsMap[application._id] = [];

          }

        })

      );



      setStatusOptions(optionsMap);

    } catch (err) {

      console.error(

        'Failed to load recruiter applications:',

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

  }, []);



  /*

    Automatically clear temporary success messages.

  */

  useEffect(() => {

    if (!success) return;



    const timer = setTimeout(() => {

      setSuccess('');

    }, 3500);



    return () => clearTimeout(timer);

  }, [success]);



  const updateStatus = async (

    applicationId,

    status

  ) => {

    if (!status) return;



    const application = applications.find(

      (item) => item._id === applicationId

    );



    if (!application) return;



    const previousStatus = application.status;



    try {

      setUpdatingId(applicationId);

      setError('');

      setSuccess('');



      const response = await api.put(

        `/recruiter/applications/${applicationId}/status`,

        {

          status,

          recruiterNote:

            notes[applicationId] || '',

        }

      );



      const updatedApplication =

        response.data.application;



      setApplications((currentApplications) =>

        currentApplications.map((item) =>

          item._id === applicationId

            ? updatedApplication

            : item

        )

      );



      /*

        Refresh valid next statuses after the transition.

      */

      try {

        const optionsResponse = await api.get(

          `/recruiter/applications/${applicationId}/status-options`

        );



        setStatusOptions((current) => ({

          ...current,

          [applicationId]:

            optionsResponse.data.availableStatuses || [],

        }));

      } catch (optionsError) {

        console.error(

          'Failed to refresh status options:',

          optionsError

        );

      }



      const msg = response.data.statusChanged
          ? `Application moved from ${previousStatus} to ${status}.`
          : 'Application details updated.';
      setSuccess(msg);
      toast.success(msg);

    } catch (err) {

      console.error(

        'Failed to update application status:',

        err

      );



      const msg = err.response?.data?.message || 'Unable to update application status.';
      setError(msg);
      toast.error(msg);

    } finally {

      setUpdatingId('');

    }

  };



  const saveNote = async (applicationId) => {

    const application = applications.find(

      (item) => item._id === applicationId

    );



    if (!application) return;



    try {

      setUpdatingId(applicationId);

      setError('');

      setSuccess('');



      const response = await api.put(

        `/recruiter/applications/${applicationId}/status`,

        {

          status: application.status,

          recruiterNote:

            notes[applicationId] || '',

        }

      );



      setApplications((currentApplications) =>

        currentApplications.map((item) =>

          item._id === applicationId

            ? response.data.application

            : item

        )

      );



      setSuccess('Recruiter note saved successfully.');
      toast.success('Recruiter note saved successfully.');

    } catch (err) {

      console.error(

        'Failed to save recruiter note:',

        err

      );



      const msg = err.response?.data?.message || 'Unable to save recruiter note.';
      setError(msg);
      toast.error(msg);

    } finally {

      setUpdatingId('');

    }

  };



  const openCandidateProfile = async (

    applicationId

  ) => {

    try {

      setProfileLoadingId(applicationId);

      setError('');



      const response = await api.get(

        `/recruiter/applications/${applicationId}/candidate`

      );



      setSelectedCandidate(response.data);

      setCandidateModalOpen(true);

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

      setProfileLoadingId('');

    }

  };



  const closeCandidateModal = () => {

    setCandidateModalOpen(false);

    setSelectedCandidate(null);

  };



  useEffect(() => {

    if (!candidateModalOpen) return;



    const handleEscape = (event) => {

      if (event.key === 'Escape') {

        closeCandidateModal();

      }

    };



    document.addEventListener(

      'keydown',

      handleEscape

    );



    document.body.style.overflow = 'hidden';



    return () => {

      document.removeEventListener(

        'keydown',

        handleEscape

      );



      document.body.style.overflow = '';

    };

  }, [candidateModalOpen]);



  const openScheduleInterview = (application) => {
    setScheduleApplication(application);
    setScheduleForm({ interviewType: 'online', scheduledDate: '', startTime: '', endTime: '', meetingLink: '', location: '', interviewerName: '', interviewerEmail: '', instructions: '' });
    setError(''); setSuccess(''); setScheduleModalOpen(true);
  };

  const closeScheduleModal = () => {
    if (scheduleLoading) return;
    setScheduleModalOpen(false); setScheduleApplication(null);
  };

  const updateScheduleField = (field, value) => setScheduleForm((current) => ({ ...current, [field]: value }));

  const submitScheduleInterview = async (event) => {
    event.preventDefault();
    if (!scheduleApplication) return;
    if (!scheduleForm.scheduledDate || !scheduleForm.startTime || !scheduleForm.endTime || !scheduleForm.interviewerName.trim()) {
      setError('Please complete the required interview details.'); return;
    }
    if (scheduleForm.startTime >= scheduleForm.endTime) { setError('End time must be after start time.'); return; }
    if (scheduleForm.interviewType === 'online' && !scheduleForm.meetingLink.trim()) { setError('Please enter a meeting link for an online interview.'); return; }
    if (scheduleForm.interviewType === 'offline' && !scheduleForm.location.trim()) { setError('Please enter the interview location.'); return; }
    try {
      setScheduleLoading(true); setError(''); setSuccess('');
      const response = await api.post('/interviews', {
        applicationId: scheduleApplication._id, ...scheduleForm,
        meetingLink: scheduleForm.interviewType === 'online' ? scheduleForm.meetingLink.trim() : '',
        location: scheduleForm.interviewType === 'offline' ? scheduleForm.location.trim() : '',
        interviewerName: scheduleForm.interviewerName.trim(), interviewerEmail: scheduleForm.interviewerEmail.trim(), instructions: scheduleForm.instructions.trim(),
      });
      setApplications((current) => current.map((item) => item._id === scheduleApplication._id ? { ...item, status: 'Interview', interview: response.data.interview } : item));
      setScheduleModalOpen(false); setScheduleApplication(null);
      setSuccess('Interview scheduled successfully. The candidate has been notified.');
      toast.success('Interview scheduled successfully. The candidate has been notified.');
    } catch (err) {
      console.error('Failed to schedule interview:', err);
      const msg = err.response?.data?.message || 'Unable to schedule interview.';
      setError(msg);
      toast.error(msg);
    } finally { setScheduleLoading(false); }
  };

  useEffect(() => {
    if (!scheduleModalOpen) return;
    const handleEscape = (event) => { if (event.key === 'Escape') closeScheduleModal(); };
    document.addEventListener('keydown', handleEscape); document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleEscape); document.body.style.overflow = ''; };
  }, [scheduleModalOpen, scheduleLoading]);

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



  const filteredApplications = useMemo(() => {

    const normalizedSearch =

      search.trim().toLowerCase();



    return applications.filter((application) => {

      const student = application.studentId;

      const job = application.jobId;



      const matchesStatus =

        statusFilter === 'All' ||

        application.status === statusFilter;



      if (!matchesStatus) return false;



      if (!normalizedSearch) return true;



      const searchableText = [

        student?.name,

        student?.email,

        job?.title,

        job?.companyName,

        job?.location,

      ]

        .filter(Boolean)

        .join(' ')

        .toLowerCase();



      return searchableText.includes(

        normalizedSearch

      );

    });

  }, [

    applications,

    search,

    statusFilter,

  ]);



  const statusCounts = useMemo(() => {

    return {

      All: applications.length,



      Applied: applications.filter(

        (item) => item.status === 'Applied'

      ).length,



      Shortlisted: applications.filter(

        (item) => item.status === 'Shortlisted'

      ).length,



      Interview: applications.filter(

        (item) => item.status === 'Interview'

      ).length,



      Selected: applications.filter(

        (item) => item.status === 'Selected'

      ).length,



      Rejected: applications.filter(

        (item) => item.status === 'Rejected'

      ).length,

    };

  }, [applications]);



  if (loading) {

    return (

      <div className="page-container">

        <div className="page-loading">

          <div className="loading-spinner"></div>

          <p>Loading applications...</p>

        </div>

      </div>

    );

  }



  return (

    <div className="page-container recruiter-applications-page">

      {/* =================================================

          HEADER

          ================================================= */}



      <div className="applications-header">

        <div>

          <span className="section-eyebrow">

            RECRUITER PORTAL

          </span>



          <h1>Candidate Applications</h1>



          <p>

            Review candidates, track their hiring stage,

            and manage your recruitment workflow.

          </p>

        </div>



        <Link

          to="/dashboard/recruiter"

          className="btn btn-secondary"

        >

          ← Dashboard

        </Link>

      </div>



      {/* =================================================

          FEEDBACK

          ================================================= */}



      {error && (

        <div className="application-error">

          ⚠️ {error}

        </div>

      )}



      {success && (

        <div className="application-success">

          ✓ {success}

        </div>

      )}



      {/* =================================================

          STATUS SUMMARY

          ================================================= */}



      {applications.length > 0 && (

        <div className="application-status-summary">

          {Object.keys(STATUS_CONFIG).map(

            (status) => (

              <button

                key={status}

                type="button"

                className={`application-summary-card ${statusFilter === status

                  ? 'active'

                  : ''

                  }`}

                onClick={() =>

                  setStatusFilter(

                    statusFilter === status

                      ? 'All'

                      : status

                  )

                }

              >

                <span className="application-summary-icon">

                  {STATUS_CONFIG[status].icon}

                </span>



                <span className="application-summary-content">

                  <strong>

                    {statusCounts[status]}

                  </strong>



                  <span>

                    {STATUS_CONFIG[status].label}

                  </span>

                </span>

              </button>

            )

          )}

        </div>

      )}



      {/* =================================================

          SEARCH + FILTERS

          ================================================= */}



      {applications.length > 0 && (

        <div className="applications-toolbar">

          <div className="applications-search">

            <span>🔎</span>



            <input

              type="text"

              value={search}

              onChange={(event) =>

                setSearch(event.target.value)

              }

              placeholder="Search candidate, email, job or company..."

              aria-label="Search applications"

            />

          </div>



          <select

            value={statusFilter}

            onChange={(event) =>

              setStatusFilter(event.target.value)

            }

            className="application-filter-select"

            aria-label="Filter applications by status"

          >

            <option value="All">

              All Statuses ({statusCounts.All})

            </option>



            {Object.keys(STATUS_CONFIG).map(

              (status) => (

                <option

                  key={status}

                  value={status}

                >

                  {status} ({statusCounts[status]})

                </option>

              )

            )}

          </select>



          {(search || statusFilter !== 'All') && (

            <button

              type="button"

              className="btn btn-secondary"

              onClick={() => {

                setSearch('');

                setStatusFilter('All');

              }}

            >

              Clear Filters

            </button>

          )}

        </div>

      )}



      {/* =================================================

          EMPTY STATE

          ================================================= */}



      {!error && applications.length === 0 && (

        <div className="applications-empty">

          <div className="applications-empty-icon">

            👥

          </div>



          <h2>No applications yet</h2>



          <p>

            Applications from students will appear

            here when they apply to your jobs.

          </p>



          <Link

            to="/dashboard/recruiter"

            className="btn btn-primary"

          >

            Manage My Jobs

          </Link>

        </div>

      )}



      {/* =================================================

          NO FILTER RESULTS

          ================================================= */}



      {applications.length > 0 &&

        filteredApplications.length === 0 && (

          <div className="applications-empty">

            <div className="applications-empty-icon">

              🔎

            </div>



            <h2>No matching applications</h2>



            <p>

              Try changing your search or status filter.

            </p>



            <button

              type="button"

              className="btn btn-secondary"

              onClick={() => {

                setSearch('');

                setStatusFilter('All');

              }}

            >

              Reset Filters

            </button>

          </div>

        )}



      {/* =================================================

          APPLICATION LIST

          ================================================= */}



      {filteredApplications.length > 0 && (

        <div className="recruiter-applications-list">

          {filteredApplications.map(

            (application) => {

              const job = application.jobId;

              const student =

                application.studentId;



              if (!job) return null;



              const nextStatuses =

                statusOptions[

                application._id

                ] || [];



              const isFinalStatus =

                nextStatuses.length === 0;



              return (

                <div

                  key={application._id}

                  className="recruiter-application-card"

                >

                  {/* TOP */}

                  <div className="recruiter-application-top">

                    <div className="candidate-avatar">

                      {student?.name

                        ?.charAt(0)

                        ?.toUpperCase() || 'S'}

                    </div>



                    <div className="candidate-info">

                      <h2>

                        {student?.name ||

                          'Student Applicant'}

                      </h2>



                      <p>

                        {student?.email ||

                          'Email unavailable'}

                      </p>



                      <div className="candidate-job">

                        Applied for{' '}

                        <strong>

                          {job.title}

                        </strong>

                      </div>

                    </div>



                    <span

                      className={getStatusClass(

                        application.status

                      )}

                    >

                      {application.status}

                    </span>

                  </div>



                  {/* DETAILS */}

                  <div className="recruiter-application-details">

                    <div>

                      <span className="detail-label">

                        Company

                      </span>



                      <strong>

                        {job.companyName}

                      </strong>

                    </div>



                    <div>

                      <span className="detail-label">

                        Location

                      </span>



                      <strong>

                        {job.location ||

                          'Not specified'}

                      </strong>

                    </div>



                    <div>

                      <span className="detail-label">

                        Applied On

                      </span>



                      <strong>

                        {formatDate(

                          application.appliedAt

                        )}

                      </strong>

                    </div>



                    <div>

                      <span className="detail-label">

                        Current Stage

                      </span>



                      <strong>

                        {application.status}

                      </strong>

                    </div>

                  </div>



                  {/* RECRUITER NOTE */}

                  <div className="recruiter-note-section">

                    <label

                      htmlFor={`note-${application._id}`}

                    >

                      Recruiter Note

                    </label>



                    <textarea

                      id={`note-${application._id}`}

                      value={

                        notes[

                        application._id

                        ] || ''

                      }

                      onChange={(event) =>

                        setNotes((current) => ({

                          ...current,

                          [application._id]:

                            event.target.value,

                        }))

                      }

                      placeholder="Add an internal note about this candidate..."

                      rows={3}

                    />



                    <button

                      type="button"

                      className="btn btn-secondary recruiter-note-save"

                      onClick={() =>

                        saveNote(

                          application._id

                        )

                      }

                      disabled={

                        updatingId ===

                        application._id

                      }

                    >

                      {updatingId ===

                        application._id

                        ? 'Saving...'

                        : 'Save Note'}

                    </button>

                  </div>



                  {/* ACTIONS */}

                  <div className="recruiter-application-actions">

                    <button

                      type="button"

                      className="btn btn-primary"

                      onClick={() =>

                        openCandidateProfile(

                          application._id

                        )

                      }

                      disabled={

                        profileLoadingId ===

                        application._id

                      }

                    >

                      {profileLoadingId ===

                        application._id

                        ? 'Loading...'

                        : 'View Candidate'}

                    </button>



                    <Link

                      to={`/jobs/${job._id}`}

                      className="btn btn-secondary"

                    >

                      View Job

                    </Link>



                    {(application.status === 'Shortlisted' || application.status === 'Interview') && (
                      <button type="button" className="btn btn-primary schedule-interview-button" onClick={() => openScheduleInterview(application)}>
                        📅 Schedule Interview
                      </button>
                    )}

                    {!isFinalStatus && (

                      <select

                        value=""

                        onChange={(event) => {

                          const selectedStatus =

                            event.target.value;



                          if (!selectedStatus)

                            return;



                          updateStatus(

                            application._id,

                            selectedStatus

                          );

                        }}

                        disabled={

                          updatingId ===

                          application._id

                        }

                        className="application-status-select"

                      >

                        <option value="">

                          Move to...

                        </option>



                        {nextStatuses.map(

                          (status) => (

                            <option

                              key={status}

                              value={status}

                            >

                              {status}

                            </option>

                          )

                        )}

                      </select>

                    )}



                    {isFinalStatus && (

                      <span className="application-final-status">

                        ✓ Final Status

                      </span>

                    )}



                    {updatingId ===

                      application._id && (

                        <span className="status-updating">

                          Updating...

                        </span>

                      )}

                  </div>

                </div>

              );

            }

          )}

        </div>

      )}



      {/* =================================================
          SCHEDULE INTERVIEW MODAL
          ================================================= */}

      {scheduleModalOpen && scheduleApplication && (
        <div className="schedule-interview-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeScheduleModal(); }}>
          <div className="schedule-interview-modal">
            <div className="schedule-interview-header">
              <div><span className="section-eyebrow">INTERVIEW MANAGEMENT</span><h2>Schedule Interview</h2><p>{scheduleApplication.studentId?.name || 'Candidate'} · {scheduleApplication.jobId?.title || 'Job'}</p></div>
              <button type="button" className="candidate-modal-close" onClick={closeScheduleModal} disabled={scheduleLoading} aria-label="Close schedule interview dialog">×</button>
            </div>
            <form className="schedule-interview-form" onSubmit={submitScheduleInterview}>
              <div className="schedule-type-toggle">
                <button type="button" className={scheduleForm.interviewType === 'online' ? 'active' : ''} onClick={() => updateScheduleField('interviewType', 'online')}>💻 Online</button>
                <button type="button" className={scheduleForm.interviewType === 'offline' ? 'active' : ''} onClick={() => updateScheduleField('interviewType', 'offline')}>📍 Offline</button>
              </div>
              <div className="schedule-form-grid">
                <label><span>Date *</span><input type="date" value={scheduleForm.scheduledDate} min={new Date().toISOString().split('T')[0]} onChange={(event) => updateScheduleField('scheduledDate', event.target.value)} required /></label>
                <label><span>Start Time *</span><input type="time" value={scheduleForm.startTime} onChange={(event) => updateScheduleField('startTime', event.target.value)} required /></label>
                <label><span>End Time *</span><input type="time" value={scheduleForm.endTime} onChange={(event) => updateScheduleField('endTime', event.target.value)} required /></label>
                <label><span>Interviewer Name *</span><input type="text" value={scheduleForm.interviewerName} placeholder="e.g. Priya Sharma" onChange={(event) => updateScheduleField('interviewerName', event.target.value)} required /></label>
                <label><span>Interviewer Email</span><input type="email" value={scheduleForm.interviewerEmail} placeholder="interviewer@company.com" onChange={(event) => updateScheduleField('interviewerEmail', event.target.value)} /></label>
                {scheduleForm.interviewType === 'online' ? <label className="schedule-form-full"><span>Meeting Link *</span><input type="url" value={scheduleForm.meetingLink} placeholder="https://meet.google.com/..." onChange={(event) => updateScheduleField('meetingLink', event.target.value)} required /></label> : <label className="schedule-form-full"><span>Physical Location *</span><input type="text" value={scheduleForm.location} placeholder="Office address / meeting room" onChange={(event) => updateScheduleField('location', event.target.value)} required /></label>}
                <label className="schedule-form-full"><span>Instructions</span><textarea value={scheduleForm.instructions} placeholder="Interview preparation, documents to bring, agenda, etc." rows={4} onChange={(event) => updateScheduleField('instructions', event.target.value)} /></label>
              </div>
              <div className="schedule-interview-footer">
                <button type="button" className="btn btn-secondary" onClick={closeScheduleModal} disabled={scheduleLoading}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={scheduleLoading}>{scheduleLoading ? 'Scheduling...' : '📅 Schedule Interview'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================

          CANDIDATE PROFILE MODAL

          ================================================= */}



      {candidateModalOpen &&

        selectedCandidate && (

          <div

            className="candidate-modal-backdrop"

            onMouseDown={(event) => {

              if (

                event.target ===

                event.currentTarget

              ) {

                closeCandidateModal();

              }

            }}

          >

            <div className="candidate-modal">

              <div className="candidate-modal-header">

                <div>

                  <span className="section-eyebrow">

                    CANDIDATE PROFILE

                  </span>



                  <h2>

                    {selectedCandidate.candidate

                      ?.name ||

                      'Candidate'}

                  </h2>



                  <p>

                    {selectedCandidate.candidate

                      ?.email || ''}

                  </p>

                </div>



                <button

                  type="button"

                  className="candidate-modal-close"

                  onClick={

                    closeCandidateModal

                  }

                  aria-label="Close candidate profile"

                >

                  ×

                </button>

              </div>



              <div className="candidate-modal-body">

                {/* PROFILE */}

                <section className="candidate-profile-section">

                  <h3>Profile</h3>



                  <div className="candidate-profile-grid">

                    <div>

                      <span>Phone</span>

                      <strong>

                        {selectedCandidate

                          .candidate?.phone ||

                          'Not provided'}

                      </strong>

                    </div>



                    <div>

                      <span>College</span>

                      <strong>

                        {selectedCandidate

                          .candidate?.college ||

                          'Not provided'}

                      </strong>

                    </div>



                    <div>

                      <span>Branch</span>

                      <strong>

                        {selectedCandidate

                          .candidate?.branch ||

                          'Not provided'}

                      </strong>

                    </div>



                    <div>

                      <span>Graduation Year</span>

                      <strong>

                        {selectedCandidate

                          .candidate

                          ?.graduationYear ||

                          'Not provided'}

                      </strong>

                    </div>



                    <div>

                      <span>CGPA</span>

                      <strong>

                        {selectedCandidate

                          .candidate?.cgpa ??

                          'Not provided'}

                      </strong>

                    </div>



                    <div>

                      <span>Profile Completion</span>

                      <strong>

                        {selectedCandidate

                          .candidate

                          ?.profileCompletion || 0}

                        %

                      </strong>

                    </div>

                  </div>

                </section>



                {/* SKILLS */}

                <section className="candidate-profile-section">

                  <h3>Skills</h3>



                  <div className="candidate-skills">

                    {selectedCandidate

                      .candidate?.skills

                      ?.length > 0 ? (

                      selectedCandidate.candidate.skills.map(

                        (skill) => (

                          <span

                            key={skill}

                            className="candidate-skill-chip"

                          >

                            {skill}

                          </span>

                        )

                      )

                    ) : (

                      <p>

                        No skills added yet.

                      </p>

                    )}

                  </div>

                </section>



                {/* BIO */}

                <section className="candidate-profile-section">

                  <h3>About Candidate</h3>



                  <p className="candidate-bio">

                    {selectedCandidate

                      .candidate?.bio ||

                      'No bio provided.'}

                  </p>

                </section>



                {/* PREFERENCES */}

                <section className="candidate-profile-section">

                  <h3>Job Preferences</h3>



                  <div className="candidate-preferences">

                    <div>

                      <span>

                        Preferred Locations

                      </span>



                      <strong>

                        {selectedCandidate

                          .candidate

                          ?.preferredLocations

                          ?.length > 0

                          ? selectedCandidate.candidate.preferredLocations.join(

                            ', '

                          )

                          : 'Not specified'}

                      </strong>

                    </div>



                    <div>

                      <span>

                        Preferred Job Types

                      </span>



                      <strong>

                        {selectedCandidate

                          .candidate

                          ?.preferredJobTypes

                          ?.length > 0

                          ? selectedCandidate.candidate.preferredJobTypes.join(

                            ', '

                          )

                          : 'Not specified'}

                      </strong>

                    </div>

                  </div>

                </section>



                {/* APPLICATION */}

                <section className="candidate-profile-section">

                  <h3>Application</h3>



                  <div className="candidate-application-summary">

                    <div>

                      <span>Job</span>



                      <strong>

                        {selectedCandidate

                          .application?.job

                          ?.title ||

                          'N/A'}

                      </strong>

                    </div>



                    <div>

                      <span>Status</span>



                      <strong>

                        {selectedCandidate

                          .application?.status ||

                          'N/A'}

                      </strong>

                    </div>



                    <div>

                      <span>Applied</span>



                      <strong>

                        {formatDate(

                          selectedCandidate

                            .application

                            ?.appliedAt

                        )}

                      </strong>

                    </div>

                  </div>

                </section>



                {/* RESUME */}

                {selectedCandidate.candidate

                  ?.resumeUrl && (

                    <section className="candidate-profile-section">

                      <h3>Resume</h3>



                      <a

                        href={

                          selectedCandidate

                            .candidate

                            .resumeUrl

                        }

                        target="_blank"

                        rel="noreferrer"

                        className="btn btn-primary"

                      >

                        📄 Open Resume

                      </a>

                    </section>

                  )}

              </div>



              <div className="candidate-modal-footer">

                <button

                  type="button"

                  className="btn btn-secondary"

                  onClick={

                    closeCandidateModal

                  }

                >

                  Close

                </button>

              </div>

            </div>

          </div>

        )}

    </div>

  );

};



export default RecruiterApplications;