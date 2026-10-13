const supabase = require('./src/config/supabase');
const mock = require('./src/data/mockData');

async function seed() {
  console.log('--- Starting Complete Supabase Database Seeding ---');

  // 1. Seed Company Profiles
  console.log('Seeding company_profiles...');
  for (const cp of mock.mockCompanyProfiles) {
    const payload = {
      id: cp.id,
      company_name: cp.companyName,
      tagline: cp.tagline,
      industry: cp.industry,
      founded_year: cp.foundedYear ? parseInt(cp.foundedYear) : 2018,
      company_size: cp.companySize,
      website: cp.website,
      contact_email: cp.contactEmail,
      contact_phone: cp.contactPhone,
      location: cp.location,
      address: cp.address,
      description: cp.description,
      perks: cp.perks || [],
      tech_stack: cp.techStack || [],
    };
    await supabase.from('company_profiles').upsert(payload, { onConflict: 'id' });
  }

  // 2. Seed Jobs
  console.log('Seeding jobs...');
  for (const j of mock.mockJobs) {
    const payload = {
      id: j.id,
      company_id: j.companyId || 1,
      company: j.company,
      category: j.category,
      title: j.title,
      location: j.location,
      work_mode: j.workMode,
      type: j.type,
      salary: j.salary,
      description: j.description,
      requirements: j.requirements || [],
      skills: j.skills || [],
      applicants: j.applicants || 0,
      status: j.status || 'open',
      posted_date: j.postedDate || '2026-05-10',
    };
    await supabase.from('jobs').upsert(payload, { onConflict: 'id' });
  }

  // 3. Seed Students
  console.log('Seeding students...');
  for (const s of mock.mockStudents) {
    const payload = {
      id: s.id,
      student_code: s.studentCode,
      name: s.name,
      email: s.email,
      phone: s.phone,
      faculty: s.faculty,
      major: s.major,
      year: s.year,
      gpa: s.gpa ? parseFloat(s.gpa) : 3.5,
      status: s.status,
      company: s.company,
      position: s.position,
      supervisor: s.supervisor,
      supervisor_email: s.supervisorEmail,
      start_date: s.startDate,
      end_date: s.endDate,
      assigned_professor: s.assignedProfessor,
    };
    await supabase.from('students').upsert(payload, { onConflict: 'id' });

    // Ensure student_profiles entry
    const profilePayload = {
      id: s.id,
      student_id: s.id,
      student_code: s.studentCode,
      name_th: s.name,
      name_en: s.name,
      faculty: s.faculty,
      department: s.major,
      year: s.year,
      gpa: s.gpa ? parseFloat(s.gpa) : 3.5,
      email: s.email,
    };
    await supabase.from('student_profiles').upsert(profilePayload, { onConflict: 'id' });
  }

  // 4. Seed Applications
  console.log('Seeding applications...');
  for (const a of mock.mockApplications) {
    const payload = {
      id: a.id,
      student_id: a.studentId,
      job_id: a.jobId,
      company: a.company,
      position: a.position,
      date: a.appliedDate || a.date,
      status: a.status,
      resume_attached: a.resumeAttached || 'Primary_Resume.pdf',
      cover_note: a.coverNote || '',
    };
    await supabase.from('applications').upsert(payload, { onConflict: 'id' });
  }

  // 5. Seed Reports
  console.log('Seeding reports...');
  for (const r of mock.mockReports) {
    const payload = {
      id: r.id,
      student_id: r.studentId,
      student_name: r.studentName,
      student_code: r.studentCode || '66160138',
      company: r.company,
      position: r.position,
      week: r.week,
      date_range: r.dateRange,
      content: r.content,
      submitted_date: r.submittedDate,
      status: r.status,
      feedback: r.feedback || '',
      feedback_date: r.feedbackDate || null,
    };
    await supabase.from('reports').upsert(payload, { onConflict: 'id' });
  }

  // 6. Seed Documents
  console.log('Seeding documents...');
  for (const d of mock.mockDocuments) {
    const payload = {
      id: d.id,
      student_id: d.studentId,
      title: d.title,
      type: d.type,
      file_name: d.fileName,
      file_size: d.fileSize,
      file_type: d.fileType,
      file_url: d.fileUrl || null,
      upload_date: d.uploadDate,
      is_primary: d.isPrimary,
      status: d.status || 'verified',
    };
    await supabase.from('documents').upsert(payload, { onConflict: 'id' });
  }

  // 7. Seed Users
  console.log('Seeding users...');
  for (const u of mock.mockUsers) {
    const payload = {
      id: u.id,
      email: u.email.toLowerCase(),
      password: u.password,
      role: u.role,
      name: u.name,
      major: u.major || u.department || u.industry || '',
    };
    await supabase.from('users').upsert(payload, { onConflict: 'id' });
  }

  console.log('--- Database Seeding Complete! ---');
}

seed().catch(console.error);
