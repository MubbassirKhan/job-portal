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

const RecruiterJobs = () => {
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
          currency: data.currency || 'INR',
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
          currency: data.currency || 'INR',
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
    setValue('currency', job.salaryRange?.currency || 'INR');
    setValue('applicationDeadline', job.applicationDeadline ? job.applicationDeadline.split('T')[0] : '');
    setValue('isActive', job.isActive);
    setEditJobDialog(true);
  };

  const StatsCard = ({ icon, title, value, trend, index }) => (
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
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <TrendingUp sx={{ fontSize: 14, color: '#00ff88', mr: 0.5 }} />
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#00ff88',
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
              '& .MuiFormHelperText-root': {
                color: '#ff6b6b',
              },
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('company', { required: 'Company name is required' })}
            label="Company"
            fullWidth
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
                color: '#00ff88',
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
            label="Location"
            fullWidth
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
                color: '#00ff88',
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
              color: '#00ff88',
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
              error={!!errors.jobType}
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
              color: '#00ff88',
              '&.Mui-focused': {
                color: '#00ff88',
              },
            },
            '& .MuiSelect-icon': {
              color: '#00ff88',
            },
          }}>
            <InputLabel>Status</InputLabel>
            <Select
              {...register('isActive')}
              label="Status"
              defaultValue={true}
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
              '& .MuiFormHelperText-root': {
                color: '#ff6b6b',
              },
            }}
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
              '& .MuiFormHelperText-root': {
                color: '#888',
              },
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            {...register('skills')}
            label="Required Skills (comma separated)"
            fullWidth
            helperText="e.g., JavaScript, React, Node.js"
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
              '& .MuiFormHelperText-root': {
                color: '#888',
              },
            }}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            {...register('salaryMin')}
            label="Min Salary"
            type="number"
            fullWidth
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
        <Grid item xs={4}>
          <TextField
            {...register('salaryMax')}
            label="Max Salary"
            type="number"
            fullWidth
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
        <Grid item xs={4}>
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
            {...register('applicationDeadline', { required: 'Application deadline is required' })}
            label="Application Deadline"
            type="date"
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
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
                color: '#00ff88',
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
      </Grid>
    </form>
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
                  Job Management
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 400, color: 'rgba(255, 255, 255, 0.8)' }}>
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
            borderRadius: 0,
            border: '2px solid rgba(0, 255, 136, 0.4)',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            transition: 'all 0.3s ease-in-out',
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
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 15px rgba(0, 255, 136, 0.15)',
              borderColor: '#00ff88',
            },
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, borderBottom: '1px solid rgba(0, 255, 136, 0.4)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: '#ffffff' }}>
                    All Job Postings
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Manage and track all your job listings
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Filter Jobs">
                    <IconButton
                      sx={{
                        background: 'rgba(0, 255, 136, 0.1)',
                        color: '#00ff88',
                        borderRadius: 0,
                        border: '1px solid rgba(0, 255, 136, 0.3)',
                        '&:hover': { 
                          background: 'rgba(0, 255, 136, 0.2)',
                          borderColor: '#00ff88'
                        }
                      }}
                    >
                      <FilterList />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Export Data">
                    <IconButton
                      sx={{
                        background: 'rgba(0, 255, 136, 0.1)',
                        color: '#00ff88',
                        borderRadius: 0,
                        border: '1px solid rgba(0, 255, 136, 0.3)',
                        '&:hover': { 
                          background: 'rgba(0, 255, 136, 0.2)',
                          borderColor: '#00ff88'
                        }
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
                    <TableRow sx={{ backgroundColor: 'rgba(0, 255, 136, 0.1)' }}>
                      <TableCell sx={{ fontWeight: 600, color: '#00ff88', borderBottom: '1px solid rgba(0, 255, 136, 0.3)' }}>Job Details</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#00ff88', borderBottom: '1px solid rgba(0, 255, 136, 0.3)' }}>Location & Type</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, color: '#00ff88', borderBottom: '1px solid rgba(0, 255, 136, 0.3)' }}>Applications</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, color: '#00ff88', borderBottom: '1px solid rgba(0, 255, 136, 0.3)' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#00ff88', borderBottom: '1px solid rgba(0, 255, 136, 0.3)' }}>Posted</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, color: '#00ff88', borderBottom: '1px solid rgba(0, 255, 136, 0.3)' }}>Actions</TableCell>
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
                                <Work />
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, color: '#ffffff' }}>
                                  {job.title}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Business sx={{ fontSize: 16, color: '#00ff88' }} />
                                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                    {job.company}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid rgba(0, 255, 136, 0.2)' }}>
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                <LocationOn sx={{ fontSize: 16, color: '#00ff88' }} />
                                <Typography variant="body2" sx={{ color: '#ffffff' }}>{job.location}</Typography>
                              </Box>
                              <Chip
                                label={formatJobType(job.jobType)}
                                size="small"
                                sx={{
                                  backgroundColor: 'rgba(0, 255, 136, 0.2)',
                                  color: '#00ff88',
                                  fontWeight: 500,
                                  border: '1px solid rgba(0, 255, 136, 0.6)',
                                  borderRadius: 0,
                                }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell align="center" sx={{ borderBottom: '1px solid rgba(0, 255, 136, 0.2)' }}>
                            <Badge
                              badgeContent={job.applicationsCount || 0}
                              color="primary"
                              sx={{
                                '& .MuiBadge-badge': {
                                  background: '#00ff88',
                                  color: '#000000',
                                  fontWeight: 600,
                                  borderRadius: 0,
                                }
                              }}
                            >
                              <Person sx={{ color: '#00ff88' }} />
                            </Badge>
                          </TableCell>
                          <TableCell align="center" sx={{ borderBottom: '1px solid rgba(0, 255, 136, 0.2)' }}>
                            <Chip
                              label={job.isActive ? 'Active' : 'Inactive'}
                              size="small"
                              sx={{
                                fontWeight: 500,
                                borderRadius: 0,
                                backgroundColor: job.isActive ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 107, 107, 0.2)',
                                color: job.isActive ? '#00ff88' : '#ff6b6b',
                                border: `1px solid ${job.isActive ? 'rgba(0, 255, 136, 0.6)' : 'rgba(255, 107, 107, 0.6)'}`,
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid rgba(0, 255, 136, 0.2)' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Schedule sx={{ fontSize: 16, color: '#00ff88' }} />
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                {format(new Date(job.createdAt), 'MMM dd, yyyy')}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center" sx={{ borderBottom: '1px solid rgba(0, 255, 136, 0.2)' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                              <Tooltip title="View Job">
                                <IconButton
                                  size="small"
                                  onClick={() => navigate(`/jobs/${job._id}`)}
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
                              <Tooltip title="Edit Job">
                                <IconButton
                                  size="small"
                                  onClick={() => openEditDialog(job)}
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
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Job">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedJob(job);
                                    setDeleteJobDialog(true);
                                  }}
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
                <Work sx={{ fontSize: 80, color: 'rgba(0, 255, 136, 0.3)', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 1, color: '#ffffff' }}>
                  No jobs posted yet
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, color: 'rgba(255, 255, 255, 0.8)' }}>
                  Create your first job posting to get started
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setCreateJobDialog(true)}
                  sx={{
                    background: '#00ff88',
                    color: '#000000',
                    borderRadius: 0,
                    border: '2px solid #00ff88',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'transparent',
                      color: '#00ff88',
                    }
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
            <Add sx={{ color: '#00ff88' }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#00ff88' }}>
              Create New Job Posting
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3, backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
          <Box sx={{ mt: 2 }}>
            <JobForm onSubmit={handleCreateJob} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2, backgroundColor: 'rgba(0, 0, 0, 0.8)', borderTop: '1px solid rgba(0, 255, 136, 0.4)' }}>
          <Button
            onClick={() => setCreateJobDialog(false)}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 0,
              textTransform: 'none',
              fontWeight: 500,
              color: '#ff6b6b',
              border: '1px solid rgba(255, 107, 107, 0.4)',
              '&:hover': {
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                borderColor: '#ff6b6b',
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(handleCreateJob)}
            variant="contained"
            sx={{
              background: '#00ff88',
              color: '#000000',
              px: 3,
              py: 1,
              borderRadius: 0,
              textTransform: 'none',
              fontWeight: 600,
              border: '2px solid #00ff88',
              '&:hover': {
                background: 'transparent',
                color: '#00ff88',
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
            <Edit sx={{ color: '#00ff88' }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#00ff88' }}>
              Edit Job Posting
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3, backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
          <Box sx={{ mt: 2 }}>
            <JobForm onSubmit={handleEditJob} isEdit />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2, backgroundColor: 'rgba(0, 0, 0, 0.8)', borderTop: '1px solid rgba(0, 255, 136, 0.4)' }}>
          <Button
            onClick={() => setEditJobDialog(false)}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 0,
              textTransform: 'none',
              fontWeight: 500,
              color: '#ff6b6b',
              border: '1px solid rgba(255, 107, 107, 0.4)',
              '&:hover': {
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                borderColor: '#ff6b6b',
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(handleEditJob)}
            variant="contained"
            sx={{
              background: '#00ff88',
              color: '#000000',
              px: 3,
              py: 1,
              borderRadius: 0,
              textTransform: 'none',
              fontWeight: 600,
              border: '2px solid #00ff88',
              '&:hover': {
                background: 'transparent',
                color: '#00ff88',
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
            borderRadius: 0,
            border: '2px solid rgba(255, 107, 107, 0.6)',
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
              background: 'linear-gradient(90deg, #ff6b6b 0%, #ff5252 100%)',
            }
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(0, 0, 0, 0.8) 100%)',
            color: '#ffffff',
            borderRadius: 0,
            p: 3,
            borderBottom: '1px solid rgba(255, 107, 107, 0.4)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Delete sx={{ color: '#ff6b6b' }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#ff6b6b' }}>
              Delete Job Posting
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3, backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
          <Typography variant="body1" sx={{ lineHeight: 1.6, color: '#ffffff' }}>
            Are you sure you want to delete <strong style={{ color: '#00ff88' }}>"{selectedJob?.title}"</strong>? 
            This action cannot be undone and will permanently remove all associated applications.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2, backgroundColor: 'rgba(0, 0, 0, 0.8)', borderTop: '1px solid rgba(255, 107, 107, 0.4)' }}>
          <Button
            onClick={() => setDeleteJobDialog(false)}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 0,
              textTransform: 'none',
              fontWeight: 500,
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderColor: '#ffffff',
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteJob}
            variant="contained"
            sx={{
              background: '#ff6b6b',
              color: '#000000',
              px: 3,
              py: 1,
              borderRadius: 0,
              textTransform: 'none',
              fontWeight: 600,
              border: '2px solid #ff6b6b',
              '&:hover': {
                background: 'transparent',
                color: '#ff6b6b',
              }
            }}
          >
            Delete Job
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
  );
};

export default RecruiterJobs;