import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import './ResumeManager.css';

const API_BASE_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const formatFileSize = (bytes = 0) => {
    if (bytes < 1024) return `${bytes} B`;

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatDate = (date) => {
    if (!date) return 'Not available';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return 'Not available';
    }

    return parsedDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

const getFileExtension = (fileName = '') => {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts.pop().toUpperCase() : 'FILE';
};

const getResumeUrl = (fileUrl = '') => {
    if (!fileUrl) return '';

    if (/^https?:\/\//i.test(fileUrl)) {
        return fileUrl;
    }

    return `${SERVER_BASE_URL}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
};

const ResumeManager = () => {
    const fileInputRef = useRef(null);

    const [resume, setResume] = useState(null);
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { confirm } = useConfirm();

    const fetchResume = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await api.get('/resume');

            setResume(response.data?.resume || null);
        } catch (err) {
            console.error('Fetch resume error:', err);

            setError(
                err.response?.data?.message ||
                'Unable to load your resume. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResume();
    }, []);

    const resumeUrl = useMemo(
        () => getResumeUrl(resume?.fileUrl),
        [resume?.fileUrl]
    );

    const handleChooseFile = () => {
        setError('');
        setSuccess('');

        fileInputRef.current?.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setError('');
        setSuccess('');

        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        const allowedExtensions = ['pdf', 'doc', 'docx'];

        const extension = file.name
            .split('.')
            .pop()
            ?.toLowerCase();

        if (
            !allowedTypes.includes(file.type) &&
            !allowedExtensions.includes(extension)
        ) {
            setError('Only PDF, DOC, and DOCX files are allowed.');
            event.target.value = '';
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setError('Resume must be 5 MB or smaller.');
            event.target.value = '';
            return;
        }

        try {
            setUploading(true);

            const formData = new FormData();
            formData.append('resume', file);

            const response = await api.post('/resume', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setResume(response.data?.resume || null);

            const msg = resume
                ? 'Your resume has been replaced successfully.'
                : 'Your resume has been uploaded successfully.';
            setSuccess(msg);
            toast.success(msg);
        } catch (err) {
            console.error('Upload resume error:', err);

            const msg = err.response?.data?.message || 'Unable to upload your resume. Please try again.';
            setError(msg);
            toast.error(msg);
        } finally {
            setUploading(false);
            event.target.value = '';
        }
    };

    const handleDelete = async () => {
        await confirm({
            title: 'Delete your resume?',
            message: 'This will permanently remove your current resume from your PlaceMate account. You can upload a new one later.',
            confirmText: 'Yes, Delete',
            cancelText: 'Keep Resume',
            danger: true,
            action: async () => {
                await api.delete('/resume');
                setResume(null);
                setSuccess('Your resume has been deleted successfully.');
                toast.success('Your resume has been deleted successfully.');
            }
        }).catch(err => {
            if (err) {
                console.error('Delete resume error:', err);
                const msg = err.response?.data?.message || 'Unable to delete your resume. Please try again.';
                setError(msg);
                toast.error(msg);
            }
        });
    };

    const handlePreview = () => {
        if (!resumeUrl) {
            setError('Resume preview is not available.');
            return;
        }

        window.open(resumeUrl, '_blank', 'noopener,noreferrer');
    };

    const handleDownload = () => {
        if (!resumeUrl) {
            setError('Resume download is not available.');
            return;
        }

        const link = document.createElement('a');

        link.href = resumeUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.download = resume?.originalName || resume?.fileName || 'resume';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <main className="resume-manager-page">
            <div className="resume-manager-container">
                <div className="resume-manager-topbar">
                    <div>
                        <Link
                            to="/dashboard/student"
                            className="resume-manager-back"
                        >
                            ← Back to Dashboard
                        </Link>

                        <span className="resume-manager-eyebrow">
                            CAREER DOCUMENTS
                        </span>

                        <h1>Resume Manager</h1>

                        <p>
                            Keep your latest resume ready for job applications and
                            recruiter opportunities.
                        </p>
                    </div>

                    <div className="resume-manager-topbar-badge">
                        <span>📄</span>
                        <div>
                            <strong>Resume</strong>
                            <small>Professional profile</small>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="resume-manager-alert resume-manager-alert--error">
                        <span className="resume-manager-alert-icon">!</span>

                        <div>
                            <strong>Something went wrong</strong>
                            <p>{error}</p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setError('')}
                            aria-label="Dismiss error"
                        >
                            ×
                        </button>
                    </div>
                )}

                {success && (
                    <div className="resume-manager-alert resume-manager-alert--success">
                        <span className="resume-manager-alert-icon">✓</span>

                        <div>
                            <strong>Success</strong>
                            <p>{success}</p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setSuccess('')}
                            aria-label="Dismiss success message"
                        >
                            ×
                        </button>
                    </div>
                )}

                <section className="resume-manager-grid">
                    <div className="resume-manager-main-card">
                        <div className="resume-manager-card-header">
                            <div>
                                <span className="resume-manager-section-label">
                                    YOUR RESUME
                                </span>

                                <h2>
                                    {resume
                                        ? 'Your resume is ready'
                                        : 'Upload your resume'}
                                </h2>

                                <p>
                                    {resume
                                        ? 'You can preview, download, replace or remove your current resume.'
                                        : 'Upload your latest resume so recruiters can review your professional profile.'}
                                </p>
                            </div>

                            <div
                                className={`resume-manager-status ${resume
                                        ? 'resume-manager-status--ready'
                                        : 'resume-manager-status--missing'
                                    }`}
                            >
                                <span>
                                    {resume ? '✓' : '○'}
                                </span>

                                {resume ? 'Ready' : 'Not uploaded'}
                            </div>
                        </div>

                        {loading ? (
                            <div className="resume-manager-loading">
                                <div className="resume-manager-spinner" />
                                <h3>Loading your resume...</h3>
                                <p>Please wait a moment.</p>
                            </div>
                        ) : resume ? (
                            <div className="resume-manager-file-card">
                                <div className="resume-manager-file-icon">
                                    {getFileExtension(resume.originalName)}
                                </div>

                                <div className="resume-manager-file-info">
                                    <h3>
                                        {resume.originalName || resume.fileName}
                                    </h3>

                                    <div className="resume-manager-file-meta">
                                        <span>
                                            {getFileExtension(resume.originalName)}
                                        </span>

                                        <span>•</span>

                                        <span>
                                            {formatFileSize(resume.fileSize)}
                                        </span>

                                        <span>•</span>

                                        <span>
                                            Uploaded {formatDate(resume.uploadedAt || resume.createdAt)}
                                        </span>
                                    </div>
                                </div>

                                <div className="resume-manager-file-check">
                                    ✓
                                </div>
                            </div>
                        ) : (
                            <div className="resume-manager-empty">
                                <div className="resume-manager-empty-icon">
                                    📄
                                </div>

                                <h3>No resume uploaded yet</h3>

                                <p>
                                    Upload a PDF, DOC or DOCX resume up to 5 MB.
                                </p>

                                <button
                                    type="button"
                                    className="resume-manager-primary-button"
                                    onClick={handleChooseFile}
                                    disabled={uploading}
                                >
                                    {uploading ? (
                                        <>
                                            <span className="resume-manager-button-spinner" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            ↑ Upload Resume
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleFileChange}
                            className="resume-manager-hidden-input"
                        />

                        {!loading && resume && (
                            <div className="resume-manager-actions">
                                <button
                                    type="button"
                                    className="resume-manager-primary-button"
                                    onClick={handlePreview}
                                    disabled={uploading || deleting}
                                >
                                    👁 Preview Resume
                                </button>

                                <button
                                    type="button"
                                    className="resume-manager-secondary-button"
                                    onClick={handleDownload}
                                    disabled={uploading || deleting}
                                >
                                    ↓ Download
                                </button>

                                <button
                                    type="button"
                                    className="resume-manager-secondary-button"
                                    onClick={handleChooseFile}
                                    disabled={uploading || deleting}
                                >
                                    {uploading ? 'Uploading...' : '↻ Replace'}
                                </button>

                                <button
                                    type="button"
                                    className="resume-manager-danger-button"
                                    onClick={handleDelete}
                                    disabled={uploading || deleting}
                                >
                                    🗑 Delete
                                </button>
                            </div>
                        )}
                    </div>

                    <aside className="resume-manager-side-card">
                        <div className="resume-manager-side-icon">
                            ✨
                        </div>

                        <span className="resume-manager-section-label">
                            RESUME CHECKLIST
                        </span>

                        <h2>Make your resume recruiter-ready</h2>

                        <p>
                            A strong resume helps recruiters quickly understand
                            your skills, experience and career goals.
                        </p>

                        <div className="resume-manager-checklist">
                            <div>
                                <span>✓</span>
                                <p>Keep your contact details updated</p>
                            </div>

                            <div>
                                <span>✓</span>
                                <p>Highlight relevant technical skills</p>
                            </div>

                            <div>
                                <span>✓</span>
                                <p>Add meaningful projects and achievements</p>
                            </div>

                            <div>
                                <span>✓</span>
                                <p>Keep formatting clean and professional</p>
                            </div>
                        </div>

                        <div className="resume-manager-tip">
                            <strong>💡 Tip</strong>
                            <p>
                                Keep one polished, up-to-date resume ready before
                                applying to your target opportunities.
                            </p>
                        </div>
                    </aside>
                </section>

                <section className="resume-manager-info-grid">
                    <div className="resume-manager-info-card">
                        <span>📎</span>
                        <div>
                            <strong>Supported formats</strong>
                            <p>PDF, DOC and DOCX</p>
                        </div>
                    </div>

                    <div className="resume-manager-info-card">
                        <span>⚡</span>
                        <div>
                            <strong>Maximum size</strong>
                            <p>5 MB per resume</p>
                        </div>
                    </div>

                    <div className="resume-manager-info-card">
                        <span>🔒</span>
                        <div>
                            <strong>Private storage</strong>
                            <p>Only your account can manage it</p>
                        </div>
                    </div>
                </section>
            </div>

        </main>
    );
};

export default ResumeManager;