const supabase = require('../config/supabase');

// GET /api/students/:id/applications ดูรายการสมัครฝึกงานของนิสิต
const getApplications = async (req, res) => {
  const studentId = parseInt(req.params.id);

  try {
    const { data: apps, error } = await supabase
      .from('applications')
      .select('*')
      .eq('student_id', studentId)
      .order('id', { ascending: false });

    if (error) {
      console.error('Supabase getApplications error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    const mapped = (apps || []).map((a) => ({
      id: a.id,
      studentId: a.student_id,
      jobId: a.job_id,
      company: a.company,
      position: a.position,
      date: a.date,
      status: a.status,
      resumeAttached: a.resume_attached,
      coverNote: a.cover_note,
    }));

    return res.json({ applications: mapped, total: mapped.length });
  } catch (err) {
    console.error('getApplications error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

// POST /api/students/:id/applications สมัครตำแหน่งฝึกงาน
const applyForJob = async (req, res) => {
  const studentId = parseInt(req.params.id);
  const { jobId, company, position, resumeName, coverNote } = req.body;

  if (!company || !position) {
    return res.status(400).json({ error: 'Company and position are required.' });
  }

  const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  try {
    // Check existing
    let existingQuery = supabase
      .from('applications')
      .select('id')
      .eq('student_id', studentId);

    if (jobId) {
      existingQuery = existingQuery.or(`job_id.eq.${parseInt(jobId)},and(company.eq.${company},position.eq.${position})`);
    } else {
      existingQuery = existingQuery.eq('company', company).eq('position', position);
    }

    const { data: existing } = await existingQuery.maybeSingle();

    if (existing) {
      return res.status(400).json({ error: 'You have already applied for this position.' });
    }

    const { data: maxA } = await supabase
      .from('applications')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();
    let finalResumeAttached = resumeName;
    if (!finalResumeAttached) {
      try {
        const { data: primaryDoc } = await supabase
          .from('documents')
          .select('file_name, title')
          .eq('student_id', studentId)
          .eq('is_primary', true)
          .maybeSingle();
        if (primaryDoc) {
          finalResumeAttached = primaryDoc.file_name || primaryDoc.title;
        }
      } catch (docErr) {
        console.warn('Could not fetch primary doc for application:', docErr.message);
      }
    }

    const { data: newApp, error } = await supabase
      .from('applications')
      .insert({
        id: nextAppId,
        student_id: studentId,
        job_id: jobId ? parseInt(jobId) : null,
        company,
        position,
        date: currentDate,
        status: 'reviewing',
        resume_attached: finalResumeAttached || 'Primary_Resume.pdf',
        cover_note: coverNote || '',
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Supabase applyForJob insert error:', error);
      return res.status(400).json({ error: error.message || 'Failed to submit application to database' });
    }

    if (newApp) {
      // Increment job applicants count if jobId is provided
      if (jobId) {
        try {
          const { data: jobRow } = await supabase
            .from('jobs')
            .select('applicants')
            .eq('id', parseInt(jobId))
            .maybeSingle();
          if (jobRow) {
            await supabase
              .from('jobs')
              .update({ applicants: (jobRow.applicants || 0) + 1 })
              .eq('id', parseInt(jobId));
          }
        } catch (jobErr) {
          console.warn('Increment job applicants warning:', jobErr.message);
        }
      }

      const formatted = {
        id: newApp.id,
        studentId: newApp.student_id,
        jobId: newApp.job_id,
        company: newApp.company,
        position: newApp.position,
        date: newApp.date,
        status: newApp.status,
        resumeAttached: newApp.resume_attached,
        coverNote: newApp.cover_note,
      };
      return res.status(201).json({ message: `Successfully applied to ${company} for ${position}!`, application: formatted });
    }
  } catch (err) {
    console.error('Supabase applyForJob error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getApplications,
  applyForJob,
};
