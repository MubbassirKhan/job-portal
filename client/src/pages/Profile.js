import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  TextField,
  Chip,
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
  Public,
  Timeline,
  TrendingUp,
  Language,
  EmojiEvents,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { SERVER_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { uploadAPI } from '../utils/api';

// ProfileSection component defined outside to prevent re-creation
const ProfileSection = React.memo(({ title, icon, children, isActive, onClick, editMode, onEditClick }) => (
  <Card
    sx={{
      mb: 3,
      borderRadius: 0,
      backgroundColor: isActive ? 'rgba(0, 255, 136, 0.12)' : 'rgba(26, 26, 26, 0.85)',
      border: `2px solid ${isActive ? '#00ff88' : 'rgba(0, 255, 136, 0.3)'}`,
      cursor: editMode ? 'default' : 'pointer',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      animation: 'slideInUp 0.6s ease both',
      backdropFilter: 'blur(10px)',
      boxShadow: isActive 
        ? '0 8px 32px rgba(0, 255, 136, 0.2), 0 0 0 1px rgba(0, 255, 136, 0.1)' 
        : '0 4px 16px rgba(0, 0, 0, 0.3)',
      '&:hover': {
        borderColor: '#00ff88',
        backgroundColor: 'rgba(0, 255, 136, 0.08)',
        transform: 'translateY(-4px) scale(1.01)',
        boxShadow: '0 12px 48px rgba(0, 255, 136, 0.25), 0 0 0 1px rgba(0, 255, 136, 0.2)',
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #00ff88, transparent)',
        transition: 'left 0.6s ease',
      },
      '&:hover::before': {
        left: '100%',
      },
    }}
    onClick={editMode ? undefined : onClick}
  >
    <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: { xs: 44, sm: 48 },
            height: { xs: 44, sm: 48 },
            borderRadius: 0,
            background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 255, 136, 0.1))',
            border: '2px solid rgba(0, 255, 136, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00ff88',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              transform: 'rotate(5deg) scale(1.1)',
              background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.3), rgba(0, 255, 136, 0.2))',
              borderColor: 'rgba(0, 255, 136, 0.6)',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '0',
              height: '0',
              background: 'rgba(0, 255, 136, 0.3)',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              transition: 'all 0.3s ease',
            },
            '&:hover::after': {
              width: '100%',
              height: '100%',
            },
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
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
            transition: 'all 0.3s ease',
            background: 'linear-gradient(135deg, #ffffff, #00ff88)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            '&:hover': {
              transform: 'translateX(4px)',
              filter: 'brightness(1.2)',
            },
          }}
        >
          {title}
        </Typography>
        {isActive && (
          <Button
            variant="outlined"
            size={window.innerWidth < 600 ? 'small' : 'medium'}
            startIcon={<Edit />}
            onClick={(e) => {
              e.stopPropagation();
              onEditClick();
            }}
            sx={{
              borderRadius: 0,
              borderColor: '#00ff88',
              color: '#00ff88',
              fontWeight: 600,
              textTransform: 'none',
              px: { xs: 1.5, sm: 2 },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                backgroundColor: 'rgba(0, 255, 136, 0.15)',
                borderColor: '#00ff88',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 16px rgba(0, 255, 136, 0.3)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.1), transparent)',
                transition: 'left 0.5s ease',
              },
              '&:hover::before': {
                left: '100%',
              },
            }}
          >
            Edit
          </Button>
        )}
      </Box>
      {isActive && (
        <Box 
          sx={{ 
            mt: 3,
            animation: 'fadeInScale 0.4s ease 0.2s both',
            '& > *': {
              animation: 'slideInUp 0.3s ease both',
              '&:nth-of-type(2)': { animationDelay: '0.1s' },
              '&:nth-of-type(3)': { animationDelay: '0.2s' },
              '&:nth-of-type(4)': { animationDelay: '0.3s' },
            }
          }}
        >
          {children}
        </Box>
      )}
    </CardContent>
  </Card>
));

// SkillChip component defined outside to prevent re-creation  
const SkillChip = React.memo(({ skill, level }) => (
  <Chip
    label={`${skill} ${level ? `(${level})` : ''}`}
    sx={{
      mr: 1,
      mb: 1,
      backgroundColor: 'rgba(0, 255, 136, 0.15)',
      color: '#00ff88',
      border: '2px solid rgba(0, 255, 136, 0.4)',
      borderRadius: 0,
      fontWeight: 600,
      fontSize: { xs: '0.75rem', sm: '0.875rem' },
      px: { xs: 1, sm: 1.5 },
      py: { xs: 0.5, sm: 0.75 },
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      animation: 'fadeInScale 0.4s ease both',
      backdropFilter: 'blur(5px)',
      '&:hover': {
        backgroundColor: 'rgba(0, 255, 136, 0.25)',
        borderColor: 'rgba(0, 255, 136, 0.6)',
        transform: 'translateY(-2px) scale(1.05)',
        boxShadow: '0 4px 16px rgba(0, 255, 136, 0.3)',
        color: '#ffffff',
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.2), transparent)',
        transition: 'left 0.5s ease',
      },
      '&:hover::before': {
        left: '100%',
      },
      '& .MuiChip-label': {
        position: 'relative',
        zIndex: 1,
      }
    }}
  />
));

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

  // Form state for basic information
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
    jobTitle: '',
    company: '',
    website: '',
    linkedin: '',
    github: '',
    twitter: '',
    bio: '',
  });

  const {
    register,
    reset,
  } = useForm();

  // Initialize form data when user data loads, but not when in edit mode
  useEffect(() => {
    if (user) {
      const userData = {
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        phone: user.profile?.phone || '',
        location: user.profile?.location || '',
        jobTitle: user.profile?.jobTitle || '',
        company: user.profile?.company || '',
        website: user.profile?.website || '',
        linkedin: user.profile?.linkedin || '',
        github: user.profile?.github || '',
        twitter: user.profile?.twitter || '',
        bio: user.profile?.bio || '',
      };
      
      setFormData(userData);
      
      if (!editMode) {
        reset({
          ...userData,
          skills: user.profile?.skills?.join(', ') || '',
          experience: user.profile?.experience || 0,
          education: user.profile?.education || '',
          birthDate: user.profile?.birthDate || '',
          nationality: user.profile?.nationality || '',
          maritalStatus: user.profile?.maritalStatus || '',
        });
      }
    }
  }, [user, reset, editMode]);

  // Initialize lists separately to avoid form resets
  useEffect(() => {
    if (user) {
      // Initialize lists from user data
      setEducationList(user.profile?.educationDetails || []);
      setExperienceList(user.profile?.workExperience || []);
      
      // Initialize skills list, ensuring each skill has an ID
      const existingSkills = user.profile?.skillsDetailed || [];
      const skillsWithIds = existingSkills.map(skill => ({
        ...skill,
        id: skill.id || Date.now() + Math.random()
      }));
      setSkillsList(skillsWithIds);
      
      setCertificationsList(user.profile?.certifications || []);
      setLanguagesList(user.profile?.languages || []);
    }
  }, [user]);



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

  const handleEducationSave = async () => {
    console.log('Saving education:', educationList);
    
    setLoading(true);
    try {
      const profileData = {
        ...formData,
        educationDetails: educationList,
        workExperience: experienceList,
        skillsDetailed: skillsList,
        certifications: certificationsList,
        languages: languagesList,
      };

      const result = await updateProfile(profileData);
      if (result.success) {
        toast.success('Education updated successfully!');
        setEditMode(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Education update error:', error);
      toast.error('Failed to update education');
    } finally {
      setLoading(false);
    }
  };

  const handleExperienceSave = async () => {
    console.log('Saving experience:', experienceList);
    
    setLoading(true);
    try {
      const profileData = {
        ...formData,
        educationDetails: educationList,
        workExperience: experienceList,
        skillsDetailed: skillsList,
        certifications: certificationsList,
        languages: languagesList,
      };

      const result = await updateProfile(profileData);
      if (result.success) {
        toast.success('Work experience updated successfully!');
        setEditMode(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Experience update error:', error);
      toast.error('Failed to update work experience');
    } finally {
      setLoading(false);
    }
  };

  const handleBasicInfoSave = async () => {
    console.log('Saving basic info:', formData);
    
    setLoading(true);
    try {
      const profileData = {
        ...formData,
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

  // Function to save skills specifically
  const saveSkills = async () => {
    setLoading(true);
    try {
      const profileData = {
        skillsDetailed: skillsList,
      };

      const result = await updateProfile(profileData);
      if (result.success) {
        toast.success('Skills updated successfully!');
        setEditMode(false);
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Skills update error:', error);
      toast.error('Failed to update skills');
    } finally {
      setLoading(false);
    }
  };

  // Certification handlers
  const addCertification = () => {
    const newCertification = {
      id: Date.now(),
      name: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      url: ''
    };
    setCertificationsList([...certificationsList, newCertification]);
  };

  const updateCertification = (id, field, value) => {
    setCertificationsList(certificationsList.map(cert => 
      cert.id === id ? { ...cert, [field]: value } : cert
    ));
  };

  const removeCertification = (id) => {
    setCertificationsList(certificationsList.filter(cert => cert.id !== id));
  };

  // Language handlers
  const addLanguage = () => {
    const newLanguage = {
      id: Date.now(),
      name: '',
      proficiency: 'Beginner'
    };
    setLanguagesList([...languagesList, newLanguage]);
  };

  const updateLanguage = (id, field, value) => {
    setLanguagesList(languagesList.map(lang => 
      lang.id === id ? { ...lang, [field]: value } : lang
    ));
  };

  const removeLanguage = (id) => {
    setLanguagesList(languagesList.filter(lang => lang.id !== id));
  };

  // Save functions
  const handleLanguagesSave = async () => {
    console.log('Saving languages:', languagesList);
    
    setLoading(true);
    try {
      const profileData = {
        ...formData,
        educationDetails: educationList,
        workExperience: experienceList,
        skillsDetailed: skillsList,
        certifications: certificationsList,
        languages: languagesList,
      };

      const result = await updateProfile(profileData);
      if (result.success) {
        toast.success('Languages updated successfully!');
        setEditMode(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Languages update error:', error);
      toast.error('Failed to update languages');
    } finally {
      setLoading(false);
    }
  };

  const handleCertificationsSave = async () => {
    console.log('Saving certifications:', certificationsList);
    
    setLoading(true);
    try {
      const profileData = {
        ...formData,
        educationDetails: educationList,
        workExperience: experienceList,
        skillsDetailed: skillsList,
        certifications: certificationsList,
        languages: languagesList,
      };

      const result = await updateProfile(profileData);
      if (result.success) {
        toast.success('Certifications updated successfully!');
        setEditMode(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Certifications update error:', error);
      toast.error('Failed to update certifications');
    } finally {
      setLoading(false);
    }
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



  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `
        linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #1a1a1a 50%, #0f0f0f 75%, #000000 100%),
        radial-gradient(circle at 20% 20%, rgba(0, 255, 136, 0.03) 0%, transparent 40%),
        radial-gradient(circle at 80% 80%, rgba(0, 255, 136, 0.02) 0%, transparent 40%)
      `,
      backgroundAttachment: 'fixed',
      pt: { xs: 10, sm: 12, md: 14 },
      pb: 4,
      width: '100%',
      margin: 0,
      padding: 0,
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(0, 255, 136, 0.01) 90deg, transparent 180deg, rgba(0, 255, 136, 0.01) 270deg, transparent 360deg)
        `,
        pointerEvents: 'none',
        zIndex: 0,
      },
      '@keyframes slideInUp': {
        '0%': {
          opacity: 0,
          transform: 'translateY(40px)',
        },
        '100%': {
          opacity: 1,
          transform: 'translateY(0)',
        },
      },
      '@keyframes fadeInScale': {
        '0%': {
          opacity: 0,
          transform: 'scale(0.95) translateY(20px)',
        },
        '100%': {
          opacity: 1,
          transform: 'scale(1) translateY(0)',
        },
      },
      '@keyframes shimmer': {
        '0%': {
          backgroundPosition: '-200% 0',
        },
        '100%': {
          backgroundPosition: '200% 0',
        },
      },
      '@keyframes pulse': {
        '0%, 100%': {
          boxShadow: '0 0 20px rgba(0, 255, 136, 0.2)',
        },
        '50%': {
          boxShadow: '0 0 30px rgba(0, 255, 136, 0.4)',
        },
      },
      '@keyframes float': {
        '0%, 100%': {
          transform: 'translateY(0px)',
        },
        '50%': {
          transform: 'translateY(-5px)',
        },
      },
    }}>
      <Container maxWidth={false} sx={{ 
        px: { xs: 1, sm: 2, md: 4 }, 
        width: '100%',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Header */}
        <Box sx={{ 
          mb: { xs: 4, sm: 6 },
          textAlign: { xs: 'center', md: 'left' },
          animation: 'slideInUp 0.8s ease-out',
        }}>
          <Typography
            variant="h3" 
            component="h1"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              background: `
                linear-gradient(135deg, #00ff88 0%, #00e676 30%, #ffffff 60%, #00ff88 100%)
              `,
              backgroundSize: '200% 100%',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: { xs: 1, sm: 2 },
              animation: 'shimmer 3s ease-in-out infinite',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.02)',
                filter: 'drop-shadow(0 4px 8px rgba(0, 255, 136, 0.3))',
              },
            }}
          >
            Professional Profile
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 400, 
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
              maxWidth: { xs: '100%', md: '600px' },
              lineHeight: 1.6,
              animation: 'slideInUp 0.8s ease-out 0.2s both',
            }}
          >
            Manage your professional information and career details
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          {/* Left Column - Profile Overview */}
          <Grid item xs={12} lg={4}>
            <Card
              sx={{
                borderRadius: 0,
                backgroundColor: 'rgba(26, 26, 26, 0.95)',
                border: '2px solid rgba(0, 255, 136, 0.3)',
                backdropFilter: 'blur(20px)',
                mb: 3,
                position: { xs: 'relative', lg: 'sticky' },
                top: { lg: 20 },
                maxHeight: { lg: 'calc(100vh - 40px)' },
                overflowY: { lg: 'auto' },
                contain: 'layout style paint',
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(0, 0, 0, 0.1)',
                  borderRadius: 0,
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(0, 255, 136, 0.5)',
                  borderRadius: 0,
                  '&:hover': {
                    background: 'rgba(0, 255, 136, 0.7)',
                  },
                },
                scrollBehavior: 'smooth',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                willChange: 'border-color, box-shadow',
                isolation: 'isolate',
                '&:hover': {
                  boxShadow: '0 8px 32px rgba(0, 255, 136, 0.15)',
                  border: '2px solid rgba(0, 255, 136, 0.5)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: '#00ff88',
                  opacity: 0.8,
                },
              }}
            >
              <CardContent sx={{ 
                p: { xs: 3, sm: 4 }, 
                textAlign: 'center',
                willChange: 'auto',
                transform: 'translateZ(0)', // Force hardware acceleration and create stacking context
              }}>
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                  <Avatar
                    sx={{
                      width: { xs: 100, sm: 120 },
                      height: { xs: 100, sm: 120 },
                      mx: 'auto',
                      backgroundColor: 'rgba(0, 255, 136, 0.15)',
                      border: '4px solid rgba(0, 255, 136, 0.6)',
                      borderRadius: 0,
                      fontSize: { xs: '2.5rem', sm: '3rem' },
                      color: '#00ff88',
                      fontWeight: 700,
                      position: 'relative',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        boxShadow: '0 8px 32px rgba(0, 255, 136, 0.3)',
                        border: '4px solid rgba(0, 255, 136, 0.8)',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -6,
                        left: -6,
                        right: -6,
                        bottom: -6,
                        borderRadius: 'inherit',
                        background: 'linear-gradient(45deg, #00ff88, transparent, #00ff88)',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        zIndex: -1,
                      },
                      '&:hover::before': {
                        opacity: 0.3,
                      },
                    }}
                  >
                    {user.profile?.firstName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 32,
                      height: 32,
                      backgroundColor: '#00ff88',
                      borderRadius: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '&::after': {
                        content: '"✓"',
                        color: '#000000',
                        fontSize: '16px',
                        fontWeight: 'bold',
                      },
                    }}
                  />
                </Box>
                
                <Typography
                  variant="h5"
                  sx={{
                    color: '#ffffff',
                    fontWeight: 700,
                    mb: 1,
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    background: 'linear-gradient(135deg, #ffffff, #00ff88)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'slideInUp 0.6s ease both',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      filter: 'brightness(1.2)',
                    },
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
                    fontSize: { xs: '1rem', sm: '1.125rem' },
                    padding: '6px 12px',
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    borderRadius: 0,
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    display: 'inline-block',
                    animation: 'slideInUp 0.6s ease 0.2s both',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 255, 136, 0.2)',
                      borderColor: 'rgba(0, 255, 136, 0.5)',
                      transform: 'translateY(-2px) scale(1.02)',
                      boxShadow: '0 4px 16px rgba(0, 255, 136, 0.2)',
                    },
                  }}
                >
                  {user.profile?.jobTitle || (user.role === 'candidate' ? 'Job Seeker' : 'Recruiter')}
                </Typography>

                <Divider sx={{ my: 3, borderColor: 'rgba(0, 255, 136, 0.3)' }} />

                <Box sx={{ textAlign: 'left' }}>
                  {/* Email */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Email sx={{ color: '#00ff88', mr: 2, fontSize: 20 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block' }}>
                        Email
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#ffffff' }}>
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Phone */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ContactPhone sx={{ color: '#00ff88', mr: 2, fontSize: 20 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block' }}>
                        Phone
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#ffffff' }}>
                        {user.profile?.phone || 'Not provided'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Location */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOn sx={{ color: '#00ff88', mr: 2, fontSize: 20 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block' }}>
                        Location
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#ffffff' }}>
                        {user.profile?.location || 'Not provided'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Current Company */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Work sx={{ color: '#00ff88', mr: 2, fontSize: 20 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block' }}>
                        Company
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#ffffff' }}>
                        {user.profile?.company || 'Not provided'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Professional Bio */}
                  {user.profile?.bio && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block', mb: 1 }}>
                        About
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#ffffff', lineHeight: 1.5 }}>
                        {user.profile.bio}
                      </Typography>
                    </Box>
                  )}

                  {/* Resume/CV Section */}
                  <Divider sx={{ my: 2, borderColor: 'rgba(0, 255, 136, 0.3)' }} />
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block', mb: 1 }}>
                      Resume/CV
                    </Typography>
                    {user.profile?.resumeUrl ? (
                      <Button
                        variant="contained"
                        startIcon={<Visibility />}
                        onClick={handleResumeView}
                        fullWidth
                        sx={{
                          background: '#00ff88',
                          color: '#000000',
                          borderRadius: 0,
                          fontWeight: 600,
                          transition: 'background-color 0.2s ease',
                          willChange: 'background-color',
                          '&:hover': {
                            background: 'rgba(0, 255, 136, 0.8)',
                          }
                        }}
                      >
                        View Resume
                      </Button>
                    ) : (
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontStyle: 'italic' }}>
                        No resume uploaded
                      </Typography>
                    )}
                  </Box>

                  {/* Quick Stats */}
                  <Divider sx={{ my: 2, borderColor: 'rgba(0, 255, 136, 0.3)' }} />
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 1, backgroundColor: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.3)' }}>
                        <Typography variant="h6" sx={{ color: '#00ff88', fontWeight: 700 }}>
                          {user.profile?.skillsDetailed?.length || user.profile?.skills?.length || 0}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                          Skills
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 1, backgroundColor: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.3)' }}>
                        <Typography variant="h6" sx={{ color: '#00ff88', fontWeight: 700 }}>
                          {user.profile?.workExperience?.length || 0}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                          Experience
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 1, backgroundColor: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.3)' }}>
                        <Typography variant="h6" sx={{ color: '#00ff88', fontWeight: 700 }}>
                          {user.profile?.languages?.length || 0}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                          Languages
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 1, backgroundColor: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.3)' }}>
                        <Typography variant="h6" sx={{ color: '#00ff88', fontWeight: 700 }}>
                          {user.profile?.certifications?.length || 0}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                          Certifications
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
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


          </Grid>

          {/* Right Column - Profile Sections */}
          <Grid item xs={12} lg={8}>
            {/* Basic Information Section */}
            <ProfileSection
              title="Basic Information"
              icon={<Person />}
              isActive={activeSection === 'basic'}
              onClick={() => setActiveSection(activeSection === 'basic' ? '' : 'basic')}
              editMode={editMode}
              onEditClick={() => setEditMode(true)}
            >
              <Box sx={{ mt: 3 }}>
                {editMode && activeSection === 'basic' ? (
                  <Box onClick={(e) => e.stopPropagation()}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="First Name"
                          value={formData.firstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          fullWidth
                          onClick={(e) => e.stopPropagation()}
                          onFocus={(e) => e.stopPropagation()}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 0,
                              backgroundColor: 'rgba(0, 0, 0, 0.4)',
                              color: '#ffffff',
                              fontWeight: 500,
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              backdropFilter: 'blur(10px)',
                              position: 'relative',
                              overflow: 'hidden',
                              '& fieldset': {
                                borderColor: 'rgba(0, 255, 136, 0.3)',
                                borderWidth: '2px',
                                transition: 'all 0.3s ease',
                              },
                              '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 16px rgba(0, 255, 136, 0.1)',
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgba(0, 255, 136, 0.6)',
                                borderWidth: '2px',
                              },
                              '&.Mui-focused': {
                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 24px rgba(0, 255, 136, 0.2)',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#00ff88',
                                borderWidth: '2px',
                                boxShadow: '0 0 0 2px rgba(0, 255, 136, 0.1)',
                              },
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: '-100%',
                                width: '100%',
                                height: '2px',
                                background: 'linear-gradient(90deg, transparent, #00ff88, transparent)',
                                transition: 'left 0.6s ease',
                                zIndex: 1,
                              },
                              '&.Mui-focused::before': {
                                left: '100%',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: 'rgba(0, 255, 136, 0.8)',
                              fontWeight: 600,
                              fontSize: { xs: '0.9rem', sm: '1rem' },
                              transition: 'all 0.3s ease',
                              '&.Mui-focused': {
                                color: '#00ff88',
                                transform: 'scale(1.05)',
                              },
                            },
                            '& .MuiFormHelperText-root': {
                              color: '#ff6b6b',
                              fontWeight: 500,
                            },
                            '& .MuiInputBase-input': {
                              position: 'relative',
                              zIndex: 2,
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Last Name"
                          value={formData.lastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          fullWidth
                          onClick={(e) => e.stopPropagation()}
                          onFocus={(e) => e.stopPropagation()}
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
                          label="Job Title"
                          value={formData.jobTitle}
                          onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                          fullWidth
                          onClick={(e) => e.stopPropagation()}
                          onFocus={(e) => e.stopPropagation()}
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
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Current Company"
                          value={formData.company}
                          onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
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
                      <Grid item xs={12} sm={6}>
                        <TextField
                          {...register('phone')}
                          label="Phone Number"
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
                      <Grid item xs={12} sm={6}>
                        <TextField
                          {...register('location')}
                          label="Location"
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
                      <Grid item xs={12} sm={6}>
                        <TextField
                          {...register('website')}
                          label="Website"
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
                      <Grid item xs={12} sm={6}>
                        <TextField
                          {...register('linkedin')}
                          label="LinkedIn Profile"
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
                      <Grid item xs={12} sm={6}>
                        <TextField
                          {...register('github')}
                          label="GitHub Profile"
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
                      <Grid item xs={12} sm={6}>
                        <TextField
                          {...register('twitter')}
                          label="Twitter Profile"
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
                      <Grid item xs={12}>
                        <TextField
                          label="Professional Bio"
                          value={formData.bio}
                          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                          multiline
                          rows={4}
                          fullWidth
                          helperText="Tell us about yourself and your professional journey"
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
                              color: 'rgba(255, 255, 255, 0.7)',
                            },
                          }}
                        />
                      </Grid>

                      {/* CV/Resume Upload Section */}
                      <Grid item xs={12}>
                        <Typography variant="h6" sx={{ color: '#00ff88', mb: 2, fontWeight: 600 }}>
                          Resume/CV
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <input
                            accept=".pdf,.doc,.docx"
                            style={{ display: 'none' }}
                            id="resume-upload"
                            type="file"
                            onChange={handleResumeUpload}
                          />
                          <label htmlFor="resume-upload">
                            <Button
                              variant="outlined"
                              component="span"
                              startIcon={uploadLoading ? <CircularProgress size={20} /> : <CloudUpload />}
                              disabled={uploadLoading}
                              sx={{
                                borderRadius: 0,
                                borderColor: '#00ff88',
                                color: '#00ff88',
                                minWidth: '150px',
                                '&:hover': {
                                  backgroundColor: 'rgba(0, 255, 136, 0.1)',
                                  borderColor: '#00ff88',
                                },
                                '&.Mui-disabled': {
                                  borderColor: 'rgba(0, 255, 136, 0.5)',
                                  color: 'rgba(0, 255, 136, 0.5)',
                                }
                              }}
                            >
                              {uploadLoading ? 'Uploading...' : 'Upload Resume'}
                            </Button>
                          </label>
                          {user.profile?.resumeUrl && (
                            <>
                              <Button
                                variant="text"
                                startIcon={<Visibility />}
                                onClick={handleResumeView}
                                sx={{
                                  color: '#00ff88',
                                  '&:hover': {
                                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                                  }
                                }}
                              >
                                View Current
                              </Button>
                              <Button
                                variant="text"
                                startIcon={<Delete />}
                                onClick={() => setResumeDialog(true)}
                                sx={{
                                  color: '#ff6b6b',
                                  '&:hover': {
                                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </>
                          )}
                        </Box>
                        {user.profile?.resumeUrl && (
                          <Typography variant="body2" sx={{ color: 'rgba(0, 255, 136, 0.8)' }}>
                            ✓ Resume uploaded successfully
                          </Typography>
                        )}
                        {!user.profile?.resumeUrl && (
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                            Upload your resume in PDF, DOC, or DOCX format
                          </Typography>
                        )}
                      </Grid>

                      <Grid item xs={12}>
                        <Box 
                          display="flex" 
                          gap={2} 
                          sx={{ 
                            justifyContent: { xs: 'stretch', sm: 'flex-start' },
                            flexDirection: { xs: 'column', sm: 'row' },
                            animation: 'slideInUp 0.5s ease both'
                          }}
                        >
                          <Button
                            onClick={handleBasicInfoSave}
                            variant="contained"
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={16} /> : null}
                            sx={{
                              background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
                              color: '#000000',
                              borderRadius: 0,
                              fontWeight: 700,
                              fontSize: { xs: '0.875rem', sm: '1rem' },
                              px: { xs: 2, sm: 3 },
                              py: { xs: 1, sm: 1.25 },
                              textTransform: 'none',
                              position: 'relative',
                              overflow: 'hidden',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              boxShadow: '0 4px 16px rgba(0, 255, 136, 0.3)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #00cc6a, #00ff88)',
                                transform: 'translateY(-3px)',
                                boxShadow: '0 8px 24px rgba(0, 255, 136, 0.4)',
                              },
                              '&:disabled': {
                                background: 'rgba(0, 255, 136, 0.3)',
                                color: 'rgba(0, 0, 0, 0.5)',
                              },
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: '-100%',
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                                transition: 'left 0.6s ease',
                              },
                              '&:hover::before': {
                                left: '100%',
                              },
                            }}
                          >
                            {loading ? 'Saving...' : 'Save Changes'}
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setEditMode(false);
                              // Reset form data to original user data
                              if (user) {
                                setFormData({
                                  firstName: user.profile?.firstName || '',
                                  lastName: user.profile?.lastName || '',
                                  phone: user.profile?.phone || '',
                                  location: user.profile?.location || '',
                                  jobTitle: user.profile?.jobTitle || '',
                                  company: user.profile?.company || '',
                                  website: user.profile?.website || '',
                                  linkedin: user.profile?.linkedin || '',
                                  github: user.profile?.github || '',
                                  twitter: user.profile?.twitter || '',
                                  bio: user.profile?.bio || '',
                                });
                              }
                            }}
                            sx={{
                              borderRadius: 0,
                              borderColor: '#ff6b6b',
                              borderWidth: '2px',
                              color: '#ff6b6b',
                              fontWeight: 600,
                              fontSize: { xs: '0.875rem', sm: '1rem' },
                              px: { xs: 2, sm: 3 },
                              py: { xs: 1, sm: 1.25 },
                              textTransform: 'none',
                              position: 'relative',
                              overflow: 'hidden',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 107, 107, 0.15)',
                                borderColor: '#ff6b6b',
                                borderWidth: '2px',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 16px rgba(255, 107, 107, 0.2)',
                              },
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: '-100%',
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(90deg, transparent, rgba(255, 107, 107, 0.1), transparent)',
                                transition: 'left 0.5s ease',
                              },
                              '&:hover::before': {
                                left: '100%',
                              },
                            }}
                          >
                            Cancel
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
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
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                        Current Company
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#ffffff' }}>
                        {user.profile?.company || 'Not specified'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                        Phone Number
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#ffffff' }}>
                        {user.profile?.phone || 'Not provided'}
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
              editMode={editMode}
              onEditClick={() => setEditMode(true)}
            >
              <Box sx={{ mt: 3 }}>
                {editMode && activeSection === 'skills' ? (
                  <Box onClick={(e) => e.stopPropagation()}>
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
                              <FormControl fullWidth sx={{
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
                                '& .MuiSelect-icon': { color: '#00ff88' },
                              }}>
                                <InputLabel>Level</InputLabel>
                                <Select
                                  value={skill.level}
                                  onChange={(e) => updateSkill(skill.id, 'level', e.target.value)}
                                  label="Level"
                                >
                                  <MenuItem value="Beginner">Beginner</MenuItem>
                                  <MenuItem value="Intermediate">Intermediate</MenuItem>
                                  <MenuItem value="Advanced">Advanced</MenuItem>
                                  <MenuItem value="Expert">Expert</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <FormControl fullWidth sx={{
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
                                '& .MuiSelect-icon': { color: '#00ff88' },
                              }}>
                                <InputLabel>Category</InputLabel>
                                <Select
                                  value={skill.category}
                                  onChange={(e) => updateSkill(skill.id, 'category', e.target.value)}
                                  label="Category"
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
                    
                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                      <Button
                        onClick={saveSkills}
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
                        {loading ? 'Saving...' : 'Save Skills'}
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

            {/* Experience Section */}
            <ProfileSection
              title="Work Experience"
              icon={<Work />}
              isActive={activeSection === 'experience'}
              onClick={() => setActiveSection(activeSection === 'experience' ? '' : 'experience')}
              editMode={editMode}
              onEditClick={() => setEditMode(true)}
            >
              <Box sx={{ mt: 3 }}>
                {editMode && activeSection === 'experience' ? (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" sx={{ color: '#00ff88', fontWeight: 600 }}>
                        Work Experience
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={addExperience}
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
                        Add Experience
                      </Button>
                    </Box>
                    
                    {experienceList.map((experience) => (
                      <Card key={experience.id} sx={{ 
                        mb: 3, 
                        backgroundColor: 'rgba(0, 255, 136, 0.1)', 
                        border: '1px solid rgba(0, 255, 136, 0.3)',
                        borderRadius: 0 
                      }}>
                        <CardContent>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                label="Job Title"
                                value={experience.title}
                                onChange={(e) => updateExperience(experience.id, 'title', e.target.value)}
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
                                label="Company"
                                value={experience.company}
                                onChange={(e) => updateExperience(experience.id, 'company', e.target.value)}
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
                            <Grid item xs={12} sm={4}>
                              <TextField
                                label="Location"
                                value={experience.location}
                                onChange={(e) => updateExperience(experience.id, 'location', e.target.value)}
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
                              <TextField
                                label="Start Date"
                                type="date"
                                value={experience.startDate}
                                onChange={(e) => updateExperience(experience.id, 'startDate', e.target.value)}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
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
                              <TextField
                                label="End Date"
                                type="date"
                                value={experience.current ? '' : experience.endDate}
                                onChange={(e) => updateExperience(experience.id, 'endDate', e.target.value)}
                                fullWidth
                                disabled={experience.current}
                                InputLabelProps={{ shrink: true }}
                                placeholder={experience.current ? 'Present' : ''}
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
                            <Grid item xs={12} sm={2}>
                              <Button
                                onClick={() => {
                                  if (!experience.current) {
                                    // Check if any other experience is marked as current
                                    const hasCurrentExperience = experienceList.some(exp => 
                                      exp.id !== experience.id && exp.current
                                    );
                                    if (hasCurrentExperience) {
                                      toast.error('Only one position can be marked as current');
                                      return;
                                    }
                                    updateExperience(experience.id, 'current', true);
                                    updateExperience(experience.id, 'endDate', '');
                                  } else {
                                    updateExperience(experience.id, 'current', false);
                                  }
                                }}
                                variant={experience.current ? "contained" : "outlined"}
                                size="small"
                                sx={{
                                  backgroundColor: experience.current ? '#00ff88' : 'transparent',
                                  color: experience.current ? '#000000' : '#00ff88',
                                  borderColor: '#00ff88',
                                  borderWidth: experience.current ? '3px' : '2px',
                                  borderRadius: 0,
                                  fontWeight: 'bold',
                                  minWidth: '100px',
                                  fontSize: experience.current ? '0.9rem' : '0.8rem',
                                  padding: experience.current ? '8px 16px' : '6px 12px',
                                  boxShadow: experience.current ? '0 0 15px rgba(0, 255, 136, 0.6)' : 'none',
                                  animation: experience.current ? 'pulse 1.5s infinite' : 'none',
                                  '@keyframes pulse': {
                                    '0%': {
                                      boxShadow: '0 0 15px rgba(0, 255, 136, 0.6)',
                                    },
                                    '50%': {
                                      boxShadow: '0 0 25px rgba(0, 255, 136, 0.8)',
                                    },
                                    '100%': {
                                      boxShadow: '0 0 15px rgba(0, 255, 136, 0.6)',
                                    }
                                  },
                                  '&:hover': {
                                    backgroundColor: experience.current ? 'rgba(0, 255, 136, 0.9)' : 'rgba(0, 255, 136, 0.1)',
                                    borderColor: '#00ff88',
                                    transform: 'scale(1.05)',
                                  },
                                  transition: 'all 0.3s ease',
                                }}
                              >
                                {experience.current ? '✓ PRESENT' : 'PRESENT'}
                              </Button>
                            </Grid>
                            <Grid item xs={12} sm={1}>
                              <IconButton
                                onClick={() => removeExperience(experience.id)}
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
                            <Grid item xs={12}>
                              <TextField
                                label="Job Description"
                                value={experience.description}
                                onChange={(e) => updateExperience(experience.id, 'description', e.target.value)}
                                fullWidth
                                multiline
                                rows={3}
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
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {/* Save/Cancel buttons for Work Experience */}
                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                      <Button
                        onClick={handleExperienceSave}
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
                        {loading ? 'Saving...' : 'Save Experience'}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setEditMode(false);
                          // Reset experience list to original data
                          if (user.profile?.workExperience) {
                            setExperienceList(user.profile.workExperience);
                          }
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
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="h6" sx={{ color: '#00ff88', mb: 2, fontWeight: 600 }}>
                      Professional Experience
                    </Typography>
                    
                    {experienceList?.length > 0 ? (
                      experienceList.map((experience, index) => (
                        <Card key={index} sx={{ 
                          backgroundColor: 'rgba(0, 255, 136, 0.1)', 
                          border: '1px solid rgba(0, 255, 136, 0.3)',
                          borderRadius: 0,
                          mb: 2 
                        }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Work sx={{ color: '#00ff88' }} />
                                <Box>
                                  <Typography variant="h6" sx={{ color: '#ffffff' }}>
                                    {experience.title}
                                  </Typography>
                                  <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                    {experience.company}
                                  </Typography>
                                  {experience.location && (
                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                      <LocationOn sx={{ fontSize: 16 }} />
                                      {experience.location}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                {experience.startDate && (
                                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                    {new Date(experience.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {' '}
                                    {experience.current ? 'Present' : experience.endDate ? 
                                      new Date(experience.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                            {experience.description && (
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mt: 2 }}>
                                {experience.description}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    ) : user.profile?.experience ? (
                      <Card sx={{ 
                        backgroundColor: 'rgba(0, 255, 136, 0.1)', 
                        border: '1px solid rgba(0, 255, 136, 0.3)',
                        borderRadius: 0,
                        mb: 2 
                      }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Timeline sx={{ color: '#00ff88' }} />
                            <Typography variant="h6" sx={{ color: '#ffffff' }}>
                              {user.profile.experience} Years of Experience
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                            Total professional experience in the field
                          </Typography>
                        </CardContent>
                      </Card>
                    ) : (
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        No experience information provided
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </ProfileSection>

            {/* Education Section */}
            <ProfileSection
              title="Education"
              icon={<School />}
              isActive={activeSection === 'education'}
              onClick={() => setActiveSection(activeSection === 'education' ? '' : 'education')}
              editMode={editMode}
              onEditClick={() => setEditMode(true)}
            >
              <Box sx={{ mt: 3 }}>
                {editMode && activeSection === 'education' ? (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" sx={{ color: '#00ff88', fontWeight: 600 }}>
                        Educational Background
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={addEducation}
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
                        Add Education
                      </Button>
                    </Box>
                    
                    {educationList.map((education) => (
                      <Card key={education.id} sx={{ 
                        mb: 3, 
                        backgroundColor: 'rgba(0, 255, 136, 0.1)', 
                        border: '1px solid rgba(0, 255, 136, 0.3)',
                        borderRadius: 0 
                      }}>
                        <CardContent>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                label="Degree"
                                value={education.degree}
                                onChange={(e) => updateEducation(education.id, 'degree', e.target.value)}
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
                                label="Institution"
                                value={education.institution}
                                onChange={(e) => updateEducation(education.id, 'institution', e.target.value)}
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
                            <Grid item xs={12} sm={4}>
                              <TextField
                                label="Field of Study"
                                value={education.fieldOfStudy}
                                onChange={(e) => updateEducation(education.id, 'fieldOfStudy', e.target.value)}
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
                              <TextField
                                label="Start Date"
                                type="date"
                                value={education.startDate}
                                onChange={(e) => updateEducation(education.id, 'startDate', e.target.value)}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
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
                              <TextField
                                label="End Date"
                                type="date"
                                value={education.current ? '' : education.endDate}
                                onChange={(e) => updateEducation(education.id, 'endDate', e.target.value)}
                                fullWidth
                                disabled={education.current}
                                InputLabelProps={{ shrink: true }}
                                placeholder={education.current ? 'Present' : ''}
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
                            <Grid item xs={12} sm={2}>
                              <Button
                                onClick={() => {
                                  if (!education.current) {
                                    // Check if any other education is marked as current
                                    const hasCurrentEducation = educationList.some(edu => 
                                      edu.id !== education.id && edu.current
                                    );
                                    if (hasCurrentEducation) {
                                      toast.error('Only one education can be marked as current');
                                      return;
                                    }
                                    updateEducation(education.id, 'current', true);
                                    updateEducation(education.id, 'endDate', '');
                                  } else {
                                    updateEducation(education.id, 'current', false);
                                  }
                                }}
                                variant={education.current ? "contained" : "outlined"}
                                size="small"
                                sx={{
                                  backgroundColor: education.current ? '#00ff88' : 'transparent',
                                  color: education.current ? '#000000' : '#00ff88',
                                  borderColor: '#00ff88',
                                  borderWidth: education.current ? '3px' : '2px',
                                  borderRadius: 0,
                                  fontWeight: 'bold',
                                  minWidth: '100px',
                                  fontSize: education.current ? '0.9rem' : '0.8rem',
                                  padding: education.current ? '8px 16px' : '6px 12px',
                                  boxShadow: education.current ? '0 0 15px rgba(0, 255, 136, 0.6)' : 'none',
                                  animation: education.current ? 'pulse 1.5s infinite' : 'none',
                                  '@keyframes pulse': {
                                    '0%': {
                                      boxShadow: '0 0 15px rgba(0, 255, 136, 0.6)',
                                    },
                                    '50%': {
                                      boxShadow: '0 0 25px rgba(0, 255, 136, 0.8)',
                                    },
                                    '100%': {
                                      boxShadow: '0 0 15px rgba(0, 255, 136, 0.6)',
                                    }
                                  },
                                  '&:hover': {
                                    backgroundColor: education.current ? 'rgba(0, 255, 136, 0.9)' : 'rgba(0, 255, 136, 0.1)',
                                    borderColor: '#00ff88',
                                    transform: 'scale(1.05)',
                                  },
                                  transition: 'all 0.3s ease',
                                }}
                              >
                                {education.current ? '✓ PRESENT' : 'PRESENT'}
                              </Button>
                            </Grid>
                            <Grid item xs={12} sm={1}>
                              <IconButton
                                onClick={() => removeEducation(education.id)}
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
                            <Grid item xs={12} sm={6}>
                              <TextField
                                label="Grade/GPA"
                                value={education.grade}
                                onChange={(e) => updateEducation(education.id, 'grade', e.target.value)}
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
                                label="Description"
                                value={education.description}
                                onChange={(e) => updateEducation(education.id, 'description', e.target.value)}
                                fullWidth
                                multiline
                                rows={2}
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
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {/* Save/Cancel buttons for Education */}
                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                      <Button
                        onClick={handleEducationSave}
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
                        {loading ? 'Saving...' : 'Save Education'}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setEditMode(false);
                          // Reset education list to original data
                          if (user.profile?.educationDetails) {
                            setEducationList(user.profile.educationDetails);
                          }
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
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="h6" sx={{ color: '#00ff88', mb: 2, fontWeight: 600 }}>
                      Educational Background
                    </Typography>
                    
                    {educationList?.length > 0 ? (
                      educationList.map((education, index) => (
                        <Card key={index} sx={{ 
                          backgroundColor: 'rgba(0, 255, 136, 0.1)', 
                          border: '1px solid rgba(0, 255, 136, 0.3)',
                          borderRadius: 0,
                          mb: 2 
                        }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <School sx={{ color: '#00ff88' }} />
                                <Box>
                                  <Typography variant="h6" sx={{ color: '#ffffff' }}>
                                    {education.degree}
                                  </Typography>
                                  <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                    {education.institution}
                                  </Typography>
                                  {education.fieldOfStudy && (
                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: 0.5 }}>
                                      {education.fieldOfStudy}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                {education.startDate && (
                                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                    {new Date(education.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {' '}
                                    {education.current ? 'Present' : education.endDate ? 
                                      new Date(education.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
                                  </Typography>
                                )}
                                {education.grade && (
                                  <Typography variant="body2" sx={{ color: '#00ff88', mt: 0.5 }}>
                                    Grade: {education.grade}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                            {education.description && (
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mt: 2 }}>
                                {education.description}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    ) : user.profile?.education ? (
                      <Card sx={{ 
                        backgroundColor: 'rgba(0, 255, 136, 0.1)', 
                        border: '1px solid rgba(0, 255, 136, 0.3)',
                        borderRadius: 0,
                        mb: 2 
                      }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <School sx={{ color: '#00ff88' }} />
                            <Typography variant="h6" sx={{ color: '#ffffff' }}>
                              {user.profile.education}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                            Educational qualification
                          </Typography>
                        </CardContent>
                      </Card>
                    ) : (
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        No education information provided
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </ProfileSection>

            {/* Languages Section */}
            <ProfileSection
              title="Languages Known"
              icon={<Language />}
              isActive={activeSection === 'languages'}
              onClick={() => setActiveSection(activeSection === 'languages' ? '' : 'languages')}
              editMode={editMode}
              onEditClick={() => setEditMode(true)}
            >
              <Box sx={{ mt: 3 }}>
                {editMode && activeSection === 'languages' ? (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" sx={{ color: '#00ff88', fontWeight: 600 }}>
                        Languages Known
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={addLanguage}
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
                        Add Language
                      </Button>
                    </Box>
                    
                    {languagesList.map((language) => (
                      <Card key={language.id} sx={{ 
                        mb: 3, 
                        backgroundColor: 'rgba(0, 255, 136, 0.1)', 
                        border: '1px solid rgba(0, 255, 136, 0.3)',
                        borderRadius: 0 
                      }}>
                        <CardContent>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                label="Language"
                                value={language.name}
                                onChange={(e) => updateLanguage(language.id, 'name', e.target.value)}
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
                            <Grid item xs={12} sm={5}>
                              <FormControl fullWidth>
                                <InputLabel sx={{ color: '#00ff88', '&.Mui-focused': { color: '#00ff88' } }}>
                                  Proficiency Level
                                </InputLabel>
                                <Select
                                  value={language.proficiency}
                                  onChange={(e) => updateLanguage(language.id, 'proficiency', e.target.value)}
                                  sx={{
                                    borderRadius: 0,
                                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                    color: '#ffffff',
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 255, 136, 0.3)' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff88' },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff88' },
                                  }}
                                >
                                  <MenuItem value="Beginner">Beginner</MenuItem>
                                  <MenuItem value="Intermediate">Intermediate</MenuItem>
                                  <MenuItem value="Advanced">Advanced</MenuItem>
                                  <MenuItem value="Fluent">Fluent</MenuItem>
                                  <MenuItem value="Native">Native</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={1}>
                              <IconButton
                                onClick={() => removeLanguage(language.id)}
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
                    
                    {/* Save/Cancel buttons for Languages */}
                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                      <Button
                        onClick={handleLanguagesSave}
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
                        {loading ? 'Saving...' : 'Save Languages'}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setEditMode(false);
                          if (user.profile?.languages) {
                            setLanguagesList(user.profile.languages);
                          }
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
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="h6" sx={{ color: '#00ff88', mb: 2, fontWeight: 600 }}>
                      Languages Known
                    </Typography>
                    
                    {languagesList?.length > 0 ? (
                      <Grid container spacing={2}>
                        {languagesList.map((language, index) => (
                          <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card sx={{ 
                              backgroundColor: 'rgba(0, 255, 136, 0.1)', 
                              border: '1px solid rgba(0, 255, 136, 0.3)',
                              borderRadius: 0,
                              height: '100%'
                            }}>
                              <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                  <Language sx={{ color: '#00ff88' }} />
                                  <Typography variant="h6" sx={{ color: '#ffffff' }}>
                                    {language.name}
                                  </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: '#00ff88' }}>
                                  {language.proficiency}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        No languages added yet
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </ProfileSection>

            {/* Certifications Section */}
            <ProfileSection
              title="Certifications"
              icon={<EmojiEvents />}
              isActive={activeSection === 'certifications'}
              onClick={() => setActiveSection(activeSection === 'certifications' ? '' : 'certifications')}
              editMode={editMode}
              onEditClick={() => setEditMode(true)}
            >
              <Box sx={{ mt: 3 }}>
                {editMode && activeSection === 'certifications' ? (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" sx={{ color: '#00ff88', fontWeight: 600 }}>
                        Certifications & Awards
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={addCertification}
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
                        Add Certification
                      </Button>
                    </Box>
                    
                    {certificationsList.map((cert) => (
                      <Card key={cert.id} sx={{ 
                        mb: 3, 
                        backgroundColor: 'rgba(0, 255, 136, 0.1)', 
                        border: '1px solid rgba(0, 255, 136, 0.3)',
                        borderRadius: 0 
                      }}>
                        <CardContent>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                label="Certification Name"
                                value={cert.name}
                                onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
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
                                label="Issuing Organization"
                                value={cert.issuer}
                                onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
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
                                label="Issue Date"
                                type="date"
                                value={cert.issueDate}
                                onChange={(e) => updateCertification(cert.id, 'issueDate', e.target.value)}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
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
                            <Grid item xs={12} sm={5}>
                              <TextField
                                label="Credential ID"
                                value={cert.credentialId}
                                onChange={(e) => updateCertification(cert.id, 'credentialId', e.target.value)}
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
                            <Grid item xs={12} sm={1}>
                              <IconButton
                                onClick={() => removeCertification(cert.id)}
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
                            <Grid item xs={12}>
                              <TextField
                                label="Description"
                                value={cert.description}
                                onChange={(e) => updateCertification(cert.id, 'description', e.target.value)}
                                fullWidth
                                multiline
                                rows={2}
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
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {/* Save/Cancel buttons for Certifications */}
                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                      <Button
                        onClick={handleCertificationsSave}
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
                        {loading ? 'Saving...' : 'Save Certifications'}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setEditMode(false);
                          if (user.profile?.certifications) {
                            setCertificationsList(user.profile.certifications);
                          }
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
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="h6" sx={{ color: '#00ff88', mb: 2, fontWeight: 600 }}>
                      Certifications & Awards
                    </Typography>
                    
                    {certificationsList?.length > 0 ? (
                      certificationsList.map((cert, index) => (
                        <Card key={index} sx={{ 
                          backgroundColor: 'rgba(0, 255, 136, 0.1)', 
                          border: '1px solid rgba(0, 255, 136, 0.3)',
                          borderRadius: 0,
                          mb: 2 
                        }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <EmojiEvents sx={{ color: '#00ff88' }} />
                                <Box>
                                  <Typography variant="h6" sx={{ color: '#ffffff' }}>
                                    {cert.name}
                                  </Typography>
                                  <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                    {cert.issuer}
                                  </Typography>
                                  {cert.credentialId && (
                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: 0.5 }}>
                                      ID: {cert.credentialId}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                {cert.issueDate && (
                                  <Typography variant="body2" sx={{ color: '#00ff88' }}>
                                    Issued: {new Date(cert.issueDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                            {cert.description && (
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mt: 2 }}>
                                {cert.description}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        No certifications added yet
                      </Typography>
                    )}
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
                backdropFilter: 'blur(10px)',
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
                          (user.profile?.skillsDetailed?.length > 0) || (user.profile?.skills?.length > 0),
                          (user.profile?.workExperience?.length > 0) || user.profile?.experience,
                          (user.profile?.educationDetails?.length > 0) || user.profile?.education,
                          (user.profile?.languages?.length > 0),
                          (user.profile?.certifications?.length > 0),
                          user.profile?.resumeUrl
                        ].filter(Boolean).length / 11) * 100
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
                        (user.profile?.skillsDetailed?.length > 0) || (user.profile?.skills?.length > 0),
                        (user.profile?.workExperience?.length > 0) || user.profile?.experience,
                        (user.profile?.educationDetails?.length > 0) || user.profile?.education,
                        (user.profile?.languages?.length > 0),
                        (user.profile?.certifications?.length > 0),
                        user.profile?.resumeUrl
                      ].filter(Boolean).length / 11) * 100
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
                  <Grid item xs={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: '#00ff88', fontWeight: 700 }}>
                        {user.profile?.skillsDetailed?.length || user.profile?.skills?.length || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Skills
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: '#00ff88', fontWeight: 700 }}>
                        {user.profile?.workExperience?.length || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Experience
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: '#00ff88', fontWeight: 700 }}>
                        {user.profile?.languages?.length || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Languages
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: '#00ff88', fontWeight: 700 }}>
                        {user.profile?.certifications?.length || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Certifications
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Profile Completion Suggestions */}
                <Box sx={{ mt: 4, p: 3, backgroundColor: 'rgba(0, 255, 136, 0.05)', borderRadius: 0, border: '1px solid rgba(0, 255, 136, 0.2)' }}>
                  <Typography variant="h6" sx={{ color: '#00ff88', mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUp sx={{ fontSize: 20 }} />
                    Complete Your Profile
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
                    Add the following to reach 100% profile completion:
                  </Typography>

                  <Grid container spacing={2}>
                    {/* Missing Basic Info */}
                    {!user.profile?.firstName && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, backgroundColor: 'rgba(255, 107, 107, 0.1)', borderRadius: 0, border: '1px solid rgba(255, 107, 107, 0.3)' }}>
                          <Person sx={{ color: '#ff6b6b', fontSize: 18 }} />
                          <Typography variant="body2" sx={{ color: '#ffffff' }}>
                            Add your <strong>First Name</strong>
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    {!user.profile?.lastName && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, backgroundColor: 'rgba(255, 107, 107, 0.1)', borderRadius: 0, border: '1px solid rgba(255, 107, 107, 0.3)' }}>
                          <Person sx={{ color: '#ff6b6b', fontSize: 18 }} />
                          <Typography variant="body2" sx={{ color: '#ffffff' }}>
                            Add your <strong>Last Name</strong>
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {!user.profile?.phone && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, backgroundColor: 'rgba(255, 107, 107, 0.1)', borderRadius: 0, border: '1px solid rgba(255, 107, 107, 0.3)' }}>
                          <ContactPhone sx={{ color: '#ff6b6b', fontSize: 18 }} />
                          <Typography variant="body2" sx={{ color: '#ffffff' }}>
                            Add your <strong>Phone Number</strong>
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {!user.profile?.location && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, backgroundColor: 'rgba(255, 107, 107, 0.1)', borderRadius: 0, border: '1px solid rgba(255, 107, 107, 0.3)' }}>
                          <LocationOn sx={{ color: '#ff6b6b', fontSize: 18 }} />
                          <Typography variant="body2" sx={{ color: '#ffffff' }}>
                            Add your <strong>Location</strong>
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {!user.profile?.bio && (
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, backgroundColor: 'rgba(255, 107, 107, 0.1)', borderRadius: 0, border: '1px solid rgba(255, 107, 107, 0.3)' }}>
                          <Edit sx={{ color: '#ff6b6b', fontSize: 18 }} />
                          <Typography variant="body2" sx={{ color: '#ffffff' }}>
                            Add a <strong>Professional Bio</strong> to describe yourself
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {/* Missing Skills */}
                    {(!user.profile?.skillsDetailed || user.profile?.skillsDetailed?.length === 0) && (!user.profile?.skills || user.profile?.skills?.length === 0) && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, backgroundColor: 'rgba(255, 107, 107, 0.1)', borderRadius: 0, border: '1px solid rgba(255, 107, 107, 0.3)' }}>
                          <Code sx={{ color: '#ff6b6b', fontSize: 18 }} />
                          <Typography variant="body2" sx={{ color: '#ffffff' }}>
                            Add your <strong>Technical Skills</strong>
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {/* Missing Work Experience */}
                    {(!user.profile?.workExperience || user.profile?.workExperience?.length === 0) && !user.profile?.experience && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, backgroundColor: 'rgba(255, 107, 107, 0.1)', borderRadius: 0, border: '1px solid rgba(255, 107, 107, 0.3)' }}>
                          <Work sx={{ color: '#ff6b6b', fontSize: 18 }} />
                          <Typography variant="body2" sx={{ color: '#ffffff' }}>
                            Add your <strong>Work Experience</strong>
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {/* Missing Education */}
                    {(!user.profile?.educationDetails || user.profile?.educationDetails?.length === 0) && !user.profile?.education && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, backgroundColor: 'rgba(255, 107, 107, 0.1)', borderRadius: 0, border: '1px solid rgba(255, 107, 107, 0.3)' }}>
                          <School sx={{ color: '#ff6b6b', fontSize: 18 }} />
                          <Typography variant="body2" sx={{ color: '#ffffff' }}>
                            Add your <strong>Education Details</strong>
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {/* Missing Languages */}
                    {(!user.profile?.languages || user.profile?.languages?.length === 0) && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, backgroundColor: 'rgba(255, 107, 107, 0.1)', borderRadius: 0, border: '1px solid rgba(255, 107, 107, 0.3)' }}>
                          <Language sx={{ color: '#ff6b6b', fontSize: 18 }} />
                          <Typography variant="body2" sx={{ color: '#ffffff' }}>
                            Add <strong>Languages Known</strong>
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {/* Missing Certifications */}
                    {(!user.profile?.certifications || user.profile?.certifications?.length === 0) && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, backgroundColor: 'rgba(255, 107, 107, 0.1)', borderRadius: 0, border: '1px solid rgba(255, 107, 107, 0.3)' }}>
                          <EmojiEvents sx={{ color: '#ff6b6b', fontSize: 18 }} />
                          <Typography variant="body2" sx={{ color: '#ffffff' }}>
                            Add your <strong>Certifications</strong>
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {/* Missing Resume */}
                    {!user.profile?.resumeUrl && (
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, backgroundColor: 'rgba(255, 107, 107, 0.1)', borderRadius: 0, border: '1px solid rgba(255, 107, 107, 0.3)' }}>
                          <CloudUpload sx={{ color: '#ff6b6b', fontSize: 18 }} />
                          <Typography variant="body2" sx={{ color: '#ffffff' }}>
                            Upload your <strong>Resume/CV</strong>
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {/* All Complete Message */}
                    {user.profile?.firstName && user.profile?.lastName && user.profile?.phone && user.profile?.location && user.profile?.bio && 
                     ((user.profile?.skillsDetailed && user.profile?.skillsDetailed?.length > 0) || (user.profile?.skills && user.profile?.skills?.length > 0)) &&
                     ((user.profile?.workExperience && user.profile?.workExperience?.length > 0) || user.profile?.experience) &&
                     ((user.profile?.educationDetails && user.profile?.educationDetails?.length > 0) || user.profile?.education) &&
                     (user.profile?.languages && user.profile?.languages?.length > 0) &&
                     (user.profile?.certifications && user.profile?.certifications?.length > 0) &&
                     user.profile?.resumeUrl && (
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 3, backgroundColor: 'rgba(0, 255, 136, 0.1)', borderRadius: 0, border: '1px solid rgba(0, 255, 136, 0.3)', textAlign: 'center' }}>
                          <EmojiEvents sx={{ color: '#00ff88', fontSize: 24 }} />
                          <Typography variant="h6" sx={{ color: '#00ff88', fontWeight: 600 }}>
                            🎉 Congratulations! Your profile is 100% complete!
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Box>
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
              backdropFilter: 'blur(15px)',
              border: '2px solid rgba(255, 107, 107, 0.6)',
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
                Delete Resume
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 3, backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
            <Typography variant="body1" sx={{ lineHeight: 1.6, color: '#ffffff' }}>
              Are you sure you want to delete your resume? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2, backgroundColor: 'rgba(0, 0, 0, 0.8)', borderTop: '1px solid rgba(255, 107, 107, 0.4)' }}>
            <Button 
              onClick={() => setResumeDialog(false)}
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
              onClick={handleResumeDelete} 
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
              Delete Resume
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Profile;