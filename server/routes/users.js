const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// @route   GET /api/users/all
// @desc    Get all users with pagination (excluding sensitive data)
// @access  Private
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const currentUserId = req.user.id;

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get all users except current user
    const users = await User.find({ _id: { $ne: currentUserId } })
      .select('profile.firstName profile.lastName profile.profileImage profile.headline profile.company profile.location profile.bio profile.skills role connectionCount createdAt')
      .sort({ connectionCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalUsers = await User.countDocuments({ _id: { $ne: currentUserId } });

    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / parseInt(limit)),
        totalUsers: totalUsers,
        hasNext: skip + users.length < totalUsers,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// @route   GET /api/users/profile/:userId
// @desc    Get user profile by ID
// @access  Private
router.get('/profile/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('profile.firstName profile.lastName profile.profileImage profile.headline profile.company profile.location profile.bio profile.skills profile.education role connectionCount createdAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }
});

// @route   GET /api/users/search
// @desc    Search users by name, company, skills, etc.
// @access  Private
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const currentUserId = req.user.id;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchRegex = new RegExp(q.trim(), 'i');

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Search users by various fields
    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { 'profile.firstName': searchRegex },
        { 'profile.lastName': searchRegex },
        { 'profile.company': searchRegex },
        { 'profile.headline': searchRegex },
        { 'profile.skills': { $in: [searchRegex] } },
        { 'profile.location': searchRegex }
      ]
    })
    .select('profile.firstName profile.lastName profile.profileImage profile.headline profile.company profile.location profile.bio profile.skills role connectionCount')
    .sort({ connectionCount: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    // Get total count for this search
    const totalUsers = await User.countDocuments({
      _id: { $ne: currentUserId },
      $or: [
        { 'profile.firstName': searchRegex },
        { 'profile.lastName': searchRegex },
        { 'profile.company': searchRegex },
        { 'profile.headline': searchRegex },
        { 'profile.skills': { $in: [searchRegex] } },
        { 'profile.location': searchRegex }
      ]
    });

    res.json({
      success: true,
      data: users,
      query: q,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / parseInt(limit)),
        totalUsers: totalUsers,
        hasNext: skip + users.length < totalUsers,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users'
    });
  }
});

module.exports = router;