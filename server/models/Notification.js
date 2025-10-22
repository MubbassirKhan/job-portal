const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'connection_request',
      'connection_accepted',
      'connection_declined',
      'message_received',
      'post_liked',
      'post_commented',
      'post_shared',
      'job_application',
      'job_status_update',
      'job_posted',
      'comment_liked',
      'mention',
      'post_reported',
      'system'
    ],
    required: [true, 'Notification type is required']
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    maxlength: [300, 'Message cannot exceed 300 characters']
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Source ID is required']
  },
  sourceModel: {
    type: String,
    enum: ['Post', 'Job', 'Connection', 'Chat', 'Message', 'Application', 'User'],
    required: [true, 'Source model is required']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  // For deep linking in the app
  actionUrl: {
    type: String
  },
  // For rich notifications
  imageUrl: {
    type: String
  },
  // For grouping similar notifications
  groupKey: {
    type: String
  },
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // Delivery status
  deliveryStatus: {
    email: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: {
        type: Date
      },
      error: {
        type: String
      }
    },
    push: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: {
        type: Date
      },
      error: {
        type: String
      }
    }
  },
  // Metadata for additional context
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  // Auto-expire notifications after certain time
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient notification queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1, createdAt: -1 });
notificationSchema.index({ sender: 1, createdAt: -1 });
notificationSchema.index({ groupKey: 1, recipient: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for time ago
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffMs = now - this.createdAt;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return this.createdAt.toLocaleDateString();
});

// Pre-save middleware
notificationSchema.pre('save', function(next) {
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  const {
    recipient,
    sender,
    type,
    title,
    message,
    sourceId,
    sourceModel,
    actionUrl,
    imageUrl,
    priority = 'medium',
    metadata = {}
  } = data;
  
  // Create group key for similar notifications
  const groupKey = `${type}_${sourceId}_${recipient}`;
  
  // Check if we should group this notification
  const existingGrouped = await this.findOne({
    groupKey: groupKey,
    isRead: false,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
  });
  
  if (existingGrouped && ['post_liked', 'post_commented'].includes(type)) {
    // Update existing notification instead of creating new one
    existingGrouped.message = message;
    existingGrouped.updatedAt = new Date();
    return await existingGrouped.save();
  }
  
  // Set expiration for certain notification types
  let expiresAt;
  if (['connection_request'].includes(type)) {
    expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  } else if (['job_posted'].includes(type)) {
    expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  }
  
  const notification = await this.create({
    recipient,
    sender,
    type,
    title,
    message,
    sourceId,
    sourceModel,
    actionUrl,
    imageUrl,
    groupKey,
    priority,
    metadata,
    expiresAt
  });
  
  return notification;
};

// Static method to get user notifications
notificationSchema.statics.getUserNotifications = async function(userId, options = {}) {
  const { page = 1, limit = 20, unreadOnly = false } = options;
  
  const query = { recipient: userId };
  if (unreadOnly) {
    query.isRead = false;
  }
  
  return await this.find(query)
    .populate('sender', 'profile.firstName profile.lastName profile.profileImage role')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({
    recipient: userId,
    isRead: false
  });
};

// Static method to mark notifications as read
notificationSchema.statics.markAsRead = async function(userId, notificationIds = null) {
  const query = { recipient: userId, isRead: false };
  
  if (notificationIds) {
    query._id = { $in: notificationIds };
  }
  
  return await this.updateMany(query, {
    isRead: true,
    readAt: new Date()
  });
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = async function(userId) {
  return await this.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

// Method to mark single notification as read
notificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  this.readAt = new Date();
  return await this.save();
};

// Static method to clean up old notifications
notificationSchema.statics.cleanupOldNotifications = async function() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  return await this.deleteMany({
    createdAt: { $lt: thirtyDaysAgo },
    isRead: true
  });
};

// Static method for bulk notification creation
notificationSchema.statics.createBulkNotifications = async function(notifications) {
  return await this.insertMany(notifications);
};

module.exports = mongoose.model('Notification', notificationSchema);