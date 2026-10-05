const {
  getStudentList,
  getStudentById,
  getStudentOverview,
} = require('./professorStudentController');

const {
  getReports,
  getReportById,
  submitReportFeedback,
  reviewReport,
} = require('./professorReportController');

module.exports = {
  // Student List & Overview
  getStudentList,
  getStudentById,
  getStudentOverview,

  // Weekly Reports & Reviews
  getReports,
  getReportById,
  submitReportFeedback,
  reviewReport,
};
