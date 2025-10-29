import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  TextField,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { 
  Edit, 
  CloudUpload, 
  Delete, 
  Visibility,
  Person,
  School,
  Work,
  Code,
  Email,
  ContactPhone,
  LocationOn,
  Add,
  LinkedIn,
  GitHub,
  Twitter,
  Public,
  Timeline,
  TrendingUp,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { SERVER_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { uploadAPI } from '../utils/api';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [resumeDialog, setResumeDialog] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  const [educationList, setEducationList] = useState([]);
  const [experienceList, setExperienceList] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  const [certificationsList, setCertificationsList] = useState([]);
  const [languagesList, setLanguagesList] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        phone: user.profile?.phone || '',
        location: user.profile?.location || '',
        skills: user.profile?.skills?.join(', ') || '',
        experience: user.profile?.experience || 0,
        education: user.profile?.education || '',
        bio: user.profile?.bio || '',
        jobTitle: user.profile?.jobTitle || '',
        company: user.profile?.company || '',
        website: user.profile?.website || '',
        linkedin: user.profile?.linkedin || '',
        github: user.profile?.github || '',
        twitter: user.profile?.twitter || '',
      });

      // Initialize lists from user data
      setEducationList(user.profile?.educationDetails || []);
      setExperienceList(user.profile?.workExperience || []);
      setSkillsList(user.profile?.skillsDetailed || []);
      setCertificationsList(user.profile?.certifications || []);
      setLanguagesList(user.profile?.languages || []);
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const profileData = {
        ...data,
        skills: data.skills ? data.skills.split(',').map(skill => skill.trim()).filter(skill => skill) : [],
        // Include all the detailed data arrays
        educationDetails: educationList,
        workExperience: experienceList,
        skillsDetailed: skillsList,
        certifications: certificationsList,
        languages: languagesList,
      };

      const result = await updateProfile(profileData);
      if (result.success) {
        toast.success('Profile updated successfully!');
        setEditMode(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setUploadLoading(true);
    try {
      await uploadAPI.uploadResume(formData);
      toast.success('Resume uploaded successfully!');
      // Refresh user data
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleResumeDelete = async () => {
    try {
      await uploadAPI.deleteResume();
      toast.success('Resume deleted successfully!');
      setResumeDialog(false);
      // Refresh user data
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete resume');
    }
  };

  const handleResumeView = () => {
    if (user.profile?.resumeUrl) {
      // Open resume in new tab
      window.open(`${SERVER_BASE_URL}${user.profile.resumeUrl}`, '_blank');
    }
  };

  // Education handlers
  const addEducation = () => {
    const newEducation = {
      id: Date.now(),
      degree: '',
      institution: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      grade: '',
      description: ''
    };
    setEducationList([...educationList, newEducation]);
  };

  const updateEducation = (id, field, value) => {
    setEducationList(educationList.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const removeEducation = (id) => {
    setEducationList(educationList.filter(edu => edu.id !== id));
  };

  // Experience handlers
  const addExperience = () => {
    const newExperience = {
      id: Date.now(),
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      achievements: []
    };
    setExperienceList([...experienceList, newExperience]);
  };

  const updateExperience = (id, field, value) => {
    setExperienceList(experienceList.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const removeExperience = (id) => {
    setExperienceList(experienceList.filter(exp => exp.id !== id));
  };

  // Skills handlers
  const addSkill = () => {
    const newSkill = {
      id: Date.now(),
      name: '',
      level: 'Beginner',
      category: 'Technical'
    };
    setSkillsList([...skillsList, newSkill]);
  };

  const updateSkill = (id, field, value) => {
    setSkillsList(skillsList.map(skill => 
      skill.id === id ? { ...skill, [field]: value } : skill
    ));
  };

  const removeSkill = (id) => {
    setSkillsList(skillsList.filter(skill => skill.id !== id));
  };

  if (!user) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
        py: 4 
      }}>
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: '#00ff88' }} />
          <Typography variant="h6" sx={{ mt: 2, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Loading profile...
          </Typography>
        </Container>
      </Box>
    );
  }

  const ProfileSection = ({ title, icon, children, isActive, onClick }) => (
    <Card
      sx={{
        mb: 2,
        borderRadius: 0,
        backgroundColor: isActive ? 'rgba(0, 255, 136, 0.1)' : 'rgba(26, 26, 26, 0.8)',
        border: `2px solid ${isActive ? '#00ff88' : 'rgba(0, 255, 136, 0.3)'}`,
        cursor: 'pointer',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          borderColor: '#00ff88',
          backgroundColor: 'rgba(0, 255, 136, 0.05)',
        }
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
            }}
          >
            {icon}
          </Box>
          <Typography
            variant="h6"
            sx={{
              color: '#ffffff',
              fontWeight: 600,
              flex: 1,
            }}
          >
            {title}
          </Typography>
          {isActive && (
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={(e) => {
                e.stopPropagation();
                setEditMode(true);
              }}
              sx={{
                borderRadius: 0,
                borderColor: '#00ff88',
                color: '#00ff88',
                '&:hover': {
                  backgroundColor: 'rgba(0, 255, 136, 0.1)',
                  borderColor: '#00ff88',
                }
              }}
            >
              Edit
            </Button>
          )}
        </Box>
        {isActive && children}
      </CardContent>
    </Card>
  );

  const SkillChip = ({ skill, level }) => (
    <Chip
      label={`${skill} ${level ? `(${level})` : ''}`}
      sx={{
        mr: 1,
        mb: 1,
        backgroundColor: 'rgba(0, 255, 136, 0.2)',
        color: '#00ff88',
        border: '1px solid rgba(0, 255, 136, 0.6)',
        borderRadius: 0,
        '&:hover': {
          backgroundColor: 'rgba(0, 255, 136, 0.3)',
        }
      }}
    />
  );

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
      pt: { xs: 10, sm: 12, md: 14 },
      pb: 4,
    }}>
      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 4 } }}>
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h3" 
            component="h1"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #00ff88 0%, #00e676 50%, #ffffff 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            Professional Profile
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 400, color: 'rgba(255, 255, 255, 0.8)' }}>
            Manage your professional information and career details
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Left Column - Profile Overview */}
          <Grid item xs={12} lg={4}>
            <Card
              sx={{
                borderRadius: 0,
                backgroundColor: 'rgba(26, 26, 26, 0.8)',
                border: '2px solid rgba(0, 255, 136, 0.3)',
                mb: 3,
              }}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    mx: 'auto',
                    mb: 3,
                    backgroundColor: 'rgba(0, 255, 136, 0.2)',
                    border: '3px solid rgba(0, 255, 136, 0.6)',
                    borderRadius: 0,
                    fontSize: '3rem',
                    color: '#00ff88',
                  }}
                >
                  {user.profile?.firstName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                </Avatar>
                
                <Typography
                  variant="h5"
                  sx={{
                    color: '#ffffff',
                    fontWeight: 700,
                    mb: 1,
                  }}
                >
                  {user.profile?.firstName} {user.profile?.lastName}
                </Typography>
                
                <Typography
                  variant="h6"
                  sx={{
                    color: '#00ff88',
                    fontWeight: 500,
                    mb: 2,
                  }}
                >
                  {user.profile?.jobTitle || (user.role === 'candidate' ? 'Job Seeker' : 'Recruiter')}
                </Typography>

                <Divider sx={{ my: 3, borderColor: 'rgba(0, 255, 136, 0.3)' }} />

                <Box sx={{ textAlign: 'left' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Email sx={{ color: '#00ff88', mr: 2 }} />
                    <Typography variant="body2" sx={{ color: '#ffffff' }}>
                      {user.email}
                    </Typography>
                  </Box>
                  
                  {user.profile?.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <ContactPhone sx={{ color: '#00ff88', mr: 2 }} />
                      <Typography variant="body2" sx={{ color: '#ffffff' }}>
                        {user.profile.phone}
                      </Typography>
                    </Box>
                  )}
                  
                  {user.profile?.location && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationOn sx={{ color: '#00ff88', mr: 2 }} />
                      <Typography variant="body2" sx={{ color: '#ffffff' }}>
                        {user.profile.location}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Social Links */}
                <Divider sx={{ my: 3, borderColor: 'rgba(0, 255, 136, 0.3)' }} />
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                  {user.profile?.linkedin && (
                    <IconButton
                      component="a"
                      href={user.profile.linkedin}
                      target="_blank"
                      sx={{ color: '#00ff88', border: '1px solid rgba(0, 255, 136, 0.3)' }}
                    >
                      <LinkedIn />
                    </IconButton>
                  )}
                  {user.profile?.github && (
                    <IconButton
                      component="a"
                      href={user.profile.github}
                      target="_blank"
                      sx={{ color: '#00ff88', border: '1px solid rgba(0, 255, 136, 0.3)' }}
                    >
                      <GitHub />
                    </IconButton>
                  )}
                  {user.profile?.website && (
                    <IconButton
                      component="a"
                      href={user.profile.website}
                      target="_blank"
                      sx={{ color: '#00ff88', border: '1px solid rgba(0, 255, 136, 0.3)' }}
                    >
                      <Public />
                    </IconButton>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Resume Section for Candidates */}
            {user.role === 'candidate' && (
              <Card
                sx={{
                  borderRadius: 0,
                  backgroundColor: 'rgba(26, 26, 26, 0.8)',
                  border: '2px solid rgba(0, 255, 136, 0.3)',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#ffffff',
                      fontWeight: 600,
                      mb: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <CloudUpload sx={{ color: '#00ff88' }} />
                    Resume
                  </Typography>
                  
                  {user.profile?.resumeUrl ? (
                    <Box>
                      <Alert 
                        severity="success" 
                        sx={{ 
                          mb: 2,
                          backgroundColor: 'rgba(0, 255, 136, 0.1)',
                          border: '1px solid rgba(0, 255, 136, 0.3)',
                          '& .MuiAlert-icon': { color: '#00ff88' },
                          '& .MuiAlert-message': { color: '#ffffff' },
                        }}
                      >
                        Resume uploaded successfully
                      </Alert>
                      <Box display="flex" flexDirection="column" gap={2}>
                        <Button
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={handleResumeView}
                          fullWidth
                          sx={{
                            borderColor: '#00ff88',
                            color: '#00ff88',
                            borderRadius: 0,
                            '&:hover': {
                              backgroundColor: 'rgba(0, 255, 136, 0.1)',
                              borderColor: '#00ff88',
                            }
                          }}
                        >
                          View Resume
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => setResumeDialog(true)}
                          fullWidth
                          sx={{
                            borderRadius: 0,
                            borderColor: '#ff6b6b',
                            color: '#ff6b6b',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 107, 107, 0.1)',
                              borderColor: '#ff6b6b',
                            }
                          }}
                        >
                          Delete Resume
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box>
                      <Alert 
                        severity="info" 
                        sx={{ 
                          mb: 2,
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          '& .MuiAlert-icon': { color: '#3b82f6' },
                          '& .MuiAlert-message': { color: '#ffffff' },
                        }}
                      >
                        Upload your resume to apply for jobs
                      </Alert>
                      <input
                        accept=".pdf,.doc,.docx"
                        style={{ display: 'none' }}
                        id="resume-upload"
                        type="file"
                        onChange={handleResumeUpload}
                      />
                      <label htmlFor="resume-upload">
                        <Button
                          variant="contained"
                          component="span"
                          startIcon={uploadLoading ? <CircularProgress size={16} /> : <CloudUpload />}
                          disabled={uploadLoading}
                          fullWidth
                          sx={{
                            background: '#00ff88',
                            color: '#000000',
                            borderRadius: 0,
                            fontWeight: 600,
                            '&:hover': {
                              background: 'rgba(0, 255, 136, 0.8)',
                            }
                          }}
                        >
                          {uploadLoading ? 'Uploading...' : 'Upload Resume'}
                        </Button>
                      </label>
                      <Typography 
                        variant="caption" 
                        display="block" 
                        sx={{ 
                          mt: 1, 
                          textAlign: 'center',
                          color: 'rgba(255, 255, 255, 0.7)'
                        }}
                      >
                        Supported formats: PDF, DOC, DOCX (Max 5MB)
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Right Column - Profile Sections */}
          <Grid item xs={12} lg={8}>
            {/* Basic Information Section */}
            <ProfileSection
              title="Basic Information"
              icon={<Person />}
              isActive={activeSection === 'basic'}
              onClick={() => setActiveSection(activeSection === 'basic' ? '' : 'basic')}
            >
              <Box sx={{ mt: 3 }}>
                {editMode && activeSection === 'basic' ? (
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          {...register('firstName', { required: 'First name is required' })}
                          label="First Name"
                          fullWidth
                          error={!!errors.firstName}
                          helperText={errors.firstName?.message}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 0,
                              backgroundColor: 'rgba(0, 0, 0, 0.3)',
                              color: '#ffffff',
                              '& fieldset': { borderColor: 'rgba(0, 255, 136, 0.3)' },
                              '&:hover fieldset': { borderColor: '#00ff88' },
                              '&.Mui-focused fieldset': { borderColor: '#00ff88' },
                            },
                            '& .MuiInputLabel-root': {
                              color: '#00ff88',
                              '&.Mui-focused': { color: '#00ff88' },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          {...register('lastName', { required: 'Last name is required' })}
                          label="Last Name"
                          fullWidth
                          error={!!errors.lastName}
                          helperText={errors.lastName?.message}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 0,
                              backgroundColor: 'rgba(0, 0, 0, 0.3)',
                              color: '#ffffff',
                              '& fieldset': { borderColor: 'rgba(0, 255, 136, 0.3)' },
                              '&:hover fieldset': { borderColor: '#00ff88' },
                              '&.Mui-focused fieldset': { borderColor: '#00ff88' },
                            },
                            '& .MuiInputLabel-root': {
                              color: '#00ff88',
                              '&.Mui-focused': { color: '#00ff88' },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          {...register('jobTitle')}
                          label="Job Title"
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 0,
                              backgroundColor: 'rgba(0, 0, 0, 0.3)',
                              color: '#ffffff',
                              '& fieldset': { borderColor: 'rgba(0, 255, 136, 0.3)' },
                              '&:hover fieldset': { borderColor: '#00ff88' },
                              '&.Mui-focused fieldset': { borderColor: '#00ff88' },
                            },
                            '& .MuiInputLabel-root': {
                              color: '#00ff88',
                              '&.Mui-focused': { color: '#00ff88' },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          {...register('company')}
                          label="Current Company"
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 0,
                              backgroundColor: 'rgba(0, 0, 0, 0.3)',
                              color: '#ffffff',
                              '& fieldset': { borderColor: 'rgba(0, 255, 136, 0.3)' },
                              '&:hover fieldset': { borderColor: '#00ff88' },
                              '&.Mui-focused fieldset': { borderColor: '#00ff88' },
                            },
                            '& .MuiInputLabel-root': {
                              color: '#00ff88',
                              '&.Mui-focused': { color: '#00ff88' },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          {...register('bio')}
                          label="Professional Bio"
                          multiline
                          rows={4}
                          fullWidth
                          helperText="Tell us about yourself and your professional journey"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 0,
                              backgroundColor: 'rgba(0, 0, 0, 0.3)',
                              color: '#ffffff',
                              '& fieldset': { borderColor: 'rgba(0, 255, 136, 0.3)' },
                              '&:hover fieldset': { borderColor: '#00ff88' },
                              '&.Mui-focused fieldset': { borderColor: '#00ff88' },
                            },
                            '& .MuiInputLabel-root': {
                              color: '#00ff88',
                              '&.Mui-focused': { color: '#00ff88' },
                            },
                            '& .MuiFormHelperText-root': {
                              color: 'rgba(255, 255, 255, 0.7)',
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Box display="flex" gap={2}>
                          <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={16} /> : null}
                            sx={{
                              background: '#00ff88',
                              color: '#000000',
                              borderRadius: 0,
                              fontWeight: 600,
                              '&:hover': {
                                background: 'rgba(0, 255, 136, 0.8)',
                              }
                            }}
                          >
                            {loading ? 'Saving...' : 'Save Changes'}
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setEditMode(false);
                              reset();
                            }}
                            sx={{
                              borderRadius: 0,
                              borderColor: '#ff6b6b',
                              color: '#ff6b6b',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                                borderColor: '#ff6b6b',
                              }
                            }}
                          >
                            Cancel
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </form>
                ) : (
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                        Full Name
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#ffffff' }}>
                        {user.profile?.firstName} {user.profile?.lastName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                        Job Title
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#ffffff' }}>
                        {user.profile?.jobTitle || 'Not specified'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                        Professional Bio
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#ffffff', lineHeight: 1.6 }}>
                        {user.profile?.bio || 'No bio provided'}
                      </Typography>
                    </Grid>
                  </Grid>
                )}
              </Box>
            </ProfileSection>

            {/* Skills Section */}
            <ProfileSection
              title="Skills & Expertise"
              icon={<Code />}
              isActive={activeSection === 'skills'}
              onClick={() => setActiveSection(activeSection === 'skills' ? '' : 'skills')}
            >
              <Box sx={{ mt: 3 }}>
                {editMode && activeSection === 'skills' ? (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" sx={{ color: '#00ff88', fontWeight: 600 }}>
                        Detailed Skills
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={addSkill}
                        sx={{
                          borderRadius: 0,
                          borderColor: '#00ff88',
                          color: '#00ff88',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 255, 136, 0.1)',
                            borderColor: '#00ff88',
                          }
                        }}
                      >
                        Add Skill
                      </Button>
                    </Box>
                    
                    {skillsList.map((skill) => (
                      <Card key={skill.id} sx={{ 
                        mb: 2, 
                        backgroundColor: 'rgba(0, 255, 136, 0.1)', 
                        border: '1px solid rgba(0, 255, 136, 0.3)',
                        borderRadius: 0 
                      }}>
                        <CardContent>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                              <TextField
                                label="Skill Name"
                                value={skill.name}
                                onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                                fullWidth
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 0,
                                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                    color: '#ffffff',
                                    '& fieldset': { borderColor: 'rgba(0, 255, 136, 0.3)' },
                                    '&:hover fieldset': { borderColor: '#00ff88' },
                                    '&.Mui-focused fieldset': { borderColor: '#00ff88' },
                                  },
                                  '& .MuiInputLabel-root': {
                                    color: '#00ff88',
                                    '&.Mui-focused': { color: '#00ff88' },
                                  },
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <FormControl fullWidth>
                                <InputLabel sx={{ color: '#00ff88' }}>Level</InputLabel>
                                <Select
                                  value={skill.level}
                                  onChange={(e) => updateSkill(skill.id, 'level', e.target.value)}
                                  label="Level"
                                  sx={{
                                    borderRadius: 0,
                                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                    color: '#ffffff',
                                    '& fieldset': { borderColor: 'rgba(0, 255, 136, 0.3)' },
                                    '&:hover fieldset': { borderColor: '#00ff88' },
                                    '&.Mui-focused fieldset': { borderColor: '#00ff88' },
                                    '& .MuiSelect-icon': { color: '#00ff88' },
                                  }}
                                >
                                  <MenuItem value="Beginner">Beginner</MenuItem>
                                  <MenuItem value="Intermediate">Intermediate</MenuItem>
                                  <MenuItem value="Advanced">Advanced</MenuItem>
                                  <MenuItem value="Expert">Expert</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <FormControl fullWidth>
                                <InputLabel sx={{ color: '#00ff88' }}>Category</InputLabel>
                                <Select
                                  value={skill.category}
                                  onChange={(e) => updateSkill(skill.id, 'category', e.target.value)}
                                  label="Category"
                                  sx={{
                                    borderRadius: 0,
                                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                    color: '#ffffff',
                                    '& fieldset': { borderColor: 'rgba(0, 255, 136, 0.3)' },
                                    '&:hover fieldset': { borderColor: '#00ff88' },
                                    '&.Mui-focused fieldset': { borderColor: '#00ff88' },
                                    '& .MuiSelect-icon': { color: '#00ff88' },
                                  }}
                                >
                                  <MenuItem value="Technical">Technical</MenuItem>
                                  <MenuItem value="Soft Skills">Soft Skills</MenuItem>
                                  <MenuItem value="Languages">Languages</MenuItem>
                                  <MenuItem value="Tools">Tools</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={2}>
                              <IconButton
                                onClick={() => removeSkill(skill.id)}
                                sx={{ 
                                  color: '#ff6b6b',
                                  border: '1px solid rgba(255, 107, 107, 0.3)',
                                  borderRadius: 0,
                                  width: '100%',
                                  height: '56px'
                                }}
                              >
                                <Delete />
                              </IconButton>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="h6" sx={{ color: '#00ff88', mb: 2, fontWeight: 600 }}>
                      Technical Skills
                    </Typography>
                    <Box>
                      {skillsList?.length > 0 ? (
                        skillsList.map((skill, index) => (
                          <SkillChip key={index} skill={skill.name} level={skill.level} />
                        ))
                      ) : user.profile?.skills?.length > 0 ? (
                        user.profile.skills.map((skill, index) => (
                          <SkillChip key={index} skill={skill} />
                        ))
                      ) : (
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          No skills added yet
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            </ProfileSection>

            {/* Professional Stats Section */}
            <Card
              sx={{
                borderRadius: 0,
                backgroundColor: 'rgba(26, 26, 26, 0.8)',
                border: '2px solid rgba(0, 255, 136, 0.3)',
                mb: 2,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#ffffff',
                    fontWeight: 600,
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <TrendingUp sx={{ color: '#00ff88' }} />
                  Profile Completeness
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      Profile Completion
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#00ff88', fontWeight: 600 }}>
                      {Math.round(
                        ([
                          user.profile?.firstName,
                          user.profile?.lastName,
                          user.profile?.phone,
                          user.profile?.location,
                          user.profile?.bio,
                          user.profile?.skills?.length > 0,
                          user.profile?.experience,
                          user.profile?.education,
                          user.profile?.resumeUrl
                        ].filter(Boolean).length / 9) * 100
                      )}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.round(
                      ([
                        user.profile?.firstName,
                        user.profile?.lastName,
                        user.profile?.phone,
                        user.profile?.location,
                        user.profile?.bio,
                        user.profile?.skills?.length > 0,
                        user.profile?.experience,
                        user.profile?.education,
                        user.profile?.resumeUrl
                      ].filter(Boolean).length / 9) * 100
                    )}
                    sx={{
                      height: 8,
                      borderRadius: 0,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#00ff88',
                      },
                    }}
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: '#00ff88', fontWeight: 700 }}>
                        {user.profile?.skills?.length || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Skills
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: '#00ff88', fontWeight: 700 }}>
                        {user.profile?.experience || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Years Exp.
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: '#00ff88', fontWeight: 700 }}>
                        {user.profile?.resumeUrl ? '1' : '0'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Resume
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Resume Delete Dialog */}
        <Dialog 
          open={resumeDialog} 
          onClose={() => setResumeDialog(false)}
          PaperProps={{
            sx: {
              borderRadius: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.95)',
              border: '2px solid rgba(255, 107, 107, 0.6)',
            }
          }}
        >
          <DialogTitle sx={{ color: '#ffffff' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Delete sx={{ color: '#ff6b6b' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#ff6b6b' }}>
                Delete Resume
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ color: '#ffffff' }}>
              Are you sure you want to delete your resume? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setResumeDialog(false)}
              sx={{ color: '#ffffff' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleResumeDelete} 
              variant="contained"
              sx={{ background: '#ff6b6b', color: '#000000' }}
            >
              Delete Resume
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Profile;