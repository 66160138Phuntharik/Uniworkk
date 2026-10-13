import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import StatCard from '../../components/StatCard/StatCard';
import Badge from '../../components/Badge/Badge';
import styles from './StudentDashboard.module.css';

const STATUS_MAP = {
  accepted: { label: 'Accepted', variant: 'success' },
  interviewing: { label: 'Interview Scheduled', variant: 'warning' },
  reviewing: { label: 'Under Review', variant: 'secondary' },
  rejected: { label: 'Rejected', variant: 'danger' },
};

export default function StudentDashboard() {
  const navigate = useNavigate();

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('uniwork_user') || 'null');
    } catch {
      return null;
    }
  })();

  const studentId = currentUser?.id || 1;

  const [profile, setProfile] = useState({
    nameEn: currentUser?.name || 'Student',
    nameTh: currentUser?.name || 'นิสิต',
    department: currentUser?.major || currentUser?.department || 'Computer Science',
    faculty: currentUser?.faculty || 'Faculty of Informatics',
    status: 'searching',
    company: '',
    position: '',
  });

  const [applications, setApplications] = useState([]);
  const [reportsCount, setReportsCount] = useState(0);

  // Fetch live student profile and stats
  useEffect(() => {
    fetch(`http://localhost:5000/api/students/${studentId}/profile`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.profile) {
          setProfile((prev) => ({ ...prev, ...data.profile }));
        }
      })
      .catch(() => {});

    fetch(`http://localhost:5000/api/students/${studentId}/applications`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.applications) {
          setApplications(data.applications);
        }
      })
      .catch(() => {});

    fetch(`http://localhost:5000/api/students/${studentId}/reports`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.reports) {
          setReportsCount(data.reports.length);
        }
      })
      .catch(() => {});
  }, [studentId]);

  const studentName = profile.nameEn || profile.nameTh || currentUser?.name || 'Student';
  const firstName = studentName.split(' ')[0] || studentName;
  const avatarLetter = studentName.charAt(0).toUpperCase() || 'S';

  const interviewsCount = applications.filter((a) => a.status === 'interviewing').length;

  const handleLogout = () => {
    localStorage.removeItem('uniwork_user');
    localStorage.removeItem('uniwork_token');
    navigate('/login');
  };

  const navItems = [
    { iconClass: 'bi-grid-1x2-fill', label: 'Dashboard', active: true },
    { iconClass: 'bi-search', label: 'Find Internships', onClick: () => navigate('/student/internships') },
    { iconClass: 'bi-briefcase', label: 'Application Status', badge: applications.length > 0 ? String(applications.length) : undefined, onClick: () => navigate('/student/internships') },
    { iconClass: 'bi-journal-text', label: 'Weekly Reports', onClick: () => navigate('/student/reports') },
    { iconClass: 'bi-person-badge', label: 'Profile & Resume', onClick: () => navigate('/student/profile') },
  ];

  return (
    <div className={styles.layout}>
      <Sidebar
        subtitle="Student"
        navItems={navItems}
        onLogout={handleLogout}
      />

      <main className={styles.main}>
        {/* ── Header ─────────────────────────────────────── */}
        <header className={styles.header}>
          <h1 className={styles.greeting}>Welcome, {firstName}! 👋</h1>
          <div
            className={styles.userChip}
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/student/profile')}
            title="Go to My Profile"
          >
            <div className={styles.userInfo}>
              <span className={styles.userName}>{studentName}</span>
              <span className={styles.userMajor}>{profile.department || 'Computer Science'}</span>
            </div>
            <div className={styles.avatar}>{avatarLetter}</div>
          </div>
        </header>

        {/* ── Placement Alert ─────────────────────────────── */}
        {profile.status === 'placed' && profile.company && (
          <div className={styles.alertSuccess} role="alert">
            <div>
              <div className={styles.alertTitle}>🎉 Congratulations! You've been placed!</div>
              <div className={styles.alertText}>
                {profile.company} has accepted you as a{' '}
                <strong>{profile.position || 'Frontend Developer Intern'}</strong> — Starting June 1, 2026.
              </div>
            </div>
            <button className={styles.alertBtn} onClick={() => navigate('/student/profile')}>
              View Details
            </button>
          </div>
        )}

        {/* ── Stats ───────────────────────────────────────── */}
        <div className={styles.statsRow}>
          <StatCard label="Applications Sent" value={String(applications.length)} unit="companies" />
          <StatCard label="Interviews Scheduled" value={String(interviewsCount)} unit="companies" accent={interviewsCount > 0 ? 'warning' : ''} />
          <StatCard label="Reports Submitted" value={`${reportsCount} / 16`} unit="weeks" accent="success" />
        </div>

        {/* ── Content Grid ────────────────────────────────── */}
        <div className={styles.contentGrid}>
          {/* Application History */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Recent Application History</h2>
            {applications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
                <i className="bi bi-inbox" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '10px', color: '#cbd5e1' }} />
                <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--dark)', marginBottom: '4px' }}>No internship applications yet</p>
                <p style={{ fontSize: '0.88rem', marginBottom: '16px' }}>Explore open positions from partner companies and submit your first application.</p>
                <button
                  type="button"
                  style={{
                    background: 'var(--dark)',
                    color: 'var(--white)',
                    border: 'none',
                    padding: '9px 18px',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                  }}
                  onClick={() => navigate('/student/internships')}
                >
                  Find Internships Now →
                </button>
              </div>
            ) : (
              <>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Company</th>
                        <th>Position</th>
                        <th>Date Applied</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.slice(0, 5).map((app, i) => {
                        const statusInfo = STATUS_MAP[app.status] || { label: app.status, variant: 'secondary' };
                        return (
                          <tr key={app.id || i}>
                            <td className={styles.tdCompany}>{app.company}</td>
                            <td>{app.position}</td>
                            <td className={styles.tdDate}>{app.date}</td>
                            <td>
                              <Badge variant={statusInfo.variant}>
                                {statusInfo.label}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  className={styles.viewAll}
                  style={{ cursor: 'pointer', background: 'none', border: 'none', width: '100%' }}
                  onClick={() => navigate('/student/internships')}
                >
                  View all applications →
                </button>
              </>
            )}
          </div>

          {/* To-Do List */}
          <div className={`${styles.card} ${styles.cardAccented}`}>
            <h2 className={styles.cardTitle}>
              <i className="bi bi-card-checklist" /> To-Do List
            </h2>

            <div className={styles.todoItem}>
              <div className={styles.todoBody}>
                <div className={styles.todoTitle}>Submit Weekly Report – Week {reportsCount + 1}</div>
                <div className={styles.todoSub}>Next due internship submission</div>
              </div>
              <button className={styles.todoBtnYellow} onClick={() => navigate('/student/reports?new=true')}>
                Write Report
              </button>
            </div>

            <div className={`${styles.todoItem} ${styles.todoItemGray}`}>
              <div className={styles.todoBody}>
                <div className={styles.todoTitle}>Update Skills & Documents</div>
                <div className={styles.todoSub}>Keep your latest Resume up to date for advisors</div>
              </div>
              <button className={styles.todoBtnGhost} onClick={() => navigate('/student/profile')}>
                Go to Profile
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
