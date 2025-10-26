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
const { authenticateToken, requireRecruiter, requireCandidate } = require('../middleware/auth');
const { applicationLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Candidate routes
router.post('/', authenticateToken, requireCandidate, applicationLimiter, applyToJob);
router.get('/my-applications', authenticateToken, requireCandidate, getMyApplications);
router.delete('/:id', authenticateToken, requireCandidate, deleteApplication);

// Recruiter routes
router.get('/recruiter/all', authenticateToken, requireRecruiter, getAllApplications);
router.get('/job/:jobId', authenticateToken, requireRecruiter, getJobApplications);
router.put('/:id/status', authenticateToken, requireRecruiter, updateApplicationStatus);

// Shared routes (with proper authorization checks in controller)
router.get('/:id', authenticateToken, getApplication);

module.exports = router;