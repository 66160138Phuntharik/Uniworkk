const supabase = require('../config/supabase');
const { mockJobs } = require('../data/mockData');

// GET /api/companies/jobs
const getJobs = async (req, res) => {
  const { status, location, search, companyId } = req.query;

  try {
    let query = supabase.from('jobs').select('*').order('id', { ascending: false });

    if (companyId) query = query.eq('company_id', parseInt(companyId));
    if (status) query = query.eq('status', status);
    if (location) query = query.ilike('location', `%${location}%`);

    const { data: dbJobs, error } = await query;

    if (!error && dbJobs && dbJobs.length > 0) {
      let mapped = dbJobs.map((j) => ({
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
    }
  } catch (err) {
    console.warn('Supabase getJobs fallback:', err.message);
  }

  // Fallback to mock data
  let jobs = [...mockJobs];
  if (companyId) jobs = jobs.filter((j) => j.companyId === parseInt(companyId));
  if (status) jobs = jobs.filter((j) => j.status === status);
  if (location) jobs = jobs.filter((j) => j.location.toLowerCase().includes(location.toLowerCase()));
  if (search) {
    const q = search.toLowerCase();
    jobs = jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        (j.category && j.category.toLowerCase().includes(q)) ||
        (j.skills && j.skills.some((s) => s.toLowerCase().includes(q))) ||
        (j.description && j.description.toLowerCase().includes(q))
    );
  }
  res.json({ jobs, total: jobs.length });
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

    if (!error && j) {
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
    }
  } catch (err) {
    console.warn('Supabase getJobById fallback:', err.message);
  }

  const job = mockJobs.find((j) => j.id === jobId);
  if (!job) return res.status(404).json({ error: 'Job not found.' });
  res.json(job);
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

  const company = req.user?.name || 'TechNova Solutions';

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
        company_id: req.body.companyId ? parseInt(req.body.companyId) : 1,
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

    if (!error && newJob) {
      return res.status(201).json({
        message: 'Job posted to Supabase successfully.',
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
          status: newJob.status,
          postedDate: newJob.posted_date,
        },
      });
    }
  } catch (err) {
    console.warn('Supabase createJob fallback:', err.message);
  }

  // Fallback
  const fallbackJob = {
    id: mockJobs.length > 0 ? Math.max(...mockJobs.map((j) => j.id)) + 1 : 1,
    companyId: req.user?.id || 2,
    company,
    category: category || 'Software & Web',
    title,
    description,
    requirements: parsedReqs,
    skills: parsedSkills,
    location: location || 'Bangkok',
    workMode: workMode || 'Hybrid',
    salary: salary || '15,000 THB/month',
    type: type || 'Full-time Internship',
    applicants: 0,
    status: 'open',
    postedDate: new Date().toISOString().split('T')[0],
  };

  mockJobs.unshift(fallbackJob);
  res.status(201).json({ message: 'Job posted successfully.', job: fallbackJob });
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

    if (!error && data) {
      return res.json({ message: 'Job listing deleted from Supabase successfully.', job: data });
    }
  } catch (err) {
    console.warn('Supabase deleteJob fallback:', err.message);
  }

  const index = mockJobs.findIndex((j) => j.id === jobId);
  if (index === -1) {
    return res.status(404).json({ error: 'Job listing not found.' });
  }
  const deleted = mockJobs.splice(index, 1)[0];
  res.json({ message: 'Job listing deleted successfully.', job: deleted });
};

// PATCH /api/companies/jobs/:id/status
const toggleJobStatus = async (req, res) => {
  const jobId = parseInt(req.params.id);

  try {
    const nextStatus = req.body.status || 'closed';
    const { data, error } = await supabase
      .from('jobs')
      .update({ status: nextStatus })
      .eq('id', jobId)
      .select()
      .maybeSingle();

    if (!error && data) {
      return res.json({ message: 'Job status updated in Supabase.', job: data });
    }
  } catch (err) {
    console.warn('Supabase toggleJobStatus fallback:', err.message);
  }

  const job = mockJobs.find((j) => j.id === jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job listing not found.' });
  }
  job.status = req.body.status || (job.status === 'open' ? 'closed' : 'open');
  res.json({ message: 'Job status updated.', job });
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  deleteJob,
  toggleJobStatus,
};
