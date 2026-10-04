import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Badge from '../../components/Badge/Badge';
import styles from './FindInternships.module.css';

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
    description: 'Work alongside our product engineering team to build state-of-the-art web applications using React, TypeScript, and modern CSS. You will participate in sprint planning, code reviews, and UI component library development.',
    requirements: ['Solid understanding of HTML, CSS, JavaScript (ES6+)', 'Hands-on experience with React.js or Vue.js', 'Familiarity with Git version control', 'Good problem-solving and communication skills'],
    skills: ['React', 'TypeScript', 'CSS3', 'Git', 'REST API'],
    applicants: 12,
    status: 'open',
    postedDate: '2026-05-10',
  },
  {
    id: 2,
    companyId: 2,
    company: 'DataRock',
    category: 'Data & Analytics',
    title: 'Data Analyst & BI Intern',
    location: 'Remote',
    workMode: 'Remote',
    type: 'Full-time Internship',
    salary: '14,000 THB/month',
    description: 'Analyze large-scale business datasets, design interactive Tableau/PowerBI dashboards, and collaborate with product stakeholders to extract actionable insights for data-driven decisions.',
    requirements: ['Proficiency in SQL queries and data manipulation', 'Familiarity with Python (Pandas, NumPy) or R', 'Experience building visual dashboards in Tableau or PowerBI', 'Curiosity and strong analytical mindset'],
    skills: ['Python', 'SQL', 'Tableau', 'Excel', 'Data Visualization'],
    applicants: 8,
    status: 'open',
    postedDate: '2026-05-08',
  },
  {
    id: 3,
    companyId: 3,
    company: 'CloudScale Tech',
    category: 'Cloud & DevOps',
    title: 'Cloud Systems & DevOps Intern',
    location: 'Bangkok',
    workMode: 'On-site',
    type: 'Full-time Internship',
    salary: '16,000 THB/month',
    description: 'Help manage CI/CD pipelines, Docker containerized microservices, and AWS cloud infrastructure. You will work closely with senior DevOps engineers on automation, monitoring, and infrastructure-as-code.',
    requirements: ['Basic knowledge of Linux OS and shell scripting', 'Understanding of Docker containerization concepts', 'Interest in AWS, GCP, or Azure cloud services', 'Eagerness to learn modern DevOps practices'],
    skills: ['Docker', 'AWS', 'Linux', 'Node.js', 'PostgreSQL'],
    applicants: 6,
    status: 'open',
    postedDate: '2026-05-04',
  },
  {
    id: 4,
    companyId: 4,
    company: 'ByteCrafters Studio',
    category: 'Software & Web',
    title: 'Backend API Engineer Intern (Node.js / Express)',
    location: 'Chonburi',
    workMode: 'Hybrid',
    type: 'Full-time Internship',
    salary: '15,000 THB/month',
    description: 'Design and build high-performance RESTful APIs and database schemas using Node.js, Express, and PostgreSQL. Implement secure authentication, caching, and third-party API integrations.',
    requirements: ['Experience with Node.js and Express backend development', 'Knowledge of relational databases (PostgreSQL or MySQL)', 'Understanding of REST principles and JWT authentication', 'Unit testing fundamentals'],
    skills: ['Node.js', 'Express', 'PostgreSQL', 'JWT', 'REST APIs'],
    applicants: 9,
    status: 'open',
    postedDate: '2026-05-06',
  },
  {
    id: 5,
    companyId: 5,
    company: 'Siam AI Labs',
    category: 'Data & Analytics',
    title: 'AI & Machine Learning Engineering Intern',
    location: 'Bangkok',
    workMode: 'Hybrid',
    type: 'Full-time Internship',
    salary: '18,000 THB/month',
    description: 'Work with our AI research team to train, evaluate, and deploy LLM applications, retrieval-augmented generation (RAG) pipelines, and computer vision models.',
    requirements: ['Strong Python programming skills', 'Understanding of ML/DL algorithms and PyTorch or TensorFlow', 'Familiarity with NLP / LLM concepts is a plus', 'Strong mathematical and problem-solving foundation'],
    skills: ['Python', 'PyTorch', 'LLMs', 'FastAPI', 'Docker'],
    applicants: 15,
    status: 'open',
    postedDate: '2026-05-02',
  },
  {
    id: 6,
    companyId: 6,
    company: 'NextGen Mobile',
    category: 'Mobile Development',
    title: 'Mobile App Developer Intern (Flutter / React Native)',
    location: 'Bangkok',
    workMode: 'Remote',
    type: 'Full-time Internship',
    salary: '15,000 THB/month',
    description: 'Develop cross-platform mobile apps for iOS and Android. Build smooth, responsive mobile animations, offline-first data caching, and clean user interfaces.',
    requirements: ['Experience building mobile applications with Flutter (Dart) or React Native', 'Understanding of mobile state management (Provider, Bloc, Redux)', 'Knowledge of REST APIs and JSON data handling', 'Passion for mobile UX'],
    skills: ['Flutter', 'Dart', 'React Native', 'Mobile UI', 'Git'],
    applicants: 7,
    status: 'open',
    postedDate: '2026-05-07',
  },
  {
    id: 7,
    companyId: 7,
    company: 'SecureNet Solutions',
    category: 'QA & Testing',
    title: 'Software QA & Test Automation Intern',
    location: 'Remote',
    workMode: 'Remote',
    type: 'Full-time Internship',
    salary: '13,500 THB/month',
    description: 'Write automated test scripts using Playwright/Cypress, execute manual test cases, identify software bugs, and ensure seamless delivery of high-quality software releases.',
    requirements: ['Basic understanding of Software Testing Life Cycle (STLC)', 'Basic JavaScript or Python scripting ability', 'Good attention to detail and analytical thinking', 'Familiarity with Postman for API testing'],
    skills: ['QA Testing', 'Playwright', 'Postman', 'JavaScript', 'Jira'],
    applicants: 4,
    status: 'open',
    postedDate: '2026-05-09',
  },
];

const DEFAULT_APPLICATIONS = [
  { id: 1, studentId: 1, company: 'TechNova Solutions', position: 'Frontend Developer Intern (React / Next.js)', date: 'May 15, 2026', status: 'accepted' },
  { id: 2, studentId: 1, company: 'DataRock', position: 'Web Developer (Node.js)', date: 'May 12, 2026', status: 'interviewing' },
  { id: 3, studentId: 1, company: 'CloudScale Tech', position: 'Cloud Systems & DevOps Intern', date: 'May 10, 2026', status: 'reviewing' },
];

const DEFAULT_DOCS = [
  { id: 1, title: 'Alex Johnson - Software Engineer Resume (2026)', fileName: 'Alex_Johnson_Resume_2026.pdf', isPrimary: true, type: 'resume' },
  { id: 2, title: 'Alex Johnson - Academic & Professional CV', fileName: 'Alex_Johnson_CV_Academic.pdf', isPrimary: false, type: 'cv' },
];

const STATUS_MAP = {
  accepted: { label: 'Accepted', variant: 'success' },
  interviewing: { label: 'Interview Scheduled', variant: 'warning' },
  reviewing: { label: 'Under Review', variant: 'secondary' },
  rejected: { label: 'Rejected', variant: 'danger' },
};

const CATEGORIES = [
  'All Positions',
  'Software & Web',
  'Data & Analytics',
  'Cloud & DevOps',
  'Mobile Development',
  'QA & Testing',
];

export default function FindInternships() {
  const navigate = useNavigate();

  // Data states
  const [jobs, setJobs] = useState(DEFAULT_JOBS);
  const [applications, setApplications] = useState(DEFAULT_APPLICATIONS);
  const [documents, setDocuments] = useState(DEFAULT_DOCS);
  const [activeView, setActiveView] = useState('explore'); // 'explore' | 'applied'
  const [toast, setToast] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedWorkMode, setSelectedWorkMode] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All Positions');

  // Modal states
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(DEFAULT_DOCS[0]?.fileName || '');
  const [coverNote, setCoverNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Nav Items
  const navItems = [
    { iconClass: 'bi-grid-1x2-fill', label: 'Dashboard', onClick: () => navigate('/student/dashboard') },
    { iconClass: 'bi-search', label: 'Find Internships', active: true },
    {
      iconClass: 'bi-briefcase',
      label: 'Application Status',
      badge: String(applications.length),
      onClick: () => setActiveView('applied'),
    },
    { iconClass: 'bi-journal-text', label: 'Weekly Reports', onClick: () => navigate('/student/reports') },
    { iconClass: 'bi-person-badge', label: 'Profile & Resume', onClick: () => navigate('/student/profile') },
  ];

  // Fetch real data if backend server is active
  useEffect(() => {
    fetch('http://localhost:5000/api/companies/jobs')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.jobs && data.jobs.length) {
          setJobs(data.jobs);
        }
      })
      .catch(() => {});

    fetch('http://localhost:5000/api/students/1/applications')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.applications && data.applications.length) {
          setApplications(data.applications);
        }
      })
      .catch(() => {});

    fetch('http://localhost:5000/api/students/1/documents')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.documents && data.documents.length) {
          setDocuments(data.documents);
          const primary = data.documents.find((d) => d.isPrimary) || data.documents[0];
          if (primary) setSelectedDoc(primary.fileName);
        }
      })
      .catch(() => {});
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Filter jobs logic
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      // Keyword search (title, company, skills)
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        (j.skills && j.skills.some((s) => s.toLowerCase().includes(q)));

      // Location filter
      const matchLocation =
        selectedLocation === 'All' ||
        j.location.toLowerCase().includes(selectedLocation.toLowerCase());

      // Work Mode filter
      const matchWorkMode =
        selectedWorkMode === 'All' ||
        j.workMode?.toLowerCase() === selectedWorkMode.toLowerCase();

      // Category filter
      const matchCategory =
        selectedCategory === 'All Positions' ||
        j.category?.toLowerCase() === selectedCategory.toLowerCase();

      return matchQuery && matchLocation && matchWorkMode && matchCategory;
    });
  }, [jobs, searchQuery, selectedLocation, selectedWorkMode, selectedCategory]);

  // Check if job is applied
  const getAppliedStatus = (company, position) => {
    const found = applications.find(
      (a) =>
        a.company?.toLowerCase() === company?.toLowerCase() ||
        a.position?.toLowerCase() === position?.toLowerCase()
    );
    return found ? found.status : null;
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedLocation('All');
    setSelectedWorkMode('All');
    setSelectedCategory('All Positions');
  };

  // Open apply modal for a job
  const handleOpenJobModal = (job) => {
    setSelectedJob(job);
    const primary = documents.find((d) => d.isPrimary) || documents[0];
    if (primary) setSelectedDoc(primary.fileName);
    setCoverNote('');
  };

  // Submit Application
  const handleApplySubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedJob) return;

    setIsSubmitting(true);
    const payload = {
      jobId: selectedJob.id,
      company: selectedJob.company,
      position: selectedJob.title,
      resumeName: selectedDoc || 'Primary_Resume.pdf',
      coverNote,
    };

    try {
      const res = await fetch('http://localhost:5000/api/students/1/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setApplications((prev) => [data.application, ...prev]);
      } else {
        throw new Error('Local fallback');
      }
    } catch {
      // Local fallback
      const newApp = {
        id: Date.now(),
        studentId: 1,
        company: selectedJob.company,
        position: selectedJob.title,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'reviewing',
      };
      setApplications((prev) => [newApp, ...prev]);
    } finally {
      setIsSubmitting(false);
      showToast(`🎉 Successfully applied to ${selectedJob.company} for ${selectedJob.title}!`);
      setSelectedJob(null);
    }
  };

  // 1-Click Quick Apply
  const handleQuickApply = (job) => {
    const primary = documents.find((d) => d.isPrimary) || documents[0];
    const resumeName = primary ? primary.fileName : 'Alex_Johnson_Resume_2026.pdf';

    const newApp = {
      id: Date.now(),
      studentId: 1,
      company: job.company,
      position: job.title,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'reviewing',
      resumeAttached: resumeName,
    };

    setApplications((prev) => [newApp, ...prev]);
    showToast(`⚡ 1-Click Applied to ${job.company} using ${resumeName}!`);
  };

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
          <div className={styles.titleArea}>
            <h1 className={styles.pageTitle}>
              <i className="bi bi-search" style={{ color: 'var(--primary)' }} />
              Find 4th-Year Internships
            </h1>
            <p className={styles.pageSubtitle}>
              Explore verified company openings, filter by tech stack and location, and apply with your Resume/CV.
            </p>
          </div>

          <div className={styles.eligibilityBadge}>
            <i className="bi bi-mortarboard-fill" />
            <span>4th-Year Student Program</span>
          </div>
        </header>

        {/* ── Toast Alert ─────────────────────────────────── */}
        {toast && (
          <div className={`${styles.toast} ${toast.type === 'info' ? styles.toastInfo : styles.toastSuccess}`} role="alert">
            <span>{toast.message}</span>
            <button className={styles.modalCloseBtn} onClick={() => setToast(null)}>×</button>
          </div>
        )}

        {/* ── Stats Summary Bar ───────────────────────────── */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconYellow}`}>
              <i className="bi bi-briefcase-fill" />
            </div>
            <div className={styles.statMeta}>
              <span className={styles.statValue}>{jobs.length}</span>
              <span className={styles.statLabel}>Available Positions</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <i className="bi bi-building-check" />
            </div>
            <div className={styles.statMeta}>
              <span className={styles.statValue}>15+</span>
              <span className={styles.statLabel}>Partner Companies</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
              <i className="bi bi-send-check-fill" />
            </div>
            <div className={styles.statMeta}>
              <span className={styles.statValue}>{applications.length}</span>
              <span className={styles.statLabel}>My Applications</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <i className="bi bi-file-earmark-check-fill" />
            </div>
            <div className={styles.statMeta}>
              <span className={styles.statValue}>{documents.length} Files</span>
              <span className={styles.statLabel}>Ready in Vault</span>
            </div>
          </div>
        </div>

        {/* ── View Mode Tabs ──────────────────────────────── */}
        <nav className={styles.viewTabs}>
          <button
            className={`${styles.viewTab} ${activeView === 'explore' ? styles.viewTabActive : ''}`}
            onClick={() => setActiveView('explore')}
          >
            <i className="bi bi-grid-fill" /> Explore Open Positions
            <span className={styles.viewBadge}>{jobs.length}</span>
          </button>
          <button
            className={`${styles.viewTab} ${activeView === 'applied' ? styles.viewTabActive : ''}`}
            onClick={() => setActiveView('applied')}
          >
            <i className="bi bi-clock-history" /> My Applications
            <span className={styles.viewBadge}>{applications.length}</span>
          </button>
        </nav>

        {/* ── TAB 1: Explore Open Positions ───────────────── */}
        {activeView === 'explore' && (
          <>
            {/* Search & Filter Card */}
            <div className={styles.filterCard}>
              <div className={styles.searchRow}>
                <div className={styles.searchInputGroup}>
                  <i className={`bi bi-search ${styles.searchIcon}`} />
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search by job title, company, or tech (e.g. React, Python, Docker)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <select
                  className={styles.filterSelect}
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <option value="All">All Locations</option>
                  <option value="Bangkok">Bangkok</option>
                  <option value="Chonburi">Chonburi</option>
                  <option value="Remote">Remote</option>
                  <option value="Chiang Mai">Chiang Mai</option>
                </select>

                <select
                  className={styles.filterSelect}
                  value={selectedWorkMode}
                  onChange={(e) => setSelectedWorkMode(e.target.value)}
                >
                  <option value="All">All Work Modes</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">100% Remote</option>
                  <option value="On-site">On-site</option>
                </select>

                <button className={styles.resetBtn} onClick={handleResetFilters}>
                  <i className="bi bi-arrow-counterclockwise" /> Reset
                </button>
              </div>

              {/* Category Pills Bar */}
              <div className={styles.categoryBar}>
                <div className={styles.categoryPills}>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      className={`${styles.catPill} ${selectedCategory === cat ? styles.catPillActive : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <span className={styles.resultCount}>Showing {filteredJobs.length} positions</span>
              </div>
            </div>

            {/* Job Grid */}
            <div className={styles.jobGrid}>
              {filteredJobs.map((job) => {
                const appStatus = getAppliedStatus(job.company, job.title);
                return (
                  <div key={job.id} className={styles.jobCard}>
                    <div>
                      <div className={styles.jobTop}>
                        <div className={styles.companyAvatar}>
                          {job.company.charAt(0)}
                        </div>
                        <div className={styles.jobHeaderMeta}>
                          <div className={styles.companyName}>
                            {job.company} <i className="bi bi-patch-check-fill" style={{ color: '#0d6efd', fontSize: '0.85rem' }} />
                          </div>
                          <h3 className={styles.jobTitle}>{job.title}</h3>
                          <div className={styles.jobBadges}>
                            <span className={`${styles.badgePill} ${styles.badgeSalary}`}>
                              <i className="bi bi-cash" /> {job.salary}
                            </span>
                            <span className={`${styles.badgePill} ${styles.badgeMode}`}>
                              <i className="bi bi-geo-alt-fill" /> {job.location} ({job.workMode || 'Hybrid'})
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className={styles.jobDesc} style={{ margin: '14px 0 10px 0' }}>
                        {job.description}
                      </p>

                      <div className={styles.skillChips}>
                        {job.skills?.map((s) => (
                          <span key={s} className={styles.skillChip}>{s}</span>
                        ))}
                      </div>
                    </div>

                    <div className={styles.jobFooter}>
                      <div className={styles.applicantInfo}>
                        <i className="bi bi-people" /> {job.applicants} applied
                      </div>

                      <div className={styles.cardActionBtns}>
                        <button
                          className={styles.detailsBtn}
                          onClick={() => handleOpenJobModal(job)}
                        >
                          Details
                        </button>

                        {appStatus ? (
                          <span className={styles.appliedBadge}>
                            <i className="bi bi-check2-circle" /> {STATUS_MAP[appStatus]?.label || 'Applied'}
                          </span>
                        ) : (
                          <button
                            className={styles.applyBtn}
                            onClick={() => handleQuickApply(job)}
                            title="1-Click Apply with Primary Resume"
                          >
                            <i className="bi bi-lightning-charge-fill" /> Quick Apply
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── TAB 2: My Applications ──────────────────────── */}
        {activeView === 'applied' && (
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '24px', boxShadow: 'var(--shadow-xs)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '18px', color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="bi bi-journal-bookmark-fill" style={{ color: 'var(--primary)' }} />
              My Internship Applications ({applications.length})
            </h2>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg)', textAlign: 'left', borderBottom: '1.5px solid var(--border)' }}>
                    <th style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Company</th>
                    <th style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Position</th>
                    <th style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Applied Date</th>
                    <th style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Attached Resume</th>
                    <th style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f3f5' }}>
                      <td style={{ padding: '14px', fontWeight: 700, color: 'var(--dark)' }}>{app.company}</td>
                      <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>{app.position}</td>
                      <td style={{ padding: '14px', color: 'var(--text-muted)' }}>{app.date}</td>
                      <td style={{ padding: '14px', color: 'var(--dark)', fontSize: '0.82rem' }}>
                        <i className="bi bi-file-earmark-pdf" style={{ color: '#dc2626', marginRight: '6px' }} />
                        {app.resumeAttached || 'Alex_Johnson_Resume_2026.pdf'}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <Badge variant={STATUS_MAP[app.status]?.variant || 'secondary'}>
                          {STATUS_MAP[app.status]?.label || app.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── MODAL: Job Details & Apply ──────────────────── */}
        {selectedJob && (
          <div className={styles.modalBackdrop} onClick={() => setSelectedJob(null)}>
            <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <div className={styles.modalTitleArea}>
                  <div className={styles.companyAvatar}>
                    {selectedJob.company.charAt(0)}
                  </div>
                  <div>
                    <h3 className={styles.modalJobTitle}>{selectedJob.title}</h3>
                    <div className={styles.modalCompanyName}>
                      {selectedJob.company} • {selectedJob.location} ({selectedJob.workMode}) • {selectedJob.salary}
                    </div>
                  </div>
                </div>
                <button className={styles.modalCloseBtn} onClick={() => setSelectedJob(null)}>×</button>
              </div>

              <div className={styles.modalBody}>
                {/* Description */}
                <div>
                  <h4 className={styles.detailSectionTitle}>
                    <i className="bi bi-info-circle" /> Job Overview
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {selectedJob.description}
                  </p>
                </div>

                {/* Requirements */}
                {selectedJob.requirements && (
                  <div>
                    <h4 className={styles.detailSectionTitle}>
                      <i className="bi bi-check2-square" /> Key Requirements
                    </h4>
                    <ul className={styles.detailList}>
                      {selectedJob.requirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Application Section */}
                <form onSubmit={handleApplySubmit} className={styles.applySection}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--dark)' }}>
                    <i className="bi bi-send-fill" style={{ color: 'var(--primary)' }} /> Submit 4th-Year Application
                  </h4>

                  <div className={styles.applyDocSelector}>
                    <label className={styles.applyLabel}>Select Resume / CV from Vault</label>
                    <select
                      className={styles.applySelect}
                      value={selectedDoc}
                      onChange={(e) => setSelectedDoc(e.target.value)}
                    >
                      {documents.map((doc) => (
                        <option key={doc.id} value={doc.fileName}>
                          {doc.fileName} {doc.isPrimary ? '(Primary Resume ⭐)' : `(${doc.type.toUpperCase()})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label className={styles.applyLabel}>Short Cover Note (Optional)</label>
                    <textarea
                      className={styles.applyTextarea}
                      placeholder="Introduce yourself and explain why you're a great fit for this internship position..."
                      value={coverNote}
                      onChange={(e) => setCoverNote(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                    <button
                      type="button"
                      className={styles.cancelBtn}
                      onClick={() => setSelectedJob(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={styles.submitApplyBtn}
                      disabled={isSubmitting}
                    >
                      <i className="bi bi-send-fill" />
                      {isSubmitting ? 'Submitting…' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
