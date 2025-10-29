import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Avatar,
  Tooltip,
  Divider,
  LinearProgress,
  Skeleton,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Visibility,
  Download,
  Check,
  Close,
  Assignment,
  Email,
  Phone,
  LocationOn,
  Work,
  Schedule,
  Search,
  Refresh,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  QuestionAnswer,
  Share,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { applicationsAPI } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { SERVER_BASE_URL } from '../config/api';

const RecruiterApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [cvDialog, setCvDialog] = useState(false);
  const [selectedCvUrl, setSelectedCvUrl] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationsAPI.getAllApplications();
      setApplications(response.data.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await applicationsAPI.updateApplicationStatus(applicationId, { status: newStatus });
      toast.success(`Application ${newStatus} successfully!`);
      fetchApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update application status');
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus || selectedStatus === selectedApplication.status) {
      toast.info('Please select a different status to update');
      return;
    }

    try {
      setIsUpdatingStatus(true);
      await applicationsAPI.updateApplicationStatus(selectedApplication._id, { status: selectedStatus });
      toast.success(`Application status updated to ${selectedStatus} successfully!`);
      
      // Update the selected application in state
      setSelectedApplication(prev => ({ ...prev, status: selectedStatus }));
      
      // Refresh the applications list
      fetchApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update application status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleOpenCv = (resumeUrl) => {
    setSelectedCvUrl(`${SERVER_BASE_URL}${resumeUrl}`);
    setCvDialog(true);
  };

  const handleCloseCv = () => {
    setCvDialog(false);
    setSelectedCvUrl('');
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: '#f59e0b',
      reviewing: '#3b82f6',
      shortlisted: '#6366f1',
      interview: '#ec4899',
      accepted: '#10b981',
      rejected: '#ef4444',
    };
    return statusColors[status] || '#64748b';
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      pending: <HourglassEmpty />,
      reviewing: <Assignment />,
      shortlisted: <CheckCircle />,
      interview: <QuestionAnswer />,
      accepted: <Check />,
      rejected: <Cancel />,
    };
    return statusIcons[status] || <Assignment />;
  };

  const filteredApplications = applications.filter(app => {
    const matchesFilter = filterStatus === 'all' || app.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      app.candidateId?.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.candidateId?.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.candidateId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobId?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    reviewing: applications.filter(app => app.status === 'reviewing').length,
    accepted: applications.filter(app => app.status === 'accepted').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
  };

  const StatsCard = ({ icon, title, value, percentage, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.01 }}
    >
      <Card
        sx={{
          height: '140px',
          borderRadius: 0,
          border: '2px solid rgba(0, 255, 136, 0.4)',
          background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
          transition: 'all 0.3s ease-in-out',
          position: 'relative',
          overflow: 'hidden',
          backdropFilter: 'blur(10px)',
          cursor: 'pointer',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #00ff88 0%, #00e676 100%)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-150%',
            left: '-150%',
            width: '300%',
            height: '300%',
            background: 'linear-gradient(45deg, transparent 20%, rgba(0, 255, 136, 0.25) 40%, rgba(0, 255, 136, 0.3) 50%, rgba(0, 255, 136, 0.25) 60%, transparent 80%)',
            transition: 'all 0.6s ease-in-out',
            transform: 'rotate(45deg)',
            opacity: 0,
          },
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0, 255, 136, 0.2)',
            borderColor: '#00ff88',
            '&::after': {
              bottom: '150%',
              left: '150%',
              opacity: 1,
            },
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
                  background: 'linear-gradient(135deg, #00ff88 0%, #00e676 50%, #ffffff 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
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
                  color: 'rgba(255, 255, 255, 0.8)',
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
                borderRadius: 0,
                background: 'rgba(0, 255, 136, 0.2)',
                border: '1px solid rgba(0, 255, 136, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00ff88',
                flexShrink: 0,
              }}
            >
              {React.cloneElement(icon, { sx: { fontSize: 24 } })}
            </Box>
          </Box>
          {percentage !== undefined && percentage !== 100 && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={percentage}
                sx={{
                  width: 60,
                  height: 4,
                  borderRadius: 0,
                  backgroundColor: 'rgba(0, 255, 136, 0.2)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#00ff88',
                  },
                }}
              />
              <Typography 
                variant="caption" 
                sx={{ 
                  ml: 1, 
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: 500,
                  fontSize: '0.75rem'
                }}
              >
                {percentage}%
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const LoadingSkeleton = () => (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
      pt: { xs: 10, sm: 12, md: 14 },
      pb: 4,
      width: '100%',
      margin: 0,
      padding: 0,
    }}>
      <Container maxWidth={false} sx={{ px: { xs: 1, sm: 2, md: 4 }, width: '100%' }}>
        <Skeleton variant="text" width="300px" height={48} sx={{ mb: 2, bgcolor: 'rgba(0, 255, 136, 0.1)' }} />
        <Skeleton variant="text" width="200px" height={24} sx={{ mb: 4, bgcolor: 'rgba(0, 255, 136, 0.1)' }} />
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Skeleton variant="rounded" height={120} sx={{ bgcolor: 'rgba(0, 255, 136, 0.1)' }} />
            </Grid>
          ))}
        </Grid>
        
        <Skeleton variant="rounded" height={400} sx={{ bgcolor: 'rgba(0, 255, 136, 0.1)' }} />
      </Container>
    </Box>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
      pt: { xs: 10, sm: 12, md: 14 },
      pb: 4,
      width: '100%',
      margin: 0,
      padding: 0,
    }}>
      <Container maxWidth={false} sx={{ px: { xs: 1, sm: 2, md: 4 }, width: '100%' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ mb: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #00ff88 0%, #00e676 50%, #ffffff 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                  }}
                >
                  Application Management
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 400, color: 'rgba(255, 255, 255, 0.8)' }}>
                  Review and manage job applications from candidates
              </Typography>
            </Box>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<Refresh />}
                onClick={fetchApplications}
                sx={{
                  background: '#00ff88',
                  color: '#000000',
                  borderRadius: 0,
                  px: 3,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  border: '2px solid #00ff88',
                  boxShadow: '0 8px 30px rgba(0, 255, 136, 0.3)',
                  '&:hover': {
                    background: 'transparent',
                    color: '#00ff88',
                    boxShadow: '0 12px 40px rgba(0, 255, 136, 0.4)',
                  }
                }}
              >
                Refresh Data
              </Button>
            </motion.div>
          </Box>
        </Box>
      </motion.div>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<Assignment />}
            title="Total Applications"
            value={stats.total}
            percentage={100}
            index={0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<HourglassEmpty />}
            title="Pending Review"
            value={stats.pending}
            percentage={stats.total ? Math.round((stats.pending / stats.total) * 100) : 0}
            index={1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<CheckCircle />}
            title="Accepted"
            value={stats.accepted}
            percentage={stats.total ? Math.round((stats.accepted / stats.total) * 100) : 0}
            index={2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<Cancel />}
            title="Rejected"
            value={stats.rejected}
            percentage={stats.total ? Math.round((stats.rejected / stats.total) * 100) : 0}
            index={3}
          />
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card
          sx={{
            borderRadius: 0,
            border: '2px solid rgba(0, 255, 136, 0.4)',
            mb: 4,
            background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: '#00ff88' }} />
                      </InputAdornment>
                    ),
                  }}
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
                      color: '#00ff88',
                      '&.Mui-focused': {
                        color: '#00ff88',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
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
                    color: '#00ff88',
                    '&.Mui-focused': {
                      color: '#00ff88',
                    },
                  },
                  '& .MuiSelect-icon': {
                    color: '#00ff88',
                  },
                }}>
                  <InputLabel>Filter by Status</InputLabel>
                  <Select
                    value={filterStatus}
                    label="Filter by Status"
                    onChange={(e) => setFilterStatus(e.target.value)}
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
                    <MenuItem value="all">All Applications</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="reviewing">Reviewing</MenuItem>
                    <MenuItem value="interview">Interview</MenuItem>
                    <MenuItem value="accepted">Accepted</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#00ff88' }}>
                    {filteredApplications.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Results Found
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      {/* Applications Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card
          sx={{
            borderRadius: 0,
            border: '2px solid rgba(0, 255, 136, 0.4)',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, borderBottom: '1px solid rgba(0, 255, 136, 0.4)' }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#ffffff' }}>
                Applications ({filteredApplications.length})
              </Typography>
            </Box>

            {filteredApplications.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(0, 255, 136, 0.1)' }}>
                      <TableCell sx={{ fontWeight: 600, color: '#00ff88', borderBottom: '1px solid rgba(0, 255, 136, 0.3)' }}>Candidate</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#00ff88', borderBottom: '1px solid rgba(0, 255, 136, 0.3)' }}>Job Position</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#00ff88', borderBottom: '1px solid rgba(0, 255, 136, 0.3)' }}>Applied Date</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, color: '#00ff88', borderBottom: '1px solid rgba(0, 255, 136, 0.3)' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#00ff88', borderBottom: '1px solid rgba(0, 255, 136, 0.3)' }}>Resume</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, color: '#00ff88', borderBottom: '1px solid rgba(0, 255, 136, 0.3)' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <AnimatePresence>
                      {filteredApplications.map((application, index) => (
                        <motion.tr
                          key={application._id}
                          component={TableRow}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          whileHover={{ x: 4 }}
                          sx={{
                            backgroundColor: 'rgba(0, 0, 0, 0.3)',
                            borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: '0px',
                              background: 'linear-gradient(90deg, #00ff88, rgba(0, 255, 136, 0.5))',
                              transition: 'width 0.3s ease-in-out',
                            },
                            '&:hover': {
                              backgroundColor: 'rgba(0, 255, 136, 0.15)',
                              boxShadow: '0 4px 20px rgba(0, 255, 136, 0.2)',
                              borderColor: 'rgba(0, 255, 136, 0.4)',
                              transition: 'all 0.3s ease-in-out',
                              '&::before': {
                                width: '4px',
                              }
                            }
                          }}
                        >
                          <TableCell sx={{ borderBottom: '1px solid rgba(0, 255, 136, 0.2)' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar
                                sx={{
                                  width: 48,
                                  height: 48,
                                  background: 'rgba(0, 255, 136, 0.2)',
                                  border: '1px solid rgba(0, 255, 136, 0.6)',
                                  borderRadius: 0,
                                  fontWeight: 600,
                                  color: '#00ff88',
                                }}
                              >
                                {application.candidateId?.profile?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, color: '#ffffff' }}>
                                  {application.candidateId?.profile?.firstName} {application.candidateId?.profile?.lastName}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Email sx={{ fontSize: 14, color: '#00ff88' }} />
                                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                    {application.candidateId?.email}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid rgba(0, 255, 136, 0.2)' }}>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, color: '#ffffff' }}>
                                {application.jobId?.title}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Work sx={{ fontSize: 14, color: '#00ff88' }} />
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                  {application.jobId?.company}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid rgba(0, 255, 136, 0.2)' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Schedule sx={{ fontSize: 16, color: '#00ff88' }} />
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                {format(new Date(application.createdAt), 'MMM dd, yyyy')}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center" sx={{ borderBottom: '1px solid rgba(0, 255, 136, 0.2)' }}>
                            <Chip
                              icon={getStatusIcon(application.status)}
                              label={application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                              size="small"
                              sx={{
                                backgroundColor: `${getStatusColor(application.status)}20`,
                                color: getStatusColor(application.status),
                                fontWeight: 500,
                                border: `1px solid ${getStatusColor(application.status)}60`,
                                borderRadius: 0,
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid rgba(0, 255, 136, 0.2)' }}>
                            {application.resume ? (
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                  size="small"
                                  startIcon={<Visibility />}
                                  onClick={() => handleOpenCv(application.resume)}
                                  sx={{
                                    textTransform: 'none',
                                    color: '#00ff88',
                                    borderRadius: 0,
                                    fontWeight: 500,
                                    border: '1px solid rgba(0, 255, 136, 0.3)',
                                    '&:hover': {
                                      backgroundColor: 'rgba(0, 255, 136, 0.1)',
                                      borderColor: '#00ff88'
                                    }
                                  }}
                                >
                                  View CV
                                </Button>
                                <Button
                                  size="small"
                                  startIcon={<Download />}
                                  onClick={() => window.open(`${SERVER_BASE_URL}${application.resume}`, '_blank')}
                                  sx={{
                                    textTransform: 'none',
                                    color: '#00ff88',
                                    borderRadius: 0,
                                    fontWeight: 500,
                                    border: '1px solid rgba(0, 255, 136, 0.3)',
                                    '&:hover': {
                                      backgroundColor: 'rgba(0, 255, 136, 0.1)',
                                      borderColor: '#00ff88'
                                    }
                                  }}
                                >
                                  Download
                                </Button>
                              </Box>
                            ) : (
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                No resume
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center" sx={{ borderBottom: '1px solid rgba(0, 255, 136, 0.2)' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedApplication(application);
                                    setSelectedStatus(application.status);
                                    setViewDialog(true);
                                  }}
                                  sx={{
                                    color: '#00ff88',
                                    borderRadius: 0,
                                    border: '1px solid rgba(0, 255, 136, 0.3)',
                                    '&:hover': { 
                                      backgroundColor: 'rgba(0, 255, 136, 0.1)',
                                      borderColor: '#00ff88'
                                    }
                                  }}
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                              {application.status === 'pending' && (
                                <>
                                  <Tooltip title="Accept">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleStatusUpdate(application._id, 'reviewing')}
                                      sx={{
                                        color: '#00ff88',
                                        borderRadius: 0,
                                        border: '1px solid rgba(0, 255, 136, 0.3)',
                                        '&:hover': { 
                                          backgroundColor: 'rgba(0, 255, 136, 0.1)',
                                          borderColor: '#00ff88'
                                        }
                                      }}
                                    >
                                      <Check />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Reject">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleStatusUpdate(application._id, 'rejected')}
                                      sx={{
                                        color: '#ff6b6b',
                                        borderRadius: 0,
                                        border: '1px solid rgba(255, 107, 107, 0.3)',
                                        '&:hover': { 
                                          backgroundColor: 'rgba(255, 107, 107, 0.1)',
                                          borderColor: '#ff6b6b'
                                        }
                                      }}
                                    >
                                      <Close />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            </Box>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Assignment sx={{ fontSize: 80, color: 'rgba(0, 255, 136, 0.3)', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 1, color: '#ffffff' }}>
                  No applications found
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search criteria' 
                    : 'Applications will appear here when candidates apply to your jobs'
                  }
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Application Details Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 0,
            border: '2px solid rgba(0, 255, 136, 0.6)',
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(15px)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.5)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #00ff88 0%, #22c55e 100%)',
            }
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 0, 0, 0.8) 100%)',
            color: '#ffffff',
            borderRadius: 0,
            p: 3,
            borderBottom: '1px solid rgba(0, 255, 136, 0.4)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Visibility sx={{ color: '#00ff88' }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#00ff88' }}>
              Application Details
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3, backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
          {selectedApplication && (
            <Box>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      borderRadius: 0,
                      border: '2px solid rgba(0, 255, 136, 0.4)',
                      background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#00ff88' }}>
                        Candidate Information
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <Avatar
                          sx={{
                            width: 60,
                            height: 60,
                            background: 'rgba(0, 255, 136, 0.2)',
                            border: '1px solid rgba(0, 255, 136, 0.6)',
                            borderRadius: 0,
                            fontSize: '1.5rem',
                            fontWeight: 600,
                            color: '#00ff88',
                          }}
                        >
                          {selectedApplication.candidateId?.profile?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#ffffff' }}>
                            {selectedApplication.candidateId?.profile?.firstName} {selectedApplication.candidateId?.profile?.lastName}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            Candidate Profile
                          </Typography>
                        </Box>
                      </Box>
                      <Divider sx={{ mb: 2, borderColor: 'rgba(0, 255, 136, 0.3)' }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Email sx={{ fontSize: 18, color: '#00ff88' }} />
                        <Typography variant="body2" sx={{ color: '#ffffff' }}>
                          <strong>Email:</strong> {selectedApplication.candidateId?.email}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Phone sx={{ fontSize: 18, color: '#00ff88' }} />
                        <Typography variant="body2" sx={{ color: '#ffffff' }}>
                          <strong>Phone:</strong> {selectedApplication.candidateId?.profile?.phone || 'Not provided'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      borderRadius: 0,
                      backgroundColor: '#1a1a1a',
                      border: '1px solid rgba(0, 255, 136, 0.3)',
                      boxShadow: '0 4px 12px rgba(0, 255, 136, 0.1)',
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#00ff88' }}>
                        Job Information
                      </Typography>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#ffffff' }}>
                          {selectedApplication.jobId?.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Position Applied For
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 2, borderColor: 'rgba(0, 255, 136, 0.3)' }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Work sx={{ fontSize: 18, color: '#00ff88' }} />
                        <Typography variant="body2" sx={{ color: '#ffffff' }}>
                          <strong>Company:</strong> {selectedApplication.jobId?.company}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn sx={{ fontSize: 18, color: '#00ff88' }} />
                        <Typography variant="body2" sx={{ color: '#ffffff' }}>
                          <strong>Location:</strong> {selectedApplication.jobId?.location}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Card
                sx={{
                  borderRadius: 0,
                  backgroundColor: '#1a1a1a',
                  border: '1px solid rgba(0, 255, 136, 0.3)',
                  boxShadow: '0 4px 12px rgba(0, 255, 136, 0.1)',
                  mb: 3,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#00ff88', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <QuestionAnswer sx={{ fontSize: 20 }} />
                    Cover Letter
                  </Typography>
                  <Box
                    sx={{
                      p: 4,
                      borderRadius: 0,
                      backgroundColor: 'rgba(0, 255, 136, 0.08)',
                      border: '1px solid rgba(0, 255, 136, 0.3)',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '4px',
                        background: 'linear-gradient(180deg, #00ff88 0%, rgba(0, 255, 136, 0.5) 100%)',
                      }
                    }}
                  >
                    {selectedApplication.coverLetter ? (
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          lineHeight: 1.8, 
                          color: '#ffffff',
                          fontSize: '1rem',
                          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                          whiteSpace: 'pre-wrap',
                          '& p': {
                            margin: '0 0 16px 0',
                          }
                        }}
                      >
                        {selectedApplication.coverLetter.split('\n').map((paragraph, index) => (
                          paragraph.trim() ? (
                            <Typography key={index} component="p" sx={{ mb: 2, color: '#ffffff', lineHeight: 1.8 }}>
                              {paragraph.trim()}
                            </Typography>
                          ) : (
                            <Box key={index} sx={{ height: '8px' }} />
                          )
                        ))}
                      </Typography>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <QuestionAnswer sx={{ fontSize: 48, color: 'rgba(0, 255, 136, 0.3)', mb: 1 }} />
                        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontStyle: 'italic' }}>
                          No cover letter provided
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>

              <Card
                sx={{
                  borderRadius: 0,
                  backgroundColor: '#1a1a1a',
                  border: '1px solid rgba(0, 255, 136, 0.3)',
                  boxShadow: '0 4px 12px rgba(0, 255, 136, 0.1)',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#00ff88', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ fontSize: 20 }} />
                    Application Status Management
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', minWidth: '100px' }}>
                        Current Status:
                      </Typography>
                      <Chip
                        label={selectedApplication.status}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(selectedApplication.status),
                          color: 'white',
                          fontWeight: 500,
                          borderRadius: 0,
                          textTransform: 'capitalize',
                        }}
                      />
                    </Box>
                  </Box>

                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel sx={{ color: '#00ff88' }}>Select New Status</InputLabel>
                    <Select
                      value={selectedStatus}
                      label="Select New Status"
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      sx={{
                        borderRadius: 0,
                        backgroundColor: '#000000',
                        color: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(0, 255, 136, 0.5)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#00ff88',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#00ff88',
                        },
                        '& .MuiSelect-icon': {
                          color: '#00ff88',
                        },
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            backgroundColor: '#1a1a1a',
                            border: '1px solid rgba(0, 255, 136, 0.3)',
                            borderRadius: 0,
                            '& .MuiMenuItem-root': {
                              color: '#ffffff',
                              textTransform: 'capitalize',
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
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="reviewing">Reviewing</MenuItem>
                      <MenuItem value="interview">Interview</MenuItem>
                      <MenuItem value="accepted">Accepted</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                    </Select>
                  </FormControl>

                  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Button
                      variant="contained"
                      onClick={handleUpdateStatus}
                      disabled={isUpdatingStatus || !selectedStatus || selectedStatus === selectedApplication.status}
                      sx={{
                        background: selectedStatus && selectedStatus !== selectedApplication.status 
                          ? 'linear-gradient(135deg, #00ff88 0%, #22c55e 100%)' 
                          : 'rgba(0, 255, 136, 0.3)',
                        color: selectedStatus && selectedStatus !== selectedApplication.status ? '#000000' : 'rgba(255, 255, 255, 0.5)',
                        borderRadius: 0,
                        px: 3,
                        py: 1,
                        fontWeight: 600,
                        textTransform: 'none',
                        minWidth: '120px',
                        '&:hover': {
                          background: selectedStatus && selectedStatus !== selectedApplication.status 
                            ? 'linear-gradient(135deg, #22c55e 0%, #00ff88 100%)' 
                            : 'rgba(0, 255, 136, 0.3)',
                        },
                        '&:disabled': {
                          background: 'rgba(0, 255, 136, 0.2)',
                          color: 'rgba(255, 255, 255, 0.3)',
                        }
                      }}
                    >
                      {isUpdatingStatus ? 'Updating...' : 'Update Status'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setSelectedStatus(selectedApplication.status)}
                      disabled={isUpdatingStatus}
                      sx={{
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        color: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: 0,
                        px: 3,
                        py: 1,
                        fontWeight: 500,
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        }
                      }}
                    >
                      Reset
                    </Button>
                  </Box>

                  <Divider sx={{ mb: 2, borderColor: 'rgba(0, 255, 136, 0.3)' }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Schedule sx={{ fontSize: 18, color: '#00ff88' }} />
                    <Typography variant="body2" sx={{ color: '#ffffff' }}>
                      <strong>Applied on:</strong> {format(new Date(selectedApplication.createdAt), 'MMMM dd, yyyy \'at\' h:mm a')}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          gap: 2, 
          backgroundColor: '#000000',
          borderTop: '1px solid rgba(0, 255, 136, 0.3)'
        }}>
          <Button
            onClick={() => setViewDialog(false)}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 0,
              textTransform: 'none',
              fontWeight: 500,
              color: '#00ff88',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              '&:hover': {
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                borderColor: '#00ff88',
              }
            }}
          >
            Close
          </Button>
          {selectedApplication?.resume && (
            <>
              <Button
                variant="outlined"
                startIcon={<Visibility />}
                onClick={() => handleOpenCv(selectedApplication.resume)}
                sx={{
                  borderColor: 'rgba(0, 255, 136, 0.5)',
                  color: '#00ff88',
                  px: 3,
                  py: 1,
                  borderRadius: 0,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#00ff88',
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                  }
                }}
              >
                View Resume
              </Button>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={() => window.open(`${SERVER_BASE_URL}${selectedApplication.resume}`, '_blank')}
                sx={{
                  background: 'linear-gradient(135deg, #00ff88 0%, #22c55e 100%)',
                  color: '#000000',
                  px: 3,
                  py: 1,
                  borderRadius: 0,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #22c55e 0%, #00ff88 100%)',
                  }
                }}
              >
                Download Resume
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* CV Viewer Dialog */}
      <Dialog
        open={cvDialog}
        onClose={handleCloseCv}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 0,
            overflow: 'hidden',
            maxHeight: '90vh',
            backgroundColor: '#000000',
            border: '2px solid rgba(0, 255, 136, 0.6)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.8)',
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.3) 0%, rgba(0, 0, 0, 0.8) 100%)',
            color: '#ffffff',
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(0, 255, 136, 0.4)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Visibility />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Resume Viewer
            </Typography>
          </Box>
          <IconButton
            onClick={handleCloseCv}
            sx={{
              color: '#00ff88',
              '&:hover': {
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
              }
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, backgroundColor: '#000000' }}>
          {selectedCvUrl && (
            <Box
              sx={{
                width: '100%',
                height: '70vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#1a1a1a',
              }}
            >
              {selectedCvUrl.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={selectedCvUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                  title="Resume PDF Viewer"
                />
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    p: 4,
                  }}
                >
                  <img
                    src={selectedCvUrl}
                    alt="Resume"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                      borderRadius: '8px',
                    }}
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          p: 2, 
          gap: 1, 
          backgroundColor: '#000000',
          borderTop: '1px solid rgba(0, 255, 136, 0.3)'
        }}>
          <Button
            onClick={handleCloseCv}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 0,
              textTransform: 'none',
              fontWeight: 500,
              color: '#00ff88',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              '&:hover': {
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                borderColor: '#00ff88',
              }
            }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => window.open(selectedCvUrl, '_blank')}
            sx={{
              background: 'linear-gradient(135deg, #00ff88 0%, #22c55e 100%)',
              color: '#000000',
              px: 3,
              py: 1,
              borderRadius: 0,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #22c55e 0%, #00ff88 100%)',
              }
            }}
          >
            Download
          </Button>
          <Button
            variant="outlined"
            startIcon={<Share />}
            onClick={() => window.open(selectedCvUrl, '_blank')}
            sx={{
              borderColor: 'rgba(0, 255, 136, 0.5)',
              color: '#00ff88',
              px: 3,
              py: 1,
              borderRadius: 0,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#00ff88',
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
              }
            }}
          >
            Open in New Tab
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
  );
};

export default RecruiterApplications;