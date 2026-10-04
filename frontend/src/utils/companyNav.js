/**
 * Shared navigation items for all Company portal pages
 */
export function getCompanyNavItems(activeKey, navigate, applicantCount = 5) {
  return [
    {
      iconClass: 'bi-grid-1x2-fill',
      label: 'Dashboard',
      active: activeKey === 'dashboard',
      onClick: () => navigate('/company/dashboard'),
    },
    {
      iconClass: 'bi-briefcase',
      label: 'My Job Listings',
      active: activeKey === 'jobs',
      onClick: () => navigate('/company/jobs'),
    },
    {
      iconClass: 'bi-people',
      label: 'Applicants',
      active: activeKey === 'applicants',
      badge: applicantCount > 0 ? String(applicantCount) : null,
      onClick: () => navigate('/company/applicants'),
    },
    {
      iconClass: 'bi-plus-circle',
      label: 'Post New Job',
      active: activeKey === 'post-job',
      onClick: () => navigate('/company/post-job'),
    },
    {
      iconClass: 'bi-building',
      label: 'Company Profile',
      active: activeKey === 'profile',
      onClick: () => navigate('/company/profile'),
    },
  ];
}
