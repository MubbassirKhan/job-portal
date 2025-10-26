const express = require('express');
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
  getJobStats
} = require('../controllers/jobController');
const { authenticateToken, requireRecruiter, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getJobs);
router.get('/:id', optionalAuth, getJob);

// Protected routes (Recruiter only)
router.post('/', authenticateToken, requireRecruiter, createJob);
router.put('/:id', authenticateToken, requireRecruiter, updateJob);
router.delete('/:id', authenticateToken, requireRecruiter, deleteJob);
router.get('/recruiter/my-jobs', authenticateToken, requireRecruiter, getMyJobs);
router.get('/recruiter/stats', authenticateToken, requireRecruiter, getJobStats);

module.exports = router;