const express = require('express');
const {
  applyToJob,
  getMyApplications,
  getApplication,
  updateApplicationStatus,
  getAllApplications,
  getJobApplications,
  deleteApplication
} = require('../controllers/applicationController');
const { authenticateToken, requireAdmin, requireCandidate } = require('../middleware/auth');
const { applicationLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Candidate routes
router.post('/', authenticateToken, requireCandidate, applicationLimiter, applyToJob);
router.get('/my-applications', authenticateToken, requireCandidate, getMyApplications);
router.delete('/:id', authenticateToken, requireCandidate, deleteApplication);

// Admin routes
router.get('/admin/all', authenticateToken, requireAdmin, getAllApplications);
router.get('/job/:jobId', authenticateToken, requireAdmin, getJobApplications);
router.put('/:id/status', authenticateToken, requireAdmin, updateApplicationStatus);

// Shared routes (with proper authorization checks in controller)
router.get('/:id', authenticateToken, getApplication);

module.exports = router;