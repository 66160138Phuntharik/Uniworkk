import styles from './Sidebar.module.css';

/**
 * Sidebar – shared by all three dashboard types.
 *
 * Props:
 *   subtitle  {string}   – role label shown below "UniWork" ("Student" / "Company" / "Professor")
 *   navItems  {Array}    – [{ iconClass, label, badge?, active?, href? }]
 *   onLogout  {Function} – callback for the Sign Out button
 */
export default function Sidebar({ subtitle, navItems = [], onLogout }) {
  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <span className={styles.logoText}>UniWork</span>
        {subtitle && <span className={styles.logoSub}>{subtitle}</span>}
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
            <span className={styles.label}>{item.label}</span>
            {item.badge != null && (
              <span className={styles.badge}>{item.badge}</span>
            )}
          </a>
        ))}
      </nav>

      {/* Sign Out */}
      <div className={styles.footer}>
        <button className={styles.logoutBtn} onClick={onLogout}>
          <i className="bi bi-box-arrow-right" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
