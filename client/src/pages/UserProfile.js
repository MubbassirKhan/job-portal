import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  Grid,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton
} from '@mui/material';
import {
  PersonAdd,
  PersonRemove,
  Send,
  BusinessCenter,
  LocationOn,
  School,
  Email,
  Phone,
  Language,
  ArrowBack,
  Message,
  Share,
  MoreVert,
  Check
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { socialAPI } from '../utils/socialAPI';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('none');
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    if (userId) {
      loadUserProfile();
      checkConnectionStatus();
      loadUserPosts();
    }
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await socialAPI.getUserProfile(userId);
      setUser(response.data);
    } catch (error) {
      console.error('Error loading profile:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPosts = async () => {
    try {
      setPostsLoading(true);
      const response = await socialAPI.getUserPosts(userId);
      setUserPosts(response.data || []);
    } catch (error) {
      console.error('Error loading user posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const checkConnectionStatus = async () => {
    try {
      const response = await socialAPI.getConnectionStatus(userId);
      console.log('Connection status response:', response);
      const status = response.data.status || 'none';
      console.log('Setting connection status to:', status);
      setConnectionStatus(status);
      setRequestSent(status === 'pending');
    } catch (error) {
      console.error('Error checking connection status:', error);
      setConnectionStatus('none');
    }
  };

  const handleSendRequest = async () => {
    try {
      await socialAPI.sendConnectionRequest(userId);
      setRequestSent(true);
      setConnectionStatus('pending');
      toast.success('Connection request sent successfully!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleStartChat = () => {
    // Navigate to messages with this user
    navigate(`/messages?userId=${userId}`);
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
        py: 4 
      }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              py: 8 
            }}>
              <CircularProgress size={60} sx={{ color: '#00ff88' }} />
              <Typography variant="h6" sx={{ mt: 2, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Loading profile...
              </Typography>
            </Box>
          </motion.div>
        </Container>
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
        py: 4 
      }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Paper sx={{ 
              p: 4, 
              textAlign: 'center',
              borderRadius: 0,
              background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
              border: '2px solid rgba(239, 68, 68, 0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              <Typography variant="h6" sx={{ color: '#ef4444', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {error || 'User not found'}
              </Typography>
              <Button 
                onClick={() => navigate(-1)} 
                sx={{ 
                  mt: 2,
                  borderRadius: 0,
                  background: 'linear-gradient(135deg, #00ff88 0%, #22c55e 100%)',
                  color: '#000000',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Go Back
              </Button>
            </Paper>
          </motion.div>
        </Container>
      </Box>
    );
  }

  const getActionButton = () => {
    console.log('Current connection status:', connectionStatus);
    switch (connectionStatus) {
      case 'accepted':
      case 'connected':
        return (
          <Button
            variant="outlined"
            disabled
            startIcon={<Check />}
            sx={{ 
              mr: 1,
              borderRadius: 0,
              borderColor: '#22c55e',
              color: '#22c55e',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              '&.Mui-disabled': {
                borderColor: '#22c55e',
                color: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
              }
            }}
          >
            Connected
          </Button>
        );
      case 'pending':
        return (
          <Button
            variant="outlined"
            disabled
            startIcon={<Send />}
            sx={{ 
              mr: 1,
              borderRadius: 0,
              borderColor: '#f59e0b',
              color: '#f59e0b',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              '&.Mui-disabled': {
                borderColor: '#f59e0b',
                color: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
              }
            }}
          >
            Request Sent
          </Button>
        );
      default:
        return (
          <Button
            variant="outlined"
            startIcon={<PersonAdd />}
            onClick={handleSendRequest}
            sx={{ 
              mr: 1,
              borderRadius: 0,
              borderColor: '#00ff88',
              color: '#00ff88',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              '&:hover': {
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                borderColor: '#00ff88',
                transform: 'translateY(-2px) scale(1.02)',
                boxShadow: '0 8px 24px rgba(0, 255, 136, 0.3)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Connect
          </Button>
        );
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
      pt: 12,
      pb: 4 
    }}>
      <Container maxWidth="lg">
        {/* Professional Dark Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ mb: 3 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
              sx={{ 
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '0.5px',
                color: '#ffffff',
                borderRadius: 0,
                background: 'rgba(0, 255, 136, 0.1)',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                '&:hover': {
                  background: 'rgba(0, 255, 136, 0.2)',
                  borderColor: '#00ff88',
                  transform: 'translateX(-4px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Back to Network
            </Button>
          </Box>
        </motion.div>

        {/* Professional Dark Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Paper sx={{ 
            borderRadius: 0, 
            overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(26, 26, 26, 0.8) 100%)',
            border: '2px solid rgba(0, 255, 136, 0.4)',
            backdropFilter: 'blur(20px)',
            color: 'white',
            mb: 3,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              background: 'linear-gradient(90deg, #00ff88 0%, #22c55e 100%)',
            }
          }}>
            <Box sx={{ p: 4, position: 'relative' }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item>
                  <Avatar
                    src={user.profile?.profileImage}
                    sx={{ 
                      width: 120, 
                      height: 120,
                      border: '4px solid #00ff88',
                      boxShadow: '0 8px 32px rgba(0, 255, 136, 0.3)',
                      background: 'linear-gradient(135deg, #00ff88 0%, #22c55e 100%)',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 12px 40px rgba(0, 255, 136, 0.4)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Typography variant="h2" sx={{ fontWeight: 700, color: '#000000' }}>
                      {user.profile?.firstName?.charAt(0)}
                    </Typography>
                  </Avatar>
                </Grid>
                <Grid item xs>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 800, 
                    mb: 1, 
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '1px' 
                  }}>
                    {user.profile?.firstName} {user.profile?.lastName}
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: 'rgba(255, 255, 255, 0.9)', 
                    mb: 2,
                    fontWeight: 500 
                  }}>
                    {user.profile?.headline || `${user.role === 'admin' ? 'Recruiter' : user.role.charAt(0).toUpperCase() + user.role.slice(1)} Professional`}
                  </Typography>
                  {user.profile?.company && user.profile?.location && (
                    <Typography variant="body1" sx={{ 
                      color: 'rgba(255, 255, 255, 0.8)', 
                      mb: 2,
                      fontWeight: 500 
                    }}>
                      {user.profile.company} • {user.profile.location}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip 
                      label={user.role === 'admin' ? 'Recruiter' : user.role.charAt(0).toUpperCase() + user.role.slice(1)} 
                      sx={{ 
                        backgroundColor: '#00ff88',
                        color: '#000000',
                        fontWeight: 700,
                        borderRadius: 0,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontSize: '0.75rem'
                      }} 
                    />
                    {user.connectionCount !== undefined && (
                      <Chip 
                        label={`${user.connectionCount} connections`} 
                        sx={{ 
                          backgroundColor: 'rgba(0, 255, 136, 0.1)',
                          border: '1px solid rgba(0, 255, 136, 0.3)',
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontWeight: 600,
                          borderRadius: 0,
                          fontSize: '0.75rem'
                        }} 
                      />
                    )}
                    {user.profile?.skills && user.profile.skills.length > 0 && (
                      <Chip 
                        label={`${user.profile.skills.length} skills`} 
                        sx={{ 
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                          color: '#22c55e',
                          fontWeight: 600,
                          borderRadius: 0,
                          fontSize: '0.75rem'
                        }} 
                      />
                    )}
                    {userPosts && userPosts.length > 0 && (
                      <Chip 
                        label={`${userPosts.length} posts`} 
                        sx={{ 
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                          color: '#22c55e',
                          fontWeight: 600,
                          borderRadius: 0,
                          fontSize: '0.75rem'
                        }} 
                      />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {getActionButton()}
                    {connectionStatus === 'connected' && (
                      <Button
                        variant="outlined"
                        startIcon={<Message />}
                        onClick={handleStartChat}
                        sx={{ 
                          borderRadius: 0,
                          borderColor: '#00ff88',
                          color: '#00ff88',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 255, 136, 0.1)',
                            borderColor: '#00ff88',
                            transform: 'translateY(-2px) scale(1.02)',
                            boxShadow: '0 8px 24px rgba(0, 255, 136, 0.3)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Message
                      </Button>
                    )}
                    <IconButton sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: 0,
                      '&:hover': {
                        color: '#00ff88',
                        backgroundColor: 'rgba(0, 255, 136, 0.1)',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.3s ease'
                    }}>
                      <Share />
                    </IconButton>
                    <IconButton sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: 0,
                      '&:hover': {
                        color: '#00ff88',
                        backgroundColor: 'rgba(0, 255, 136, 0.1)',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.3s ease'
                    }}>
                      <MoreVert />
                    </IconButton>
                  </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </motion.div>

        <Grid container spacing={3}>
          {/* Left Column - Professional Dark Main Info */}
          <Grid item xs={12} md={8}>
            {/* Professional Dark About Section */}
            {user.profile?.bio && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card sx={{ 
                  mb: 3, 
                  borderRadius: 0,
                  background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
                  border: '2px solid rgba(0, 255, 136, 0.3)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      mb: 2, 
                      color: '#ffffff',
                      textTransform: 'uppercase',
                      letterSpacing: '1px' 
                    }}>
                      About
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      lineHeight: 1.6, 
                      whiteSpace: 'pre-wrap',
                      color: 'rgba(255, 255, 255, 0.9)' 
                    }}>
                      {user.profile.bio}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Professional Dark Experience Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card sx={{ 
                mb: 3, 
                borderRadius: 0,
                background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
                border: '2px solid rgba(0, 255, 136, 0.3)',
                backdropFilter: 'blur(10px)'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700, 
                    mb: 2, 
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '1px' 
                  }}>
                    Professional Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      p: 2,
                      borderRadius: 0,
                      background: 'rgba(0, 255, 136, 0.05)',
                      border: '1px solid rgba(0, 255, 136, 0.2)'
                    }}>
                      <BusinessCenter sx={{ color: '#00ff88' }} />
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#ffffff' }}>
                          {user.profile?.company || 'Company not specified'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {user.role === 'recruiter' ? 'Talent Acquisition' : user.role === 'admin' ? 'Recruiter' : 'Professional'}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {user.profile?.location && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        p: 2,
                        borderRadius: 0,
                        background: 'rgba(0, 255, 136, 0.05)',
                        border: '1px solid rgba(0, 255, 136, 0.2)'
                      }}>
                        <LocationOn sx={{ color: '#22c55e' }} />
                        <Typography variant="body1" sx={{ color: '#ffffff' }}>{user.profile.location}</Typography>
                      </Box>
                    )}
                    
                    {user.profile?.education && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        p: 2,
                        borderRadius: 0,
                        background: 'rgba(0, 255, 136, 0.05)',
                        border: '1px solid rgba(0, 255, 136, 0.2)'
                      }}>
                        <School sx={{ color: '#16a34a' }} />
                        <Typography variant="body1" sx={{ color: '#ffffff' }}>{user.profile.education}</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>

            {/* Professional Dark Skills Section */}
            {user.profile?.skills && user.profile.skills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Card sx={{ 
                  mb: 3, 
                  borderRadius: 0,
                  background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
                  border: '2px solid rgba(0, 255, 136, 0.3)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      mb: 2, 
                      color: '#ffffff',
                      textTransform: 'uppercase',
                      letterSpacing: '1px' 
                    }}>
                      Skills & Expertise
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {user.profile.skills.map((skill, index) => (
                        <Chip
                          key={index}
                          label={skill}
                          sx={{ 
                            borderRadius: 0,
                            background: 'rgba(0, 255, 136, 0.1)',
                            border: '1px solid rgba(0, 255, 136, 0.3)',
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 255, 136, 0.2)',
                              borderColor: '#00ff88',
                              color: '#ffffff',
                              transform: 'translateY(-2px)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Professional Dark Posts Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <Card sx={{ 
                mb: 3, 
                borderRadius: 0,
                background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
                border: '2px solid rgba(0, 255, 136, 0.3)',
                backdropFilter: 'blur(10px)'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700, 
                    mb: 2, 
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '1px' 
                  }}>
                    Recent Posts {userPosts.length > 0 && `(${userPosts.length})`}
                  </Typography>
                  
                  {postsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress sx={{ color: '#00ff88' }} />
                    </Box>
                  ) : userPosts.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        No posts shared yet
                      </Typography>
                    </Box>
                  ) : (
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 2,
                        maxHeight: userPosts.length > 1 ? '600px' : 'auto',
                        overflowY: userPosts.length > 1 ? 'auto' : 'visible',
                        pr: userPosts.length > 1 ? 1 : 0,
                        '&::-webkit-scrollbar': {
                          width: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                          background: 'rgba(0, 0, 0, 0.1)',
                          borderRadius: 0,
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: 'linear-gradient(135deg, #00ff88 0%, #22c55e 100%)',
                          borderRadius: 0,
                          '&:hover': {
                            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                          }
                        },
                        '&::-webkit-scrollbar-thumb:active': {
                          background: '#00ff88',
                        }
                      }}
                    >
                      {userPosts.slice(0, 5).map((post) => (
                        <Paper 
                          key={post._id} 
                          sx={{ 
                            p: 2, 
                            borderRadius: 0, 
                            background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(0, 0, 0, 0.3) 100%)',
                            border: '1px solid rgba(0, 255, 136, 0.2)',
                            backdropFilter: 'blur(10px)',
                            '&:hover': {
                              border: '1px solid rgba(0, 255, 136, 0.4)',
                              background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 24px rgba(0, 255, 136, 0.15)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Avatar 
                              src={user.profile?.profileImage}
                              sx={{ 
                                width: 32, 
                                height: 32,
                                border: '2px solid #00ff88',
                                background: 'linear-gradient(135deg, #00ff88 0%, #22c55e 100%)'
                              }}
                            >
                              <Typography sx={{ color: '#000000', fontWeight: 700, fontSize: '0.9rem' }}>
                                {user.profile?.firstName?.charAt(0)}
                              </Typography>
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 600, 
                                color: '#ffffff',
                                fontSize: '0.85rem' 
                              }}>
                                {user.profile?.firstName} {user.profile?.lastName}
                              </Typography>
                              <Typography variant="caption" sx={{ 
                                color: 'rgba(255, 255, 255, 0.6)',
                                fontSize: '0.7rem' 
                              }}>
                                {new Date(post.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Typography variant="body2" sx={{ 
                            mb: 1, 
                            whiteSpace: 'pre-wrap',
                            color: 'rgba(255, 255, 255, 0.9)',
                            lineHeight: 1.5,
                            fontSize: '0.85rem'
                          }}>
                            {post.content}
                          </Typography>
                          
                          {post.mediaBase64 && post.mediaBase64.length > 0 && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                              {post.mediaBase64.map((media, index) => (
                                <Box
                                  key={index}
                                  component="img"
                                  src={`data:${media.mimeType};base64,${media.data}`}
                                  alt={media.filename}
                                  sx={{
                                    maxWidth: '100%',
                                    maxHeight: 200,
                                    borderRadius: 0,
                                    objectFit: 'cover',
                                    border: '1px solid rgba(0, 255, 136, 0.3)',
                                    '&:hover': {
                                      border: '1px solid #00ff88',
                                      transform: 'scale(1.02)'
                                    },
                                    transition: 'all 0.3s ease'
                                  }}
                                />
                              ))}
                            </Box>
                          )}
                          
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2, 
                            mt: 2, 
                            pt: 1, 
                            borderTop: '1px solid rgba(0, 255, 136, 0.2)' 
                          }}>
                            <Typography variant="caption" sx={{ 
                              color: 'rgba(255, 255, 255, 0.7)',
                              fontSize: '0.7rem',
                              fontWeight: 600 
                            }}>
                              {post.likes?.length || 0} likes
                            </Typography>
                            <Typography variant="caption" sx={{ 
                              color: 'rgba(255, 255, 255, 0.7)',
                              fontSize: '0.7rem',
                              fontWeight: 600 
                            }}>
                              {post.comments?.length || 0} comments
                            </Typography>
                            <Chip 
                              label={post.postType || 'text'}
                              size="small"
                              sx={{ 
                                ml: 'auto',
                                borderRadius: 0,
                                background: 'rgba(0, 255, 136, 0.1)',
                                border: '1px solid rgba(0, 255, 136, 0.3)',
                                color: '#00ff88',
                                fontSize: '0.65rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}
                            />
                          </Box>
                        </Paper>
                      ))}
                      
                      {userPosts.length > 5 && (
                        <Button 
                          variant="outlined" 
                          sx={{ 
                            mt: 2,
                            borderRadius: 0,
                            borderColor: '#00ff88',
                            color: '#00ff88',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 255, 136, 0.1)',
                              borderColor: '#00ff88',
                              transform: 'scale(1.02)',
                              boxShadow: '0 4px 12px rgba(0, 255, 136, 0.3)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                          onClick={() => {
                            // Could implement pagination or show all posts
                          }}
                        >
                          View All Posts ({userPosts.length})
                        </Button>
                      )}
                    </Box>
              )}
            </CardContent>
          </Card>
            </motion.div>
        </Grid>

        {/* Right Column - Contact & Stats */}
        <Grid item xs={12} md={4}>
          {/* Professional Dark Contact Info */}
          <Card sx={{ 
            mb: 3, 
            borderRadius: 0,
            background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
            border: '2px solid rgba(0, 255, 136, 0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                mb: 2, 
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '1px' 
              }}>
                Contact Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Email sx={{ color: '#00ff88' }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    {user.email}
                  </Typography>
                </Box>
                
                {user.profile?.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Phone sx={{ color: '#22c55e' }} />
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      {user.profile.phone}
                    </Typography>
                  </Box>
                )}
                
                {user.profile?.website && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Language sx={{ color: '#16a34a' }} />
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      {user.profile.website}
                    </Typography>
                  </Box>
                )}
                
                {user.profile?.linkedin && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <BusinessCenter sx={{ color: '#00ff88' }} />
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      LinkedIn Profile
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Professional Dark Profile Stats */}
          <Card sx={{ 
            mb: 3, 
            borderRadius: 0,
            background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
            border: '2px solid rgba(0, 255, 136, 0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                mb: 2, 
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '1px' 
              }}>
                Profile Stats
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Member since
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#00ff88' }}>
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short'
                    })}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Posts shared
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#00ff88' }}>
                    {userPosts.length}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Skills listed
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#00ff88' }}>
                    {user.profile?.skills?.length || 0}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Account type
                  </Typography>
                  <Chip 
                    label={user.role === 'admin' ? 'Recruiter' : user.role}
                    size="small"
                    sx={{ 
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      letterSpacing: '0.5px',
                      borderRadius: 0,
                      backgroundColor: user.role === 'recruiter' || user.role === 'admin' ? '#00ff88' : '#22c55e',
                      color: '#000000',
                      fontSize: '0.7rem'
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Professional Dark Additional Info */}
          <Card sx={{ 
            borderRadius: 0,
            background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
            border: '2px solid rgba(0, 255, 136, 0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                mb: 2, 
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '1px' 
              }}>
                Additional Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {user.profile?.dateOfBirth && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Age
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#00ff88' }}>
                      {new Date().getFullYear() - new Date(user.profile.dateOfBirth).getFullYear()} years
                    </Typography>
                  </Box>
                )}
                
                {user.profile?.experience && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Experience
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#00ff88' }}>
                      {user.profile.experience} years
                    </Typography>
                  </Box>
                )}
                
                {user.profile?.expectedSalary && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Expected Salary
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#00ff88' }}>
                      ${user.profile.expectedSalary}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Profile completed
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#22c55e' }}>
                    {Math.round(((user.profile?.firstName ? 1 : 0) + 
                                 (user.profile?.lastName ? 1 : 0) + 
                                 (user.profile?.bio ? 1 : 0) + 
                                 (user.profile?.company ? 1 : 0) + 
                                 (user.profile?.skills?.length > 0 ? 1 : 0) + 
                                 (user.profile?.profileImage ? 1 : 0)) / 6 * 100)}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      </Container>
    </Box>
  );
};

export default UserProfile;