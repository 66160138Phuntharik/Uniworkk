import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Badge from '../../components/Badge/Badge';
import styles from './FindInternships.module.css';

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

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('uniwork_user') || 'null');
    } catch {
      return null;
    }
  })();
  const studentId = currentUser?.id || 1;

  // Data states
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activeView, setActiveView] = useState('explore'); // 'explore' | 'applied'
  const [toast, setToast] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedWorkMode, setSelectedWorkMode] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All Positions');

  // Modal states
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Nav Items
  const navItems = [
    { iconClass: 'bi-grid-1x2-fill', label: 'Dashboard', onClick: () => navigate('/student/dashboard') },
    { iconClass: 'bi-search', label: 'Find Internships', active: true },
    {
      iconClass: 'bi-briefcase',
      label: 'Application Status',
      badge: applications.length > 0 ? String(applications.length) : undefined,
      onClick: () => setActiveView('applied'),
    },
    { iconClass: 'bi-journal-text', label: 'Weekly Reports', onClick: () => navigate('/student/reports') },
    { iconClass: 'bi-person-badge', label: 'Profile & Resume', onClick: () => navigate('/student/profile') },
  ];

  // Fetch real data from backend server
  useEffect(() => {
    const token = localStorage.getItem('uniwork_token');
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    fetch('http://localhost:5000/api/companies/jobs')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.jobs)) {
          setJobs(data.jobs);
        }
      })
      .catch(() => {});

    if (studentId) {
      fetch(`http://localhost:5000/api/students/${studentId}/applications`, {
        headers: authHeaders,
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.applications) {
            setApplications(data.applications);
          }
        })
        .catch(() => {});

      fetch(`http://localhost:5000/api/students/${studentId}/documents`, {
        headers: authHeaders,
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.documents) {
            setDocuments(data.documents);
            if (data.documents.length > 0) {
              setSelectedDoc(data.documents[0].fileName);
            }
          }
        })
        .catch(() => {});
    }
  }, [studentId]);

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
  const getAppliedStatus = (job) => {
    if (!job) return null;
    const found = applications.find(
      (a) =>
        (a.jobId && job.id && Number(a.jobId) === Number(job.id)) ||
        (a.company?.trim().toLowerCase() === job.company?.trim().toLowerCase() &&
          a.position?.trim().toLowerCase() === job.title?.trim().toLowerCase())
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

  // Submit Application via Modal
  const handleApplySubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedJob) return;

    setIsSubmitting(true);
    const token = localStorage.getItem('uniwork_token');
    const chosenResume = selectedDoc || (documents[0]?.fileName) || 'Resume.pdf';
    const payload = {
      jobId: selectedJob.id,
      company: selectedJob.company,
      position: selectedJob.title,
      resumeName: chosenResume,
      coverNote,
    };

    try {
      const res = await fetch(`http://localhost:5000/api/students/${studentId}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setApplications((prev) => [data.application, ...prev]);
        setJobs((prevJobs) =>
          prevJobs.map((j) => (j.id === selectedJob.id ? { ...j, applicants: (j.applicants || 0) + 1 } : j))
        );
        showToast(`🎉 Successfully applied to ${selectedJob.company} for ${selectedJob.title}!`);
        setSelectedJob(null);
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.error || 'Failed to submit application. Please try again.', 'error');
      }
    } catch {
      showToast('Network error while applying. Please check your connection.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('uniwork_user');
    localStorage.removeItem('uniwork_token');
    navigate('/login');
  };

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
                const appStatus = getAppliedStatus(job);
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
                        <i className="bi bi-people" /> {job.applicants || 0} applied
                      </div>

                      <div className={styles.cardActionBtns}>
                        <button
                          className={styles.detailsBtn}
                          onClick={() => handleOpenJobModal(job)}
                        >
                          <i className="bi bi-info-circle" /> Details
                        </button>

                        {appStatus ? (
                          <span className={styles.appliedBadge}>
                            <i className="bi bi-check2-circle" /> {STATUS_MAP[appStatus]?.label || 'Applied'}
                          </span>
                        ) : (
                          <button
                            className={styles.applyBtn}
                            onClick={() => handleOpenJobModal(job)}
                          >
                            <i className="bi bi-send" /> Apply Now
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

            {applications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--bg)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 16px' }}>
                  <i className="bi bi-file-earmark-text" />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '8px' }}>No Submitted Applications Yet</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                  You haven't applied to any internships yet. Explore available company positions and submit your application to start your internship journey!
                </p>
                <Button variant="primary" onClick={() => setActiveView('search')}>
                  <i className="bi bi-search" style={{ marginRight: '6px' }} />
                  Explore Internship Openings
                </Button>
              </div>
            ) : (
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
                          {app.resumeAttached || 'Resume.pdf'}
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
            )}
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
                {getAppliedStatus(selectedJob) ? (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <i className="bi bi-check-circle-fill" style={{ color: '#16a34a', fontSize: '1.4rem' }} />
                      <div>
                        <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.94rem' }}>
                          You have already submitted an application for this position
                        </div>
                        <div style={{ color: '#15803d', fontSize: '0.82rem', marginTop: '2px' }}>
                          Current status: <strong>{STATUS_MAP[getAppliedStatus(selectedJob)]?.label || getAppliedStatus(selectedJob)}</strong>
                        </div>
                      </div>
                    </div>
                    <Badge variant={STATUS_MAP[getAppliedStatus(selectedJob)]?.variant || 'success'}>
                      {STATUS_MAP[getAppliedStatus(selectedJob)]?.label || 'Applied'}
                    </Badge>
                  </div>
                ) : (
                  <form onSubmit={handleApplySubmit} className={styles.applySection}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--dark)' }}>
                      <i className="bi bi-send-fill" style={{ color: 'var(--primary)' }} /> Submit 4th-Year Application
                    </h4>

                    <div className={styles.applyDocSelector}>
                      <label className={styles.applyLabel}>Select Resume / CV from Vault</label>
                      {documents.length > 0 ? (
                        <select
                          className={styles.applySelect}
                          value={selectedDoc}
                          onChange={(e) => setSelectedDoc(e.target.value)}
                        >
                          {documents.map((doc) => (
                            <option key={doc.id} value={doc.fileName}>
                              {doc.title || doc.fileName} ({doc.type.toUpperCase()})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div style={{ fontSize: '0.85rem', color: '#64748b', padding: '6px 0' }}>
                          <i className="bi bi-file-earmark-text" /> Default System Document (You can upload your real Resume in Profile &amp; Resume)
                        </div>
                      )}
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
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
