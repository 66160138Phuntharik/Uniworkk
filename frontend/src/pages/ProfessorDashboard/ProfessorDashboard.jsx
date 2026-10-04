import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import StatCard from '../../components/StatCard/StatCard';
import Badge from '../../components/Badge/Badge';
import styles from './ProfessorDashboard.module.css';

const NAV_ITEMS = [
  { iconClass: 'bi-grid-1x2-fill', label: 'Dashboard', active: true },
  { iconClass: 'bi-people-fill', label: 'Student List (120)' },
  { iconClass: 'bi-journal-text', label: 'Review Reports', badge: '15' },
];

const STUDENTS = [
  { name: 'Alex Johnson', major: 'Computer Science', company: 'TechNova Solutions', status: 'placed' },
  { name: 'Maria Chen', major: 'Data Science', company: 'DataRock', status: 'interviewing' },
  { name: 'James Park', major: 'Information Technology', company: '—', status: 'searching' },
];

const REPORTS = [
  { name: 'Alex Johnson', week: 3, note: 'Having trouble connecting to API' },
  { name: 'Thanh Sritong', week: 2, note: 'Was sick for 2 days' },
];

const STATUS_MAP = {
  placed: { label: 'Placed', variant: 'success' },
  interviewing: { label: 'Interviewing', variant: 'warning' },
  searching: { label: 'Rejected / No Placement', variant: 'danger' },
};

export default function ProfessorDashboard() {
  const navigate = useNavigate();

  return (
    <div className={styles.layout}>
      <Sidebar
        subtitle="Professor"
        navItems={NAV_ITEMS}
        onLogout={() => navigate('/login')}
      />

      <main className={styles.main}>
        {/* ── Header ─────────────────────────────────────── */}
        <header className={styles.header}>
          <h1 className={styles.heading}>
            Internship Overview — Semester 1/2026
          </h1>
          <div className={styles.userChip}>
            <span className={styles.userName}>Dr. James Smith</span>
            <div className={styles.avatar}>J</div>
          </div>
        </header>

        {/* ── Stats ───────────────────────────────────────── */}
        <div className={styles.statsRow}>
          <StatCard label="Total Students" value="120" unit="students" />
          <StatCard label="Placed" value="85" unit="students" accent="success" />
          <StatCard label="Interviewing / Pending" value="23" unit="students" accent="warning" />
          <StatCard label="Needs Attention" value="12" unit="students" accent="danger" />
        </div>

        {/* ── Content Grid ────────────────────────────────── */}
        <div className={styles.contentGrid}>
          {/* Student Status Table */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Latest Status Updates</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Major</th>
                    <th>Latest Company Applied</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {STUDENTS.map((s, i) => (
                    <tr key={i}>
                      <td className={styles.tdName}>{s.name}</td>
                      <td>{s.major}</td>
                      <td className={styles.tdCompany}>{s.company}</td>
                      <td>
                        <Badge variant={STATUS_MAP[s.status].variant}>
                          {STATUS_MAP[s.status].label}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <a href="#" className={styles.viewAll}>View all students →</a>
          </div>

          {/* Pending Reports */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <i className="bi bi-exclamation-circle" style={{ color: 'var(--primary)', marginRight: 6 }} />
              Reports Awaiting Review
            </h2>

            {REPORTS.map((r, i) => (
              <div key={i} className={styles.reportRow}>
                <div className={styles.reportInfo}>
                  <div className={styles.reportName}>{r.name}</div>
                  <div className={styles.reportMeta}>Week {r.week} · {r.note}</div>
                </div>
                <button className={styles.reviewBtn}>Review</button>
              </div>
            ))}

            <a href="#" className={styles.viewAll}>View all reports →</a>
          </div>
        </div>
      </main>
    </div>
  );
}
