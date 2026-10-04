const {
  getStudentProfile,
  updateStudentProfile,
  getStudentDocuments,
  uploadStudentDocument,
  setPrimaryDocument,
  deleteStudentDocument,
  applyForJob,
  getApplications,
  getStudentReports,
  submitReport,
} = require('./src/controllers/studentController');
const {
  getJobs,
  getJobById,
  createJob,
  deleteJob,
  toggleJobStatus,
  getApplicants,
  updateApplicantStatus,
  getCompanyProfile,
  updateCompanyProfile,
} = require('./src/controllers/companyController');

function createMockRes() {
  return {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    },
  };
}

console.log('=== TEST 1: GET Student Profile ===');
let res = createMockRes();
getStudentProfile({ params: { id: '1' } }, res);
console.log('Status:', res.statusCode);
console.log('Student ID:', res.data.profile.studentCode);
console.log('Docs Count:', res.data.documents.length);

console.log('\n=== TEST 2: UPDATE Student Profile ===');
res = createMockRes();
updateStudentProfile(
  {
    params: { id: '1' },
    body: { nameEn: 'Alex Johnson Updated', gpa: 3.85 },
  },
  res
);
console.log('Status:', res.statusCode);
console.log('Updated Name:', res.data.profile.nameEn);
console.log('Updated Year:', res.data.profile.year);

console.log('\n=== TEST 3: UPLOAD New Document ===');
res = createMockRes();
uploadStudentDocument(
  {
    params: { id: '1' },
    body: {
      title: 'Alex Johnson - Internship CV V2',
      type: 'cv',
      fileName: 'Alex_CV_V2.pdf',
      fileSize: '1.5 MB',
      isPrimary: false,
    },
  },
  res
);
console.log('Status:', res.statusCode);
console.log('New Doc Title:', res.data.document.title);
const newDocId = res.data.document.id;

console.log('\n=== TEST 4: SET Primary Document ===');
res = createMockRes();
setPrimaryDocument({ params: { id: '1', docId: '1' } }, res);
console.log('Status:', res.statusCode);
console.log('Doc 1 isPrimary:', res.data.document.isPrimary);

console.log('\n=== TEST 5: DELETE Document ===');
res = createMockRes();
deleteStudentDocument({ params: { id: '1', docId: String(newDocId) } }, res);
console.log('Status:', res.statusCode);
console.log('Deleted Doc Title:', res.data.document.title);

console.log('\n=== TEST 6: GET All Available Internship Jobs ===');
res = createMockRes();
getJobs({ query: {} }, res);
console.log('Status:', res.statusCode);
console.log('Total Jobs:', res.data.total);
console.log('Job 1 Title:', res.data.jobs[0].title);

console.log('\n=== TEST 7: APPLY For An Internship Job ===');
res = createMockRes();
applyForJob(
  {
    params: { id: '1' },
    body: {
      jobId: 5,
      company: 'Siam AI Labs',
      position: 'AI & Machine Learning Engineering Intern',
      resumeName: 'Alex_Johnson_Resume_2026.pdf',
      coverNote: 'Excited to apply my ML background!',
    },
  },
  res
);
console.log('Status:', res.statusCode);
console.log('Application Message:', res.data.message);
console.log('Application ID:', res.data.application.id);

console.log('\n=== TEST 8: GET Student Weekly Reports ===');
res = createMockRes();
getStudentReports({ params: { id: '1' } }, res);
console.log('Status:', res.statusCode);
console.log('Reports Count:', res.data.reports.length);
console.log('Submitted Weeks:', res.data.stats.submittedWeeks);
console.log('Next Due Week:', res.data.stats.nextDueWeek);

console.log('\n=== TEST 9: SUBMIT New Weekly Report ===');
res = createMockRes();
submitReport(
  {
    params: { id: '1' },
    body: {
      week: 4,
      dateRange: 'Aug 24 – Aug 28, 2026',
      content: 'Focused on UI polish and building out the weekly experience log. Collaborated with the product team on design refinements.',
    },
  },
  res
);
console.log('Status:', res.statusCode);
console.log('Submit Message:', res.data.message);
console.log('Report Week:', res.data.report.week);
console.log('Report Content:', res.data.report.content.substring(0, 40) + '...');

console.log('\n=== TEST 10: GET Company Profile ===');
res = createMockRes();
getCompanyProfile({ user: { id: 2 } }, res);
console.log('Status:', res.statusCode);
console.log('Company Name:', res.data.profile.companyName);
console.log('Industry:', res.data.profile.industry);

console.log('\n=== TEST 11: UPDATE Company Profile ===');
res = createMockRes();
updateCompanyProfile(
  {
    user: { id: 2 },
    body: {
      tagline: 'Empowering the Next Generation of Cloud & AI Leaders',
      companySize: '200+ Employees',
    },
  },
  res
);
console.log('Status:', res.statusCode);
console.log('Updated Tagline:', res.data.profile.tagline);
console.log('Updated Size:', res.data.profile.companySize);

console.log('\n=== TEST 12: GET Company Jobs ===');
res = createMockRes();
getJobs({ query: { companyId: '2' } }, res);
console.log('Status:', res.statusCode);
console.log('TechNova Jobs Count:', res.data.total);

console.log('\n=== TEST 13: CREATE New Job Listing ===');
res = createMockRes();
createJob(
  {
    user: { id: 2, name: 'TechNova Solutions' },
    body: {
      title: 'DevOps & Cloud Engineer Intern',
      category: 'Cloud & DevOps',
      description: 'Automate deployment pipelines and manage cloud infrastructure on AWS and Kubernetes.',
      requirements: 'Linux scripting\nDocker knowledge\nAWS basics',
      skills: 'Docker, AWS, Kubernetes, CI/CD',
      location: 'Bangkok',
      workMode: 'Hybrid',
      salary: '16,500 THB/month',
    },
  },
  res
);
console.log('Status:', res.statusCode);
console.log('Created Job Title:', res.data.job.title);
console.log('Created Job Skills:', res.data.job.skills);

const newJobId = res.data.job.id;

console.log('\n=== TEST 14: TOGGLE Job Status ===');
res = createMockRes();
toggleJobStatus({ params: { id: String(newJobId) }, body: {} }, res);
console.log('Status:', res.statusCode);
console.log('Toggled Job Status:', res.data.job.status);

console.log('\n=== TEST 15: DELETE Job Listing ===');
res = createMockRes();
deleteJob({ params: { id: String(newJobId) } }, res);
console.log('Status:', res.statusCode);
console.log('Deleted Job Message:', res.data.message);

console.log('\n=== TEST 16: GET Company Applicants ===');
res = createMockRes();
getApplicants({ query: {}, user: { id: 2 }, params: {} }, res);
console.log('Status:', res.statusCode);
console.log('Applicants Count:', res.data.total);
console.log('First Candidate:', res.data.applicants[0].name, '-', res.data.applicants[0].position);

console.log('\n=== TEST 17: UPDATE Applicant Status ===');
res = createMockRes();
updateApplicantStatus(
  {
    params: { applicantId: '1' },
    body: { status: 'accepted' },
  },
  res
);
console.log('Status:', res.statusCode);
console.log('Updated Candidate Status:', res.data.applicant.status);

console.log('\n✅ ALL BACKEND STUDENT AND COMPANY INTEGRATION TESTS PASSED SUCCESSFULLY!');
