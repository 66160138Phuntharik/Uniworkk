import styles from './Badge.module.css';

/**
 * Badge – small status pill.
 *
 * Props:
 *   variant  {'success' | 'warning' | 'danger' | 'secondary' | 'info'}
 *   children {React.ReactNode}
 */
export default function Badge({ variant = 'secondary', children }) {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>
      {children}
    </span>
  );
}
