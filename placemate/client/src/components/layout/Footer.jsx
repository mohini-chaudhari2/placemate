import { Link } from 'react-router-dom';
import './layout.css';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Link to="/" className="navbar__logo footer__logo">
            <span className="navbar__logo-mark" aria-hidden="true">PM</span>
            <span className="navbar__logo-text">PlaceMate</span>
          </Link>
          <p className="footer__tagline">
            Connecting students, recruiters, and placement teams — all in one platform.
          </p>
        </div>

        <div className="footer__links">
          <div className="footer__col">
            <h4 className="footer__col-title">Platform</h4>
            <Link to="/jobs" className="footer__link">Browse Jobs</Link>
            <Link to="/register" className="footer__link">Student Sign Up</Link>
            <Link to="/register?role=recruiter" className="footer__link">Post Jobs</Link>
          </div>
          <div className="footer__col">
            <h4 className="footer__col-title">Company</h4>
            <Link to="/about" className="footer__link">About</Link>
          </div>
          <div className="footer__col">
            <h4 className="footer__col-title">Account</h4>
            <Link to="/login" className="footer__link">Log In</Link>
            <Link to="/register" className="footer__link">Register</Link>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p className="footer__copy">© {year} PlaceMate. All rights reserved.</p>
          <p className="footer__copy footer__copy--muted">Built for campus placement excellence.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
