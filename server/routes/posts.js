const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const Job = require('../models/Job');
const Connection = require('../models/Connection');
const Notification = require('../models/Notification');
const { authenticateToken, requireRecruiter } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// Initialize DOMPurify
const window = new JSDOM('').window;
const purify = DOMPurify(window);

// Configure multer for media uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/posts/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 5 // Maximum 5 files
  },
  fileFilter: function (req, file, cb) {
    // Allow only images and videos
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'));
    }
  }
});

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', authenticateToken, upload.array('media', 5), async (req, res) => {
  try {
    const { content, postType = 'text', visibility = 'public', jobId, pollOptions, mediaBase64 } = req.body;
    const userId = req.user.id;

    console.log('📝 Post creation request received');
    console.log('📷 Media info:', {
      hasFiles: req.files && req.files.length > 0,
      fileCount: req.files ? req.files.length : 0,
      hasBase64: mediaBase64 && Array.isArray(mediaBase64),
      base64Count: mediaBase64 ? mediaBase64.length : 0
    });

    // Sanitize content
    const sanitizedContent = purify.sanitize(content);

    if (!sanitizedContent || sanitizedContent.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Post content is required'
      });
    }

    // Handle media uploads (both file uploads and Base64)
    let mediaUrls = [];
    let mediaBase64Array = [];
    
    console.log('🔄 Processing media...');
    
    // Handle traditional file uploads (convert to base64 for consistency)
    if (req.files && req.files.length > 0) {
      console.log('📁 Processing uploaded files:', req.files.length);
      const fs = require('fs');
      
      for (const file of req.files) {
        try {
          // Read the file and convert to base64
          const fileBuffer = fs.readFileSync(file.path);
          const base64Data = fileBuffer.toString('base64');
          
          mediaBase64Array.push({
            data: base64Data,
            mimeType: file.mimetype,
            filename: file.originalname
          });
          
          console.log('✅ Converted file to base64:', file.originalname);
          
          // Clean up the uploaded file since we're storing base64
          fs.unlinkSync(file.path);
        } catch (error) {
          console.error('❌ Error processing uploaded file:', error);
        }
      }
    }
    
    // Handle Base64 images from client
    if (mediaBase64 && Array.isArray(mediaBase64)) {
      console.log('🎨 Processing base64 images from client:', mediaBase64.length);
      for (const base64Data of mediaBase64) {
        if (base64Data && base64Data.startsWith('data:image/')) {
          try {
            // Extract base64 data and mime type
            const matches = base64Data.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
            if (matches) {
              const mimeType = `image/${matches[1]}`;
              const imageData = matches[2];
              
              mediaBase64Array.push({
                data: imageData,
                mimeType: mimeType,
                filename: `image.${matches[1]}`
              });
              
              console.log('✅ Processed base64 image:', mimeType);
            }
          } catch (error) {
            console.error('❌ Error processing base64 image:', error);
          }
        }
      }
    }
    
    console.log('📊 Final media arrays:', {
      mediaUrlsCount: mediaUrls.length,
      mediaBase64Count: mediaBase64Array.length
    });

    // Validate job share
    if (postType === 'job_share' && jobId) {
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }
    }

    // Handle poll options
    let formattedPollOptions = [];
    if (postType === 'poll' && pollOptions) {
      const options = Array.isArray(pollOptions) ? pollOptions : JSON.parse(pollOptions);
      formattedPollOptions = options.map(option => ({
        option: option.trim(),
        votes: []
      }));
    }

    // Create post
    const post = await Post.create({
      author: userId,
      content: sanitizedContent,
      mediaUrls, // Keep for backward compatibility
      mediaBase64: mediaBase64Array, // Store base64 images in database
      postType,
      visibility,
      jobId: postType === 'job_share' ? jobId : undefined,
      pollOptions: formattedPollOptions
    });

    // Update user's post count
    await User.findByIdAndUpdate(userId, { $inc: { postCount: 1 } });

    // Populate author information
    await post.populate('author', 'profile.firstName profile.lastName profile.profileImage profile.headline role');

    // If job share, populate job details
    if (postType === 'job_share' && jobId) {
      await post.populate('jobId');
    }

    // Notify connections about new post (for public posts)
    if (visibility === 'public' || visibility === 'connections') {
      // Get user's connections
      const connections = await Connection.find({
        $or: [
          { requester: userId, status: 'accepted' },
          { recipient: userId, status: 'accepted' }
        ]
      });

      const connectedUserIds = connections.map(conn => 
        conn.requester.toString() === userId ? conn.recipient : conn.requester
      );

      // Create notifications for connections (limit to avoid spam)
      if (connectedUserIds.length > 0 && connectedUserIds.length <= 50) {
        const notifications = connectedUserIds.map(connectionId => ({
          recipient: connectionId,
          sender: userId,
          type: 'job_posted',
          title: 'New Post',
          message: `${req.user.profile.firstName} ${req.user.profile.lastName} shared a new post`,
          sourceId: post._id,
          sourceModel: 'Post',
          actionUrl: `/post/${post._id}`,
          imageUrl: req.user.profile.profileImage
        }));

        await Notification.createBulkNotifications(notifications);
      }
    }

    // Send real-time update
    if (global.socketService) {
      global.socketService.notifyPostUpdate(post._id, { type: 'new_post', post });
    }

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post
    });

  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post'
    });
  }
});

// ========================
// ADMIN ROUTES - Must be before generic routes
// ========================

// @route   GET /api/posts/recruiter/all
// @desc    Get posts created by current admin/recruiter
// @access  Private (Admin only)
router.get('/recruiter/all', authenticateToken, requireRecruiter, async (req, res) => {
  try {
    console.log('Admin posts request by user:', req.user.id, 'role:', req.user.role);

    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    // Create a comprehensive filter for admin's own posts
    const filter = {
      author: req.user.id,
      isActive: { $ne: false } // Include posts that are not explicitly marked as inactive
    };

    console.log('Filter being used:', filter);

    // Filter posts to show only posts created by the current user
    const posts = await Post.find(filter)
      .populate('author', 'profile.firstName profile.lastName profile.profileImage role email')
      .populate('likes.user', 'profile.firstName profile.lastName profile.profileImage role email')
      .populate('comments.user', 'profile.firstName profile.lastName profile.profileImage role email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(filter);

    console.log(`Found ${posts.length} posts for admin ${req.user.id}, total: ${total}`);
    console.log('Posts authors:', posts.map(p => ({ id: p._id, author: p.author._id, authorName: p.author.profile?.firstName + ' ' + p.author.profile?.lastName })));

    res.json({
      success: true,
      data: posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasMore: skip + posts.length < total
      }
    });

  } catch (error) {
    console.error('Get all posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts'
    });
  }
});

// @route   PUT /api/posts/recruiter/:postId/hide
// @desc    Hide own post (admin action)
// @access  Private (Admin only)
router.put('/recruiter/:postId/hide', authenticateToken, requireRecruiter, async (req, res) => {
  try {
    const { postId } = req.params;

    // First, check if the post exists and belongs to the current user
    const post = await Post.findOne({ _id: postId, author: req.user.id });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or you can only modify your own posts'
      });
    }

    // Update the post
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { 
        isHidden: true,
        moderatedBy: req.user.id,
        moderatedAt: new Date()
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Post hidden successfully',
      data: updatedPost
    });

  } catch (error) {
    console.error('Hide post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to hide post'
    });
  }
});

// @route   PUT /api/posts/recruiter/:postId/approve
// @desc    Approve own post (admin action)
// @access  Private (Admin only)
router.put('/recruiter/:postId/approve', authenticateToken, requireRecruiter, async (req, res) => {
  try {
    const { postId } = req.params;

    // First, check if the post exists and belongs to the current user
    const post = await Post.findOne({ _id: postId, author: req.user.id });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or you can only modify your own posts'
      });
    }

    // Update the post
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { 
        isHidden: false,
        isApproved: true,
        moderatedBy: req.user.id,
        moderatedAt: new Date()
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Post approved successfully',
      data: updatedPost
    });

  } catch (error) {
    console.error('Approve post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve post'
    });
  }
});

// @route   DELETE /api/posts/recruiter/:postId
// @desc    Delete own post (admin action)
// @access  Private (Admin only)
router.delete('/recruiter/:postId', authenticateToken, requireRecruiter, async (req, res) => {
  try {
    const { postId } = req.params;

    // First, check if the post exists and belongs to the current user
    const post = await Post.findOne({ _id: postId, author: req.user.id });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or you can only delete your own posts'
      });
    }

    // Update the post to mark it as deleted
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { 
        isActive: false,
        deletedBy: req.user.id,
        deletedAt: new Date()
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Post deleted successfully',
      data: updatedPost
    });

  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post'
    });
  }
});

// ========================
// REGULAR ROUTES
// ========================

// @route   GET /api/posts/feed
// @desc    Get user's personalized feed
// @access  Private
router.get('/feed', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    console.log(`Feed request for user ${userId}, page ${page}, limit ${limit}`);

    const posts = await Post.getUserFeed(userId, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    console.log(`Found ${posts.length} posts for user feed`);

    // Add user interaction status for each post
    const postsWithUserStatus = posts.map(post => ({
      ...post,
      isLiked: post.likes.some(like => like.user.toString() === userId),
      isAuthor: post.author._id.toString() === userId
    }));

    console.log(`Returning ${postsWithUserStatus.length} posts with user status`);

    res.json({
      success: true,
      data: postsWithUserStatus,
      pagination: {
        currentPage: parseInt(page),
        hasMore: postsWithUserStatus.length === parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feed'
    });
  }
});

// @route   GET /api/posts/user/:userId
// @desc    Get posts by specific user
// @access  Private
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const currentUserId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    // Check if user can view target user's posts
    let visibilityFilter = { visibility: 'public' };
    
    if (targetUserId === currentUserId) {
      // User viewing their own posts
      visibilityFilter = {}; // Can see all their posts
    } else {
      // Check if users are connected
      const areConnected = await Connection.areConnected(currentUserId, targetUserId);
      if (areConnected) {
        visibilityFilter = { 
          $or: [
            { visibility: 'public' },
            { visibility: 'connections' }
          ]
        };
      }
    }

    const posts = await Post.find({
      author: targetUserId,
      isActive: true,
      ...visibilityFilter
    })
    .populate('author', 'profile.firstName profile.lastName profile.profileImage profile.headline role')
    .populate('jobId')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

    // Add user interaction status
    const postsWithUserStatus = posts.map(post => ({
      ...post.toObject(),
      isLiked: post.likes.some(like => like.user.toString() === currentUserId),
      isAuthor: post.author._id.toString() === currentUserId
    }));

    res.json({
      success: true,
      data: postsWithUserStatus,
      pagination: {
        currentPage: parseInt(page),
        hasMore: posts.length === parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user posts'
    });
  }
});

// @route   GET /api/posts/:postId
// @desc    Get single post
// @access  Private
router.get('/:postId', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    console.log(`Fetching post ${postId} for user ${userId}`);

    let post = await Post.findById(postId)
      .populate('author', 'profile.firstName profile.lastName profile.profileImage profile.headline role email')
      .populate('jobId')
      .populate('comments.user', 'profile.firstName profile.lastName profile.profileImage role email')
      .populate('likes.user', 'profile.firstName profile.lastName profile.profileImage role email');

    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Debug: Check what we got from populate
    console.log('Raw post likes after populate:');
    post.likes.forEach((like, index) => {
      console.log(`Like ${index}:`, {
        user: like.user ? {
          _id: like.user._id,
          email: like.user.email,
          profile: like.user.profile
        } : null
      });
    });

    console.log('Post likes before processing:', JSON.stringify(post.likes, null, 2));

    // Check visibility permissions
    if (post.visibility === 'private' && post.author._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (post.visibility === 'connections' && post.author._id.toString() !== userId) {
      const areConnected = await Connection.areConnected(userId, post.author._id);
      if (!areConnected) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Increment view count
    await Post.findByIdAndUpdate(postId, { $inc: { viewCount: 1 } });

    // Add user interaction status
    const postWithUserStatus = {
      ...post.toObject(),
      isLiked: post.likes.some(like => like.user._id.toString() === userId),
      isAuthor: post.author._id.toString() === userId,
      likeCount: post.likes.length,
      commentCount: post.comments.length,
      shareCount: post.shares.length
    };

    console.log('Sending post with likes:', JSON.stringify(postWithUserStatus.likes, null, 2));

    res.json({
      success: true,
      data: postWithUserStatus
    });

  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post'
    });
  }
});

// @route   PUT /api/posts/:postId
// @desc    Update post
// @access  Private
router.put('/:postId', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, visibility } = req.body;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user owns the post
    if (post.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    // Sanitize content
    const sanitizedContent = purify.sanitize(content);

    // Update post
    post.content = sanitizedContent;
    if (visibility) post.visibility = visibility;
    
    await post.save();

    // Populate author information
    await post.populate('author', 'profile.firstName profile.lastName profile.profileImage profile.headline role');

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: post
    });

  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update post'
    });
  }
});

// @route   DELETE /api/posts/:postId
// @desc    Delete post
// @access  Private
router.delete('/:postId', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user owns the post or is admin
    if (post.author.toString() !== userId && req.user.role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    // Soft delete
    post.isActive = false;
    await post.save();

    // Update user's post count
    await User.findByIdAndUpdate(post.author, { $inc: { postCount: -1 } });

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post'
    });
  }
});

// @route   POST /api/posts/:postId/like
// @desc    Toggle like on a post
// @access  Private
router.post('/:postId/like', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Toggle like
    const updatedPost = await post.toggleLike(userId);
    
    // Populate likes with user data
    await updatedPost.populate('likes.user', 'profile.firstName profile.lastName profile.profileImage role email');
    
    const isLiked = updatedPost.likes.some(like => like.user._id.toString() === userId);

    // Create notification if liked (and not own post)
    if (isLiked && post.author.toString() !== userId) {
      await Notification.createNotification({
        recipient: post.author,
        sender: userId,
        type: 'post_liked',
        title: 'Post Liked',
        message: `${req.user.profile.firstName} ${req.user.profile.lastName} liked your post`,
        sourceId: post._id,
        sourceModel: 'Post',
        actionUrl: `/post/${post._id}`,
        imageUrl: req.user.profile.profileImage
      });
    }

    res.json({
      success: true,
      message: isLiked ? 'Post liked' : 'Post unliked',
      data: {
        isLiked,
        likeCount: updatedPost.likes.length,
        likes: updatedPost.likes
      }
    });

  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like'
    });
  }
});

// @route   POST /api/posts/:postId/comment
// @desc    Add comment to a post
// @access  Private
router.post('/:postId/comment', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const post = await Post.findById(postId);
    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Sanitize comment content
    const sanitizedContent = purify.sanitize(content);

    // Add comment
    const updatedPost = await post.addComment(userId, sanitizedContent);

    // Populate comment user info
    await updatedPost.populate('comments.user', 'profile.firstName profile.lastName profile.profileImage role');

    // Get the newly added comment with populated user data
    const newComment = updatedPost.comments[updatedPost.comments.length - 1];

    // Create notification (if not own post)
    if (post.author.toString() !== userId) {
      await Notification.createNotification({
        recipient: post.author,
        sender: userId,
        type: 'post_commented',
        title: 'New Comment',
        message: `${req.user.profile.firstName} ${req.user.profile.lastName} commented on your post`,
        sourceId: post._id,
        sourceModel: 'Post',
        actionUrl: `/post/${post._id}`,
        imageUrl: req.user.profile.profileImage
      });
    }

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        comment: newComment,
        commentCount: updatedPost.comments.length,
        comments: updatedPost.comments
      }
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment'
    });
  }
});

// @route   DELETE /api/posts/:postId/comment/:commentId
// @desc    Delete comment from a post
// @access  Private
router.delete('/:postId/comment/:commentId', authenticateToken, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Delete comment
    const updatedPost = await post.deleteComment(commentId, userId);

    res.json({
      success: true,
      message: 'Comment deleted successfully',
      data: {
        commentCount: updatedPost.comments.length
      }
    });

  } catch (error) {
    console.error('Delete comment error:', error);
    if (error.message.includes('Not authorized')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment'
    });
  }
});

// @route   POST /api/posts/:postId/share
// @desc    Share a post
// @access  Private
router.post('/:postId/share', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Share post
    const updatedPost = await post.sharePost(userId, comment);

    // Create notification (if not own post)
    if (post.author.toString() !== userId) {
      await Notification.createNotification({
        recipient: post.author,
        sender: userId,
        type: 'post_shared',
        title: 'Post Shared',
        message: `${req.user.profile.firstName} ${req.user.profile.lastName} shared your post`,
        sourceId: post._id,
        sourceModel: 'Post',
        actionUrl: `/post/${post._id}`,
        imageUrl: req.user.profile.profileImage
      });
    }

    res.json({
      success: true,
      message: 'Post shared successfully',
      data: {
        shareCount: updatedPost.shares.length
      }
    });

  } catch (error) {
    console.error('Share post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to share post'
    });
  }
});

module.exports = router;
