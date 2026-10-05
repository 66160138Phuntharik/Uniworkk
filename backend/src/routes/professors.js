const express = require('express');
const router = express.Router();

const {
  getStudentList,
  getStudentById,
  getStudentOverview,
} = require('../controllers/professorStudentController');

const {
  getReports,
  getReportById,
  submitReportFeedback,
} = require('../controllers/professorReportController');

// --- Student List Endpoints ---
// GET /api/professors/students - Get all assigned students & stats
router.get('/students', getStudentList);

// GET /api/professors/students/:id - Get single student details & reports
router.get('/students/:id', getStudentById);

// GET /api/professors/overview - Semester overview stats
router.get('/overview', getStudentOverview);

// --- Weekly Reports Endpoints ---
// GET /api/professors/reports - Get all weekly reports (supports ?status=pending|reviewed)
router.get('/reports', getReports);

// GET /api/professors/reports/:reportId - Get single report by ID
router.get('/reports/:reportId', getReportById);

// POST /api/professors/reports/:reportId/feedback - Submit professor comments or feedback
router.post('/reports/:reportId/feedback', submitReportFeedback);

// PATCH /api/professors/reports/:reportId/review - Review/update feedback (alias for testing)
router.patch('/reports/:reportId/review', submitReportFeedback);

module.exports = router;
