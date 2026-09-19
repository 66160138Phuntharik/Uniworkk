const { mockApplicants } = require('../data/mockData');

// GET /api/companies/applicants or /api/companies/:id/applicants
const getApplicants = (req, res) => {
  const targetJobId = req.params.id || req.query.jobId;
  const { status, search } = req.query;
  const targetCompanyId = req.user?.id || 2;

  let applicants = [...mockApplicants];

  // If specific jobId requested
  if (targetJobId) {
    applicants = applicants.filter((a) => a.jobId === parseInt(targetJobId));
  } else {
    // Return company's applicants
    applicants = applicants.filter(
      (a) => !a.companyId || a.companyId === targetCompanyId
    );
  }

  if (status && status !== 'all') {
    applicants = applicants.filter((a) => a.status === status);
  }

  if (search) {
    const q = search.toLowerCase();
    applicants = applicants.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        (a.major && a.major.toLowerCase().includes(q)) ||
        (a.position && a.position.toLowerCase().includes(q)) ||
        (a.studentCode && a.studentCode.includes(q))
    );
  }

  res.json({ applicants, total: applicants.length });
};

// PATCH /api/companies/applicants/:applicantId/status
const updateApplicantStatus = (req, res) => {
  const { status } = req.body;
  const validStatuses = ['reviewing', 'interviewing', 'accepted', 'rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
    });
  }
  const applicant = mockApplicants.find(
    (a) => a.id === parseInt(req.params.applicantId)
  );
  if (!applicant) return res.status(404).json({ error: 'Applicant not found.' });
  applicant.status = status;
  res.json({ message: 'Applicant status updated.', applicant });
};

module.exports = {
  getApplicants,
  updateApplicantStatus,
};
