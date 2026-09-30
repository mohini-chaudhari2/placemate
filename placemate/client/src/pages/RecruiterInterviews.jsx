import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import RecruiterInterviewCalendar from './RecruiterInterviewCalendar';

const EMPTY_FORM = {
    scheduledDate: '',
    startTime: '',
    endTime: '',
    meetingLink: '',
    location: '',
    interviewerName: '',
    interviewerEmail: '',
    instructions: '',
    cancellationReason: '',
};

const RecruiterInterviews = () => {
    const { id: interviewId } = useParams();
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [modalType, setModalType] = useState('');
    const [saving, setSaving] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [form, setForm] = useState(EMPTY_FORM);
    const { toast } = useToast();

    const fetchInterviews = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await api.get('/interviews/recruiter');
            setInterviews(response.data?.interviews || []);
        } catch (err) {
            console.error('Failed to load recruiter interviews:', err);
            setError(
                err.response?.data?.message || 'Unable to load interviews.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInterviews();
    }, []);

    useEffect(() => {
        if (!modalType) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && !saving) {
                closeModal();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [modalType, saving]);

    const getInterviewDateTime = (interview) => {
        if (!interview?.scheduledDate) return null;
        const date = new Date(interview.scheduledDate);
        if (Number.isNaN(date.getTime())) return null;

        if (interview.startTime) {
            const [hours, minutes] = interview.startTime.split(':').map(Number);
            if (Number.isFinite(hours) && Number.isFinite(minutes)) {
                date.setHours(hours, minutes, 0, 0);
            }
        }

        return date;
    };

    const upcomingInterviews = useMemo(() => {
        const now = new Date();

        return interviews
            .filter((interview) => {
                if (['Cancelled', 'Completed'].includes(interview.status)) {
                    return false;
                }
                const date = getInterviewDateTime(interview);
                return date ? date >= now : false;
            })
            .sort((a, b) => {
                const first = getInterviewDateTime(a)?.getTime() || 0;
                const second = getInterviewDateTime(b)?.getTime() || 0;
                return first - second;
            });
    }, [interviews]);

    const pastInterviews = useMemo(() => {
        const now = new Date();

        return interviews
            .filter((interview) => {
                const date = getInterviewDateTime(interview);
                if (!date) return true;
                return (
                    ['Cancelled', 'Completed'].includes(interview.status) ||
                    date < now
                );
            })
            .sort((a, b) => {
                const first = getInterviewDateTime(a)?.getTime() || 0;
                const second = getInterviewDateTime(b)?.getTime() || 0;
                return second - first;
            });
    }, [interviews]);

    const selectedRouteInterview = useMemo(() => {
        if (!interviewId) return null;
        return (
            interviews.find(
                (interview) => String(interview._id) === String(interviewId)
            ) || null
        );
    }, [interviews, interviewId]);

    const formatDate = (date) => {
        if (!date) return 'Date not available';
        const parsed = new Date(date);
        if (Number.isNaN(parsed.getTime())) return 'Date not available';

        return parsed.toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const getCandidateName = (interview) =>
        interview?.studentId?.name ||
        interview?.student?.name ||
        interview?.candidateName ||
        'Candidate';

    const getCandidateEmail = (interview) =>
        interview?.studentId?.email ||
        interview?.student?.email ||
        interview?.candidateEmail ||
        '';

    const getJobTitle = (interview) =>
        interview?.jobId?.title || interview?.job?.title || 'Job Interview';

    const getCompanyName = (interview) =>
        interview?.jobId?.companyName ||
        interview?.job?.companyName ||
        '';

    const getStatusClass = (status) =>
        String(status || 'Scheduled').toLowerCase().replace(/\s+/g, '-');

    const openRescheduleModal = (interview) => {
        setSelectedInterview(interview);
        setForm({
            scheduledDate: interview?.scheduledDate
                ? new Date(interview.scheduledDate).toISOString().split('T')[0]
                : '',
            startTime: interview?.startTime || '',
            endTime: interview?.endTime || '',
            meetingLink: interview?.meetingLink || '',
            location: interview?.location || '',
            interviewerName: interview?.interviewerName || '',
            interviewerEmail: interview?.interviewerEmail || '',
            instructions: interview?.instructions || '',
            cancellationReason: '',
        });
        setModalType('reschedule');
    };

    const openCancelModal = (interview) => {
        setSelectedInterview(interview);
        setForm((previous) => ({
            ...previous,
            cancellationReason: '',
        }));
        setModalType('cancel');
    };

    const closeModal = () => {
        if (saving) return;
        setSelectedInterview(null);
        setModalType('');
        setForm(EMPTY_FORM);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
    };

    const handleReschedule = async (event) => {
        event.preventDefault();
        if (!selectedInterview) return;

        if (!form.scheduledDate || !form.startTime || !form.endTime) {
            setError('Date, start time and end time are required.');
            return;
        }

        if (form.endTime <= form.startTime) {
            setError('End time must be later than start time.');
            return;
        }

        if (
            selectedInterview.interviewType === 'online' &&
            !form.meetingLink.trim()
        ) {
            setError('Meeting link is required for an online interview.');
            return;
        }

        if (
            selectedInterview.interviewType === 'offline' &&
            !form.location.trim()
        ) {
            setError('Location is required for an offline interview.');
            return;
        }

        try {
            setSaving(true);
            setError('');

            const response = await api.put(
                `/interviews/${selectedInterview._id}`,
                {
                    scheduledDate: form.scheduledDate,
                    startTime: form.startTime,
                    endTime: form.endTime,
                    meetingLink:
                        selectedInterview.interviewType === 'online'
                            ? form.meetingLink.trim()
                            : '',
                    location:
                        selectedInterview.interviewType === 'offline'
                            ? form.location.trim()
                            : '',
                    interviewerName: form.interviewerName.trim(),
                    interviewerEmail: form.interviewerEmail.trim(),
                    instructions: form.instructions.trim(),
                }
            );

            const updated = response.data?.interview;

            if (updated?._id) {
                setInterviews((previous) =>
                    previous.map((item) =>
                        String(item._id) === String(updated._id) ? updated : item
                    )
                );
            } else {
                await fetchInterviews();
            }

            toast.success('Interview rescheduled successfully.');
            closeModal();
        } catch (err) {
            console.error('Failed to reschedule interview:', err);
            const msg = err.response?.data?.message || 'Unable to reschedule interview.';
            setError(msg);
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = async (event) => {
        event.preventDefault();
        if (!selectedInterview) return;

        if (!form.cancellationReason.trim()) {
            setError('Please provide a cancellation reason.');
            return;
        }

        try {
            setSaving(true);
            setError('');

            const response = await api.put(
                `/interviews/${selectedInterview._id}`,
                {
                    status: 'Cancelled',
                    cancellationReason: form.cancellationReason.trim(),
                }
            );

            const updated = response.data?.interview;

            if (updated?._id) {
                setInterviews((previous) =>
                    previous.map((item) =>
                        String(item._id) === String(updated._id) ? updated : item
                    )
                );
            } else {
                await fetchInterviews();
            }

            toast.success('Interview cancelled successfully.');
            closeModal();
        } catch (err) {
            console.error('Failed to cancel interview:', err);
            const msg = err.response?.data?.message || 'Unable to cancel interview.';
            setError(msg);
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const renderInterviewCard = (interview, isPast = false) => {
        const status = interview.status || 'Scheduled';
        const isOnline = interview.interviewType === 'online';

        return (
            <article className="card recruiter-interview-card" key={interview._id}>
                <div className="recruiter-interview-card-top">
                    <div>
                        <span className="section-eyebrow">
                            {isPast ? 'Interview Record' : 'Upcoming Interview'}
                        </span>
                        <h3>{getJobTitle(interview)}</h3>
                        {getCompanyName(interview) && (
                            <p className="recruiter-interview-company">
                                {getCompanyName(interview)}
                            </p>
                        )}
                    </div>

                    <span className={`status-badge status-${getStatusClass(status)}`}>
                        {status}
                    </span>
                </div>

                <div className="recruiter-interview-candidate">
                    <div className="recruiter-interview-avatar">
                        {getCandidateName(interview).charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <strong>{getCandidateName(interview)}</strong>
                        {getCandidateEmail(interview) && (
                            <span>{getCandidateEmail(interview)}</span>
                        )}
                    </div>
                </div>

                <div className="recruiter-interview-meta-grid">
                    <div>
                        <span>📅 Date</span>
                        <strong>{formatDate(interview.scheduledDate)}</strong>
                    </div>
                    <div>
                        <span>🕐 Time</span>
                        <strong>
                            {interview.startTime || 'Not specified'}
                            {interview.endTime ? ` - ${interview.endTime}` : ''}
                        </strong>
                    </div>
                    <div>
                        <span>{isOnline ? '💻 Type' : '📍 Type'}</span>
                        <strong>{isOnline ? 'Online' : 'Offline'}</strong>
                    </div>
                    <div>
                        <span>👤 Interviewer</span>
                        <strong>{interview.interviewerName || 'Not specified'}</strong>
                    </div>
                </div>

                {isOnline && interview.meetingLink && status !== 'Cancelled' && (
                    <div className="recruiter-interview-meeting-link">
                        <span>🔗 Meeting</span>
                        <a href={interview.meetingLink} target="_blank" rel="noreferrer">
                            Open Meeting Link ↗
                        </a>
                    </div>
                )}

                {!isOnline && interview.location && (
                    <div className="recruiter-interview-meeting-link">
                        <span>📍 Location</span>
                        <strong>{interview.location}</strong>
                    </div>
                )}

                {interview.instructions && (
                    <div className="recruiter-interview-card-notes">
                        <span>Instructions</span>
                        <p>{interview.instructions}</p>
                    </div>
                )}

                {interview.cancellationReason && (
                    <div className="recruiter-interview-cancellation">
                        <span>Cancellation Reason</span>
                        <p>{interview.cancellationReason}</p>
                    </div>
                )}

                <div className="recruiter-interview-card-actions">
                    <Link
                        to={`/recruiter/interviews/${interview._id}`}
                        className="btn btn-secondary"
                    >
                        View Details
                    </Link>

                    {!isPast && !['Cancelled', 'Completed'].includes(status) && (
                        <>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => openRescheduleModal(interview)}
                            >
                                🔄 Reschedule
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline recruiter-cancel-button"
                                onClick={() => openCancelModal(interview)}
                            >
                                ✕ Cancel
                            </button>
                        </>
                    )}

                    {isOnline && interview.meetingLink && status !== 'Cancelled' && (
                        <a
                            href={interview.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-primary"
                        >
                            Join Meeting ↗
                        </a>
                    )}
                </div>
            </article>
        );
    };

    const completedCount = interviews.filter(
        (item) => item.status === 'Completed'
    ).length;
    const cancelledCount = interviews.filter(
        (item) => item.status === 'Cancelled'
    ).length;

    return (
        <main className="page-wrapper">
            <div className="container recruiter-interviews-page">
                <section className="recruiter-interviews-header">
                    <div>
                        <span className="section-eyebrow">Recruiter Workspace</span>
                        <h1>Interview Management</h1>
                        <p>
                            Manage candidate interviews, reschedule meetings and keep
                            candidates informed.
                        </p>
                    </div>

                    <div className="recruiter-interviews-header-actions">
                        <Link to="/dashboard/recruiter" className="btn btn-secondary">
                            ← Dashboard
                        </Link>
                        <Link to="/recruiter/applications" className="btn btn-primary">
                            📋 Applications
                        </Link>
                    </div>
                </section>

                {interviewId ? (
                    <section className="recruiter-interview-detail-page">
                        {loading ? (
                            <div className="card recruiter-interview-state">
                                <div className="loading-spinner" />
                                <p>Loading interview...</p>
                            </div>
                        ) : error ? (
                            <div className="card recruiter-interview-state error-state">
                                <div className="state-icon">⚠️</div>
                                <h3>Unable to load interview</h3>
                                <p>{error}</p>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={fetchInterviews}
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : !selectedRouteInterview ? (
                            <div className="card recruiter-interview-state error-state">
                                <div className="state-icon">⚠️</div>
                                <h3>Interview not found</h3>
                                <p>
                                    This interview does not exist or does not belong to your
                                    account.
                                </p>
                                <Link to="/recruiter/interviews" className="btn btn-primary">
                                    ← Back to Interviews
                                </Link>
                            </div>
                        ) : (
                            <article className="card recruiter-interview-detail-card">
                                <div className="recruiter-interview-detail-top">
                                    <div>
                                        <Link
                                            to="/recruiter/interviews"
                                            className="recruiter-interview-back-link"
                                        >
                                            ← Back to Interview Management
                                        </Link>
                                        <span className="section-eyebrow">Interview Management</span>
                                        <h2>{getJobTitle(selectedRouteInterview)}</h2>
                                        {getCompanyName(selectedRouteInterview) && (
                                            <p className="recruiter-interview-company">
                                                {getCompanyName(selectedRouteInterview)}
                                            </p>
                                        )}
                                    </div>
                                    <span
                                        className={`status-badge status-${getStatusClass(
                                            selectedRouteInterview.status
                                        )}`}
                                    >
                                        {selectedRouteInterview.status || 'Scheduled'}
                                    </span>
                                </div>

                                <div className="recruiter-interview-detail-profile">
                                    <div className="recruiter-interview-avatar">
                                        {getCandidateName(selectedRouteInterview)
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>
                                    <div>
                                        <span className="section-eyebrow">Candidate</span>
                                        <h3>{getCandidateName(selectedRouteInterview)}</h3>
                                        {getCandidateEmail(selectedRouteInterview) && (
                                            <a
                                                href={`mailto:${getCandidateEmail(
                                                    selectedRouteInterview
                                                )}`}
                                            >
                                                {getCandidateEmail(selectedRouteInterview)}
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="recruiter-interview-detail-grid">
                                    <div className="recruiter-interview-detail-panel">
                                        <span>📅 Date</span>
                                        <strong>
                                            {formatDate(selectedRouteInterview.scheduledDate)}
                                        </strong>
                                    </div>
                                    <div className="recruiter-interview-detail-panel">
                                        <span>🕐 Time</span>
                                        <strong>
                                            {selectedRouteInterview.startTime || 'Not specified'}
                                            {selectedRouteInterview.endTime
                                                ? ` - ${selectedRouteInterview.endTime}`
                                                : ''}
                                        </strong>
                                    </div>
                                    <div className="recruiter-interview-detail-panel">
                                        <span>
                                            {selectedRouteInterview.interviewType === 'online'
                                                ? '💻 Type'
                                                : '📍 Type'}
                                        </span>
                                        <strong>
                                            {selectedRouteInterview.interviewType === 'online'
                                                ? 'Online'
                                                : 'Offline'}
                                        </strong>
                                    </div>
                                    <div className="recruiter-interview-detail-panel">
                                        <span>👤 Interviewer</span>
                                        <strong>
                                            {selectedRouteInterview.interviewerName ||
                                                'Not specified'}
                                        </strong>
                                        {selectedRouteInterview.interviewerEmail && (
                                            <a
                                                href={`mailto:${selectedRouteInterview.interviewerEmail}`}
                                            >
                                                {selectedRouteInterview.interviewerEmail}
                                            </a>
                                        )}
                                    </div>
                                    {selectedRouteInterview.interviewType === 'online' ? (
                                        <div className="recruiter-interview-detail-panel">
                                            <span>🔗 Meeting</span>
                                            {selectedRouteInterview.meetingLink ? (
                                                <a
                                                    href={selectedRouteInterview.meetingLink}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="detail-link"
                                                >
                                                    Open Meeting Link ↗
                                                </a>
                                            ) : (
                                                <strong>Meeting link not available</strong>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="recruiter-interview-detail-panel">
                                            <span>📍 Location</span>
                                            <strong>
                                                {selectedRouteInterview.location ||
                                                    'Location not specified'}
                                            </strong>
                                        </div>
                                    )}
                                </div>

                                {selectedRouteInterview.instructions && (
                                    <div className="recruiter-interview-detail-block">
                                        <span>Interview Instructions</span>
                                        <p>{selectedRouteInterview.instructions}</p>
                                    </div>
                                )}

                                {selectedRouteInterview.cancellationReason && (
                                    <div className="recruiter-interview-cancellation">
                                        <span>Cancellation Reason</span>
                                        <p>{selectedRouteInterview.cancellationReason}</p>
                                    </div>
                                )}

                                <div className="recruiter-interview-detail-actions">
                                    <Link
                                        to="/recruiter/applications"
                                        className="btn btn-secondary"
                                    >
                                        📋 Applications
                                    </Link>

                                    {!['Cancelled', 'Completed'].includes(
                                        selectedRouteInterview.status
                                    ) && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary"
                                                    onClick={() =>
                                                        openRescheduleModal(selectedRouteInterview)
                                                    }
                                                >
                                                    🔄 Reschedule
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline recruiter-cancel-button"
                                                    onClick={() => openCancelModal(selectedRouteInterview)}
                                                >
                                                    ✕ Cancel Interview
                                                </button>
                                            </>
                                        )}

                                    {selectedRouteInterview.interviewType === 'online' &&
                                        selectedRouteInterview.meetingLink &&
                                        selectedRouteInterview.status !== 'Cancelled' && (
                                            <a
                                                href={selectedRouteInterview.meetingLink}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="btn btn-primary"
                                            >
                                                Join Meeting ↗
                                            </a>
                                        )}
                                </div>
                            </article>
                        )}
                    </section>
                ) : (
                    <>
                        <section className="recruiter-interview-summary">
                            <div className="recruiter-interview-summary-card">
                                <span>Upcoming</span>
                                <strong>{upcomingInterviews.length}</strong>
                            </div>
                            <div className="recruiter-interview-summary-card">
                                <span>Total</span>
                                <strong>{interviews.length}</strong>
                            </div>
                            <div className="recruiter-interview-summary-card">
                                <span>Completed</span>
                                <strong>{completedCount}</strong>
                            </div>
                            <div className="recruiter-interview-summary-card">
                                <span>Cancelled</span>
                                <strong>{cancelledCount}</strong>
                            </div>
                        </section>

                        {loading && (
                            <div className="card recruiter-interview-state">
                                <div className="loading-spinner" />
                                <p>Loading interview schedule...</p>
                            </div>
                        )}

                        {!loading && error && (
                            <div className="card recruiter-interview-state error-state">
                                <div className="state-icon">⚠️</div>
                                <h3>Unable to load interviews</h3>
                                <p>{error}</p>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={fetchInterviews}
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {!loading && !error && (
                            <>
                                <div
                                    className="recruiter-interview-view-switcher"
                                    role="tablist"
                                    aria-label="Interview view"
                                >
                                    <button
                                        type="button"
                                        role="tab"
                                        aria-selected={viewMode === 'list'}
                                        className={viewMode === 'list' ? 'active' : ''}
                                        onClick={() => setViewMode('list')}
                                    >
                                        ☰ List View
                                    </button>
                                    <button
                                        type="button"
                                        role="tab"
                                        aria-selected={viewMode === 'calendar'}
                                        className={viewMode === 'calendar' ? 'active' : ''}
                                        onClick={() => setViewMode('calendar')}
                                    >
                                        📅 Calendar View
                                    </button>
                                </div>

                                {viewMode === 'calendar' ? (
                                    <section className="recruiter-interview-calendar-section">
                                        <RecruiterInterviewCalendar interviews={interviews} />
                                    </section>
                                ) : (
                                    <>
                                        <section className="recruiter-interview-section">
                                            <div className="section-heading-row">
                                                <div>
                                                    <h2>Upcoming Interviews</h2>
                                                    <p>Interviews that still need your attention.</p>
                                                </div>
                                            </div>

                                            {upcomingInterviews.length === 0 ? (
                                                <div className="card recruiter-interview-empty">
                                                    <div className="empty-state-icon">📅</div>
                                                    <h3>No upcoming interviews</h3>
                                                    <p>
                                                        Shortlist candidates from your applications and
                                                        schedule interviews to see them here.
                                                    </p>
                                                    <Link
                                                        to="/recruiter/applications"
                                                        className="btn btn-primary"
                                                    >
                                                        Review Applications
                                                    </Link>
                                                </div>
                                            ) : (
                                                <div className="recruiter-interview-list">
                                                    {upcomingInterviews.map((interview) =>
                                                        renderInterviewCard(interview, false)
                                                    )}
                                                </div>
                                            )}
                                        </section>

                                        <section className="recruiter-interview-section">
                                            <div className="section-heading-row">
                                                <div>
                                                    <h2>Interview History</h2>
                                                    <p>Completed, cancelled and past interview records.</p>
                                                </div>
                                            </div>

                                            {pastInterviews.length === 0 ? (
                                                <div className="card recruiter-interview-empty compact">
                                                    <div className="empty-state-icon">🗂️</div>
                                                    <h3>No interview history</h3>
                                                    <p>Past interview records will appear here.</p>
                                                </div>
                                            ) : (
                                                <div className="recruiter-interview-list">
                                                    {pastInterviews.map((interview) =>
                                                        renderInterviewCard(interview, true)
                                                    )}
                                                </div>
                                            )}
                                        </section>
                                    </>
                                )}
                            </>
                        )}
                    </>
                )}

                {modalType === 'reschedule' && selectedInterview && (
                    <div
                        className="recruiter-interview-modal-backdrop"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) closeModal();
                        }}
                    >
                        <div
                            className="recruiter-interview-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="reschedule-title"
                        >
                            <div className="recruiter-interview-modal-header">
                                <div>
                                    <span className="section-eyebrow">Interview Update</span>
                                    <h2 id="reschedule-title">Reschedule Interview</h2>
                                </div>
                                <button
                                    type="button"
                                    className="modal-close-button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    aria-label="Close"
                                >
                                    ×
                                </button>
                            </div>

                            <form
                                onSubmit={handleReschedule}
                                className="recruiter-interview-modal-form"
                            >
                                <div className="modal-interview-context">
                                    <strong>{getJobTitle(selectedInterview)}</strong>
                                    <span>
                                        Candidate: {getCandidateName(selectedInterview)}
                                    </span>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label htmlFor="scheduledDate">Date</label>
                                        <input
                                            id="scheduledDate"
                                            name="scheduledDate"
                                            type="date"
                                            value={form.scheduledDate}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="startTime">Start Time</label>
                                        <input
                                            id="startTime"
                                            name="startTime"
                                            type="time"
                                            value={form.startTime}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="endTime">End Time</label>
                                        <input
                                            id="endTime"
                                            name="endTime"
                                            type="time"
                                            value={form.endTime}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="interviewerName">Interviewer</label>
                                        <input
                                            id="interviewerName"
                                            name="interviewerName"
                                            type="text"
                                            value={form.interviewerName}
                                            onChange={handleChange}
                                            placeholder="Interviewer name"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="interviewerEmail">Interviewer Email</label>
                                        <input
                                            id="interviewerEmail"
                                            name="interviewerEmail"
                                            type="email"
                                            value={form.interviewerEmail}
                                            onChange={handleChange}
                                            placeholder="interviewer@example.com"
                                        />
                                    </div>

                                    {selectedInterview.interviewType === 'online' ? (
                                        <div className="form-group">
                                            <label htmlFor="meetingLink">Meeting Link</label>
                                            <input
                                                id="meetingLink"
                                                name="meetingLink"
                                                type="url"
                                                value={form.meetingLink}
                                                onChange={handleChange}
                                                placeholder="https://meet.google.com/..."
                                                required
                                            />
                                        </div>
                                    ) : (
                                        <div className="form-group">
                                            <label htmlFor="location">Location</label>
                                            <input
                                                id="location"
                                                name="location"
                                                type="text"
                                                value={form.location}
                                                onChange={handleChange}
                                                placeholder="Interview venue"
                                                required
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="instructions">Instructions</label>
                                    <textarea
                                        id="instructions"
                                        name="instructions"
                                        rows="4"
                                        value={form.instructions}
                                        onChange={handleChange}
                                        placeholder="Add preparation instructions for the candidate..."
                                    />
                                </div>

                                <div className="recruiter-interview-modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={closeModal}
                                        disabled={saving}
                                    >
                                        Keep Current Time
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : 'Save New Schedule'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {modalType === 'cancel' && selectedInterview && (
                    <div
                        className="recruiter-interview-modal-backdrop"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) closeModal();
                        }}
                    >
                        <div
                            className="recruiter-interview-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="cancel-title"
                        >
                            <div className="recruiter-interview-modal-header">
                                <div>
                                    <span className="section-eyebrow">Interview Update</span>
                                    <h2 id="cancel-title">Cancel Interview</h2>
                                </div>
                                <button
                                    type="button"
                                    className="modal-close-button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    aria-label="Close"
                                >
                                    ×
                                </button>
                            </div>

                            <form
                                onSubmit={handleCancel}
                                className="recruiter-interview-modal-form"
                            >
                                <div className="modal-interview-context">
                                    <strong>{getJobTitle(selectedInterview)}</strong>
                                    <span>
                                        Candidate: {getCandidateName(selectedInterview)}
                                    </span>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="cancellationReason">
                                        Cancellation Reason
                                    </label>
                                    <textarea
                                        id="cancellationReason"
                                        name="cancellationReason"
                                        rows="5"
                                        value={form.cancellationReason}
                                        onChange={handleChange}
                                        placeholder="Tell the candidate why this interview is being cancelled..."
                                        required
                                    />
                                </div>

                                <div className="recruiter-cancel-warning">
                                    <span>⚠️</span>
                                    <p>The candidate will be notified about this cancellation.</p>
                                </div>

                                <div className="recruiter-interview-modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={closeModal}
                                        disabled={saving}
                                    >
                                        Keep Interview
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-danger"
                                        disabled={saving}
                                    >
                                        {saving ? 'Cancelling...' : 'Cancel Interview'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};

export default RecruiterInterviews;
