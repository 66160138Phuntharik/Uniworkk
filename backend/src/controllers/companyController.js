const { mockJobs, mockApplicants } = require('../data/mockData');

// GET /api/companies/jobs
const getJobs = (req, res) => {
  const { status, location } = req.query;
  let jobs = [...mockJobs];
  if (status) jobs = jobs.filter((j) => j.status === status);
  if (location) jobs = jobs.filter((j) => j.location.toLowerCase().includes(location.toLowerCase()));
  res.json({ jobs, total: jobs.length });
};

// GET /api/companies/jobs/:id
const getJobById = (req, res) => {
  const job = mockJobs.find((j) => j.id === parseInt(req.params.id));
  if (!job) return res.status(404).json({ error: 'Job not found.' });
  res.json(job);
};

// POST /api/companies/jobs
const createJob = (req, res) => {
  const { title, description, skills, location, salary, type } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required.' });
  }
  const newJob = {
    id: mockJobs.length + 1,
    companyId: req.user?.id || 2,
    company: req.user?.name || 'TechNova Solutions',
    title,
    description,
    skills: skills || [],
    location: location || 'Bangkok',
    salary: salary || 'Negotiable',
    type: type || 'Full-time Internship',
    applicants: 0,
    status: 'open',
    postedDate: new Date().toISOString().split('T')[0],
  };
  mockJobs.push(newJob);
  res.status(201).json({ message: 'Job posted successfully.', job: newJob });
};

// GET /api/companies/:id/applicants
const getApplicants = (req, res) => {
  const applicants = mockApplicants.filter((a) => a.jobId === parseInt(req.params.id));
  res.json({ applicants, total: applicants.length });
};

// PATCH /api/companies/applicants/:applicantId/status
const updateApplicantStatus = (req, res) => {
  const { status } = req.body;
  const validStatuses = ['reviewing', 'interviewing', 'accepted', 'rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }
  const applicant = mockApplicants.find((a) => a.id === parseInt(req.params.applicantId));
  if (!applicant) return res.status(404).json({ error: 'Applicant not found.' });
  applicant.status = status;
  res.json({ message: 'Applicant status updated.', applicant });
};

module.exports = { getJobs, getJobById, createJob, getApplicants, updateApplicantStatus };
