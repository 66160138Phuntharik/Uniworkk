const supabase = require('../config/supabase');
const { mockStudents } = require('../data/mockData');
const { getStudentProfile, updateStudentProfile } = require('./studentProfileController');
const {
  getStudentDocuments,
  uploadStudentDocument,
  deleteStudentDocument,
  setPrimaryDocument,
} = require('./studentDocumentController');
const { getApplications, applyForJob } = require('./studentApplicationController');
const { getStudentReports, submitReport } = require('./studentReportController');

// GET /api/students ดูรายชื่อนิสิตทั้งหมด
const getStudents = async (req, res) => {
  try {
    const { data: dbStudents, error } = await supabase.from('students').select('*').order('id', { ascending: true });
    if (!error && dbStudents && dbStudents.length > 0) {
      const mapped = dbStudents.map((s) => ({
        id: s.id,
        studentCode: s.student_code,
        name: s.name,
        email: s.email,
        phone: s.phone,
        faculty: s.faculty,
        major: s.major,
        year: s.year,
        gpa: s.gpa ? parseFloat(s.gpa) : 0,
        status: s.status,
        company: s.company,
        position: s.position,
        supervisor: s.supervisor,
        supervisorEmail: s.supervisor_email,
        startDate: s.start_date,
        endDate: s.end_date,
        assignedProfessor: s.assigned_professor,
      }));
      return res.json({ students: mapped, total: mapped.length });
    }
  } catch (err) {
    console.warn('Supabase getStudents fallback:', err.message);
  }

  res.json({ students: mockStudents, total: mockStudents.length });
};

// GET /api/students/:id ดูข้อมูลนิสิตตาม id
const getStudentById = async (req, res) => {
  const studentId = parseInt(req.params.id);

  try {
    const { data: s, error } = await supabase.from('students').select('*').eq('id', studentId).maybeSingle();
    if (!error && s) {
      return res.json({
        id: s.id,
        studentCode: s.student_code,
        name: s.name,
        email: s.email,
        phone: s.phone,
        faculty: s.faculty,
        major: s.major,
        year: s.year,
        gpa: s.gpa ? parseFloat(s.gpa) : 0,
        status: s.status,
        company: s.company,
        position: s.position,
        supervisor: s.supervisor,
        supervisorEmail: s.supervisor_email,
        startDate: s.start_date,
        endDate: s.end_date,
        assignedProfessor: s.assigned_professor,
      });
    }
  } catch (err) {
    console.warn('Supabase getStudentById fallback:', err.message);
  }

  const student = mockStudents.find((s) => s.id === studentId);
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
  getStudentReports,
  submitReport,
};
