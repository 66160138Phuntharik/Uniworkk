const { mockApplications, mockDocuments } = require('../data/mockData');

// GET /api/students/:id/applications ดูรายการสมัครฝึกงานของนิสิต
const getApplications = (req, res) => {
  const studentId = parseInt(req.params.id);
  const apps = mockApplications.filter((a) => a.studentId === studentId);
  res.json({ applications: apps, total: apps.length });
};

// POST /api/students/:id/applications สมัครตำแหน่งฝึกงาน
const applyForJob = (req, res) => {
  const studentId = parseInt(req.params.id);
  const { jobId, company, position, resumeName, coverNote } = req.body;

  if (!company || !position) {
    return res.status(400).json({ error: 'Company and position are required.' });
  }

  // ตรวจสอบว่าเคยสมัครตำแหน่งนี้ไปแล้วหรือไม่
  const existing = mockApplications.find(
    (a) =>
      a.studentId === studentId &&
      (a.jobId === parseInt(jobId) ||
        (a.company?.toLowerCase() === company?.toLowerCase() &&
          a.position?.toLowerCase() === position?.toLowerCase()))
  );
  if (existing) {
    return res.status(400).json({ error: 'You have already applied for this position.' });
  }

  const primaryResume =
    mockDocuments.find((d) => d.studentId === studentId && d.isPrimary) ||
    mockDocuments.find((d) => d.studentId === studentId);

  const newApp = {
    id: mockApplications.length ? Math.max(...mockApplications.map((a) => a.id)) + 1 : 1,
    studentId,
    jobId: jobId ? parseInt(jobId) : null,
    company,
    position,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    status: 'reviewing',
    resumeAttached: resumeName || primaryResume?.fileName || 'Primary_Resume.pdf',
    coverNote: coverNote || '',
  };

  mockApplications.unshift(newApp);
  res.status(201).json({ message: `Successfully applied to ${company} for ${position}!`, application: newApp });
};

module.exports = {
  getApplications,
  applyForJob,
};
