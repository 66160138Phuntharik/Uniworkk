import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import StatCard from '../../components/StatCard/StatCard';
import Badge from '../../components/Badge/Badge';
import { getCompanyNavItems } from '../../utils/companyNav';
import styles from './CompanyApplicants.module.css';

const DEFAULT_APPLICANTS = [
  {
    id: 1,
    jobId: 1,
    studentId: 1,
    studentCode: '65160138',
    name: 'Alex Johnson',
    email: 'test001@go.buu.ac.th',
    phone: '+66 89 123 4567',
    major: 'Computer Science',
    faculty: 'Informatics',
    university: 'Burapha University',
    year: 'Year 4',
    gpa: 3.80,
    position: 'Frontend Developer Intern (React / Next.js)',
    appliedDate: '2026-05-15',
    status: 'accepted',
    resumeAttached: 'Alex_Johnson_Resume_2026.pdf',
    skills: ['React', 'TypeScript', 'Next.js', 'TailwindCSS', 'Git'],
    coverNote: 'I am a 4th-year CS student passionate about React, Next.js, and modern UI engineering. I have built several projects using TypeScript and REST APIs, and I am eager to contribute to TechNova Solutions.',
  },
  {
    id: 2,
    jobId: 1,
    studentId: 2,
    studentCode: '65160042',
    name: 'Maria Chen',
    email: 'test002@go.buu.ac.th',
    phone: '+66 81 234 5678',
    major: 'Software Engineering',
    faculty: 'Informatics',
    university: 'Burapha University',
    year: 'Year 4',
    gpa: 3.55,
    position: 'Frontend Developer Intern (React / Next.js)',
    appliedDate: '2026-05-14',
    status: 'interviewing',
    resumeAttached: 'Maria_Chen_Resume_2026.pdf',
    skills: ['Vue.js', 'React', 'CSS Modules', 'JavaScript', 'HTML5'],
    coverNote: 'Experienced in building frontend interfaces with Vue and React. Looking forward to expanding my skills in production-grade software development at TechNova.',
  },
  {
    id: 3,
    jobId: 8,
    studentId: 3,
    studentCode: '65160219',
    name: 'James Park',
    email: 'test003@go.buu.ac.th',
    phone: '+66 82 345 6789',
    major: 'Computer Science',
    faculty: 'Informatics',
    university: 'Burapha University',
    year: 'Year 4',
    gpa: 3.92,
    position: 'Full Stack Engineering Intern (Node.js & React)',
    appliedDate: '2026-05-13',
    status: 'reviewing',
    resumeAttached: 'James_Park_SWE_Resume.pdf',
    skills: ['Node.js', 'Express', 'React', 'PostgreSQL', 'Docker'],
    coverNote: 'Full-stack enthusiast with strong algorithmic foundations and experience building scalable Express & React applications.',
  },
  {
    id: 4,
    jobId: 8,
    studentId: 4,
    studentCode: '65160085',
    name: 'Sarah Lin',
    email: 'test004@go.buu.ac.th',
    phone: '+66 83 456 7890',
    major: 'Information Technology',
    faculty: 'Informatics',
    university: 'Burapha University',
    year: 'Year 4',
    gpa: 3.68,
    position: 'Full Stack Engineering Intern (Node.js & React)',
    appliedDate: '2026-05-12',
    status: 'reviewing',
    resumeAttached: 'Sarah_Lin_Resume.pdf',
    skills: ['JavaScript', 'Node.js', 'Express', 'MongoDB', 'REST APIs'],
    coverNote: 'Proficient in Node.js, Express, and modern JavaScript frameworks. Excited about the full-stack engineering internship opportunity.',
  },
  {
    id: 5,
    jobId: 9,
    studentId: 5,
    studentCode: '65160312',
    name: 'Kittisak Somboon',
    email: 'test005@go.buu.ac.th',
    phone: '+66 84 567 8901',
    major: 'Digital Media & Software',
    faculty: 'Informatics',
    university: 'Burapha University',
    year: 'Year 4',
    gpa: 3.74,
    position: 'UI/UX Product Design Intern',
    appliedDate: '2026-05-10',
    status: 'rejected',
    resumeAttached: 'Kittisak_UIUX_Portfolio.pdf',
    skills: ['Figma', 'UI Design', 'Wireframing', 'Prototyping', 'Design Systems'],
    coverNote: 'Deep passion for user experience, design systems, and responsive interactive web interfaces with Figma.',
  },
];

const DEFAULT_POSITIONS = [
  'All Positions',
  'Frontend Developer Intern (React / Next.js)',
  'Full Stack Engineering Intern (Node.js & React)',
  'UI/UX Product Design Intern',
];

export default function CompanyApplicants() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [applicants, setApplicants] = useState(DEFAULT_APPLICANTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'reviewing' | 'interviewing' | 'accepted' | 'rejected'
  const [positionFilter, setPositionFilter] = useState('All Positions');
  const [previewCandidate, setPreviewCandidate] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch real data from backend if available
  useEffect(() => {
    fetch('http://localhost:5000/api/companies/applicants')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.applicants && data.applicants.length > 0) {
          setApplicants(data.applicants);
        }
      })
      .catch(() => {});
  }, []);

  // Handle URL query parameter ?jobId=... and ?jobTitle=...
  useEffect(() => {
    const queryJobId = searchParams.get('jobId');
    const queryJobTitle = searchParams.get('jobTitle');

    if (queryJobTitle) {
      setPositionFilter(queryJobTitle);
    } else if (queryJobId) {
      const match = applicants.find((a) => a.jobId === parseInt(queryJobId));
      if (match) {
        setPositionFilter(match.position);
      }
    }
  }, [searchParams, applicants]);

  // Available job positions for filtering
  const availablePositions = useMemo(() => {
    const set = new Set(['All Positions', ...DEFAULT_POSITIONS]);
    applicants.forEach((a) => {
      if (a.position) set.add(a.position);
    });
    if (positionFilter && positionFilter !== 'All Positions') {
      set.add(positionFilter);
    }
    return Array.from(set);
  }, [applicants, positionFilter]);

  // Status counts for pipeline tabs
  const statusCounts = useMemo(() => {
    return {
      all: applicants.length,
      reviewing: applicants.filter((a) => a.status === 'reviewing').length,
      interviewing: applicants.filter((a) => a.status === 'interviewing').length,
      accepted: applicants.filter((a) => a.status === 'accepted').length,
      rejected: applicants.filter((a) => a.status === 'rejected').length,
    };
  }, [applicants]);

  // Filtered applicants
  const filteredApplicants = useMemo(() => {
    return applicants.filter((app) => {
      const matchesStatus =
        statusFilter === 'all' || app.status === statusFilter;
      const matchesPos =
        positionFilter === 'All Positions' || app.position === positionFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        app.name.toLowerCase().includes(q) ||
        (app.studentCode && app.studentCode.includes(q)) ||
        (app.major && app.major.toLowerCase().includes(q)) ||
        (app.position && app.position.toLowerCase().includes(q));

      return matchesStatus && matchesPos && matchesSearch;
    });
  }, [applicants, statusFilter, positionFilter, searchQuery]);

  // Update applicant status
  const handleStatusChange = async (applicantId, newStatus) => {
    const candidate = applicants.find((a) => a.id === applicantId);
    if (!candidate) return;

    // Optimistic UI update
    setApplicants((prev) =>
      prev.map((a) => (a.id === applicantId ? { ...a, status: newStatus } : a))
    );

    showToast(
      `Updated ${candidate.name}'s status to ${newStatus.toUpperCase()}`
    );

    try {
      await fetch(
        `http://localhost:5000/api/companies/applicants/${applicantId}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        }
      );
    } catch {
      // Optimistic update retained
    }
  };

  return (
    <div className={styles.layout}>
      <Sidebar
        subtitle="Company"
        navItems={getCompanyNavItems('applicants', navigate, applicants.length)}
        onLogout={() => navigate('/login')}
      />

      <main className={styles.main}>
        {/* ── Header ─────────────────────────────────────── */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.heading}>Applicant Management</h1>
            <p className={styles.subheading}>
              TechNova Solutions · Review applications, inspect student CVs, and manage recruitment pipeline
              {positionFilter !== 'All Positions' && (
                <span className={styles.activeJobFilterBadge}>
                  · Filtered by: <strong>{positionFilter}</strong>
                </span>
              )}
            </p>
          </div>
          <div className={styles.headerRight}>
            <button
              className={styles.backBtn}
              onClick={() => navigate('/company/jobs')}
              title="Return to My Job Listings"
            >
              <i className="bi bi-arrow-left" /> Back to My Job Listings
            </button>
            <div className={styles.avatar}>T</div>
          </div>
        </header>

        {/* ── Stats Row ───────────────────────────────────── */}
        <div className={styles.statsRow}>
          <StatCard
            label="Total Candidates"
            value={String(statusCounts.all)}
            unit="applicants"
          />
          <StatCard
            label="Under Review"
            value={String(statusCounts.reviewing)}
            unit="pending"
            accent="secondary"
          />
          <StatCard
            label="Interviewing"
            value={String(statusCounts.interviewing)}
            unit="scheduled"
            accent="warning"
          />
          <StatCard
            label="Accepted / Placed"
            value={String(statusCounts.accepted)}
            unit="hired"
            accent="success"
          />
        </div>

        {/* ── Filter Controls Card ─────────────────────────── */}
        <div className={styles.controlsCard}>
          <div className={styles.controlsTopRow}>
            <div className={styles.searchWrap}>
              <i className={`bi bi-search ${styles.searchIcon}`} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search candidate by name, student code (e.g. 65160138), or major..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <select
                className={styles.selectJobInput}
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
              >
                {availablePositions.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>

              {positionFilter !== 'All Positions' && (
                <button
                  type="button"
                  className={styles.clearJobFilterBtn}
                  onClick={() => setPositionFilter('All Positions')}
                  title="Show all candidate applications"
                >
                  <i className="bi bi-x-circle" /> Clear Filter
                </button>
              )}
            </div>
          </div>

          <div className={styles.statusTabs}>
            <button
              className={`${styles.statusTabBtn} ${
                statusFilter === 'all' ? styles.statusTabActive : ''
              }`}
              onClick={() => setStatusFilter('all')}
            >
              All Candidates
              <span className={styles.tabBadge}>{statusCounts.all}</span>
            </button>
            <button
              className={`${styles.statusTabBtn} ${
                statusFilter === 'reviewing' ? styles.statusTabActive : ''
              }`}
              onClick={() => setStatusFilter('reviewing')}
            >
              Under Review
              <span className={styles.tabBadge}>{statusCounts.reviewing}</span>
            </button>
            <button
              className={`${styles.statusTabBtn} ${
                statusFilter === 'interviewing' ? styles.statusTabActive : ''
              }`}
              onClick={() => setStatusFilter('interviewing')}
            >
              Interviewing
              <span className={styles.tabBadge}>{statusCounts.interviewing}</span>
            </button>
            <button
              className={`${styles.statusTabBtn} ${
                statusFilter === 'accepted' ? styles.statusTabActive : ''
              }`}
              onClick={() => setStatusFilter('accepted')}
            >
              Accepted
              <span className={styles.tabBadge}>{statusCounts.accepted}</span>
            </button>
            <button
              className={`${styles.statusTabBtn} ${
                statusFilter === 'rejected' ? styles.statusTabActive : ''
              }`}
              onClick={() => setStatusFilter('rejected')}
            >
              Rejected
              <span className={styles.tabBadge}>{statusCounts.rejected}</span>
            </button>
          </div>
        </div>

        {/* ── Applicants List ──────────────────────────────── */}
        {filteredApplicants.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <i className="bi bi-people" />
            </div>
            <h3 className={styles.emptyTitle}>No candidates found</h3>
            <p className={styles.emptyText}>
              No student applications match the selected status or search query.
            </p>
          </div>
        ) : (
          <div className={styles.applicantsList}>
            {filteredApplicants.map((applicant) => (
              <div key={applicant.id} className={styles.applicantCard}>
                <div className={styles.cardMainRow}>
                  <div className={candidateLeftStyle(applicant)}>
                    <div className={styles.candidateAvatar}>
                      {applicant.name.charAt(0)}
                    </div>
                    <div className={styles.candidateMeta}>
                      <div className={styles.candidateNameRow}>
                        <span className={styles.candidateName}>
                          {applicant.name}
                        </span>
                        <span className={styles.studentCode}>
                          ID: {applicant.studentCode || '65160138'}
                        </span>
                        {applicant.gpa >= 3.5 && (
                          <span className={styles.honorBadge}>
                            <i className="bi bi-award" /> High Honors
                          </span>
                        )}
                      </div>

                      <div className={styles.academicInfo}>
                        <span>
                          {applicant.major} ({applicant.year || 'Year 4'})
                        </span>
                        <span>·</span>
                        <span>{applicant.university || 'Burapha University'}</span>
                        <span>·</span>
                        <span className={styles.gpaHighlight}>
                          GPA {Number(applicant.gpa).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.candidateRight}>
                    <select
                      className={`${styles.statusSelect} ${getStatusSelectClass(
                        applicant.status
                      )}`}
                      value={applicant.status}
                      onChange={(e) =>
                        handleStatusChange(applicant.id, e.target.value)
                      }
                    >
                      <option value="reviewing">Under Review</option>
                      <option value="interviewing">Interviewing</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Sub-row: Applied Position, Date & Resume Preview */}
                <div className={styles.detailRow}>
                  <div className={styles.appliedPosition}>
                    <i className="bi bi-briefcase text-muted" />
                    <span>Applied for: {applicant.position}</span>
                  </div>

                  <div className={styles.resumeDocWrap}>
                    <span className={styles.appliedDate}>
                      <i className="bi bi-calendar3" /> Applied {applicant.appliedDate}
                    </span>

                    <button
                      className={styles.previewDocBtn}
                      onClick={() => setPreviewCandidate(applicant)}
                    >
                      <i className="bi bi-file-earmark-pdf text-danger" />
                      <span>{applicant.resumeAttached || 'Resume.pdf'}</span>
                      <i className="bi bi-eye" />
                    </button>
                  </div>
                </div>

                {/* Cover Note */}
                {applicant.coverNote && (
                  <div className={styles.coverNoteBox}>
                    &quot;{applicant.coverNote}&quot;
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Resume / CV Preview Modal ────────────────────── */}
        {previewCandidate && (
          <div
            className={styles.modalBackdrop}
            onClick={() => setPreviewCandidate(null)}
          >
            <div
              className={styles.previewModal}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div className={styles.modalHeaderTitle}>
                  <i className="bi bi-file-earmark-person-fill text-warning" />
                  <span>
                    Candidate Document: {previewCandidate.resumeAttached || 'Resume.pdf'}
                  </span>
                </div>
                <button
                  className={styles.closeModalBtn}
                  onClick={() => setPreviewCandidate(null)}
                >
                  <i className="bi bi-x-lg" />
                </button>
              </div>

              <div className={styles.modalBody}>
                {/* Candidate Overview Card */}
                <div className={styles.resumeHeaderCard}>
                  <div className={styles.candidateAvatar}>
                    {previewCandidate.name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                      {previewCandidate.name}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '4px 0' }}>
                      {previewCandidate.major} · {previewCandidate.university || 'Burapha University'}
                    </p>
                    <div style={{ display: 'flex', gap: '14px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <span>
                        <i className="bi bi-envelope" /> {previewCandidate.email || 'student@example.com'}
                      </span>
                      <span>
                        <i className="bi bi-telephone" /> {previewCandidate.phone || '+66 89 123 4567'}
                      </span>
                      <span>
                        <i className="bi bi-mortarboard" /> GPA {Number(previewCandidate.gpa).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cover Letter / Statement */}
                <div>
                  <h4 className={styles.resumeSectionTitle}>
                    <i className="bi bi-chat-left-quote text-primary" /> Cover Statement
                  </h4>
                  <p className={styles.resumeText}>
                    {previewCandidate.coverNote ||
                      'Enthusiastic senior student applying for this internship opportunity to gain hands-on engineering experience.'}
                  </p>
                </div>

                {/* Technical Skills */}
                <div>
                  <h4 className={styles.resumeSectionTitle}>
                    <i className="bi bi-code-slash text-primary" /> Technical Skills & Tools
                  </h4>
                  <div className={styles.skillsGrid}>
                    {(
                      previewCandidate.skills || [
                        'React',
                        'TypeScript',
                        'JavaScript',
                        'CSS3',
                        'Git',
                        'REST APIs',
                      ]
                    ).map((skill, idx) => (
                      <Badge key={idx} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Academic Highlights */}
                <div>
                  <h4 className={styles.resumeSectionTitle}>
                    <i className="bi bi-journal-bookmark text-primary" /> Academic Qualifications
                  </h4>
                  <p className={styles.resumeText}>
                    Currently completing 4th-year coursework with a focus on Software Architecture, Web Application Development, Database Systems, and Cloud Foundations. Consistently maintained a strong GPA above 3.50.
                  </p>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <a
                  href={`#download-${previewCandidate.id}`}
                  className={styles.downloadLink}
                  onClick={(e) => {
                    e.preventDefault();
                    showToast(`Simulated download of ${previewCandidate.resumeAttached}`);
                  }}
                >
                  <i className="bi bi-download" /> Download Original PDF Document
                </a>

                <button
                  className={styles.previewDocBtn}
                  onClick={() => setPreviewCandidate(null)}
                >
                  Close Viewer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Toast Notification ───────────────────────────── */}
        {toast && (
          <div className={styles.toast}>
            <i className="bi bi-check-circle-fill text-warning" />
            <span>{toast}</span>
          </div>
        )}
      </main>
    </div>
  );
}

function candidateLeftStyle() {
  return styles.candidateLeft;
}

function getStatusSelectClass(status) {
  switch (status) {
    case 'reviewing':
      return styles.statusSelectReviewing;
    case 'interviewing':
      return styles.statusSelectInterviewing;
    case 'accepted':
      return styles.statusSelectAccepted;
    case 'rejected':
      return styles.statusSelectRejected;
    default:
      return '';
  }
}
