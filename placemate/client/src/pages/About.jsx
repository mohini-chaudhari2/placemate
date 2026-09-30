import { Link } from 'react-router-dom';

function About() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="about-container">
          <p className="about-eyebrow">ABOUT PLACEMATE</p>

          <h1>
            Your Smarter Path to
            <span> Career Opportunities.</span>
          </h1>

          <p className="about-intro">
            PlaceMate is a placement management platform designed
            to connect students, recruiters, and administrators in
            one simple and intelligent ecosystem.
          </p>

          <div className="about-actions">
            <Link to="/register" className="about-primary-button">
              Get Started
            </Link>

            <Link to="/jobs" className="about-secondary-button">
              Explore Jobs
            </Link>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="about-container">

          <div className="about-heading">
            <p className="about-eyebrow">WHAT WE DO</p>
            <h2>Everything you need for your placement journey.</h2>
          </div>

          <div className="about-feature-grid">

            <div className="about-feature-card">
              <div className="about-feature-icon">🎓</div>
              <h3>For Students</h3>
              <p>
                Build your profile, showcase your skills, discover
                relevant opportunities, and track your applications
                from one dashboard.
              </p>
            </div>

            <div className="about-feature-card">
              <div className="about-feature-icon">💼</div>
              <h3>For Recruiters</h3>
              <p>
                Publish job opportunities, manage applicants, review
                candidates, and streamline your recruitment workflow.
              </p>
            </div>

            <div className="about-feature-card">
              <div className="about-feature-icon">📊</div>
              <h3>For Administrators</h3>
              <p>
                Monitor users, jobs, applications, platform activity,
                and placement analytics from a centralized dashboard.
              </p>
            </div>

          </div>
        </div>
      </section>

      <section className="about-section about-highlight">
        <div className="about-container">

          <div className="about-highlight-grid">

            <div>
              <p className="about-eyebrow">SMART MATCHING</p>

              <h2>
                Find opportunities that fit your profile.
              </h2>

              <p>
                PlaceMate can compare your skills, preferences,
                academic eligibility, and job requirements to help
                surface relevant opportunities.
              </p>
            </div>

            <div className="about-match-card">
              <div className="about-match-top">
                <span>Recommended Opportunity</span>
                <strong>92% Match</strong>
              </div>

              <h3>Software Developer</h3>

              <p>Technology Company</p>

              <div className="about-match-tags">
                <span>✓ JavaScript</span>
                <span>✓ React</span>
                <span>✓ Node.js</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      <section className="about-section">
        <div className="about-container">

          <div className="about-heading centered">
            <p className="about-eyebrow">OUR VISION</p>

            <h2>
              Making campus placements simpler, smarter,
              and more connected.
            </h2>

            <p>
              PlaceMate brings students, recruiters, and placement
              administrators together so everyone can manage the
              placement process more efficiently.
            </p>
          </div>

        </div>
      </section>

      <section className="about-cta">
        <div className="about-container">
          <h2>Ready to explore PlaceMate?</h2>

          <p>
            Start discovering opportunities and take the next step
            toward your career.
          </p>

          <Link to="/register" className="about-primary-button">
            Create Your Account
          </Link>
        </div>
      </section>
    </main>
  );
}

export default About;