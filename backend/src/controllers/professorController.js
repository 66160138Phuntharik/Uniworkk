let mockReports = [
  {
    id: 1,
    studentId: 1,
    studentName: 'Alex Johnson',
    company: 'TechNova Solutions',
    week: 3,
    content: 'Continued work on the dashboard UI. Encountered issues connecting to the external API.',
    highlights: 'Completed responsive layout for the analytics page.',
    challenges: 'Having trouble with CORS policy on the external REST API.',
    status: 'pending',
    submittedDate: '2026-08-20',
    feedback: null,
  },
  {
    id: 2,
    studentId: 4,
    studentName: 'Thanh Sritong',
    company: 'DataRock',
    week: 2,
    content: 'Was sick for 2 days but completed the remaining assigned tasks.',
    highlights: 'Finished data cleaning pipeline for Q2 dataset.',
    challenges: 'Missed 2 days due to illness.',
    status: 'pending',
    submittedDate: '2026-08-18',
    feedback: null,
  },
  {
    id: 3,
    studentId: 2,
    studentName: 'Maria Chen',
    company: 'DataRock',
    week: 3,
    content: 'Completed the Tableau dashboard for the sales team.',
    highlights: 'Dashboard received positive feedback from the manager.',
    challenges: 'None this week.',
    status: 'reviewed',
    submittedDate: '2026-08-19',
    feedback: 'Excellent work! The dashboard looks professional.',
  },
];

// student overview
const getStudentOverview = (req, res) => {
  res.json({
    semester: '1/2026',
    stats: { total: 120, placed: 85, interviewing: 23, searching: 12 },
    recentUpdates: [
      { id: 1, name: 'Alex Johnson', major: 'Computer Science', company: 'TechNova Solutions', status: 'placed' },
      { id: 2, name: 'Maria Chen', major: 'Data Science', company: 'DataRock', status: 'interviewing' },
      { id: 3, name: 'James Park', major: 'Information Technology', company: '—', status: 'searching' },
    ],
  });
};

// student reports
const getReports = (req, res) => {
  const { status } = req.query;
  let reports = [...mockReports];
  if (status) reports = reports.filter((r) => r.status === status);
  const pendingCount = mockReports.filter((r) => r.status === 'pending').length;
  res.json({ reports, total: reports.length, pendingCount });
};

// review student report
const reviewReport = (req, res) => {
  const { feedback } = req.body;
  const report = mockReports.find((r) => r.id === parseInt(req.params.reportId));
  if (!report) return res.status(404).json({ error: 'Report not found.' });
  if (report.status === 'reviewed') {
    return res.status(400).json({ error: 'Report has already been reviewed.' });
  }
  report.status = 'reviewed';
  report.feedback = feedback || '';
  res.json({ message: 'Report marked as reviewed.', report });
};

module.exports = { getStudentOverview, getReports, reviewReport };
