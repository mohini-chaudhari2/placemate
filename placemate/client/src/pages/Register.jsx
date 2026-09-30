import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ErrorMessage from '../components/common/ErrorMessage';
import './Auth.css';

const ROLES = [
  { value: 'student', label: '🎓 Student', desc: 'I am looking for placement opportunities' },
  { value: 'recruiter', label: '🏢 Recruiter', desc: 'I want to post jobs and hire campus talent' },
];

const Register = () => {
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const defaultRole = searchParams.get('role') === 'recruiter' ? 'recruiter' : 'student';

  const [form, setForm] = useState({ name: '', email: '', password: '', role: defaultRole });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Full name is required.';
    else if (form.name.trim().length < 2) errors.name = 'Name must be at least 2 characters.';
    if (!form.email) errors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Please enter a valid email address.';
    if (!form.password) errors.password = 'Password is required.';
    else if (form.password.length < 6) errors.password = 'Password must be at least 6 characters.';
    if (!form.role) errors.role = 'Please select a role.';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setServerError('');
    try {
      const user = await register({ name: form.name.trim(), email: form.email, password: form.password, role: form.role });
      toast.success('Registration successful');
      if (user.role === 'student') navigate('/dashboard/student');
      else if (user.role === 'recruiter') navigate('/dashboard/recruiter');
      else navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setServerError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card auth-card--wide">
        <div className="auth-card__header">
          <Link to="/" className="auth-card__logo" aria-label="PlaceMate Home">
            <span className="navbar__logo-mark" aria-hidden="true">PM</span>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)' }}>PlaceMate</span>
          </Link>
          <h1 className="auth-card__title">Create your account</h1>
          <p className="auth-card__subtitle">Start your placement journey today</p>
        </div>

        <form className="auth-card__form" onSubmit={handleSubmit} noValidate>
          {serverError && <ErrorMessage message={serverError} />}

          {/* Role Selector */}
          <div className="role-selector" role="group" aria-label="Select your role">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                className={`role-option${form.role === r.value ? ' role-option--active' : ''}`}
                onClick={() => { setForm((p) => ({ ...p, role: r.value })); setFieldErrors((p) => ({ ...p, role: '' })); }}
                aria-pressed={form.role === r.value}
              >
                <span className="role-option__label">{r.label}</span>
                <span className="role-option__desc">{r.desc}</span>
              </button>
            ))}
          </div>
          {fieldErrors.role && <p className="input-error">{fieldErrors.role}</p>}

          <Input
            id="register-name"
            name="name"
            type="text"
            label="Full name"
            placeholder="Jane Smith"
            value={form.name}
            onChange={handleChange}
            error={fieldErrors.name}
            required
            autoComplete="name"
          />
          <Input
            id="register-email"
            name="email"
            type="email"
            label="Email address"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            error={fieldErrors.email}
            required
            autoComplete="email"
          />
          <Input
            id="register-password"
            name="password"
            type="password"
            label="Password"
            placeholder="Min. 6 characters"
            value={form.password}
            onChange={handleChange}
            error={fieldErrors.password}
            required
            autoComplete="new-password"
          />

          <Button type="submit" variant="primary" fullWidth loading={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>

        <div className="auth-card__footer">
          <p>Already have an account? <Link to="/login">Log in</Link></p>
        </div>
      </div>
    </main>
  );
};

export default Register;
