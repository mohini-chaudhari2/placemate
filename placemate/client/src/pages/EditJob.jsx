import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const JOB_TYPES = [
    'Full Time',
    'Part Time',
    'Internship',
    'Contract',
    'Remote',
];

const EXPERIENCE_OPTIONS = [
    'Fresher',
    '0-1 years',
    '1-2 years',
    '2-3 years',
    '3+ years',
];

const BRANCH_OPTIONS = [
    'Computer Science',
    'Information Technology',
    'Electronics',
    'Electrical',
    'Mechanical',
    'Civil',
    'Other',
];

const STATUS_OPTIONS = [
    'open',
    'closed',
    'draft',
];

function EditJob() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPreview, setShowPreview] = useState(false);

    const [formData, setFormData] = useState({
        companyName: '',
        title: '',
        description: '',
        location: '',
        jobType: '',
        experience: '',
        salary: '',
        requiredSkills: '',
        minCgpa: '',
        branches: [],
        batch: '',
        applicationDeadline: '',
        status: 'open',
    });

    useEffect(() => {
        const fetchJob = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await api.get(
                    `/recruiter/jobs/${id}`
                );

                const job = response.data.job || response.data;

                const eligibility = job.eligibility || {};

                const deadline = job.applicationDeadline
                    ? new Date(job.applicationDeadline)
                        .toISOString()
                        .split('T')[0]
                    : '';

                setFormData({
                    companyName: job.companyName || '',
                    title: job.title || '',
                    description: job.description || '',
                    location: job.location || '',
                    jobType: job.jobType || '',
                    experience: job.experience || '',
                    salary: job.salary || '',
                    requiredSkills: Array.isArray(job.requiredSkills)
                        ? job.requiredSkills.join(', ')
                        : '',
                    minCgpa:
                        eligibility.minCgpa !== undefined &&
                            eligibility.minCgpa !== null
                            ? String(eligibility.minCgpa)
                            : '',
                    branches: Array.isArray(eligibility.branches)
                        ? eligibility.branches
                        : [],
                    batch: Array.isArray(eligibility.batch)
                        ? eligibility.batch.join(', ')
                        : eligibility.batch
                            ? String(eligibility.batch)
                            : '',
                    applicationDeadline: deadline,
                    status: job.status || 'open',
                });
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

        if (id) {
            fetchJob();
        }
    }, [id]);

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setShowPreview(false);
            }
        };

        if (showPreview) {
            document.addEventListener(
                'keydown',
                handleEscape
            );

            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener(
                'keydown',
                handleEscape
            );

            document.body.style.overflow = '';
        };
    }, [showPreview]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError('');
        setSuccess('');
    };

    const handleBranchChange = (branch) => {
        setFormData((previous) => {
            const exists = previous.branches.includes(branch);

            return {
                ...previous,
                branches: exists
                    ? previous.branches.filter(
                        (item) => item !== branch
                    )
                    : [...previous.branches, branch],
            };
        });

        setError('');
        setSuccess('');
    };

    const validateForm = () => {
        if (!formData.companyName.trim()) {
            return 'Company name is required.';
        }

        if (!formData.title.trim()) {
            return 'Job title is required.';
        }

        if (!formData.description.trim()) {
            return 'Job description is required.';
        }

        if (
            formData.minCgpa !== '' &&
            (
                Number.isNaN(Number(formData.minCgpa)) ||
                Number(formData.minCgpa) < 0 ||
                Number(formData.minCgpa) > 10
            )
        ) {
            return 'Minimum CGPA must be between 0 and 10.';
        }

        if (formData.applicationDeadline) {
            const selectedDate = new Date(
                `${formData.applicationDeadline}T23:59:59`
            );

            if (Number.isNaN(selectedDate.getTime())) {
                return 'Please enter a valid application deadline.';
            }
        }

        return '';
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            setSuccess('');
            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
            return;
        }

        try {
            setSaving(true);
            setError('');
            setSuccess('');

            const skills = formData.requiredSkills
                .split(',')
                .map((skill) => skill.trim())
                .filter(Boolean);

            const batches = formData.batch
                .split(',')
                .map((year) => Number(year.trim()))
                .filter(
                    (year) => !Number.isNaN(year)
                );

            const payload = {
                companyName: formData.companyName.trim(),
                title: formData.title.trim(),
                description: formData.description.trim(),
                location: formData.location.trim(),
                jobType: formData.jobType.trim(),
                experience: formData.experience.trim(),
                salary: formData.salary.trim(),
                requiredSkills: skills,
                eligibility: {
                    minCgpa:
                        formData.minCgpa === ''
                            ? undefined
                            : Number(formData.minCgpa),

                    branches: formData.branches,

                    batch: batches,
                },
                applicationDeadline:
                    formData.applicationDeadline || undefined,
                status: formData.status,
            };

            await api.put(
                `/recruiter/jobs/${id}`,
                payload
            );

            setSuccess('Job updated successfully.');
            toast.success('Job updated successfully.');

            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });

            setTimeout(() => {
                navigate(
                    `/recruiter/jobs/${id}`
                );
            }, 900);
        } catch (err) {
            console.error(
                'Failed to update job:',
                err
            );

            const msg = err.response?.data?.message || 'Unable to update the job. Please try again.';
            setError(msg);
            toast.error(msg);

            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        } finally {
            setSaving(false);
        }
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
                        Loading job...
                    </p>
                </div>
            </main>
        );
    }

    if (error && !formData.title) {
        return (
            <main className="page-container">
                <div
                    className="card"
                    style={{
                        padding: '40px',
                        textAlign: 'center',
                    }}
                >
                    <h2>Unable to Load Job</h2>

                    <p style={{ margin: '12px 0 24px' }}>
                        {error}
                    </p>

                    <Link
                        to="/dashboard/recruiter"
                        className="btn btn-primary"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="page-container edit-job-page">
            <div className="edit-job-container">

                <div className="edit-job-header">
                    <div>
                        <Link
                            to={`/recruiter/jobs/${id}`}
                            className="back-link"
                        >
                            ← Back to Job
                        </Link>

                        <h1>Edit Job</h1>

                        <p>
                            Update your job posting and keep the
                            information accurate for students.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() =>
                            setShowPreview(true)
                        }
                    >
                        👁 Preview Job
                    </button>
                </div>

                {error && (
                    <div className="edit-job-alert edit-job-alert-error">
                        <strong>Something went wrong</strong>
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="edit-job-alert edit-job-alert-success">
                        <strong>Success</strong>
                        <span>{success}</span>
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="edit-job-form"
                >
                    <section className="card edit-job-section">
                        <div className="edit-job-section-header">
                            <div>
                                <span className="edit-job-step">
                                    01
                                </span>
                            </div>

                            <div>
                                <h2>Basic Information</h2>
                                <p>
                                    Tell students what this opportunity
                                    is about.
                                </p>
                            </div>
                        </div>

                        <div className="edit-job-grid">
                            <div className="form-group">
                                <label htmlFor="companyName">
                                    Company Name *
                                </label>

                                <input
                                    id="companyName"
                                    name="companyName"
                                    type="text"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    placeholder="e.g. Google"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="title">
                                    Job Title *
                                </label>

                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Software Engineer"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="location">
                                    Location
                                </label>

                                <input
                                    id="location"
                                    name="location"
                                    type="text"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g. Pune, Maharashtra"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="jobType">
                                    Job Type
                                </label>

                                <select
                                    id="jobType"
                                    name="jobType"
                                    value={formData.jobType}
                                    onChange={handleChange}
                                >
                                    <option value="">
                                        Select job type
                                    </option>

                                    {JOB_TYPES.map((type) => (
                                        <option
                                            key={type}
                                            value={type}
                                        >
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="experience">
                                    Experience
                                </label>

                                <select
                                    id="experience"
                                    name="experience"
                                    value={formData.experience}
                                    onChange={handleChange}
                                >
                                    <option value="">
                                        Select experience
                                    </option>

                                    {EXPERIENCE_OPTIONS.map(
                                        (option) => (
                                            <option
                                                key={option}
                                                value={option}
                                            >
                                                {option}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="salary">
                                    Salary
                                </label>

                                <input
                                    id="salary"
                                    name="salary"
                                    type="text"
                                    value={formData.salary}
                                    onChange={handleChange}
                                    placeholder="e.g. ₹6 - ₹10 LPA"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">
                                Job Description *
                            </label>

                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="8"
                                placeholder="Describe the role, responsibilities and expectations..."
                            />

                            <small>
                                {formData.description.length} characters
                            </small>
                        </div>
                    </section>

                    <section className="card edit-job-section">
                        <div className="edit-job-section-header">
                            <div>
                                <span className="edit-job-step">
                                    02
                                </span>
                            </div>

                            <div>
                                <h2>Skills</h2>

                                <p>
                                    Add the skills candidates should
                                    have for this role.
                                </p>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="requiredSkills">
                                Required Skills
                            </label>

                            <input
                                id="requiredSkills"
                                name="requiredSkills"
                                type="text"
                                value={formData.requiredSkills}
                                onChange={handleChange}
                                placeholder="React, JavaScript, Node.js, MongoDB"
                            />

                            <small>
                                Separate skills with commas.
                            </small>
                        </div>
                    </section>

                    <section className="card edit-job-section">
                        <div className="edit-job-section-header">
                            <div>
                                <span className="edit-job-step">
                                    03
                                </span>
                            </div>

                            <div>
                                <h2>Eligibility</h2>

                                <p>
                                    Define who can apply for this
                                    opportunity.
                                </p>
                            </div>
                        </div>

                        <div className="edit-job-grid">
                            <div className="form-group">
                                <label htmlFor="minCgpa">
                                    Minimum CGPA
                                </label>

                                <input
                                    id="minCgpa"
                                    name="minCgpa"
                                    type="number"
                                    min="0"
                                    max="10"
                                    step="0.01"
                                    value={formData.minCgpa}
                                    onChange={handleChange}
                                    placeholder="e.g. 7.5"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="batch">
                                    Eligible Batch Years
                                </label>

                                <input
                                    id="batch"
                                    name="batch"
                                    type="text"
                                    value={formData.batch}
                                    onChange={handleChange}
                                    placeholder="2026, 2027"
                                />

                                <small>
                                    Separate years with commas.
                                </small>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>
                                Eligible Branches
                            </label>

                            <div className="edit-job-checkbox-grid">
                                {BRANCH_OPTIONS.map(
                                    (branch) => (
                                        <label
                                            key={branch}
                                            className={`edit-job-checkbox ${formData.branches.includes(
                                                branch
                                            )
                                                    ? 'selected'
                                                    : ''
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={formData.branches.includes(
                                                    branch
                                                )}
                                                onChange={() =>
                                                    handleBranchChange(
                                                        branch
                                                    )
                                                }
                                            />

                                            <span>
                                                {branch}
                                            </span>
                                        </label>
                                    )
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="card edit-job-section">
                        <div className="edit-job-section-header">
                            <div>
                                <span className="edit-job-step">
                                    04
                                </span>
                            </div>

                            <div>
                                <h2>Application Settings</h2>

                                <p>
                                    Control the application deadline
                                    and current status.
                                </p>
                            </div>
                        </div>

                        <div className="edit-job-grid">
                            <div className="form-group">
                                <label htmlFor="applicationDeadline">
                                    Application Deadline
                                </label>

                                <input
                                    id="applicationDeadline"
                                    name="applicationDeadline"
                                    type="date"
                                    value={
                                        formData.applicationDeadline
                                    }
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="status">
                                    Job Status
                                </label>

                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    {STATUS_OPTIONS.map(
                                        (status) => (
                                            <option
                                                key={status}
                                                value={status}
                                            >
                                                {status
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    status.slice(1)}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                        </div>
                    </section>

                    <div className="edit-job-actions">
                        <Link
                            to={`/recruiter/jobs/${id}`}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </Link>

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() =>
                                setShowPreview(true)
                            }
                        >
                            👁 Preview
                        </button>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={saving}
                        >
                            {saving
                                ? 'Saving Changes...'
                                : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            {showPreview && (
                <div
                    className="job-preview-modal-backdrop"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget
                        ) {
                            setShowPreview(false);
                        }
                    }}
                >
                    <div
                        className="job-preview-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="edit-job-preview-title"
                    >
                        <div className="job-preview-modal-header">
                            <div>
                                <span className="job-preview-label">
                                    LIVE PREVIEW
                                </span>

                                <h2 id="edit-job-preview-title">
                                    {formData.title ||
                                        'Untitled Position'}
                                </h2>
                            </div>

                            <button
                                type="button"
                                className="job-preview-close"
                                onClick={() =>
                                    setShowPreview(false)
                                }
                                aria-label="Close preview"
                            >
                                ×
                            </button>
                        </div>

                        <div className="job-preview-modal-body">
                            <div className="job-preview-hero">
                                <div className="job-preview-company-icon">
                                    {(
                                        formData.companyName ||
                                        'C'
                                    )
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>

                                <div>
                                    <strong>
                                        {formData.companyName ||
                                            'Company Name'}
                                    </strong>

                                    <div className="job-preview-meta">
                                        {formData.location ||
                                            'Location not specified'}
                                        {' • '}
                                        {formData.jobType ||
                                            'Job type not specified'}
                                    </div>
                                </div>
                            </div>

                            <div className="job-preview-content-section">
                                <h3>
                                    About the Role
                                </h3>

                                <p className="job-preview-description">
                                    {formData.description ||
                                        'No description provided yet.'}
                                </p>
                            </div>

                            <div className="job-preview-content-section">
                                <h3>
                                    Required Skills
                                </h3>

                                {formData.requiredSkills.trim() ? (
                                    <div className="job-preview-skill-list">
                                        {formData.requiredSkills
                                            .split(',')
                                            .map((skill) =>
                                                skill.trim()
                                            )
                                            .filter(Boolean)
                                            .map(
                                                (skill, index) => (
                                                    <span
                                                        key={`${skill}-${index}`}
                                                        className="job-preview-skill"
                                                    >
                                                        {skill}
                                                    </span>
                                                )
                                            )}
                                    </div>
                                ) : (
                                    <p className="job-preview-muted">
                                        No skills added.
                                    </p>
                                )}
                            </div>

                            <div className="job-preview-eligibility">
                                <div>
                                    <strong>
                                        Minimum CGPA
                                    </strong>

                                    <span>
                                        {formData.minCgpa ||
                                            'Not specified'}
                                    </span>
                                </div>

                                <div>
                                    <strong>
                                        Experience
                                    </strong>

                                    <span>
                                        {formData.experience ||
                                            'Not specified'}
                                    </span>
                                </div>

                                <div>
                                    <strong>
                                        Salary
                                    </strong>

                                    <span>
                                        {formData.salary ||
                                            'Not specified'}
                                    </span>
                                </div>

                                <div>
                                    <strong>
                                        Deadline
                                    </strong>

                                    <span>
                                        {formData.applicationDeadline ||
                                            'Not specified'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="job-preview-modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() =>
                                    setShowPreview(false)
                                }
                            >
                                Continue Editing
                            </button>

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() =>
                                    setShowPreview(false)
                                }
                            >
                                Looks Good
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default EditJob;