import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import styles from './LandingPage.module.css';

const FEATURES = [
  {
    icon: '🔍',
    title: 'Find the Right Job',
    desc: 'Students can quickly search for internships that match their major and interests, with one-click resume submission.',
  },
  {
    icon: '🏢',
    title: 'Easy Recruitment',
    desc: "Companies post listings in minutes and manage every applicant's status through a clean, dedicated dashboard.",
  },
  {
    icon: '📊',
    title: 'Real-time Tracking',
    desc: 'Professors monitor student placement status, review weekly reports, and provide guidance — all in one place.',
  },
];

const STATS = [
  { num: '500+', label: 'Students in System' },
  { num: '150+', label: 'Partner Companies' },
  { num: '300+', label: 'Open Positions' },
];

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>
            Connect Your Future<br />with the Right Internship
          </h1>
          <p className={styles.heroSub}>
            An internship portal connecting students, companies, and professors
            seamlessly for the best experience.
          </p>
          <div className={styles.heroCtas}>
            <Link to="/login?role=student"   className={styles.btnDark}>For Students</Link>
            <Link to="/login?role=company"   className={styles.btnOutline}>For Companies</Link>
            <Link to="/login?role=professor" className={styles.btnOutline}>For Professors</Link>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionWrap}>
          <h2 className={styles.sectionTitle}>Why UniWork?</h2>
          <div className={styles.featureGrid}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────── */}
      <section className={styles.stats}>
        <div className={styles.statsGrid}>
          {STATS.map((s) => (
            <div key={s.label} className={styles.statItem}>
              <span className={styles.statNum}>{s.num}</span>
              <span className={styles.statLabel}>{s.label}</span>
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
