import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Avatar,
  Skeleton,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Work,
  LocationOn,
  Business,
  TrendingUp,
  Assessment,
  Schedule,
  Person,
  CheckCircle,
  Cancel,
  FilterList,
  Download,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { jobsAPI } from '../utils/api';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';

const AdminJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createJobDialog, setCreateJobDialog] = useState(false);
  const [editJobDialog, setEditJobDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [deleteJobDialog, setDeleteJobDialog] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getMyJobs();
      setJobs(response.data.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to fetch jobs');
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
          currency: data.currency || 'USD',
        },
        // Convert isActive boolean to proper format
        isActive: data.isActive === true || data.isActive === 'true'
      };

      await jobsAPI.createJob(jobData);
      toast.success('Job created successfully!');
      setCreateJobDialog(false);
      reset();
      fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create job');
    }
  };

  const handleEditJob = async (data) => {
    try {
      const jobData = {
        ...data,
        requirements: data.requirements.split('\n').filter(req => req.trim()),
        skills: data.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
        salaryRange: {
          min: data.salaryMin ? parseInt(data.salaryMin) : undefined,
          max: data.salaryMax ? parseInt(data.salaryMax) : undefined,
          currency: data.currency || 'USD',
        },
        // Convert isActive boolean to proper format
        isActive: data.isActive === true || data.isActive === 'true'
      };

      await jobsAPI.updateJob(selectedJob._id, jobData);
      toast.success('Job updated successfully!');
      setEditJobDialog(false);
      setSelectedJob(null);
      reset();
      fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update job');
    }
  };

  const handleDeleteJob = async () => {
    try {
      await jobsAPI.deleteJob(selectedJob._id);
      toast.success('Job deleted successfully!');
      setDeleteJobDialog(false);
      setSelectedJob(null);
      fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete job');
    }
  };

  const openEditDialog = (job) => {
    setSelectedJob(job);
    setValue('title', job.title);
    setValue('company', job.company);
    setValue('description', job.description);
    setValue('requirements', job.requirements.join('\n'));
    setValue('skills', job.skills.join(', '));
    setValue('location', job.location);
    setValue('jobType', job.jobType);
    setValue('salaryMin', job.salaryRange?.min || '');
    setValue('salaryMax', job.salaryRange?.max || '');
    setValue('currency', job.salaryRange?.currency || 'USD');
    setValue('applicationDeadline', job.applicationDeadline ? job.applicationDeadline.split('T')[0] : '');
    setValue('isActive', job.isActive);
    setEditJobDialog(true);
  };

  const getJobTypeColor = (type) => {
    const colors = {
      'full-time': '#10b981',
      'part-time': '#f59e0b',
      'contract': '#6366f1',
      'internship': '#ec4899',
    };
    return colors[type] || '#64748b';
  };

  const StatsCard = ({ icon, title, value, trend, index }) => (
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
                +{trend}% this month
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
        {[...Array(3)].map((_, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Skeleton variant="rounded" height={120} />
          </Grid>
        ))}
      </Grid>
      
      <Skeleton variant="rounded" height={400} />
    </Container>
  );

  const formatJobType = (type) => {
    if (!type) return 'Not Specified';
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const JobForm = ({ onSubmit, isEdit = false }) => (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            {...register('title', { required: 'Job title is required' })}
            label="Job Title"
            fullWidth
            error={!!errors.title}
            helperText={errors.title?.message}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('company', { required: 'Company name is required' })}
            label="Company"
            fullWidth
            error={!!errors.company}
            helperText={errors.company?.message}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('location', { required: 'Location is required' })}
            label="Location"
            fullWidth
            error={!!errors.location}
            helperText={errors.location?.message}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Job Type</InputLabel>
            <Select
              {...register('jobType', { required: 'Job type is required' })}
              label="Job Type"
              error={!!errors.jobType}
            >
              <MenuItem value="full-time">Full Time</MenuItem>
              <MenuItem value="part-time">Part Time</MenuItem>
              <MenuItem value="contract">Contract</MenuItem>
              <MenuItem value="internship">Internship</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              {...register('isActive')}
              label="Status"
              defaultValue={true}
            >
              <MenuItem value={true}>Active</MenuItem>
              <MenuItem value={false}>Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            {...register('description', { required: 'Description is required' })}
            label="Job Description"
            multiline
            rows={4}
            fullWidth
            error={!!errors.description}
            helperText={errors.description?.message}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            {...register('requirements')}
            label="Requirements (one per line)"
            multiline
            rows={3}
            fullWidth
            helperText="Enter each requirement on a new line"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            {...register('skills')}
            label="Required Skills (comma separated)"
            fullWidth
            helperText="e.g., JavaScript, React, Node.js"
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            {...register('salaryMin')}
            label="Min Salary"
            type="number"
            fullWidth
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            {...register('salaryMax')}
            label="Max Salary"
            type="number"
            fullWidth
          />
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth>
            <InputLabel>Currency</InputLabel>
            <Select
              {...register('currency')}
              label="Currency"
              defaultValue="USD"
            >
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="EUR">EUR</MenuItem>
              <MenuItem value="GBP">GBP</MenuItem>
              <MenuItem value="INR">INR</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            {...register('applicationDeadline', { required: 'Application deadline is required' })}
            label="Application Deadline"
            type="date"
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            error={!!errors.applicationDeadline}
            helperText={errors.applicationDeadline?.message}
          />
        </Grid>
      </Grid>
    </form>
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
                Job Management
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                Create, edit, and manage your job postings with advanced analytics
              </Typography>
            </Box>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<Add />}
                onClick={() => setCreateJobDialog(true)}
                sx={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                  borderRadius: '12px',
                  px: 3,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: '0 8px 30px rgba(99, 102, 241, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #db2777 100%)',
                    boxShadow: '0 12px 40px rgba(99, 102, 241, 0.4)',
                  }
                }}
              >
                Post New Job
              </Button>
            </motion.div>
          </Box>
        </Box>
      </motion.div>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<Work />}
            title="Total Jobs"
            value={jobs.length}
            trend={12}
            index={0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<CheckCircle />}
            title="Active Jobs"
            value={jobs.filter(job => job.isActive === true).length}
            trend={8}
            index={1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<Cancel />}
            title="Inactive Jobs"
            value={jobs.filter(job => job.isActive === false).length}
            index={2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<Assessment />}
            title="Total Applications"
            value={jobs.reduce((sum, job) => sum + (job.applicationsCount || 0), 0)}
            trend={24}
            index={3}
          />
        </Grid>
      </Grid>

      {/* Jobs Table */}
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    All Job Postings
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage and track all your job listings
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Filter Jobs">
                    <IconButton
                      sx={{
                        background: 'rgba(99, 102, 241, 0.1)',
                        color: '#6366f1',
                        '&:hover': { background: 'rgba(99, 102, 241, 0.2)' }
                      }}
                    >
                      <FilterList />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Export Data">
                    <IconButton
                      sx={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981',
                        '&:hover': { background: 'rgba(16, 185, 129, 0.2)' }
                      }}
                    >
                      <Download />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>

            {jobs.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Job Details</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Location & Type</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, color: '#1e293b' }}>Applications</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, color: '#1e293b' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Posted</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, color: '#1e293b' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <AnimatePresence>
                      {jobs.map((job, index) => (
                        <motion.tr
                          key={job._id}
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
                                  background: `linear-gradient(135deg, ${getJobTypeColor(job.jobType)} 0%, ${getJobTypeColor(job.jobType)}80 100%)`,
                                  fontWeight: 600,
                                }}
                              >
                                <Work />
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                  {job.title}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Business sx={{ fontSize: 16, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {job.company}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2">{job.location}</Typography>
                              </Box>
                              <Chip
                                label={formatJobType(job.jobType)}
                                size="small"
                                sx={{
                                  backgroundColor: `${getJobTypeColor(job.jobType)}15`,
                                  color: getJobTypeColor(job.jobType),
                                  fontWeight: 500,
                                  border: `1px solid ${getJobTypeColor(job.jobType)}30`,
                                }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Badge
                              badgeContent={job.applicationsCount || 0}
                              color="primary"
                              sx={{
                                '& .MuiBadge-badge': {
                                  background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                                  fontWeight: 600,
                                }
                              }}
                            >
                              <Person sx={{ color: 'text.secondary' }} />
                            </Badge>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={job.isActive ? 'Active' : 'Inactive'}
                              color={job.isActive ? 'success' : 'error'}
                              size="small"
                              sx={{
                                fontWeight: 500,
                                borderRadius: '8px',
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {format(new Date(job.createdAt), 'MMM dd, yyyy')}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                              <Tooltip title="View Job">
                                <IconButton
                                  size="small"
                                  onClick={() => navigate(`/jobs/${job._id}`)}
                                  sx={{
                                    color: '#6366f1',
                                    '&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.1)' }
                                  }}
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit Job">
                                <IconButton
                                  size="small"
                                  onClick={() => openEditDialog(job)}
                                  sx={{
                                    color: '#10b981',
                                    '&:hover': { backgroundColor: 'rgba(16, 185, 129, 0.1)' }
                                  }}
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Job">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    setSelectedJob(job);
                                    setDeleteJobDialog(true);
                                  }}
                                  sx={{
                                    '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' }
                                  }}
                                >
                                  <Delete />
                                </IconButton>
                              </Tooltip>
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
                <Work sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No jobs posted yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Create your first job posting to get started
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setCreateJobDialog(true)}
                  sx={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                    borderRadius: '12px',
                  }}
                >
                  Post Your First Job
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Job Dialog */}
      <Dialog
        open={createJobDialog}
        onClose={() => setCreateJobDialog(false)}
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
            <Add />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Create New Job Posting
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ mt: 2 }}>
            <JobForm onSubmit={handleCreateJob} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setCreateJobDialog(false)}
            sx={{
              px: 3,
              py: 1,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(handleCreateJob)}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              px: 3,
              py: 1,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #db2777 100%)',
              }
            }}
          >
            Create Job
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Job Dialog */}
      <Dialog
        open={editJobDialog}
        onClose={() => setEditJobDialog(false)}
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
            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            color: 'white',
            borderRadius: '20px 20px 0 0',
            p: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Edit />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Edit Job Posting
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ mt: 2 }}>
            <JobForm onSubmit={handleEditJob} isEdit />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setEditJobDialog(false)}
            sx={{
              px: 3,
              py: 1,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(handleEditJob)}
            variant="contained"
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
            Update Job
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteJobDialog}
        onClose={() => setDeleteJobDialog(false)}
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
            background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
            color: 'white',
            borderRadius: '20px 20px 0 0',
            p: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Delete />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Delete Job Posting
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
            Are you sure you want to delete <strong>"{selectedJob?.title}"</strong>? 
            This action cannot be undone and will permanently remove all associated applications.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setDeleteJobDialog(false)}
            sx={{
              px: 3,
              py: 1,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteJob}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
              px: 3,
              py: 1,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
              }
            }}
          >
            Delete Job
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminJobs;