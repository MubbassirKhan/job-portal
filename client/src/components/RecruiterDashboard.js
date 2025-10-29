import React, { useState, useEffect } from 'react';
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
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
  Badge,
  Stack,
} from '@mui/material';
import { 
  Work, 
  TrendingUp, 
  Add, 
  Assignment,
  CheckCircle,
  Schedule,
  PostAdd,
  Delete,
  Edit,
  Visibility,
  MoreVert,
  Block,
  CheckCircleOutline,
  Share,
  Favorite,
  ChatBubbleOutline,
  Public
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { jobsAPI, applicationsAPI } from '../utils/api';
import { socialAPI } from '../utils/socialAPI';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';

// Utility constants and functions
const StatCard = ({ icon, title, value, trend, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Card
      sx={{
        height: { xs: '120px', sm: '140px' },
        borderRadius: 0,
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(26, 26, 26, 0.9) 100%)',
        backdropFilter: 'blur(20px)',
        border: '2px solid rgba(0, 255, 136, 0.3)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #00ff88 0%, #22c55e 100%)',
        },
        '&:hover': {
          transform: 'translateY(-4px) scale(1.02)',
          border: '2px solid #00ff88',
          boxShadow: '0 12px 40px rgba(0, 255, 136, 0.2)',
          background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 0, 0, 0.9) 100%)',
        },
      }}
    >
      <CardContent sx={{ 
        p: { xs: 2, sm: 3 }, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between' 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800, 
                color: '#ffffff', 
                mb: 0.5,
                fontSize: { xs: '1.5rem', sm: '2rem' },
                lineHeight: 1.2,
                textShadow: '0 2px 10px rgba(0, 255, 136, 0.3)'
              }}
            >
              {value}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 600, 
                color: '#00ff88',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {title}
            </Typography>
          </Box>
          <Box
            sx={{
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
              borderRadius: 0,
              background: 'rgba(0, 255, 136, 0.2)',
              border: '1px solid rgba(0, 255, 136, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00ff88',
              flexShrink: 0,
              backdropFilter: 'blur(10px)',
            }}
          >
            {React.cloneElement(icon, { sx: { fontSize: { xs: 20, sm: 24 } } })}
          </Box>
        </Box>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <TrendingUp sx={{ fontSize: 14, color: '#22c55e', mr: 0.5 }} />
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#22c55e',
                fontWeight: 600,
                fontSize: '0.75rem',
                textTransform: 'uppercase'
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

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createJobDialog, setCreateJobDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [jobsRes, applicationsRes, statsRes] = await Promise.all([
        jobsAPI.getMyJobs({ limit: 5 }),
        applicationsAPI.getAllApplications({ limit: 5 }),
        jobsAPI.getJobStats(),
      ]);

      setJobs(jobsRes.data.data);
      setApplications(applicationsRes.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (data) => {
    try {
      const jobData = {
        ...data,
        requirements: data.requirements.split('\n').filter(req => req.trim()),
        skills: data.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
        salaryRange: {
          min: data.salaryMin ? parseInt(data.salaryMin) : undefined,
          max: data.salaryMax ? parseInt(data.salaryMax) : undefined,
          currency: data.currency || 'INR',
        },
      };

      await jobsAPI.createJob(jobData);
      toast.success('Job created successfully!');
      setCreateJobDialog(false);
      reset();
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create job');
    }
  };

  // Post Management Functions
  const fetchAllPosts = async () => {
    try {
      setPostsLoading(true);
      const response = await socialAPI.getRecruiterPosts(1, 20); // Fetch recruiter posts
      setPosts(response.data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to fetch posts');
    } finally {
      setPostsLoading(false);
    }
  };

  const handlePostAction = async (postId, action) => {
    try {
      switch (action) {
        case 'delete':
          await socialAPI.recruiterDeletePost(postId);
          toast.success('Post deleted successfully');
          break;
        case 'hide':
          await socialAPI.hidePost(postId);
          toast.success('Post hidden successfully');
          break;
        case 'approve':
          await socialAPI.approvePost(postId);
          toast.success('Post approved successfully');
          break;
        default:
          break;
      }
      fetchAllPosts(); // Refresh the posts list
    } catch (error) {
      toast.error(`Failed to ${action} post`);
    }
    setAnchorEl(null);
    setSelectedPost(null);
  };

  // Edit post functions
  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditContent(post.content);
    setEditDialog(true);
    setAnchorEl(null);
    setSelectedPost(null);
  };

  const handleUpdatePost = async () => {
    try {
      await socialAPI.updatePost(editingPost._id, { content: editContent });
      setPosts(prev => prev.map(post => 
        post._id === editingPost._id 
          ? { ...post, content: editContent }
          : post
      ));
      toast.success('Post updated successfully');
      setEditDialog(false);
      setEditingPost(null);
      setEditContent('');
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
    }
  };

  // Delete post functions
  const handleDeletePost = (post) => {
    setSelectedPost(post);
    setDeleteDialog(true);
    setAnchorEl(null);
  };

  const confirmDeletePost = async () => {
    try {
      await socialAPI.recruiterDeletePost(selectedPost._id);
      setPosts(prev => prev.filter(post => post._id !== selectedPost._id));
      toast.success('Post deleted successfully');
      setDeleteDialog(false);
      setSelectedPost(null);
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 1 && posts.length === 0) {
      fetchAllPosts();
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return format(postDate, 'MMM dd, yyyy');
  };

  const getPostStatusColor = (post) => {
    if (!post.isActive) return 'error';
    if (post.isHidden) return 'warning';
    return 'success';
  };

  const getPostStatusText = (post) => {
    if (!post.isActive) return 'Deleted';
    if (post.isHidden) return 'Hidden';
    return 'Active';
  };

  const getStatusColor = (status) => {
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
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
        p: { xs: 2, sm: 3 },
        pt: { xs: 4, sm: 5, md: 6 }
      }}>
      {/* Stats Cards - Always visible */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<Work />}
            title="Total Jobs"
            value={stats.totalJobs || 0}
            trend="+8% this month"
            delay={0.1}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<CheckCircle />}
            title="Active Jobs"
            value={stats.activeJobs || 0}
            trend="+12% this month"
            delay={0.2}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<Assignment />}
            title="Total Applications"
            value={stats.applicationStats?.total || 0}
            trend="+24% this month"
            delay={0.3}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<Schedule />}
            title="Pending Review"
            value={stats.applicationStats?.pending || 0}
            delay={0.4}
          />
        </Grid>
      </Grid>

      {/* Tab Navigation */}
      <Paper sx={{ 
        mb: 3, 
        borderRadius: 0,
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(26, 26, 26, 0.9) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 255, 136, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'uppercase',
              fontWeight: 700,
              fontSize: { xs: '0.8rem', sm: '1rem' },
              minHeight: 60,
              color: '#cccccc',
              letterSpacing: '0.5px',
              '&.Mui-selected': {
                color: '#00ff88'
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#00ff88',
              height: '3px'
            }
          }}
        >
          <Tab 
            icon={<Work sx={{ color: 'inherit' }} />} 
            label="Jobs & Applications" 
            iconPosition="start"
            sx={{ gap: 1 }}
          />
          <Tab 
            icon={<PostAdd sx={{ color: 'inherit' }} />} 
            label="Post Management" 
            iconPosition="start"
            sx={{ gap: 1 }}
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {/* Quick Actions */}
          <Grid item xs={12}>
            <Card
              sx={{
                borderRadius: 0,
                background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
                border: '2px solid rgba(0, 255, 136, 0.3)',
                backdropFilter: 'blur(10px)',
                mb: 3,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'linear-gradient(90deg, #00ff88 0%, #22c55e 100%)',
                },
                '&:hover': {
                  borderColor: 'rgba(0, 255, 136, 0.5)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0, 255, 136, 0.2)',
                }
              }}
            >
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  fontWeight: 700,
                  color: '#ffffff',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setCreateJobDialog(true)}
                    sx={{
                      background: 'linear-gradient(135deg, #00ff88 0%, #22c55e 100%)',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                      borderRadius: 0,
                      color: '#000000',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                        transform: 'translateY(-1px)',
                      }
                    }}
                  >
                    Post New Job
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/recruiter/jobs')}
                    sx={{
                      borderColor: '#00ff88',
                      color: '#00ff88',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                      borderRadius: 0,
                      '&:hover': {
                        borderColor: '#00ff88',
                        backgroundColor: 'rgba(0, 255, 136, 0.1)',
                        transform: 'translateY(-1px)',
                      }
                    }}
                  >
                    Manage Jobs
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/recruiter/applications')}
                    sx={{
                      borderColor: '#00ff88',
                      color: '#00ff88',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                      borderRadius: 0,
                      '&:hover': {
                        borderColor: '#00ff88',
                        backgroundColor: 'rgba(0, 255, 136, 0.1)',
                        transform: 'translateY(-1px)',
                      }
                    }}
                  >
                    Review Applications
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

        {/* Recent Jobs */}
        <Grid item xs={12} md={6}>
          <Card sx={{
            borderRadius: 0,
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(26, 26, 26, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 255, 136, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ 
                  color: '#00ff88', 
                  fontWeight: 700,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Recent Jobs
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => navigate('/recruiter/jobs')}
                  sx={{
                    borderColor: '#00ff88',
                    color: '#00ff88',
                    borderRadius: 0,
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    background: 'rgba(0, 255, 136, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #00ff88 0%, #22c55e 100%)',
                      color: '#000000',
                      borderColor: '#00ff88',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 20px rgba(0, 255, 136, 0.3)'
                    }
                  }}
                >
                  View All
                </Button>
              </Box>

              {jobs.length > 0 ? (
                <TableContainer sx={{ 
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: 0,
                  border: '1px solid rgba(0, 255, 136, 0.2)'
                }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ 
                        background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)'
                      }}>
                        <TableCell sx={{ 
                          fontWeight: 700, 
                          color: '#00ff88',
                          fontSize: { xs: '0.75rem', sm: '0.8rem' },
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          borderBottom: '2px solid rgba(0, 255, 136, 0.3)'
                        }}>Title</TableCell>
                        <TableCell align="center" sx={{ 
                          fontWeight: 700, 
                          color: '#00ff88',
                          fontSize: { xs: '0.75rem', sm: '0.8rem' },
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          borderBottom: '2px solid rgba(0, 255, 136, 0.3)'
                        }}>Applications</TableCell>
                        <TableCell align="center" sx={{ 
                          fontWeight: 700, 
                          color: '#00ff88',
                          fontSize: { xs: '0.75rem', sm: '0.8rem' },
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          borderBottom: '2px solid rgba(0, 255, 136, 0.3)'
                        }}>Status</TableCell>
                        <TableCell sx={{ 
                          fontWeight: 700, 
                          color: '#00ff88',
                          fontSize: { xs: '0.75rem', sm: '0.8rem' },
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          borderBottom: '2px solid rgba(0, 255, 136, 0.3)'
                        }}>Posted</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {jobs.map((job) => (
                        <TableRow key={job._id} sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(0, 255, 136, 0.05)',
                          }
                        }}>
                          <TableCell sx={{ borderBottom: '1px solid rgba(0, 255, 136, 0.1)' }}>
                            <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 600 }}>
                              {job.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#cccccc' }}>
                              {job.company}
                            </Typography>
                          </TableCell>
                          <TableCell align="center" sx={{ borderBottom: '1px solid rgba(0, 255, 136, 0.1)' }}>
                            <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 600 }}>
                              {job.applicationsCount || 0}
                            </Typography>
                          </TableCell>
                          <TableCell align="center" sx={{ borderBottom: '1px solid rgba(0, 255, 136, 0.1)' }}>
                            <Chip
                              label={job.isActive ? 'Active' : 'Inactive'}
                              color={job.isActive ? 'success' : 'default'}
                              size="small"
                              sx={{
                                borderRadius: 0,
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                backgroundColor: job.isActive ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                color: job.isActive ? '#00ff88' : '#cccccc',
                                border: job.isActive ? '1px solid #00ff88' : '1px solid rgba(255, 255, 255, 0.3)'
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid rgba(0, 255, 136, 0.1)' }}>
                            <Typography variant="body2" sx={{ color: '#cccccc' }}>
                              {format(new Date(job.createdAt), 'MMM dd')}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography sx={{ color: '#cccccc', fontWeight: 500 }}>
                    No jobs posted yet
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Applications */}
        <Grid item xs={12} md={6}>
          <Card sx={{
            borderRadius: 0,
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(26, 26, 26, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 255, 136, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ 
                  color: '#00ff88', 
                  fontWeight: 700,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Recent Applications</Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => navigate('/recruiter/applications')}
                  sx={{
                    borderColor: '#00ff88',
                    color: '#00ff88',
                    borderRadius: 0,
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 255, 136, 0.1)',
                      borderColor: '#00ff88',
                      transform: 'translateY(-1px)',
                    }
                  }}>
                  View All
                </Button>
              </Box>

              {applications.length > 0 ? (
                <TableContainer sx={{ 
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: 0,
                  border: '1px solid rgba(0, 255, 136, 0.2)'
                }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ 
                        background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)'
                      }}>
                        <TableCell sx={{ 
                          fontWeight: 700, 
                          color: '#00ff88',
                          fontSize: '0.875rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          borderBottom: '2px solid rgba(0, 255, 136, 0.3)'
                        }}>Candidate</TableCell>
                        <TableCell sx={{ 
                          fontWeight: 700, 
                          color: '#00ff88',
                          fontSize: '0.875rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          borderBottom: '2px solid rgba(0, 255, 136, 0.3)'
                        }}>Job</TableCell>
                        <TableCell align="center" sx={{ 
                          fontWeight: 700, 
                          color: '#00ff88',
                          fontSize: '0.875rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          borderBottom: '2px solid rgba(0, 255, 136, 0.3)'
                        }}>Status</TableCell>
                        <TableCell sx={{ 
                          fontWeight: 700, 
                          color: '#00ff88',
                          fontSize: '0.875rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          borderBottom: '2px solid rgba(0, 255, 136, 0.3)'
                        }}>Applied</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {applications.map((application) => (
                        <TableRow key={application._id} sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(0, 255, 136, 0.05)',
                          }
                        }}>
                          <TableCell sx={{ borderBottom: '1px solid rgba(0, 255, 136, 0.1)' }}>
                            <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 600 }}>
                              {application.candidateId?.profile?.firstName} {application.candidateId?.profile?.lastName}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid rgba(0, 255, 136, 0.1)' }}>
                            <Typography variant="body2" sx={{ color: '#cccccc' }}>
                              {application.jobId?.title}
                            </Typography>
                          </TableCell>
                          <TableCell align="center" sx={{ borderBottom: '1px solid rgba(0, 255, 136, 0.1)' }}>
                            <Chip
                              label={application.status}
                              color={getStatusColor(application.status)}
                              size="small"
                              sx={{
                                borderRadius: 0,
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid rgba(0, 255, 136, 0.1)' }}>
                            <Typography variant="body2" sx={{ color: '#cccccc' }}>
                              {format(new Date(application.appliedAt), 'MMM dd')}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography sx={{ color: '#cccccc', fontWeight: 500 }}>
                    No applications yet
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        </Grid>
      )}

      {/* Post Management Tab */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card
              sx={{
                borderRadius: 0,
                background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
                border: '2px solid rgba(0, 255, 136, 0.3)',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'linear-gradient(90deg, #00ff88 0%, #22c55e 100%)',
                },
                '&:hover': {
                  borderColor: 'rgba(0, 255, 136, 0.5)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0, 255, 136, 0.2)',
                }
              }}
            >
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700,
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    📱 Post Management
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={fetchAllPosts}
                    disabled={postsLoading}
                    startIcon={postsLoading ? <CircularProgress size={16} sx={{ color: '#00ff88' }} /> : null}
                    sx={{
                      borderColor: '#00ff88',
                      color: '#00ff88',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 0,
                      '&:hover': {
                        backgroundColor: 'rgba(0, 255, 136, 0.1)',
                        borderColor: '#00ff88',
                        transform: 'translateY(-1px)',
                      }
                    }}
                  >
                    Refresh
                  </Button>
                </Box>

                {postsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress sx={{ color: '#00ff88' }} />
                  </Box>
                ) : posts.length > 0 ? (
                  <Stack spacing={3}>
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
                            borderRadius: 0,
                            overflow: 'hidden',
                            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(26, 26, 26, 0.4) 100%)',
                            border: '1px solid rgba(0, 255, 136, 0.2)',
                            backdropFilter: 'blur(5px)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            '&:hover': {
                              boxShadow: '0 8px 25px rgba(0, 255, 136, 0.3)',
                              borderColor: '#00ff88',
                              background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(26, 26, 26, 0.6) 100%)',
                            }
                          }}
                        >
                          {/* Post Header */}
                          <CardContent sx={{ p: 3, pb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                              <Badge
                                overlap="circular"
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                badgeContent={
                                  <Box sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    backgroundColor: '#00ff88',
                                    border: '2px solid #000000'
                                  }} />
                                }
                              >
                                <Avatar
                                  src={post.author?.profile?.profileImage}
                                  sx={{ 
                                    width: 50,
                                    height: 50,
                                    mr: 2,
                                    borderRadius: 0,
                                    border: '2px solid #00ff88',
                                    boxShadow: '0 2px 8px rgba(0, 255, 136, 0.3)',
                                    backgroundColor: 'rgba(0, 255, 136, 0.2)',
                                    color: '#00ff88'
                                  }}
                                >
                                  {post.author?.profile?.firstName?.charAt(0) || 'U'}
                                </Avatar>
                              </Badge>
                              <Box sx={{ flex: 1 }}>
                                <Typography 
                                  variant="subtitle1" 
                                  sx={{ 
                                    fontWeight: 700,
                                    color: '#ffffff',
                                    fontSize: '1.1rem'
                                  }}
                                >
                                  {post.author?.profile?.firstName} {post.author?.profile?.lastName}
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    fontWeight: 500,
                                    fontSize: '0.875rem',
                                    color: '#cccccc'
                                  }}
                                >
                                  {post.author?.profile?.headline || (post.author?.role === 'admin' ? 'Recruiter' : post.author?.role)}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                  <Visibility sx={{ fontSize: 14, mr: 0.5, color: '#00ff88' }} />
                                  <Typography 
                                    variant="caption" 
                                    sx={{ fontSize: '0.75rem', color: '#cccccc' }}
                                  >
                                    {formatTimeAgo(post.createdAt)}
                                  </Typography>
                                  {post.visibility === 'public' && (
                                    <Tooltip title="Public post">
                                      <Public sx={{ fontSize: 14, ml: 1, color: '#00ff88' }} />
                                    </Tooltip>
                                  )}
                                </Box>
                              </Box>
                              
                              {/* Recruiter Actions Menu */}
                              <Tooltip title="Recruiter Actions">
                                <IconButton 
                                  size="small"
                                  onClick={(e) => {
                                    setAnchorEl(e.currentTarget);
                                    setSelectedPost(post);
                                  }}
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
                                fontSize: '1rem',
                                color: '#ffffff',
                                whiteSpace: 'pre-wrap' // Preserve line breaks and formatting
                              }}
                            >
                              {post.content}
                            </Typography>

                            {/* Post Type Indicator */}
                            {post.postType && post.postType !== 'text' && (
                              <Chip
                                label={post.postType.replace('_', ' ').toUpperCase()}
                                size="small"
                                sx={{ 
                                  mb: 2,
                                  background: 'rgba(0, 255, 136, 0.2)',
                                  color: '#00ff88',
                                  border: '1px solid #00ff88',
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                  borderRadius: 0
                                }}
                              />
                            )}

                            {/* Media Display */}
                            {((post.mediaUrls && post.mediaUrls.length > 0) || (post.mediaBase64 && post.mediaBase64.length > 0)) && (
                              <Box sx={{ mb: 2.5, mx: -3 }}>
                                <Grid container spacing={0}>
                                  {/* Display base64 images if available */}
                                  {post.mediaBase64 && post.mediaBase64.length > 0 && post.mediaBase64.map((media, idx) => (
                                    <Grid item xs={post.mediaBase64.length === 1 ? 12 : post.mediaBase64.length === 2 ? 6 : 4} key={`base64-${idx}`}>
                                      <Box
                                        sx={{
                                          position: 'relative',
                                          borderRadius: 0, // Square edges
                                          overflow: 'hidden',
                                          cursor: 'pointer',
                                          backgroundColor: '#f8fafc', // Light background for contrast
                                          border: '1px solid rgba(0,0,0,0.08)',
                                          '&:hover img': {
                                            transform: 'scale(1.05)'
                                          }
                                        }}
                                      >
                                        <img
                                          src={`data:${media.mimeType};base64,${media.data}`}
                                          alt="Post media"
                                          style={{
                                            width: '100%',
                                            height: 'auto', // Auto height to maintain aspect ratio
                                            maxHeight: post.mediaBase64.length === 1 ? '400px' : post.mediaBase64.length === 2 ? '300px' : '250px', // Max height constraint
                                            objectFit: 'contain', // Show full image without cropping
                                            transition: 'transform 0.3s ease',
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
                                  {(!post.mediaBase64 || post.mediaBase64.length === 0) && post.mediaUrls && post.mediaUrls.map((url, idx) => (
                                    <Grid item xs={post.mediaUrls.length === 1 ? 12 : post.mediaUrls.length === 2 ? 6 : 4} key={`url-${idx}`}>
                                      <Box
                                        sx={{
                                          position: 'relative',
                                          borderRadius: 0, // Square edges
                                          overflow: 'hidden',
                                          cursor: 'pointer',
                                          backgroundColor: '#f8fafc', // Light background for contrast
                                          border: '1px solid rgba(0,0,0,0.08)',
                                          '&:hover img': {
                                            transform: 'scale(1.05)'
                                          }
                                        }}
                                      >
                                        <img
                                          src={url.startsWith('http') ? url : `http://localhost:5000${url}`}
                                          alt="Post media"
                                          style={{
                                            width: '100%',
                                            height: 'auto', // Auto height to maintain aspect ratio
                                            maxHeight: post.mediaUrls.length === 1 ? '400px' : post.mediaUrls.length === 2 ? '300px' : '250px', // Max height constraint
                                            objectFit: 'contain', // Show full image without cropping
                                            transition: 'transform 0.3s ease',
                                            display: 'block'
                                          }}
                                          onError={(e) => {
                                            console.error('URL image failed to load:', url);
                                            e.target.style.display = 'none';
                                          }}
                                        />
                                      </Box>
                                    </Grid>
                                  ))}
                                </Grid>
                              </Box>
                            )}

                            {/* Post Stats & Status */}
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              mb: 1.5,
                              pt: 2,
                              borderTop: '1px solid rgba(0, 0, 0, 0.06)'
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                {/* Engagement Stats */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Favorite sx={{ color: '#ef4444', fontSize: 18 }} />
                                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                    {post.likes?.length || 0}
                                  </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <ChatBubbleOutline sx={{ color: '#1976d2', fontSize: 18 }} />
                                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                    {post.comments?.length || 0}
                                  </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Share sx={{ color: '#2e7d32', fontSize: 18 }} />
                                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                    {post.shares?.length || 0}
                                  </Typography>
                                </Box>
                              </Box>

                              {/* Post Status */}
                              <Chip
                                label={getPostStatusText(post)}
                                color={getPostStatusColor(post)}
                                size="small"
                                sx={{ 
                                  fontWeight: 600,
                                  borderRadius: 0 // Square edges
                                }}
                              />
                            </Box>
                          </CardContent>
                        </Paper>
                      </motion.div>
                    ))}
                  </Stack>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <PostAdd sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No posts found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Posts from users will appear here for moderation
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        )}
      </Box>

      {/* Action Menu for Posts */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => {
          setAnchorEl(null);
          setSelectedPost(null);
        }}
        PaperProps={{
          sx: { 
            minWidth: 200,
            borderRadius: 0 // Square edges
          }
        }}
      >
        <MenuItem onClick={() => handleEditPost(selectedPost)}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Post</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handlePostAction(selectedPost?._id, 'approve')}>
          <ListItemIcon>
            <CheckCircleOutline fontSize="small" />
          </ListItemIcon>
          <ListItemText>Approve Post</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handlePostAction(selectedPost?._id, 'hide')}>
          <ListItemIcon>
            <Block fontSize="small" />
          </ListItemIcon>
          <ListItemText>Hide Post</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDeletePost(selectedPost)}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Post</ListItemText>
        </MenuItem>
      </Menu>

      {/* Create Job Dialog */}
      <Dialog 
        open={createJobDialog} 
        onClose={() => setCreateJobDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 0,
            background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(0, 0, 0, 0.98) 100%)',
            border: '2px solid rgba(0, 255, 136, 0.3)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 0 30px rgba(0, 255, 136, 0.2)'
          }
        }}
      >
        <DialogTitle sx={{
          color: '#ffffff',
          textAlign: 'center',
          fontWeight: 700,
          fontSize: '1.5rem',
          borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
          background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)'
        }}>Post New Job</DialogTitle>
        <form onSubmit={handleSubmit(handleCreateJob)}>
          <DialogContent sx={{ 
            background: 'transparent',
            color: '#ffffff',
            pt: 3
          }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('title', { required: 'Job title is required' })}
                  fullWidth
                  label="Job Title"
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      color: '#ffffff',
                      '& fieldset': {
                        borderColor: 'rgba(0, 255, 136, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#00ff88',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#00ff88',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#cccccc',
                      '&.Mui-focused': {
                        color: '#00ff88',
                      },
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#ff6b6b',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('company', { required: 'Company name is required' })}
                  fullWidth
                  label="Company"
                  error={!!errors.company}
                  helperText={errors.company?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      color: '#ffffff',
                      '& fieldset': {
                        borderColor: 'rgba(0, 255, 136, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#00ff88',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#00ff88',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#cccccc',
                      '&.Mui-focused': {
                        color: '#00ff88',
                      },
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#ff6b6b',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('location', { required: 'Location is required' })}
                  fullWidth
                  label="Location"
                  error={!!errors.location}
                  helperText={errors.location?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      color: '#ffffff',
                      '& fieldset': {
                        borderColor: 'rgba(0, 255, 136, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#00ff88',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#00ff88',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#cccccc',
                      '&.Mui-focused': {
                        color: '#00ff88',
                      },
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#ff6b6b',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    color: '#ffffff',
                    '& fieldset': {
                      borderColor: 'rgba(0, 255, 136, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#00ff88',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#00ff88',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#cccccc',
                    '&.Mui-focused': {
                      color: '#00ff88',
                    },
                  },
                  '& .MuiSelect-icon': {
                    color: '#00ff88',
                  },
                }}>
                  <InputLabel>Job Type</InputLabel>
                  <Select
                    {...register('jobType', { required: 'Job type is required' })}
                    label="Job Type"
                    defaultValue="full-time"
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          borderRadius: 0,
                          backgroundColor: 'rgba(26, 26, 26, 0.95)',
                          border: '1px solid rgba(0, 255, 136, 0.3)',
                          '& .MuiMenuItem-root': {
                            color: '#ffffff',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 255, 136, 0.1)',
                            },
                            '&.Mui-selected': {
                              backgroundColor: 'rgba(0, 255, 136, 0.2)',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 255, 136, 0.3)',
                              },
                            },
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem value="full-time">Full Time</MenuItem>
                    <MenuItem value="part-time">Part Time</MenuItem>
                    <MenuItem value="contract">Contract</MenuItem>
                    <MenuItem value="internship">Internship</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    color: '#ffffff',
                    '& fieldset': {
                      borderColor: 'rgba(0, 255, 136, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#00ff88',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#00ff88',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#cccccc',
                    '&.Mui-focused': {
                      color: '#00ff88',
                    },
                  },
                  '& .MuiSelect-icon': {
                    color: '#00ff88',
                  },
                }}>
                  <InputLabel>Experience Level</InputLabel>
                  <Select
                    {...register('experienceLevel', { required: 'Experience level is required' })}
                    label="Experience Level"
                    defaultValue="mid"
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          borderRadius: 0,
                          backgroundColor: 'rgba(26, 26, 26, 0.95)',
                          border: '1px solid rgba(0, 255, 136, 0.3)',
                          '& .MuiMenuItem-root': {
                            color: '#ffffff',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 255, 136, 0.1)',
                            },
                            '&.Mui-selected': {
                              backgroundColor: 'rgba(0, 255, 136, 0.2)',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 255, 136, 0.3)',
                              },
                            },
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem value="entry">Entry Level</MenuItem>
                    <MenuItem value="mid">Mid Level</MenuItem>
                    <MenuItem value="senior">Senior Level</MenuItem>
                    <MenuItem value="executive">Executive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('applicationDeadline', { 
                    required: 'Application deadline is required',
                    validate: (value) => {
                      const selectedDate = new Date(value);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return selectedDate >= today || 'Application deadline cannot be in the past';
                    }
                  })}
                  fullWidth
                  label="Application Deadline"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ 
                    min: new Date().toISOString().split('T')[0] 
                  }}
                  error={!!errors.applicationDeadline}
                  helperText={errors.applicationDeadline?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      color: '#ffffff',
                      '& fieldset': {
                        borderColor: 'rgba(0, 255, 136, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#00ff88',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#00ff88',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#cccccc',
                      '&.Mui-focused': {
                        color: '#00ff88',
                      },
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#ff6b6b',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  {...register('salaryMin')}
                  fullWidth
                  label="Min Salary"
                  type="number"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      color: '#ffffff',
                      '& fieldset': {
                        borderColor: 'rgba(0, 255, 136, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#00ff88',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#00ff88',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#cccccc',
                      '&.Mui-focused': {
                        color: '#00ff88',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  {...register('salaryMax')}
                  fullWidth
                  label="Max Salary"
                  type="number"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      color: '#ffffff',
                      '& fieldset': {
                        borderColor: 'rgba(0, 255, 136, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#00ff88',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#00ff88',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#cccccc',
                      '&.Mui-focused': {
                        color: '#00ff88',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    color: '#ffffff',
                    '& fieldset': {
                      borderColor: 'rgba(0, 255, 136, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#00ff88',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#00ff88',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#cccccc',
                    '&.Mui-focused': {
                      color: '#00ff88',
                    },
                  },
                  '& .MuiSelect-icon': {
                    color: '#00ff88',
                  },
                }}>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    {...register('currency')}
                    label="Currency"
                    defaultValue="INR"
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          borderRadius: 0,
                          backgroundColor: 'rgba(26, 26, 26, 0.95)',
                          border: '1px solid rgba(0, 255, 136, 0.3)',
                          '& .MuiMenuItem-root': {
                            color: '#ffffff',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 255, 136, 0.1)',
                            },
                            '&.Mui-selected': {
                              backgroundColor: 'rgba(0, 255, 136, 0.2)',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 255, 136, 0.3)',
                              },
                            },
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem value="INR">INR</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  {...register('description', { required: 'Job description is required' })}
                  fullWidth
                  label="Job Description"
                  multiline
                  rows={4}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      color: '#ffffff',
                      '& fieldset': {
                        borderColor: 'rgba(0, 255, 136, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#00ff88',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#00ff88',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#cccccc',
                      '&.Mui-focused': {
                        color: '#00ff88',
                      },
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#ff6b6b',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  {...register('requirements')}
                  fullWidth
                  label="Requirements"
                  multiline
                  rows={3}
                  helperText="Enter each requirement on a new line"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      '& fieldset': {
                        borderColor: '#00ff88',
                      },
                      '&:hover fieldset': {
                        borderColor: '#00ff88',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#00ff88',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#00ff88',
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#888',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  {...register('skills')}
                  fullWidth
                  label="Required Skills"
                  helperText="Separate skills with commas"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      '& fieldset': {
                        borderColor: '#00ff88',
                      },
                      '&:hover fieldset': {
                        borderColor: '#00ff88',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#00ff88',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#00ff88',
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#888',
                    },
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', borderTop: '1px solid #00ff88' }}>
            <Button 
              onClick={() => setCreateJobDialog(false)}
              sx={{
                color: '#ff6b6b',
                borderRadius: 0,
                '&:hover': {
                  backgroundColor: 'rgba(255, 107, 107, 0.1)',
                },
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              sx={{
                backgroundColor: '#00ff88',
                color: 'black',
                borderRadius: 0,
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#00cc6a',
                },
              }}
            >
              Post Job
            </Button>
          </DialogActions>
        </form>
      </Dialog>

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
        <DialogTitle sx={{ borderRadius: 0 }}>Edit Post</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Post Content"
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            sx={{ 
              mt: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 0 // Square edges
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setEditDialog(false)}
            sx={{ borderRadius: 0 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdatePost} 
            variant="contained"
            sx={{ borderRadius: 0 }}
          >
            Update Post
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        PaperProps={{
          sx: { borderRadius: 0 } // Square edges
        }}
      >
        <DialogTitle sx={{ borderRadius: 0 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this post? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setDeleteDialog(false)}
            sx={{ borderRadius: 0 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDeletePost} 
            variant="contained" 
            color="error"
            sx={{ borderRadius: 0 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RecruiterDashboard;