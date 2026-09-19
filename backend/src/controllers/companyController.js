const {
  getJobs,
  getJobById,
  createJob,
  deleteJob,
  toggleJobStatus,
} = require('./companyJobController');

const {
  getApplicants,
  updateApplicantStatus,
} = require('./companyApplicantController');

const {
  getCompanyProfile,
  updateCompanyProfile,
} = require('./companyProfileController');

module.exports = {
  // Job Postings & Management
  getJobs,
  getJobById,
  createJob,
  deleteJob,
  toggleJobStatus,

  // Candidate Applicants Pipeline
  getApplicants,
  updateApplicantStatus,

  // Company Profile
  getCompanyProfile,
  updateCompanyProfile,
};
