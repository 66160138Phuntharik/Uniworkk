const supabase = require('../config/supabase');

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

    if (error) {
      console.error('Supabase getApplicants error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    const studentIds = [...new Set((dbApps || []).map((a) => a.student_id).filter(Boolean))];
    let docMap = {};
    if (studentIds.length > 0) {
      try {
        const { data: docs } = await supabase
          .from('documents')
          .select('student_id, file_name, file_url, is_primary')
          .in('student_id', studentIds);
        (docs || []).forEach((d) => {
          if (!docMap[d.student_id] || d.is_primary) {
            docMap[d.student_id] = d;
          }
          if (d.file_name) {
            docMap[`${d.student_id}_${d.file_name}`] = d;
          }
        });
      } catch (docErr) {
        console.warn('Could not fetch applicant documents:', docErr.message);
      }
    }

    let mapped = (dbApps || []).map((a) => {
      const matchedDoc = docMap[`${a.student_id}_${a.resume_attached}`] || docMap[a.student_id];
      return {
        id: a.id,
        jobId: a.job_id,
        studentId: a.student_id,
        name: a.students?.name || 'Applicant',
        studentCode: a.students?.student_code || '',
        email: a.students?.email || '',
        phone: a.students?.phone || '',
        faculty: a.students?.faculty || 'Informatics',
        major: a.students?.major || 'Computer Science',
        university: 'Burapha University',
        year: a.students?.year || '4th Year',
        gpa: a.students?.gpa ? parseFloat(a.students.gpa) : 3.5,
        company: a.company,
        position: a.position,
        appliedDate: a.date,
        status: a.status,
        resumeAttached: a.resume_attached || matchedDoc?.file_name || 'Resume.pdf',
        resumeUrl: matchedDoc?.file_url || null,
        coverNote: a.cover_note || '',
      };
    });

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
  } catch (err) {
    console.error('getApplicants error:', err.message);
    return res.status(500).json({ error: err.message });
  }
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

    if (error) {
      console.error('Supabase updateApplicantStatus error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    if (!updated) {
      return res.status(404).json({ error: 'Applicant not found.' });
    }

    if (status === 'accepted' && updated.student_id) {
      await supabase
        .from('students')
        .update({
          company: updated.company,
          position: updated.position,
          status: 'placed',
        })
        .eq('id', updated.student_id);
    } else if (status !== 'accepted' && updated.student_id) {
      // If changed away from accepted, check if student has any other accepted application
      const { data: otherAccepted } = await supabase
        .from('applications')
        .select('company, position')
        .eq('student_id', updated.student_id)
        .eq('status', 'accepted')
        .neq('id', updated.id)
        .maybeSingle();

      if (!otherAccepted) {
        await supabase
          .from('students')
          .update({
            company: null,
            position: null,
            status: 'searching',
          })
          .eq('id', updated.student_id);
      }
    }

    return res.json({ message: 'Applicant status updated successfully.', applicant: updated });
  } catch (err) {
    console.error('updateApplicantStatus error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getApplicants,
  updateApplicantStatus,
};
