const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Connection = require('../models/Connection');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/chat/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// @route   GET /api/chat/conversations
// @desc    Get user's chat conversations
// @access  Private
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const chats = await Chat.getUserChats(userId, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    // Add unread message count for each chat
    const chatsWithUnreadCount = await Promise.all(
      chats.map(async (chat) => {
        const unreadCount = await Message.getUnreadCount(chat._id, userId);
        
        // Get the other participant(s) info
        const otherParticipants = chat.participants.filter(
          p => p._id.toString() !== userId
        );

        return {
          ...chat.toObject(),
          unreadCount,
          otherParticipants
        };
      })
    );

    res.json({
      success: true,
      data: chatsWithUnreadCount,
      pagination: {
        currentPage: parseInt(page),
        totalChats: chatsWithUnreadCount.length
      }
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
});

// @route   POST /api/chat/start
// @desc    Start a new conversation or get existing one
// @access  Private
router.post('/start', authenticateToken, async (req, res) => {
  try {
    const { participantId } = req.body;
    const userId = req.user.id;

    console.log('Starting conversation between:', userId, 'and', participantId);
    console.log('User role:', req.user.role);

    // Check if trying to chat with self
    if (userId === participantId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot start conversation with yourself'
      });
    }

    // Check if users are connected (for security) - Allow admin users
    const areConnected = await Connection.areConnected(userId, participantId);
    console.log('Are users connected:', areConnected);
    
    if (!areConnected && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only message connected users'
      });
    }

    // Find or create direct chat
    const chat = await Chat.findOrCreateDirectChat(userId, participantId);

    res.json({
      success: true,
      message: 'Conversation ready',
      data: chat
    });

  } catch (error) {
    console.error('Start conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start conversation'
    });
  }
});

// @route   GET /api/chat/:chatId/messages
// @desc    Get messages from a chat
// @access  Private
router.get('/:chatId/messages', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is part of this chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat'
      });
    }

    // Get messages
    const messages = await Message.getChatMessages(chatId, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    // Reverse to show oldest first
    messages.reverse();

    res.json({
      success: true,
      data: messages,
      pagination: {
        currentPage: parseInt(page),
        totalMessages: messages.length
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

// @route   POST /api/chat/:chatId/messages
// @desc    Send a message to a chat
// @access  Private
router.post('/:chatId/messages', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, replyTo } = req.body;
    const userId = req.user.id;

    // Verify user is part of this chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat'
      });
    }

    // Determine message type and content
    let messageType = 'text';
    let fileUrl = null;
    let fileName = null;
    let fileSize = null;
    let messageContent = content;

    if (req.file) {
      messageType = req.file.mimetype.startsWith('image/') ? 'image' : 'file';
      fileUrl = `/uploads/chat/${req.file.filename}`;
      fileName = req.file.originalname;
      fileSize = req.file.size;
      messageContent = fileName; // Use filename as content for file messages
    }

    if (!messageContent) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Create message
    const message = await Message.create({
      chatId,
      sender: userId,
      content: messageContent,
      messageType,
      fileUrl,
      fileName,
      fileSize,
      replyTo: replyTo || null
    });

    // Populate sender and reply info
    await message.populate([
      {
        path: 'sender',
        select: 'profile.firstName profile.lastName profile.profileImage role'
      },
      {
        path: 'replyTo',
        select: 'content sender createdAt',
        populate: {
          path: 'sender',
          select: 'profile.firstName profile.lastName'
        }
      }
    ]);

    // Send real-time message via socket
    if (global.socketService) {
      global.socketService.sendMessageToChat(chatId, message);
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// @route   PUT /api/chat/messages/:messageId/read
// @desc    Mark message as read
// @access  Private
router.put('/messages/:messageId/read', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Verify user is part of the chat
    const chat = await Chat.findById(message.chatId);
    if (!chat || !chat.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Mark as read
    await message.markAsRead(userId);

    res.json({
      success: true,
      message: 'Message marked as read'
    });

  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read'
    });
  }
});

// @route   PUT /api/chat/:chatId/mark-all-read
// @desc    Mark all messages in chat as read
// @access  Private
router.put('/:chatId/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    // Verify user is part of this chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat'
      });
    }

    // Mark all unread messages as read
    await Message.updateMany(
      {
        chatId: chatId,
        sender: { $ne: userId },
        'readBy.user': { $ne: userId }
      },
      {
        $push: {
          readBy: {
            user: userId,
            readAt: new Date()
          }
        }
      }
    );

    res.json({
      success: true,
      message: 'All messages marked as read'
    });

  } catch (error) {
    console.error('Mark all messages as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read'
    });
  }
});

// @route   DELETE /api/chat/messages/:messageId
// @desc    Delete a message (soft delete)
// @access  Private
router.delete('/messages/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user owns the message
    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    // Soft delete the message
    await message.softDelete();

    // Notify via socket
    if (global.socketService) {
      global.socketService.sendMessageToChat(message.chatId, {
        type: 'message_deleted',
        messageId: messageId
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
});

// @route   GET /api/chat/:chatId/info
// @desc    Get chat information
// @access  Private
router.get('/:chatId/info', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findById(chatId)
      .populate('participants', 'profile.firstName profile.lastName profile.profileImage role lastActive isOnline');

    if (!chat || !chat.participants.some(p => p._id.toString() === userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat'
      });
    }

    // Get unread count
    const unreadCount = await Message.getUnreadCount(chatId, userId);

    // Get the other participant(s)
    const otherParticipants = chat.participants.filter(
      p => p._id.toString() !== userId
    );

    res.json({
      success: true,
      data: {
        ...chat.toObject(),
        unreadCount,
        otherParticipants
      }
    });

  } catch (error) {
    console.error('Get chat info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat information'
    });
  }
});

// @route   POST /api/chat/:chatId/typing
// @desc    Send typing indicator (could also be handled via socket)
// @access  Private
router.post('/:chatId/typing', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { isTyping } = req.body;
    const userId = req.user.id;

    // Verify user is part of this chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat'
      });
    }

    // Send typing indicator via socket
    if (global.socketService) {
      global.socketService.io.to(`chat:${chatId}`).emit('chat:user_typing', {
        userId: userId,
        userName: req.user.profile.firstName,
        isTyping: isTyping
      });
    }

    res.json({
      success: true,
      message: 'Typing indicator sent'
    });

  } catch (error) {
    console.error('Send typing indicator error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send typing indicator'
    });
  }
});

module.exports = router;
