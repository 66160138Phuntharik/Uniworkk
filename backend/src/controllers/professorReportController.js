const supabase = require('../config/supabase');
const { mockReports } = require('../data/mockData');

const getReports = async (req, res) => {
  const { status, studentId, search } = req.query;

  try {
    let query = supabase.from('reports').select('*').order('id', { ascending: false });

    if (status && status !== 'all') query = query.eq('status', status);
    if (studentId) query = query.eq('student_id', parseInt(studentId));

    const { data: dbReports, error } = await query;

    if (!error && dbReports && dbReports.length > 0) {
      let mapped = dbReports.map((r) => ({
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

      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        mapped = mapped.filter(
          (r) =>
            r.studentName.toLowerCase().includes(q) ||
            (r.studentCode && r.studentCode.toLowerCase().includes(q)) ||
            (r.company && r.company.toLowerCase().includes(q)) ||
            (r.content && r.content.toLowerCase().includes(q))
        );
      }

      const pendingCount = mapped.filter((r) => r.status === 'pending').length;
      const reviewedCount = mapped.filter((r) => r.status === 'reviewed').length;

      return res.json({
        reports: mapped,
        total: mapped.length,
        pendingCount,
        reviewedCount,
      });
    }
  } catch (err) {
    console.warn('Supabase getReports fallback:', err.message);
  }

  // Fallback to mock data
  let reports = [...mockReports];
  if (status && status !== 'all') reports = reports.filter((r) => r.status === status);
  if (studentId) reports = reports.filter((r) => r.studentId === parseInt(studentId));
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    reports = reports.filter(
      (r) =>
        r.studentName.toLowerCase().includes(q) ||
        (r.studentCode && r.studentCode.toLowerCase().includes(q)) ||
        (r.company && r.company.toLowerCase().includes(q)) ||
        (r.content && r.content.toLowerCase().includes(q))
    );
  }
  const pendingCount = mockReports.filter((r) => r.status === 'pending').length;
  const reviewedCount = mockReports.filter((r) => r.status === 'reviewed').length;

  res.json({
    reports,
    total: reports.length,
    pendingCount,
    reviewedCount,
  });
};

const getReportById = async (req, res) => {
  const reportId = parseInt(req.params.reportId);

  try {
    const { data: r, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .maybeSingle();

    if (!error && r) {
      return res.json({
        report: {
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
        },
      });
    }
  } catch (err) {
    console.warn('Supabase getReportById fallback:', err.message);
  }

  const report = mockReports.find((r) => r.id === reportId);
  if (!report) {
    return res.status(404).json({ error: 'Report not found.' });
  }
  res.json({ report });
};

const submitReportFeedback = async (req, res) => {
  const reportId = parseInt(req.params.reportId);
  const feedbackText =
    req.body.feedback !== undefined
      ? req.body.feedback
      : req.body.comments !== undefined
      ? req.body.comments
      : '';

  const today = new Date().toISOString().split('T')[0];

  try {
    const { data: updated, error } = await supabase
      .from('reports')
      .update({
        feedback: feedbackText.trim(),
        feedback_date: today,
        status: 'reviewed',
      })
      .eq('id', reportId)
      .select()
      .maybeSingle();

    if (!error && updated) {
      return res.json({
        message: 'Feedback submitted to Supabase successfully.',
        report: {
          id: updated.id,
          studentId: updated.student_id,
          studentName: updated.student_name,
          feedback: updated.feedback,
          status: updated.status,
          feedbackDate: updated.feedback_date,
        },
      });
    }
  } catch (err) {
    console.warn('Supabase submitReportFeedback fallback:', err.message);
  }

  const report = mockReports.find((r) => r.id === reportId);
  if (!report) {
    return res.status(404).json({ error: 'Report not found.' });
  }

  report.feedback = feedbackText.trim();
  report.feedbackDate = today;
  report.status = 'reviewed';

  res.json({
    message: 'Feedback submitted successfully.',
    report,
  });
};

module.exports = {
  getReports,
  getReportById,
  submitReportFeedback,
};
