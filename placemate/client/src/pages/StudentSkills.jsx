import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import SkillSelector from '../components/common/SkillSelector';
import { useToast } from '../context/ToastContext';

function StudentSkills() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [skills, setSkills] = useState([]);
  const [profileCompletion, setProfileCompletion] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Load student's currently saved skills and profile
  useEffect(() => {
    let isMounted = true;

    const loadSkills = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const response = await api.get('/student/skills');

        if (isMounted) {
          setSkills(response.data.skills || []);
          setProfileCompletion(response.data.profileCompletion || 0);
        }
      } catch (err) {
        console.error('Skills loading error:', err);
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              'Unable to load your skills. Please check your connection.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSkills();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const handleSkillsChange = (newSkills) => {
    setSkills(newSkills);
    setError('');
    setMessage('');
  };

  const saveSkills = async () => {
    try {
      setSaving(true);
      setError('');
      setMessage('');

      const response = await api.put('/student/skills', {
        skills,
      });

      setSkills(response.data.skills || []);
      const newCompletion = response.data.profileCompletion || 0;
      setProfileCompletion(newCompletion);

      setMessage(
        `Your skills have been updated successfully! Profile completion is now ${newCompletion}%.`
      );

      if (location.state?.returnTo) {
        toast.success('Skills updated successfully');
        navigate(location.state.returnTo, {
          state: { formData: location.state.formData, skillsSaved: true }
        });
      }
    } catch (err) {
      console.error('Skills update error:', err);

      setError(
        err.response?.data?.message ||
          'Could not update skills. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="page-wrapper">
        <div className="container" style={{ padding: '3rem 1rem' }}>
          <div className="card" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center', padding: '2.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
            <h2 style={{ marginBottom: '0.5rem' }}>Authentication Required</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Please log in as a student to manage your skills and career profile.
            </p>
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
        <div className="container" style={{ padding: '3rem 1rem' }}>
          <div className="card" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center', padding: '2.5rem' }}>
            <div className="btn__spinner" style={{ width: '2.5rem', height: '2.5rem', borderTopColor: 'var(--primary)', margin: '0 auto 1.5rem' }} />
            <h2>Loading your skills...</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Fetching your standardized skill profile and library...
            </p>
          </div>
        </div>
      </main>
    );
  }

  const skillCount = skills.length;

  return (
    <main className="skills-page">
      <div className="skills-page-container">

        {/* Hero Header */}
        <section className="skills-hero">
          <div>
            <span className="skills-hero-badge">
              🧠 PlaceMate Skill Library & Selector
            </span>

            <h1>
              Build your <span>standardized skill set</span>
            </h1>

            <p>
              Select your technical and professional skills from our standardized
              skill library. PlaceMate uses these skills for smart job recommendations,
              match percentage calculations, and recruiter search.
            </p>
          </div>

          <Link
            to="/dashboard/student"
            className="profile-back-button"
            id="back-to-dashboard-btn"
          >
            ← Back to Dashboard
          </Link>
        </section>

        {/* Stats Summary */}
        <section className="skills-summary-grid">
          <div className="skills-summary-card">
            <div className="skills-summary-icon">
              🧠
            </div>
            <div>
              <span>Selected Skills</span>
              <strong>{skillCount}</strong>
            </div>
          </div>

          <div className="skills-summary-card">
            <div className="skills-summary-icon">
              📈
            </div>
            <div>
              <span>Profile Completion</span>
              <strong>{profileCompletion}%</strong>
            </div>
          </div>

          <div className="skills-summary-card">
            <div className="skills-summary-icon">
              🚀
            </div>
            <div>
              <span>Next Step</span>
              <strong>Find Matches</strong>
            </div>
          </div>
        </section>

        {/* Feedback Alerts */}
        {message && (
          <div className="profile-success" role="alert" style={{ marginBottom: '1.5rem' }}>
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="profile-error" role="alert" style={{ marginBottom: '1.5rem' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Main Layout Grid */}
        <div className="skills-layout">

          {/* Left: Interactive Multi-Select Skill Selector */}
          <section className="skills-main-card">
            <div className="skills-card-heading">
              <div>
                <p className="dashboard-eyebrow">
                  Skill Selection
                </p>
                <h2>Choose Your Skills</h2>
                <p>
                  Search by name, pick popular skills, or filter by category to select your technical proficiencies.
                </p>
              </div>
            </div>

            <SkillSelector
              selectedSkills={skills}
              onChange={handleSkillsChange}
              allowCustom={true}
              maxSkills={50}
            />
          </section>

          {/* Right: Selected Skills Summary & Actions */}
          <aside className="skills-side-card">
            <div className="skills-side-header">
              <div>
                <p className="dashboard-eyebrow">
                  Profile Status
                </p>
                <h2>
                  Selected ({skillCount})
                </h2>
              </div>
            </div>

            {skills.length > 0 ? (
              <div className="selected-skills-list">
                {skills.map((skill) => (
                  <div className="selected-skill" key={skill}>
                    <span className="selected-skill-check">✓</span>
                    <span className="selected-skill-name">{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleSkillsChange(skills.filter((s) => s !== skill))}
                      aria-label={`Remove ${skill}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="skills-empty">
                <div>🧩</div>
                <h3>No skills added yet</h3>
                <p>
                  Select skills from the left panel to build your profile.
                </p>
              </div>
            )}

            <div className="skills-tip">
              <strong>💡 Smart Placement Matching</strong>
              <p>
                Each skill you add is automatically compared against job requirements
                to calculate match percentages and identify skill gaps.
              </p>
            </div>

            <div className="skills-side-actions">
              <button
                type="button"
                id="save-skills-button"
                className="dashboard-button skills-save-button"
                onClick={saveSkills}
                disabled={saving}
              >
                {saving ? 'Saving Changes...' : '✓ Save My Skills'}
              </button>

              <Link
                to="/jobs"
                className="skills-explore-button"
                id="explore-jobs-btn"
              >
                Explore Jobs →
              </Link>
            </div>
          </aside>
        </div>

        {/* Placement Roadmap */}
        <section className="skills-roadmap">
          <div>
            <span className="skills-roadmap-icon">1</span>
            <div>
              <strong>Add Skills</strong>
              <p>Build your standardized skill profile.</p>
            </div>
          </div>

          <span className="skills-roadmap-arrow">→</span>

          <div>
            <span className="skills-roadmap-icon">2</span>
            <div>
              <strong>Smart Matching</strong>
              <p>PlaceMate calculates your fit with open roles.</p>
            </div>
          </div>

          <span className="skills-roadmap-arrow">→</span>

          <div>
            <span className="skills-roadmap-icon">3</span>
            <div>
              <strong>Skill Gap Insights</strong>
              <p>Identify missing skills to level up your resume.</p>
            </div>
          </div>

          <span className="skills-roadmap-arrow">→</span>

          <div>
            <span className="skills-roadmap-icon">4</span>
            <div>
              <strong>Placement Success</strong>
              <p>Get shortlisted and ace your interviews.</p>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}

export default StudentSkills;