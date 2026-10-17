import { useLanguage } from '../../context/LanguageContext';
import styles from './LanguageSwitcher.module.css';

export default function LanguageSwitcher({ theme = 'dark', className = '' }) {
  const { language, setLanguage } = useLanguage();
  const isLight = theme === 'light';

  return (
    <div
      className={`${styles.switcher} ${isLight ? styles.lightSwitcher : ''} ${className}`}
      role="group"
      aria-label="Language Selector"
    >
      <button
        type="button"
        className={`${styles.optionBtn} ${isLight ? styles.lightOption : ''} ${
          language === 'th' ? (isLight ? styles.lightActive : styles.optionActive) : ''
        }`}
        onClick={() => setLanguage('th')}
        title="สลับเป็นภาษาไทย"
      >
        <span>TH</span>
      </button>

      <button
        type="button"
        className={`${styles.optionBtn} ${isLight ? styles.lightOption : ''} ${
          language === 'en' ? (isLight ? styles.lightActive : styles.optionActive) : ''
        }`}
        onClick={() => setLanguage('en')}
        title="Switch to English"
      >
        <span>EN</span>
      </button>
    </div>
  );
}
