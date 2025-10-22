const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authenticateToken } = require('../middleware/auth');

// @route   GET /api/notifications
// @desc    Get user's notifications
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const notifications = await Notification.getUserNotifications(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      unreadOnly: unreadOnly === 'true'
    });

    // Get unread count
    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        currentPage: parseInt(page),
        hasMore: notifications.length === parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// @route   GET /api/notifications/unread-count
// @desc    Get unread notification count
// @access  Private
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      data: { unreadCount }
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count'
    });
  }
});

// @route   PUT /api/notifications/:notificationId/read
// @desc    Mark specific notification as read
// @access  Private
router.put('/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if notification belongs to user
    if (notification.recipient.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark this notification as read'
      });
    }

    // Mark as read
    await notification.markAsRead();

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

// @route   PUT /api/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private
router.put('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.markAllAsRead(userId);

    // Send real-time update
    if (global.socketService) {
      global.socketService.sendNotificationToUser(userId, {
        type: 'all_notifications_read'
      });
    }

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
});

// @route   PUT /api/notifications/mark-selected-read
// @desc    Mark selected notifications as read
// @access  Private
router.put('/mark-selected-read', authenticateToken, async (req, res) => {
  try {
    const { notificationIds } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Notification IDs array is required'
      });
    }

    // Verify all notifications belong to the user
    const notifications = await Notification.find({
      _id: { $in: notificationIds },
      recipient: userId
    });

    if (notifications.length !== notificationIds.length) {
      return res.status(403).json({
        success: false,
        message: 'Some notifications do not belong to you'
      });
    }

    // Mark selected notifications as read
    await Notification.markAsRead(userId, notificationIds);

    res.json({
      success: true,
      message: 'Selected notifications marked as read'
    });

  } catch (error) {
    console.error('Mark selected notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark selected notifications as read'
    });
  }
});

// @route   DELETE /api/notifications/:notificationId
// @desc    Delete notification
// @access  Private
router.delete('/:notificationId', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if notification belongs to user
    if (notification.recipient.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this notification'
      });
    }

    // Delete notification
    await Notification.findByIdAndDelete(notificationId);

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
});

// @route   DELETE /api/notifications/delete-selected
// @desc    Delete selected notifications
// @access  Private
router.delete('/delete-selected', authenticateToken, async (req, res) => {
  try {
    const { notificationIds } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Notification IDs array is required'
      });
    }

    // Verify all notifications belong to the user and delete them
    const deleteResult = await Notification.deleteMany({
      _id: { $in: notificationIds },
      recipient: userId
    });

    res.json({
      success: true,
      message: `${deleteResult.deletedCount} notifications deleted successfully`
    });

  } catch (error) {
    console.error('Delete selected notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete selected notifications'
    });
  }
});

// @route   DELETE /api/notifications/clear-all
// @desc    Clear all notifications for user
// @access  Private
router.delete('/clear-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const deleteResult = await Notification.deleteMany({
      recipient: userId
    });

    res.json({
      success: true,
      message: `All ${deleteResult.deletedCount} notifications cleared successfully`
    });

  } catch (error) {
    console.error('Clear all notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear all notifications'
    });
  }
});

// @route   GET /api/notifications/settings
// @desc    Get user's notification settings
// @access  Private
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const User = require('../models/User');
    
    const user = await User.findById(userId).select('notificationSettings');
    
    res.json({
      success: true,
      data: user.notificationSettings
    });

  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification settings'
    });
  }
});

// @route   PUT /api/notifications/settings
// @desc    Update user's notification settings
// @access  Private
router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, push, connections, messages } = req.body;
    const User = require('../models/User');

    const updateData = {};
    if (typeof email === 'boolean') updateData['notificationSettings.email'] = email;
    if (typeof push === 'boolean') updateData['notificationSettings.push'] = push;
    if (typeof connections === 'boolean') updateData['notificationSettings.connections'] = connections;
    if (typeof messages === 'boolean') updateData['notificationSettings.messages'] = messages;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('notificationSettings');

    res.json({
      success: true,
      message: 'Notification settings updated successfully',
      data: user.notificationSettings
    });

  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification settings'
    });
  }
});

// @route   GET /api/notifications/types
// @desc    Get notification types and their counts
// @access  Private
router.get('/types', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Aggregate notifications by type
    const typeCounts = await Notification.aggregate([
      {
        $match: { recipient: mongoose.Types.ObjectId(userId) }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          unreadCount: {
            $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: typeCounts
    });

  } catch (error) {
    console.error('Get notification types error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification types'
    });
  }
});

// @route   POST /api/notifications/test
// @desc    Create test notification (development only)
// @access  Private
router.post('/test', authenticateToken, async (req, res) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Test notifications not allowed in production'
      });
    }

    const userId = req.user.id;

    const testNotification = await Notification.createNotification({
      recipient: userId,
      sender: userId,
      type: 'system',
      title: 'Test Notification',
      message: 'This is a test notification for development purposes',
      sourceId: userId,
      sourceModel: 'User',
      actionUrl: '/profile',
      priority: 'low'
    });

    // Send real-time notification
    if (global.socketService) {
      global.socketService.sendNotificationToUser(userId, testNotification);
    }

    res.status(201).json({
      success: true,
      message: 'Test notification created',
      data: testNotification
    });

  } catch (error) {
    console.error('Create test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test notification'
    });
  }
});

module.exports = router;
