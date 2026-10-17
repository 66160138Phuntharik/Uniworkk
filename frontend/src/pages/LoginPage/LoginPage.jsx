import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitcher from '../../components/LanguageSwitcher/LanguageSwitcher';
import styles from './LoginPage.module.css';

const ROLES = [
  {
    id: 'student',
    labelKey: 'role_student',
    icon: '🎓',
    placeholder: 'student@university.edu',
    dashboard: '/student/dashboard',
  },
  {
    id: 'company',
    labelKey: 'role_company',
    icon: '🏢',
    placeholder: 'contact@company.com',
    dashboard: '/company/dashboard',
  },
  {
    id: 'professor',
    labelKey: 'role_professor',
    icon: '👨‍🏫',
    placeholder: 'professor@university.edu',
    dashboard: '/professor/dashboard',
  },
];

export default function LoginPage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'student';

  const [mode, setMode]               = useState('login'); // 'login' | 'register'
  const [role, setRole]               = useState(initialRole);
  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [major, setMajor]             = useState('Computer Science');
  const [faculty, setFaculty]         = useState('Faculty of Informatics');
  const [showPw, setShowPw]           = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');

  const navigate     = useNavigate();
  const selectedRole = ROLES.find((r) => r.id === role);


  const handleRoleChange = (id) => {
    setRole(id);
    setError('');
    setSuccess('');
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in both email and password.');
      return;
    }

    if (mode === 'register' && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);
    const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';

    const payload = mode === 'register'
      ? {
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          studentCode: studentCode.trim() || undefined,
          major: major.trim() || undefined,
          faculty: faculty.trim() || undefined,
        }
      : {
          email: email.trim(),
          password,
          role,
        };

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      // Store authenticated session
      if (data.token) {
        localStorage.setItem('uniwork_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('uniwork_user', JSON.stringify(data.user));
      }

      if (mode === 'register') {
        setSuccess('Registration successful! Redirecting to dashboard…');
        setTimeout(() => {
          navigate(selectedRole.dashboard);
        }, 800);
      } else {
        navigate(selectedRole.dashboard);
      }
    } catch (err) {
      console.warn('Auth API error:', err.message);
      setError(err.message || 'Authentication failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Language Switcher in Card Header */}
        <div className={styles.cardTopBar}>
          <LanguageSwitcher theme="light" />
        </div>

        {/* Logo */}
        <Link to="/" className={styles.logo}>UniWork</Link>
        <p className={styles.subtitle}>
          {mode === 'login' ? t('loginTitle') : t('registerTitle')}
        </p>

        {/* Auth Mode Toggle (Sign In / Register) */}
        <div className={styles.modeTabs}>
          <button
            type="button"
            className={`${styles.modeTab} ${mode === 'login' ? styles.modeTabActive : ''}`}
            onClick={() => handleModeChange('login')}
          >
            {t('signIn')}
          </button>
          <button
            type="button"
            className={`${styles.modeTab} ${mode === 'register' ? styles.modeTabActive : ''}`}
            onClick={() => handleModeChange('register')}
          >
            {t('register')}
          </button>
        </div>

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
              <span className={styles.roleLabel}>{t(r.labelKey)}</span>
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

          {success && (
            <div className={styles.successBox} role="status">
              <i className="bi bi-check-circle-fill" /> {success}
            </div>
          )}

          {/* Full Name (Register mode only) */}
          {mode === 'register' && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="name">
                {t('fullNameLabel')}
              </label>
              <input
                id="name"
                type="text"
                className={styles.input}
                placeholder={role === 'company' ? 'e.g. Acme Tech Co., Ltd.' : 'e.g. สมชาย ใจดี หรือ Alex Johnson'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          {/* Student Specific Fields (Register mode only) */}
          {mode === 'register' && role === 'student' && (
            <div className={styles.formRow}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="studentCode">
                  {t('studentCodeLabel')}
                </label>
                <input
                  id="studentCode"
                  type="text"
                  className={styles.input}
                  placeholder="e.g. 66160138"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="major">
                  {t('majorLabel')}
                </label>
                <input
                  id="major"
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Computer Science"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Faculty for student */}
          {mode === 'register' && role === 'student' && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="faculty">
                {t('facultyLabel')}
              </label>
              <input
                id="faculty"
                type="text"
                className={styles.input}
                placeholder="e.g. Faculty of Informatics"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
              />
            </div>
          )}

          {/* Email */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">{t('emailLabel')}</label>
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
            <label className={styles.label} htmlFor="password">{t('passwordLabel')}</label>
            <div className={styles.pwWrap}>
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                className={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
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
              ? (mode === 'register' ? '...' : '...')
              : (mode === 'register'
                  ? `${t('registerBtn')} (${t(selectedRole.labelKey)})`
                  : `${t('loginBtn')} (${t(selectedRole.labelKey)})`)}
          </button>
        </form>

        {/* Toggle Mode Link */}
        <p className={styles.togglePrompt}>
          {mode === 'login' ? (
            <>
              {t('noAccount')}{' '}
              <button
                type="button"
                className={styles.toggleBtn}
                onClick={() => handleModeChange('register')}
              >
                {t('signUpNow')}
              </button>
            </>
          ) : (
            <>
              {t('haveAccount')}{' '}
              <button
                type="button"
                className={styles.toggleBtn}
                onClick={() => handleModeChange('login')}
              >
                {t('signInNow')}
              </button>
            </>
          )}
        </p>

        <div className={styles.footer}>
          <Link to="/" className={styles.backLink}>← {t('back')}</Link>
        </div>
      </div>
    </div>
  );
}


