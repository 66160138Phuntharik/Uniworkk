import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import StatCard from '../../components/StatCard/StatCard';
import Badge from '../../components/Badge/Badge';
import { getProfessorNavItems } from '../../utils/professorNav';
import styles from './ProfessorReviewReports.module.css';

export default function ProfessorReviewReports() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialStudentId = searchParams.get('studentId');

  const [reports, setReports] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [totalStudents, setTotalStudents] = useState(0);

  // Fetch reports from backend
  const fetchReports = () => {
    fetch('http://localhost:5000/api/professors/reports')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.reports)) {
          setReports(data.reports);
        }
      })
      .catch((err) => {
        console.warn('Could not load reports from backend:', err);
      });

    fetch('http://localhost:5000/api/professors/students')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.total) setTotalStudents(data.total);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Filter by initial student ID if present in query param
      if (initialStudentId && r.studentId !== parseInt(initialStudentId)) {
        return false;
      }

      // Filter by status tab
      if (statusFilter !== 'all' && r.status !== statusFilter) {
        return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = r.studentName && r.studentName.toLowerCase().includes(q);
        const matchesCode = r.studentCode && r.studentCode.toLowerCase().includes(q);
        const matchesCompany = r.company && r.company.toLowerCase().includes(q);
        const matchesContent = r.content && r.content.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesCompany && !matchesContent) {
          return false;
        }
      }

      return true;
    });
  }, [reports, initialStudentId, statusFilter, searchQuery]);

  // Set default selected report when list loads or changes
  useEffect(() => {
    if (filteredReports.length > 0) {
      if (!selectedReportId || !filteredReports.some((r) => r.id === selectedReportId)) {
        const pendingFirst = filteredReports.find((r) => r.status === 'pending') || filteredReports[0];
        setSelectedReportId(pendingFirst.id);
        setFeedbackInput(pendingFirst.feedback || '');
      }
    } else {
      setSelectedReportId(null);
      setFeedbackInput('');
    }
  }, [filteredReports, selectedReportId]);

  // Handle selecting a report
  const handleSelectReport = (report) => {
    setSelectedReportId(report.id);
    setFeedbackInput(report.feedback || '');
  };

  const selectedReport = useMemo(() => {
    return reports.find((r) => r.id === selectedReportId) || null;
  }, [reports, selectedReportId]);

  // Calculate statistics
  const pendingCount = useMemo(() => reports.filter((r) => r.status === 'pending').length, [reports]);
  const reviewedCount = useMemo(() => reports.filter((r) => r.status === 'reviewed').length, [reports]);

  // Submit Feedback / Comments to backend
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    if (!feedbackInput.trim()) {
      showToast('Please enter comments or feedback before saving.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/professors/reports/${selectedReport.id}/feedback`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feedback: feedbackInput.trim() }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Update local state with the updated report
        setReports((prev) =>
          prev.map((r) => (r.id === selectedReport.id ? data.report : r))
        );
        showToast('Professor feedback saved & report marked as reviewed!', 'success');
      } else {
        throw new Error('Server returned non-200');
      }
    } catch (err) {
      console.error('Feedback submit error:', err);
      showToast('Failed to submit feedback to server. Please try again.', 'danger');
    } finally {
      setIsSaving(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

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

  const navItems = getProfessorNavItems('reports', navigate, pendingCount, totalStudents);

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
          <div className={styles.headerTitle}>
            <h1 className={styles.heading}>Review Reports</h1>
            <p className={styles.subheading}>
              Review weekly student internship logs and provide feedback · Semester 1/2026
            </p>
          </div>
          <div className={styles.userChip}>
            <span className={styles.userName}>{profName}</span>
            <div className={styles.avatar}>{profInitial}</div>
          </div>
        </header>

        {/* Stats Summary Row */}
        <div className={styles.statsRow}>
          <StatCard label="Total Reports" value={reports.length} unit="submitted" />
          <StatCard label="Pending Review" value={pendingCount} unit="reports" accent="warning" />
          <StatCard label="Reviewed" value={reviewedCount} unit="reports" accent="success" />
        </div>

        {/* Master-Detail Split Workspace */}
        <div className={styles.splitLayout}>
          {/* Left Column: Report List */}
          <div className={styles.listColumn}>
            <div className={styles.listHeader}>
              <div className={styles.listTitleWrap}>
                <h2 className={styles.listTitle}>Submitted Reports</h2>
                {initialStudentId && (
                  <button
                    className={styles.filterBtn}
                    onClick={() => navigate('/professor/reports')}
                    title="Clear student filter"
                  >
                    Clear Filter ✕
                  </button>
                )}
              </div>

              {/* Search Bar */}
              <div className={styles.searchWrap}>
                <i className={`bi bi-search ${styles.searchIcon}`} />
                <input
                  type="text"
                  placeholder="Search student or content..."
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filter Tabs */}
              <div className={styles.filterTabs}>
                <button
                  className={`${styles.filterBtn} ${statusFilter === 'all' ? styles.filterBtnActive : ''}`}
                  onClick={() => setStatusFilter('all')}
                >
                  All ({reports.length})
                </button>
                <button
                  className={`${styles.filterBtn} ${statusFilter === 'pending' ? styles.filterBtnActive : ''}`}
                  onClick={() => setStatusFilter('pending')}
                >
                  Pending ({pendingCount})
                </button>
                <button
                  className={`${styles.filterBtn} ${statusFilter === 'reviewed' ? styles.filterBtnActive : ''}`}
                  onClick={() => setStatusFilter('reviewed')}
                >
                  Reviewed ({reviewedCount})
                </button>
              </div>
            </div>

            {/* Scrollable Reports List */}
            <div className={styles.reportListScroll}>
              {filteredReports.length === 0 ? (
                <div className={styles.emptyList}>
                  <i className="bi bi-inbox" style={{ fontSize: '1.8rem', display: 'block', marginBottom: 8 }} />
                  No reports found for this filter.
                </div>
              ) : (
                filteredReports.map((report) => {
                  const isSelected = selectedReportId === report.id;
                  const isPending = report.status === 'pending';

                  return (
                    <div
                      key={report.id}
                      className={`${styles.reportItem} ${isSelected ? styles.reportItemActive : ''}`}
                      onClick={() => handleSelectReport(report)}
                    >
                      <div className={styles.itemTopRow}>
                        <span className={styles.itemStudentName}>{report.studentName}</span>
                        <span className={styles.itemWeekBadge}>Week {report.week}</span>
                      </div>
                      <div className={styles.itemCompany}>
                        {report.company} · {report.position || 'Intern'}
                      </div>
                      <div className={styles.itemSnippet}>{report.content}</div>
                      <div className={styles.itemBottomRow}>
                        <span>{report.dateRange || report.submittedDate}</span>
                        <Badge variant={isPending ? 'warning' : 'success'}>
                          {isPending ? 'Pending Review' : 'Reviewed'}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Large Report Textarea & Feedback */}
          <div className={styles.detailColumn}>
            {selectedReport ? (
              <>
                {/* Header Information */}
                <div className={styles.detailHeader}>
                  <div className={styles.detailStudentMeta}>
                    <div className={styles.detailAvatar}>
                      {selectedReport.studentName
                        ? selectedReport.studentName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                        : 'ST'}
                    </div>
                    <div>
                      <div className={styles.detailName}>{selectedReport.studentName}</div>
                      <div className={styles.detailSub}>
                        {selectedReport.studentCode && (
                          <span>ID: {selectedReport.studentCode} · </span>
                        )}
                        <span>{selectedReport.company}</span>
                        {selectedReport.position && <span> ({selectedReport.position})</span>}
                      </div>
                    </div>
                  </div>

                  <div className={styles.detailStatusWrap}>
                    <Badge variant={selectedReport.status === 'pending' ? 'warning' : 'success'}>
                      {selectedReport.status === 'pending' ? 'Pending Review' : 'Reviewed'}
                    </Badge>
                    <span className={styles.submittedDateText}>
                      Week {selectedReport.week} · Submitted on {selectedReport.submittedDate}
                    </span>
                  </div>
                </div>

                {/* Body: Report Content (One large textarea) & Feedback */}
                <div className={styles.detailBody}>
                  {/* Report Content Section */}
                  <div className={styles.sectionBlock}>
                    <div className={styles.sectionHeader}>
                      <span className={styles.sectionTitle}>
                        <i className="bi bi-file-earmark-text" />
                        Weekly Internship Report Content
                      </span>
                      <span className={styles.sectionSubtitle}>
                        {selectedReport.dateRange || `Week ${selectedReport.week}`}
                      </span>
                    </div>

                    {/* One large text area to show the report content */}
                    <textarea
                      readOnly
                      className={styles.reportContentTextarea}
                      value={selectedReport.content || ''}
                      aria-label="Student's Weekly Internship Report Content"
                    />
                  </div>

                  {/* Feedback / Comments Section */}
                  <form onSubmit={handleSubmitFeedback} className={styles.feedbackCard}>
                    <div className={styles.feedbackTitleRow}>
                      <label htmlFor="feedbackInput" className={styles.feedbackLabel}>
                        <i className="bi bi-chat-left-dots" />
                        Professor Comments & Feedback
                      </label>
                      {selectedReport.feedbackDate && (
                        <span className={styles.feedbackTimestamp}>
                          <i className="bi bi-check-circle" style={{ marginRight: 4 }} />
                          Reviewed on {selectedReport.feedbackDate}
                        </span>
                      )}
                    </div>

                    {/* Large text area to add comments or feedback */}
                    <textarea
                      id="feedbackInput"
                      className={styles.feedbackTextarea}
                      placeholder="Write your constructive feedback, approval comments, or guidance for the student..."
                      value={feedbackInput}
                      onChange={(e) => setFeedbackInput(e.target.value)}
                      required
                    />

                    <div className={styles.feedbackActions}>
                      <span className={styles.feedbackTip}>
                        Submitting feedback will automatically mark this weekly report as <strong>Reviewed</strong>.
                      </span>

                      <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isSaving}
                      >
                        <i className="bi bi-send-check" />
                        {isSaving
                          ? 'Submitting...'
                          : selectedReport.status === 'reviewed'
                          ? 'Update Feedback'
                          : 'Submit Feedback & Mark Reviewed'}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            ) : (
              <div className={styles.noSelection}>
                <i className={`bi bi-journal-check ${styles.noSelectionIcon}`} />
                <h3>No Report Selected</h3>
                <p>Select a student report from the left column to view its content and submit feedback.</p>
              </div>
            )}
          </div>
        </div>

        {/* Success / Info Toast */}
        {toast && (
          <div
            className={styles.toast}
            style={{
              background: toast.type === 'error' ? '#dc3545' : '#198754',
            }}
          >
            <i className={`bi ${toast.type === 'error' ? 'bi-exclamation-triangle' : 'bi-check-circle-fill'}`} />
            <span>{toast.message}</span>
          </div>
        )}
      </main>
    </div>
  );
}
