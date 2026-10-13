const supabase = require('../config/supabase');
const { mockReports, mockStudents } = require('../data/mockData');

// GET /api/students/:id/reports ดูรายงานรายสัปดาห์ทั้งหมดของนิสิต
const getStudentReports = async (req, res) => {
  const studentId = parseInt(req.params.id);

  try {
    const { data: student } = await supabase
      .from('students')
      .select('company, position')
      .eq('id', studentId)
      .maybeSingle();

    const { data: reports, error } = await supabase
      .from('reports')
      .select('*')
      .eq('student_id', studentId)
      .order('week', { ascending: false });

    if (!error && reports) {
      const mapped = reports.map((r) => ({
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
        feedback: r.feedback || '',
        feedbackDate: r.feedback_date || null,
      }));

      const latestWeek = mapped.length ? Math.max(...mapped.map((r) => r.week)) : 0;
      const stats = {
        totalWeeksRequired: 16,
        submittedWeeks: mapped.length,
        nextDueWeek: latestWeek + 1 <= 16 ? latestWeek + 1 : 16,
        company: student?.company || mapped[0]?.company || 'Pending Placement',
        position: student?.position || mapped[0]?.position || 'Intern',
      };

      return res.json({ reports: mapped, stats });
    }
  } catch (err) {
    console.warn('Supabase getStudentReports fallback:', err.message);
  }

  const student = mockStudents.find((s) => s.id === studentId);
  const reports = mockReports
    .filter((r) => r.studentId === studentId)
    .sort((a, b) => b.week - a.week);

  const latestWeek = reports.length ? Math.max(...reports.map((r) => r.week)) : 0;
  const stats = {
    totalWeeksRequired: 16,
    submittedWeeks: reports.length,
    nextDueWeek: latestWeek + 1 <= 16 ? latestWeek + 1 : 16,
    company: student?.company || 'Pending Placement',
    position: student?.position || 'Intern',
  };

  res.json({ reports, stats });
};

// POST /api/students/:id/reports ส่งหรือแก้ไขรายงานการฝึกงานประจำสัปดาห์
const submitReport = async (req, res) => {
  const studentId = parseInt(req.params.id);
  const { week, content, dateRange } = req.body;

  if (!week || !content) {
    return res.status(400).json({ error: 'Week number and weekly report content are required.' });
  }

  const weekNum = parseInt(week);

  try {
    const { data: student } = await supabase
      .from('students')
      .select('name, student_code, company, position')
      .eq('id', studentId)
      .maybeSingle();

    const reportData = {
      student_id: studentId,
      student_name: student?.name || 'Alex Johnson',
      student_code: student?.student_code || '66160138',
      company: student?.company || 'TechNova Solutions',
      position: student?.position || 'Frontend Developer Intern',
      week: weekNum,
      date_range: dateRange || `Week ${weekNum} Period`,
      content: content.trim(),
      submitted_date: new Date().toISOString().split('T')[0],
      status: 'pending',
    };

    const { data: existingReport } = await supabase
      .from('reports')
      .select('id')
      .eq('student_id', studentId)
      .eq('week', weekNum)
      .maybeSingle();

    let reportId = existingReport?.id;
    if (!reportId) {
      const { data: maxR } = await supabase
        .from('reports')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();
      reportId = (maxR?.id || 0) + 1;
    }
    reportData.id = reportId;

    const { data: saved, error } = await supabase
      .from('reports')
      .upsert(reportData, { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (!error && saved) {
      const formatted = {
        id: saved.id,
        studentId: saved.student_id,
        studentName: saved.student_name,
        company: saved.company,
        week: saved.week,
        dateRange: saved.date_range,
        content: saved.content,
        submittedDate: saved.submitted_date,
        status: saved.status,
      };
      return res.status(201).json({ message: `Weekly report for Week ${weekNum} saved to Supabase!`, report: formatted });
    }
  } catch (err) {
    console.warn('Supabase submitReport fallback:', err.message);
  }

  // Fallback to mock data
  const student = mockStudents.find((s) => s.id === studentId);
  let existingIndex = mockReports.findIndex(
    (r) => r.studentId === studentId && r.week === weekNum
  );

  const reportData = {
    id: existingIndex !== -1 ? mockReports[existingIndex].id : Date.now(),
    studentId,
    studentName: student?.name || 'Alex Johnson',
    company: student?.company || 'TechNova Solutions',
    week: weekNum,
    dateRange: dateRange || `Week ${weekNum} Period`,
    content: content.trim(),
    submittedDate: new Date().toISOString().split('T')[0],
    status: 'pending',
  };

  if (existingIndex !== -1) {
    mockReports[existingIndex] = reportData;
    res.json({
      message: `Weekly report for Week ${weekNum} updated successfully.`,
      report: reportData,
    });
  } else {
    mockReports.unshift(reportData);
    res.status(201).json({
      message: `Weekly report for Week ${weekNum} submitted successfully.`,
      report: reportData,
    });
  }
};

module.exports = {
  getStudentReports,
  submitReport,
};
