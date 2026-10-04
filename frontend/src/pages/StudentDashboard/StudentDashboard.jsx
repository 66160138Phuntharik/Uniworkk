import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import StatCard from '../../components/StatCard/StatCard';
import Badge from '../../components/Badge/Badge';
import styles from './StudentDashboard.module.css';

const APPLICATIONS = [
  { company: 'TechNova Solutions', position: 'Frontend Developer Intern', date: 'May 15, 2026', status: 'accepted' },
  { company: 'DataRock', position: 'Web Developer (Node.js)', date: 'May 12, 2026', status: 'interviewing' },
  { company: 'CloudScale Tech', position: 'Fullstack Intern', date: 'May 10, 2026', status: 'reviewing' },
];

const STATUS_MAP = {
  accepted: { label: 'Accepted', variant: 'success' },
  interviewing: { label: 'Interview Scheduled', variant: 'warning' },
  reviewing: { label: 'Under Review', variant: 'secondary' },
  rejected: { label: 'Rejected', variant: 'danger' },
};

export default function StudentDashboard() {
  const navigate = useNavigate();

  const navItems = [
    { iconClass: 'bi-grid-1x2-fill', label: 'Dashboard', active: true },
    { iconClass: 'bi-search', label: 'Find Internships', onClick: () => navigate('/student/internships') },
    { iconClass: 'bi-briefcase', label: 'Application Status', badge: '3', onClick: () => navigate('/student/internships') },
    { iconClass: 'bi-journal-text', label: 'Weekly Reports', onClick: () => navigate('/student/reports') },
    { iconClass: 'bi-person-badge', label: 'Profile & Resume', onClick: () => navigate('/student/profile') },
  ];

  return (
    <div className={styles.layout}>
      <Sidebar
        subtitle="Student"
        navItems={navItems}
        onLogout={() => navigate('/login')}
      />

      <main className={styles.main}>
        {/* ── Header ─────────────────────────────────────── */}
        <header className={styles.header}>
          <h1 className={styles.greeting}>Welcome, Alex! 👋</h1>
          <div
            className={styles.userChip}
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/student/profile')}
            title="Go to My Profile"
          >
            <div className={styles.userInfo}>
              <span className={styles.userName}>Alex Johnson</span>
              <span className={styles.userMajor}>Computer Science</span>
            </div>
            <div className={styles.avatar}>A</div>
          </div>
        </header>

        {/* ── Placement Alert ─────────────────────────────── */}
        <div className={styles.alertSuccess} role="alert">
          <div>
            <div className={styles.alertTitle}>🎉 Congratulations! You've been placed!</div>
            <div className={styles.alertText}>
              TechNova Solutions has accepted you as a{' '}
              <strong>Frontend Developer Intern</strong> — Starting June 1, 2026.
            </div>
          </div>
          <button className={styles.alertBtn} onClick={() => navigate('/student/profile')}>
            View Details
          </button>
        </div>

        {/* ── Stats ───────────────────────────────────────── */}
        <div className={styles.statsRow}>
          <StatCard label="Applications Sent" value="8" unit="companies" />
          <StatCard label="Interviews Scheduled" value="2" unit="companies" accent="warning" />
          <StatCard label="Reports Submitted" value="3 / 12" unit="weeks" accent="success" />
        </div>

        {/* ── Content Grid ────────────────────────────────── */}
        <div className={styles.contentGrid}>
          {/* Application History */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Recent Application History</h2>
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
                  {APPLICATIONS.map((app, i) => (
                    <tr key={i}>
                      <td className={styles.tdCompany}>{app.company}</td>
                      <td>{app.position}</td>
                      <td className={styles.tdDate}>{app.date}</td>
                      <td>
                        <Badge variant={STATUS_MAP[app.status].variant}>
                          {STATUS_MAP[app.status].label}
                        </Badge>
                      </td>
                    </tr>
                  ))}
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
          </div>

          {/* To-Do List */}
          <div className={`${styles.card} ${styles.cardAccented}`}>
            <h2 className={styles.cardTitle}>
              <i className="bi bi-card-checklist" /> To-Do List
            </h2>

            <div className={styles.todoItem}>
              <div className={styles.todoBody}>
                <div className={styles.todoTitle}>Submit Weekly Report – Week 4</div>
                <div className={styles.todoSub}>Due: Friday, August 21, 2026</div>
              </div>
              <button className={styles.todoBtnYellow} onClick={() => navigate('/student/reports?new=true')}>
                Write Report
              </button>
            </div>

            <div className={`${styles.todoItem} ${styles.todoItemGray}`}>
              <div className={styles.todoBody}>
                <div className={styles.todoTitle}>Update Skills in Resume</div>
                <div className={styles.todoSub}>Suggested: Add Bootstrap and MySQL skills</div>
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
