const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const {
  getStudentOverview,
  getReports,
  reviewReport,
} = require('../controllers/professorController');

// api/professors/student
router.get('/students', verifyToken, requireRole('professor'), getStudentOverview);

// api/professors/reports
router.get('/reports', verifyToken, requireRole('professor'), getReports);

// api/professors/reports/id/review
router.patch(
  '/reports/:reportId/review',
  verifyToken,
  requireRole('professor'),
  reviewReport
);

module.exports = router;
