import { useEffect, useMemo, useState } from 'react';

import { Link } from 'react-router-dom';

import api from '../services/api';
import { useToast } from '../context/ToastContext';

import './StudentInterviews.css';



const STATUS_STYLES = {

    Scheduled: 'student-interview-status scheduled',

    Rescheduled: 'student-interview-status rescheduled',

    Cancelled: 'student-interview-status cancelled',

    Completed: 'student-interview-status completed',

};



function formatDate(date) {

    if (!date) return '—';



    return new Date(date).toLocaleDateString('en-IN', {

        day: 'numeric',

        month: 'short',

        year: 'numeric',

        weekday: 'short',

    });

}



function getInterviewDateTime(interview) {

    if (!interview?.scheduledDate || !interview?.startTime) {

        return null;

    }



    const date = new Date(interview.scheduledDate);

    const [hours, minutes] = interview.startTime.split(':').map(Number);



    date.setHours(hours || 0, minutes || 0, 0, 0);



    return date;

}



function getCountdown(targetDate) {

    if (!targetDate) return null;



    const difference = targetDate.getTime() - Date.now();



    if (difference <= 0) {

        return 'Starting now';

    }



    const totalMinutes = Math.floor(difference / (1000 * 60));

    const days = Math.floor(totalMinutes / (60 * 24));

    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);

    const minutes = totalMinutes % 60;



    if (days > 0) {

        return `${days}d ${hours}h ${minutes}m`;

    }



    if (hours > 0) {

        return `${hours}h ${minutes}m`;

    }



    return `${minutes}m`;

}



function StudentInterviews() {

    const [interviews, setInterviews] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState('');
    const { toast } = useToast();



    const [now, setNow] = useState(new Date());
    const [refreshing, setRefreshing] = useState(false);
    const [copiedLocationId, setCopiedLocationId] = useState(null);



    useEffect(() => {

        fetchInterviews();

    }, []);



    useEffect(() => {

        const timer = setInterval(() => {

            setNow(new Date());

        }, 60000);



        return () => clearInterval(timer);

    }, []);



    const fetchInterviews = async () => {

        try {

            setLoading(true);

            setError('');



            const response = await api.get('/interviews/student');



            setInterviews(response.data?.interviews || []);

        } catch (err) {

            console.error('Failed to fetch interviews:', err);



            setError(

                err.response?.data?.message ||

                'Unable to load your interviews right now.'

            );

        } finally {

            setLoading(false);

        }

    };



    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            await fetchInterviews();
        } finally {
            setRefreshing(false);
        }
    };

    const handleCopyLocation = async (interview) => {
        if (!interview?.location) return;

        try {
            await navigator.clipboard?.writeText(interview.location);
            setCopiedLocationId(interview._id);
            toast.success('Location copied to clipboard!');
            window.setTimeout(() => setCopiedLocationId(null), 1800);
        } catch (err) {
            console.error('Unable to copy location:', err);
            toast.error('Unable to copy location.');
        }
    };

    const handleAddToCalendar = (interview) => {
        const start = getInterviewDateTime(interview);
        if (!start) return;

        const end = new Date(start);
        const [hours, minutes] = (interview.endTime || interview.startTime || '00:00').split(':').map(Number);
        end.setHours(hours || 0, minutes || 0, 0, 0);

        const toCalendarDate = (date) =>
            date.toISOString().replace(/[-:]/g, '').replace(/.\d{3}Z$/, 'Z');

        const title = `${interview.jobId?.title || 'Interview'} - ${interview.jobId?.companyName || 'Company'}`;
        const location = interview.interviewType === 'online'
            ? interview.meetingLink || 'Online'
            : interview.location || '';

        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: title,
            dates: `${toCalendarDate(start)}/${toCalendarDate(end)}`,
            details: interview.instructions || `Interviewer: ${interview.interviewerName || '—'}`,
            location,
        });

        window.open(
            `https://calendar.google.com/calendar/render?${params.toString()}`,
            '_blank',
            'noopener,noreferrer'
        );
    };

    const sortedInterviews = useMemo(() => {

        return [...interviews].sort((a, b) => {

            const dateA = getInterviewDateTime(a)?.getTime() || 0;

            const dateB = getInterviewDateTime(b)?.getTime() || 0;



            return dateA - dateB;

        });

    }, [interviews]);



    const upcomingInterviews = useMemo(() => {

        return sortedInterviews.filter((interview) => {

            const date = getInterviewDateTime(interview);



            return (

                date &&

                date >= now &&

                interview.status !== 'Cancelled' &&

                interview.status !== 'Completed'

            );

        });

    }, [sortedInterviews, now]);



    const pastInterviews = useMemo(() => {

        return sortedInterviews.filter((interview) => {

            const date = getInterviewDateTime(interview);



            return (

                interview.status === 'Completed' ||

                interview.status === 'Cancelled' ||

                (date && date < now)

            );

        });

    }, [sortedInterviews, now]);



    const renderInterviewCard = (interview, isUpcoming = false) => {

        const interviewDate = getInterviewDateTime(interview);



        const countdown = isUpcoming

            ? getCountdown(interviewDate)

            : null;



        return (

            <article

                key={interview._id}

                className={`student-interview-card ${isUpcoming ? 'is-upcoming' : ''

                    }`}

            >

                <div className="student-interview-card__top">

                    <div>

                        <span className="student-interview-eyebrow">

                            {interview.interviewType === 'online'

                                ? 'ONLINE INTERVIEW'

                                : 'OFFLINE INTERVIEW'}

                        </span>



                        <h3>

                            {interview.jobId?.title ||

                                'Interview Opportunity'}

                        </h3>



                        <p className="student-interview-company">

                            {interview.jobId?.companyName ||

                                'Company'}

                        </p>

                    </div>



                    <span

                        className={

                            STATUS_STYLES[interview.status] ||

                            'student-interview-status'

                        }

                    >

                        {interview.status}

                    </span>

                </div>



                {isUpcoming && countdown && (

                    <div className="student-interview-countdown">

                        <span>⏱️ Starts in</span>

                        <strong>{countdown}</strong>

                    </div>

                )}



                <div className="student-interview-details">

                    <div className="student-interview-detail">

                        <span className="student-interview-detail__icon">

                            📅

                        </span>



                        <div>

                            <small>Date</small>

                            <strong>

                                {formatDate(interview.scheduledDate)}

                            </strong>

                        </div>

                    </div>



                    <div className="student-interview-detail">

                        <span className="student-interview-detail__icon">

                            🕐

                        </span>



                        <div>

                            <small>Time</small>

                            <strong>

                                {interview.startTime} – {interview.endTime}

                            </strong>

                        </div>

                    </div>



                    <div className="student-interview-detail">

                        <span className="student-interview-detail__icon">

                            👤

                        </span>



                        <div>

                            <small>Interviewer</small>

                            <strong>

                                {interview.interviewerName || '—'}

                            </strong>



                            {interview.interviewerEmail && (

                                <span>

                                    {interview.interviewerEmail}

                                </span>

                            )}

                        </div>

                    </div>



                    <div className="student-interview-detail">

                        <span className="student-interview-detail__icon">

                            {interview.interviewType === 'online'

                                ? '💻'

                                : '📍'}

                        </span>



                        <div>

                            <small>

                                {interview.interviewType === 'online'

                                    ? 'Meeting'

                                    : 'Location'}

                            </small>



                            <strong>

                                {interview.interviewType === 'online'

                                    ? 'Online'

                                    : interview.location || '—'}

                            </strong>

                        </div>

                    </div>

                </div>



                {interview.instructions && (

                    <div className="student-interview-instructions">

                        <span>📌</span>



                        <div>

                            <strong>Instructions</strong>

                            <p>{interview.instructions}</p>

                        </div>

                    </div>

                )}



                <div className="student-interview-actions">

                    {interview.interviewType === 'online' &&

                        interview.meetingLink &&

                        interview.status !== 'Cancelled' &&

                        interview.status !== 'Completed' && (

                            <a

                                href={interview.meetingLink}

                                target="_blank"

                                rel="noreferrer"

                                className="btn btn-primary"

                            >

                                Join Interview

                            </a>

                        )}



                    {interview.interviewType === 'offline' &&

                        interview.location && (

                            <button

                                type="button"

                                className="btn btn-secondary"

                                onClick={() =>
                                    handleCopyLocation(interview)
                                }

                            >

                                Copy Location

                            </button>

                        )}

                </div>

            </article>

        );

    };



    return (

        <div className="student-interviews-page">

            <div className="student-interviews-container">

                <div className="student-interviews-header">

                    <div>

                        <span className="student-interviews-kicker">

                            CAREER JOURNEY

                        </span>



                        <h1>My Interviews</h1>



                        <p>

                            Keep track of your upcoming interviews,

                            meeting details and interview history.

                        </p>

                    </div>



                    <Link

                        to="/dashboard/student"

                        className="btn btn-secondary"

                    >

                        ← Dashboard

                    </Link>

                </div>



                {loading && (

                    <div className="student-interviews-loading">

                        <div className="student-interview-skeleton" />

                        <div className="student-interview-skeleton" />

                    </div>

                )}



                {!loading && error && (

                    <div className="student-interviews-error">

                        <strong>Unable to load interviews</strong>

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

                        <div className="student-interview-summary">

                            <div className="student-interview-summary-card">

                                <span>Upcoming</span>

                                <strong>

                                    {upcomingInterviews.length}

                                </strong>

                            </div>



                            <div className="student-interview-summary-card">

                                <span>Total</span>

                                <strong>{interviews.length}</strong>

                            </div>



                            <div className="student-interview-summary-card">

                                <span>Completed</span>

                                <strong>

                                    {

                                        interviews.filter(

                                            (item) =>

                                                item.status === 'Completed'

                                        ).length

                                    }

                                </strong>

                            </div>

                        </div>



                        <section className="student-interview-section">

                            <div className="student-interview-section-header">

                                <div>

                                    <span className="student-interviews-kicker">

                                        NEXT STEPS

                                    </span>



                                    <h2>Upcoming Interviews</h2>

                                </div>



                                <span className="student-interview-section-count">

                                    {upcomingInterviews.length}

                                </span>

                            </div>



                            {upcomingInterviews.length > 0 ? (

                                <div className="student-interviews-list">

                                    {upcomingInterviews.map((interview) =>

                                        renderInterviewCard(interview, true)

                                    )}

                                </div>

                            ) : (

                                <div className="student-interviews-empty">

                                    <div className="student-interviews-empty__icon">

                                        📅

                                    </div>



                                    <h3>No upcoming interviews</h3>



                                    <p>

                                        When a recruiter schedules an

                                        interview for you, the details will

                                        appear here.

                                    </p>



                                    <Link

                                        to="/jobs"

                                        className="btn btn-primary"

                                    >

                                        Explore Jobs

                                    </Link>

                                </div>

                            )}

                        </section>



                        <section className="student-interview-section">

                            <div className="student-interview-section-header">

                                <div>

                                    <span className="student-interviews-kicker">

                                        HISTORY

                                    </span>



                                    <h2>Interview History</h2>

                                </div>



                                <span className="student-interview-section-count">

                                    {pastInterviews.length}

                                </span>

                            </div>



                            {pastInterviews.length > 0 ? (

                                <div className="student-interviews-list">

                                    {pastInterviews.map((interview) =>

                                        renderInterviewCard(interview, false)

                                    )}

                                </div>

                            ) : (

                                <div className="student-interviews-empty compact">

                                    <div className="student-interviews-empty__icon">

                                        🗂️

                                    </div>



                                    <h3>No interview history yet</h3>



                                    <p>

                                        Completed and cancelled interviews

                                        will appear here.

                                    </p>

                                </div>

                            )}

                        </section>

                    </>

                )}

            </div>

        </div>

    );

}



export default StudentInterviews;