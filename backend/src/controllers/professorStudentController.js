const { mockStudents, mockReports } = require('../data/mockData');

const getStudentList = (req, res) => {
  const { status, search } = req.query;
  let students = [...mockStudents];

  if (status && status !== 'all') {
    students = students.filter((s) => s.status.toLowerCase() === status.toLowerCase());
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    students = students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.studentCode && s.studentCode.toLowerCase().includes(q)) ||
        (s.major && s.major.toLowerCase().includes(q)) ||
        (s.company && s.company.toLowerCase().includes(q))
    );
  }

  const stats = {
    total: mockStudents.length,
    placed: mockStudents.filter((s) => s.status === 'placed').length,
    interviewing: mockStudents.filter((s) => s.status === 'interviewing').length,
    searching: mockStudents.filter((s) => s.status === 'searching').length,
  };

  res.json({
    students,
    total: students.length,
    stats,
  });
};

const getStudentById = (req, res) => {
  const paramId = req.params.id;
  const student = mockStudents.find(
    (s) => s.id === parseInt(paramId) || s.studentCode === paramId
  );

  if (!student) {
    return res.status(404).json({ error: 'Student not found.' });
  }

  const studentReports = mockReports.filter((r) => r.studentId === student.id);

  res.json({
    student,
    reports: studentReports,
  });
};


const getStudentOverview = (req, res) => {
  const stats = {
    total: mockStudents.length,
    placed: mockStudents.filter((s) => s.status === 'placed').length,
    interviewing: mockStudents.filter((s) => s.status === 'interviewing').length,
    searching: mockStudents.filter((s) => s.status === 'searching').length,
  };

  res.json({
    semester: '1/2026',
    stats,
    recentUpdates: mockStudents.slice(0, 5),
  });
};

module.exports = {
  getStudentList,
  getStudentById,
  getStudentOverview,
};
