import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import '../components/layout/layout.css';
import './Home.css';

const WorkflowStep = ({ step, icon, label }) => (
  <div className="workflow-step">
    <div className="workflow-step__icon" aria-hidden="true">{icon}</div>
    <div className="workflow-step__number">{step}</div>
    <p className="workflow-step__label">{label}</p>
  </div>
);

const FeatureCard = ({ icon, title, description }) => (
  <div className="feature-card card card--hover">
    <div className="feature-card__icon" aria-hidden="true">{icon}</div>
    <h3 className="feature-card__title">{title}</h3>
    <p className="feature-card__desc">{description}</p>
  </div>
);

const FlowStep = ({ icon, label, description, isLast }) => (
  <div className="flow-item">
    <div className="flow-item__node">
      <div className="flow-item__icon" aria-hidden="true">{icon}</div>
      {!isLast && <div className="flow-item__connector" aria-hidden="true" />}
    </div>
    <div className="flow-item__content">
      <h4 className="flow-item__label">{label}</h4>
      <p className="flow-item__desc">{description}</p>
    </div>
  </div>
);

const WhyCard = ({ icon, title, description }) => (
  <div className="why-card">
    <span className="why-card__icon" aria-hidden="true">{icon}</span>
    <h3 className="why-card__title">{title}</h3>
    <p className="why-card__desc">{description}</p>
  </div>
);

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  const getDashboardLink = () => {
    if (!user) return '/register';
    if (user.role === 'student') return '/dashboard/student';
    if (user.role === 'recruiter') return '/dashboard/recruiter';
    return '/dashboard/admin';
  };

  return (
    <div className="page-content">
      {/* ─── Hero ─── */}
      <section className="hero-section">
        <div className="container hero-section__inner">
          <div className="hero-section__badge">
            <span className="hero-badge">🎓 Campus Placement Platform</span>
          </div>
          <h1 className="hero-section__title">
            Your Placement Journey,{' '}
            <span className="hero-section__title-accent">Connected.</span>
          </h1>
          <p className="hero-section__subtitle">
            Discover opportunities, understand your skill gaps, and track your journey
            from profile to placement — all in one place.
          </p>
          <div className="hero-section__cta">
            <Link to="/jobs">
              <Button variant="primary" className="btn--lg">Explore Opportunities</Button>
            </Link>
            <Link to={isAuthenticated ? getDashboardLink() : '/register'}>
              <Button variant="outline" className="btn--lg">Build Your Placement Profile</Button>
            </Link>
          </div>

          {/* Product pillars instead of fake stats */}
          <div className="hero-pillars">
            {[
              { icon: '👤', flow: 'Profile → Opportunity' },
              { icon: '🎯', flow: 'Skills → Matching' },
              { icon: '📋', flow: 'Application → Tracking' },
              { icon: '🏆', flow: 'Journey → Placement' },
            ].map((p, i) => (
              <div key={i} className="hero-pillar">
                <span className="hero-pillar__icon" aria-hidden="true">{p.icon}</span>
                <span className="hero-pillar__text">{p.flow}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-header">
            <span className="section-label">How PlaceMate Works</span>
            <h2 className="section-title">Your end-to-end placement workflow</h2>
            <p className="section-subtitle">
              PlaceMate structures your entire campus placement journey into one connected flow.
            </p>
          </div>
          <div className="workflow-steps">
            {[
              { step: '01', icon: '👤', label: 'Build Your Profile' },
              { step: '02', icon: '🔍', label: 'Discover Jobs' },
              { step: '03', icon: '🎯', label: 'Smart Skill Match' },
              { step: '04', icon: '📤', label: 'Apply Instantly' },
              { step: '05', icon: '📊', label: 'Track Your Journey' },
            ].map((step) => (
              <WorkflowStep key={step.step} {...step} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Smart Skill Match ─── */}
      <section className="section">
        <div className="container skill-match-section">
          <div className="skill-match-section__content">
            <span className="section-label">Smart Skill Match</span>
            <h2 className="section-title">Know exactly where you stand</h2>
            <p className="section-subtitle">
              PlaceMate compares your profile skills against job requirements to identify exactly which
              skills you have, which you are missing, and what you should learn next.
            </p>
            <ul className="skill-match-section__points">
              {[
                '✔ See your skill match percentage for every job',
                '✔ Identify skill gaps before you apply',
                '✔ Get targeted learning suggestions',
                '✔ Improve your placement readiness score',
              ].map((point, i) => (
                <li key={i} className="skill-match-section__point">{point}</li>
              ))}
            </ul>
            <Link to={isAuthenticated ? getDashboardLink() : '/register'}>
              <Button variant="primary" className="btn--lg">Check Your Skill Match</Button>
            </Link>
          </div>
          <div className="skill-match-section__visual" aria-hidden="true">
            <div className="skill-visual-card">
              <div className="skill-visual-card__header">
                <span className="skill-visual-card__title">Skill Match Analysis</span>
                <span className="badge badge--success">74% Match</span>
              </div>
              <div className="skill-bars">
                {[
                  { skill: 'React.js', pct: 95, status: 'match' },
                  { skill: 'Node.js', pct: 80, status: 'match' },
                  { skill: 'MongoDB', pct: 60, status: 'partial' },
                  { skill: 'TypeScript', pct: 0, status: 'gap' },
                  { skill: 'Docker', pct: 0, status: 'gap' },
                ].map((s) => (
                  <div key={s.skill} className="skill-bar">
                    <div className="skill-bar__meta">
                      <span className="skill-bar__name">{s.skill}</span>
                      {s.status === 'gap' && <span className="badge badge--danger">Gap</span>}
                      {s.status === 'match' && <span className="badge badge--success">✓</span>}
                      {s.status === 'partial' && <span className="badge badge--warning">Partial</span>}
                    </div>
                    <div className="skill-bar__track">
                      <div
                        className={`skill-bar__fill skill-bar__fill--${s.status}`}
                        style={{ width: `${s.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="skill-visual-card__note">* Demo view — your data will appear after you build your profile</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Placement Journey Flow ─── */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Placement Journey</span>
            <h2 className="section-title">From profile to placement — tracked</h2>
            <p className="section-subtitle">
              Every step of your placement lifecycle is visible, actionable, and connected.
            </p>
          </div>
          <div className="flow-list">
            {[
              { icon: '👤', label: 'Student Profile', description: 'Build a comprehensive profile with your skills, education, CGPA, and preferences.', isLast: false },
              { icon: '🔬', label: 'Skill Gap Analysis', description: 'Instantly see which skills you have and which ones a job requires.', isLast: false },
              { icon: '🎯', label: 'Job Recommendations', description: 'Get jobs ranked by how well your skills match the requirements.', isLast: false },
              { icon: '📤', label: 'Applications', description: 'Apply directly and monitor every application in one dashboard.', isLast: false },
              { icon: '🏆', label: 'Placement Confirmed', description: 'Track your final placement outcome and celebrate your journey.', isLast: true },
            ].map((step) => (
              <FlowStep key={step.label} {...step} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Student Features ─── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">For Students</span>
            <h2 className="section-title">Everything you need to get placed</h2>
          </div>
          <div className="grid-3">
            {[
              { icon: '🎓', title: 'Placement Profile', description: 'Create a structured profile with your education, skills, CGPA, resume, and job preferences.' },
              { icon: '🔍', title: 'Smart Job Discovery', description: 'Browse and filter jobs that match your branch, graduation year, and skill profile.' },
              { icon: '🎯', title: 'Skill Gap Detection', description: 'Instantly understand what skills a job needs vs. what you currently have.' },
              { icon: '📊', title: 'Application Tracking', description: 'Monitor every application status — Applied, Shortlisted, Interview, Selected, or Rejected.' },
              { icon: '📚', title: 'Learning Resources', description: 'Access curated learning paths for every skill gap identified through your profile.' },
              { icon: '🔔', title: 'Real-time Notifications', description: 'Stay updated on application status changes, new matching jobs, and deadlines.' },
            ].map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Recruiter Features ─── */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-header">
            <span className="section-label">For Recruiters</span>
            <h2 className="section-title">Hire campus talent with precision</h2>
          </div>
          <div className="grid-3">
            {[
              { icon: '📝', title: 'Post Jobs', description: 'Create detailed job postings with required skills, eligibility criteria, and deadlines.' },
              { icon: '👥', title: 'Applicant Management', description: 'View, filter, and manage all applicants for your open positions in one dashboard.' },
              { icon: '🔄', title: 'Status Workflow', description: 'Move candidates through Applied → Shortlisted → Interview → Selected or Rejected.' },
              { icon: '🎯', title: 'Skill-based Filtering', description: 'Filter candidates based on CGPA, branch, graduation year, and required skills.' },
              { icon: '📩', title: 'Recruiter Notes', description: 'Add private notes to each applicant to collaborate with your hiring team.' },
              { icon: '✅', title: 'Verified Profiles', description: 'Recruiter accounts go through an admin verification process to maintain platform trust.' },
            ].map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why PlaceMate ─── */}
      <section className="section why-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Why PlaceMate</span>
            <h2 className="section-title">Built for campus placement excellence</h2>
          </div>
          <div className="grid-3">
            {[
              { icon: '🔗', title: 'Everything Connected', description: 'Your profile, skills, jobs, applications, and journey are all linked in a single platform.' },
              { icon: '🏫', title: 'Campus-native Design', description: 'Designed specifically for the campus placement process — not adapted from general job boards.' },
              { icon: '🔐', title: 'Role-based Access', description: 'Students, recruiters, and placement admins each have dedicated, purpose-built dashboards.' },
              { icon: '📈', title: 'Placement Readiness', description: 'Track your profile completeness and placement readiness as a measurable score.' },
              { icon: '🛡', title: 'Privacy First', description: 'Your data is only visible to recruiters you apply to — not shared without your action.' },
              { icon: '📱', title: 'Works Everywhere', description: 'Fully responsive on mobile, tablet, and desktop — placement management on the go.' },
            ].map((w) => (
              <WhyCard key={w.title} {...w} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-box">
            <h2 className="cta-box__title">Ready to connect your placement journey?</h2>
            <p className="cta-box__desc">
              Join PlaceMate today — build your profile, discover matching opportunities, and track every step.
            </p>
            <div className="cta-box__actions">
              <Link to="/register">
                <Button variant="primary" className="btn--lg">Get Started Free</Button>
              </Link>
              <Link to="/jobs">
                <Button variant="outline" className="btn--lg cta-box__outline-btn">Browse Jobs</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
