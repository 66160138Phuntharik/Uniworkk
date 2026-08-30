const { mockStudents } = require('../data/mockData');
const { getStudentProfile, updateStudentProfile } = require('./studentProfileController');
const {
  getStudentDocuments,
  uploadStudentDocument,
  deleteStudentDocument,
  setPrimaryDocument,
} = require('./studentDocumentController');
const { getApplications, applyForJob } = require('./studentApplicationController');
const { submitReport } = require('./studentReportController');

// GET /api/students ดูรายชื่อนิสิตทั้งหมด
const getStudents = (req, res) => {
  res.json({ students: mockStudents, total: mockStudents.length });
};

// GET /api/students/:id ดูข้อมูลนิสิตตาม id
const getStudentById = (req, res) => {
  const student = mockStudents.find((s) => s.id === parseInt(req.params.id));
  if (!student) return res.status(404).json({ error: 'Student not found.' });
  res.json(student);
};

module.exports = {
  // Core Student
  getStudents,
  getStudentById,

  // Student Profile
  getStudentProfile,
  updateStudentProfile,

  // Document Vault (Resume & CV)
  getStudentDocuments,
  uploadStudentDocument,
  deleteStudentDocument,
  setPrimaryDocument,

  // Applications
  getApplications,
  applyForJob,

  // Weekly Reports
  submitReport,
};
