import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import StatCard from '../../components/StatCard/StatCard';
import Badge from '../../components/Badge/Badge';
import { getProfessorNavItems } from '../../utils/professorNav';
import styles from './ProfessorDashboard.module.css';

const DEFAULT_STUDENTS = [
  { name: 'Alex Johnson', major: 'Computer Science', company: 'TechNova Solutions', status: 'placed' },
  { name: 'Maria Chen', major: 'Data Science', company: 'DataRock', status: 'placed' },
  { name: 'James Park', major: 'Information Technology', company: '—', status: 'searching' },
  { name: 'Thanh Sritong', major: 'Software Engineering', company: 'DataRock', status: 'placed' },
];

const DEFAULT_REPORTS = [
  { id: 3, name: 'Alex Johnson', week: 3, note: 'Having trouble connecting to API', status: 'pending' },
  { id: 4, name: 'Thanh Sritong', week: 2, note: 'Data pipeline validation finished', status: 'pending' },
  { id: 5, name: 'Maria Chen', week: 3, note: 'Tableau dashboard completed', status: 'pending' },
];

const STATUS_MAP = {
  placed: { label: 'Placed / Interning', variant: 'success' },
  interviewing: { label: 'Interviewing', variant: 'warning' },
  searching: { label: 'Searching / Pending', variant: 'danger' },
};

export default function ProfessorDashboard() {
  const navigate = useNavigate();

  const [students, setStudents] = useState(DEFAULT_STUDENTS);
  const [reports, setReports] = useState(DEFAULT_REPORTS);
  const [stats, setStats] = useState({
    total: 6,
    placed: 4,
    interviewing: 1,
    searching: 1,
  });
  const [pendingCount, setPendingCount] = useState(3);

  useEffect(() => {
    // Fetch students overview
    fetch('http://localhost:5000/api/professors/students')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.students) {
          setStudents(data.students.slice(0, 5));
          if (data.stats) setStats(data.stats);
        }
      })
      .catch(() => {});

    // Fetch reports overview
    fetch('http://localhost:5000/api/professors/reports?status=pending')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.reports) {
          setReports(
            data.reports.slice(0, 4).map((r) => ({
              id: r.id,
              name: r.studentName,
              week: r.week,
              note: r.content.slice(0, 55) + '...',
              status: r.status,
            }))
          );
          if (data.pendingCount !== undefined) {
            setPendingCount(data.pendingCount);
          }
        }
      })
      .catch(() => {});
  }, []);

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('uniwork_user') || 'null');
    } catch {
      return null;
    }
  })();
  const profName = currentUser?.name || 'Dr. James Smith';
  const profInitial = profName.charAt(0);

  const handleLogout = () => {
    localStorage.removeItem('uniwork_user');
    localStorage.removeItem('uniwork_token');
    navigate('/login');
  };

  const navItems = getProfessorNavItems('dashboard', navigate, pendingCount, stats.total);

  return (
    <div className={styles.layout}>
      <Sidebar
        subtitle="Professor"
        navItems={navItems}
        onLogout={handleLogout}
      />

      <main className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.heading}>
            Internship Overview — Semester 1/2026
          </h1>
          <div className={styles.userChip}>
            <span className={styles.userName}>{profName}</span>
            <div className={styles.avatar}>{profInitial}</div>
          </div>
        </header>

        {/* Stats */}
        <div className={styles.statsRow}>
          <StatCard label="Total Students" value={stats.total} unit="students" />
          <StatCard label="Placed / Interning" value={stats.placed} unit="students" accent="success" />
          <StatCard label="Interviewing" value={stats.interviewing} unit="students" accent="warning" />
          <StatCard label="Needs Attention" value={stats.searching} unit="students" accent="danger" />
        </div>

        {/* Content Grid */}
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
                  {students.map((s, i) => {
                    const statusInfo = STATUS_MAP[s.status] || {
                      label: s.status,
                      variant: 'secondary',
                    };
                    return (
                      <tr key={i}>
                        <td className={styles.tdName}>{s.name}</td>
                        <td>{s.major}</td>
                        <td className={styles.tdCompany}>{s.company || '—'}</td>
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
              className={styles.viewAll}
              onClick={() => navigate('/professor/students')}
            >
              View all students →
            </button>
          </div>

          {/* Pending Reports */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <i
                className="bi bi-exclamation-circle"
                style={{ color: 'var(--primary)', marginRight: 6 }}
              />
              Reports Awaiting Review ({pendingCount})
            </h2>

            {reports.length === 0 ? (
              <p style={{ padding: '16px 0', color: 'var(--text-muted)' }}>
                No pending reports waiting for review.
              </p>
            ) : (
              reports.map((r, i) => (
                <div key={i} className={styles.reportRow}>
                  <div className={styles.reportInfo}>
                    <div className={styles.reportName}>{r.name}</div>
                    <div className={styles.reportMeta}>
                      Week {r.week} · {r.note}
                    </div>
                  </div>
                  <button
                    className={styles.reviewBtn}
                    onClick={() => navigate('/professor/reports')}
                  >
                    Review
                  </button>
                </div>
              ))
            )}

            <button
              className={styles.viewAll}
              onClick={() => navigate('/professor/reports')}
            >
              View all reports →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
