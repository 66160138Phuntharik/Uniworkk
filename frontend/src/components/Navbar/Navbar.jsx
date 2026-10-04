import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';

/**
 * Navbar – used only on the Landing Page.
 * Floats transparently over the yellow hero section.
 */
export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.brand}>UniWork</Link>

        <div className={styles.links}>
          <a href="#features" className={styles.navLink}>Find Internships</a>
          <a href="#features" className={styles.navLink}>For Companies</a>
          <Link to="/login" className={styles.loginBtn}>Sign In</Link>
        </div>
      </div>
    </nav>
  );
}
