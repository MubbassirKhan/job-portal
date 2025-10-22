const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: [true, 'Chat ID is required']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender is required']
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  messageType: {
    type: String,
    enum: ['text', 'file', 'image', 'system'],
    default: 'text'
  },
  fileUrl: {
    type: String
  },
  fileName: {
    type: String
  },
  fileSize: {
    type: Number
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  originalContent: {
    type: String
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ chatId: 1, isDeleted: 1, createdAt: -1 });

// Virtual for formatted timestamp
messageSchema.virtual('formattedTime').get(function() {
  return this.createdAt.toLocaleTimeString();
});

// Pre-save middleware
messageSchema.pre('save', function(next) {
  if (this.isModified('content') && !this.isNew) {
    this.isEdited = true;
    this.editedAt = new Date();
    if (!this.originalContent) {
      this.originalContent = this.content;
    }
  }
  next();
});

// Post-save middleware to update chat's last activity
messageSchema.post('save', async function() {
  try {
    const Chat = mongoose.model('Chat');
    await Chat.findByIdAndUpdate(this.chatId, {
      lastMessage: this._id,
      lastActivity: new Date()
    });
  } catch (error) {
    console.error('Error updating chat last activity:', error);
  }
});

// Static method to get chat messages
messageSchema.statics.getChatMessages = async function(chatId, options = {}) {
  const { page = 1, limit = 50 } = options;
  
  return await this.find({
    chatId: chatId,
    isDeleted: false
  })
  .populate('sender', 'profile.firstName profile.lastName profile.profileImage role')
  .populate('replyTo')
  .sort({ createdAt: -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit);
};

// Method to mark message as read by user
messageSchema.methods.markAsRead = async function(userId) {
  const existingRead = this.readBy.find(r => r.user.toString() === userId.toString());
  
  if (!existingRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
    return await this.save();
  }
  
  return this;
};

// Method to soft delete message
messageSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.content = 'This message was deleted';
  return await this.save();
};

// Static method to get unread message count for user in chat
messageSchema.statics.getUnreadCount = async function(chatId, userId) {
  return await this.countDocuments({
    chatId: chatId,
    sender: { $ne: userId },
    isDeleted: false,
    'readBy.user': { $ne: userId }
  });
};

module.exports = mongoose.model('Message', messageSchema);