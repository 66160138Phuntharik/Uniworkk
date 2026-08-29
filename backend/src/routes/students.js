const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const {
  getStudents,
  getStudentById,
  getApplications,
  submitReport,
} = require('../controllers/studentController');


// api/students
router.get('/', verifyToken, requireRole('professor'), getStudents);


// api/students/:id
router.get('/:id', verifyToken, getStudentById);


// api/students/:id/applications
router.get('/:id/applications', verifyToken, getApplications);


// api/students/:id/reports
router.post('/:id/reports', verifyToken, requireRole('student'), submitReport);

module.exports = router;
