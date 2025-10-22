const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  type: {
    type: String,
    enum: ['direct', 'group'],
    default: 'direct'
  },
  name: {
    type: String,
    maxlength: [50, 'Chat name cannot exceed 50 characters']
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // For group chats
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
chatSchema.index({ participants: 1, lastActivity: -1 });
chatSchema.index({ participants: 1, type: 1 });

// Virtual for unread message count
chatSchema.virtual('unreadCount').get(function() {
  // This will be calculated in the application logic
  return 0;
});

// Static method to find or create direct chat between two users
chatSchema.statics.findOrCreateDirectChat = async function(userId1, userId2) {
  // First try to find existing chat
  let chat = await this.findOne({
    type: 'direct',
    participants: { $all: [userId1, userId2], $size: 2 }
  }).populate('participants', 'profile.firstName profile.lastName profile.profileImage role');
  
  if (!chat) {
    // Create new chat
    chat = await this.create({
      participants: [userId1, userId2],
      type: 'direct'
    });
    
    // Populate the participants
    await chat.populate('participants', 'profile.firstName profile.lastName profile.profileImage role');
  }
  
  return chat;
};

// Static method to get user's chats
chatSchema.statics.getUserChats = async function(userId, options = {}) {
  const { page = 1, limit = 20 } = options;
  
  return await this.find({
    participants: userId,
    isActive: true
  })
  .populate('participants', 'profile.firstName profile.lastName profile.profileImage role lastActive isOnline')
  .populate('lastMessage')
  .sort({ lastActivity: -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit);
};

// Method to add participant (for group chats)
chatSchema.methods.addParticipant = async function(userId) {
  if (!this.participants.includes(userId)) {
    this.participants.push(userId);
    this.lastActivity = new Date();
    return await this.save();
  }
  return this;
};

// Method to remove participant
chatSchema.methods.removeParticipant = async function(userId) {
  this.participants = this.participants.filter(p => p.toString() !== userId.toString());
  this.lastActivity = new Date();
  return await this.save();
};

module.exports = mongoose.model('Chat', chatSchema);