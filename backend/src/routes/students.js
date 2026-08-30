const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const {
  getStudents,
  getStudentById,
  getApplications,
  applyForJob,
  submitReport,
  getStudentProfile,
  updateStudentProfile,
  getStudentDocuments,
  uploadStudentDocument,
  deleteStudentDocument,
  setPrimaryDocument,
} = require('../controllers/studentController');

// GET /api/students
router.get('/', verifyToken, requireRole('professor'), getStudents);

// GET /api/students/:id
router.get('/:id', verifyToken, getStudentById);

// GET /api/students/:id/profile
router.get('/:id/profile', verifyToken, getStudentProfile);

// PUT /api/students/:id/profile
router.put('/:id/profile', verifyToken, updateStudentProfile);

// GET /api/students/:id/documents
router.get('/:id/documents', verifyToken, getStudentDocuments);

// POST /api/students/:id/documents
router.post('/:id/documents', verifyToken, uploadStudentDocument);

// DELETE /api/students/:id/documents/:docId
router.delete('/:id/documents/:docId', verifyToken, deleteStudentDocument);

// PATCH /api/students/:id/documents/:docId/primary
router.patch('/:id/documents/:docId/primary', verifyToken, setPrimaryDocument);

// GET /api/students/:id/applications
router.get('/:id/applications', verifyToken, getApplications);

// POST /api/students/:id/applications
router.post('/:id/applications', verifyToken, applyForJob);

// POST /api/students/:id/reports
router.post('/:id/reports', verifyToken, requireRole('student'), submitReport);

module.exports = router;
