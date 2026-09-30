import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

function RecruiterJobDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState(false);
    const { toast } = useToast();
    const { confirm } = useConfirm();

    useEffect(() => {
        const fetchJob = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await api.get(`/recruiter/jobs/${id}`);
                setJob(response.data.job || response.data);
            } catch (err) {
                console.error('Failed to load recruiter job:', err);

                setError(
                    err.response?.data?.message ||
                    'Unable to load this job posting.'
                );
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchJob();
        }
    }, [id]);

    const handleDelete = async () => {
        await confirm({
            title: 'Delete Job?',
            message: 'Are you sure you want to delete this job posting? This action cannot be undone.',
            confirmText: 'Delete Job',
            cancelText: 'Cancel',
            danger: true,
            action: async () => {
                await api.delete(`/recruiter/jobs/${id}`);
                toast.success('Job deleted successfully.');
                navigate('/dashboard/recruiter');
            }
        }).catch(err => {
            if (err) {
                console.error('Failed to delete job:', err);
                const msg = err.response?.data?.message || 'Unable to delete the job posting.';
                toast.error(msg);
            }
        });
    };

    if (loading) {
        return (
            <main className="page-container">
                <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                    <div className="loading-spinner" />
                    <p style={{ marginTop: '16px' }}>Loading job details...</p>
                </div>
            </main>
        );
    }

    if (error || !job) {
        return (
            <main className="page-container">
                <div
                    className="card"
                    style={{
                        padding: '40px',
                        textAlign: 'center',
                    }}
                >
                    <h2>Job Not Found</h2>

                    <p style={{ margin: '12px 0 24px' }}>
                        {error || 'This job posting could not be found.'}
                    </p>

                    <Link
                        to="/dashboard/recruiter"
                        className="btn btn-primary"
                    >
                        Back to Recruiter Dashboard
                    </Link>
                </div>
            </main>
        );
    }

    const skills = Array.isArray(job.requiredSkills)
        ? job.requiredSkills
        : [];

    const eligibility = job.eligibility || {};

    return (
        <main className="page-container">
            <div
                style={{
                    maxWidth: '1100px',
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
                        marginBottom: '24px',
                    }}
                >
                    <Link
                        to="/dashboard/recruiter"
                        className="btn btn-secondary"
                    >
                        ← Dashboard
                    </Link>

                    <div
                        style={{
                            display: 'flex',
                            gap: '10px',
                            flexWrap: 'wrap',
                        }}
                    >
                        <Link
                            to={`/recruiter/jobs/${job._id}/edit`}
                            className="btn btn-primary"
                        >
                            Edit Job
                        </Link>

                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting ? 'Deleting...' : 'Delete Job'}
                        </button>
                    </div>
                </div>

                <section
                    className="card"
                    style={{
                        padding: '32px',
                        marginBottom: '20px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: '20px',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    padding: '6px 12px',
                                    borderRadius: '999px',
                                    background: '#eef2ff',
                                    color: '#4f46e5',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    marginBottom: '14px',
                                }}
                            >
                                {job.status || 'Open'}
                            </div>

                            <h1 style={{ marginBottom: '8px' }}>
                                {job.title}
                            </h1>

                            <p
                                style={{
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    marginBottom: '8px',
                                }}
                            >
                                {job.companyName}
                            </p>

                            <p style={{ color: '#64748b' }}>
                                📍 {job.location || 'Location not specified'}
                            </p>
                        </div>

                        <div
                            style={{
                                textAlign: 'right',
                                color: '#64748b',
                            }}
                        >
                            <strong style={{ color: '#0f172a' }}>
                                {job.jobType || 'Not specified'}
                            </strong>

                            <div style={{ marginTop: '6px' }}>
                                {job.experience || 'Experience not specified'}
                            </div>
                        </div>
                    </div>
                </section>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '20px',
                    }}
                >
                    <section className="card" style={{ padding: '28px' }}>
                        <h2 style={{ marginBottom: '16px' }}>
                            Job Description
                        </h2>

                        <div
                            style={{
                                whiteSpace: 'pre-wrap',
                                lineHeight: 1.7,
                                color: '#475569',
                            }}
                        >
                            {job.description || 'No description provided.'}
                        </div>
                    </section>

                    <section className="card" style={{ padding: '28px' }}>
                        <h2 style={{ marginBottom: '16px' }}>
                            Job Information
                        </h2>

                        <div style={{ display: 'grid', gap: '14px' }}>
                            <div>
                                <strong>Salary</strong>
                                <div>
                                    {job.salary || 'Not specified'}
                                </div>
                            </div>

                            <div>
                                <strong>Application Deadline</strong>
                                <div>
                                    {job.applicationDeadline
                                        ? new Date(
                                            job.applicationDeadline
                                        ).toLocaleDateString()
                                        : 'Not specified'}
                                </div>
                            </div>

                            <div>
                                <strong>Job Type</strong>
                                <div>
                                    {job.jobType || 'Not specified'}
                                </div>
                            </div>

                            <div>
                                <strong>Experience</strong>
                                <div>
                                    {job.experience || 'Not specified'}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <section
                    className="card"
                    style={{
                        padding: '28px',
                        marginTop: '20px',
                    }}
                >
                    <h2 style={{ marginBottom: '18px' }}>
                        Required Skills
                    </h2>

                    {skills.length > 0 ? (
                        <div
                            style={{
                                display: 'flex',
                                gap: '10px',
                                flexWrap: 'wrap',
                            }}
                        >
                            {skills.map((skill, index) => (
                                <span
                                    key={`${skill}-${index}`}
                                    style={{
                                        padding: '8px 14px',
                                        borderRadius: '999px',
                                        background: '#f1f5f9',
                                        color: '#334155',
                                        fontWeight: 600,
                                        fontSize: '14px',
                                    }}
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#64748b' }}>
                            No required skills specified.
                        </p>
                    )}
                </section>

                <section
                    className="card"
                    style={{
                        padding: '28px',
                        marginTop: '20px',
                    }}
                >
                    <h2 style={{ marginBottom: '18px' }}>
                        Eligibility
                    </h2>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '18px',
                        }}
                    >
                        <div>
                            <strong>Minimum CGPA</strong>
                            <p>
                                {eligibility.minCgpa ??
                                    'No minimum specified'}
                            </p>
                        </div>

                        <div>
                            <strong>Branches</strong>
                            <p>
                                {Array.isArray(eligibility.branches) &&
                                    eligibility.branches.length > 0
                                    ? eligibility.branches.join(', ')
                                    : 'All branches'}
                            </p>
                        </div>

                        <div>
                            <strong>Batch</strong>
                            <p>
                                {eligibility.batch || 'All batches'}
                            </p>
                        </div>
                    </div>
                </section>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginTop: '24px',
                    }}
                >
                    <Link
                        to="/recruiter/applications"
                        className="btn btn-primary"
                    >
                        View Applications →
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default RecruiterJobDetails;