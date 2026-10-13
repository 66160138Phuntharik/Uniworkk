/**
 * Shared navigation items for all Professor portal pages
 */
export function getProfessorNavItems(activeKey, navigate, pendingReportCount = null, studentCount = null) {
  return [
    {
      iconClass: 'bi-grid-1x2-fill',
      label: 'Dashboard',
      active: activeKey === 'dashboard',
      onClick: () => navigate('/professor/dashboard'),
    },
    {
      iconClass: 'bi-people-fill',
      label: studentCount != null ? `Student List (${studentCount})` : 'Student List',
      active: activeKey === 'students',
      onClick: () => navigate('/professor/students'),
    },
    {
      iconClass: 'bi-journal-text',
      label: 'Review Reports',
      active: activeKey === 'reports',
      badge: pendingReportCount != null && pendingReportCount > 0 ? String(pendingReportCount) : null,
      onClick: () => navigate('/professor/reports'),
    },
  ];
}
