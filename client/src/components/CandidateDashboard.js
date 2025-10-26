import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Snackbar,
  ButtonGroup,
} from '@mui/material';
import { 
  Work, 
  Send, 
  Schedule, 
  CheckCircle, 
  TrendingUp,
  Visibility,
  Assignment,
  BookmarkBorder,
  Star,
  ArrowForward,
  Article,
  Edit,
  Delete,
  MoreVert,
  Favorite,
  ChatBubbleOutline
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { applicationsAPI, jobsAPI } from '../utils/api';
import { socialAPI } from '../utils/socialAPI';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const StatCard = ({ icon, title, value, trend, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Card
      sx={{
        height: '140px', // Fixed height for consistency
        borderRadius: '16px',
        border: '1px solid',
        borderColor: 'grey.200',
        transition: 'all 0.3s ease-in-out',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
        },
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(99, 102, 241, 0.15)',
          borderColor: 'rgba(99, 102, 241, 0.3)',
        },
      }}
    >
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700, 
                color: '#1e293b', 
                mb: 0.5,
                fontSize: '2rem',
                lineHeight: 1.2
              }}
            >
              {value}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 500, 
                color: 'text.secondary',
                fontSize: '0.875rem'
              }}
            >
              {title}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6366f1',
              flexShrink: 0,
            }}
          >
            {React.cloneElement(icon, { sx: { fontSize: 24 } })}
          </Box>
        </Box>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <TrendingUp sx={{ fontSize: 14, color: '#10b981', mr: 0.5 }} />
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#10b981',
                fontWeight: 500,
                fontSize: '0.75rem'
              }}
            >
              {trend}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

const JobCard = ({ job, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.2 }}
  >
    <Paper
      sx={{
        p: 2.5,
        borderRadius: '12px',
        border: '1px solid',
        borderColor: 'grey.200',
        cursor: 'pointer',
        transition: 'all 0.3s ease-in-out',
        mb: 2,
        '&:hover': {
          borderColor: '#6366f1',
          boxShadow: '0 8px 25px rgba(99, 102, 241, 0.15)',
          transform: 'translateY(-2px)',
        },
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, lineHeight: 1.3 }}>
            {job.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            {job.company} • {job.location}
          </Typography>
        </Box>
        <IconButton size="small" sx={{ color: 'text.secondary' }}>
          <BookmarkBorder />
        </IconButton>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Posted {format(new Date(job.createdAt), 'MMM dd, yyyy')}
        </Typography>
        <Button
          size="small"
          endIcon={<ArrowForward />}
          sx={{
            textTransform: 'none',
            fontWeight: 500,
            color: '#6366f1',
            '&:hover': { backgroundColor: '#6366f110' }
          }}
        >
          View
        </Button>
      </Box>
    </Paper>
  </motion.div>
);

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editVisibility, setEditVisibility] = useState('public');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    interview: 0,
    accepted: 0,
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      const [applicationsRes, jobsRes] = await Promise.all([
        applicationsAPI.getMyApplications({ limit: 5 }),
        jobsAPI.getJobs({ limit: 6 }),
      ]);

      setApplications(applicationsRes.data.data);
      setRecentJobs(jobsRes.data.data);

      // Calculate stats
      const allApplications = applicationsRes.data.data;
      const statsData = {
        total: allApplications.length,
        pending: allApplications.filter(app => app.status === 'pending').length,
        interview: allApplications.filter(app => app.status === 'interview').length,
        accepted: allApplications.filter(app => app.status === 'accepted').length,
      };
      setStats(statsData);

      // Fetch user's posts
      if (user?.id) {
        setPostsLoading(true);
        try {
          const postsRes = await socialAPI.getUserPosts(user.id, 1, 5);
          setUserPosts(postsRes.data);
        } catch (error) {
          console.error('Error fetching user posts:', error);
        } finally {
          setPostsLoading(false);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Post management functions
  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditContent(post.content);
    setEditVisibility(post.visibility || 'public');
    setEditDialog(true);
    setMenuAnchor(null);
  };

  const handleDeletePost = (post) => {
    setPostToDelete(post);
    setDeleteConfirmDialog(true);
    setMenuAnchor(null);
  };

  const confirmDeletePost = async () => {
    try {
      await socialAPI.deletePost(postToDelete._id);
      setUserPosts(prev => prev.filter(post => post._id !== postToDelete._id));
      setSnackbar({ open: true, message: 'Post deleted successfully!', severity: 'success' });
      setDeleteConfirmDialog(false);
      setPostToDelete(null);
    } catch (error) {
      console.error('Error deleting post:', error);
      setSnackbar({ open: true, message: 'Failed to delete post. Please try again.', severity: 'error' });
    }
  };

  const handleUpdatePost = async () => {
    try {
      await socialAPI.updatePost(editingPost._id, { 
        content: editContent,
        visibility: editVisibility 
      });
      setUserPosts(prev => prev.map(post => 
        post._id === editingPost._id 
          ? { ...post, content: editContent, visibility: editVisibility }
          : post
      ));
      setSnackbar({ open: true, message: 'Post updated successfully!', severity: 'success' });
      setEditDialog(false);
      setEditingPost(null);
      setEditContent('');
      setEditVisibility('public');
    } catch (error) {
      console.error('Error updating post:', error);
      setSnackbar({ open: true, message: 'Failed to update post. Please try again.', severity: 'error' });
    }
  };

  const handleMenuClick = (event, post) => {
    setMenuAnchor(event.currentTarget);
    setSelectedPost(post);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedPost(null);
  };

  const handleViewPost = (post) => {
    navigate(`/feed`); // Navigate to full social feed to view post
    setMenuAnchor(null);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const postDate = new Date(date);
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

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'reviewing': return 'info';
      case 'interview': return 'primary';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  const successRate = stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0;

  return (
    <Box>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<Send />}
            title="Total Applications"
            value={stats.total}
            trend="+12% this week"
            delay={0.1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<Schedule />}
            title="Pending Review"
            value={stats.pending}
            delay={0.2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<Work />}
            title="Interviews"
            value={stats.interview}
            trend="+2 this week"
            delay={0.3}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<CheckCircle />}
            title="Success Rate"
            value={`${successRate}%`}
            delay={0.4}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Applications */}
        <Grid item xs={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card
              sx={{
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'grey.200',
                height: 'fit-content',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Assignment sx={{ color: '#6366f1' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Recent Applications
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/applications')}
                    sx={{
                      textTransform: 'none',
                      borderRadius: '8px',
                      fontWeight: 500,
                    }}
                  >
                    View All
                  </Button>
                </Box>

                {applications.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Job Title</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Company</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Applied</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {applications.map((application, index) => (
                          <motion.tr
                            key={application._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            component={TableRow}
                            sx={{
                              '&:hover': { backgroundColor: 'grey.50' },
                              transition: 'background-color 0.2s ease-in-out',
                            }}
                          >
                            <TableCell>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {application.jobId?.title}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {application.jobId?.company}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                color={getStatusChipColor(application.status)}
                                size="small"
                                sx={{
                                  fontWeight: 500,
                                  borderRadius: '6px',
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {format(new Date(application.appliedAt), 'MMM dd, yyyy')}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/jobs/${application.jobId?._id}`)}
                                sx={{ color: '#6366f1' }}
                              >
                                <Visibility />
                              </IconButton>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                      No applications yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 300, mx: 'auto' }}>
                      Start your job search journey by browsing available positions
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/jobs')}
                      sx={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                      }}
                    >
                      Browse Jobs
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Recent Jobs */}
        <Grid item xs={12} lg={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card
              sx={{
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'grey.200',
                height: 'fit-content',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Star sx={{ color: '#f59e0b' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Latest Jobs
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/jobs')}
                    sx={{
                      textTransform: 'none',
                      borderRadius: '8px',
                      fontWeight: 500,
                    }}
                  >
                    View All
                  </Button>
                </Box>

                <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                  <AnimatePresence>
                    {recentJobs.slice(0, 5).map((job, index) => (
                      <motion.div
                        key={job._id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <JobCard
                          job={job}
                          onClick={() => navigate(`/jobs/${job._id}`)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* My Posts Section */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card
              sx={{
                borderRadius: 0, // Square edges
                border: '1px solid',
                borderColor: 'grey.300',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Article sx={{ color: '#6366f1' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      My Posts
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/feed')}
                    sx={{
                      textTransform: 'none',
                      borderRadius: 0, // Square edges
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                      borderColor: 'grey.400',
                      color: 'text.primary',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'primary.50'
                      }
                    }}
                  >
                    Create New Post
                  </Button>
                </Box>

                {postsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : userPosts.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Article sx={{ fontSize: 48, color: 'grey.300', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                      No posts yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Share your professional updates with your network
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/feed')}
                      sx={{
                        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                        textTransform: 'none',
                        borderRadius: 0, // Square edges
                        fontWeight: 600,
                        px: 4,
                        py: 1.5,
                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                          boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
                        }
                      }}
                    >
                      Create Your First Post
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ maxHeight: 500, overflowY: 'auto' }}>
                    <AnimatePresence>
                      {userPosts.map((post, index) => (
                        <motion.div
                          key={post._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Card
                            sx={{
                              mb: 3,
                              border: '1px solid',
                              borderColor: 'grey.300',
                              borderRadius: 0, // Square edges
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                borderColor: 'grey.400',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                              },
                            }}
                          >
                            <CardContent sx={{ p: 0 }}>
                              {/* Header Section */}
                              <Box sx={{ 
                                p: 3, 
                                borderBottom: '1px solid',
                                borderColor: 'grey.200',
                                backgroundColor: 'grey.50'
                              }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar
                                      src={user?.profile?.profileImage}
                                      sx={{ 
                                        width: 48, 
                                        height: 48,
                                        border: '2px solid white',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                                      }}
                                    >
                                      {user?.profile?.firstName?.charAt(0)}
                                    </Avatar>
                                    <Box>
                                      <Typography variant="subtitle1" sx={{ 
                                        fontWeight: 600,
                                        color: 'text.primary',
                                        mb: 0.5
                                      }}>
                                        {user?.profile?.firstName} {user?.profile?.lastName}
                                      </Typography>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Typography variant="caption" sx={{ 
                                          color: 'text.secondary',
                                          fontWeight: 500
                                        }}>
                                          {formatTimeAgo(post.createdAt)}
                                        </Typography>
                                        <Box sx={{ width: 1, height: 1, backgroundColor: 'grey.400', borderRadius: '50%' }} />
                                        <Chip 
                                          label={post.visibility} 
                                          size="small" 
                                          variant="outlined"
                                          sx={{ 
                                            textTransform: 'capitalize',
                                            height: 22,
                                            fontSize: '0.7rem',
                                            fontWeight: 500,
                                            borderRadius: 0,
                                            backgroundColor: 'white'
                                          }}
                                        />
                                      </Box>
                                    </Box>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ButtonGroup 
                                      size="small" 
                                      variant="outlined"
                                      sx={{
                                        '& .MuiButton-root': {
                                          borderRadius: 0,
                                          textTransform: 'none',
                                          fontSize: '0.75rem',
                                          px: 1.5,
                                          py: 0.5,
                                          fontWeight: 500
                                        }
                                      }}
                                    >
                                      <Button
                                        onClick={() => handleViewPost(post)}
                                        startIcon={<Visibility sx={{ fontSize: 14 }} />}
                                      >
                                        View
                                      </Button>
                                      <Button
                                        onClick={() => handleEditPost(post)}
                                        startIcon={<Edit sx={{ fontSize: 14 }} />}
                                      >
                                        Edit
                                      </Button>
                                    </ButtonGroup>
                                    <IconButton
                                      onClick={(e) => handleMenuClick(e, post)}
                                      size="small"
                                      sx={{ 
                                        border: '1px solid',
                                        borderColor: 'grey.300',
                                        borderRadius: 0,
                                        '&:hover': {
                                          backgroundColor: 'grey.100'
                                        }
                                      }}
                                    >
                                      <MoreVert sx={{ fontSize: 18 }} />
                                    </IconButton>
                                  </Box>
                                </Box>
                              </Box>

                              {/* Content Section */}
                              <Box sx={{ p: 3 }}>
                                <Typography variant="body1" sx={{ 
                                  mb: 2.5, 
                                  lineHeight: 1.7,
                                  color: 'text.primary',
                                  fontSize: '0.95rem',
                                  whiteSpace: 'pre-wrap'
                                }}>
                                  {post.content}
                                </Typography>

                              {/* Post Media */}
                              {((post.mediaUrls && post.mediaUrls.length > 0) || (post.mediaBase64 && post.mediaBase64.length > 0)) && (
                                <Box sx={{ mb: 3 }}>
                                  <Grid container spacing={2}>
                                    {/* Display base64 images if available */}
                                    {post.mediaBase64 && post.mediaBase64.length > 0 && post.mediaBase64.slice(0, 4).map((media, idx) => (
                                      <Grid item xs={post.mediaBase64.length === 1 ? 12 : post.mediaBase64.length === 2 ? 6 : 4} key={`base64-${idx}`}>
                                        <Box
                                          sx={{
                                            position: 'relative',
                                            borderRadius: 0, // Square edges
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            border: '1px solid',
                                            borderColor: 'grey.200',
                                            '&:hover': {
                                              borderColor: 'grey.400',
                                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                                            }
                                          }}
                                        >
                                          <img
                                            src={`data:${media.mimeType};base64,${media.data}`}
                                            alt="Post media"
                                            style={{
                                              width: '100%',
                                              height: post.mediaBase64.length === 1 ? '400px' : post.mediaBase64.length === 2 ? '250px' : '180px',
                                              objectFit: 'contain', // Show full image without cropping
                                              backgroundColor: '#f5f5f5', // Light background for padding
                                              display: 'block'
                                            }}
                                            onError={(e) => {
                                              console.warn('Base64 image failed to load for post:', post._id);
                                              e.target.style.display = 'none';
                                            }}
                                          />
                                        </Box>
                                      </Grid>
                                    ))}
                                    
                                    {/* Fallback to URL-based images if no base64 images */}
                                    {(!post.mediaBase64 || post.mediaBase64.length === 0) && post.mediaUrls && post.mediaUrls.slice(0, 4).map((url, idx) => (
                                      <Grid item xs={post.mediaUrls.length === 1 ? 12 : post.mediaUrls.length === 2 ? 6 : 4} key={`url-${idx}`}>
                                        <Box
                                          sx={{
                                            position: 'relative',
                                            borderRadius: 0, // Square edges
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            border: '1px solid',
                                            borderColor: 'grey.200',
                                            '&:hover': {
                                              borderColor: 'grey.400',
                                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                                            }
                                          }}
                                        >
                                          <img
                                            src={url.startsWith('http') ? url : `http://localhost:5000${url}`}
                                            alt="Post media"
                                            style={{
                                              width: '100%',
                                              height: post.mediaUrls.length === 1 ? '400px' : post.mediaUrls.length === 2 ? '250px' : '180px',
                                              objectFit: 'contain', // Show full image without cropping
                                              backgroundColor: '#f5f5f5', // Light background for padding
                                              display: 'block'
                                            }}
                                            onError={(e) => {
                                              console.warn('URL image failed to load:', url);
                                              e.target.style.display = 'none';
                                            }}
                                          />
                                        </Box>
                                      </Grid>
                                    ))}
                                  </Grid>
                                </Box>
                              )}

                              </Box>

                              {/* Post Stats */}
                              <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                p: 3,
                                borderTop: '1px solid', 
                                borderColor: 'grey.200',
                                backgroundColor: 'grey.50'
                              }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                    <Favorite sx={{ fontSize: 18, color: 'error.main' }} />
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                      {post.likes?.length || 0}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                      likes
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                    <ChatBubbleOutline sx={{ fontSize: 18, color: 'primary.main' }} />
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                      {post.comments?.length || 0}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                      comments
                                    </Typography>
                                  </Box>
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ 
                                  textTransform: 'uppercase',
                                  letterSpacing: 0.5,
                                  fontWeight: 600,
                                  fontSize: '0.7rem'
                                }}>
                                  Post #{post._id.slice(-6)}
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Post Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 150 }
        }}
      >
        <MenuItem onClick={() => handleViewPost(selectedPost)}>
          <Visibility sx={{ mr: 1, fontSize: 18 }} />
          View Full Post
        </MenuItem>
        <MenuItem onClick={() => handleEditPost(selectedPost)}>
          <Edit sx={{ mr: 1, fontSize: 18 }} />
          Edit Post
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => handleDeletePost(selectedPost)}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1, fontSize: 18 }} />
          Delete Post
        </MenuItem>
      </Menu>

      {/* Edit Post Dialog */}
      <Dialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 0 } // Square edges
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Edit Post
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ mb: 3 }}>
            <TextField
              autoFocus
              label="Post Content"
              fullWidth
              multiline
              rows={6}
              variant="outlined"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="What's on your mind?"
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0 // Square edges
                }
              }}
            />
            
            <FormControl fullWidth size="small">
              <InputLabel>Visibility</InputLabel>
              <Select
                value={editVisibility}
                onChange={(e) => setEditVisibility(e.target.value)}
                label="Visibility"
              >
                <MenuItem value="public">🌍 Public - Anyone can see this</MenuItem>
                <MenuItem value="connections">👥 Connections Only</MenuItem>
                <MenuItem value="private">🔒 Private - Only you can see this</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          {/* Show current media if any */}
          {editingPost && ((editingPost.mediaUrls && editingPost.mediaUrls.length > 0) || 
            (editingPost.mediaBase64 && editingPost.mediaBase64.length > 0)) && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Current Media:
              </Typography>
              <Box sx={{ 
                maxHeight: 200, 
                overflowY: 'auto',
                border: '1px solid',
                borderColor: 'grey.300',
                borderRadius: 1,
                p: 1
              }}>
                <Grid container spacing={1}>
                  {/* Display base64 images */}
                  {editingPost.mediaBase64 && editingPost.mediaBase64.map((media, idx) => (
                    <Grid item xs={4} key={`edit-base64-${idx}`}>
                      <img
                        src={`data:${media.mimeType};base64,${media.data}`}
                        alt="Post media"
                        style={{
                          width: '100%',
                          height: '80px',
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                      />
                    </Grid>
                  ))}
                  
                  {/* Display URL images if no base64 */}
                  {(!editingPost.mediaBase64 || editingPost.mediaBase64.length === 0) && 
                    editingPost.mediaUrls && editingPost.mediaUrls.map((url, idx) => (
                    <Grid item xs={4} key={`edit-url-${idx}`}>
                      <img
                        src={url.startsWith('http') ? url : `http://localhost:5000${url}`}
                        alt="Post media"
                        style={{
                          width: '100%',
                          height: '80px',
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Note: Media editing is not supported. Create a new post to change images.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setEditDialog(false)}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdatePost}
            variant="contained"
            disabled={!editContent.trim()}
            sx={{ 
              textTransform: 'none',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              fontWeight: 600
            }}
          >
            Update Post
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmDialog}
        onClose={() => setDeleteConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>
            Delete Post
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete this post? This action cannot be undone.
          </Typography>
          {postToDelete && (
            <Box sx={{ 
              p: 2, 
              backgroundColor: 'grey.50', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'grey.200'
            }}>
              <Typography variant="body2" sx={{ 
                fontStyle: 'italic',
                maxHeight: 60,
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                "{postToDelete.content.substring(0, 100)}..."
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setDeleteConfirmDialog(false)}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDeletePost}
            variant="contained"
            color="error"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Delete Post
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CandidateDashboard;