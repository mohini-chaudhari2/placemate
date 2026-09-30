import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

function SavedJobs() {
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const { confirm } = useConfirm();
    const [removingId, setRemovingId] = useState(null);
    const [error, setError] = useState('');

    const fetchSavedJobs = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await api.get('/saved-jobs');

            setSavedJobs(response.data.savedJobs || []);
        } catch (err) {
            console.error('Failed to load saved jobs:', err);

            setError(
                err.response?.data?.message ||
                'Unable to load your saved jobs.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSavedJobs();
    }, []);

    const handleRemove = async (jobId) => {
        await confirm({
            title: 'Remove Saved Job?',
            message: 'Are you sure you want to remove this job from your saved list?',
            confirmText: 'Remove',
            cancelText: 'Keep Saved',
            danger: true,
            action: async () => {
                setRemovingId(jobId);
                await api.delete(`/saved-jobs/${jobId}`);
                setSavedJobs((current) =>
                    current.filter(
                        (savedJob) =>
                            savedJob.jobId?._id !== jobId
                    )
                );
                toast.success('Job removed from saved list.');
            }
        }).catch(err => {
            if (err) {
                console.error('Failed to remove saved job:', err);
                const msg = err.response?.data?.message || 'Unable to remove this saved job.';
                toast.error(msg);
            }
        }).finally(() => {
            setRemovingId(null);
        });
    };

    if (loading) {
        return (
            <main className="page-container">
                <div
                    className="card"
                    style={{
                        padding: '50px',
                        textAlign: 'center',
                    }}
                >
                    <div className="loading-spinner" />

                    <p style={{ marginTop: '16px' }}>
                        Loading saved jobs...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="page-container">
            <div
                style={{
                    maxWidth: '1150px',
                    margin: '0 auto',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '16px',
                        flexWrap: 'wrap',
                        marginBottom: '28px',
                    }}
                >
                    <div>
                        <p
                            style={{
                                color: '#6366f1',
                                fontWeight: 700,
                                marginBottom: '6px',
                            }}
                        >
                            STUDENT JOB BOARD
                        </p>

                        <h1>Saved Jobs</h1>

                        <p
                            style={{
                                color: '#64748b',
                                marginTop: '8px',
                            }}
                        >
                            Keep track of opportunities you want
                            to apply for later.
                        </p>
                    </div>

                    <Link
                        to="/jobs"
                        className="btn btn-primary"
                    >
                        🔎 Find More Jobs
                    </Link>
                </div>

                {error && (
                    <div
                        className="card"
                        style={{
                            padding: '18px',
                            marginBottom: '20px',
                            border: '1px solid #fecaca',
                            background: '#fef2f2',
                            color: '#b91c1c',
                        }}
                    >
                        {error}
                    </div>
                )}

                {savedJobs.length === 0 ? (
                    <section
                        className="card"
                        style={{
                            padding: '60px 30px',
                            textAlign: 'center',
                        }}
                    >
                        <div
                            style={{
                                fontSize: '52px',
                                marginBottom: '16px',
                            }}
                        >
                            🔖
                        </div>

                        <h2>No Saved Jobs Yet</h2>

                        <p
                            style={{
                                maxWidth: '550px',
                                margin: '12px auto 24px',
                                color: '#64748b',
                                lineHeight: 1.7,
                            }}
                        >
                            When you find an interesting opportunity,
                            save it here so you can easily come back
                            to it later.
                        </p>

                        <Link
                            to="/jobs"
                            className="btn btn-primary"
                        >
                            Explore Jobs
                        </Link>
                    </section>
                ) : (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(auto-fit, minmax(320px, 1fr))',
                            gap: '20px',
                        }}
                    >
                        {savedJobs.map((savedJob) => {
                            const job = savedJob.jobId;

                            if (!job) return null;

                            return (
                                <article
                                    key={savedJob._id}
                                    className="card"
                                    style={{
                                        padding: '24px',
                                        position: 'relative',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent:
                                                'space-between',
                                            gap: '14px',
                                            alignItems: 'flex-start',
                                        }}
                                    >
                                        <div>
                                            <span
                                                style={{
                                                    display: 'inline-block',
                                                    padding: '5px 10px',
                                                    borderRadius: '999px',
                                                    background: '#eef2ff',
                                                    color: '#4f46e5',
                                                    fontSize: '12px',
                                                    fontWeight: 700,
                                                    marginBottom: '10px',
                                                }}
                                            >
                                                {job.status || 'Open'}
                                            </span>

                                            <h2
                                                style={{
                                                    fontSize: '21px',
                                                    marginBottom: '7px',
                                                }}
                                            >
                                                {job.title}
                                            </h2>

                                            <p
                                                style={{
                                                    fontWeight: 600,
                                                    marginBottom: '7px',
                                                }}
                                            >
                                                {job.companyName}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemove(job._id)
                                            }
                                            disabled={
                                                removingId === job._id
                                            }
                                            title="Remove saved job"
                                            style={{
                                                border: 'none',
                                                background: '#fff1f2',
                                                color: '#e11d48',
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                fontSize: '18px',
                                            }}
                                        >
                                            {removingId === job._id
                                                ? '...'
                                                : '🔖'}
                                        </button>
                                    </div>

                                    <div
                                        style={{
                                            display: 'grid',
                                            gap: '9px',
                                            marginTop: '18px',
                                            color: '#64748b',
                                            fontSize: '14px',
                                        }}
                                    >
                                        <div>
                                            📍{' '}
                                            {job.location ||
                                                'Location not specified'}
                                        </div>

                                        <div>
                                            💼{' '}
                                            {job.jobType ||
                                                'Job type not specified'}
                                        </div>

                                        <div>
                                            💰{' '}
                                            {job.salary ||
                                                'Salary not specified'}
                                        </div>
                                    </div>

                                    {Array.isArray(
                                        job.requiredSkills
                                    ) &&
                                        job.requiredSkills.length > 0 && (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    gap: '7px',
                                                    flexWrap: 'wrap',
                                                    marginTop: '18px',
                                                }}
                                            >
                                                {job.requiredSkills
                                                    .slice(0, 5)
                                                    .map((skill, index) => (
                                                        <span
                                                            key={`${skill}-${index}`}
                                                            style={{
                                                                padding: '5px 9px',
                                                                borderRadius: '999px',
                                                                background:
                                                                    '#f1f5f9',
                                                                color: '#475569',
                                                                fontSize: '12px',
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                            </div>
                                        )}

                                    <div
                                        style={{
                                            display: 'flex',
                                            gap: '10px',
                                            marginTop: '24px',
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        <Link
                                            to={`/jobs/${job._id}`}
                                            className="btn btn-primary"
                                        >
                                            View Job
                                        </Link>

                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() =>
                                                handleRemove(job._id)
                                            }
                                            disabled={
                                                removingId === job._id
                                            }
                                        >
                                            {removingId === job._id
                                                ? 'Removing...'
                                                : 'Remove'}
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}

export default SavedJobs;