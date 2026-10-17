import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import styles from './Navbar.module.css';

/**
 * Navbar – used only on the Landing Page.
 * Floats transparently over the yellow hero section.
 */
export default function Navbar() {
  const { t } = useLanguage();

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.brand}>UniWork</Link>

        <div className={styles.links}>
          <a href="#features" className={styles.navLink}>{t('findInternships')}</a>
          <a href="#features" className={styles.navLink}>{t('forCompanies')}</a>
          <LanguageSwitcher theme="light" />
          <Link to="/login" className={styles.loginBtn}>{t('signIn')}</Link>
        </div>
      </div>
    </nav>
  );
}

