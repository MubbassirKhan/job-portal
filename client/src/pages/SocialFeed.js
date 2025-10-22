import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Avatar,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  Skeleton,
  Fab,
  Backdrop,
  Fade,
  Stack,
  Badge,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  FavoriteOutlined,
  Favorite,
  ChatBubbleOutline,
  Share,
  MoreVert,
  Add,
  Image as ImageIcon,
  Send,
  Close,
  Visibility,
  Public,
  Lock,
  Group,
  TrendingUp,
  PhotoCamera,
  EmojiEmotions
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { socialAPI } from '../utils/socialAPI';
import { useSocketEvent } from '../hooks/useSocket';
import { SERVER_BASE_URL } from '../config/api';

const SocialFeed = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    visibility: 'public',
    media: [],
    mediaBase64: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [commentDialogs, setCommentDialogs] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [likeDialogs, setLikeDialogs] = useState({});
  const [quickComments] = useState([
    "Great post! 👍",
    "Thanks for sharing!",
    "Very informative 💡",
    "Congratulations! 🎉",
    "Inspiring work!",
    "Well said! 💯",
    "Love this! ❤️",
    "So true!",
    "Amazing! 🔥",
    "Keep it up! 💪"
  ]);

  // Load feed posts
  const loadFeed = useCallback(async (pageNum = 1, reset = false) => {
    try {
      setLoading(pageNum === 1);
      const response = await socialAPI.getFeed(pageNum, 10);
      
      // Ensure all posts have consistent structure with proper counts
      const processedPosts = response.data.map(post => ({
        ...post,
        likeCount: post.likeCount ?? post.likes?.length ?? 0,
        commentCount: post.commentCount ?? post.comments?.length ?? 0,
        shareCount: post.shareCount ?? post.shares?.length ?? 0,
        isLiked: post.isLiked ?? false
      }));
      
      if (reset) {
        setPosts(removeDuplicatePosts(processedPosts));
      } else {
        setPosts(prev => removeDuplicatePosts([...prev, ...processedPosts]));
      }
      
      setHasMore(response.pagination.hasMore);
      setPage(pageNum);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  // Effect to clean up duplicates whenever posts change
  useEffect(() => {
    setPosts(prev => removeDuplicatePosts(prev));
  }, []);

  // Helper function to remove duplicates from posts array
  const removeDuplicatePosts = (posts) => {
    const seen = new Set();
    return posts.filter(post => {
      if (seen.has(post._id)) {
        return false;
      }
      seen.add(post._id);
      return true;
    });
  };

  // Socket event handlers for real-time updates
  useSocketEvent('post:updated', (data) => {
    if (data.type === 'new_post') {
      // Check if post already exists to prevent duplicates
      setPosts(prev => {
        const postExists = prev.some(post => post._id === data.post._id);
        if (!postExists) {
          // Ensure new post has proper structure with counts
          const newPost = {
            ...data.post,
            likeCount: data.post.likes?.length || 0,
            commentCount: data.post.comments?.length || 0,
            shareCount: data.post.shares?.length || 0,
            isLiked: false // New posts are not liked by current user
          };
          const newPosts = [newPost, ...prev];
          return removeDuplicatePosts(newPosts);
        }
        return prev;
      });
    } else if (data.type === 'post_liked' || data.type === 'post_unliked') {
      // Handle like updates from other users
      setPosts(prev => prev.map(post => 
        post._id === data.postId 
          ? { 
              ...post, 
              likeCount: data.likeCount,
              likes: data.likes || post.likes
            }
          : post
      ));
    } else if (data.type === 'post_commented') {
      // Handle comment updates from other users
      setPosts(prev => prev.map(post => 
        post._id === data.postId 
          ? { 
              ...post, 
              commentCount: data.commentCount,
              comments: data.comments || post.comments
            }
          : post
      ));
    }
  });

  // Handle post interactions
  const handleLike = async (postId) => {
    try {
      // Optimistic update
      setPosts(prev => prev.map(post => 
        post._id === postId 
          ? { 
              ...post, 
              isLiked: !post.isLiked,
              likeCount: post.isLiked ? (post.likeCount || 0) - 1 : (post.likeCount || 0) + 1
            }
          : post
      ));

      const response = await socialAPI.toggleLike(postId);
      
      // Update with server response to ensure consistency
      setPosts(prev => prev.map(post => 
        post._id === postId 
          ? { 
              ...post, 
              isLiked: response.data.isLiked,
              likeCount: response.data.likeCount,
              likes: response.data.likes || post.likes // Preserve existing likes if response doesn't include them
            }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
      // Revert optimistic update on error
      setPosts(prev => prev.map(post => 
        post._id === postId 
          ? { 
              ...post, 
              isLiked: !post.isLiked,
              likeCount: post.isLiked ? (post.likeCount || 0) + 1 : (post.likeCount || 0) - 1
            }
          : post
      ));
    }
  };

  const handleComment = async (postId, content) => {
    if (!content.trim()) return;

    try {
      // Optimistic update
      const tempComment = {
        _id: `temp-${Date.now()}`,
        content: content.trim(),
        user: {
          profile: {
            firstName: 'Posting...',
            lastName: ''
          }
        },
        createdAt: new Date().toISOString()
      };

      setPosts(prev => prev.map(post => 
        post._id === postId 
          ? { 
              ...post, 
              comments: [...(post.comments || []), tempComment],
              commentCount: (post.commentCount || 0) + 1
            }
          : post
      ));

      const response = await socialAPI.addComment(postId, content);
      
      // Update with server response
      setPosts(prev => prev.map(post => 
        post._id === postId 
          ? { 
              ...post, 
              comments: response.data.comments || [...(post.comments || []).filter(c => !c._id.startsWith('temp-')), response.data.comment],
              commentCount: response.data.commentCount || (post.commentCount || 0)
            }
          : post
      ));
      
      // Clear the comment input
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Error adding comment:', error);
      // Revert optimistic update on error
      setPosts(prev => prev.map(post => 
        post._id === postId 
          ? { 
              ...post, 
              comments: (post.comments || []).filter(c => !c._id.startsWith('temp-')),
              commentCount: Math.max(0, (post.commentCount || 0) - 1)
            }
          : post
      ));
    }
  };

  const handleShare = async (postId) => {
    try {
      // Optimistic update
      setPosts(prev => prev.map(post => 
        post._id === postId 
          ? { 
              ...post, 
              shareCount: (post.shareCount || 0) + 1
            }
          : post
      ));

      // You can implement actual sharing functionality here
      // For now, just show a message
      console.log('Sharing post:', postId);
      
      // If you have a share API endpoint, call it here
      // const response = await socialAPI.sharePost(postId);
      
    } catch (error) {
      console.error('Error sharing post:', error);
      // Revert optimistic update on error
      setPosts(prev => prev.map(post => 
        post._id === postId 
          ? { 
              ...post, 
              shareCount: Math.max(0, (post.shareCount || 0) - 1)
            }
          : post
      ));
    }
  };

  const handleQuickComment = async (postId, comment) => {
    await handleComment(postId, comment);
  };

  const toggleCommentDialog = async (postId) => {
    const isOpening = !commentDialogs[postId];
    
    setCommentDialogs(prev => ({ 
      ...prev, 
      [postId]: isOpening
    }));
    
    // Fetch fresh data when opening comment dialog to ensure user data is populated
    if (isOpening) {
      try {
        const response = await socialAPI.getPost(postId);
        
        setPosts(prev => prev.map(post => 
          post._id === postId 
            ? { 
                ...post, 
                comments: response.data.comments || post.comments,
                likes: response.data.likes || post.likes,
                likeCount: response.data.likeCount ?? post.likeCount,
                commentCount: response.data.commentCount ?? post.commentCount,
                shareCount: response.data.shareCount ?? post.shareCount
              }
            : post
        ));
      } catch (error) {
        console.error('Error fetching post data for comments:', error);
      }
    }
  };

  const toggleLikeDialog = async (postId) => {
    const isOpening = !likeDialogs[postId];
    
    setLikeDialogs(prev => ({ 
      ...prev, 
      [postId]: isOpening
    }));
    
    // Always fetch fresh data when opening dialog to ensure user data is populated
    if (isOpening) {
      try {
        const response = await socialAPI.getPost(postId);
        console.log('Fresh post data received:', response.data);
        console.log('Likes array from API:', response.data.likes);
        
        setPosts(prev => prev.map(post => 
          post._id === postId 
            ? { 
                ...post, 
                likes: response.data.likes || post.likes,
                comments: response.data.comments || post.comments,
                likeCount: response.data.likeCount ?? post.likeCount,
                commentCount: response.data.commentCount ?? post.commentCount,
                shareCount: response.data.shareCount ?? post.shareCount
              }
            : post
        ));
      } catch (error) {
        console.error('Error fetching post data:', error);
      }
    }
  };

  const handleCommentInputChange = (postId, value) => {
    setCommentInputs(prev => ({ 
      ...prev, 
      [postId]: value 
    }));
  };

  // Handle post creation
  const handleCreatePost = async () => {
    if (!newPost.content.trim()) return;

    setSubmitting(true);
    try {
      await socialAPI.createPost(newPost);
      // Don't add to posts here and don't reload feed - let socket handle it to prevent duplicates
      setNewPost({ content: '', visibility: 'public', media: [], mediaBase64: [] });
      setCreatePostOpen(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMediaChange = (event) => {
    const files = Array.from(event.target.files);
    
    // Convert files to Base64
    const processFiles = async () => {
      const base64Files = [];
      
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          try {
            const base64 = await convertFileToBase64(file);
            base64Files.push(base64);
          } catch (error) {
            console.error('Error converting file to base64:', error);
          }
        }
      }
      
      setNewPost(prev => ({ 
        ...prev, 
        media: files, // Keep original files for fallback
        mediaBase64: base64Files // Add base64 data
      }));
    };
    
    processFiles();
  };

  // Helper function to convert file to Base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Unknown time';
    
    const now = new Date();
    const postDate = new Date(date);
    
    // Check if the date is valid
    if (isNaN(postDate.getTime())) {
      return 'Unknown time';
    }
    
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return postDate.toLocaleDateString();
  };

  return (
    <>
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        py: { xs: 2, md: 4 }
      }}>
      <Container 
        maxWidth="lg" 
        sx={{ 
          px: { xs: 1, sm: 2, md: 3 }
        }}
      >
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              p: { xs: 3, md: 4 },
              mb: 4,
              borderRadius: 3,
              textAlign: 'center'
            }}
          >
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              sx={{ 
                fontWeight: 700, 
                mb: 1,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              🚀 Professional Feed
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                opacity: 0.9,
                fontSize: { xs: '0.9rem', md: '1rem' }
              }}
            >
              Connect, share, and grow with your professional network
            </Typography>
          </Paper>
        </motion.div>

        <Grid container spacing={3}>
          {/* Left Sidebar - Hidden on mobile */}
          {!isMobile && (
            <Grid item lg={3} md={3}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Paper 
                  elevation={2}
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    background: 'white',
                    position: 'sticky',
                    top: 20
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Quick Stats
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUp color="primary" />
                      <Typography variant="body2">
                        {posts.length} Posts Today
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Group color="primary" />
                      <Typography variant="body2">
                        Professional Network
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </motion.div>
            </Grid>
          )}

          {/* Main Content */}
          <Grid item xs={12} md={isMobile ? 12 : 9} lg={6}>
            {/* Create Post Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Paper 
                elevation={3}
                sx={{ 
                  mb: 3,
                  borderRadius: 3,
                  overflow: 'hidden',
                  background: 'white'
                }}
              >
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => setCreatePostOpen(true)}
                    sx={{
                      py: { xs: 1.5, md: 2 },
                      textTransform: 'none',
                      fontSize: { xs: '0.9rem', md: '1rem' },
                      borderRadius: 2,
                      border: '2px dashed #e0e0e0',
                      background: 'linear-gradient(45deg, #f8f9fa, #ffffff)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #e3f2fd, #f5f5f5)',
                        border: '2px dashed #1976d2',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(25, 118, 210, 0.15)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    💭 Share an update with your network
                  </Button>
                </CardContent>
              </Paper>
            </motion.div>

            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3,
                      borderRadius: 2,
                      '& .MuiAlert-icon': {
                        fontSize: '1.5rem'
                      }
                    }} 
                    onClose={() => setError('')}
                  >
                    {error}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading Skeletons */}
            {loading && posts.length === 0 && (
              <Stack spacing={3}>
                {[1, 2, 3].map((item) => (
                  <Paper key={item} elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Skeleton variant="circular" width={50} height={50} />
                      <Box sx={{ ml: 2, flex: 1 }}>
                        <Skeleton variant="text" width="60%" height={24} />
                        <Skeleton variant="text" width="40%" height={20} />
                      </Box>
                    </Box>
                    <Skeleton variant="text" width="100%" height={20} />
                    <Skeleton variant="text" width="80%" height={20} />
                    <Skeleton variant="rectangular" width="100%" height={200} sx={{ mt: 2, borderRadius: 2 }} />
                  </Paper>
                ))}
              </Stack>
            )}

            {/* Posts Feed */}
            <Stack spacing={3}>
              <AnimatePresence>
        {posts.map((post, index) => (
          <motion.div
            key={post._id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: index * 0.1,
              duration: 0.5,
              type: "spring",
              stiffness: 100
            }}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
          >
            <Paper 
              elevation={4}
              sx={{ 
                borderRadius: 4,
                overflow: 'hidden',
                background: 'white',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                '&:hover': {
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
                  '&::before': {
                    opacity: 1
                  }
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease'
                }
              }}
            >
              {/* Post Header */}
              <CardContent sx={{ p: { xs: 2, md: 3 }, pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <Box sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: '#4caf50',
                        border: '2px solid white'
                      }} />
                    }
                  >
                    <Avatar
                      src={post.author.profile.profileImage}
                      sx={{ 
                        width: { xs: 45, md: 50 },
                        height: { xs: 45, md: 50 },
                        mr: 2,
                        border: '3px solid transparent',
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                      }}
                    >
                      {post.author.profile.firstName?.charAt(0)}
                    </Avatar>
                  </Badge>
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 700,
                        color: '#2c3e50',
                        fontSize: { xs: '0.95rem', md: '1.1rem' }
                      }}
                    >
                      {post.author.profile.firstName} {post.author.profile.lastName}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        fontWeight: 500,
                        fontSize: { xs: '0.8rem', md: '0.875rem' }
                      }}
                    >
                      {post.author.profile.headline || post.author.role}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Visibility sx={{ fontSize: 14, mr: 0.5, color: '#94a3b8' }} />
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ fontSize: '0.75rem' }}
                      >
                        {formatTimeAgo(post.createdAt)}
                      </Typography>
                      {post.visibility === 'public' && (
                        <Tooltip title="Public post">
                          <Public sx={{ fontSize: 14, ml: 1, color: '#94a3b8' }} />
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                  <Tooltip title="More options">
                    <IconButton 
                      size="small"
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(102, 126, 234, 0.1)'
                        }
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Post Content */}
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 2.5,
                    lineHeight: 1.6,
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    color: '#374151'
                  }}
                >
                  {post.content}
                </Typography>

                {/* Post Type Indicator */}
                {post.postType !== 'text' && (
                  <Chip
                    label={post.postType.replace('_', ' ').toUpperCase()}
                    size="small"
                    sx={{ 
                      mb: 2,
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  />
                )}

                {/* Media Display */}
                {post.mediaUrls && post.mediaUrls.length > 0 && (
                  <Box sx={{ mb: 2.5 }}>
                    <Grid container spacing={1}>
                      {post.mediaUrls.map((url, idx) => (
                        <Grid item xs={post.mediaUrls.length === 1 ? 12 : 6} key={idx}>
                          <Box
                            sx={{
                              position: 'relative',
                              borderRadius: 3,
                              overflow: 'hidden',
                              '&:hover img': {
                                transform: 'scale(1.05)'
                              }
                            }}
                          >
                            <img
                              src={url.startsWith('http') ? url : `${SERVER_BASE_URL}${url}`}
                              alt="Post media"
                              style={{
                                width: '100%',
                                height: post.mediaUrls.length === 1 ? '300px' : '200px',
                                objectFit: 'cover',
                                transition: 'transform 0.3s ease'
                              }}
                              onError={(e) => {
                                console.error('Image failed to load:', url);
                                e.target.style.display = 'none';
                              }}
                            />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {/* Interactive Engagement Stats */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  mb: 1.5,
                  pt: 2,
                  borderTop: '1px solid rgba(0, 0, 0, 0.06)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {/* Like Button/Counter */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer',
                        p: 1,
                        borderRadius: 2,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: post.isLiked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                          transform: 'scale(1.02)'
                        }
                      }}
                      onClick={() => handleLike(post._id)}
                    >
                      {post.isLiked ? (
                        <Favorite sx={{ color: '#ef4444', fontSize: 20 }} />
                      ) : (
                        <FavoriteOutlined sx={{ color: 'text.secondary', fontSize: 20 }} />
                      )}
                      <Typography 
                        variant="body2" 
                        color={post.isLiked ? '#ef4444' : 'text.secondary'}
                        sx={{ fontWeight: 500 }}
                      >
                        {post.likeCount || 0} {post.isLiked ? 'Liked' : 'Like'}
                      </Typography>
                    </Box>

                    {/* Comment Button/Counter */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer',
                        p: 1,
                        borderRadius: 2,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.1)',
                          color: 'primary.main',
                          transform: 'scale(1.02)'
                        }
                      }}
                      onClick={() => toggleCommentDialog(post._id)}
                    >
                      <ChatBubbleOutline sx={{ color: 'text.secondary', fontSize: 20 }} />
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontWeight: 500 }}
                      >
                        {post.commentCount || 0} Comment{(post.commentCount || 0) !== 1 ? 's' : ''}
                      </Typography>
                    </Box>

                    {/* Share Button/Counter */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer',
                        p: 1,
                        borderRadius: 2,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(46, 125, 50, 0.1)',
                          color: 'success.main',
                          transform: 'scale(1.02)'
                        }
                      }}
                      onClick={() => handleShare(post._id)}
                    >
                      <Share sx={{ color: 'text.secondary', fontSize: 20 }} />
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontWeight: 500 }}
                      >
                        {post.shareCount || 0} Share{(post.shareCount || 0) !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Show who liked this - clickable if there are likes */}
                  {(post.likeCount || 0) > 0 && (
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          color: 'primary.main',
                          textDecoration: 'underline'
                        }
                      }}
                      onClick={() => toggleLikeDialog(post._id)}
                    >
                      {post.likeCount} {post.likeCount === 1 ? 'person likes' : 'people like'} this
                    </Typography>
                  )}
                </Box>
              </CardContent>

              <Divider sx={{ opacity: 0.6 }} />

              {/* Comments Section */}
              {commentDialogs[post._id] && (
                <CardContent sx={{ pt: 1, pb: 2 }}>
                  <Divider sx={{ mb: 2 }} />
                  
                  {/* Quick Comment Options */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                      Quick replies:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {quickComments.slice(0, 5).map((comment, idx) => (
                        <Chip
                          key={idx}
                          label={comment}
                          size="small"
                          variant="outlined"
                          onClick={() => handleQuickComment(post._id, comment)}
                          sx={{ 
                            fontSize: '0.75rem',
                            '&:hover': {
                              backgroundColor: 'primary.light',
                              color: 'white'
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Custom Comment Input */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      size="small"
                      placeholder="Write a comment..."
                      fullWidth
                      value={commentInputs[post._id] || ''}
                      onChange={(e) => handleCommentInputChange(post._id, e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && commentInputs[post._id]?.trim()) {
                          handleComment(post._id, commentInputs[post._id]);
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      size="small"
                      disabled={!commentInputs[post._id]?.trim()}
                      onClick={() => handleComment(post._id, commentInputs[post._id])}
                      sx={{ minWidth: 'auto', px: 2 }}
                    >
                      Post
                    </Button>
                  </Box>

                  {/* Existing Comments */}
                  {post.comments && post.comments.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                        Comments ({post.comments.length}):
                      </Typography>
                      {post.comments.slice(-5).map((comment) => (
                        <Box key={comment._id} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Avatar sx={{ width: 24, height: 24 }}>
                              {comment.user?.profile?.firstName?.charAt(0) || comment.user?.email?.charAt(0) || 'U'}
                            </Avatar>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {comment.user?.profile?.firstName && comment.user?.profile?.lastName 
                                ? `${comment.user.profile.firstName} ${comment.user.profile.lastName}`
                                : comment.user?.email || 'Anonymous User'
                              }
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatTimeAgo(comment.createdAt)}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ ml: 4 }}>
                            {comment.content}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
              )}

              {/* Old Comments Section for existing posts */}
              {!commentDialogs[post._id] && post.comments && post.comments.length > 0 && (
                <CardContent sx={{ pt: 0 }}>
                  <Divider sx={{ mb: 2 }} />
                  {post.comments.slice(-3).map((comment) => (
                    <Box key={comment._id} sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar size="small" sx={{ width: 24, height: 24 }}>
                          {comment.user?.profile?.firstName?.charAt(0) || comment.user?.email?.charAt(0) || 'U'}
                        </Avatar>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {comment.user?.profile?.firstName && comment.user?.profile?.lastName 
                            ? `${comment.user.profile.firstName} ${comment.user.profile.lastName}`
                            : comment.user?.email || 'Anonymous User'
                          }
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimeAgo(comment.createdAt)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ ml: 4, color: 'text.secondary' }}>
                        {comment.content}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              )}
            </Paper>
          </motion.div>
        ))}
              </AnimatePresence>
            </Stack>

            {/* Load More Button */}
            {hasMore && !loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                  variant="contained"
                  onClick={() => loadFeed(page + 1)}
                  sx={{ 
                    textTransform: 'none',
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a67d8, #6b46c1)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Load More Posts
                </Button>
              </Box>
            )}
          </Grid>

          {/* Right Sidebar - Hidden on mobile and tablet */}
          {!isTablet && (
            <Grid item lg={3}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Paper 
                  elevation={2}
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    background: 'white',
                    position: 'sticky',
                    top: 20
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Trending Topics
                  </Typography>
                  <Stack spacing={1}>
                    {['#JobOpportunities', '#Networking', '#ProfessionalGrowth', '#CareerTips'].map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{
                          justifyContent: 'flex-start',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.1)'
                          }
                        }}
                      />
                    ))}
                  </Stack>
                </Paper>
              </motion.div>
            </Grid>
          )}
        </Grid>
      </Container>

      {/* Floating Action Button for mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="create post"
          onClick={() => setCreatePostOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            '&:hover': {
              background: 'linear-gradient(45deg, #5a67d8, #6b46c1)',
              transform: 'scale(1.1)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          <Add />
        </Fab>
      )}
    </Box>

      {/* Like Dialog - Shows who liked the post */}
      <Dialog
        open={Object.keys(likeDialogs).some(key => likeDialogs[key])}
        onClose={() => setLikeDialogs({})}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Favorite sx={{ color: '#ef4444', fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                People who liked this
              </Typography>
            </Box>
            <IconButton 
              onClick={() => setLikeDialogs({})}
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'rgba(0, 0, 0, 0.04)' 
                } 
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ py: 1 }}>
          {posts
            .filter(post => likeDialogs[post._id])
            .map(post => (
              <Box key={post._id}>
                {post.likes && post.likes.length > 0 ? (
                  post.likes.map((like, index) => (
                    <Box 
                      key={like._id || like.user?._id || index} 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2, 
                        py: 1.5,
                        px: 1,
                        borderRadius: 2,
                        transition: 'background-color 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.02)'
                        }
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          width: 40, 
                          height: 40,
                          border: '2px solid rgba(0, 0, 0, 0.06)'
                        }}
                        src={like.user?.profile?.profileImage}
                      >
                        {like.user?.profile?.firstName?.charAt(0) || like.user?.email?.charAt(0) || 'U'}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {(() => {
                            console.log(`Like ${index} - Full user object:`, JSON.stringify(like.user, null, 2));
                            
                            const user = like.user;
                            
                            // If user is null or undefined
                            if (!user) {
                              console.log(`Like ${index} - No user data`);
                              return `Anonymous User`;
                            }
                            
                            // Check for profile data first
                            if (user.profile?.firstName && user.profile?.lastName) {
                              console.log(`Like ${index} - Using profile name: ${user.profile.firstName} ${user.profile.lastName}`);
                              return `${user.profile.firstName} ${user.profile.lastName}`;
                            }
                            
                            // Check if profile.firstName exists but no lastName
                            if (user.profile?.firstName) {
                              console.log(`Like ${index} - Using first name only: ${user.profile.firstName}`);
                              return user.profile.firstName;
                            }
                            
                            // Try to use email as name (extract part before @)
                            if (user.email) {
                              const emailName = user.email.split('@')[0];
                              console.log(`Like ${index} - Using email name: ${emailName}`);
                              return emailName.charAt(0).toUpperCase() + emailName.slice(1);
                            }
                            
                            // Last fallback - use user ID if available
                            if (user._id) {
                              console.log(`Like ${index} - Using ID fallback: User ${user._id.slice(-4)}`);
                              return `User ${user._id.slice(-4)}`;
                            }
                            
                            // Final fallback
                            console.log(`Like ${index} - Using index fallback`);
                            return `User ${index + 1}`;
                          })()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {like.user?.profile?.headline || like.user?.role || like.user?.email || 'User'}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography color="text.secondary" variant="body2">
                      No likes yet
                    </Typography>
                  </Box>
                )}
              </Box>
            ))}
        </DialogContent>
      </Dialog>

      {/* Create Post Dialog */}
      <Dialog
        open={createPostOpen}
        onClose={() => setCreatePostOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              ✨ Create Post
            </Typography>
            <IconButton onClick={() => setCreatePostOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            multiline
            rows={4}
            fullWidth
            placeholder="What's on your mind? Share something inspiring..."
            value={newPost.content}
            onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
            variant="outlined"
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          
          <Stack direction="row" spacing={2} alignItems="center">
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleMediaChange}
              style={{ display: 'none' }}
              id="media-upload"
            />
            <label htmlFor="media-upload">
              <Button
                component="span"
                startIcon={<PhotoCamera />}
                variant="outlined"
                sx={{ 
                  textTransform: 'none',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.1)'
                  }
                }}
              >
                Add Photos
              </Button>
            </label>

            <Chip
              icon={<Public />}
              label="Public"
              variant="outlined"
              size="small"
              sx={{ borderRadius: 2 }}
            />
          </Stack>

          {newPost.media.length > 0 && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">
                📎 {newPost.media.length} file(s) selected
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setCreatePostOpen(false)}
            sx={{ 
              textTransform: 'none',
              borderRadius: 2
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreatePost}
            variant="contained"
            disabled={!newPost.content.trim() || submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : <Send />}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a67d8, #6b46c1)'
              },
              '&:disabled': {
                background: '#e0e0e0'
              }
            }}
          >
            {submitting ? 'Posting...' : 'Share Post'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SocialFeed;