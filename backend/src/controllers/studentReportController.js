const { mockReports, mockStudents } = require('../data/mockData');

// GET /api/students/:id/reports ดูรายงานรายสัปดาห์ทั้งหมดของนิสิต
const getStudentReports = (req, res) => {
  const studentId = parseInt(req.params.id);
  const student = mockStudents.find((s) => s.id === studentId);
  const reports = mockReports
    .filter((r) => r.studentId === studentId)
    .sort((a, b) => b.week - a.week);

  const latestWeek = reports.length ? Math.max(...reports.map((r) => r.week)) : 0;

  const stats = {
    totalWeeksRequired: 16,
    submittedWeeks: reports.length,
    nextDueWeek: latestWeek + 1 <= 16 ? latestWeek + 1 : 16,
    company: student?.company || 'TechNova Solutions',
    position: student?.position || 'Frontend Developer Intern',
  };

  res.json({ reports, stats });
};

// POST /api/students/:id/reports ส่งหรือแก้ไขรายงานการฝึกงานประจำสัปดาห์
const submitReport = (req, res) => {
  const studentId = parseInt(req.params.id);
  const { week, content, dateRange } = req.body;

  if (!week || !content) {
    return res.status(400).json({ error: 'Week number and weekly report content are required.' });
  }

  const weekNum = parseInt(week);
  const student = mockStudents.find((s) => s.id === studentId);

  // ตรวจสอบว่าเคยส่งรายงานสัปดาห์นี้ไปแล้วหรือไม่
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
      message: `Weekly report for Week ${weekNum} saved successfully!`,
      report: reportData,
    });
  }
};

module.exports = {
  getStudentReports,
  submitReport,
};
