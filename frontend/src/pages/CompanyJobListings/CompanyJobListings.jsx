import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import StatCard from '../../components/StatCard/StatCard';
import Badge from '../../components/Badge/Badge';
import { getCompanyNavItems } from '../../utils/companyNav';
import styles from './CompanyJobListings.module.css';

const DEFAULT_JOBS = [
  {
    id: 1,
    companyId: 2,
    company: 'TechNova Solutions',
    category: 'Software & Web',
    title: 'Frontend Developer Intern (React / Next.js)',
    location: 'Bangkok',
    workMode: 'Hybrid',
    type: 'Full-time Internship',
    salary: '15,000 THB/month',
    description: 'Work alongside our product engineering team to build state-of-the-art web applications using React, TypeScript, and modern CSS.',
    skills: ['React', 'TypeScript', 'CSS3', 'Git', 'REST API'],
    applicants: 12,
    status: 'open',
    postedDate: '2026-05-10',
  },
  {
    id: 8,
    companyId: 2,
    company: 'TechNova Solutions',
    category: 'Software & Web',
    title: 'Full Stack Engineering Intern (Node.js & React)',
    location: 'Bangkok',
    workMode: 'Hybrid',
    type: 'Full-time Internship',
    salary: '16,000 THB/month',
    description: 'Join our agile core engineering team to build scalable microservices and intuitive web dashboards. Work with senior architects on real client deliverables.',
    skills: ['TypeScript', 'Node.js', 'React', 'PostgreSQL', 'Docker'],
    applicants: 8,
    status: 'open',
    postedDate: '2026-05-12',
  },
  {
    id: 9,
    companyId: 2,
    company: 'TechNova Solutions',
    category: 'Design & Creative',
    title: 'UI/UX Product Design Intern',
    location: 'Bangkok',
    workMode: 'On-site',
    type: 'Full-time Internship',
    salary: '14,000 THB/month',
    description: 'Work alongside our product team to design design systems, conduct user interviews, and create high-fidelity prototypes in Figma.',
    skills: ['Figma', 'UI Design', 'Prototyping', 'Design Systems', 'User Research'],
    applicants: 5,
    status: 'closed',
    postedDate: '2026-04-20',
  },
];

const CATEGORIES = [
  'All Categories',
  'Software & Web',
  'Data & Analytics',
  'Cloud & DevOps',
  'Mobile Development',
  'Design & Creative',
  'QA & Testing',
];

export default function CompanyJobListings() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState(DEFAULT_JOBS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'open' | 'closed'
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [toast, setToast] = useState(null);
  const [deleteTargetJob, setDeleteTargetJob] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch real data if backend server is active
  useEffect(() => {
    fetch('http://localhost:5000/api/companies/jobs?companyId=2')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.jobs && data.jobs.length > 0) {
          setJobs(data.jobs);
        }
      })
      .catch(() => {});
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    const total = jobs.length;
    const open = jobs.filter((j) => j.status === 'open').length;
    const closed = jobs.filter((j) => j.status === 'closed').length;
    const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicants || 0), 0);
    return { total, open, closed, totalApplicants };
  }, [jobs]);

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesStatus =
        statusFilter === 'all' || job.status === statusFilter;
      const matchesCategory =
        categoryFilter === 'All Categories' || job.category === categoryFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        job.title.toLowerCase().includes(q) ||
        (job.category && job.category.toLowerCase().includes(q)) ||
        (job.location && job.location.toLowerCase().includes(q)) ||
        (job.skills && job.skills.some((s) => s.toLowerCase().includes(q)));

      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [jobs, statusFilter, categoryFilter, searchQuery]);

  // Toggle Job Status (Open / Closed)
  const handleToggleStatus = async (jobId) => {
    const target = jobs.find((j) => j.id === jobId);
    if (!target) return;
    const newStatus = target.status === 'open' ? 'closed' : 'open';

    // Optimistic UI update
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
    );

    showToast(
      `Job listing "${target.title}" is now ${newStatus.toUpperCase()}`
    );

    // Backend sync
    try {
      await fetch(`http://localhost:5000/api/companies/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      // Handled optimistically
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteTargetJob) return;
    const { id, title } = deleteTargetJob;

    setJobs((prev) => prev.filter((j) => j.id !== id));
    setDeleteTargetJob(null);
    showToast(`Job listing "${title}" was successfully deleted`);

    try {
      await fetch(`http://localhost:5000/api/companies/jobs/${id}`, {
        method: 'DELETE',
      });
    } catch {
      // Handled optimistically
    }
  };

  return (
    <div className={styles.layout}>
      <Sidebar
        subtitle="Company"
        navItems={getCompanyNavItems('jobs', navigate, 5)}
        onLogout={() => navigate('/login')}
      />

      <main className={styles.main}>
        {/* ── Header ─────────────────────────────────────── */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.heading}>My Job Listings</h1>
            <p className={styles.subheading}>
              TechNova Solutions · Manage active internships & employment postings
            </p>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.postBtn}
              onClick={() => navigate('/company/post-job')}
            >
              <i className="bi bi-plus-lg" /> Post New Job
            </button>
            <div className={styles.avatar}>T</div>
          </div>
        </header>

        {/* ── Stats Row ───────────────────────────────────── */}
        <div className={styles.statsRow}>
          <StatCard
            label="Total Listings"
            value={String(stats.total)}
            unit="postings"
          />
          <StatCard
            label="Active / Open"
            value={String(stats.open)}
            unit="jobs"
            accent="success"
          />
          <StatCard
            label="Closed"
            value={String(stats.closed)}
            unit="jobs"
            accent="secondary"
          />
          <StatCard
            label="Total Applicants"
            value={String(stats.totalApplicants)}
            unit="candidates"
            accent="warning"
          />
        </div>

        {/* ── Filter & Search Controls Bar ─────────────────── */}
        <div className={styles.controlsCard}>
          <div className={styles.searchWrap}>
            <i className={`bi bi-search ${styles.searchIcon}`} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by position, skill (e.g. React, Python), or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <select
              className={styles.selectInput}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <div className={styles.statusTabs}>
              <button
                className={`${styles.statusTabBtn} ${
                  statusFilter === 'all' ? styles.statusTabActive : ''
                }`}
                onClick={() => setStatusFilter('all')}
              >
                All ({jobs.length})
              </button>
              <button
                className={`${styles.statusTabBtn} ${
                  statusFilter === 'open' ? styles.statusTabActive : ''
                }`}
                onClick={() => setStatusFilter('open')}
              >
                Open ({stats.open})
              </button>
              <button
                className={`${styles.statusTabBtn} ${
                  statusFilter === 'closed' ? styles.statusTabActive : ''
                }`}
                onClick={() => setStatusFilter('closed')}
              >
                Closed ({stats.closed})
              </button>
            </div>
          </div>
        </div>

        {/* ── Job Listings ─────────────────────────────────── */}
        {filteredJobs.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <i className="bi bi-briefcase" />
            </div>
            <h3 className={styles.emptyTitle}>No job listings match your criteria</h3>
            <p className={styles.emptyText}>
              Try clearing your search query or changing the filter options to view other postings.
            </p>
            <button
              className={styles.postBtn}
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setCategoryFilter('All Categories');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className={styles.jobsList}>
            {filteredJobs.map((job) => (
              <div key={job.id} className={styles.jobCard}>
                <div className={styles.jobHeader}>
                  <div className={styles.jobTitleWrap}>
                    <div className={styles.titleRow}>
                      <span className={styles.jobTitle}>{job.title}</span>
                      <span className={styles.categoryTag}>{job.category}</span>
                      <Badge
                        variant={job.status === 'open' ? 'success' : 'secondary'}
                      >
                        {job.status === 'open' ? 'Active / Open' : 'Closed'}
                      </Badge>
                    </div>

                    <div className={styles.jobMetaRow}>
                      <span className={styles.metaItem}>
                        <i className="bi bi-geo-alt" /> {job.location} ({job.workMode})
                      </span>
                      <span className={styles.metaItem}>
                        <i className="bi bi-clock" /> {job.type}
                      </span>
                      <span className={`${styles.metaItem} ${styles.salaryHighlight}`}>
                        <i className="bi bi-cash" /> {job.salary}
                      </span>
                      <span className={styles.metaItem}>
                        <i className="bi bi-calendar-check" /> Posted: {job.postedDate}
                      </span>
                    </div>
                  </div>

                  <div className={styles.jobHeaderRight}>
                    <button
                      className={styles.viewBtn}
                      title="View applicants for this job"
                      onClick={() =>
                        navigate(
                          `/company/applicants?jobId=${job.id}&jobTitle=${encodeURIComponent(
                            job.title
                          )}`
                        )
                      }
                    >
                      <i className="bi bi-eye-fill" /> View
                    </button>
                    <button
                      className={`${styles.toggleStatusBtn} ${
                        job.status === 'open'
                          ? styles.toggleOpen
                          : styles.toggleClose
                      }`}
                      title={
                        job.status === 'open'
                          ? 'Close this job posting'
                          : 'Re-open this job posting'
                      }
                      onClick={() => handleToggleStatus(job.id)}
                    >
                      <i
                        className={`bi ${
                          job.status === 'open'
                            ? 'bi-pause-circle'
                            : 'bi-play-circle'
                        }`}
                      />
                      {job.status === 'open' ? 'Close Listing' : 'Re-open Listing'}
                    </button>
                    <button
                      className={styles.deleteBtn}
                      title="Delete job listing"
                      onClick={() => setDeleteTargetJob(job)}
                    >
                      <i className="bi bi-trash" />
                    </button>
                  </div>
                </div>

                <p className={styles.jobDesc}>{job.description}</p>

                {job.skills && job.skills.length > 0 && (
                  <div className={styles.skillsRow}>
                    {job.skills.map((skill, idx) => (
                      <span key={idx} className={styles.skillChip}>
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div className={styles.jobFooter}>
                  <div
                    className={styles.applicantStat}
                    style={{ cursor: 'pointer' }}
                    onClick={() =>
                      navigate(
                        `/company/applicants?jobId=${job.id}&jobTitle=${encodeURIComponent(
                          job.title
                        )}`
                      )
                    }
                    title="Click to view applicants for this job"
                  >
                    <i className="bi bi-people-fill text-muted" />
                    <span>Candidate Applications:</span>
                    <span className={styles.applicantBubble}>
                      {job.applicants || 0} applied
                    </span>
                  </div>

                  <div className={styles.actionsGroup}>
                    <button
                      className={styles.viewApplicantsBtn}
                      onClick={() =>
                        navigate(
                          `/company/applicants?jobId=${job.id}&jobTitle=${encodeURIComponent(
                            job.title
                          )}`
                        )
                      }
                      title="View applicants for this job"
                    >
                      <i className="bi bi-eye-fill" /> View Applicants ({job.applicants || 0})
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Delete Confirmation Modal ────────────────────── */}
        {deleteTargetJob && (
          <div
            className={styles.modalBackdrop}
            onClick={() => setDeleteTargetJob(null)}
          >
            <div
              className={styles.modal}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className={styles.modalTitle}>Delete Job Listing?</h3>
              <p className={styles.modalText}>
                Are you sure you want to delete{' '}
                <strong>&quot;{deleteTargetJob.title}&quot;</strong>? This action will remove
                the posting from student search results and cannot be undone.
              </p>
              <div className={styles.modalActions}>
                <button
                  className={styles.cancelBtn}
                  onClick={() => setDeleteTargetJob(null)}
                >
                  Cancel
                </button>
                <button
                  className={styles.confirmDeleteBtn}
                  onClick={handleConfirmDelete}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Toast Notification ───────────────────────────── */}
        {toast && (
          <div className={`${styles.toast} ${styles.toastSuccess}`}>
            <i className="bi bi-check-circle-fill" />
            <span>{toast}</span>
          </div>
        )}
      </main>
    </div>
  );
}
