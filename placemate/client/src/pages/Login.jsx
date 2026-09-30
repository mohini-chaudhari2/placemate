import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ErrorMessage from '../components/common/ErrorMessage';
import './Auth.css';

const getFieldError = (field, value) => {
  if (field === 'email' && value && !/\S+@\S+\.\S+/.test(value)) return 'Please enter a valid email address.';
  if (field === 'password' && value && value.length < 6) return 'Password must be at least 6 characters.';
  return '';
};

const Login = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: getFieldError(name, value) }));
    if (serverError) setServerError('');
  };

  const validate = () => {
    const errors = {};
    if (!form.email) errors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Please enter a valid email address.';
    if (!form.password) errors.password = 'Password is required.';
    else if (form.password.length < 6) errors.password = 'Password must be at least 6 characters.';
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
      const user = await login({ email: form.email, password: form.password });
      toast.success('Logged in successfully');
      if (user.role === 'student') navigate('/dashboard/student');
      else if (user.role === 'recruiter') navigate('/dashboard/recruiter');
      else if (user.role === 'admin') navigate('/dashboard/admin');
      else navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setServerError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <Link to="/" className="auth-card__logo" aria-label="PlaceMate Home">
            <span className="navbar__logo-mark" aria-hidden="true">PM</span>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)' }}>PlaceMate</span>
          </Link>
          <h1 className="auth-card__title">Welcome back</h1>
          <p className="auth-card__subtitle">Log in to continue your placement journey</p>
        </div>

        <form className="auth-card__form" onSubmit={handleSubmit} noValidate>
          {serverError && <ErrorMessage message={serverError} />}

          <Input
            id="login-email"
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
            id="login-password"
            name="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            error={fieldErrors.password}
            required
            autoComplete="current-password"
          />

          <Button type="submit" variant="primary" fullWidth loading={loading}>
            {loading ? 'Logging in…' : 'Log In'}
          </Button>
        </form>

        <div className="auth-card__footer">
          <p>Don&apos;t have an account? <Link to="/register">Create one</Link></p>
        </div>
      </div>
    </main>
  );
};

export default Login;
