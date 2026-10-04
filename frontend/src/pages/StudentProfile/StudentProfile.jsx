import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Badge from '../../components/Badge/Badge';
import styles from './StudentProfile.module.css';

const INITIAL_PROFILE = {
  studentId: 1,
  studentCode: '66160138',
  nameTh: 'ภูริทัต บุญส่ง',
  nameEn: 'Alex Johnson',
  faculty: 'Faculty of Informatics',
  department: 'Computer Science',
  year: '4th Year',
  gpa: 3.8,
  email: 'test001@go.buu.ac.th',
};

const INITIAL_DOCS = [
  {
    id: 1,
    studentId: 1,
    title: 'Alex Johnson - Software Engineer Resume (2026)',
    type: 'resume',
    fileName: 'Alex_Johnson_Resume_2026.pdf',
    fileSize: '1.2 MB',
    fileType: 'application/pdf',
    uploadDate: '2026-05-10',
    isPrimary: true,
    status: 'verified',
  },
  {
    id: 2,
    studentId: 1,
    title: 'Alex Johnson - Academic & Professional CV',
    type: 'cv',
    fileName: 'Alex_Johnson_CV_Academic.pdf',
    fileSize: '1.8 MB',
    fileType: 'application/pdf',
    uploadDate: '2026-05-02',
    isPrimary: false,
    status: 'verified',
  },
];

export default function StudentProfile() {
  const navigate = useNavigate();

  // State
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [documents, setDocuments] = useState(INITIAL_DOCS);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'documents'
  const [docFilter, setDocFilter] = useState('all'); // 'all' | 'resume' | 'cv'
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  // Upload Form state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState('resume'); // 'resume' | 'cv'
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadIsPrimary, setUploadIsPrimary] = useState(false);

  // Sidebar navigation items
  const navItems = [
    { iconClass: 'bi-grid-1x2-fill', label: 'Dashboard', onClick: () => navigate('/student/dashboard') },
    { iconClass: 'bi-search', label: 'Find Internships', onClick: () => navigate('/student/internships') },
    { iconClass: 'bi-briefcase', label: 'Application Status', badge: '3', onClick: () => navigate('/student/internships') },
    { iconClass: 'bi-journal-text', label: 'Weekly Reports', onClick: () => navigate('/student/reports') },
    { iconClass: 'bi-person-badge', label: 'Profile & Resume', active: true },
  ];

  // Try fetching real API data if backend is available
  useEffect(() => {
    fetch('http://localhost:5000/api/students/1/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.profile) {
          setProfile((prev) => ({ ...prev, ...data.profile }));
          if (data.documents && data.documents.length) {
            setDocuments(data.documents);
          }
        }
      })
      .catch(() => {
        // Fallback gracefully to preloaded mock state
      });
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Profile Form Field Handlers
  const handleFieldChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  // Save Profile Handler
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await fetch('http://localhost:5000/api/students/1/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
    } catch {
      // Offline fallback
    } finally {
      setTimeout(() => {
        setIsSaving(false);
        showToast('Academic and personal information saved successfully! ✅');
      }, 400);
    }
  };

  // Document Vault Handlers
  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadFileName.trim()) {
      showToast('Please provide both document title and file name.', 'info');
      return;
    }

    let updatedDocs = [...documents];
    if (uploadIsPrimary) {
      updatedDocs = updatedDocs.map((doc) => ({ ...doc, isPrimary: false }));
    }

    const newDoc = {
      id: Date.now(),
      studentId: 1,
      title: uploadTitle.trim(),
      type: uploadType,
      fileName: uploadFileName.trim(),
      fileSize: '1.4 MB',
      fileType: uploadFileName.endsWith('.pdf') ? 'application/pdf' : 'application/msword',
      uploadDate: new Date().toISOString().split('T')[0],
      isPrimary: uploadIsPrimary,
      status: 'verified',
    };

    setDocuments([newDoc, ...updatedDocs]);
    setShowUploadModal(false);
    setUploadTitle('');
    setUploadFileName('');
    setUploadIsPrimary(false);
    showToast(`"${newDoc.title}" uploaded to your vault! 📄`);
  };

  const handleSetPrimary = (docId) => {
    setDocuments((prev) =>
      prev.map((doc) => ({
        ...doc,
        isPrimary: doc.id === docId,
      }))
    );
    showToast('Primary document updated for 1-click applications! ⭐');
  };

  const handleDeleteDocument = (docId, title) => {
    if (window.confirm(`Are you sure you want to remove "${title}"?`)) {
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      showToast(`Removed "${title}" from your documents.`);
    }
  };

  const handleSimulatedDownload = (doc) => {
    showToast(`Downloading "${doc.fileName}"... 📥`, 'info');
  };

  // Filtered documents
  const filteredDocs = documents.filter((doc) => {
    if (docFilter === 'all') return true;
    return doc.type === docFilter;
  });

  return (
    <div className={styles.layout}>
      <Sidebar
        subtitle="Student"
        navItems={navItems}
        onLogout={() => navigate('/login')}
      />

      <main className={styles.main}>
        {/* ── Header ─────────────────────────────────────── */}
        <header className={styles.header}>
          <div className={styles.titleArea}>
            <h1 className={styles.pageTitle}>
              <i className="bi bi-person-badge-fill" style={{ color: 'var(--primary)' }} />
              Student Profile & Document Vault
            </h1>
            <p className={styles.pageSubtitle}>
              Manage your academic details and upload your Resume and CV for 4th-year internship placement.
            </p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.backBtn} onClick={() => navigate('/student/dashboard')}>
              <i className="bi bi-arrow-left" /> Back to Dashboard
            </button>
            <button className={styles.saveBtn} onClick={handleSaveProfile} disabled={isSaving}>
              <i className="bi bi-check2-circle" />
              {isSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </header>

        {/* ── Toast Alert ─────────────────────────────────── */}
        {toast && (
          <div className={`${styles.toast} ${toast.type === 'info' ? styles.toastInfo : styles.toastSuccess}`} role="alert">
            <span>{toast.message}</span>
            <button className={styles.modalCloseBtn} onClick={() => setToast(null)}>×</button>
          </div>
        )}

        {/* ── Profile Hero Card ───────────────────────────── */}
        <section className={styles.profileHero}>
          <div className={styles.heroLeft}>
            <div className={styles.avatarLarge}>
              {profile.nameEn ? profile.nameEn.charAt(0) : 'S'}
            </div>

            <div className={styles.heroMeta}>
              <div className={styles.heroNameRow}>
                <h2 className={styles.heroName}>{profile.nameEn}</h2>
                <span className={styles.studentCodeBadge}>ID: {profile.studentCode}</span>
                <Badge variant="success">Placed Student</Badge>
              </div>
              <div className={styles.heroSubtitle}>
                <span className={styles.heroSubItem}>
                  <i className="bi bi-mortarboard-fill" /> {profile.faculty} – {profile.department}
                </span>
                <span className={styles.heroSubItem}>
                  <i className="bi bi-star-fill" style={{ color: '#ffc107' }} /> GPA: {profile.gpa}
                </span>
                <span className={styles.heroSubItem}>
                  <i className="bi bi-envelope-fill" /> {profile.email}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.eligibilityBadge}>
            <i className="bi bi-mortarboard-fill" style={{ fontSize: '1.2rem' }} />
            <span>4th-Year Student (Internship Eligible)</span>
          </div>
        </section>

        {/* ── Navigation Tabs ─────────────────────────────── */}
        <nav className={styles.tabNav}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="bi bi-person-lines-fill" /> Academic & Personal Details
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'documents' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <i className="bi bi-file-earmark-person-fill" /> Resume & CV Vault
            <span className={styles.tabCount}>{documents.length}</span>
          </button>
        </nav>

        {/* ── TAB 1: Academic & Personal Details ─────────── */}
        {activeTab === 'overview' && (
          <div className={styles.singleCardWrap}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  <i className="bi bi-person-bounding-box" /> Student Academic Information
                </h3>
              </div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Full Name (English)</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={profile.nameEn}
                    onChange={(e) => handleFieldChange('nameEn', e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Full Name (Thai)</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={profile.nameTh}
                    onChange={(e) => handleFieldChange('nameTh', e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Student ID Code</label>
                  <input
                    type="text"
                    className={`${styles.input} ${styles.inputReadonly}`}
                    value={profile.studentCode}
                    disabled
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Cumulative GPA</label>
                  <input
                    type="number"
                    step="0.01"
                    className={styles.input}
                    value={profile.gpa}
                    onChange={(e) => handleFieldChange('gpa', parseFloat(e.target.value) || '')}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Faculty</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={profile.faculty}
                    onChange={(e) => handleFieldChange('faculty', e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Department / Major</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={profile.department}
                    onChange={(e) => handleFieldChange('department', e.target.value)}
                  />
                </div>
                <div className={`${styles.formGroup} ${styles.formFull}`}>
                  <label className={styles.label}>Academic Year & Eligibility Status</label>
                  <input
                    type="text"
                    className={`${styles.input} ${styles.inputReadonly}`}
                    value="4th Year – Eligible for Internship Program"
                    disabled
                  />
                </div>

                <div className={styles.eligibilityNotice}>
                  <i className="bi bi-info-circle-fill" style={{ fontSize: '1.1rem', color: '#fa8c16' }} />
                  <span>
                    <strong>Note:</strong> Internship programs in UniWork are exclusively available to <strong>4th-year students</strong> who have met academic prerequisite requirements.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: Resume & CV Vault ───────────────────── */}
        {activeTab === 'documents' && (
          <div className={styles.gridFull}>
            {/* Top Bar with Filter and Upload Button */}
            <div className={styles.vaultTopBar}>
              <div className={styles.vaultFilters}>
                <button
                  className={`${styles.filterPill} ${docFilter === 'all' ? styles.filterPillActive : ''}`}
                  onClick={() => setDocFilter('all')}
                >
                  All Files ({documents.length})
                </button>
                <button
                  className={`${styles.filterPill} ${docFilter === 'resume' ? styles.filterPillActive : ''}`}
                  onClick={() => setDocFilter('resume')}
                >
                  Resume ({documents.filter((d) => d.type === 'resume').length})
                </button>
                <button
                  className={`${styles.filterPill} ${docFilter === 'cv' ? styles.filterPillActive : ''}`}
                  onClick={() => setDocFilter('cv')}
                >
                  CV ({documents.filter((d) => d.type === 'cv').length})
                </button>
              </div>

              <button className={styles.uploadTriggerBtn} onClick={() => setShowUploadModal(true)}>
                <i className="bi bi-cloud-arrow-up-fill" /> Upload Resume / CV
              </button>
            </div>

            {/* Drag & Drop Trigger Box */}
            <div className={styles.dropzone} onClick={() => setShowUploadModal(true)}>
              <i className={`bi bi-file-earmark-arrow-up ${styles.dropzoneIcon}`} />
              <div className={styles.dropzoneTitle}>Upload Resume or CV</div>
              <div className={styles.dropzoneHint}>
                Supports PDF or DOCX (Max 10MB). Click here to upload your Resume or Curriculum Vitae.
              </div>
            </div>

            {/* Document Card Grid */}
            <div className={styles.docGrid}>
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className={`${styles.docCard} ${doc.isPrimary ? styles.docCardPrimary : ''}`}
                >
                  <div className={styles.docTop}>
                    <div
                      className={`${styles.fileIconWrap} ${
                        doc.type === 'cv' ? styles.fileIconDoc : ''
                      }`}
                    >
                      <i className={doc.type === 'cv' ? 'bi bi-file-earmark-text' : 'bi bi-file-earmark-person'} />
                    </div>
                    <div className={styles.docMeta}>
                      <h4 className={styles.docTitle}>{doc.title}</h4>
                      <div className={styles.docDetails}>
                        <span><i className="bi bi-file-earmark" /> {doc.fileName}</span>
                        <span>•</span>
                        <span>{doc.fileSize}</span>
                        <span>•</span>
                        <span>{doc.uploadDate}</span>
                      </div>
                      <div className={styles.docBadgeRow}>
                        {doc.isPrimary && (
                          <span className={styles.primaryBadge}>
                            <i className="bi bi-star-fill" /> Primary Document
                          </span>
                        )}
                        <span className={styles.typeBadge}>
                          {doc.type === 'cv' ? 'Curriculum Vitae (CV)' : 'Resume'}
                        </span>
                        <Badge variant="success">Verified</Badge>
                      </div>
                    </div>
                  </div>

                  <div className={styles.docActions}>
                    <div className={styles.actionLeft}>
                      <button
                        className={styles.docBtn}
                        onClick={() => setPreviewDoc(doc)}
                        title="Preview document"
                      >
                        <i className="bi bi-eye" /> Preview
                      </button>
                      <button
                        className={styles.docBtn}
                        onClick={() => handleSimulatedDownload(doc)}
                        title="Download file"
                      >
                        <i className="bi bi-download" /> Download
                      </button>
                      {!doc.isPrimary && (
                        <button
                          className={`${styles.docBtn} ${styles.docBtnPrimaryStar}`}
                          onClick={() => handleSetPrimary(doc.id)}
                          title="Set as primary document for applications"
                        >
                          <i className="bi bi-star" /> Set Primary
                        </button>
                      )}
                    </div>
                    <button
                      className={`${styles.docBtn} ${styles.docBtnDelete}`}
                      onClick={() => handleDeleteDocument(doc.id, doc.title)}
                      title="Delete document"
                    >
                      <i className="bi bi-trash" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MODAL 1: Upload Document ───────────────────── */}
        {showUploadModal && (
          <div className={styles.modalBackdrop} onClick={() => setShowUploadModal(false)}>
            <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Upload Resume or CV</h3>
                <button className={styles.modalCloseBtn} onClick={() => setShowUploadModal(false)}>×</button>
              </div>

              <form onSubmit={handleUploadSubmit}>
                <div className={styles.modalBody}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Document Type</label>
                    <select
                      className={styles.select}
                      value={uploadType}
                      onChange={(e) => setUploadType(e.target.value)}
                    >
                      <option value="resume">Resume</option>
                      <option value="cv">Curriculum Vitae (CV)</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Document Title</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="e.g. Alex Johnson - Frontend Resume (2026)"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>File Name / Attachment</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="e.g. Alex_Johnson_Resume.pdf"
                      value={uploadFileName}
                      onChange={(e) => setUploadFileName(e.target.value)}
                      required
                    />
                    <span className={styles.helpText}>Supported formats: .pdf, .docx</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <input
                      type="checkbox"
                      id="primaryCheckbox"
                      checked={uploadIsPrimary}
                      onChange={(e) => setUploadIsPrimary(e.target.checked)}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    <label htmlFor="primaryCheckbox" style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                      Set as Primary document for 1-click internship applications
                    </label>
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className={styles.backBtn}
                    onClick={() => setShowUploadModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.saveBtn}>
                    <i className="bi bi-cloud-arrow-up" /> Upload
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL 2: Document Preview ──────────────────── */}
        {previewDoc && (
          <div className={styles.modalBackdrop} onClick={() => setPreviewDoc(null)}>
            <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Document Preview</h3>
                <button className={styles.modalCloseBtn} onClick={() => setPreviewDoc(null)}>×</button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.previewViewer}>
                  <div style={{ fontSize: '3rem', color: '#dc2626' }}>
                    <i className={previewDoc.type === 'cv' ? 'bi bi-file-earmark-text' : 'bi bi-file-earmark-person'} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--dark)' }}>
                    {previewDoc.title}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    File: {previewDoc.fileName} • {previewDoc.fileSize}
                  </div>
                  <div style={{ marginTop: '12px', padding: '10px 16px', background: '#eef2ff', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: '#3730a3' }}>
                    <i className="bi bi-shield-check" /> Document verified and ready for internship applications.
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Uploaded Date</label>
                    <input type="text" className={`${styles.input} ${styles.inputReadonly}`} value={previewDoc.uploadDate} disabled />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Type</label>
                    <input
                      type="text"
                      className={`${styles.input} ${styles.inputReadonly}`}
                      value={previewDoc.type === 'cv' ? 'Curriculum Vitae (CV)' : 'Resume'}
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  className={styles.backBtn}
                  onClick={() => setPreviewDoc(null)}
                >
                  Close
                </button>
                <button
                  className={styles.saveBtn}
                  onClick={() => {
                    handleSimulatedDownload(previewDoc);
                    setPreviewDoc(null);
                  }}
                >
                  <i className="bi bi-download" /> Download File
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
