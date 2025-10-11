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
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getJobs);
router.get('/:id', optionalAuth, getJob);

// Protected routes (Admin only)
router.post('/', authenticateToken, requireAdmin, createJob);
router.put('/:id', authenticateToken, requireAdmin, updateJob);
router.delete('/:id', authenticateToken, requireAdmin, deleteJob);
router.get('/admin/my-jobs', authenticateToken, requireAdmin, getMyJobs);
router.get('/admin/stats', authenticateToken, requireAdmin, getJobStats);

module.exports = router;