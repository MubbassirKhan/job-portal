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
  Visibility
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
      'full-time': '#10b981',
      'part-time': '#f59e0b',
      'contract': '#6366f1',
      'internship': '#ec4899',
    };
    return colors[type] || '#64748b';
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
            height: '4px',
            background: `linear-gradient(90deg, ${getJobTypeColor(job.jobType)} 0%, ${getJobTypeColor(job.jobType)}80 100%)`,
          },
          '&:hover': {
            borderColor: getJobTypeColor(job.jobType),
            boxShadow: `0 20px 40px ${getJobTypeColor(job.jobType)}15`,
          },
        }}
        onClick={() => onClick(job._id)}
      >
        <CardContent sx={{ flexGrow: 1, pt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, lineHeight: 1.3 }}>
                {job.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Business sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {job.company}
                </Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={handleBookmarkToggle}
              sx={{
                color: isBookmarked ? '#f59e0b' : 'text.secondary',
                '&:hover': { backgroundColor: isBookmarked ? '#f59e0b10' : 'grey.100' }
              }}
            >
              {isBookmarked ? <Bookmark /> : <BookmarkBorder />}
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {job.location}
              </Typography>
            </Box>
            
            <Chip
              label={job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1)}
              size="small"
              sx={{
                backgroundColor: `${getJobTypeColor(job.jobType)}15`,
                color: getJobTypeColor(job.jobType),
                fontWeight: 500,
                border: `1px solid ${getJobTypeColor(job.jobType)}30`,
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
            <AttachMoney sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {formatSalary(job.salaryRange)}
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6, color: 'text.secondary' }}>
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
                  fontSize: '0.75rem',
                  borderColor: 'grey.300',
                  '&:hover': {
                    borderColor: getJobTypeColor(job.jobType),
                    backgroundColor: `${getJobTypeColor(job.jobType)}05`,
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
                  fontSize: '0.75rem',
                  borderColor: 'grey.400',
                  color: 'text.secondary'
                }}
              />
            )}
          </Box>
        </CardContent>
        
        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Schedule sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {format(new Date(job.createdAt), 'MMM dd')}
            </Typography>
          </Box>
          <Button
            size="small"
            endIcon={<Visibility />}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              color: getJobTypeColor(job.jobType),
              '&:hover': {
                backgroundColor: `${getJobTypeColor(job.jobType)}10`,
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
        p: 3,
        mb: 4,
        borderRadius: '16px',
        border: '1px solid',
        borderColor: 'grey.200',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList sx={{ color: '#6366f1' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Filter Jobs
          </Typography>
        </Box>
        <Button
          size="small"
          startIcon={<Clear />}
          onClick={onClearFilters}
          sx={{ textTransform: 'none', color: 'text.secondary' }}
        >
          Clear All
        </Button>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Search jobs, companies, skills..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#6366f1',
                },
              }
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
                  <LocationOn sx={{ color: 'text.secondary', fontSize: 20 }} />
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
        
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Job Type</InputLabel>
            <Select
              value={filters.jobType}
              label="Job Type"
              onChange={(e) => onFilterChange('jobType', e.target.value)}
              sx={{
                borderRadius: '12px',
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
            <InputLabel>Experience</InputLabel>
            <Select
              value={filters.experienceLevel}
              label="Experience"
              onChange={(e) => onFilterChange('experienceLevel', e.target.value)}
              sx={{
                borderRadius: '12px',
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
            <InputLabel>Sort By</InputLabel>
            <Select
              value={filters.sortBy}
              label="Sort By"
              onChange={(e) => onFilterChange('sortBy', e.target.value)}
              sx={{
                borderRadius: '12px',
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
        <Card sx={{ height: 300, borderRadius: '16px' }}>
          <CardContent>
            <Skeleton variant="text" width="80%" height={32} />
            <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="40%" height={20} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={80} sx={{ mb: 2, borderRadius: 1 }} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Skeleton variant="rounded" width={60} height={24} />
              <Skeleton variant="rounded" width={50} height={24} />
              <Skeleton variant="rounded" width={70} height={24} />
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 2,
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Discover Your Next Opportunity
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Browse through thousands of job opportunities from top companies worldwide
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 3 }}>
            <TrendingUp sx={{ color: '#10b981' }} />
            <Typography variant="body2" color="text.secondary">
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
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                      <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(event, value) => setPage(value)}
                        size="large"
                        sx={{
                          '& .MuiPaginationItem-root': {
                            borderRadius: '8px',
                            fontWeight: 500,
                            '&.Mui-selected': {
                              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                              color: 'white',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #4f46e5 0%, #db2777 100%)',
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
                    py: 8,
                    px: 4,
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    border: '1px solid',
                    borderColor: 'grey.200',
                  }}
                >
                  <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    No Jobs Found
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                    We couldn't find any jobs matching your criteria. Try adjusting your filters or search terms.
                  </Typography>
                  <Button
                    onClick={handleClearFilters}
                    variant="contained"
                    sx={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 3,
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
  );
};

export default Jobs;