const { mockReports } = require('../data/mockData');

const getReports = (req, res) => {
  const { status, studentId, search } = req.query;
  let reports = [...mockReports];

  if (status && status !== 'all') {
    reports = reports.filter((r) => r.status === status);
  }

  if (studentId) {
    reports = reports.filter((r) => r.studentId === parseInt(studentId));
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    reports = reports.filter(
      (r) =>
        r.studentName.toLowerCase().includes(q) ||
        (r.studentCode && r.studentCode.toLowerCase().includes(q)) ||
        (r.company && r.company.toLowerCase().includes(q)) ||
        (r.content && r.content.toLowerCase().includes(q))
    );
  }

  const pendingCount = mockReports.filter((r) => r.status === 'pending').length;
  const reviewedCount = mockReports.filter((r) => r.status === 'reviewed').length;

  res.json({
    reports,
    total: reports.length,
    pendingCount,
    reviewedCount,
  });
};

const getReportById = (req, res) => {
  const report = mockReports.find((r) => r.id === parseInt(req.params.reportId));
  if (!report) {
    return res.status(404).json({ error: 'Report not found.' });
  }
  res.json({ report });
};

const submitReportFeedback = (req, res) => {
  const reportId = parseInt(req.params.reportId);
  const report = mockReports.find((r) => r.id === reportId);

  if (!report) {
    return res.status(404).json({ error: 'Report not found.' });
  }

  const feedbackText =
    req.body.feedback !== undefined
      ? req.body.feedback
      : req.body.comments !== undefined
      ? req.body.comments
      : '';

  report.feedback = feedbackText.trim();
  report.status = 'reviewed';
  report.feedbackDate = new Date().toISOString().split('T')[0];

  res.json({
    message: 'Report feedback submitted successfully.',
    report,
  });
};

module.exports = {
  getReports,
  getReportById,
  submitReportFeedback,
  reviewReport: submitReportFeedback, 
};
