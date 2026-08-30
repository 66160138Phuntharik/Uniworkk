// POST /api/students/:id/reports ส่งรายงานการฝึกงานประจำสัปดาห์
const submitReport = (req, res) => {
  const { week, content, highlights, challenges } = req.body;
  if (!week || !content) {
    return res.status(400).json({ error: 'Week number and content are required.' });
  }

  res.status(201).json({
    message: `Weekly report for Week ${week} submitted successfully.`,
    data: {
      week,
      content,
      highlights,
      challenges,
      studentId: req.params.id,
      submittedAt: new Date().toISOString(),
    },
  });
};

module.exports = {
  submitReport,
};
