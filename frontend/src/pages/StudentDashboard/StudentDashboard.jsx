import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import Sidebar from '../../components/Sidebar/Sidebar';
import StatCard from '../../components/StatCard/StatCard';
import Badge from '../../components/Badge/Badge';
import styles from './StudentDashboard.module.css';

export default function StudentDashboard() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();


  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('uniwork_user') || 'null');
    } catch {
      return null;
    }
  })();

  const studentId = currentUser?.id || 1;

  const [profile, setProfile] = useState({
    nameEn: currentUser?.name || 'Student',
    nameTh: currentUser?.name || 'นิสิต',
    department: currentUser?.major || currentUser?.department || 'Computer Science',
    faculty: currentUser?.faculty || 'Faculty of Informatics',
    status: 'searching',
    company: '',
    position: '',
  });

  const [applications, setApplications] = useState([]);
  const [reportsCount, setReportsCount] = useState(0);

  // Fetch live student profile and stats
  useEffect(() => {
    const token = localStorage.getItem('uniwork_token');
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    fetch(`http://localhost:5000/api/students/${studentId}/profile`, { headers: authHeaders })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.profile) {
          setProfile((prev) => ({ ...prev, ...data.profile }));
        }
      })
      .catch(() => {});

    fetch(`http://localhost:5000/api/students/${studentId}/applications`, { headers: authHeaders })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.applications) {
          setApplications(data.applications);
        }
      })
      .catch(() => {});

    fetch(`http://localhost:5000/api/students/${studentId}/reports`, { headers: authHeaders })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.reports) {
          setReportsCount(data.reports.length);
        }
      })
      .catch(() => {});
  }, [studentId]);

  const studentName = profile.nameEn || profile.nameTh || currentUser?.name || 'Student';
  const firstName = studentName.split(' ')[0] || studentName;
  const avatarLetter = studentName.charAt(0).toUpperCase() || 'S';

  const interviewsCount = applications.filter((a) => a.status === 'interviewing').length;

  const handleLogout = () => {
    localStorage.removeItem('uniwork_user');
    localStorage.removeItem('uniwork_token');
    navigate('/login');
  };

  const navItems = [
    { iconClass: 'bi-grid-1x2-fill', label: 'Dashboard', active: true },
    { iconClass: 'bi-search', label: 'Find Internships', onClick: () => navigate('/student/internships') },
    { iconClass: 'bi-briefcase', label: 'Application Status', badge: applications.length > 0 ? String(applications.length) : undefined, onClick: () => navigate('/student/internships') },
    { iconClass: 'bi-journal-text', label: 'Weekly Reports', onClick: () => navigate('/student/reports') },
    { iconClass: 'bi-person-badge', label: 'Profile & Resume', onClick: () => navigate('/student/profile') },
  ];

  // Calculate days remaining until Sunday cut-off
  const getSundayCutoffInfo = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
    const daysLeft = (7 - dayOfWeek) % 7;

    if (daysLeft === 0) {
      return {
        days: 0,
        text: t('cutoffToday'),
        badgeClass: styles.cutoffUrgent,
        icon: 'bi-exclamation-triangle-fill',
      };
    } else if (daysLeft === 1) {
      return {
        days: 1,
        text: t('cutoffTomorrow'),
        badgeClass: styles.cutoffWarning,
        icon: 'bi-alarm-fill',
      };
    } else {
      return {
        days: daysLeft,
        text: t('cutoffDaysLeft').replace('{days}', daysLeft),
        badgeClass: styles.cutoffNormal,
        icon: 'bi-calendar-check-fill',
      };
    }
  };

  const getStatusBadge = (status) => {
    const key = `status_${status}`;
    const label = t(key) || status;
    const variantMap = {
      accepted: 'success',
      interviewing: 'warning',
      reviewing: 'secondary',
      rejected: 'danger',
    };
    return { label, variant: variantMap[status] || 'secondary' };
  };

  const cutoffInfo = getSundayCutoffInfo();
  const nextReportWeek = reportsCount + 1 <= 16 ? reportsCount + 1 : 16;
  const progressPercent = Math.min(100, Math.round((reportsCount / 16) * 100));

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
          <h1 className={styles.greeting}>{t('welcomeGreeting')}, {firstName}! 👋</h1>
          <div
            className={styles.userChip}
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/student/profile')}
            title="Go to My Profile"
          >
            <div className={styles.userInfo}>
              <span className={styles.userName}>{studentName}</span>
              <span className={styles.userMajor}>{profile.department || 'Computer Science'}</span>
            </div>
            <div className={styles.avatar}>{avatarLetter}</div>
          </div>
        </header>

        {/* ── Placement Alert ─────────────────────────────── */}
        {profile.status === 'placed' && profile.company && (
          <div className={styles.alertSuccess} role="alert">
            <div>
              <div className={styles.alertTitle}>🎉 {language === 'th' ? 'ยินดีด้วย! คุณได้รับคัดเลือกเข้าฝึกงานแล้ว' : "Congratulations! You've been placed!"}</div>
              <div className={styles.alertText}>
                {profile.company} {language === 'th' ? 'ได้ตอบรับคุณเข้าฝึกงานตำแหน่ง' : 'has accepted you as a'}{' '}
                <strong>{profile.position || 'Frontend Developer Intern'}</strong>
              </div>
            </div>
            <button className={styles.alertBtn} onClick={() => navigate('/student/profile')}>
              {t('details')}
            </button>
          </div>
        )}

        {/* ── Stats ───────────────────────────────────────── */}
        <div className={styles.statsRow}>
          <StatCard label={t('applicationsSent')} value={String(applications.length)} unit={language === 'th' ? 'แห่ง' : 'companies'} />
          <StatCard label={t('interviewsScheduled')} value={String(interviewsCount)} unit={language === 'th' ? 'แห่ง' : 'companies'} accent={interviewsCount > 0 ? 'warning' : ''} />
          
          {/* Enhanced Reports Submitted with Sunday Cut-off Reminder */}
          <div className={styles.reportCardStat}>
            <div>
              <div className={styles.reportCardStatHeader}>
                <span className={styles.reportStatLabel}>{t('reportsSubmitted')}</span>
                {reportsCount < 16 && (
                  <button
                    type="button"
                    className={styles.writeReportBtn}
                    onClick={() => navigate('/student/reports?new=true')}
                    title="Write next weekly report"
                  >
                    <i className="bi bi-pencil-square" />
                    {language === 'th' ? `เขียนสัปดาห์ที่ ${nextReportWeek}` : `Write Week ${nextReportWeek}`}
                  </button>
                )}
              </div>

              <div className={styles.reportStatValue}>
                <span>{reportsCount} / 16</span>
                <span className={styles.reportStatUnit}>{language === 'th' ? `สัปดาห์ (${progressPercent}%)` : `weeks (${progressPercent}%)`}</span>
              </div>

              <div className={styles.reportProgressBarBg}>
                <div
                  className={styles.reportProgressBarFill}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Reminder & Sunday cut-off countdown */}
            <div className={styles.reportReminderBox}>
              <div className={styles.reportReminderLeft}>
                <i className="bi bi-clock-history" style={{ color: 'var(--primary)', fontSize: '0.9rem' }} />
                <span>
                  {t('nextDue')}: <span className={styles.reportReminderWeek}>{language === 'th' ? `สัปดาห์ที่ ${nextReportWeek}` : `Week ${nextReportWeek}`}</span>
                </span>
              </div>
              <span className={`${styles.reportCutoffBadge} ${cutoffInfo.badgeClass}`}>
                <i className={`bi ${cutoffInfo.icon}`} />
                {cutoffInfo.text}
              </span>
            </div>
          </div>
        </div>

        {/* ── Content Grid ────────────────────────────────── */}
        <div className={styles.contentGrid}>
          {/* Application History */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>{t('recentApplications')}</h2>
            {applications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
                <i className="bi bi-inbox" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '10px', color: '#cbd5e1' }} />
                <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--dark)', marginBottom: '4px' }}>{t('noApplications')}</p>
                <p style={{ fontSize: '0.88rem', marginBottom: '16px' }}>{language === 'th' ? 'ค้นหาตำแหน่งฝึกงานจากบริษัทพันธมิตรและส่งใบสมัครแรกของคุณ' : 'Explore open positions from partner companies and submit your first application.'}</p>
                <button
                  type="button"
                  style={{
                    background: 'var(--dark)',
                    color: 'var(--white)',
                    border: 'none',
                    padding: '9px 18px',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                  }}
                  onClick={() => navigate('/student/internships')}
                >
                  {t('findInternshipsNow')}
                </button>
              </div>
            ) : (
              <>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>{language === 'th' ? 'บริษัท' : 'Company'}</th>
                        <th>{language === 'th' ? 'ตำแหน่ง' : 'Position'}</th>
                        <th>{language === 'th' ? 'วันที่สมัคร' : 'Date Applied'}</th>
                        <th>{language === 'th' ? 'สถานะ' : 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.slice(0, 5).map((app, i) => {
                        const statusBadge = getStatusBadge(app.status);
                        return (
                          <tr key={app.id || i}>
                            <td className={styles.tdCompany}>{app.company}</td>
                            <td>{app.position}</td>
                            <td className={styles.tdDate}>{app.date}</td>
                            <td>
                              <Badge variant={statusBadge.variant}>
                                {statusBadge.label}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  className={styles.viewAll}
                  style={{ cursor: 'pointer', background: 'none', border: 'none', width: '100%' }}
                  onClick={() => navigate('/student/internships')}
                >
                  {t('viewAll')} →
                </button>
              </>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
