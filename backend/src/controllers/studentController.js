const mockStudents = [
  {
    id: 1,
    name: 'test001 eiei',
    major: 'Computer Science',
    email: 'test001@go.buu.ac.th',
    gpa: 3.8,
    status: 'placed',
    company: 'TechNova Solutions',
    position: 'Frontend Developer Intern',
    startDate: '2026-06-01',
  },
  {
    id: 2,
    name: 'test002 eiei',
    major: 'Data Science',
    email: 'test002@go.buu.ac.th',
    gpa: 3.6,
    status: 'interviewing',
    company: 'DataRock',
    position: 'Data Analyst Intern',
    startDate: null,
  },
  {
    id: 3,
    name: 'test003 eiei',
    major: 'Information Technology',
    email: 'test003@go.buu.ac.th',
    gpa: 3.2,
    status: 'searching',
    company: null,
    position: null,
    startDate: null,
  },
];

const mockApplications = [
  { id: 1, studentId: 1, company: 'TechNova Solutions', position: 'Frontend Developer Intern', date: '2026-05-15', status: 'accepted' },
  { id: 2, studentId: 1, company: 'DataRock', position: 'Web Developer (Node.js)', date: '2026-05-12', status: 'interviewing' },
  { id: 3, studentId: 1, company: 'CloudScale Tech', position: 'Fullstack Intern', date: '2026-05-10', status: 'reviewing' },
  { id: 4, studentId: 2, company: 'DataRock', position: 'Data Analyst Intern', date: '2026-05-08', status: 'interviewing' },
];

// api getstudent ทั้งหมด
const getStudents = (req, res) => {
  res.json({ students: mockStudents, total: mockStudents.length });
};

// ตาม id รายคน
const getStudentById = (req, res) => {
  const student = mockStudents.find((s) => s.id === parseInt(req.params.id));
  if (!student) return res.status(404).json({ error: 'Student not found.' });
  res.json(student);
};

// getapp ของแต่ละคน
const getApplications = (req, res) => {
  const apps = mockApplications.filter((a) => a.studentId === parseInt(req.params.id));
  res.json({ applications: apps, total: apps.length });
};

// POST รายงานของแต่ละคน
const submitReport = (req, res) => {
  const { week, content, highlights, challenges } = req.body;
  if (!week || !content) {
    return res.status(400).json({ error: 'Week number and content are required.' });
  }
  res.status(201).json({
    message: `Weekly report for Week ${week} submitted successfully.`,
    data: { week, content, highlights, challenges, studentId: req.params.id, submittedAt: new Date().toISOString() },
  });
};

module.exports = { getStudents, getStudentById, getApplications, submitReport };
