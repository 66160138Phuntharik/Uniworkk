import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import styles from './Sidebar.module.css';

const LABEL_KEY_MAP = {
  'Dashboard': 'dashboard',
  'แดชบอร์ด': 'dashboard',
  'Find Internships': 'findInternships',
  'ค้นหาที่ฝึกงาน': 'findInternships',
  'Application Status': 'applicationStatus',
  'สถานะการสมัคร': 'applicationStatus',
  'Weekly Reports': 'weeklyReports',
  'รายงานประจำสัปดาห์': 'weeklyReports',
  'Profile & Resume': 'profileResume',
  'โปรไฟล์ & เอกสาร': 'profileResume',
  'My Job Listings': 'myJobListings',
  'ตำแหน่งงานของฉัน': 'myJobListings',
  'Applicants': 'applicants',
  'ผู้สมัครงาน': 'applicants',
  'Post New Job': 'postNewJob',
  'ลงประกาศงานใหม่': 'postNewJob',
  'Company Profile': 'companyProfile',
  'โปรไฟล์บริษัท': 'companyProfile',
  'Student List': 'studentList',
  'รายชื่อนิสิต': 'studentList',
  'Review Reports': 'reviewReports',
  'ตรวจรายงาน': 'reviewReports',
};

/**
 * Sidebar – shared by all three dashboard types.
 *
 * Props:
 *   subtitle  {string}   – role label shown below "UniWork" ("Student" / "Company" / "Professor")
 *   navItems  {Array}    – [{ iconClass, label, badge?, active?, href?, labelKey? }]
 *   onLogout  {Function} – callback for the Sign Out button
 */
export default function Sidebar({ subtitle, navItems = [], onLogout }) {
  const { t } = useLanguage();

  const translatedSubtitle = (() => {
    if (!subtitle) return '';
    const lower = subtitle.toLowerCase();
    if (lower.includes('student') || lower.includes('นิสิต')) return t('role_student');
    if (lower.includes('company') || lower.includes('สถานประกอบการ')) return t('role_company');
    if (lower.includes('professor') || lower.includes('อาจารย์')) return t('role_professor');
    return subtitle;
  })();

  const getLabel = (item) => {
    if (item.labelKey) return t(item.labelKey);
    if (LABEL_KEY_MAP[item.label]) return t(LABEL_KEY_MAP[item.label]);
    return item.label;
  };

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <span className={styles.logoText}>UniWork</span>
        {translatedSubtitle && <span className={styles.logoSub}>{translatedSubtitle}</span>}
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {navItems.map((item, idx) => (
          <a
            key={idx}
            href={item.href || '#'}
            className={`${styles.navItem} ${item.active ? styles.active : ''}`}
            onClick={(e) => {
              if (item.onClick) {
                e.preventDefault();
                item.onClick();
              }
            }}
          >
            <i className={`bi ${item.iconClass} ${styles.icon}`} />
            <span className={styles.label}>{getLabel(item)}</span>
            {item.badge != null && (
              <span className={styles.badge}>{item.badge}</span>
            )}
          </a>
        ))}
      </nav>

      {/* Footer / Switcher & Sign Out */}
      <div className={styles.footer}>
        <div className={styles.langWrapper}>
          <LanguageSwitcher theme="light" />
        </div>
        <button className={styles.logoutBtn} onClick={onLogout}>
          <i className="bi bi-box-arrow-right" />
          {t('signOut')}
        </button>
      </div>
    </aside>
  );
}

