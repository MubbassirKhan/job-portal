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
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
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
    setEditDialog(true);
    setMenuAnchor(null);
  };

  const handleDeletePost = async (postId) => {
    try {
      await socialAPI.deletePost(postId);
      setUserPosts(prev => prev.filter(post => post._id !== postId));
      setMenuAnchor(null);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleUpdatePost = async () => {
    try {
      await socialAPI.updatePost(editingPost._id, { content: editContent });
      setUserPosts(prev => prev.map(post => 
        post._id === editingPost._id 
          ? { ...post, content: editContent }
          : post
      ));
      setEditDialog(false);
      setEditingPost(null);
      setEditContent('');
    } catch (error) {
      console.error('Error updating post:', error);
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
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'grey.200',
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
                      borderRadius: '8px',
                      fontWeight: 500,
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
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        textTransform: 'none',
                        borderRadius: '8px',
                        fontWeight: 600,
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
                              mb: 2,
                              border: '1px solid',
                              borderColor: 'grey.200',
                              borderRadius: '12px',
                              '&:hover': {
                                borderColor: 'grey.300',
                              },
                            }}
                          >
                            <CardContent sx={{ p: 3 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Avatar
                                    src={user?.profile?.profileImage}
                                    sx={{ width: 40, height: 40 }}
                                  >
                                    {user?.profile?.firstName?.charAt(0)}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                      {user?.profile?.firstName} {user?.profile?.lastName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {formatTimeAgo(post.createdAt)}
                                    </Typography>
                                  </Box>
                                </Box>
                                <IconButton
                                  onClick={(e) => handleMenuClick(e, post)}
                                  size="small"
                                >
                                  <MoreVert />
                                </IconButton>
                              </Box>

                              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                                {post.content}
                              </Typography>

                              {/* Post Media */}
                              {post.mediaUrls && post.mediaUrls.length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                  <Grid container spacing={1}>
                                    {post.mediaUrls.slice(0, 2).map((url, idx) => (
                                      <Grid item xs={6} key={idx}>
                                        <img
                                          src={url.startsWith('http') ? url : `http://localhost:5000${url}`}
                                          alt="Post media"
                                          style={{
                                            width: '100%',
                                            height: '120px',
                                            objectFit: 'cover',
                                            borderRadius: '8px'
                                          }}
                                        />
                                      </Grid>
                                    ))}
                                  </Grid>
                                </Box>
                              )}

                              {/* Post Stats */}
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: '1px solid', borderColor: 'grey.100' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Favorite sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary">
                                      {post.likes?.length || 0} likes
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <ChatBubbleOutline sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary">
                                      {post.comments?.length || 0} comments
                                    </Typography>
                                  </Box>
                                </Box>
                                <Chip 
                                  label={post.visibility} 
                                  size="small" 
                                  variant="outlined"
                                  sx={{ textTransform: 'capitalize' }}
                                />
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
      >
        <MenuItem onClick={() => handleEditPost(selectedPost)}>
          <Edit sx={{ mr: 1, fontSize: 18 }} />
          Edit Post
        </MenuItem>
        <MenuItem 
          onClick={() => handleDeletePost(selectedPost?._id)}
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
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Post</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Post Content"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleUpdatePost}
            variant="contained"
            disabled={!editContent.trim()}
          >
            Update Post
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CandidateDashboard;