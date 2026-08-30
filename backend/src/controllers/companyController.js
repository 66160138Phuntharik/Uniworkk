let mockJobs = [
  {
    id: 1,
    companyId: 2,
    company: 'TechNova Solutions',
    title: 'Frontend Developer Intern',
    location: 'Bangkok',
    type: 'Full-time Internship',
    salary: '15,000 THB/month',
    description: 'Work alongside our engineering team building modern, responsive UIs with React.',
    skills: ['React', 'JavaScript', 'CSS', 'Git'],
    applicants: 12,
    status: 'open',
    postedDate: '2026-05-01',
  },
  {
    id: 2,
    companyId: 2,
    company: 'DataRock',
    title: 'Data Analyst Intern',
    location: 'Remote',
    type: 'Part-time Internship',
    salary: '10,000 THB/month',
    description: 'Analyze business datasets and create visual dashboards for stakeholders.',
    skills: ['Python', 'SQL', 'Tableau', 'Excel'],
    applicants: 8,
    status: 'open',
    postedDate: '2026-05-05',
  },
  {
    id: 3,
    companyId: 3,
    company: 'CloudScale Tech',
    title: 'Fullstack Intern',
    location: 'Chiang Mai',
    type: 'Full-time Internship',
    salary: '12,000 THB/month',
    description: 'Join our backend and frontend teams to build scalable cloud-based systems.',
    skills: ['Node.js', 'React', 'PostgreSQL', 'Docker'],
    applicants: 5,
    status: 'closed',
    postedDate: '2026-04-20',
  },
];

let mockApplicants = [
  { id: 1, jobId: 1, name: 'test001 eiei', major: 'Computer Science', gpa: 3.8, appliedDate: '2026-05-15', status: 'accepted' },
  { id: 2, jobId: 1, name: 'test002 eiei', major: 'Software Engineering', gpa: 3.5, appliedDate: '2026-05-14', status: 'interviewing' },
  { id: 3, jobId: 2, name: 'test003 eiei', major: 'Data Science', gpa: 3.9, appliedDate: '2026-05-13', status: 'reviewing' },
  { id: 4, jobId: 2, name: 'test004 eiei', major: 'Statistics', gpa: 3.7, appliedDate: '2026-05-12', status: 'reviewing' },
];

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
