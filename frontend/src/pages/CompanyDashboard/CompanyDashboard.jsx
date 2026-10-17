import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import StatCard from '../../components/StatCard/StatCard';
import Badge from '../../components/Badge/Badge';
import { getCompanyNavItems } from '../../utils/companyNav';
import styles from './CompanyDashboard.module.css';

const JOB_STATUS = {
  open: { label: 'Open', variant: 'success' },
  closed: { label: 'Closed', variant: 'secondary' },
};

const APP_STATUS = {
  accepted: { label: 'Accepted', variant: 'success' },
  interviewing: { label: 'Interviewing', variant: 'warning' },
  reviewing: { label: 'Under Review', variant: 'secondary' },
  rejected: { label: 'Rejected', variant: 'danger' },
};

export default function CompanyDashboard() {
  const navigate = useNavigate();

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('uniwork_user') || 'null');
    } catch {
      return null;
    }
  })();

  const [companyName, setCompanyName] = useState(currentUser?.name || 'Company Workspace');
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('uniwork_token');
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
    const companyParam = currentUser?.name ? `?company=${encodeURIComponent(currentUser.name)}` : '';

    // Fetch company profile for title
    fetch(`http://localhost:5000/api/companies/profile${companyParam}`, { headers: authHeaders })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.profile && data.profile.companyName) {
          setCompanyName(currentUser?.name || data.profile.companyName);
        }
      })
      .catch(() => {});

    // Fetch live jobs from Supabase
    fetch(`http://localhost:5000/api/companies/jobs${companyParam}`, { headers: authHeaders })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.jobs)) {
          setJobs(data.jobs);
        }
      })
      .catch(() => {});

    // Fetch live applicants from Supabase
    fetch(`http://localhost:5000/api/companies/applicants${companyParam}`, { headers: authHeaders })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.applicants)) {
          setApplicants(data.applicants);
        }
      })
      .catch(() => {});
  }, [currentUser?.name]);

  const totalApplicantsCount = applicants.length;
  const activeJobsCount = jobs.filter((j) => j.status === 'open').length;
  const acceptedCount = applicants.filter((a) => a.status === 'accepted').length;
  const pendingCount = applicants.filter((a) => a.status === 'reviewing' || a.status === 'interviewing').length;

  const handleLogout = () => {
    localStorage.removeItem('uniwork_user');
    localStorage.removeItem('uniwork_token');
    navigate('/login');
  };

  return (
    <div className={styles.layout}>
      <Sidebar
        subtitle="Company"
        navItems={getCompanyNavItems('dashboard', navigate, applicants.length)}
        onLogout={handleLogout}
      />

      <main className={styles.main}>
        {/* ── Header ─────────────────────────────────────── */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.heading}>Company Dashboard</h1>
            <p className={styles.companyName}>{companyName}</p>
          </div>
          <div className={styles.headerRight}>
            <button
              className={styles.postBtn}
              onClick={() => navigate('/company/post-job')}
            >
              <i className="bi bi-plus-lg" /> Post New Job
            </button>
            <div
              className={styles.avatar}
              onClick={() => navigate('/company/profile')}
              style={{ cursor: 'pointer' }}
              title="View Company Profile"
            >
              {companyName.charAt(0)}
            </div>
          </div>
        </header>

        {/* ── Stats ───────────────────────────────────────── */}
        <div className={styles.statsRow}>
          <StatCard label="Active Job Listings" value={String(activeJobsCount)} unit="jobs" />
          <StatCard label="Total Applicants" value={String(totalApplicantsCount)} unit="students" />
          <StatCard label="Accepted Candidates" value={String(acceptedCount)} unit="students" accent="success" />
          <StatCard label="Pending Review" value={String(pendingCount)} unit="students" accent="warning" />
        </div>

        {/* ── Content Grid ────────────────────────────────── */}
        <div className={styles.contentGrid}>
          {/* Job Listings Table */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>My Job Listings</h2>
              <button
                className={styles.manageBtn}
                onClick={() => navigate('/company/jobs')}
              >
                Manage All
              </button>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Applicants</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8' }}>
                        No job listings posted yet
                      </td>
                    </tr>
                  ) : (
                    jobs.slice(0, 3).map((job, i) => (
                      <tr
                        key={i}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate('/company/jobs')}
                      >
                        <td className={styles.tdTitle}>{job.title}</td>
                        <td className={styles.tdType}>{job.type}</td>
                        <td>{job.location}</td>
                        <td className={styles.tdCount}>
                          <span className={styles.countBubble}>{job.applicants || 0}</span>
                        </td>
                        <td>
                          <Badge variant={JOB_STATUS[job.status]?.variant || 'secondary'}>
                            {JOB_STATUS[job.status]?.label || job.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <a
              href="#"
              className={styles.viewAll}
              onClick={(e) => {
                e.preventDefault();
                navigate('/company/jobs');
              }}
            >
              View all listings →
            </a>
          </div>

          {/* Recent Applicants */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Recent Applicants</h2>
            <div className={styles.applicantList}>
              {applicants.length === 0 ? (
                <p style={{ color: '#94a3b8', padding: '1.5rem 0', textAlign: 'center', fontSize: '0.9rem' }}>
                  No applicant applications received yet
                </p>
              ) : (
                applicants.slice(0, 3).map((a, i) => (
                  <div
                    key={i}
                    className={styles.applicantRow}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate('/company/applicants')}
                  >
                    <div className={styles.applicantAvatar}>
                      {a.name.charAt(0)}
                    </div>
                    <div className={styles.applicantInfo}>
                      <div className={styles.applicantName}>{a.name}</div>
                      <div className={styles.applicantMeta}>
                        {a.major} · GPA {a.gpa}
                      </div>
                      <div className={styles.applicantPos}>{a.position}</div>
                    </div>
                    <Badge variant={APP_STATUS[a.status]?.variant || 'secondary'}>
                      {APP_STATUS[a.status]?.label || a.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
            <a
              href="#"
              className={styles.viewAll}
              onClick={(e) => {
                e.preventDefault();
                navigate('/company/applicants');
              }}
            >
              View all applicants →
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
