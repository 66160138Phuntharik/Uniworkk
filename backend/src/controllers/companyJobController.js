const { mockJobs } = require('../data/mockData');

// GET /api/companies/jobs
const getJobs = (req, res) => {
  const { status, location, search, companyId } = req.query;
  let jobs = [...mockJobs];

  // Filter by companyId if specified or default if companyId query passed
  if (companyId) {
    jobs = jobs.filter((j) => j.companyId === parseInt(companyId));
  }
  if (status) {
    jobs = jobs.filter((j) => j.status === status);
  }
  if (location) {
    jobs = jobs.filter((j) =>
      j.location.toLowerCase().includes(location.toLowerCase())
    );
  }
  if (search) {
    const q = search.toLowerCase();
    jobs = jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        (j.category && j.category.toLowerCase().includes(q)) ||
        (j.skills && j.skills.some((s) => s.toLowerCase().includes(q))) ||
        (j.description && j.description.toLowerCase().includes(q))
    );
  }
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
  const {
    title,
    category,
    description,
    requirements,
    skills,
    location,
    workMode,
    salary,
    type,
  } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required.' });
  }

  // Parse requirements into array if provided as string
  let parsedReqs = requirements;
  if (typeof requirements === 'string') {
    parsedReqs = requirements
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);
  } else if (!Array.isArray(requirements)) {
    parsedReqs = [];
  }

  // Parse skills into array if provided as comma-separated string
  let parsedSkills = skills;
  if (typeof skills === 'string') {
    parsedSkills = skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  } else if (!Array.isArray(skills)) {
    parsedSkills = [];
  }

  const newJob = {
    id: mockJobs.length > 0 ? Math.max(...mockJobs.map((j) => j.id)) + 1 : 1,
    companyId: req.user?.id || 2,
    company: req.user?.name || 'TechNova Solutions',
    category: category || 'Software & Web',
    title,
    description,
    requirements: parsedReqs,
    skills: parsedSkills,
    location: location || 'Bangkok',
    workMode: workMode || 'Hybrid',
    salary: salary || '15,000 THB/month',
    type: type || 'Full-time Internship',
    applicants: 0,
    status: 'open',
    postedDate: new Date().toISOString().split('T')[0],
  };

  mockJobs.unshift(newJob);
  res.status(201).json({ message: 'Job posted successfully.', job: newJob });
};

// DELETE /api/companies/jobs/:id
const deleteJob = (req, res) => {
  const jobId = parseInt(req.params.id);
  const index = mockJobs.findIndex((j) => j.id === jobId);
  if (index === -1) {
    return res.status(404).json({ error: 'Job listing not found.' });
  }
  const deleted = mockJobs.splice(index, 1)[0];
  res.json({ message: 'Job listing deleted successfully.', job: deleted });
};

// PATCH /api/companies/jobs/:id/status
const toggleJobStatus = (req, res) => {
  const jobId = parseInt(req.params.id);
  const job = mockJobs.find((j) => j.id === jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job listing not found.' });
  }

  if (req.body.status) {
    job.status = req.body.status;
  } else {
    job.status = job.status === 'open' ? 'closed' : 'open';
  }

  res.json({ message: 'Job status updated.', job });
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  deleteJob,
  toggleJobStatus,
};
