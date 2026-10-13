import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import StatCard from '../../components/StatCard/StatCard';
import Badge from '../../components/Badge/Badge';
import { getProfessorNavItems } from '../../utils/professorNav';
import styles from './ProfessorStudentList.module.css';

const STATUS_MAP = {
  placed: { label: 'Placed / Interning', variant: 'success' },
  interviewing: { label: 'Interviewing', variant: 'warning' },
  searching: { label: 'Searching / Pending', variant: 'danger' },
};

export default function ProfessorStudentList() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    placed: 0,
    interviewing: 0,
    searching: 0,
  });
  const [pendingReportCount, setPendingReportCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Fetch student list & reports count from backend
  useEffect(() => {
    fetch('http://localhost:5000/api/professors/students')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.students)) {
          setStudents(data.students);
          if (data.stats) setStats(data.stats);
        }
      })
      .catch((err) => {
        console.warn('Could not connect to backend:', err);
      });

    fetch('http://localhost:5000/api/professors/reports')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.pendingCount !== undefined) {
          setPendingReportCount(data.pendingCount);
        }
      })
      .catch(() => {});
  }, []);

  // Filter students based on search query and status pill
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesStatus =
        statusFilter === 'all' || s.status.toLowerCase() === statusFilter.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        (s.studentCode && s.studentCode.toLowerCase().includes(q)) ||
        (s.major && s.major.toLowerCase().includes(q)) ||
        (s.company && s.company.toLowerCase().includes(q)) ||
        (s.position && s.position.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [students, statusFilter, searchQuery]);

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('uniwork_user') || 'null');
    } catch {
      return null;
    }
  })();
  const profName = currentUser?.name || 'Dr. James Smith';

  const handleLogout = () => {
    localStorage.removeItem('uniwork_user');
    localStorage.removeItem('uniwork_token');
    navigate('/login');
  };

  const navItems = getProfessorNavItems('students', navigate, pendingReportCount, stats.total);

  return (
    <div className={styles.layout}>
      <Sidebar
        subtitle="Professor"
        navItems={navItems}
        onLogout={handleLogout}
      />

      <main className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <h1 className={styles.heading}>Student List</h1>
            <p className={styles.subheading}>
              Assigned students for internship supervision · Semester 1/2026
            </p>
          </div>
          <div className={styles.userChip}>
            <span className={styles.userName}>{profName}</span>
            <div className={styles.avatar}>J</div>
          </div>
        </header>

        {/* Metric Summary Cards */}
        <div className={styles.statsRow}>
          <StatCard label="Total Students" value={stats.total} unit="assigned" />
          <StatCard label="Placed / Interning" value={stats.placed} unit="students" accent="success" />
          <StatCard label="Interviewing" value={stats.interviewing} unit="students" accent="warning" />
          <StatCard label="Needs Placement" value={stats.searching} unit="students" accent="danger" />
        </div>

        {/* Toolbar & Filters */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <i className={`bi bi-search ${styles.searchIcon}`} />
            <input
              type="text"
              placeholder="Search by student ID, name, major, or company..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.filterTabs}>
            <button
              className={`${styles.filterBtn} ${statusFilter === 'all' ? styles.filterBtnActive : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All ({students.length})
            </button>
            <button
              className={`${styles.filterBtn} ${statusFilter === 'placed' ? styles.filterBtnActive : ''}`}
              onClick={() => setStatusFilter('placed')}
            >
              Placed ({stats.placed})
            </button>
            <button
              className={`${styles.filterBtn} ${statusFilter === 'interviewing' ? styles.filterBtnActive : ''}`}
              onClick={() => setStatusFilter('interviewing')}
            >
              Interviewing ({stats.interviewing})
            </button>
            <button
              className={`${styles.filterBtn} ${statusFilter === 'searching' ? styles.filterBtnActive : ''}`}
              onClick={() => setStatusFilter('searching')}
            >
              Searching ({stats.searching})
            </button>
          </div>
        </div>

        {/* Students Table */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Assigned Students</h2>
            <span className={styles.countTag}>
              Showing {filteredStudents.length} of {students.length} students
            </span>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Major & Year</th>
                  <th>GPA</th>
                  <th>Company & Position</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      <div className={styles.emptyState}>
                        <i className={`bi bi-person-x ${styles.emptyIcon}`} />
                        <p>No students match your filter or search query.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => {
                    const initials = s.name
                      ? s.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                      : 'ST';
                    const statusInfo = STATUS_MAP[s.status] || {
                      label: s.status,
                      variant: 'secondary',
                    };

                    return (
                      <tr key={s.id}>
                        <td className={styles.studentCodeText}>{s.studentCode || `ST-${s.id}`}</td>
                        <td>
                          <div className={styles.studentCell}>
                            <div className={styles.studentAvatar}>{initials}</div>
                            <div>
                              <div className={styles.studentNameText}>{s.name}</div>
                              <div className={styles.studentEmailText}>{s.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>{s.major}</div>
                          <div className={styles.studentEmailText}>{s.year || '4th Year'}</div>
                        </td>
                        <td>
                          <strong>{s.gpa ? s.gpa.toFixed(2) : '—'}</strong>
                        </td>
                        <td>
                          {s.company ? (
                            <div className={styles.companyCell}>
                              <span className={styles.companyName}>{s.company}</span>
                              <span className={styles.companyRole}>{s.position}</span>
                            </div>
                          ) : (
                            <span className={styles.noPlacement}>Not yet placed</span>
                          )}
                        </td>
                        <td>
                          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        </td>
                        <td>
                          <button
                            className={styles.actionBtn}
                            onClick={() => setSelectedStudent(s)}
                          >
                            <i className="bi bi-eye" />
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student Detail Modal */}
        {selectedStudent && (
          <div className={styles.modalOverlay} onClick={() => setSelectedStudent(null)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Student Internship Profile</h3>
                <button
                  className={styles.closeBtn}
                  onClick={() => setSelectedStudent(null)}
                >
                  <i className="bi bi-x-lg" />
                </button>
              </div>

              <div className={styles.modalBody}>
                {/* Academic & Basic Info */}
                <div className={styles.modalSection}>
                  <div className={styles.sectionTitle}>
                    <i className="bi bi-person-badge" />
                    Student Academic Information
                  </div>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Full Name</span>
                      <span className={styles.infoValue}>{selectedStudent.name}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Student Code / ID</span>
                      <span className={styles.infoValue}>
                        {selectedStudent.studentCode || `ST-${selectedStudent.id}`}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Major</span>
                      <span className={styles.infoValue}>{selectedStudent.major}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Faculty</span>
                      <span className={styles.infoValue}>
                        {selectedStudent.faculty || 'Faculty of Informatics'}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Academic Year</span>
                      <span className={styles.infoValue}>{selectedStudent.year || '4th Year'}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Cumulative GPA</span>
                      <span className={styles.infoValue}>
                        {selectedStudent.gpa ? selectedStudent.gpa.toFixed(2) : '—'}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Email</span>
                      <span className={styles.infoValue}>{selectedStudent.email}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Phone</span>
                      <span className={styles.infoValue}>
                        {selectedStudent.phone || '+66 89 000 0000'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Internship Placement Info */}
                <div className={styles.modalSection}>
                  <div className={styles.sectionTitle}>
                    <i className="bi bi-briefcase" />
                    Internship Placement Details
                  </div>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Placement Status</span>
                      <span className={styles.infoValue}>
                        <Badge
                          variant={
                            STATUS_MAP[selectedStudent.status]?.variant || 'secondary'
                          }
                        >
                          {STATUS_MAP[selectedStudent.status]?.label || selectedStudent.status}
                        </Badge>
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Host Company</span>
                      <span className={styles.infoValue}>
                        {selectedStudent.company || 'None / Seeking Placement'}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Internship Position</span>
                      <span className={styles.infoValue}>
                        {selectedStudent.position || '—'}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Assigned Professor</span>
                      <span className={styles.infoValue}>
                        {selectedStudent.assignedProfessor || 'Dr. James Smith'}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Company Supervisor</span>
                      <span className={styles.infoValue}>
                        {selectedStudent.supervisor || 'Not assigned yet'}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Supervisor Contact</span>
                      <span className={styles.infoValue}>
                        {selectedStudent.supervisorEmail || '—'}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Start Date</span>
                      <span className={styles.infoValue}>
                        {selectedStudent.startDate || '—'}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>End Date</span>
                      <span className={styles.infoValue}>
                        {selectedStudent.endDate || '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  className={styles.btnSecondary}
                  onClick={() => setSelectedStudent(null)}
                >
                  Close
                </button>
                <button
                  className={styles.btnPrimary}
                  onClick={() => {
                    navigate(`/professor/reports?studentId=${selectedStudent.id}`);
                  }}
                >
                  <i className="bi bi-journal-text" />
                  View Weekly Reports
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
