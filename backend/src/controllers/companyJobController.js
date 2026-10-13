const supabase = require('../config/supabase');

// GET /api/companies/jobs
const getJobs = async (req, res) => {
  const { status, location, search, companyId } = req.query;

  try {
    let query = supabase.from('jobs').select('*').order('id', { ascending: false });

    if (companyId) query = query.eq('company_id', parseInt(companyId));
    if (status) query = query.eq('status', status);
    if (location) query = query.ilike('location', `%${location}%`);

    const { data: dbJobs, error } = await query;

    if (error) {
      console.error('Supabase getJobs error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    let mapped = (dbJobs || []).map((j) => ({
      id: j.id,
      companyId: j.company_id,
      company: j.company,
      category: j.category,
      title: j.title,
      description: j.description,
      requirements: j.requirements || [],
      skills: j.skills || [],
      location: j.location,
      workMode: j.work_mode,
      salary: j.salary,
      type: j.type,
      applicants: j.applicants || 0,
      status: j.status,
      postedDate: j.posted_date,
    }));

    if (search) {
      const q = search.toLowerCase();
      mapped = mapped.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          (j.category && j.category.toLowerCase().includes(q)) ||
          (j.skills && j.skills.some((s) => s.toLowerCase().includes(q))) ||
          (j.description && j.description.toLowerCase().includes(q))
      );
    }

    return res.json({ jobs: mapped, total: mapped.length });
  } catch (err) {
    console.error('getJobs error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/companies/jobs/:id
const getJobById = async (req, res) => {
  const jobId = parseInt(req.params.id);

  try {
    const { data: j, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!j) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    return res.json({
      id: j.id,
      companyId: j.company_id,
      company: j.company,
      category: j.category,
      title: j.title,
      description: j.description,
      requirements: j.requirements || [],
      skills: j.skills || [],
      location: j.location,
      workMode: j.work_mode,
      salary: j.salary,
      type: j.type,
      applicants: j.applicants || 0,
      status: j.status,
      postedDate: j.posted_date,
    });
  } catch (err) {
    console.error('getJobById error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

// POST /api/companies/jobs
const createJob = async (req, res) => {
  const {
    title,
    category,
    description,
    requirements,
    skills,
    location,
    workMode,
    salary,
    type,
    companyId,
    company: customCompany,
  } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required.' });
  }

  let parsedReqs = requirements;
  if (typeof requirements === 'string') {
    parsedReqs = requirements.split('\n').map((r) => r.trim()).filter(Boolean);
  } else if (!Array.isArray(requirements)) {
    parsedReqs = [];
  }

  let parsedSkills = skills;
  if (typeof skills === 'string') {
    parsedSkills = skills.split(',').map((s) => s.trim()).filter(Boolean);
  } else if (!Array.isArray(skills)) {
    parsedSkills = [];
  }

  const company = customCompany || req.user?.name || 'Company';

  try {
    const { data: maxJ } = await supabase
      .from('jobs')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextId = (maxJ?.id || 0) + 1;

    const { data: newJob, error } = await supabase
      .from('jobs')
      .insert({
        id: nextId,
        company_id: companyId ? parseInt(companyId) : (req.user?.id || 1),
        company,
        category: category || 'Software & Web',
        title,
        description,
        requirements: parsedReqs,
        skills: parsedSkills,
        location: location || 'Bangkok',
        work_mode: workMode || 'Hybrid',
        salary: salary || '15,000 THB/month',
        type: type || 'Full-time Internship',
        applicants: 0,
        status: 'open',
        posted_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Supabase createJob error:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({
      message: 'Job listing posted successfully.',
      job: {
        id: newJob.id,
        companyId: newJob.company_id,
        company: newJob.company,
        title: newJob.title,
        category: newJob.category,
        description: newJob.description,
        requirements: newJob.requirements,
        skills: newJob.skills,
        location: newJob.location,
        workMode: newJob.work_mode,
        salary: newJob.salary,
        type: newJob.type,
        applicants: newJob.applicants || 0,
        status: newJob.status,
        postedDate: newJob.posted_date,
      },
    });
  } catch (err) {
    console.error('createJob error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

// DELETE /api/companies/jobs/:id
const deleteJob = async (req, res) => {
  const jobId = parseInt(req.params.id);

  try {
    const { data, error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId)
      .select()
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Job listing not found.' });
    }

    return res.json({ message: 'Job listing deleted successfully.', job: data });
  } catch (err) {
    console.error('deleteJob error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

// PATCH /api/companies/jobs/:id/status
const toggleJobStatus = async (req, res) => {
  const jobId = parseInt(req.params.id);

  try {
    // Check existing
    const { data: existing, error: findErr } = await supabase
      .from('jobs')
      .select('status')
      .eq('id', jobId)
      .maybeSingle();

    if (findErr) return res.status(500).json({ error: findErr.message });
    if (!existing) return res.status(404).json({ error: 'Job listing not found.' });

    const nextStatus = req.body.status || (existing.status === 'open' ? 'closed' : 'open');

    const { data, error } = await supabase
      .from('jobs')
      .update({ status: nextStatus })
      .eq('id', jobId)
      .select()
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ message: 'Job status updated.', job: data });
  } catch (err) {
    console.error('toggleJobStatus error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  deleteJob,
  toggleJobStatus,
};
