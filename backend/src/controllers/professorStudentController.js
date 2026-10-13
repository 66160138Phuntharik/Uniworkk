const supabase = require('../config/supabase');
const { mockStudents, mockReports } = require('../data/mockData');

const getStudentList = async (req, res) => {
  const { status, search } = req.query;

  try {
    let query = supabase.from('students').select('*').order('id', { ascending: true });

    if (status && status !== 'all') {
      query = query.eq('status', status.toLowerCase());
    }

    const { data: dbStudents, error } = await query;

    if (!error && dbStudents && dbStudents.length > 0) {
      let mapped = dbStudents.map((s) => ({
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

      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        mapped = mapped.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            (s.studentCode && s.studentCode.toLowerCase().includes(q)) ||
            (s.major && s.major.toLowerCase().includes(q)) ||
            (s.company && s.company.toLowerCase().includes(q))
        );
      }

      const stats = {
        total: mapped.length,
        placed: mapped.filter((s) => s.status === 'placed').length,
        interviewing: mapped.filter((s) => s.status === 'interviewing').length,
        searching: mapped.filter((s) => s.status === 'searching').length,
      };

      return res.json({
        students: mapped,
        total: mapped.length,
        stats,
      });
    }
  } catch (err) {
    console.warn('Supabase getStudentList fallback:', err.message);
  }

  // Fallback to mock data
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

const getStudentById = async (req, res) => {
  const paramId = req.params.id;

  try {
    let query = supabase.from('students').select('*');
    if (/^\d+$/.test(paramId) && paramId.length < 8) {
      query = query.eq('id', parseInt(paramId));
    } else {
      query = query.eq('student_code', paramId);
    }

    const { data: s, error } = await query.maybeSingle();

    if (!error && s) {
      const student = {
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
      };

      const { data: dbReports } = await supabase
        .from('reports')
        .select('*')
        .eq('student_id', s.id);

      const mappedReports = (dbReports || []).map((r) => ({
        id: r.id,
        studentId: r.student_id,
        studentName: r.student_name,
        studentCode: r.student_code,
        company: r.company,
        position: r.position,
        week: r.week,
        dateRange: r.date_range,
        content: r.content,
        submittedDate: r.submitted_date,
        status: r.status,
        feedback: r.feedback,
        feedbackDate: r.feedback_date,
      }));

      return res.json({ student, reports: mappedReports });
    }
  } catch (err) {
    console.warn('Supabase getStudentById fallback:', err.message);
  }

  const student = mockStudents.find(
    (s) => s.id === parseInt(paramId) || s.studentCode === paramId
  );

  if (!student) {
    return res.status(404).json({ error: 'Student not found.' });
  }

  const studentReports = mockReports.filter((r) => r.studentId === student.id);
  res.json({ student, reports: studentReports });
};

const getStudentOverview = async (req, res) => {
  try {
    const { data: students, error } = await supabase.from('students').select('status');
    if (!error && students && students.length > 0) {
      const stats = {
        total: students.length,
        placed: students.filter((s) => s.status === 'placed').length,
        interviewing: students.filter((s) => s.status === 'interviewing').length,
        searching: students.filter((s) => s.status === 'searching').length,
      };
      return res.json({ stats });
    }
  } catch (err) {
    console.warn('Supabase getStudentOverview fallback:', err.message);
  }

  const stats = {
    total: mockStudents.length,
    placed: mockStudents.filter((s) => s.status === 'placed').length,
    interviewing: mockStudents.filter((s) => s.status === 'interviewing').length,
    searching: mockStudents.filter((s) => s.status === 'searching').length,
  };
  res.json({ stats });
};

module.exports = {
  getStudentList,
  getStudentById,
  getStudentOverview,
};
