import { useEffect, useState } from 'react';
import './StudentProfile.css';

import { Link, useLocation } from 'react-router-dom';

import api from '../services/api';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';



function StudentProfile() {

  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const location = useLocation();



  const [form, setForm] = useState(location.state?.formData || {

    name: '',

    email: '',

    phone: '',

    college: '',

    branch: '',

    graduationYear: '',

    cgpa: '',

    skills: '',

    resumeUrl: '',

    preferredLocations: '',

    preferredJobTypes: '',

    bio: '',

  });



  const [profileCompletion, setProfileCompletion] = useState(0);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState('');

  const [error, setError] = useState('');



  useEffect(() => {

    const loadProfile = async () => {

      if (!isAuthenticated) {

        setLoading(false);

        return;

      }



      try {

        setLoading(true);

        setError('');



        const response = await api.get('/student/profile');



        const user = response.data.user || {};

        const profile = response.data.profile || {};



        if (location.state?.skillsSaved && location.state?.formData) {
          setForm((prev) => ({
            ...prev,
            skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : ''
          }));
        } else {
          setForm({
            name: user.name || '',
            email: user.email || '',
            phone: profile.phone || '',
            college: profile.college || '',
            branch: profile.branch || '',
            graduationYear: profile.graduationYear || '',
            cgpa: profile.cgpa || '',
            skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : '',
            resumeUrl: profile.resumeUrl || '',
            preferredLocations: Array.isArray(profile.preferredLocations) ? profile.preferredLocations.join(', ') : '',
            preferredJobTypes: Array.isArray(profile.preferredJobTypes) ? profile.preferredJobTypes.join(', ') : '',
            bio: profile.bio || '',
          });
        }



        setProfileCompletion(profile.profileCompletion || 0);

      } catch (err) {

        console.error('Profile loading error:', err);



        setError(

          err.response?.data?.message ||

          'Unable to load your profile.'

        );

      } finally {

        setLoading(false);

      }

    };



    loadProfile();

  }, [isAuthenticated]);



  const handleChange = (event) => {

    const { name, value } = event.target;



    setForm((previous) => ({

      ...previous,

      [name]: value,

    }));

  };



  const handleSubmit = async (event) => {

    event.preventDefault();



    try {

      if (form.bio && form.bio.length > 1000) {

        setError('About You cannot exceed 1000 characters.');

        toast.error('About You cannot exceed 1000 characters.');

        return;

      }



      setSaving(true);

      setMessage('');

      setError('');



      const skills = form.skills

        .split(',')

        .map((skill) => skill.trim())

        .filter(Boolean);



      const preferredLocations = form.preferredLocations

        .split(',')

        .map((location) => location.trim())

        .filter(Boolean);



      const preferredJobTypes = form.preferredJobTypes

        .split(',')

        .map((jobType) => jobType.trim())

        .filter(Boolean);



      const response = await api.put('/student/profile', {

        fullName: form.name,

        email: form.email,

        phone: form.phone,

        college: form.college,

        branch: form.branch,

        graduationYear: form.graduationYear

          ? Number(form.graduationYear)

          : undefined,

        cgpa: form.cgpa ? Number(form.cgpa) : undefined,

        skills,

        resumeUrl: form.resumeUrl,

        preferredLocations,

        preferredJobTypes,

        bio: form.bio,

      });



      const updatedProfile = response.data.profile;



      setProfileCompletion(

        updatedProfile?.profileCompletion || 0

      );



      setForm((previous) => ({

        ...previous,

        name: response.data.user?.name || previous.name,

      }));



      setMessage('Profile updated successfully.');
      toast.success('Profile updated successfully.');

    } catch (err) {

      console.error('Profile update error:', err);



      const msg = err.response?.data?.message || 'Unable to update your profile.';
      setError(msg);
      toast.error(msg);

    } finally {

      setSaving(false);

    }

  };




  const profileChecklist = [
    {
      label: 'Personal details',
      description: 'Add your phone number and college.',
      complete: Boolean(form.name && form.phone && form.college),
    },
    {
      label: 'Academic details',
      description: 'Add branch, graduation year and CGPA.',
      complete: Boolean(form.branch && form.graduationYear && form.cgpa),
    },
    {
      label: 'Skills',
      description: 'Add the skills recruiters should see.',
      complete: Boolean(form.skills.trim()),
    },
    {
      label: 'Resume',
      description: 'Add a resume or resume URL.',
      complete: Boolean(form.resumeUrl.trim()),
    },
    {
      label: 'Job preferences',
      description: 'Set preferred locations and job types.',
      complete: Boolean(form.preferredLocations.trim() && form.preferredJobTypes.trim()),
    },
    {
      label: 'About you',
      description: 'Write a short professional bio.',
      complete: Boolean(form.bio.trim()),
    },
  ];

  const completedChecklistCount = profileChecklist.filter((item) => item.complete).length;


  if (!isAuthenticated) {

    return (

      <main className="page-wrapper">

        <div className="container">

          <div className="card">

            <h2>Please log in</h2>

            <p>You need to log in to manage your profile.</p>



            <Link to="/login" className="dashboard-button">

              Go to Login

            </Link>

          </div>

        </div>

      </main>

    );

  }



  if (loading) {

    return (

      <main className="page-wrapper">

        <div className="container">

          <div className="card">

            <h2>Loading profile...</h2>

            <p>Please wait while we load your profile information.</p>

          </div>

        </div>

      </main>

    );

  }



  return (

    <main className="profile-page">

      <div className="profile-page-container">

        <div className="profile-page-header">

          <div>

            <p className="dashboard-eyebrow">Student Portal</p>



            <h1>My Profile</h1>



            <p>

              Complete your profile to improve job matching and

              placement opportunities.

            </p>

          </div>



          <Link

            to="/dashboard/student"

            className="profile-back-button"

          >

            ← Dashboard

          </Link>

        </div>



        <div className="profile-completion-card">
          <div className="profile-completion-main">
            <div className="profile-completion-heading">
              <span>Profile Completion</span>
              <strong>{profileCompletion}%</strong>
            </div>

            <div className="profile-progress" aria-label={`Profile completion ${profileCompletion}%`}>
              <div
                className="profile-progress-bar"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>

            <p>
              {profileCompletion >= 90
                ? 'Your profile is almost placement-ready. Keep it updated for better matching.'
                : 'Add your academic details, skills, resume and preferences to improve job matching.'}
            </p>
          </div>

          <div className="profile-completion-summary">
            <strong>{completedChecklistCount}/{profileChecklist.length}</strong>
            <span>profile sections ready</span>
          </div>
        </div>

        <div className="profile-checklist-card">
          <div className="profile-section-heading">
            <div>
              <p className="dashboard-eyebrow">Placement Readiness</p>
              <h2>Complete Your Profile</h2>
              <p className="profile-checklist-intro">
                Finish the remaining items to strengthen your profile and improve personalized job matching.
              </p>
            </div>

            <span className={`profile-readiness-badge ${profileCompletion >= 80 ? 'ready' : ''}`}>
              {profileCompletion >= 80 ? '✓ Looking good' : 'Keep going'}
            </span>
          </div>

          <div className="profile-checklist">
            {profileChecklist.map((item) => (
              <div className={`profile-checklist-item ${item.complete ? 'complete' : ''}`} key={item.label}>
                <span className="profile-check-icon" aria-hidden="true">
                  {item.complete ? '✓' : '○'}
                </span>
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.complete ? 'Completed' : item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {message && (

          <div className="profile-success">

            ✓ {message}

          </div>

        )}



        {error && (

          <div className="profile-error">

            ⚠️ {error}

          </div>

        )}



        <form

          className="profile-form-card"

          onSubmit={handleSubmit}

        >

          <section className="profile-form-section">

            <div className="profile-section-heading">

              <div>

                <p className="dashboard-eyebrow">

                  Personal Information

                </p>

                <h2>Basic Details</h2>

              </div>

            </div>



            <div className="profile-form-grid">

              <div className="form-field">

                <label htmlFor="name">Full Name</label>



                <input

                  id="name"

                  name="name"

                  type="text"

                  value={form.name}

                  onChange={handleChange}

                  placeholder="Enter your full name"

                  required

                />

              </div>



              <div className="form-field">

                <label htmlFor="email">Email</label>



                <input

                  id="email"

                  name="email"

                  type="email"

                  value={form.email}

                  disabled

                />



                <small>

                  Email cannot be changed here.

                </small>

              </div>



              <div className="form-field">

                <label htmlFor="phone">Phone Number</label>



                <input

                  id="phone"

                  name="phone"

                  type="tel"

                  value={form.phone}

                  onChange={handleChange}

                  placeholder="Enter your phone number"

                />

              </div>



              <div className="form-field">

                <label htmlFor="college">College</label>



                <input

                  id="college"

                  name="college"

                  type="text"

                  value={form.college}

                  onChange={handleChange}

                  placeholder="Enter your college"

                />

              </div>

            </div>

          </section>



          <section className="profile-form-section">

            <div className="profile-section-heading">

              <div>

                <p className="dashboard-eyebrow">

                  Academic Information

                </p>

                <h2>Education</h2>

              </div>

            </div>



            <div className="profile-form-grid">

              <div className="form-field">

                <label htmlFor="branch">Branch / Course</label>



                <input

                  id="branch"

                  name="branch"

                  type="text"

                  value={form.branch}

                  onChange={handleChange}

                  placeholder="e.g. Computer Science"

                />

              </div>



              <div className="form-field">

                <label htmlFor="graduationYear">

                  Graduation Year

                </label>



                <input

                  id="graduationYear"

                  name="graduationYear"

                  type="number"

                  value={form.graduationYear}

                  onChange={handleChange}

                  placeholder="e.g. 2027"

                />

              </div>



              <div className="form-field">

                <label htmlFor="cgpa">CGPA</label>



                <input

                  id="cgpa"

                  name="cgpa"

                  type="number"

                  step="0.01"

                  min="0"

                  max="10"

                  value={form.cgpa}

                  onChange={handleChange}

                  placeholder="e.g. 8.50"

                />

              </div>

            </div>

          </section>



          <section className="profile-form-section">

            <div className="profile-section-heading">

              <div>

                <p className="dashboard-eyebrow">

                  Career Information

                </p>

                <h2>Skills & Preferences</h2>

              </div>

            </div>



            <div className="profile-form-grid">

              <div className="form-field form-field-full">

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>

                  <label htmlFor="skills" style={{ margin: 0 }}>

                    Skills

                  </label>

                  <Link
                    to="/skills"
                    state={{ returnTo: '/profile', formData: form }}
                    style={{
                      fontSize: '0.825rem',
                      color: 'var(--pm-primary)',

                      fontWeight: 600,

                      textDecoration: 'none',

                    }}

                  >

                    🧠 Open Skill Selector →

                  </Link>

                </div>



                <input

                  id="skills"

                  name="skills"

                  type="text"

                  value={form.skills}

                  onChange={handleChange}

                  placeholder="JavaScript, React, Node.js, MongoDB"

                />



                <small>

                  Separate multiple skills with commas.

                </small>

              </div>



              <div className="form-field form-field-full">

                <label htmlFor="resumeUrl">

                  Resume URL

                </label>



                <input

                  id="resumeUrl"

                  name="resumeUrl"

                  type="url"

                  value={form.resumeUrl}

                  onChange={handleChange}

                  placeholder="https://..."

                />

              </div>



              <div className="form-field">

                <label htmlFor="preferredLocations">

                  Preferred Locations

                </label>



                <input

                  id="preferredLocations"

                  name="preferredLocations"

                  type="text"

                  value={form.preferredLocations}

                  onChange={handleChange}

                  placeholder="Pune, Mumbai, Bengaluru"

                />



                <small>

                  Separate multiple locations with commas.

                </small>

              </div>



              <div className="form-field">

                <label htmlFor="preferredJobTypes">

                  Preferred Job Types

                </label>



                <input

                  id="preferredJobTypes"

                  name="preferredJobTypes"

                  type="text"

                  value={form.preferredJobTypes}

                  onChange={handleChange}

                  placeholder="Full-time, Internship"

                />



                <small>

                  Separate multiple job types with commas.

                </small>

              </div>



              <div className="form-field form-field-full">

                <label htmlFor="bio">About You</label>



                <textarea

                  id="bio"

                  name="bio"

                  value={form.bio}

                  onChange={handleChange}

                  placeholder="Tell recruiters about yourself..."

                  rows="5"

                  maxLength="1000"

                />

                <div className="form-help" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>

                  <small style={{ color: form.bio.length > 1000 ? 'red' : 'inherit' }}>

                    {form.bio.length}/1000

                  </small>

                </div>

              </div>

            </div>

          </section>



          <div className="profile-form-actions">

            <Link

              to="/dashboard/student"

              className="profile-cancel-button"

            >

              Cancel

            </Link>



            <button

              type="submit"

              className="dashboard-button"

              disabled={saving}

            >

              {saving ? 'Saving...' : 'Save Profile'}

            </button>

          </div>

        </form>

      </div>

    </main>

  );

}



export default StudentProfile;