const { mockReports } = require('../data/mockData');

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
