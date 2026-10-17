import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { useLanguage } from '../../context/LanguageContext';
import styles from './LandingPage.module.css';

const FEATURES = [
  {
    icon: '🔍',
    titleKey: 'feature1Title',
    descKey: 'feature1Desc',
  },
  {
    icon: '🏢',
    titleKey: 'feature2Title',
    descKey: 'feature2Desc',
  },
  {
    icon: '📊',
    titleKey: 'feature3Title',
    descKey: 'feature3Desc',
  },
];

const STATS = [
  { num: '500+', labelKey: 'statStudents' },
  { num: '150+', labelKey: 'statCompanies' },
  { num: '300+', labelKey: 'statPositions' },
];

export default function LandingPage() {
  const { t } = useLanguage();

  return (
    <div className={styles.page}>
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>
            {t('heroTitle1')}<br />{t('heroTitle2')}
          </h1>
          <p className={styles.heroSub}>
            {t('heroSub')}
          </p>
          <div className={styles.heroCtas}>
            <Link to="/login?role=student"   className={styles.btnDark}>{t('forStudents')}</Link>
            <Link to="/login?role=company"   className={styles.btnOutline}>{t('forCompanies')}</Link>
            <Link to="/login?role=professor" className={styles.btnOutline}>{t('forProfessors')}</Link>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionWrap}>
          <h2 className={styles.sectionTitle}>{t('whyUniwork')}</h2>
          <div className={styles.featureGrid}>
            {FEATURES.map((f) => (
              <div key={f.titleKey} className={styles.featureCard}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <h3 className={styles.featureTitle}>{t(f.titleKey)}</h3>
                <p className={styles.featureDesc}>{t(f.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────── */}
      <section className={styles.stats}>
        <div className={styles.statsGrid}>
          {STATS.map((s) => (
            <div key={s.labelKey} className={styles.statItem}>
              <span className={styles.statNum}>{s.num}</span>
              <span className={styles.statLabel}>{t(s.labelKey)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <p>&copy; 2026 UniWork – Internship Management System. All rights reserved.</p>
      </footer>
    </div>
  );
}

