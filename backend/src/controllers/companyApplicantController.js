const supabase = require('../config/supabase');
const { mockApplicants } = require('../data/mockData');

// GET /api/companies/applicants or /api/companies/:id/applicants
const getApplicants = async (req, res) => {
  const targetJobId = req.params.id || req.query.jobId;
  const { status, search, company } = req.query;

  try {
    let query = supabase.from('applications').select('*, students(*)').order('id', { ascending: false });

    if (targetJobId) {
      query = query.eq('job_id', parseInt(targetJobId));
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (company && company !== 'all') {
      query = query.ilike('company', `%${company}%`);
    }

    const { data: dbApps, error } = await query;

    if (!error && dbApps) {
      let mapped = dbApps.map((a) => ({
        id: a.id,
        jobId: a.job_id,
        studentId: a.student_id,
        name: a.students?.name || 'Applicant',
        studentCode: a.students?.student_code || '66160138',
        email: a.students?.email || 'applicant@buu.ac.th',
        phone: a.students?.phone || '+66 89 123 4567',
        faculty: a.students?.faculty || 'Informatics',
        major: a.students?.major || 'Computer Science',
        university: 'Burapha University',
        year: a.students?.year || '4th Year',
        gpa: a.students?.gpa ? parseFloat(a.students.gpa) : 3.5,
        company: a.company,
        position: a.position,
        appliedDate: a.date,
        status: a.status,
        resumeAttached: a.resume_attached || 'Resume.pdf',
        coverNote: a.cover_note || '',
      }));

      if (search) {
        const q = search.toLowerCase();
        mapped = mapped.filter(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            (a.major && a.major.toLowerCase().includes(q)) ||
            (a.position && a.position.toLowerCase().includes(q)) ||
            (a.studentCode && a.studentCode.includes(q)) ||
            (a.company && a.company.toLowerCase().includes(q))
        );
      }

      return res.json({ applicants: mapped, total: mapped.length });
    }
  } catch (err) {
    console.warn('Supabase getApplicants fallback:', err.message);
  }

  // Fallback to mock data
  let applicants = [...mockApplicants];
  if (targetJobId) {
    applicants = applicants.filter((a) => a.jobId === parseInt(targetJobId));
  }
  if (status && status !== 'all') {
    applicants = applicants.filter((a) => a.status === status);
  }
  if (search) {
    const q = search.toLowerCase();
    applicants = applicants.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        (a.major && a.major.toLowerCase().includes(q)) ||
        (a.position && a.position.toLowerCase().includes(q)) ||
        (a.studentCode && a.studentCode.includes(q))
    );
  }
  res.json({ applicants, total: applicants.length });
};

// PATCH /api/companies/applicants/:applicantId/status
const updateApplicantStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['reviewing', 'interviewing', 'accepted', 'rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
    });
  }

  const applicantId = parseInt(req.params.applicantId);

  try {
    const { data: updated, error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', applicantId)
      .select()
      .maybeSingle();

    if (!error && updated) {
      return res.json({ message: 'Applicant status updated in Supabase.', applicant: updated });
    }
  } catch (err) {
    console.warn('Supabase updateApplicantStatus fallback:', err.message);
  }

  const applicant = mockApplicants.find((a) => a.id === applicantId);
  if (!applicant) return res.status(404).json({ error: 'Applicant not found.' });
  applicant.status = status;
  res.json({ message: 'Applicant status updated.', applicant });
};

module.exports = {
  getApplicants,
  updateApplicantStatus,
};
