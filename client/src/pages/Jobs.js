import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  InputAdornment,
  Paper,
  IconButton,
  Skeleton,
} from '@mui/material';
import { 
  LocationOn, 
  AttachMoney, 
  Search as SearchIcon,
  FilterList,
  Clear,
  TrendingUp,
  Schedule,
  Business,
  Bookmark,
  BookmarkBorder,
  Visibility,
  Work,
  ArrowForward
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { jobsAPI } from '../utils/api';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const JobCard = ({ job, onClick, index }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmarkToggle = (e) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const formatSalary = (salaryRange) => {
    if (!salaryRange.min && !salaryRange.max) return 'Salary not specified';
    if (salaryRange.min && salaryRange.max) {
      return `${salaryRange.currency} ${salaryRange.min.toLocaleString()} - ${salaryRange.max.toLocaleString()}`;
    }
    if (salaryRange.min) return `${salaryRange.currency} ${salaryRange.min.toLocaleString()}+`;
    return `Up to ${salaryRange.currency} ${salaryRange.max.toLocaleString()}`;
  };

  const getJobTypeColor = (type) => {
    const colors = {
      'full-time': '#00ff88',
      'part-time': '#00e676',
      'contract': '#22c55e',
      'internship': '#16a34a',
    };
    return colors[type] || '#00ff88';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
    >
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          cursor: 'pointer',
          borderRadius: 0,
          border: '2px solid rgba(0, 255, 136, 0.4)',
          background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          backdropFilter: 'blur(10px)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #00ff88 0%, #22c55e 100%)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(45deg, transparent 30%, rgba(0, 255, 136, 0.08) 50%, transparent 70%)',
            transform: 'translateX(-100%)',
            transition: 'transform 0.6s ease',
          },
          '&:hover': {
            borderColor: '#00ff88',
            boxShadow: '0 20px 40px rgba(0, 255, 136, 0.3)',
            '&::after': {
              transform: 'translateX(100%)',
            }
          },
        }}
        onClick={() => onClick(job._id)}
      >
        <CardContent sx={{ flexGrow: 1, pt: 3, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 1, 
                  lineHeight: 1.3,
                  color: '#ffffff',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontSize: { xs: '1rem', sm: '1.1rem' }
                }}
              >
                {job.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Business sx={{ fontSize: 16, color: '#00ff88' }} />
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 500,
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.9rem'
                  }}
                >
                  {job.company}
                </Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={handleBookmarkToggle}
              sx={{
                color: isBookmarked ? '#00ff88' : 'rgba(255, 255, 255, 0.6)',
                border: '1px solid rgba(0, 255, 136, 0.4)',
                borderRadius: 0,
                '&:hover': { 
                  backgroundColor: 'rgba(0, 255, 136, 0.15)',
                  borderColor: '#00ff88'
                }
              }}
            >
              {isBookmarked ? <Bookmark /> : <BookmarkBorder />}
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocationOn sx={{ fontSize: 16, color: '#00ff88' }} />
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: 500
                }}
              >
                {job.location}
              </Typography>
            </Box>
            
            <Chip
              label={job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1)}
              size="small"
              sx={{
                backgroundColor: 'rgba(0, 255, 136, 0.15)',
                color: '#00ff88',
                fontWeight: 600,
                border: '1px solid rgba(0, 255, 136, 0.4)',
                borderRadius: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.75rem',
                '&:hover': {
                  backgroundColor: 'rgba(0, 255, 136, 0.25)',
                }
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
            <AttachMoney sx={{ fontSize: 16, color: '#00ff88' }} />
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 600,
                color: '#ffffff',
                fontSize: '0.9rem'
              }}
            >
              {formatSalary(job.salaryRange)}
            </Typography>
          </Box>

          <Typography 
            variant="body2" 
            sx={{ 
              mb: 2, 
              lineHeight: 1.6, 
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.85rem'
            }}
          >
            {job.description.length > 120 ? `${job.description.substring(0, 120)}...` : job.description}
          </Typography>

          <Box sx={{ mb: 2 }}>
            {job.skills.slice(0, 3).map((skill, index) => (
              <Chip
                key={index}
                label={skill}
                size="small"
                variant="outlined"
                sx={{ 
                  mr: 0.5, 
                  mb: 0.5,
                  fontSize: '0.7rem',
                  borderColor: 'rgba(0, 255, 136, 0.4)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: 0,
                  fontWeight: 500,
                  '&:hover': {
                    borderColor: '#00ff88',
                    backgroundColor: 'rgba(0, 255, 136, 0.15)',
                    color: '#ffffff',
                  }
                }}
              />
            ))}
            {job.skills.length > 3 && (
              <Chip
                label={`+${job.skills.length - 3}`}
                size="small"
                variant="outlined"
                sx={{ 
                  mr: 0.5, 
                  mb: 0.5,
                  fontSize: '0.7rem',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: 'rgba(255, 255, 255, 0.6)',
                  borderRadius: 0,
                  fontWeight: 500
                }}
              />
            )}
          </Box>
        </CardContent>
        
        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Schedule sx={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.6)' }} />
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.75rem',
                fontWeight: 500
              }}
            >
              {format(new Date(job.createdAt), 'MMM dd')}
            </Typography>
          </Box>
          <Button
            size="small"
            endIcon={<ArrowForward />}
            sx={{
              textTransform: 'uppercase',
              fontWeight: 600,
              color: '#00ff88',
              border: '1px solid rgba(0, 255, 136, 0.4)',
              borderRadius: 0,
              px: 2,
              py: 0.5,
              fontSize: '0.75rem',
              letterSpacing: '0.5px',
              '&:hover': {
                backgroundColor: 'rgba(0, 255, 136, 0.15)',
                borderColor: '#00ff88',
                color: '#ffffff',
              }
            }}
          >
            View Details
          </Button>
        </CardActions>
      </Card>
    </motion.div>
  );
};

const FilterSection = ({ filters, onFilterChange, onClearFilters }) => {
  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 3 },
        mb: 4,
        borderRadius: 0,
        border: '2px solid rgba(0, 255, 136, 0.4)',
        background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList sx={{ color: '#00ff88' }} />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              color: '#ffffff',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            Filter Jobs
          </Typography>
        </Box>
        <Button
          size="small"
          startIcon={<Clear />}
          onClick={onClearFilters}
          sx={{ 
            textTransform: 'uppercase', 
            color: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: 0,
            fontWeight: 600,
            fontSize: '0.75rem',
            letterSpacing: '0.5px',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.5)',
            }
          }}
        >
          Clear All
        </Button>
      </Box>

      <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ position: 'relative', zIndex: 1 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Search jobs, companies, skills..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#00ff88' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                '& fieldset': {
                  borderColor: 'rgba(0, 255, 136, 0.4)',
                },
                '&:hover fieldset': {
                  borderColor: '#00ff88',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#00ff88',
                },
                '& input': {
                  color: '#ffffff',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-focused': {
                  color: '#00ff88',
                },
              },
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            label="Location"
            value={filters.location}
            onChange={(e) => onFilterChange('location', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOn sx={{ color: '#00ff88', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                '& fieldset': {
                  borderColor: 'rgba(0, 255, 136, 0.4)',
                },
                '&:hover fieldset': {
                  borderColor: '#00ff88',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#00ff88',
                },
                '& input': {
                  color: '#ffffff',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-focused': {
                  color: '#00ff88',
                },
              },
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)', '&.Mui-focused': { color: '#00ff88' } }}>
              Job Type
            </InputLabel>
            <Select
              value={filters.jobType}
              label="Job Type"
              onChange={(e) => onFilterChange('jobType', e.target.value)}
              sx={{
                borderRadius: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                color: '#ffffff',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 255, 136, 0.4)',
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
                    backgroundColor: 'rgba(26, 26, 26, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0, 255, 136, 0.4)',
                    borderRadius: 0,
                    '& .MuiMenuItem-root': {
                      color: '#ffffff',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 255, 136, 0.15)',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(0, 255, 136, 0.25)',
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="full-time">Full Time</MenuItem>
              <MenuItem value="part-time">Part Time</MenuItem>
              <MenuItem value="contract">Contract</MenuItem>
              <MenuItem value="internship">Internship</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)', '&.Mui-focused': { color: '#00ff88' } }}>
              Experience
            </InputLabel>
            <Select
              value={filters.experienceLevel}
              label="Experience"
              onChange={(e) => onFilterChange('experienceLevel', e.target.value)}
              sx={{
                borderRadius: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                color: '#ffffff',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 255, 136, 0.4)',
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
                    backgroundColor: 'rgba(26, 26, 26, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0, 255, 136, 0.4)',
                    borderRadius: 0,
                    '& .MuiMenuItem-root': {
                      color: '#ffffff',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 255, 136, 0.15)',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(0, 255, 136, 0.25)',
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem value="">All Levels</MenuItem>
              <MenuItem value="entry">Entry Level</MenuItem>
              <MenuItem value="mid">Mid Level</MenuItem>
              <MenuItem value="senior">Senior Level</MenuItem>
              <MenuItem value="executive">Executive</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)', '&.Mui-focused': { color: '#00ff88' } }}>
              Sort By
            </InputLabel>
            <Select
              value={filters.sortBy}
              label="Sort By"
              onChange={(e) => onFilterChange('sortBy', e.target.value)}
              sx={{
                borderRadius: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                color: '#ffffff',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 255, 136, 0.4)',
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
                    backgroundColor: 'rgba(26, 26, 26, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0, 255, 136, 0.4)',
                    borderRadius: 0,
                    '& .MuiMenuItem-root': {
                      color: '#ffffff',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 255, 136, 0.15)',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(0, 255, 136, 0.25)',
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="oldest">Oldest First</MenuItem>
              <MenuItem value="salary-high">Salary: High to Low</MenuItem>
              <MenuItem value="salary-low">Salary: Low to High</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
};

const LoadingSkeleton = () => (
  <Grid container spacing={3}>
    {[...Array(6)].map((_, index) => (
      <Grid item xs={12} md={6} lg={4} key={index}>
        <Card 
          sx={{ 
            height: 300, 
            borderRadius: 0,
            background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
            border: '2px solid rgba(0, 255, 136, 0.4)',
          }}
        >
          <CardContent>
            <Skeleton variant="text" width="80%" height={32} sx={{ bgcolor: 'rgba(0, 255, 136, 0.1)' }} />
            <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
            <Skeleton variant="text" width="40%" height={20} sx={{ mb: 2, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
            <Skeleton variant="rectangular" height={80} sx={{ mb: 2, borderRadius: 0, bgcolor: 'rgba(0, 255, 136, 0.05)' }} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Skeleton variant="rounded" width={60} height={24} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: 0 }} />
              <Skeleton variant="rounded" width={50} height={24} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: 0 }} />
              <Skeleton variant="rounded" width={70} height={24} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: 0 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

const Jobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    jobType: '',
    experienceLevel: '',
    sortBy: 'newest',
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await jobsAPI.getJobs({
          page,
          limit: 9,
          ...filters,
        });
        setJobs(response.data.data);
        setTotalPages(response.data.pages);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [page, filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      location: '',
      jobType: '',
      experienceLevel: '',
      sortBy: 'newest',
    });
    setPage(1);
  };

  const handleJobClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

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
      <Container maxWidth={false} sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2, md: 4 }, position: 'relative', zIndex: 1 }}>
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ textAlign: 'center', mb: { xs: 4, sm: 6 }, pt: { xs: 2, sm: 4 } }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: { xs: 2, sm: 3 },
                background: 'linear-gradient(135deg, #00ff88 0%, #00e676 50%, #ffffff 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
                textTransform: 'uppercase',
                letterSpacing: { xs: '1px', sm: '2px' },
                px: { xs: 1, sm: 0 },
              }}
            >
              Discover Your Next Opportunity
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                maxWidth: { xs: '100%', sm: 600 }, 
                mx: 'auto',
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: 300,
                fontSize: { xs: '1rem', sm: '1.2rem' },
                lineHeight: 1.6,
                px: { xs: 2, sm: 0 },
              }}
            >
              Browse through thousands of job opportunities from top companies worldwide
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 3 }}>
              <Work sx={{ color: '#00ff88', fontSize: { xs: 20, sm: 24 } }} />
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: 500,
                  fontSize: { xs: '0.85rem', sm: '0.95rem' }
                }}
              >
                {jobs.length > 0 ? `${jobs.length} jobs found` : 'Loading opportunities...'}
              </Typography>
            </Box>
          </Box>
        </motion.div>

      {/* Filters Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <FilterSection
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
      </motion.div>

      {/* Content Section */}
      <Box sx={{ minHeight: '400px' }}>
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <AnimatePresence mode="wait">
            {jobs.length > 0 ? (
              <motion.div
                key="jobs-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Grid container spacing={3}>
                  {jobs.map((job, index) => (
                    <Grid item xs={12} md={6} lg={4} key={job._id}>
                      <JobCard job={job} onClick={handleJobClick} index={index} />
                    </Grid>
                  ))}
                </Grid>

                {/* Pagination */}
                {totalPages > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 4, sm: 6 } }}>
                      <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(event, value) => setPage(value)}
                        size="large"
                        sx={{
                          '& .MuiPaginationItem-root': {
                            borderRadius: 0,
                            fontWeight: 600,
                            color: 'rgba(255, 255, 255, 0.8)',
                            border: '1px solid rgba(0, 255, 136, 0.4)',
                            backgroundColor: 'rgba(0, 0, 0, 0.4)',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 255, 136, 0.15)',
                              borderColor: '#00ff88',
                              color: '#ffffff',
                            },
                            '&.Mui-selected': {
                              background: '#00ff88',
                              color: '#000000',
                              borderColor: '#00ff88',
                              '&:hover': {
                                background: '#22c55e',
                              }
                            }
                          }
                        }}
                      />
                    </Box>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="no-jobs"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Paper
                  sx={{
                    textAlign: 'center',
                    py: { xs: 6, sm: 8 },
                    px: { xs: 2, sm: 4 },
                    borderRadius: 0,
                    background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
                    border: '2px solid rgba(0, 255, 136, 0.4)',
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
                  <SearchIcon sx={{ fontSize: { xs: 48, sm: 64 }, color: '#00ff88', mb: 2, filter: 'drop-shadow(0 0 20px rgba(0, 255, 136, 0.6))' }} />
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 700, 
                      mb: 1,
                      color: '#ffffff',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontSize: { xs: '1.2rem', sm: '1.5rem' }
                    }}
                  >
                    No Jobs Found
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      mb: 3, 
                      maxWidth: 400, 
                      mx: 'auto',
                      color: 'rgba(255, 255, 255, 0.8)',
                      lineHeight: 1.6,
                      fontSize: { xs: '0.9rem', sm: '1rem' }
                    }}
                  >
                    We couldn't find any jobs matching your criteria. Try adjusting your filters or search terms.
                  </Typography>
                  <Button
                    onClick={handleClearFilters}
                    variant="contained"
                    startIcon={<Clear />}
                    sx={{
                      background: '#00ff88',
                      color: '#000000',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      px: { xs: 3, sm: 4 },
                      py: { xs: 1, sm: 1.5 },
                      borderRadius: 0,
                      border: '2px solid #00ff88',
                      letterSpacing: '0.5px',
                      fontSize: { xs: '0.85rem', sm: '0.95rem' },
                      '&:hover': {
                        background: 'transparent',
                        color: '#00ff88',
                        borderColor: '#00ff88',
                      }
                    }}
                  >
                    Clear Filters
                  </Button>
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>
        )}
        </Box>
      </Container>
    </Box>
  );
};

export default Jobs;