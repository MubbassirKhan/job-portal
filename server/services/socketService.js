const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId mapping
  }

  initialize(server) {
    const { Server } = require('socket.io');
    
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.io.use(this.authenticateSocket);
    this.setupEventHandlers();
    
    console.log('Socket.IO initialized successfully');
    return this.io;
  }

  // Middleware to authenticate socket connections
  authenticateSocket = async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      socket.user = user;
      
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  };

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.user.profile.firstName} (${socket.userId})`);
      
      // Store connected user
      this.connectedUsers.set(socket.userId, socket.id);
      this.updateUserOnlineStatus(socket.userId, true);

      // Join user to their personal room for notifications
      socket.join(`user:${socket.userId}`);

      // Handle user events
      this.handleUserEvents(socket);
      
      // Handle chat events
      this.handleChatEvents(socket);
      
      // Handle notification events
      this.handleNotificationEvents(socket);
      
      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userId}`);
        this.connectedUsers.delete(socket.userId);
        this.updateUserOnlineStatus(socket.userId, false);
      });
    });
  }

  handleUserEvents(socket) {
    // User typing indicator (global)
    socket.on('user:typing', (data) => {
      socket.broadcast.emit('user:typing', {
        userId: socket.userId,
        isTyping: data.isTyping
      });
    });

    // User activity update
    socket.on('user:activity', async () => {
      await this.updateUserLastActive(socket.userId);
    });
  }

  handleChatEvents(socket) {
    // Join specific chat room
    socket.on('chat:join', async (chatId) => {
      try {
        // Verify user is part of this chat
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.participants.includes(socket.userId)) {
          socket.emit('error', { message: 'Unauthorized to join this chat' });
          return;
        }
        
        socket.join(`chat:${chatId}`);
        socket.currentChatId = chatId;
        
        // Mark messages as read when joining chat
        await this.markChatMessagesAsRead(chatId, socket.userId);
        
        console.log(`User ${socket.userId} joined chat ${chatId}`);
      } catch (error) {
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Leave chat room
    socket.on('chat:leave', (chatId) => {
      socket.leave(`chat:${chatId}`);
      socket.currentChatId = null;
      console.log(`User ${socket.userId} left chat ${chatId}`);
    });

    // Send message
    socket.on('chat:message', async (data) => {
      try {
        const { chatId, content, messageType = 'text', fileUrl = null } = data;
        
        // Verify user is part of this chat
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.participants.includes(socket.userId)) {
          socket.emit('error', { message: 'Unauthorized to send message to this chat' });
          return;
        }

        // Create message
        const message = await Message.create({
          chatId,
          sender: socket.userId,
          content,
          messageType,
          fileUrl
        });

        // Populate sender info
        await message.populate('sender', 'profile.firstName profile.lastName profile.profileImage role');

        // Send to all chat participants
        this.io.to(`chat:${chatId}`).emit('chat:new_message', message);

        // Send notifications to offline users
        const offlineParticipants = chat.participants.filter(participantId => 
          participantId.toString() !== socket.userId && 
          !this.connectedUsers.has(participantId.toString())
        );

        for (const participantId of offlineParticipants) {
          await this.createNotification({
            recipient: participantId,
            sender: socket.userId,
            type: 'message_received',
            title: 'New Message',
            message: `${socket.user.profile.firstName} sent you a message`,
            sourceId: chatId,
            sourceModel: 'Chat',
            actionUrl: `/chat?chatId=${chatId}`
          });
        }

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator for specific chat
    socket.on('chat:typing', (data) => {
      const { chatId, isTyping } = data;
      socket.to(`chat:${chatId}`).emit('chat:user_typing', {
        userId: socket.userId,
        userName: socket.user.profile.firstName,
        isTyping
      });
    });

    // Mark messages as read
    socket.on('chat:mark_read', async (data) => {
      try {
        const { chatId } = data;
        await this.markChatMessagesAsRead(chatId, socket.userId);
        
        // Notify other participants that messages were read
        socket.to(`chat:${chatId}`).emit('chat:messages_read', {
          userId: socket.userId,
          chatId
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });
  }

  handleNotificationEvents(socket) {
    // Mark notification as read
    socket.on('notification:mark_read', async (notificationId) => {
      try {
        await Notification.findByIdAndUpdate(notificationId, {
          isRead: true,
          readAt: new Date()
        });
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    });

    // Mark all notifications as read
    socket.on('notification:mark_all_read', async () => {
      try {
        await Notification.markAllAsRead(socket.userId);
        socket.emit('notification:all_marked_read');
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    });
  }

  // Helper methods
  async updateUserOnlineStatus(userId, isOnline) {
    try {
      await User.findByIdAndUpdate(userId, { 
        isOnline,
        lastActive: new Date()
      });
    } catch (error) {
      console.error('Error updating user online status:', error);
    }
  }

  async updateUserLastActive(userId) {
    try {
      await User.findByIdAndUpdate(userId, { 
        lastActive: new Date()
      });
    } catch (error) {
      console.error('Error updating user last active:', error);
    }
  }

  async markChatMessagesAsRead(chatId, userId) {
    try {
      await Message.updateMany(
        {
          chatId,
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
    } catch (error) {
      console.error('Error marking chat messages as read:', error);
    }
  }

  async createNotification(data) {
    try {
      const notification = await Notification.createNotification(data);
      
      // Send real-time notification
      this.io.to(`user:${data.recipient}`).emit('notification:new', notification);
      
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  // Public methods for use in routes
  sendNotificationToUser(userId, notification) {
    this.io.to(`user:${userId}`).emit('notification:new', notification);
  }

  sendMessageToChat(chatId, message) {
    this.io.to(`chat:${chatId}`).emit('chat:new_message', message);
  }

  notifyPostUpdate(postId, update) {
    this.io.emit('post:updated', { postId, update });
  }

  notifyNewConnection(userId, connection) {
    this.io.to(`user:${userId}`).emit('connection:new', connection);
  }

  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  getConnectedUsers() {
    return Array.from(this.connectedUsers.keys());
  }
}

// Export singleton instance
module.exports = new SocketService();