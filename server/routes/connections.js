const express = require('express');
const router = express.Router();
const Connection = require('../models/Connection');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { authenticateToken } = require('../middleware/auth');

// @route   POST /api/connections/send-request
// @desc    Send connection request
// @access  Private
router.post('/send-request', authenticateToken, async (req, res) => {
  try {
    const { recipientId, message } = req.body;
    const requesterId = req.user.id;

    // Check if trying to connect to self
    if (requesterId === recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send connection request to yourself'
      });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId }
      ]
    });

    if (existingConnection) {
      return res.status(400).json({
        success: false,
        message: 'Connection request already exists or you are already connected'
      });
    }

    // Create connection request
    const connection = await Connection.create({
      requester: requesterId,
      recipient: recipientId,
      message: message || ''
    });

    // Populate requester info for response
    await connection.populate('requester', 'profile.firstName profile.lastName profile.profileImage profile.headline role');

    // Create notification
    await Notification.createNotification({
      recipient: recipientId,
      sender: requesterId,
      type: 'connection_request',
      title: 'New Connection Request',
      message: `${req.user.profile.firstName} ${req.user.profile.lastName} wants to connect with you`,
      sourceId: connection._id,
      sourceModel: 'Connection',
      actionUrl: `/connections/requests`,
      imageUrl: req.user.profile.profileImage
    });

    // Send real-time notification if socket service is available
    if (global.socketService) {
      global.socketService.sendNotificationToUser(recipientId, {
        type: 'connection_request',
        connection: connection
      });
    }

    res.status(201).json({
      success: true,
      message: 'Connection request sent successfully',
      data: connection
    });

  } catch (error) {
    console.error('Send connection request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send connection request'
    });
  }
});

// @route   PUT /api/connections/respond/:requestId
// @desc    Respond to connection request (accept/decline)
// @access  Private
router.put('/respond/:requestId', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { response } = req.body; // 'accepted' or 'declined'
    const userId = req.user.id;

    if (!['accepted', 'declined'].includes(response)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid response. Must be "accepted" or "declined"'
      });
    }

    // Find connection request
    const connection = await Connection.findById(requestId);
    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found'
      });
    }

    // Check if user is the recipient
    if (connection.recipient.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this request'
      });
    }

    // Check if already responded
    if (connection.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Connection request already responded to'
      });
    }

    // Update connection status
    connection.status = response;
    await connection.save();

    // If accepted, update connection counts
    if (response === 'accepted') {
      await User.findByIdAndUpdate(connection.requester, { $inc: { connectionCount: 1 } });
      await User.findByIdAndUpdate(connection.recipient, { $inc: { connectionCount: 1 } });
    }

    // Populate connection details
    await connection.populate('requester recipient', 'profile.firstName profile.lastName profile.profileImage profile.headline role');

    // Create notification for requester
    const notificationMessage = response === 'accepted' 
      ? `${req.user.profile.firstName} ${req.user.profile.lastName} accepted your connection request`
      : `${req.user.profile.firstName} ${req.user.profile.lastName} declined your connection request`;

    await Notification.createNotification({
      recipient: connection.requester,
      sender: userId,
      type: `connection_${response}`,
      title: response === 'accepted' ? 'Connection Accepted' : 'Connection Declined',
      message: notificationMessage,
      sourceId: connection._id,
      sourceModel: 'Connection',
      actionUrl: response === 'accepted' ? `/profile/${userId}` : `/connections`,
      imageUrl: req.user.profile.profileImage
    });

    // Send real-time notification
    if (global.socketService) {
      global.socketService.sendNotificationToUser(connection.requester, {
        type: `connection_${response}`,
        connection: connection
      });
    }

    res.json({
      success: true,
      message: `Connection request ${response} successfully`,
      data: connection
    });

  } catch (error) {
    console.error('Respond to connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to respond to connection request'
    });
  }
});

// @route   GET /api/connections/my-connections
// @desc    Get user's connections
// @access  Private
router.get('/my-connections', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const connections = await Connection.getUserConnections(userId, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    // Format response to show the other user in each connection
    const formattedConnections = connections.map(connection => {
      const otherUser = connection.requester._id.toString() === userId 
        ? connection.recipient 
        : connection.requester;
      
      return {
        _id: connection._id,
        user: otherUser,
        connectionDate: connection.connectionDate,
        createdAt: connection.createdAt
      };
    });

    res.json({
      success: true,
      data: formattedConnections,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(formattedConnections.length / parseInt(limit)),
        totalConnections: formattedConnections.length
      }
    });

  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch connections'
    });
  }
});

// @route   GET /api/connections/pending-requests
// @desc    Get pending connection requests (sent and received)
// @access  Private
router.get('/pending-requests', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get received requests
    const receivedRequests = await Connection.find({
      recipient: userId,
      status: 'pending'
    })
    .populate('requester', 'profile.firstName profile.lastName profile.profileImage profile.headline role')
    .sort({ createdAt: -1 });

    // Get sent requests
    const sentRequests = await Connection.find({
      requester: userId,
      status: 'pending'
    })
    .populate('recipient', 'profile.firstName profile.lastName profile.profileImage profile.headline role')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        received: receivedRequests,
        sent: sentRequests
      }
    });

  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending requests'
    });
  }
});

// @route   DELETE /api/connections/remove/:connectionId
// @desc    Remove connection
// @access  Private
router.delete('/remove/:connectionId', authenticateToken, async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user.id;

    // Find connection
    const connection = await Connection.findById(connectionId);
    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }

    // Check if user is part of this connection
    if (connection.requester.toString() !== userId && connection.recipient.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove this connection'
      });
    }

    // Remove connection
    await Connection.findByIdAndDelete(connectionId);

    // Update connection counts if connection was accepted
    if (connection.status === 'accepted') {
      await User.findByIdAndUpdate(connection.requester, { $inc: { connectionCount: -1 } });
      await User.findByIdAndUpdate(connection.recipient, { $inc: { connectionCount: -1 } });
    }

    res.json({
      success: true,
      message: 'Connection removed successfully'
    });

  } catch (error) {
    console.error('Remove connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove connection'
    });
  }
});

// @route   GET /api/connections/suggestions
// @desc    Get connection suggestions
// @access  Private
router.get('/suggestions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    // Get user's existing connections
    const existingConnections = await Connection.find({
      $or: [
        { requester: userId },
        { recipient: userId }
      ]
    });

    // Extract connected user IDs
    const connectedUserIds = existingConnections.map(conn => 
      conn.requester.toString() === userId ? conn.recipient : conn.requester
    );
    connectedUserIds.push(userId); // Exclude self

    // Get current user's profile for matching
    const currentUser = await User.findById(userId);

    // Find suggested users based on common skills, location, or role
    const suggestions = await User.find({
      _id: { $nin: connectedUserIds },
      $or: [
        { 'profile.skills': { $in: currentUser.profile.skills } },
        { 'profile.location': currentUser.profile.location },
        { role: currentUser.role === 'candidate' ? 'recruiter' : 'candidate' }
      ]
    })
    .select('profile.firstName profile.lastName profile.profileImage profile.headline profile.skills profile.location role connectionCount')
    .limit(parseInt(limit))
    .sort({ connectionCount: -1 });

    res.json({
      success: true,
      data: suggestions
    });

  } catch (error) {
    console.error('Get connection suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch connection suggestions'
    });
  }
});

// @route   GET /api/connections/status/:userId
// @desc    Get connection status with specific user
// @access  Private
router.get('/status/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const currentUserId = req.user.id;

    const status = await Connection.getConnectionStatus(currentUserId, targetUserId);

    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('Get connection status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get connection status'
    });
  }
});

module.exports = router;