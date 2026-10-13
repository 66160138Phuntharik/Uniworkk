const supabase = require('../config/supabase');

const getStudentList = async (req, res) => {
  const { status, search } = req.query;

  try {
    let query = supabase.from('students').select('*').order('id', { ascending: true });

    if (status && status !== 'all') {
      query = query.eq('status', status.toLowerCase());
    }

    const { data: dbStudents, error } = await query;

    if (error) {
      console.error('Supabase getStudentList error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    let mapped = (dbStudents || []).map((s) => ({
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
  } catch (err) {
    console.error('getStudentList error:', err.message);
    return res.status(500).json({ error: err.message });
  }
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

    if (error) {
      console.error('Supabase getStudentById error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    if (!s) {
      return res.status(404).json({ error: 'Student not found.' });
    }

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
  } catch (err) {
    console.error('getStudentById error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

const getStudentOverview = async (req, res) => {
  try {
    const { data: students, error } = await supabase.from('students').select('status');

    if (error) {
      console.error('Supabase getStudentOverview error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    const list = students || [];
    const stats = {
      total: list.length,
      placed: list.filter((s) => s.status === 'placed').length,
      interviewing: list.filter((s) => s.status === 'interviewing').length,
      searching: list.filter((s) => s.status === 'searching').length,
    };
    return res.json({ stats });
  } catch (err) {
    console.error('getStudentOverview error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getStudentList,
  getStudentById,
  getStudentOverview,
};
