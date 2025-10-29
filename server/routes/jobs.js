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
const { authenticateToken, requireAdmin, requireRecruiter, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getJobs);
router.get('/:id', optionalAuth, getJob);

// Protected routes (Admin only)
router.post('/', authenticateToken, requireAdmin, createJob);
router.put('/:id', authenticateToken, requireAdmin, updateJob);
router.delete('/:id', authenticateToken, requireAdmin, deleteJob);

// Recruiter routes (for both recruiters and admins)
router.post('/recruiter/create', authenticateToken, requireRecruiter, createJob);
router.put('/recruiter/:id', authenticateToken, requireRecruiter, updateJob);
router.delete('/recruiter/:id', authenticateToken, requireRecruiter, deleteJob);
router.get('/recruiter/my-jobs', authenticateToken, requireRecruiter, getMyJobs);
router.get('/recruiter/stats', authenticateToken, requireRecruiter, getJobStats);

module.exports = router;