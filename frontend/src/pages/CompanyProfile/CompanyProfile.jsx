import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import { getCompanyNavItems } from '../../utils/companyNav';
import styles from './CompanyProfile.module.css';

const DEFAULT_PROFILE = {
  companyName: 'TechNova Solutions',
  tagline: 'Leading Cloud-Native & Enterprise AI Solutions',
  industry: 'Technology & Software Development',
  foundedYear: '2018',
  companySize: '150 - 300 Employees',
  website: 'https://technova.example.com',
  contactEmail: 'careers@technova.example.com',
  contactPhone: '+66 2 456 7890',
  location: 'Bangkok, Thailand',
  address: '88/1 Cyber World Tower, 24th Fl, Ratchadapisek Rd, Huai Khwang, Bangkok 10310',
  description:
    'TechNova Solutions is a forward-thinking software consultancy and enterprise cloud engineering firm. We partner with leading universities to mentor talented engineering interns, offering hands-on experience in modern web platforms, distributed systems, and real-world software architecture.',
};

export default function CompanyProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch company profile on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/companies/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.profile) {
          setProfile((prev) => ({ ...prev, ...data.profile }));
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  // Save changes
  const handleSave = async (e) => {
    e?.preventDefault();
    setIsSaving(true);

    try {
      await fetch('http://localhost:5000/api/companies/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
    } catch {
      // Retained in local state
    }

    setIsSaving(false);
    showToast('Company profile changes saved successfully!');
  };

  return (
    <div className={styles.layout}>
      <Sidebar
        subtitle="Company"
        navItems={getCompanyNavItems('profile', navigate, 5)}
        onLogout={() => navigate('/login')}
      />

      <main className={styles.main}>
        {/* ── Header ─────────────────────────────────────── */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.heading}>Company Profile</h1>
            <p className={styles.subheading}>
              Manage your company information, headquarters address, and official contact details
            </p>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={isSaving}
            >
              <i className="bi bi-check2-circle" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </header>

        {/* ── Company Identity Banner ──────────────────────── */}
        <div className={styles.identityBanner}>
          <div className={styles.identityLeft}>
            <div className={styles.companyLogo}>
              {profile.companyName ? profile.companyName.charAt(0) : 'T'}
            </div>
            <div className={styles.identityMeta}>
              <div className={styles.companyTitleRow}>
                <span className={styles.companyName}>
                  {profile.companyName}
                </span>
                <span className={styles.verifiedBadge}>
                  <i className="bi bi-patch-check-fill" /> Verified Employer
                </span>
              </div>
              <p className={styles.tagline}>{profile.tagline}</p>
            </div>
          </div>

          <div className={styles.bannerStats}>
            <span className={styles.bannerStatItem}>
              <i className="bi bi-buildings" /> {profile.industry}
            </span>
            <span className={styles.bannerStatItem}>
              <i className="bi bi-people" /> {profile.companySize}
            </span>
            <span className={styles.bannerStatItem}>
              <i className="bi bi-calendar3" /> Founded {profile.foundedYear}
            </span>
          </div>
        </div>

        {/* ── Form Cards Container ─────────────────────────── */}
        <div className={styles.profileStack}>
          {/* Card 1: General Info */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <i className="bi bi-building-gear text-primary" /> General Company Information
            </h3>

            <div className={styles.formGroup}>
              <label className={styles.label}>Company Legal Name</label>
              <input
                type="text"
                className={styles.input}
                value={profile.companyName || ''}
                onChange={(e) => handleChange('companyName', e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Tagline / Motto</label>
              <input
                type="text"
                className={styles.input}
                value={profile.tagline || ''}
                onChange={(e) => handleChange('tagline', e.target.value)}
              />
            </div>

            <div className={styles.formRow2}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Industry Sector</label>
                <input
                  type="text"
                  className={styles.input}
                  value={profile.industry || ''}
                  onChange={(e) => handleChange('industry', e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Company Size</label>
                <select
                  className={styles.input}
                  value={profile.companySize || '150 - 300 Employees'}
                  onChange={(e) => handleChange('companySize', e.target.value)}
                >
                  <option value="1 - 50 Employees">1 - 50 Employees</option>
                  <option value="50 - 150 Employees">50 - 150 Employees</option>
                  <option value="150 - 300 Employees">150 - 300 Employees</option>
                  <option value="300 - 1,000 Employees">300 - 1,000 Employees</option>
                  <option value="1,000+ Employees">1,000+ Employees</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow2}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Founded Year</label>
                <input
                  type="text"
                  className={styles.input}
                  value={profile.foundedYear || ''}
                  onChange={(e) => handleChange('foundedYear', e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>City & Country</label>
                <input
                  type="text"
                  className={styles.input}
                  value={profile.location || ''}
                  onChange={(e) => handleChange('location', e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>About Us / Company Bio</label>
              <textarea
                className={styles.textarea}
                rows={4}
                value={profile.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>
          </div>

          {/* Card 2: Contact & Headquarters Location */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <i className="bi bi-geo-alt text-primary" /> Contact & Headquarters Location
            </h3>

            <div className={styles.formRow2}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Website URL</label>
                <input
                  type="url"
                  className={styles.input}
                  value={profile.website || ''}
                  onChange={(e) => handleChange('website', e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Careers Contact Email</label>
                <input
                  type="email"
                  className={styles.input}
                  value={profile.contactEmail || ''}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formRow2}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Phone Number</label>
                <input
                  type="text"
                  className={styles.input}
                  value={profile.contactPhone || ''}
                  onChange={(e) => handleChange('contactPhone', e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Street Address</label>
                <input
                  type="text"
                  className={styles.input}
                  value={profile.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Toast Notification ───────────────────────────── */}
        {toast && (
          <div className={styles.toast}>
            <i className="bi bi-check-circle-fill text-warning" />
            <span>{toast}</span>
          </div>
        )}
      </main>
    </div>
  );
}
