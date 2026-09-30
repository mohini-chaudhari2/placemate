import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RecruiterInterviewCalendar.css';
const STATUS_META = {
    Scheduled: {
        className: 'scheduled',
        label: 'Scheduled',
    },
    Rescheduled: {
        className: 'rescheduled',
        label: 'Rescheduled',
    },
    Cancelled: {
        className: 'cancelled',
        label: 'Cancelled',
    },
    Completed: {
        className: 'completed',
        label: 'Completed',
    },
};

const getInterviewDateKey = (date) => {
    if (!date) return '';

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return '';

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const getCandidateName = (interview) => {
    return (
        interview?.studentId?.name ||
        interview?.student?.name ||
        interview?.candidateName ||
        'Candidate'
    );
};

const getCandidateEmail = (interview) => {
    return (
        interview?.studentId?.email ||
        interview?.student?.email ||
        interview?.candidateEmail ||
        ''
    );
};

const getJobTitle = (interview) => {
    return (
        interview?.jobId?.title ||
        interview?.job?.title ||
        'Job Interview'
    );
};

const getCompanyName = (interview) => {
    return (
        interview?.jobId?.companyName ||
        interview?.job?.companyName ||
        ''
    );
};

const formatTime = (time) => {
    if (!time) return '';

    const [hours, minutes] = time.split(':').map(Number);

    if (
        Number.isNaN(hours) ||
        Number.isNaN(minutes)
    ) {
        return time;
    }

    const date = new Date();

    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
    });
};

const RecruiterInterviewCalendar = ({
    interviews = [],
}) => {
    const navigate = useNavigate();

    const today = new Date();

    const [currentMonth, setCurrentMonth] = useState(
        new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        )
    );

    const [selectedDate, setSelectedDate] = useState(
        getInterviewDateKey(today)
    );

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const monthLabel = currentMonth.toLocaleDateString(
        'en-IN',
        {
            month: 'long',
            year: 'numeric',
        }
    );

    const calendarDays = useMemo(() => {
        const firstDay = new Date(
            year,
            month,
            1
        ).getDay();

        const daysInMonth = new Date(
            year,
            month + 1,
            0
        ).getDate();

        const previousMonthDays = new Date(
            year,
            month,
            0
        ).getDate();

        const cells = [];

        /*
         * Monday-first calendar.
         * JS Sunday = 0, so convert it.
         */
        const mondayFirstOffset =
            firstDay === 0
                ? 6
                : firstDay - 1;

        for (
            let index = mondayFirstOffset - 1;
            index >= 0;
            index -= 1
        ) {
            const day = previousMonthDays - index;

            const date = new Date(
                year,
                month - 1,
                day
            );

            cells.push({
                date,
                key: getInterviewDateKey(date),
                day,
                outsideMonth: true,
            });
        }

        for (
            let day = 1;
            day <= daysInMonth;
            day += 1
        ) {
            const date = new Date(
                year,
                month,
                day
            );

            cells.push({
                date,
                key: getInterviewDateKey(date),
                day,
                outsideMonth: false,
            });
        }

        let nextDay = 1;

        while (cells.length < 42) {
            const date = new Date(
                year,
                month + 1,
                nextDay
            );

            cells.push({
                date,
                key: getInterviewDateKey(date),
                day: nextDay,
                outsideMonth: true,
            });

            nextDay += 1;
        }

        return cells;
    }, [year, month]);

    const interviewsByDate = useMemo(() => {
        const grouped = {};

        interviews.forEach((interview) => {
            const key = getInterviewDateKey(
                interview?.scheduledDate
            );

            if (!key) return;

            if (!grouped[key]) {
                grouped[key] = [];
            }

            grouped[key].push(interview);
        });

        Object.values(grouped).forEach((items) => {
            items.sort((a, b) => {
                const aTime =
                    a?.startTime || '99:99';

                const bTime =
                    b?.startTime || '99:99';

                return aTime.localeCompare(bTime);
            });
        });

        return grouped;
    }, [interviews]);

    const selectedInterviews =
        interviewsByDate[selectedDate] || [];

    const goToPreviousMonth = () => {
        setCurrentMonth(
            new Date(
                year,
                month - 1,
                1
            )
        );
    };

    const goToNextMonth = () => {
        setCurrentMonth(
            new Date(
                year,
                month + 1,
                1
            )
        );
    };

    const goToToday = () => {
        const now = new Date();

        setCurrentMonth(
            new Date(
                now.getFullYear(),
                now.getMonth(),
                1
            )
        );

        setSelectedDate(
            getInterviewDateKey(now)
        );
    };

    const handleInterviewClick = (interview) => {
        if (!interview?._id) return;

        navigate(
            `/recruiter/interviews/${interview._id}`
        );
    };

    const formatSelectedDate = () => {
        if (!selectedDate) {
            return 'Select a date';
        }

        const date = new Date(
            `${selectedDate}T00:00:00`
        );

        return date.toLocaleDateString(
            'en-IN',
            {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            }
        );
    };

    const activeInterviews = interviews.filter(
        (interview) =>
            interview?.status !== 'Cancelled'
    );

    const scheduledCount =
        interviews.filter(
            (interview) =>
                interview?.status === 'Scheduled'
        ).length;

    const rescheduledCount =
        interviews.filter(
            (interview) =>
                interview?.status === 'Rescheduled'
        ).length;

    const completedCount =
        interviews.filter(
            (interview) =>
                interview?.status === 'Completed'
        ).length;

    return (
        <div className="recruiter-calendar-page">
            <div className="recruiter-calendar-header">
                <div>
                    <Link
                        to="/recruiter/interviews"
                        className="recruiter-calendar-back"
                    >
                        ← Back to Interview Management
                    </Link>

                    <span className="section-eyebrow">
                        Interview Planning
                    </span>

                    <h1>
                        Interview Calendar
                    </h1>

                    <p>
                        View your recruitment schedule,
                        open interview details, and manage
                        candidate meetings from one place.
                    </p>
                </div>

                <div className="recruiter-calendar-header-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={goToToday}
                    >
                        Today
                    </button>

                    <Link
                        to="/recruiter/applications"
                        className="btn btn-primary"
                    >
                        Review Applications
                    </Link>
                </div>
            </div>

            <section className="recruiter-calendar-summary">
                <div className="recruiter-calendar-summary-card">
                    <span>Active Interviews</span>
                    <strong>
                        {activeInterviews.length}
                    </strong>
                </div>

                <div className="recruiter-calendar-summary-card">
                    <span>Scheduled</span>
                    <strong>
                        {scheduledCount}
                    </strong>
                </div>

                <div className="recruiter-calendar-summary-card">
                    <span>Rescheduled</span>
                    <strong>
                        {rescheduledCount}
                    </strong>
                </div>

                <div className="recruiter-calendar-summary-card">
                    <span>Completed</span>
                    <strong>
                        {completedCount}
                    </strong>
                </div>
            </section>

            <div className="recruiter-calendar-layout">
                <section className="recruiter-calendar-card">
                    <div className="recruiter-calendar-toolbar">
                        <div>
                            <h2>
                                {monthLabel}
                            </h2>

                            <p>
                                Click a day to see its interviews.
                            </p>
                        </div>

                        <div className="recruiter-calendar-navigation">
                            <button
                                type="button"
                                aria-label="Previous month"
                                onClick={
                                    goToPreviousMonth
                                }
                            >
                                ←
                            </button>

                            <button
                                type="button"
                                aria-label="Next month"
                                onClick={
                                    goToNextMonth
                                }
                            >
                                →
                            </button>
                        </div>
                    </div>

                    <div className="recruiter-calendar-weekdays">
                        {[
                            'Mon',
                            'Tue',
                            'Wed',
                            'Thu',
                            'Fri',
                            'Sat',
                            'Sun',
                        ].map((day) => (
                            <div
                                key={day}
                                className="recruiter-calendar-weekday"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="recruiter-calendar-grid">
                        {calendarDays.map((cell) => {
                            const dayInterviews =
                                interviewsByDate[
                                cell.key
                                ] || [];

                            const isToday =
                                cell.key ===
                                getInterviewDateKey(
                                    today
                                );

                            const isSelected =
                                cell.key ===
                                selectedDate;

                            return (
                                <button
                                    type="button"
                                    key={cell.key}
                                    className={[
                                        'recruiter-calendar-day',
                                        cell.outsideMonth
                                            ? 'outside-month'
                                            : '',
                                        isToday
                                            ? 'is-today'
                                            : '',
                                        isSelected
                                            ? 'is-selected'
                                            : '',
                                    ]
                                        .filter(Boolean)
                                        .join(' ')}
                                    onClick={() =>
                                        setSelectedDate(
                                            cell.key
                                        )
                                    }
                                >
                                    <span className="calendar-day-number">
                                        {cell.day}
                                    </span>

                                    {dayInterviews.length >
                                        0 && (
                                            <span className="calendar-day-count">
                                                {
                                                    dayInterviews.length
                                                }{' '}
                                                {dayInterviews.length ===
                                                    1
                                                    ? 'interview'
                                                    : 'interviews'}
                                            </span>
                                        )}

                                    <div className="calendar-day-events">
                                        {dayInterviews
                                            .slice(0, 3)
                                            .map(
                                                (
                                                    interview
                                                ) => {
                                                    const status =
                                                        STATUS_META[
                                                        interview
                                                            ?.status
                                                        ] ||
                                                        STATUS_META.Scheduled;

                                                    return (
                                                        <span
                                                            key={
                                                                interview._id
                                                            }
                                                            className={`calendar-event ${status.className}`}
                                                            onClick={(
                                                                event
                                                            ) => {
                                                                event.stopPropagation();

                                                                handleInterviewClick(
                                                                    interview
                                                                );
                                                            }}
                                                        >
                                                            <strong>
                                                                {interview?.startTime ||
                                                                    '--:--'}
                                                            </strong>{' '}
                                                            {getCandidateName(
                                                                interview
                                                            )}
                                                        </span>
                                                    );
                                                }
                                            )}

                                        {dayInterviews.length >
                                            3 && (
                                                <span className="calendar-more">
                                                    +
                                                    {dayInterviews.length -
                                                        3}{' '}
                                                    more
                                                </span>
                                            )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="recruiter-calendar-legend">
                        <span>
                            <i className="legend-dot scheduled" />
                            Scheduled
                        </span>

                        <span>
                            <i className="legend-dot rescheduled" />
                            Rescheduled
                        </span>

                        <span>
                            <i className="legend-dot completed" />
                            Completed
                        </span>

                        <span>
                            <i className="legend-dot cancelled" />
                            Cancelled
                        </span>
                    </div>
                </section>

                <aside className="recruiter-calendar-sidebar">
                    <div className="recruiter-calendar-selected-header">
                        <span className="section-eyebrow">
                            Selected Day
                        </span>

                        <h2>
                            {formatSelectedDate()}
                        </h2>

                        <p>
                            {selectedInterviews.length ===
                                0
                                ? 'No interviews scheduled for this date.'
                                : `${selectedInterviews.length} ${selectedInterviews.length ===
                                    1
                                    ? 'interview'
                                    : 'interviews'
                                } scheduled.`}
                        </p>
                    </div>

                    {selectedInterviews.length ===
                        0 ? (
                        <div className="recruiter-calendar-empty">
                            <div>
                                📅
                            </div>

                            <h3>
                                No interviews
                            </h3>

                            <p>
                                Select another date or
                                schedule an interview from
                                your applications.
                            </p>

                            <Link
                                to="/recruiter/applications"
                                className="btn btn-primary"
                            >
                                Schedule Interview
                            </Link>
                        </div>
                    ) : (
                        <div className="recruiter-calendar-day-list">
                            {selectedInterviews.map(
                                (interview) => {
                                    const status =
                                        STATUS_META[
                                        interview
                                            ?.status
                                        ] ||
                                        STATUS_META.Scheduled;

                                    const isOnline =
                                        interview?.interviewType ===
                                        'online';

                                    return (
                                        <article
                                            key={
                                                interview._id
                                            }
                                            className="recruiter-calendar-interview-card"
                                        >
                                            <div className="calendar-interview-card-top">
                                                <span className="calendar-interview-time">
                                                    {formatTime(
                                                        interview?.startTime
                                                    )}

                                                    {interview?.endTime
                                                        ? ` - ${formatTime(
                                                            interview.endTime
                                                        )}`
                                                        : ''}
                                                </span>

                                                <span
                                                    className={`calendar-status ${status.className}`}
                                                >
                                                    {
                                                        status.label
                                                    }
                                                </span>
                                            </div>

                                            <h3>
                                                {getCandidateName(
                                                    interview
                                                )}
                                            </h3>

                                            {getCandidateEmail(
                                                interview
                                            ) && (
                                                    <p className="calendar-interview-email">
                                                        {
                                                            getCandidateEmail(
                                                                interview
                                                            )
                                                        }
                                                    </p>
                                                )}

                                            <p className="calendar-interview-job">
                                                {getJobTitle(
                                                    interview
                                                )}

                                                {getCompanyName(
                                                    interview
                                                )
                                                    ? ` • ${getCompanyName(
                                                        interview
                                                    )}`
                                                    : ''}
                                            </p>

                                            <div className="calendar-interview-meta">
                                                <span>
                                                    {isOnline
                                                        ? '💻 Online'
                                                        : '📍 Offline'}
                                                </span>

                                                {interview?.interviewerName && (
                                                    <span>
                                                        👤{' '}
                                                        {
                                                            interview.interviewerName
                                                        }
                                                    </span>
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                className="calendar-manage-button"
                                                onClick={() =>
                                                    handleInterviewClick(
                                                        interview
                                                    )
                                                }
                                            >
                                                Manage Interview →
                                            </button>
                                        </article>
                                    );
                                }
                            )}
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
};

export default RecruiterInterviewCalendar;