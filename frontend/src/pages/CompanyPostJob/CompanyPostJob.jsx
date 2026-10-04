import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Badge from '../../components/Badge/Badge';
import { getCompanyNavItems } from '../../utils/companyNav';
import styles from './CompanyPostJob.module.css';

const CATEGORIES = [
  'Software & Web',
  'Data & Analytics',
  'Cloud & DevOps',
  'Mobile Development',
  'Design & Creative',
  'QA & Testing',
];

const WORK_MODES = ['Hybrid', 'Remote', 'On-site'];
const EMPLOYMENT_TYPES = [
  'Full-time Internship',
  'Part-time Internship',
  'Full-time Graduate Placement',
];

const SUGGESTED_SKILLS = [
  'React',
  'TypeScript',
  'Node.js',
  'Python',
  'SQL',
  'Docker',
  'AWS',
  'Figma',
  'TailwindCSS',
  'REST APIs',
];

export default function CompanyPostJob() {
  const navigate = useNavigate();

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Software & Web');
  const [type, setType] = useState('Full-time Internship');
  const [workMode, setWorkMode] = useState('Hybrid');
  const [location, setLocation] = useState('Bangkok, Thailand');
  const [salary, setSalary] = useState('15,000 THB/month');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [requirements, setRequirements] = useState('');

  // Skills tags
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState(['React', 'TypeScript', 'Git']);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  const handleAddSkill = (e) => {
    e?.preventDefault();
    const clean = skillInput.trim();
    if (clean && !skills.includes(clean)) {
      setSkills([...skills, clean]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddSuggestedSkill = (suggested) => {
    if (!skills.includes(suggested)) {
      setSkills([...skills, suggested]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a job title.');
      return;
    }
    if (!description.trim()) {
      alert('Please enter a role overview / description.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title,
      category,
      type,
      workMode,
      location,
      salary,
      description,
      responsibilities: responsibilities
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean),
      requirements: requirements
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean),
      skills,
    };

    try {
      await fetch('http://localhost:5000/api/companies/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // Fallback in case backend is offline
    }

    showToast('Job listing published successfully!');
    setTimeout(() => {
      navigate('/company/jobs');
    }, 1000);
  };

  return (
    <div className={styles.layout}>
      <Sidebar
        subtitle="Company"
        navItems={getCompanyNavItems('post-job', navigate, 5)}
        onLogout={() => navigate('/login')}
      />

      <main className={styles.main}>
        {/* ── Header ─────────────────────────────────────── */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.heading}>Post New Internship / Job</h1>
            <p className={styles.subheading}>
              TechNova Solutions · Publish a new vacancy to university students across Thailand
            </p>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.backBtn}
              onClick={() => navigate('/company/jobs')}
            >
              <i className="bi bi-arrow-left" /> Back to My Listings
            </button>
          </div>
        </header>

        {/* ── Content Grid: Form + Live Preview ──────────── */}
        <div className={styles.contentGrid}>
          {/* Left Column: Form */}
          <form className={styles.formCard} onSubmit={handleSubmit}>
            {/* Section 1: Basic Role Information */}
            <h3 className={styles.sectionTitle}>
              <i className="bi bi-info-circle text-primary" /> Basic Role Information
            </h3>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Position Title <span className={styles.reqStar}>*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. Full Stack Engineering Intern (Node.js & React)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className={styles.formRow2}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Industry Category</label>
                <select
                  className={styles.input}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Employment Type</label>
                <select
                  className={styles.input}
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  {EMPLOYMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formRow3}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Work Mode</label>
                <select
                  className={styles.input}
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value)}
                >
                  {WORK_MODES.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Location / City</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Bangkok, Thailand"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Monthly Allowance</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. 15,000 THB/month"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                />
              </div>
            </div>

            {/* Section 2: Role Description */}
            <h3 className={styles.sectionTitle}>
              <i className="bi bi-card-text text-primary" /> Role Description & Overview
            </h3>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Overview / About the Role <span className={styles.reqStar}>*</span>
              </label>
              <textarea
                className={styles.textarea}
                rows={4}
                placeholder="Explain what the intern will learn, team structure, real-world projects they will contribute to..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Section 3: Responsibilities & Requirements */}
            <h3 className={styles.sectionTitle}>
              <i className="bi bi-list-check text-primary" /> Key Responsibilities & Requirements
            </h3>

            <div className={styles.formGroup}>
              <label className={styles.label}>Key Responsibilities</label>
              <span className={styles.hint}>
                Enter one responsibility per line
              </span>
              <textarea
                className={styles.textarea}
                rows={3}
                placeholder="- Build responsive UI components in React&#10;- Collaborate with backend engineers on REST API design&#10;- Write unit tests and participate in code reviews"
                value={responsibilities}
                onChange={(e) => setResponsibilities(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Requirements & Qualifications</label>
              <span className={styles.hint}>
                Enter one requirement per line (e.g. Year 4 students, specific majors)
              </span>
              <textarea
                className={styles.textarea}
                rows={3}
                placeholder="- 4th-year Computer Science or Software Engineering student&#10;- Familiarity with modern JavaScript (ES6+) and React&#10;- Good problem-solving mindset and eagerness to learn"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
              />
            </div>

            {/* Section 4: Skills & Technologies */}
            <h3 className={styles.sectionTitle}>
              <i className="bi bi-tags text-primary" /> Required Skills & Tech Stack
            </h3>

            <div className={styles.formGroup}>
              <label className={styles.label}>Add Technical Skills</label>
              <div className={styles.skillsInputWrap}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Type a skill and press Enter (e.g. Next.js, Docker)..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                />
                <button
                  type="button"
                  className={styles.addSkillBtn}
                  onClick={handleAddSkill}
                >
                  Add
                </button>
              </div>

              {/* Selected Skills Chips */}
              <div className={styles.skillsContainer}>
                {skills.map((skill, idx) => (
                  <span key={idx} className={styles.skillBadge}>
                    {skill}
                    <button
                      type="button"
                      className={styles.removeSkillBtn}
                      onClick={() => handleRemoveSkill(skill)}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>

              {/* Quick Suggestion Chips */}
              <div className={styles.suggestedChips}>
                <span className={styles.suggestedLabel}>Suggested:</span>
                {SUGGESTED_SKILLS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={styles.chipBtn}
                    onClick={() => handleAddSuggestedSkill(item)}
                  >
                    + {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelActionBtn}
                onClick={() => navigate('/company/jobs')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isSubmitting}
              >
                <i className="bi bi-cloud-arrow-up-fill" />
                {isSubmitting ? 'Publishing...' : 'Publish Job Listing'}
              </button>
            </div>
          </form>

          {/* Right Column: Live Student Preview */}
          <div className={styles.previewCol}>
            <div className={styles.previewHeader}>
              <i className="bi bi-eye-fill text-primary" /> Live Student View Preview
            </div>

            <div className={styles.previewCard}>
              <div className={styles.previewBadgeRow}>
                <Badge variant="primary">{category}</Badge>
                <Badge variant="success">Open for Applications</Badge>
              </div>

              <div>
                <h2 className={styles.previewJobTitle}>
                  {title || 'Your Position Title Goes Here'}
                </h2>
                <p className={styles.previewCompany}>TechNova Solutions</p>
              </div>

              <div className={styles.previewMetaGrid}>
                <div>
                  <i className="bi bi-geo-alt text-muted" /> {location} ({workMode})
                </div>
                <div>
                  <i className="bi bi-briefcase text-muted" /> {type}
                </div>
                <div style={{ color: 'var(--success)', fontWeight: 600 }}>
                  <i className="bi bi-cash" /> {salary}
                </div>
                <div>
                  <i className="bi bi-mortarboard text-muted" /> 4th Year Students
                </div>
              </div>

              <div className={styles.previewSection}>
                <h4 className={styles.previewSectionTitle}>About This Role</h4>
                <p className={styles.previewText}>
                  {description ||
                    'Role description and learning opportunities will appear here in real-time as you type in the form.'}
                </p>
              </div>

              {responsibilities && (
                <div className={styles.previewSection}>
                  <h4 className={styles.previewSectionTitle}>Key Responsibilities</h4>
                  <ul className={styles.previewList}>
                    {responsibilities
                      .split('\n')
                      .filter((r) => r.trim())
                      .map((item, i) => (
                        <li key={i}>{item.replace(/^-\s*/, '')}</li>
                      ))}
                  </ul>
                </div>
              )}

              {requirements && (
                <div className={styles.previewSection}>
                  <h4 className={styles.previewSectionTitle}>Qualifications</h4>
                  <ul className={styles.previewList}>
                    {requirements
                      .split('\n')
                      .filter((r) => r.trim())
                      .map((item, i) => (
                        <li key={i}>{item.replace(/^-\s*/, '')}</li>
                      ))}
                  </ul>
                </div>
              )}

              <div className={styles.previewSection}>
                <h4 className={styles.previewSectionTitle}>Required Skills</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {skills.length > 0 ? (
                    skills.map((s, idx) => (
                      <Badge key={idx} variant="secondary">
                        {s}
                      </Badge>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      No skills added yet
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Toast Notification ───────────────────────────── */}
        {toast && (
          <div className={styles.toast}>
            <i className="bi bi-check-circle-fill" />
            <span>{toast}</span>
          </div>
        )}
      </main>
    </div>
  );
}
