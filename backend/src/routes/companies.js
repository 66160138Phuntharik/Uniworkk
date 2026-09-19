const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
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
} = require('../controllers/companyController');

// Company Profile
router.get('/profile', verifyToken, requireRole('company'), getCompanyProfile);
router.put('/profile', verifyToken, requireRole('company'), updateCompanyProfile);

// Jobs Management
router.get('/jobs', getJobs);
router.get('/jobs/:id', getJobById);
router.post('/jobs', verifyToken, requireRole('company'), createJob);
router.delete('/jobs/:id', verifyToken, requireRole('company'), deleteJob);
router.patch('/jobs/:id/status', verifyToken, requireRole('company'), toggleJobStatus);

// Applicants Management
router.get('/applicants', verifyToken, requireRole('company'), getApplicants);
router.get('/:id/applicants', verifyToken, requireRole('company'), getApplicants);
router.patch(
  '/applicants/:applicantId/status',
  verifyToken,
  requireRole('company'),
  updateApplicantStatus
);

module.exports = router;
