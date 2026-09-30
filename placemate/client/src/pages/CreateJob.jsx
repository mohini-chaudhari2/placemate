import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import api from '../services/api';
import SkillSelector from '../components/common/SkillSelector';
import { useToast } from '../context/ToastContext';

const branchOptions = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Electrical',
  'Mechanical',
  'Civil',
  'Artificial Intelligence',
  'Data Science',
];

const CreateJob = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
    companyName: '',
    title: '',
    description: '',
    location: '',
    jobType: 'Full Time',
    experience: 'Fresher',
    salary: '',
    applicationDeadline: '',
    minCgpa: '',
    branches: [],
    batches: [],
    status: 'open',
  });

  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const toggleBranch = (branch) => {
    setForm((previous) => ({
      ...previous,
      branches: previous.branches.includes(branch)
        ? previous.branches.filter((item) => item !== branch)
        : [...previous.branches, branch],
    }));
  };

  const toggleBatch = (batch) => {
    setForm((previous) => ({
      ...previous,
      batches: previous.batches.includes(batch)
        ? previous.batches.filter((item) => item !== batch)
        : [...previous.batches, batch],
    }));
  };

  useEffect(() => {
    if (!showPreview) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') setShowPreview(false);
    };

    document.addEventListener('keydown', handleEscape);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = originalOverflow;
    };
  }, [showPreview]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!form.companyName.trim()) {
      setError('Please enter the company name.');
      return;
    }
    if (!form.title.trim()) {
      setError('Please enter the job title.');
      return;
    }
    if (!form.description.trim()) {
      setError('Please enter the job description.');
      return;
    }
    if (skills.length === 0) {
      setError('Please add at least one required skill.');
      return;
    }
    if (
      form.minCgpa !== '' &&
      (Number(form.minCgpa) < 0 || Number(form.minCgpa) > 10)
    ) {
      setError('Minimum CGPA must be between 0 and 10.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        companyName: form.companyName.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        jobType: form.jobType,
        experience: form.experience,
        salary: form.salary.trim(),
        requiredSkills: skills,
        eligibility: {
          minCgpa: form.minCgpa === '' ? undefined : Number(form.minCgpa),
          branches: form.branches,
          batch: form.batches,
        },
        applicationDeadline: form.applicationDeadline || undefined,
        status: form.status,
      };

      const response = await api.post('/recruiter/jobs', payload);

      const msg = response.data?.message || 'Job created successfully.';
      setSuccess(msg);
      toast.success(msg);
      setTimeout(() => navigate('/dashboard/recruiter'), 700);
    } catch (err) {
      console.error('Create job error:', err);
      const msg = err.response?.data?.message || 'Unable to create the job. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-wrapper">
      <div className="container create-job-page">
        <section className="create-job-header">
          <div>
            <Link to="/dashboard/recruiter" className="back-link">
              ← Back to Recruiter Dashboard
            </Link>
            <span className="section-eyebrow">Recruiter Workspace</span>
            <h1>Post a New Job</h1>
            <p>
              Create a detailed job posting to help students discover the
              right opportunity.
            </p>
          </div>
        </section>

        {error && (
          <div className="form-alert form-alert-error">
            <span>⚠️</span><span>{error}</span>
          </div>
        )}

        {success && (
          <div className="form-alert form-alert-success">
            <span>✅</span><span>{success}</span>
          </div>
        )}

        <form
          id="create-job-form"
          className="create-job-layout create-job-layout-full"
          onSubmit={handleSubmit}
        >
          <div className="create-job-main">
            <section className="card form-section">
              <div className="form-section-header">
                <div className="form-section-number">1</div>
                <div>
                  <h2>Basic Information</h2>
                  <p>Tell students about the opportunity.</p>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="companyName">Company Name *</label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    placeholder="e.g. Microsoft"
                    value={form.companyName}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="title">Job Title *</label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="e.g. Software Engineer"
                    value={form.title}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Job Description *</label>
                <textarea
                  id="description"
                  name="description"
                  rows="7"
                  placeholder="Describe the role, responsibilities and what the candidate will work on..."
                  value={form.description}
                  onChange={handleChange}
                />
                <span className="form-help">
                  Give students enough information to understand the role.
                </span>
              </div>
            </section>

            <section className="card form-section">
              <div className="form-section-header">
                <div className="form-section-number">2</div>
                <div>
                  <h2>Job Details</h2>
                  <p>Add information about the position.</p>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    placeholder="e.g. Bengaluru / Remote"
                    value={form.location}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="jobType">Job Type</label>
                  <select id="jobType" name="jobType" value={form.jobType} onChange={handleChange}>
                    <option>Full Time</option>
                    <option>Part Time</option>
                    <option>Internship</option>
                    <option>Contract</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="experience">Experience</label>
                  <select id="experience" name="experience" value={form.experience} onChange={handleChange}>
                    <option>Fresher</option>
                    <option>0-1 Years</option>
                    <option>1-2 Years</option>
                    <option>2-3 Years</option>
                    <option>3+ Years</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="salary">Salary</label>
                  <input
                    id="salary"
                    name="salary"
                    type="text"
                    placeholder="e.g. ₹6-8 LPA"
                    value={form.salary}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="applicationDeadline">Application Deadline</label>
                  <input
                    id="applicationDeadline"
                    name="applicationDeadline"
                    type="date"
                    value={form.applicationDeadline}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="status">Posting Status</label>
                  <select id="status" name="status" value={form.status} onChange={handleChange}>
                    <option value="open">Open</option>
                    <option value="draft">Draft</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="card form-section">
              <div className="form-section-header">
                <div className="form-section-number">3</div>
                <div>
                  <h2>Required Skills</h2>
                  <p>Add the skills students should have for this role.</p>
                </div>
              </div>
              <SkillSelector
                selectedSkills={skills}
                onChange={setSkills}
                allowCustom={true}
                maxSkills={30}
              />
            </section>

            <section className="card form-section">
              <div className="form-section-header">
                <div className="form-section-number">4</div>
                <div>
                  <h2>Eligibility</h2>
                  <p>Define who can apply for this role.</p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="minCgpa">Minimum CGPA</label>
                <input
                  id="minCgpa"
                  name="minCgpa"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  placeholder="e.g. 7.5"
                  value={form.minCgpa}
                  onChange={handleChange}
                />
                <span className="form-help">
                  Leave blank if there is no CGPA requirement.
                </span>
              </div>

              <div className="eligibility-block">
                <h3>Eligible Branches</h3>
                <div className="checkbox-grid">
                  {branchOptions.map((branch) => (
                    <label className="checkbox-card" key={branch}>
                      <input
                        type="checkbox"
                        checked={form.branches.includes(branch)}
                        onChange={() => toggleBranch(branch)}
                      />
                      <span>{branch}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="eligibility-block">
                <h3>Eligible Graduation Batches</h3>
                <div className="batch-options">
                  {[2026, 2027, 2028, 2029].map((batch) => (
                    <label className="batch-option" key={batch}>
                      <input
                        type="checkbox"
                        checked={form.batches.includes(batch)}
                        onChange={() => toggleBatch(batch)}
                      />
                      <span>{batch}</span>
                    </label>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </form>

        <div className="create-job-actions">
          <Link to="/dashboard/recruiter" className="btn btn-outline">
            Cancel
          </Link>

          <button
            type="button"
            className="btn btn-secondary create-job-preview-button"
            onClick={() => setShowPreview(true)}
          >
            👁 Preview Job
          </button>

          <button
            type="submit"
            form="create-job-form"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating Job...' : 'Publish Job'}
          </button>
        </div>

        {showPreview && (
          <div
            className="job-preview-modal-backdrop"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setShowPreview(false);
            }}
          >
            <section
              className="job-preview-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="job-preview-title"
            >
              <div className="job-preview-modal-header">
                <div>
                  <span className="section-eyebrow">Live Preview</span>
                  <h2 id="job-preview-title">Job Posting Preview</h2>
                  <p>This is how students will see the opportunity.</p>
                </div>
                <button
                  type="button"
                  className="job-preview-close"
                  onClick={() => setShowPreview(false)}
                  aria-label="Close job preview"
                >
                  ×
                </button>
              </div>

              <div className="job-preview-modal-body">
                <div className="job-preview-hero">
                  <div className="job-preview-company-icon">
                    {form.companyName.trim()
                      ? form.companyName.trim().charAt(0).toUpperCase()
                      : 'P'}
                  </div>
                  <div>
                    <span className="job-preview-label">
                      {form.companyName || 'Company name'}
                    </span>
                    <h3>{form.title || 'Your job title'}</h3>
                    <p>{form.location || 'Location not specified'}</p>
                  </div>
                </div>

                <div className="job-preview-meta">
                  <span>💼 {form.jobType}</span>
                  <span>🎓 {form.experience}</span>
                  {form.salary && <span>💰 {form.salary}</span>}
                  {form.applicationDeadline && (
                    <span>
                      📅 Deadline:{' '}
                      {new Date(`${form.applicationDeadline}T00:00:00`).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="job-preview-content-section">
                  <h4>About the role</h4>
                  <p className="job-preview-description">
                    {form.description || 'Your job description will appear here.'}
                  </p>
                </div>

                <div className="job-preview-content-section">
                  <h4>Required Skills</h4>
                  {skills.length > 0 ? (
                    <div className="job-preview-skill-list">
                      {skills.map((skill) => (
                        <span className="job-preview-skill" key={skill}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="job-preview-muted">No required skills added yet.</p>
                  )}
                </div>

                <div className="job-preview-content-section">
                  <h4>Eligibility</h4>
                  <div className="job-preview-eligibility">
                    {form.minCgpa && <span>Minimum CGPA: {form.minCgpa}</span>}
                    {form.branches.length > 0 && (
                      <span>Branches: {form.branches.join(', ')}</span>
                    )}
                    {form.batches.length > 0 && (
                      <span>Batches: {form.batches.join(', ')}</span>
                    )}
                    {!form.minCgpa && form.branches.length === 0 && form.batches.length === 0 && (
                      <span>No additional eligibility restrictions specified.</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="job-preview-modal-footer">
                <span>
                  Status:{' '}
                  <strong>
                    {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                  </strong>
                </span>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowPreview(false)}
                >
                  Close Preview
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
};

export default CreateJob;
