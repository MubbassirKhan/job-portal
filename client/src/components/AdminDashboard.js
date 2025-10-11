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
} from '@mui/material';
import { 
  Work, 
  TrendingUp, 
  Add, 
  Assignment,
  CheckCircle,
  Schedule
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { jobsAPI, applicationsAPI } from '../utils/api';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';

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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createJobDialog, setCreateJobDialog] = useState(false);
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
          currency: data.currency || 'USD',
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
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Stats Cards */}
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

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card
            sx={{
              borderRadius: '16px',
              border: '1px solid',
              borderColor: 'grey.200',
              mb: 3,
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setCreateJobDialog(true)}
                  sx={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    borderRadius: '8px',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    }
                  }}
                >
                  Post New Job
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/jobs')}
                  sx={{
                    borderColor: '#6366f1',
                    color: '#6366f1',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    borderRadius: '8px',
                    '&:hover': {
                      borderColor: '#4f46e5',
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    }
                  }}
                >
                  Manage Jobs
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/applications')}
                  sx={{
                    borderColor: '#10b981',
                    color: '#10b981',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    borderRadius: '8px',
                    '&:hover': {
                      borderColor: '#059669',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
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
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Recent Jobs</Typography>
                <Button variant="outlined" size="small">
                  View All
                </Button>
              </Box>

              {jobs.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell align="center">Applications</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell>Posted</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {jobs.map((job) => (
                        <TableRow key={job._id}>
                          <TableCell>
                            <Typography variant="subtitle2">
                              {job.title}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {job.company}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            {job.applicationsCount || 0}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={job.isActive ? 'Active' : 'Inactive'}
                              color={job.isActive ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {format(new Date(job.createdAt), 'MMM dd')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography color="textSecondary">
                    No jobs posted yet
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Applications */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Recent Applications</Typography>
                <Button variant="outlined" size="small">
                  View All
                </Button>
              </Box>

              {applications.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Candidate</TableCell>
                        <TableCell>Job</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell>Applied</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {applications.map((application) => (
                        <TableRow key={application._id}>
                          <TableCell>
                            <Typography variant="subtitle2">
                              {application.candidateId?.profile?.firstName} {application.candidateId?.profile?.lastName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {application.jobId?.title}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={application.status}
                              color={getStatusColor(application.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {format(new Date(application.appliedAt), 'MMM dd')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography color="textSecondary">
                    No applications yet
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Create Job Dialog */}
      <Dialog open={createJobDialog} onClose={() => setCreateJobDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Post New Job</DialogTitle>
        <form onSubmit={handleSubmit(handleCreateJob)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('title', { required: 'Job title is required' })}
                  fullWidth
                  label="Job Title"
                  error={!!errors.title}
                  helperText={errors.title?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('company', { required: 'Company name is required' })}
                  fullWidth
                  label="Company"
                  error={!!errors.company}
                  helperText={errors.company?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('location', { required: 'Location is required' })}
                  fullWidth
                  label="Location"
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
                    defaultValue="full-time"
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
                  <InputLabel>Experience Level</InputLabel>
                  <Select
                    {...register('experienceLevel', { required: 'Experience level is required' })}
                    label="Experience Level"
                    defaultValue="mid"
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
                  {...register('applicationDeadline', { required: 'Application deadline is required' })}
                  fullWidth
                  label="Application Deadline"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.applicationDeadline}
                  helperText={errors.applicationDeadline?.message}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  {...register('salaryMin')}
                  fullWidth
                  label="Min Salary"
                  type="number"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  {...register('salaryMax')}
                  fullWidth
                  label="Max Salary"
                  type="number"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
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
                  {...register('description', { required: 'Job description is required' })}
                  fullWidth
                  label="Job Description"
                  multiline
                  rows={4}
                  error={!!errors.description}
                  helperText={errors.description?.message}
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
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  {...register('skills')}
                  fullWidth
                  label="Required Skills"
                  helperText="Separate skills with commas"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateJobDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Post Job
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default AdminDashboard;