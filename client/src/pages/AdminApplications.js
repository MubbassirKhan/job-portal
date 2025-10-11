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

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [cvDialog, setCvDialog] = useState(false);
  const [selectedCvUrl, setSelectedCvUrl] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleOpenCv = (resumeUrl) => {
    setSelectedCvUrl(`http://localhost:5000${resumeUrl}`);
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
          {percentage !== undefined && percentage !== 100 && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={percentage}
                sx={{
                  width: 60,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#6366f1',
                  },
                }}
              />
              <Typography 
                variant="caption" 
                sx={{ 
                  ml: 1, 
                  color: 'text.secondary',
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Skeleton variant="text" width="300px" height={48} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="200px" height={24} sx={{ mb: 4 }} />
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[...Array(4)].map((_, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Skeleton variant="rounded" height={120} />
          </Grid>
        ))}
      </Grid>
      
      <Skeleton variant="rounded" height={400} />
    </Container>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
                  background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                }}
              >
                Application Management
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
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
                  background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                  borderRadius: '12px',
                  px: 3,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: '0 8px 30px rgba(16, 185, 129, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    boxShadow: '0 12px 40px rgba(16, 185, 129, 0.4)',
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
            borderRadius: '16px',
            border: '1px solid',
            borderColor: 'grey.200',
            mb: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
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
                        <Search sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Filter by Status</InputLabel>
                  <Select
                    value={filterStatus}
                    label="Filter by Status"
                    onChange={(e) => setFilterStatus(e.target.value)}
                    sx={{
                      borderRadius: '12px',
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
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {filteredApplications.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
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
            borderRadius: '20px',
            border: '1px solid',
            borderColor: 'grey.200',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'grey.200' }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Applications ({filteredApplications.length})
              </Typography>
            </Box>

            {filteredApplications.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Candidate</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Job Position</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Applied Date</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, color: '#1e293b' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Resume</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, color: '#1e293b' }}>Actions</TableCell>
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
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(99, 102, 241, 0.02)',
                              transform: 'translateX(4px)',
                              transition: 'all 0.2s ease-in-out',
                            }
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar
                                sx={{
                                  width: 48,
                                  height: 48,
                                  background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                                  fontWeight: 600,
                                }}
                              >
                                {application.candidateId?.profile?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                  {application.candidateId?.profile?.firstName} {application.candidateId?.profile?.lastName}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Email sx={{ fontSize: 14, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {application.candidateId?.email}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {application.jobId?.title}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Work sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {application.jobId?.company}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {format(new Date(application.createdAt), 'MMM dd, yyyy')}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              icon={getStatusIcon(application.status)}
                              label={application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                              size="small"
                              sx={{
                                backgroundColor: `${getStatusColor(application.status)}15`,
                                color: getStatusColor(application.status),
                                fontWeight: 500,
                                border: `1px solid ${getStatusColor(application.status)}30`,
                                borderRadius: '8px',
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {application.resume ? (
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                  size="small"
                                  startIcon={<Visibility />}
                                  onClick={() => handleOpenCv(application.resume)}
                                  sx={{
                                    textTransform: 'none',
                                    color: '#6366f1',
                                    fontWeight: 500,
                                    '&:hover': {
                                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                    }
                                  }}
                                >
                                  View CV
                                </Button>
                                <Button
                                  size="small"
                                  startIcon={<Download />}
                                  onClick={() => window.open(`http://localhost:5000${application.resume}`, '_blank')}
                                  sx={{
                                    textTransform: 'none',
                                    color: '#10b981',
                                    fontWeight: 500,
                                    '&:hover': {
                                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                    }
                                  }}
                                >
                                  Download
                                </Button>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No resume
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedApplication(application);
                                    setViewDialog(true);
                                  }}
                                  sx={{
                                    color: '#6366f1',
                                    '&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.1)' }
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
                                        color: '#10b981',
                                        '&:hover': { backgroundColor: 'rgba(16, 185, 129, 0.1)' }
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
                                        color: '#ef4444',
                                        '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' }
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
                <Assignment sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No applications found
                </Typography>
                <Typography variant="body2" color="text.secondary">
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
            borderRadius: '20px',
            border: '1px solid',
            borderColor: 'grey.200',
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            color: 'white',
            borderRadius: '20px 20px 0 0',
            p: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Visibility />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Application Details
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedApplication && (
            <Box>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      borderRadius: '16px',
                      border: '1px solid',
                      borderColor: 'grey.200',
                      background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#6366f1' }}>
                        Candidate Information
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <Avatar
                          sx={{
                            width: 60,
                            height: 60,
                            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                            fontSize: '1.5rem',
                            fontWeight: 600,
                          }}
                        >
                          {selectedApplication.candidateId?.profile?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {selectedApplication.candidateId?.profile?.firstName} {selectedApplication.candidateId?.profile?.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Candidate Profile
                          </Typography>
                        </Box>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Email sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          <strong>Email:</strong> {selectedApplication.candidateId?.email}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Phone sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          <strong>Phone:</strong> {selectedApplication.candidateId?.profile?.phone || 'Not provided'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      borderRadius: '16px',
                      border: '1px solid',
                      borderColor: 'grey.200',
                      background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#10b981' }}>
                        Job Information
                      </Typography>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {selectedApplication.jobId?.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Position Applied For
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Work sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          <strong>Company:</strong> {selectedApplication.jobId?.company}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          <strong>Location:</strong> {selectedApplication.jobId?.location}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Card
                sx={{
                  borderRadius: '16px',
                  border: '1px solid',
                  borderColor: 'grey.200',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                  mb: 3,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#ec4899' }}>
                    Cover Letter
                  </Typography>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: '12px',
                      backgroundColor: 'rgba(99, 102, 241, 0.05)',
                      border: '1px solid rgba(99, 102, 241, 0.1)',
                    }}
                  >
                    <Typography variant="body2" sx={{ lineHeight: 1.8, fontStyle: 'italic' }}>
                      {selectedApplication.coverLetter || 'No cover letter provided'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              <Card
                sx={{
                  borderRadius: '16px',
                  border: '1px solid',
                  borderColor: 'grey.200',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#f59e0b' }}>
                    Application Status Management
                  </Typography>
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Update Status</InputLabel>
                    <Select
                      value={selectedApplication.status}
                      label="Update Status"
                      onChange={(e) => handleStatusUpdate(selectedApplication._id, e.target.value)}
                      sx={{
                        borderRadius: '12px',
                      }}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="reviewing">Reviewing</MenuItem>
                      <MenuItem value="interview">Interview</MenuItem>
                      <MenuItem value="accepted">Accepted</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                    </Select>
                  </FormControl>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Schedule sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      <strong>Applied on:</strong> {format(new Date(selectedApplication.createdAt), 'MMMM dd, yyyy \'at\' h:mm a')}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setViewDialog(false)}
            sx={{
              px: 3,
              py: 1,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
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
                  borderColor: '#6366f1',
                  color: '#6366f1',
                  px: 3,
                  py: 1,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  }
                }}
              >
                View Resume
              </Button>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={() => window.open(`http://localhost:5000${selectedApplication.resume}`, '_blank')}
                sx={{
                  background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                  px: 3,
                  py: 1,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
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
            borderRadius: '16px',
            overflow: 'hidden',
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
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
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedCvUrl && (
            <Box
              sx={{
                width: '100%',
                height: '70vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f8fafc',
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
        <DialogActions sx={{ p: 2, gap: 1, backgroundColor: '#f8fafc' }}>
          <Button
            onClick={handleCloseCv}
            sx={{
              px: 3,
              py: 1,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => window.open(selectedCvUrl, '_blank')}
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
              px: 3,
              py: 1,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
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
              borderColor: '#6366f1',
              color: '#6366f1',
              px: 3,
              py: 1,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
              }
            }}
          >
            Open in New Tab
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminApplications;