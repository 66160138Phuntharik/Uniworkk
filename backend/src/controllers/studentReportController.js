const supabase = require('../config/supabase');

// GET /api/students/:id/reports ดูรายงานรายสัปดาห์ทั้งหมดของนิสิต
const getStudentReports = async (req, res) => {
  const studentId = parseInt(req.params.id);

  try {
    const { data: student } = await supabase
      .from('students')
      .select('company, position')
      .eq('id', studentId)
      .maybeSingle();

    const { data: acceptedApp } = await supabase
      .from('applications')
      .select('company, position')
      .eq('student_id', studentId)
      .eq('status', 'accepted')
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: reports, error } = await supabase
      .from('reports')
      .select('*')
      .eq('student_id', studentId)
      .order('week', { ascending: false });

    if (error) {
      console.error('Supabase getStudentReports error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    const mapped = (reports || []).map((r) => ({
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

    const placedCompany = student?.company || acceptedApp?.company || mapped[0]?.company || null;
    const placedPosition = student?.position || acceptedApp?.position || mapped[0]?.position || null;

    const latestWeek = mapped.length ? Math.max(...mapped.map((r) => r.week)) : 0;
    const stats = {
      totalWeeksRequired: 16,
      submittedWeeks: mapped.length,
      nextDueWeek: latestWeek + 1 <= 16 ? latestWeek + 1 : 16,
      company: placedCompany || 'Pending Placement',
      position: placedPosition || 'Intern',
      isPlaced: Boolean(placedCompany),
    };

    return res.json({ reports: mapped, stats });
  } catch (err) {
    console.error('getStudentReports error:', err.message);
    return res.status(500).json({ error: err.message });
  }
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

    const { data: acceptedApp } = await supabase
      .from('applications')
      .select('company, position')
      .eq('student_id', studentId)
      .eq('status', 'accepted')
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    const companyFinal = student?.company || acceptedApp?.company || 'Pending Placement';
    const positionFinal = student?.position || acceptedApp?.position || 'Intern';

    const reportData = {
      student_id: studentId,
      student_name: student?.name || 'Student',
      student_code: student?.student_code || '',
      company: companyFinal,
      position: positionFinal,
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

    if (error) {
      console.error('Supabase submitReport error:', error);
      return res.status(400).json({ error: error.message });
    }

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
    return res.status(201).json({ message: `Weekly report for Week ${weekNum} saved successfully!`, report: formatted });
  } catch (err) {
    console.error('submitReport error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getStudentReports,
  submitReport,
};
