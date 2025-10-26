const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-aggregate-paginate-v2');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: [2000, 'Post content cannot exceed 2000 characters']
  },
  mediaUrls: [{
    type: String
  }],
  // Store images as base64 strings directly in database
  mediaBase64: [{
    data: {
      type: String // base64 image data
    },
    mimeType: {
      type: String // image/jpeg, image/png, etc.
    },
    filename: {
      type: String // original filename for reference
    }
  }],
  postType: {
    type: String,
    enum: ['text', 'job_share', 'achievement', 'article', 'poll'],
    default: 'text'
  },
  // For job sharing posts
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  // For polls
  pollOptions: [{
    option: {
      type: String,
      maxlength: [100, 'Poll option cannot exceed 100 characters']
    },
    votes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      votedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: {
      type: Date
    },
    likes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      likedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  shares: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    },
    comment: {
      type: String,
      maxlength: [500, 'Share comment cannot exceed 500 characters']
    }
  }],
  visibility: {
    type: String,
    enum: ['public', 'connections', 'private'],
    default: 'public'
  },
  isActive: {
    type: Boolean,
    default: true
  },
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
  // For moderation
  isReported: {
    type: Boolean,
    default: false
  },
  reportCount: {
    type: Number,
    default: 0
  },
  reports: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'harassment', 'fake', 'other']
    },
    description: {
      type: String,
      maxlength: [200, 'Report description cannot exceed 200 characters']
    },
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Recruiter moderation fields
  isHidden: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: {
    type: Date
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deletedAt: {
    type: Date
  },
  // Engagement metrics
  viewCount: {
    type: Number,
    default: 0
  },
  engagementScore: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1, visibility: 1, isActive: 1 });
postSchema.index({ postType: 1, createdAt: -1 });
postSchema.index({ 'likes.user': 1 });
postSchema.index({ engagementScore: -1, createdAt: -1 });

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Virtual for share count
postSchema.virtual('shareCount').get(function() {
  return this.shares.length;
});

// Pre-save middleware to calculate engagement score
postSchema.pre('save', function(next) {
  // Calculate engagement score based on likes, comments, shares
  const likeWeight = 1;
  const commentWeight = 2;
  const shareWeight = 3;
  
  this.engagementScore = (this.likes.length * likeWeight) + 
                        (this.comments.length * commentWeight) + 
                        (this.shares.length * shareWeight);
  
  // Track content edits
  if (this.isModified('content') && !this.isNew) {
    this.isEdited = true;
    this.editedAt = new Date();
    if (!this.originalContent) {
      this.originalContent = this.content;
    }
  }
  
  next();
});

// Static method to get user feed
postSchema.statics.getUserFeed = async function(userId, options = {}) {
  const { page = 1, limit = 10 } = options;
  
  console.log(`Getting feed for user: ${userId}`);
  
  // Get user's connections first
  const Connection = mongoose.model('Connection');
  const connections = await Connection.find({
    $or: [
      { requester: userId, status: 'accepted' },
      { recipient: userId, status: 'accepted' }
    ]
  });
  
  console.log(`Found ${connections.length} connections for user`);
  
  // Extract connected user IDs
  const connectedUserIds = connections.map(conn => {
    return conn.requester.toString() === userId.toString() ? 
      conn.recipient : conn.requester;
  });
  
  // Include user's own posts
  connectedUserIds.push(userId);
  
  console.log(`Connected user IDs: ${connectedUserIds.length}`);
  
  // Aggregation pipeline for feed - Modified to show public posts from all users
  const pipeline = [
    {
      $match: {
        isActive: true,
        $or: [
          // User's own posts (all visibility levels)
          { author: userId },
          // Connected users' posts
          { author: { $in: connectedUserIds }, visibility: { $in: ['public', 'connections'] } },
          // All public posts from any user
          { visibility: 'public' }
        ]
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author'
      }
    },
    {
      $unwind: '$author'
    },
    {
      $lookup: {
        from: 'jobs',
        localField: 'jobId',
        foreignField: '_id',
        as: 'jobDetails'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'likes.user',
        foreignField: '_id',
        as: 'likesUsers'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'comments.user',
        foreignField: '_id',
        as: 'commentsUsers'
      }
    },
    {
      $addFields: {
        likes: {
          $map: {
            input: '$likes',
            as: 'like',
            in: {
              $mergeObjects: [
                '$$like',
                {
                  user: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: '$likesUsers',
                          cond: { $eq: ['$$this._id', '$$like.user'] }
                        }
                      },
                      0
                    ]
                  }
                }
              ]
            }
          }
        },
        comments: {
          $map: {
            input: '$comments',
            as: 'comment',
            in: {
              $mergeObjects: [
                '$$comment',
                {
                  user: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: '$commentsUsers',
                          cond: { $eq: ['$$this._id', '$$comment.user'] }
                        }
                      },
                      0
                    ]
                  }
                }
              ]
            }
          }
        },
        likeCount: { $size: '$likes' },
        commentCount: { $size: '$comments' },
        shareCount: { $size: '$shares' }
      }
    },
    {
      $project: {
        likesUsers: 0,
        commentsUsers: 0
      }
    },
    {
      $sort: { createdAt: -1, engagementScore: -1 }
    },
    {
      $skip: (page - 1) * limit
    },
    {
      $limit: limit
    }
  ];
  
  console.log('Executing aggregation pipeline for feed');
  const result = await this.aggregate(pipeline);
  console.log(`Aggregation returned ${result.length} posts`);
  
  return result;
};

// Method to toggle like
postSchema.methods.toggleLike = async function(userId) {
  const existingLike = this.likes.find(like => like.user.toString() === userId.toString());
  
  if (existingLike) {
    // Remove like
    this.likes = this.likes.filter(like => like.user.toString() !== userId.toString());
  } else {
    // Add like
    this.likes.push({
      user: userId,
      likedAt: new Date()
    });
  }
  
  return await this.save();
};

// Method to add comment
postSchema.methods.addComment = async function(userId, content) {
  this.comments.push({
    user: userId,
    content: content,
    createdAt: new Date()
  });
  
  return await this.save();
};

// Method to delete comment
postSchema.methods.deleteComment = async function(commentId, userId) {
  const comment = this.comments.id(commentId);
  
  if (!comment) {
    throw new Error('Comment not found');
  }
  
  // Check if user owns the comment or the post
  if (comment.user.toString() !== userId.toString() && 
      this.author.toString() !== userId.toString()) {
    throw new Error('Not authorized to delete this comment');
  }
  
  this.comments = this.comments.filter(c => c._id.toString() !== commentId.toString());
  return await this.save();
};

// Method to share post
postSchema.methods.sharePost = async function(userId, comment = '') {
  const existingShare = this.shares.find(share => share.user.toString() === userId.toString());
  
  if (!existingShare) {
    this.shares.push({
      user: userId,
      comment: comment,
      sharedAt: new Date()
    });
  }
  
  return await this.save();
};

// Method to report post
postSchema.methods.reportPost = async function(userId, reason, description = '') {
  const existingReport = this.reports.find(report => report.user.toString() === userId.toString());
  
  if (!existingReport) {
    this.reports.push({
      user: userId,
      reason: reason,
      description: description,
      reportedAt: new Date()
    });
    
    this.reportCount += 1;
    this.isReported = true;
  }
  
  return await this.save();
};

// Plugin for pagination
postSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Post', postSchema);