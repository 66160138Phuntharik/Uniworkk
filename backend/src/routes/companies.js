const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const {
  getJobs,
  getJobById,
  createJob,
  getApplicants,
  updateApplicantStatus,
} = require('../controllers/companyController');

router.get('/jobs', getJobs);

router.get('/jobs/:id', getJobById);

router.post('/jobs', verifyToken, requireRole('company'), createJob);

router.get('/:id/applicants', verifyToken, requireRole('company'), getApplicants);

router.patch(
  '/applicants/:applicantId/status',
  verifyToken,
  requireRole('company'),
  updateApplicantStatus
);

module.exports = router;
