import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Badge from '../../components/Badge/Badge';
import styles from './StudentProfile.module.css';

export default function StudentProfile() {
  const navigate = useNavigate();

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('uniwork_user') || 'null');
    } catch {
      return null;
    }
  })();
  const studentId = currentUser?.id || 1;

  // State
  const [profile, setProfile] = useState(() => {
    return {
      studentId: currentUser?.id || 1,
      studentCode: currentUser?.studentCode || '',
      nameTh: currentUser?.name || '',
      nameEn: currentUser?.name || '',
      faculty: currentUser?.faculty || 'Faculty of Informatics',
      department: currentUser?.major || currentUser?.department || 'Computer Science',
      year: '4th Year',
      gpa: 3.5,
      email: currentUser?.email || '',
    };
  });
  const [documents, setDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'documents'
  const [docFilter, setDocFilter] = useState('all'); // 'all' | 'resume' | 'cv'
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState('resume'); // 'resume' | 'cv'
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Sidebar navigation items
  const navItems = [
    { iconClass: 'bi-grid-1x2-fill', label: 'Dashboard', onClick: () => navigate('/student/dashboard') },
    { iconClass: 'bi-search', label: 'Find Internships', onClick: () => navigate('/student/internships') },
    { iconClass: 'bi-briefcase', label: 'Application Status', onClick: () => navigate('/student/internships') },
    { iconClass: 'bi-journal-text', label: 'Weekly Reports', onClick: () => navigate('/student/reports') },
    { iconClass: 'bi-person-badge', label: 'Profile & Resume', active: true },
  ];

  // Try fetching real API data if backend is available
  useEffect(() => {
    fetch(`http://localhost:5000/api/students/${studentId}/profile`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.profile) {
          setProfile((prev) => ({ ...prev, ...data.profile }));
          if (data.documents) {
            setDocuments(data.documents);
          }
        }
      })
      .catch(() => {
        // Fallback gracefully
      });
  }, [studentId]);

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
      const res = await fetch(`http://localhost:5000/api/students/${studentId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.profile) {
          setProfile((prev) => ({ ...prev, ...data.profile }));
          if (currentUser) {
            localStorage.setItem('uniwork_user', JSON.stringify({
              ...currentUser,
              name: data.profile.nameEn || data.profile.nameTh || currentUser.name,
              major: data.profile.department || currentUser.major,
            }));
          }
        }
      }
    } catch {
      // Offline fallback
    } finally {
      setTimeout(() => {
        setIsSaving(false);
        showToast('Academic information saved successfully! ✅');
      }, 400);
    }
  };

  // Handle file selection from disk
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      if (!uploadTitle.trim()) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '');
        setUploadTitle(cleanName);
      }
    }
  };

  // Real Document Upload Handler
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      showToast('Please select a PDF or Word document file (.pdf, .doc, .docx).', 'danger');
      return;
    }

    setIsUploading(true);
    const token = localStorage.getItem('uniwork_token');
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('title', uploadTitle.trim() || uploadFile.name);
    formData.append('type', uploadType);

    try {
      const res = await fetch(`http://localhost:5000/api/students/${studentId}/documents`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload document');
      }

      showToast(`"${data.document.title}" uploaded to your Document Vault! 📄`, 'success');
      setShowUploadModal(false);
      setUploadTitle('');
      setUploadFile(null);

      // Refresh documents
      const docsRes = await fetch(`http://localhost:5000/api/students/${studentId}/documents`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (docsRes.ok) {
        const docsData = await docsRes.json();
        if (docsData && docsData.documents) {
          setDocuments(docsData.documents);
        }
      }
    } catch (err) {
      showToast(err.message || 'Upload failed. Please try again.', 'danger');
    } finally {
      setIsUploading(false);
    }
  };


  const handleDeleteDocument = async (docId, title) => {
    if (window.confirm(`Are you sure you want to remove "${title}"?`)) {
      const token = localStorage.getItem('uniwork_token');
      try {
        const res = await fetch(`http://localhost:5000/api/students/${studentId}/documents/${docId}`, {
          method: 'DELETE',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (res.ok) {
          setDocuments((prev) => prev.filter((d) => d.id !== docId));
          showToast(`Removed "${title}".`);
        } else {
          throw new Error('Failed to delete document');
        }
      } catch (err) {
        showToast(err.message || 'Failed to delete document', 'danger');
      }
    }
  };

  const handleDownloadDocument = (doc) => {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, '_blank');
    } else {
      showToast(`Opening "${doc.fileName}"... 📥`, 'info');
    }
  };

  // Filtered documents
  const filteredDocs = documents.filter((doc) => {
    if (docFilter === 'all') return true;
    return doc.type === docFilter;
  });

  const handleLogout = () => {
    localStorage.removeItem('uniwork_user');
    localStorage.removeItem('uniwork_token');
    navigate('/login');
  };

  return (
    <div className={styles.layout}>
      <Sidebar
        subtitle="Student"
        navItems={navItems}
        onLogout={handleLogout}
      />

      <main className={styles.main}>
        {/* ── Header ─────────────────────────────────────── */}
        <header className={styles.header}>
          <div className={styles.titleArea}>
            <h1 className={styles.pageTitle}>Student Profile & Resume</h1>
            <p className={styles.pageSubtitle}>
              Manage your academic details and resume documents for internship applications.
            </p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.backBtn} onClick={() => navigate('/student/dashboard')}>
              <i className="bi bi-arrow-left" /> Back to Dashboard
            </button>
            {activeTab === 'overview' && (
              <button className={styles.saveBtn} onClick={handleSaveProfile} disabled={isSaving}>
                <i className="bi bi-check2-circle" />
                {isSaving ? 'Saving…' : 'Save Changes'}
              </button>
            )}
          </div>
        </header>

        {/* ── Toast Alert ─────────────────────────────────── */}
        {toast && (
          <div className={`${styles.toast} ${toast.type === 'info' ? styles.toastInfo : styles.toastSuccess}`} role="alert">
            <span>{toast.message}</span>
            <button className={styles.toastCloseBtn} onClick={() => setToast(null)}>×</button>
          </div>
        )}

        {/* ── Simplified Student Name Bar ─────────────────── */}
        <section className={styles.profileHero}>
          <div className={styles.heroLeft}>
            <div className={styles.avatar}>
              {profile.nameEn ? profile.nameEn.charAt(0) : 'S'}
            </div>

            <div className={styles.heroMeta}>
              <div className={styles.heroNameRow}>
                <h2 className={styles.heroName}>{profile.nameEn}</h2>
                {profile.nameTh && (
                  <span className={styles.heroNameTh}>({profile.nameTh})</span>
                )}
              </div>
              <div className={styles.heroMetaDetails}>
                <span className={styles.studentIdText}>ID: {profile.studentCode}</span>
                <span className={styles.metaDivider}>•</span>
                <span>{profile.department}</span>
                <span className={styles.metaDivider}>•</span>
                <span>{profile.faculty}</span>
              </div>
            </div>
          </div>

          <div className={styles.heroRight}>
            <Badge variant="success">Placed Student</Badge>
          </div>
        </section>

        {/* ── Navigation Tabs ─────────────────────────────── */}
        <nav className={styles.tabNav}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="bi bi-person-lines-fill" /> Profile Information
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'documents' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <i className="bi bi-file-earmark-person-fill" /> Resume & Documents
            <span className={styles.tabCount}>{documents.length}</span>
          </button>
        </nav>

        {/* ── TAB 1: Profile Information ──────────────────── */}
        {activeTab === 'overview' && (
          <div className={styles.singleCardWrap}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>Academic Information</h3>
                  <p className={styles.cardSubtitle}>Review and update your university details</p>
                </div>
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
                  <i className="bi bi-info-circle-fill" />
                  <span>
                    <strong>Eligibility:</strong> Internship programs in UniWork are for <strong>4th-year students</strong> who meet academic prerequisites.
                  </span>
                </div>
              </div>

              <div className={styles.formFooter}>
                <span className={styles.formFooterInfo}>
                  Changes will be reflected in your internship applications.
                </span>
                <button
                  className={styles.saveBtn}
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                >
                  <i className="bi bi-check2-circle" />
                  {isSaving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: Resume & Documents ───────────────────── */}
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
                  Resumes ({documents.filter((d) => d.type === 'resume').length})
                </button>
                <button
                  className={`${styles.filterPill} ${docFilter === 'cv' ? styles.filterPillActive : ''}`}
                  onClick={() => setDocFilter('cv')}
                >
                  CVs ({documents.filter((d) => d.type === 'cv').length})
                </button>
              </div>

              <button className={styles.uploadTriggerBtn} onClick={() => setShowUploadModal(true)}>
                <i className="bi bi-cloud-arrow-up-fill" /> Upload Document
              </button>
            </div>

            {/* Clean Upload Trigger Banner */}
            <div className={styles.dropzone} onClick={() => setShowUploadModal(true)}>
              <div className={styles.dropzoneLeft}>
                <div className={styles.dropzoneIconWrap}>
                  <i className={`bi bi-cloud-arrow-up-fill ${styles.dropzoneIcon}`} />
                </div>
                <div>
                  <div className={styles.dropzoneTitle}>Upload a new Resume or CV</div>
                  <div className={styles.dropzoneHint}>
                    Supported formats: PDF or DOCX (up to 10MB)
                  </div>
                </div>
              </div>
              <button type="button" className={styles.dropzoneBtn}>
                Select File
              </button>
            </div>

            {/* Document Card Grid */}
            {filteredDocs.length > 0 ? (
              <div className={styles.docGrid}>
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className={styles.docCard}
                  >
                    <div className={styles.docTop}>
                      <div
                        className={`${styles.fileIconWrap} ${
                          doc.type === 'cv' ? styles.fileIconDoc : ''
                        }`}
                      >
                        <i className={doc.type === 'cv' ? 'bi bi-file-earmark-text' : 'bi bi-file-earmark-pdf'} />
                      </div>
                      <div className={styles.docMeta}>
                        <div className={styles.docTitleRow}>
                          <h4 className={styles.docTitle}>{doc.title}</h4>
                        </div>
                        <div className={styles.docDetails}>
                          <span>{doc.fileName}</span>
                          <span className={styles.dotSeparator}>•</span>
                          <span>{doc.fileSize}</span>
                          <span className={styles.dotSeparator}>•</span>
                          <span>{doc.uploadDate}</span>
                        </div>
                        <div className={styles.docBadgeRow}>
                          <span className={styles.typeBadge}>
                            {doc.type === 'cv' ? 'CV' : 'Resume'}
                          </span>
                          <Badge variant="success">Verified</Badge>
                        </div>
                      </div>
                    </div>

                    <div className={styles.docActions}>
                      <div className={styles.actionLeft}>
                        <button
                          className={styles.docBtn}
                          onClick={() => handleDownloadDocument(doc)}
                          title="Download / View file"
                        >
                          <i className="bi bi-download" /> Download
                        </button>
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
            ) : documents.length === 0 ? (
              <div className={styles.emptyState}>
                <i className="bi bi-folder2-open" style={{ fontSize: '2.5rem', color: 'var(--text-muted)' }} />
                <p className={styles.emptyStateText}>No documents uploaded yet in your Document Vault.</p>
                <button
                  type="button"
                  className={styles.saveBtn}
                  style={{ marginTop: '12px' }}
                  onClick={() => setShowUploadModal(true)}
                >
                  <i className="bi bi-cloud-arrow-up-fill" style={{ marginRight: '6px' }} />
                  Upload First Resume
                </button>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <i className="bi bi-folder2-open" style={{ fontSize: '2.5rem', color: 'var(--text-muted)' }} />
                <p className={styles.emptyStateText}>No documents found matching this filter.</p>
                <button className={styles.backBtn} onClick={() => setDocFilter('all')}>
                  Show All Documents
                </button>
              </div>
            )}
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
                    <label className={styles.label}>Select Document File (.pdf, .docx, .doc)</label>
                    <div className={styles.fileDropArea}>
                      <input
                        type="file"
                        id="documentFileInput"
                        accept=".pdf,.doc,.docx"
                        className={styles.fileInputHidden}
                        onChange={handleFileChange}
                      />
                      <label htmlFor="documentFileInput" className={styles.fileDropLabel}>
                        <i className={`bi bi-cloud-arrow-up ${styles.uploadCloudIcon}`} />
                        {uploadFile ? (
                          <div className={styles.selectedFileInfo}>
                            <i className="bi bi-file-earmark-check" />
                            <span className={styles.selectedFileName}>{uploadFile.name}</span>
                            <span className={styles.selectedFileSize}>
                              ({(uploadFile.size / (1024 * 1024) >= 1)
                                ? `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB`
                                : `${Math.round(uploadFile.size / 1024)} KB`})
                            </span>
                          </div>
                        ) : (
                          <>
                            <span className={styles.fileDropText}>Click to select file from your computer</span>
                            <span className={styles.helpText}>Supports PDF, DOC, DOCX up to 10MB</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                </div>

                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className={styles.backBtn}
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadFile(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.saveBtn} disabled={isUploading}>
                    <i className="bi bi-cloud-arrow-up" /> {isUploading ? 'Uploading…' : 'Upload Document'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
