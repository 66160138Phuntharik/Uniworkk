import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import styles from './WeeklyReports.module.css';


const DEFAULT_STATS = {
  totalWeeksRequired: 16,
  submittedWeeks: 0,
  nextDueWeek: 1,
  company: 'Pending Internship Placement',
  position: 'Internship Trainee',
};

export default function WeeklyReports() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('uniwork_user') || 'null');
    } catch {
      return null;
    }
  })();
  const studentId = currentUser?.id || 1;

  // State
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [profile, setProfile] = useState({
    nameEn: currentUser?.name || 'Student',
    studentCode: currentUser?.studentCode || '',
  });
  const [toast, setToast] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingReportId, setEditingReportId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields (Only Week, Date Range, and ONE large content textarea)
  const [formWeek, setFormWeek] = useState(1);
  const [formDateRange, setFormDateRange] = useState('Week 1 Period (Aug 2026)');
  const [formContent, setFormContent] = useState('');

  // Sidebar navigation items
  const navItems = [
    { iconClass: 'bi-grid-1x2-fill', label: 'Dashboard', onClick: () => navigate('/student/dashboard') },
    { iconClass: 'bi-search', label: 'Find Internships', onClick: () => navigate('/student/internships') },
    { iconClass: 'bi-briefcase', label: 'Application Status', onClick: () => navigate('/student/internships') },
    { iconClass: 'bi-journal-text', label: 'Weekly Reports', badge: reports.length > 0 ? String(reports.length) : undefined, active: true },
    { iconClass: 'bi-person-badge', label: 'Profile & Resume', onClick: () => navigate('/student/profile') },
  ];

  // Fetch from backend on mount
  useEffect(() => {
    fetch(`http://localhost:5000/api/students/${studentId}/profile`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.profile) {
          setProfile(data.profile);
        }
      })
      .catch(() => {});

    fetch(`http://localhost:5000/api/students/${studentId}/reports`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.reports) {
          setReports(data.reports);
          if (data.stats) setStats(data.stats);
        }
      })
      .catch(() => {});

    // Check query params if user clicked "Write Report" from dashboard
    const params = new URLSearchParams(location.search);
    if (params.get('new') === 'true') {
      handleOpenNewModal();
    }
  }, [location.search, studentId]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Open New Report Modal
  const handleOpenNewModal = () => {
    setEditingReportId(null);
    const nextWeek = stats.nextDueWeek || 4;
    setFormWeek(nextWeek);
    setFormDateRange(`Week ${nextWeek} Period (Aug 2026)`);
    setFormContent('');
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (rep) => {
    setEditingReportId(rep.id);
    setFormWeek(rep.week);
    setFormDateRange(rep.dateRange || `Week ${rep.week}`);
    setFormContent(rep.content || '');
    setShowModal(true);
  };

  // Handle Submit Form
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!formContent.trim()) {
      showToast('Please enter your weekly report details.', 'info');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      week: formWeek,
      dateRange: formDateRange,
      content: formContent.trim(),
    };

    try {
      const res = await fetch(`http://localhost:5000/api/students/${studentId}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setReports((prev) => {
          const idx = prev.findIndex((r) => r.week === formWeek);
          if (idx !== -1) {
            const updated = [...prev];
            updated[idx] = data.report;
            return updated;
          }
          return [data.report, ...prev].sort((a, b) => b.week - a.week);
        });
      } else {
        throw new Error('Local fallback');
      }
    } catch {
      // Local fallback
      const newRep = {
        id: editingReportId || Date.now(),
        studentId: 1,
        studentName: profile.nameEn || 'Student',
        company: stats.company || 'TechNova Solutions',
        week: parseInt(formWeek),
        dateRange: formDateRange,
        content: formContent.trim(),
        submittedDate: new Date().toISOString().split('T')[0],
      };

      setReports((prev) => {
        const idx = prev.findIndex((r) => r.week === formWeek);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = newRep;
          return updated;
        }
        return [newRep, ...prev].sort((a, b) => b.week - a.week);
      });
    } finally {
      // Update statistics
      setStats((prev) => {
        const newSubmitted = reports.some((r) => r.week === formWeek)
          ? prev.submittedWeeks
          : prev.submittedWeeks + 1;
        return {
          ...prev,
          submittedWeeks: newSubmitted,
          nextDueWeek: formWeek + 1 <= 16 ? formWeek + 1 : 16,
        };
      });

      setIsSubmitting(false);
      setShowModal(false);
      showToast(`Weekly Report for Week ${formWeek} saved successfully! ✅`);
    }
  };

  const progressPercent = Math.min(
    100,
    Math.round((stats.submittedWeeks / stats.totalWeeksRequired) * 100)
  );

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
              <i className="bi bi-journal-text" style={{ color: 'var(--primary)' }} />
              Internship Weekly Report
            </h1>
            <p className={styles.pageSubtitle}>
              Record your internship activities, learnings, and experiences for each week.
            </p>
          </div>

          <div className={styles.headerActions}>
            <button className={styles.backBtn} onClick={() => navigate('/student/dashboard')}>
              <i className="bi bi-arrow-left" /> Back to Dashboard
            </button>
            <button className={styles.newReportBtn} onClick={handleOpenNewModal}>
              <i className="bi bi-plus-circle-fill" /> Write Weekly Report
            </button>
          </div>
        </header>

        {/* ── Toast Alert ─────────────────────────────────── */}
        {toast && (
          <div className={`${styles.toast} ${toast.type === 'info' ? styles.toastInfo : styles.toastSuccess}`} role="alert">
            <span>{toast.message}</span>
            <button className={styles.modalCloseBtn} onClick={() => setToast(null)}>×</button>
          </div>
        )}

        {/* ── Overview & Progress Card ────────────────────── */}
        <section className={styles.overviewCard}>
          <div className={styles.overviewTop}>
            <div className={styles.placementInfo}>
              <div className={styles.companyAvatar}>
                {stats.company ? stats.company.charAt(0) : 'T'}
              </div>
              <div className={styles.placementMeta}>
                <div className={styles.companyName}>
                  {stats.company}
                  <i className="bi bi-patch-check-fill" style={{ color: '#0d6efd', fontSize: '0.9rem' }} />
                </div>
                <div className={styles.roleTag}>
                  {stats.position} · Semester 1/2026 (4th Year)
                </div>
              </div>
            </div>

            <div className={styles.studentMetaBadge}>
              <i className="bi bi-person-fill" />
              <span>{profile.nameEn || 'Student'} (ID: {profile.studentCode || '66160138'})</span>
            </div>
          </div>

          {/* Simple Progress Bar */}
          <div className={styles.progressBlock}>
            <div className={styles.progressHeader}>
              <span className={styles.progressLabel}>
                Internship Completion: {stats.submittedWeeks} of {stats.totalWeeksRequired} Weeks Recorded
              </span>
              <span className={styles.progressValue}>{progressPercent}%</span>
            </div>
            <div className={styles.progressBarBg}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </section>

        {/* ── Feed Header ─────────────────────────────────── */}
        <div className={styles.feedHeader}>
          <h2 className={styles.feedTitle}>
            <i className="bi bi-collection" style={{ color: 'var(--primary)' }} />
            Weekly Experience Logs
          </h2>
          <span className={styles.feedCount}>
            {reports.length} {reports.length === 1 ? 'Report' : 'Reports'} Logged
          </span>
        </div>

        {/* ── Reports Feed ────────────────────────────────── */}
        <div className={styles.reportsFeed}>
          {reports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--white)', borderRadius: '12px', border: '1px dashed var(--border)', boxShadow: 'var(--shadow-xs)' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 16px' }}>
                <i className="bi bi-journal-plus" />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '8px' }}>No Weekly Reports Submitted Yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                You have not submitted any weekly reports yet. Once you start your internship, record your weekly progress and learning logs here.
              </p>
              <button className={styles.newReportBtn} style={{ margin: '0 auto', display: 'inline-flex' }} onClick={handleOpenNewModal}>
                <i className="bi bi-plus-circle-fill" /> Write First Weekly Report
              </button>
            </div>
          ) : (
            reports.map((rep) => (
              <article key={rep.id} className={styles.reportCard}>
                {/* Card Header */}
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitleBlock}>
                    <span className={styles.weekTag}>
                      <i className="bi bi-calendar-event" /> Week {rep.week}
                    </span>
                    <h3 className={styles.weekDates}>{rep.dateRange}</h3>
                  </div>

                  <div className={styles.submittedDateNote}>
                    <i className="bi bi-clock-history" /> Submitted: {rep.submittedDate}
                  </div>
                </div>

                {/* Single Large Content Text */}
                <p className={styles.reportContent}>{rep.content}</p>

                {/* Card Footer Actions */}
                <div className={styles.cardFooter}>
                  <button
                    className={styles.editBtn}
                    onClick={() => handleOpenEditModal(rep)}
                  >
                    <i className="bi bi-pencil-square" /> Edit Report
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        {/* ── MODAL: Write / Edit Weekly Report ────────────── */}
        {showModal && (
          <div className={styles.modalBackdrop} onClick={() => setShowModal(false)}>
            <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>
                  <i className="bi bi-journal-text" style={{ color: 'var(--primary)' }} />
                  {editingReportId ? `Edit Weekly Report — Week ${formWeek}` : `Write Weekly Report — Week ${formWeek}`}
                </h3>
                <button className={styles.modalCloseBtn} onClick={() => setShowModal(false)}>×</button>
              </div>

              <form onSubmit={handleSubmitReport}>
                <div className={styles.modalBody}>
                  {/* Row: Week & Date Range */}
                  <div className={styles.formRowTwo}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Internship Week</label>
                      <select
                        className={styles.formSelect}
                        value={formWeek}
                        onChange={(e) => {
                          const w = parseInt(e.target.value);
                          setFormWeek(w);
                          setFormDateRange(`Week ${w} Period (Aug 2026)`);
                        }}
                      >
                        {Array.from({ length: 16 }, (_, i) => i + 1).map((w) => (
                          <option key={w} value={w}>
                            Week {w} {w === stats.nextDueWeek ? '(Current)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Date Range</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        placeholder="e.g. Aug 24 – Aug 28, 2026"
                        value={formDateRange}
                        onChange={(e) => setFormDateRange(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Single Large Text Area */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Weekly Report & Experience Log *</label>
                    <textarea
                      className={styles.largeTextarea}
                      placeholder="Write freely about anything you did, worked on, experienced, learned, or encountered during this week..."
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      required
                    />
                    <span className={styles.helpText}>
                      Describe your activities, tasks, challenges, learning experiences, or anything notable from this week.
                    </span>
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className={styles.backBtn}
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={isSubmitting}
                  >
                    <i className="bi bi-check2-circle" />
                    {isSubmitting ? 'Saving…' : editingReportId ? 'Save Changes' : 'Save Report'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
