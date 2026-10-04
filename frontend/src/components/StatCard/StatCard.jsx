import styles from './StatCard.module.css';

/**
 * StatCard – dashboard summary metric card.
 *
 * Props:
 *   label   {string}                         – card label (uppercase)
 *   value   {string | number}                – primary metric
 *   unit    {string}                         – small text after value
 *   accent  {'success' | 'warning' | 'danger' | undefined}
 */
export default function StatCard({ label, value, unit, accent }) {
  return (
    <div className={`${styles.card} ${accent ? styles[`card_${accent}`] : ''}`}>
      <div className={styles.label}>{label}</div>
      <div className={`${styles.value} ${accent ? styles[`val_${accent}`] : ''}`}>
        {value}
        {unit && <span className={styles.unit}> {unit}</span>}
      </div>
    </div>
  );
}
