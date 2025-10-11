import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { LocationOn, Work, AttachMoney, Schedule, Send } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { jobsAPI, applicationsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applyDialog, setApplyDialog] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await jobsAPI.getJob(id);
        setJob(response.data.data);
      } catch (error) {
        toast.error('Job not found');
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, navigate]);

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'candidate') {
      toast.error('Only candidates can apply to jobs');
      return;
    }

    setApplyDialog(true);
  };

  const submitApplication = async () => {
    setApplying(true);
    try {
      await applicationsAPI.applyToJob({
        jobId: job._id,
        coverLetter,
      });
      toast.success('Application submitted successfully!');
      setApplyDialog(false);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (salaryRange) => {
    if (!salaryRange.min && !salaryRange.max) return 'Salary not specified';
    if (salaryRange.min && salaryRange.max) {
      return `${salaryRange.currency} ${salaryRange.min.toLocaleString()} - ${salaryRange.max.toLocaleString()}`;
    }
    if (salaryRange.min) return `${salaryRange.currency} ${salaryRange.min.toLocaleString()}+`;
    return `Up to ${salaryRange.currency} ${salaryRange.max.toLocaleString()}`;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!job) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" textAlign="center">
          Job not found
        </Typography>
      </Container>
    );
  }

  const hasApplied = job.applications && job.applications.length > 0;
  const isDeadlinePassed = job.applicationDeadline && new Date() > new Date(job.applicationDeadline);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4 }}>
            <Box mb={3}>
              <Typography variant="h4" component="h1" gutterBottom>
                {job.title}
              </Typography>
              <Typography variant="h6" color="primary" gutterBottom>
                {job.company}
              </Typography>
              
              <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
                <Box display="flex" alignItems="center">
                  <LocationOn color="action" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">{job.location}</Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <Work color="action" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">
                    {job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1)}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <AttachMoney color="action" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">
                    {formatSalary(job.salaryRange)}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <Schedule color="action" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">
                    Posted {format(new Date(job.createdAt), 'MMM dd, yyyy')}
                  </Typography>
                </Box>
              </Box>

              <Chip 
                label={job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)} 
                color="primary" 
                variant="outlined" 
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                Job Description
              </Typography>
              <Typography variant="body1" paragraph style={{ whiteSpace: 'pre-line' }}>
                {job.description}
              </Typography>
            </Box>

            {job.requirements && job.requirements.length > 0 && (
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                  Requirements
                </Typography>
                <ul>
                  {job.requirements.map((requirement, index) => (
                    <li key={index}>
                      <Typography variant="body1">{requirement}</Typography>
                    </li>
                  ))}
                </ul>
              </Box>
            )}

            {job.skills && job.skills.length > 0 && (
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                  Required Skills
                </Typography>
                <Box>
                  {job.skills.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Application Details
            </Typography>
            
            {job.applicationDeadline && (
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Application Deadline
                </Typography>
                <Typography variant="body1">
                  {format(new Date(job.applicationDeadline), 'MMM dd, yyyy')}
                </Typography>
              </Box>
            )}

            <Box mb={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Applications
              </Typography>
              <Typography variant="body1">
                {job.applicationsCount || 0} applicants
              </Typography>
            </Box>

            {isAuthenticated && user?.role === 'candidate' && (
              <Box>
                {hasApplied ? (
                  <Button
                    fullWidth
                    variant="outlined"
                    disabled
                    sx={{ mb: 2 }}
                  >
                    Already Applied
                  </Button>
                ) : isDeadlinePassed ? (
                  <Button
                    fullWidth
                    variant="outlined"
                    disabled
                    sx={{ mb: 2 }}
                  >
                    Application Deadline Passed
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<Send />}
                    onClick={handleApply}
                    sx={{ mb: 2 }}
                  >
                    Apply Now
                  </Button>
                )}
              </Box>
            )}

            {!isAuthenticated && (
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => navigate('/login')}
                sx={{ mb: 2 }}
              >
                Login to Apply
              </Button>
            )}
          </Paper>

          {job.postedBy && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Posted By
              </Typography>
              <Typography variant="body1">
                {job.postedBy.profile?.firstName} {job.postedBy.profile?.lastName}
              </Typography>
              {job.postedBy.profile?.bio && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {job.postedBy.profile.bio}
                </Typography>
              )}
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Application Dialog */}
      <Dialog open={applyDialog} onClose={() => setApplyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Apply for {job.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Write a cover letter to highlight your interest and qualifications for this position.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Cover Letter"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Tell the employer why you're the perfect fit for this role..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplyDialog(false)}>Cancel</Button>
          <Button
            onClick={submitApplication}
            variant="contained"
            disabled={applying}
          >
            {applying ? 'Submitting...' : 'Submit Application'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default JobDetails;