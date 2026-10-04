import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import styles from './LoginPage.module.css';

const ROLES = [
  {
    id: 'student',
    label: 'Student',
    icon: '🎓',
    placeholder: 'student@university.edu',
    dashboard: '/student/dashboard',
  },
  {
    id: 'company',
    label: 'Company',
    icon: '🏢',
    placeholder: 'contact@company.com',
    dashboard: '/company/dashboard',
  },
  {
    id: 'professor',
    label: 'Professor',
    icon: '👨‍🏫',
    placeholder: 'professor@university.edu',
    dashboard: '/professor/dashboard',
  },
];

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'student';

  const [role, setRole]         = useState(initialRole);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const navigate      = useNavigate();
  const selectedRole  = ROLES.find((r) => r.id === role);

  const handleRoleChange = (id) => {
    setRole(id);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      // TODO: replace with real API call to POST /api/auth/login
      await new Promise((res) => setTimeout(res, 700)); // simulate network
      navigate(selectedRole.dashboard);
    } catch {
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>UniWork</Link>
        <p className={styles.subtitle}>Sign in to your account</p>

        {/* Role Selector */}
        <div className={styles.roleTabs}>
          {ROLES.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`${styles.roleTab} ${role === r.id ? styles.roleTabActive : ''}`}
              onClick={() => handleRoleChange(r.id)}
            >
              <span className={styles.roleIcon}>{r.icon}</span>
              <span className={styles.roleLabel}>{r.label}</span>
            </button>
          ))}
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {error && (
            <div className={styles.errorBox} role="alert">
              <i className="bi bi-exclamation-circle" /> {error}
            </div>
          )}

          {/* Email */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder={selectedRole.placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Password</label>
            <div className={styles.pwWrap}>
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                className={styles.input}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.pwToggle}
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                <i className={`bi ${showPw ? 'bi-eye-slash' : 'bi-eye'}`} />
              </button>
            </div>
          </div>

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading
              ? 'Signing in…'
              : `Sign In as ${selectedRole.label}`}
          </button>
        </form>

        <div className={styles.footer}>
          <Link to="/" className={styles.backLink}>← Back to Home</Link>
        </div>

        {/* Dev hint */}
        <div className={styles.devHint}>
          <strong>Dev:</strong> any email + password navigates to the dashboard
        </div>
      </div>
    </div>
  );
}
