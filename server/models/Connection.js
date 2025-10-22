const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requester is required']
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'blocked'],
    default: 'pending'
  },
  connectionDate: {
    type: Date
  },
  message: {
    type: String,
    maxlength: [300, 'Connection message cannot exceed 300 characters']
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to prevent duplicate connections
connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });

// Index for efficient queries
connectionSchema.index({ recipient: 1, status: 1 });
connectionSchema.index({ requester: 1, status: 1 });
connectionSchema.index({ status: 1, createdAt: -1 });

// Virtual to get the other user in the connection
connectionSchema.virtual('otherUser').get(function() {
  // This will be populated based on context in the application
  return null;
});

// Pre-save middleware to set connection date when accepted
connectionSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'accepted') {
    this.connectionDate = new Date();
    this.respondedAt = new Date();
  }
  if (this.isModified('status') && this.status === 'declined') {
    this.respondedAt = new Date();
  }
  next();
});

// Static method to check if users are connected
connectionSchema.statics.areConnected = async function(userId1, userId2) {
  const connection = await this.findOne({
    $or: [
      { requester: userId1, recipient: userId2, status: 'accepted' },
      { requester: userId2, recipient: userId1, status: 'accepted' }
    ]
  });
  return !!connection;
};

// Static method to get connection status between two users
connectionSchema.statics.getConnectionStatus = async function(userId1, userId2) {
  const connection = await this.findOne({
    $or: [
      { requester: userId1, recipient: userId2 },
      { requester: userId2, recipient: userId1 }
    ]
  });
  
  if (!connection) return null;
  
  return {
    status: connection.status,
    requester: connection.requester.toString(),
    recipient: connection.recipient.toString(),
    connectionId: connection._id
  };
};

// Static method to get user's connections
connectionSchema.statics.getUserConnections = async function(userId, options = {}) {
  const { page = 1, limit = 20, populate = true } = options;
  
  const query = {
    $or: [
      { requester: userId, status: 'accepted' },
      { recipient: userId, status: 'accepted' }
    ]
  };
  
  let connections = this.find(query)
    .sort({ connectionDate: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
    
  if (populate) {
    connections = connections.populate('requester recipient', 'profile.firstName profile.lastName profile.profileImage profile.headline role');
  }
  
  return await connections;
};

module.exports = mongoose.model('Connection', connectionSchema);