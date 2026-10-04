import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import StatCard from '../../components/StatCard/StatCard';
import Badge from '../../components/Badge/Badge';
import { getCompanyNavItems } from '../../utils/companyNav';
import styles from './CompanyDashboard.module.css';

const DEFAULT_JOBS = [
  { title: 'Frontend Developer Intern (React / Next.js)', type: 'Full-time', location: 'Bangkok', applicants: 12, status: 'open' },
  { title: 'Full Stack Engineering Intern (Node.js & React)', type: 'Full-time', location: 'Bangkok', applicants: 8, status: 'open' },
  { title: 'UI/UX Product Design Intern', type: 'Full-time', location: 'Bangkok', applicants: 5, status: 'closed' },
];

const DEFAULT_APPLICANTS = [
  { name: 'Alex Johnson', major: 'Computer Science', position: 'Frontend Developer Intern', gpa: '3.8', status: 'accepted' },
  { name: 'Maria Chen', major: 'Software Engineering', position: 'Frontend Developer Intern', gpa: '3.5', status: 'interviewing' },
  { name: 'James Park', major: 'Computer Science', position: 'Full Stack Engineering Intern', gpa: '3.9', status: 'reviewing' },
];

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
  const [jobs, setJobs] = useState(DEFAULT_JOBS);
  const [applicants, setApplicants] = useState(DEFAULT_APPLICANTS);

  useEffect(() => {
    fetch('http://localhost:5000/api/companies/jobs?companyId=2')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.jobs && data.jobs.length > 0) {
          setJobs(data.jobs);
        }
      })
      .catch(() => {});

    fetch('http://localhost:5000/api/companies/applicants')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.applicants && data.applicants.length > 0) {
          setApplicants(data.applicants.slice(0, 5));
        }
      })
      .catch(() => {});
  }, []);

  const totalApplicantsCount = jobs.reduce((sum, j) => sum + (j.applicants || 0), 0);
  const activeJobsCount = jobs.filter((j) => j.status === 'open').length;

  return (
    <div className={styles.layout}>
      <Sidebar
        subtitle="Company"
        navItems={getCompanyNavItems('dashboard', navigate, applicants.length)}
        onLogout={() => navigate('/login')}
      />

      <main className={styles.main}>
        {/* ── Header ─────────────────────────────────────── */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.heading}>Company Dashboard</h1>
            <p className={styles.companyName}>TechNova Solutions</p>
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
              T
            </div>
          </div>
        </header>

        {/* ── Stats ───────────────────────────────────────── */}
        <div className={styles.statsRow}>
          <StatCard label="Active Job Listings" value={String(activeJobsCount)} unit="jobs" />
          <StatCard label="Total Applicants" value={String(totalApplicantsCount || 25)} unit="students" />
          <StatCard label="Accepted Candidates" value="1" unit="students" accent="success" />
          <StatCard label="Pending Review" value="2" unit="students" accent="warning" />
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
                  {jobs.slice(0, 3).map((job, i) => (
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
                  ))}
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
              {applicants.slice(0, 3).map((a, i) => (
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
              ))}
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
