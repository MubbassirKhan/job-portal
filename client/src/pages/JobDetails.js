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
import { 
  LocationOn, 
  Work, 
  AttachMoney, 
  Schedule, 
  Send, 
  ArrowBack,
  BusinessCenter,
  CheckCircle,
  Person,
  Email,
  Phone,
  Language
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
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
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }
        }}
      >
        <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <CircularProgress 
            size={60} 
            sx={{ 
              color: '#00ff88',
              mb: 2,
              filter: 'drop-shadow(0 0 20px rgba(0, 255, 136, 0.6))'
            }} 
          />
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#ffffff',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            Loading Job Details...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!job) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }
        }}
      >
        <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              color: '#ffffff',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              mb: 2
            }}
          >
            Job Not Found
          </Typography>
          <Button
            onClick={() => navigate('/jobs')}
            variant="contained"
            startIcon={<ArrowBack />}
            sx={{
              background: '#00ff88',
              color: '#000000',
              fontWeight: 700,
              textTransform: 'uppercase',
              borderRadius: 0,
              '&:hover': {
                background: '#22c55e',
              }
            }}
          >
            Back to Jobs
          </Button>
        </Box>
      </Box>
    );
  }

  const hasApplied = job.applications && job.applications.length > 0;
  const isDeadlinePassed = job.applicationDeadline && new Date() > new Date(job.applicationDeadline);

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2, md: 4 }, position: 'relative', zIndex: 1 }}>
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            onClick={() => navigate('/jobs')}
            startIcon={<ArrowBack />}
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              mb: { xs: 2, sm: 3 },
              textTransform: 'uppercase',
              fontWeight: 600,
              letterSpacing: '0.5px',
              '&:hover': {
                color: '#00ff88',
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
              }
            }}
          >
            Back to Jobs
          </Button>
        </motion.div>

        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          <Grid item xs={12} md={8}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Paper 
                sx={{ 
                  p: { xs: 3, sm: 4 },
                  background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
                  border: '2px solid rgba(0, 255, 136, 0.4)',
                  borderRadius: 0,
                  backdropFilter: 'blur(10px)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    background: 'linear-gradient(90deg, #00ff88 0%, #22c55e 100%)',
                  }
                }}
              >
                <Box mb={3}>
                  <Typography 
                    variant="h4" 
                    component="h1" 
                    sx={{
                      color: '#ffffff',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: { xs: '0.5px', sm: '1px' },
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                      mb: 2,
                      lineHeight: 1.2
                    }}
                  >
                    {job.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <BusinessCenter sx={{ color: '#00ff88', fontSize: 24 }} />
                    <Typography 
                      variant="h6" 
                      sx={{
                        color: '#00ff88',
                        fontWeight: 600,
                        fontSize: { xs: '1.1rem', sm: '1.25rem' }
                      }}
                    >
                      {job.company}
                    </Typography>
                  </Box>
              
                  <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, border: '1px solid rgba(0, 255, 136, 0.4)', background: 'rgba(0, 255, 136, 0.08)' }}>
                        <LocationOn sx={{ color: '#00ff88', fontSize: 20 }} />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontWeight: 500,
                            fontSize: { xs: '0.85rem', sm: '0.9rem' }
                          }}
                        >
                          {job.location}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, border: '1px solid rgba(0, 255, 136, 0.4)', background: 'rgba(0, 255, 136, 0.08)' }}>
                        <Work sx={{ color: '#00ff88', fontSize: 20 }} />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontWeight: 500,
                            fontSize: { xs: '0.85rem', sm: '0.9rem' }
                          }}
                        >
                          {job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, border: '1px solid rgba(0, 255, 136, 0.4)', background: 'rgba(0, 255, 136, 0.08)' }}>
                        <AttachMoney sx={{ color: '#00ff88', fontSize: 20 }} />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontWeight: 500,
                            fontSize: { xs: '0.85rem', sm: '0.9rem' }
                          }}
                        >
                          {formatSalary(job.salaryRange)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, border: '1px solid rgba(0, 255, 136, 0.4)', background: 'rgba(0, 255, 136, 0.08)' }}>
                        <Schedule sx={{ color: '#00ff88', fontSize: 20 }} />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontWeight: 500,
                            fontSize: { xs: '0.85rem', sm: '0.9rem' }
                          }}
                        >
                          Posted {format(new Date(job.createdAt), 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Chip 
                    label={job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)} 
                    sx={{
                      backgroundColor: 'rgba(0, 255, 136, 0.15)',
                      color: '#00ff88',
                      fontWeight: 600,
                      border: '1px solid rgba(0, 255, 136, 0.4)',
                      borderRadius: 0,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontSize: '0.8rem',
                    }}
                  />
                </Box>

                <Divider sx={{ my: 4, borderColor: 'rgba(0, 255, 136, 0.3)' }} />

                <Box mb={4}>
                  <Typography 
                    variant="h5" 
                    sx={{
                      color: '#ffffff',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      mb: 3,
                      fontSize: { xs: '1.2rem', sm: '1.5rem' },
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -8,
                        left: 0,
                        width: '60px',
                        height: '3px',
                        background: '#00ff88',
                      }
                    }}
                  >
                    Job Description
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: 1.8,
                      fontSize: { xs: '0.95rem', sm: '1rem' },
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {job.description}
                  </Typography>
                </Box>

                {job.requirements && job.requirements.length > 0 && (
                  <Box mb={4}>
                    <Typography 
                      variant="h5" 
                      sx={{
                        color: '#ffffff',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        mb: 3,
                        fontSize: { xs: '1.2rem', sm: '1.5rem' },
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: -8,
                          left: 0,
                          width: '60px',
                          height: '3px',
                          background: '#00ff88',
                        }
                      }}
                    >
                      Requirements
                    </Typography>
                    <Box>
                      {job.requirements.map((requirement, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                          <CheckCircle sx={{ color: '#00ff88', fontSize: 20, mt: 0.2, flexShrink: 0 }} />
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              color: 'rgba(255, 255, 255, 0.9)',
                              lineHeight: 1.6,
                              fontSize: { xs: '0.9rem', sm: '1rem' }
                            }}
                          >
                            {requirement}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {job.skills && job.skills.length > 0 && (
                  <Box mb={4}>
                    <Typography 
                      variant="h5" 
                      sx={{
                        color: '#ffffff',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        mb: 3,
                        fontSize: { xs: '1.2rem', sm: '1.5rem' },
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: -8,
                          left: 0,
                          width: '60px',
                          height: '3px',
                          background: '#00ff88',
                        }
                      }}
                    >
                      Required Skills
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {job.skills.map((skill, index) => (
                        <Chip
                          key={index}
                          label={skill}
                          variant="outlined"
                          sx={{
                            borderColor: 'rgba(0, 255, 136, 0.4)',
                            color: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: 0,
                            fontWeight: 500,
                            fontSize: '0.85rem',
                            '&:hover': {
                              borderColor: '#00ff88',
                              backgroundColor: 'rgba(0, 255, 136, 0.15)',
                              color: '#ffffff',
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Paper>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Paper 
                sx={{ 
                  p: { xs: 2, sm: 3 }, 
                  mb: 3,
                  background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
                  border: '2px solid rgba(0, 255, 136, 0.4)',
                  borderRadius: 0,
                  backdropFilter: 'blur(10px)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    background: 'linear-gradient(90deg, #00ff88 0%, #22c55e 100%)',
                  }
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{
                    color: '#ffffff',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    mb: 3,
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                  }}
                >
                  Application Details
                </Typography>
            
                {job.applicationDeadline && (
                  <Box 
                    sx={{ 
                      mb: 3, 
                      p: 2, 
                      border: '1px solid rgba(0, 255, 136, 0.4)', 
                      background: 'rgba(0, 255, 136, 0.08)' 
                    }}
                  >
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        color: '#00ff88',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontSize: '0.8rem',
                        mb: 1
                      }}
                    >
                      Application Deadline
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: '#ffffff',
                        fontWeight: 500,
                        fontSize: { xs: '0.9rem', sm: '1rem' }
                      }}
                    >
                      {format(new Date(job.applicationDeadline), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>
                )}

                <Box 
                  sx={{ 
                    mb: 3, 
                    p: 2, 
                    border: '1px solid rgba(0, 255, 136, 0.4)', 
                    background: 'rgba(0, 255, 136, 0.08)' 
                  }}
                >
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      color: '#00ff88',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontSize: '0.8rem',
                      mb: 1
                    }}
                  >
                    Applications
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#ffffff',
                      fontWeight: 500,
                      fontSize: { xs: '0.9rem', sm: '1rem' }
                    }}
                  >
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
                        size="large"
                        sx={{
                          mb: 2,
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          color: 'rgba(255, 255, 255, 0.5)',
                          borderRadius: 0,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          py: 1.5
                        }}
                      >
                        Already Applied
                      </Button>
                    ) : isDeadlinePassed ? (
                      <Button
                        fullWidth
                        variant="outlined"
                        disabled
                        size="large"
                        sx={{
                          mb: 2,
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          color: 'rgba(255, 255, 255, 0.5)',
                          borderRadius: 0,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          py: 1.5
                        }}
                      >
                        Application Deadline Passed
                      </Button>
                    ) : (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          fullWidth
                          variant="contained"
                          size="large"
                          startIcon={<Send />}
                          onClick={handleApply}
                          sx={{
                            mb: 2,
                            background: '#00ff88',
                            color: '#000000',
                            borderRadius: 0,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            py: 1.5,
                            border: '2px solid #00ff88',
                            boxShadow: '0 4px 20px rgba(0, 255, 136, 0.4)',
                            '&:hover': {
                              background: 'transparent',
                              color: '#00ff88',
                              boxShadow: '0 8px 30px rgba(0, 255, 136, 0.5)',
                            }
                          }}
                        >
                          Apply Now
                        </Button>
                      </motion.div>
                    )}
                  </Box>
                )}

                {!isAuthenticated && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={() => navigate('/login')}
                      sx={{
                        mb: 2,
                        background: '#00ff88',
                        color: '#000000',
                        borderRadius: 0,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        py: 1.5,
                        '&:hover': {
                          background: '#22c55e',
                        }
                      }}
                    >
                      Login to Apply
                    </Button>
                  </motion.div>
                )}
              </Paper>

              {job.postedBy && (
                <Paper 
                  sx={{ 
                    p: { xs: 2, sm: 3 },
                    background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
                    border: '2px solid rgba(0, 255, 136, 0.4)',
                    borderRadius: 0,
                    backdropFilter: 'blur(10px)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '4px',
                      background: 'linear-gradient(90deg, #00ff88 0%, #22c55e 100%)',
                    }
                  }}
                >
                  <Typography 
                    variant="h6" 
                    sx={{
                      color: '#ffffff',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      mb: 2,
                      fontSize: { xs: '1.1rem', sm: '1.25rem' }
                    }}
                  >
                    Posted By
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Person sx={{ color: '#00ff88', fontSize: 20 }} />
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: { xs: '0.9rem', sm: '1rem' }
                      }}
                    >
                      {job.postedBy.profile?.firstName} {job.postedBy.profile?.lastName}
                    </Typography>
                  </Box>
                  {job.postedBy.profile?.bio && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.8)',
                        lineHeight: 1.6,
                        fontSize: { xs: '0.85rem', sm: '0.9rem' }
                      }}
                    >
                      {job.postedBy.profile.bio}
                    </Typography>
                  )}
                </Paper>
              )}
            </motion.div>
          </Grid>
        </Grid>

        {/* Application Dialog */}
      <Dialog 
        open={applyDialog} 
        onClose={() => setApplyDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(0, 0, 0, 0.98) 100%)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(0, 255, 136, 0.4)',
            borderRadius: 0,
            boxShadow: '0 20px 60px rgba(0, 255, 136, 0.2)',
            '& .MuiDialogTitle-root': {
              color: '#ffffff',
              borderBottom: '2px solid rgba(0, 255, 136, 0.3)',
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              pb: 2,
              mb: 2
            },
            '& .MuiDialogContent-root': {
              color: '#ffffff',
              pt: '16px !important'
            }
          }
        }}
      >
        <DialogTitle>Apply for {job.title}</DialogTitle>
        <DialogContent>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              mb: 3,
              lineHeight: 1.6,
              fontSize: { xs: '0.85rem', sm: '0.9rem' }
            }}
          >
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
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#ffffff',
                borderRadius: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                '& fieldset': {
                  borderColor: 'rgba(0, 255, 136, 0.3)',
                  borderWidth: 2
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 255, 136, 0.5)'
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#00ff88'
                },
                '& textarea': {
                  '&::placeholder': {
                    color: 'rgba(255, 255, 255, 0.5)',
                    opacity: 1
                  }
                }
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 600,
                '&.Mui-focused': {
                  color: '#00ff88'
                }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2, borderTop: '2px solid rgba(0, 255, 136, 0.3)' }}>
          <Button 
            onClick={() => setApplyDialog(false)}
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: 0,
              px: 3,
              py: 1,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.5)'
              }
            }}
          >
            Cancel
          </Button>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={submitApplication}
              variant="contained"
              disabled={applying}
              sx={{
                background: applying 
                  ? 'rgba(128, 128, 128, 0.3)' 
                  : 'linear-gradient(135deg, #00ff88 0%, #22c55e 100%)',
                color: applying ? 'rgba(255, 255, 255, 0.5)' : '#000000',
                borderRadius: 0,
                px: 4,
                py: 1,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                boxShadow: applying 
                  ? 'none' 
                  : '0 4px 20px rgba(0, 255, 136, 0.3)',
                '&:hover': {
                  background: applying 
                    ? 'rgba(128, 128, 128, 0.3)' 
                    : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  boxShadow: applying 
                    ? 'none' 
                    : '0 6px 25px rgba(0, 255, 136, 0.4)'
                },
                '&.Mui-disabled': {
                  background: 'rgba(128, 128, 128, 0.3)',
                  color: 'rgba(255, 255, 255, 0.5)'
                }
              }}
            >
              {applying ? 'Submitting...' : 'Submit Application'}
            </Button>
          </motion.div>
        </DialogActions>
      </Dialog>
    </Container>
  </Box>
  );
};

export default JobDetails;