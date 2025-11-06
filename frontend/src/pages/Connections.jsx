import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  Tabs,
  Tab,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  InputAdornment,
  Snackbar
} from '@mui/material';
import {
  PersonAdd,
  PersonRemove,
  Check,
  Close,
  Search,
  BusinessCenter,
  LocationOn,
  School,
  Visibility,
  Send
} from '@mui/icons-material';
import { socialAPI } from '../utils/socialAPI';

const Connections = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [connections, setConnections] = useState([]);
  const [requests, setRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connectionStatuses, setConnectionStatuses] = useState({});
  const [sentRequests, setSentRequests] = useState(new Set());
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const showNotification = useCallback((message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  }, [setNotification]);

  const handleNotificationClose = useCallback((_event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification(prev => ({ ...prev, open: false }));
  }, [setNotification]);

  // Load data based on active tab
  useEffect(() => {
    loadTabData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadTabData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Always load sent requests to update button states
      const sentRequestsResponse = await socialAPI.getSentRequests();
      const sentUserIds = sentRequestsResponse.data.map(req => req.recipient._id);
      setSentRequests(new Set(sentUserIds));
      
      switch (activeTab) {
        case 0: // My Connections
          const connectionsResponse = await socialAPI.getMyConnections();
          setConnections(connectionsResponse.data || []);
          break;
        case 1: // Pending Requests
          const requestsResponse = await socialAPI.getPendingRequests();
          setRequests(requestsResponse.data?.received || []);
          break;
        case 2: // Suggestions
          const suggestionsResponse = await socialAPI.getConnectionSuggestions();
          setSuggestions(suggestionsResponse.data || []);
          break;
        case 3: // All Users
          const usersResponse = await socialAPI.getAllUsers();
          setAllUsers(usersResponse.data || []);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('❌ Error loading tab data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle connection actions
  const handleSendRequest = async (userId) => {
    try {
      await socialAPI.sendConnectionRequest(userId);
      
      // Add to sent requests set
      setSentRequests(prev => new Set([...prev, userId]));
      
      // Remove from suggestions and all users lists
      setSuggestions(prev => prev.filter(user => user._id !== userId));
      setAllUsers(prev => prev.filter(user => user._id !== userId));
      
      // Show success message
      showNotification('Connection request sent successfully!', 'success');
    } catch (error) {
      console.error('❌ Error sending request:', error);
      
      // Show user-friendly error message
      let errorMessage = error.message;
      if (error.message.includes('already exists') || error.message.includes('already connected')) {
        errorMessage = 'You are already connected or have a pending request with this user.';
        // If already connected/pending, also mark as sent
        setSentRequests(prev => new Set([...prev, userId]));
      }

      showNotification(errorMessage, 'error');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await socialAPI.acceptConnectionRequest(requestId);
      setRequests(prev => prev.filter(request => request._id !== requestId));

      try {
        const connectionsResponse = await socialAPI.getMyConnections();
        setConnections(connectionsResponse.data || []);
      } catch (refreshError) {
        console.error('❌ Error refreshing connections after accept:', refreshError);
      }

      showNotification('Connection request accepted!', 'success');
    } catch (error) {
      console.error('❌ Error accepting request:', error);
      showNotification(error.message || 'Failed to accept connection request', 'error');
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      await socialAPI.declineConnectionRequest(requestId);
      setRequests(prev => prev.filter(request => request._id !== requestId));
      showNotification('Connection request declined', 'info');
    } catch (error) {
      console.error('❌ Error declining request:', error);
      showNotification(error.message || 'Failed to decline connection request', 'error');
    }
  };

  const handleRemoveConnection = async (connectionId) => {
    try {
      await socialAPI.removeConnection(connectionId);
      setConnections(prev => prev.filter(conn => conn._id !== connectionId));
      
      showNotification('Connection removed successfully', 'success');
    } catch (error) {
      console.error('❌ Error removing connection:', error);
      showNotification(error.message || 'Failed to remove connection', 'error');
    }
  };

  // Filter data based on search
  const getFilteredData = () => {
    const currentData = activeTab === 0 ? connections : 
                       activeTab === 1 ? requests : 
                       activeTab === 2 ? suggestions : allUsers;
    
    if (!searchQuery) return currentData;
    
    return currentData.filter(item => {
      // For connections, the user is in item.user, for requests it's item.requester, for suggestions and all users it's the item itself
      const user = activeTab === 0 ? item.user : (activeTab === 1 ? item.requester : item);
      const fullName = `${user.profile.firstName} ${user.profile.lastName}`.toLowerCase();
      const company = user.profile.company?.toLowerCase() || '';
      const headline = user.profile.headline?.toLowerCase() || '';
      
      return fullName.includes(searchQuery.toLowerCase()) ||
             company.includes(searchQuery.toLowerCase()) ||
             headline.includes(searchQuery.toLowerCase());
    });
  };
  const ConnectionCard = ({ user, isRequest = false, requestId = null, connectionId = null, showActions = true }) => {
    const profileLink = user?._id ? `/profile/${user._id}` : undefined;

    return (
      <Box
        sx={{
          opacity: 1,
          transform: 'translateY(0)',
          transition: 'all 0.4s ease-out',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 12px 40px rgba(0, 255, 136, 0.2)',
          }
        }}
      >
        <Card 
          sx={{ 
            mb: 3, 
            borderRadius: 0, 
            overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
            border: '2px solid rgba(0, 255, 136, 0.3)',
            backdropFilter: 'blur(10px)',
            cursor: 'pointer',
            '&:hover': {
              borderColor: '#00ff88',
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(0, 255, 136, 0.2)',
              transition: 'all 0.4s ease'
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '3px',
              background: 'linear-gradient(90deg, #00ff88 0%, #22c55e 100%)',
            }
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 }, position: 'relative' }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: { xs: 'center', sm: 'flex-start' }, 
              gap: { xs: 1.5, sm: 2, md: 3 },
              flexDirection: { xs: 'column', sm: 'row' },
              textAlign: { xs: 'center', sm: 'left' }
            }}>
            {/* Professional Dark Profile Image with Status */}
            <Box sx={{ 
              position: 'relative',
              alignSelf: { xs: 'center', sm: 'flex-start' }
            }}>
              <Avatar
                component={profileLink ? RouterLink : 'div'}
                to={profileLink}
                src={user.profile.profileImage}
                sx={{ 
                  width: { xs: 60, sm: 70, md: 80 }, 
                  height: { xs: 60, sm: 70, md: 80 },
                  border: '3px solid #00ff88',
                  boxShadow: '0 8px 24px rgba(0, 255, 136, 0.3)',
                  background: 'linear-gradient(135deg, #00ff88 0%, #22c55e 100%)',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 12px 32px rgba(0, 255, 136, 0.4)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#000000', fontSize: '2rem' }}>
                  {user.profile.firstName.charAt(0)}
                </Typography>
              </Avatar>
              {/* Professional Online Status */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 4,
                  right: 4,
                  width: 18,
                  height: 18,
                  borderRadius: 0,
                  backgroundColor: '#00ff88',
                  border: '2px solid #000000',
                  boxShadow: '0 0 10px rgba(0, 255, 136, 0.6)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '8px',
                    height: '8px',
                    borderRadius: 0,
                    backgroundColor: '#000000',
                  }
                }}
              />
            </Box>
            
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Professional Dark Name and Title */}
              <Box sx={{ mb: 2 }}>
                <Typography 
                  variant="h6" 
                  component={profileLink ? RouterLink : 'span'}
                  to={profileLink}
                  sx={{ 
                    fontWeight: 700, 
                    mb: 0.5,
                    color: '#ffffff',
                    cursor: profileLink ? 'pointer' : 'default',
                    textTransform: 'uppercase',
                    letterSpacing: { xs: '0.3px', sm: '0.5px' },
                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                    textAlign: { xs: 'center', sm: 'left' },
                    '&:hover': {
                      color: '#00ff88',
                      transform: profileLink ? 'translateX(4px)' : 'none',
                      transition: 'all 0.3s ease'
                    }
                  }}
                >
                  {user.profile.firstName} {user.profile.lastName}
                </Typography>
                
                {user.profile.headline && (
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.8)', 
                      fontWeight: 500,
                      mb: 1,
                      lineHeight: 1.4,
                      fontSize: '0.95rem'
                    }}
                  >
                    {user.profile.headline}
                  </Typography>
                )}
              </Box>
              
              {/* Professional Dark Company and Location Info */}
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: { xs: 1, sm: 2 }, 
                mb: 2,
                justifyContent: { xs: 'center', sm: 'flex-start' }
              }}>
                {user.profile.company && (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    p: 1,
                    borderRadius: 0,
                    background: 'rgba(0, 255, 136, 0.1)',
                    '&:hover': {
                      background: 'rgba(0, 255, 136, 0.15)'
                    },
                    transition: 'all 0.3s ease'
                  }}>
                    <BusinessCenter 
                      fontSize="small" 
                      sx={{ color: '#00ff88' }}
                    />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontWeight: 600,
                        fontSize: '0.8rem'
                      }}
                    >
                      {user.profile.company}
                    </Typography>
                  </Box>
                )}
                
                {user.profile.location && (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    p: 1,
                    borderRadius: 0,
                    background: 'rgba(0, 255, 136, 0.1)',
                    '&:hover': {
                      background: 'rgba(0, 255, 136, 0.15)'
                    },
                    transition: 'all 0.3s ease'
                  }}>
                    <LocationOn 
                      fontSize="small" 
                      sx={{ color: '#22c55e' }}
                    />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontWeight: 600,
                        fontSize: '0.8rem'
                      }}
                    >
                      {user.profile.location}
                    </Typography>
                  </Box>
                )}
              </Box>
              
              {/* Professional Dark Tags and Stats */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                <Chip 
                  label={user.role === 'admin' ? 'Recruiter' : user.role} 
                  size="small" 
                  sx={{
                    backgroundColor: (user.role === 'recruiter' || user.role === 'admin') ? '#00ff88' : '#22c55e',
                    color: '#000000',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderRadius: 0,
                    fontSize: '0.7rem',
                    '&:hover': {
                      backgroundColor: (user.role === 'recruiter' || user.role === 'admin') ? '#22c55e' : '#16a34a',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0, 255, 136, 0.3)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                />
                {user.connectionCount && (
                  <Chip 
                    label={`${user.connectionCount} connections`} 
                    size="small" 
                    sx={{
                      borderRadius: 0,
                      background: 'rgba(0, 255, 136, 0.1)',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 255, 136, 0.15)',
                        transform: 'translateY(-1px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  />
                )}
                {user.profile.skills && user.profile.skills.length > 0 && (
                  <Chip 
                    label={`${user.profile.skills.length} skills`} 
                    size="small" 
                    sx={{
                      borderRadius: 0,
                      background: 'rgba(34, 197, 94, 0.1)',
                      color: '#22c55e',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      '&:hover': {
                        backgroundColor: 'rgba(34, 197, 94, 0.15)',
                        color: '#16a34a',
                        transform: 'translateY(-1px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  />
                )}
              </Box>
              
              {/* Professional Dark Action Buttons */}
              {showActions && (
                <Box sx={{ 
                  display: 'flex', 
                  gap: { xs: 1, sm: 1.5 },
                  flexDirection: { xs: 'column', sm: 'row' },
                  width: { xs: '100%', sm: 'auto' },
                  mt: { xs: 2, sm: 0 }
                }}>
                  {isRequest ? (
                    <>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<Check />}
                        onClick={() => handleAcceptRequest(requestId)}
                        sx={{ 
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          borderRadius: 0,
                          px: { xs: 2, sm: 3 },
                          py: { xs: 0.5, sm: 1 },
                          fontSize: { xs: '0.7rem', sm: '0.8rem' },
                          letterSpacing: { xs: '0.3px', sm: '0.5px' },
                          width: { xs: '100%', sm: 'auto' },
                          background: 'linear-gradient(135deg, #00ff88 0%, #22c55e 100%)',
                          color: '#000000',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                            transform: 'translateY(-2px) scale(1.02)',
                            boxShadow: '0 8px 24px rgba(0, 255, 136, 0.4)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Accept
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Close />}
                        onClick={() => handleDeclineRequest(requestId)}
                        sx={{ 
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          borderRadius: 0,
                          px: { xs: 2, sm: 3 },
                          py: { xs: 0.5, sm: 1 },
                          fontSize: { xs: '0.7rem', sm: '0.8rem' },
                          letterSpacing: { xs: '0.3px', sm: '0.5px' },
                          width: { xs: '100%', sm: 'auto' },
                          borderWidth: 2,
                          borderColor: '#ef4444',
                          color: '#ef4444',
                          '&:hover': {
                            borderWidth: 2,
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            transform: 'translateY(-2px) scale(1.02)',
                            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Decline
                      </Button>
                    </>
                  ) : activeTab === 0 ? (
                    <>
                      <Button
                        component={profileLink ? RouterLink : 'button'}
                        to={profileLink}
                        size="small"
                        variant="outlined"
                        startIcon={<Visibility />}
                        sx={{ 
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          borderRadius: 0,
                          px: { xs: 2, sm: 3 },
                          py: { xs: 0.5, sm: 1 },
                          fontSize: { xs: '0.7rem', sm: '0.8rem' },
                          letterSpacing: { xs: '0.3px', sm: '0.5px' },
                          width: { xs: '100%', sm: 'auto' },
                          borderWidth: 2,
                          borderColor: '#00ff88',
                          color: '#00ff88',
                          '&:hover': {
                            borderWidth: 2,
                            backgroundColor: 'rgba(0, 255, 136, 0.1)',
                            transform: 'translateY(-2px) scale(1.02)',
                            boxShadow: '0 8px 24px rgba(0, 255, 136, 0.3)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        View Profile
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<PersonRemove />}
                        onClick={() => handleRemoveConnection(connectionId || user._id)}
                        sx={{ 
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          borderRadius: 0,
                          px: { xs: 2, sm: 3 },
                          py: { xs: 0.5, sm: 1 },
                          fontSize: { xs: '0.7rem', sm: '0.8rem' },
                          letterSpacing: { xs: '0.3px', sm: '0.5px' },
                          width: { xs: '100%', sm: 'auto' },
                          borderWidth: 2,
                          borderColor: '#ef4444',
                          color: '#ef4444',
                          '&:hover': {
                            borderWidth: 2,
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            transform: 'translateY(-2px) scale(1.02)',
                            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Remove
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="small"
                      variant={sentRequests.has(user._id) ? "outlined" : "contained"}
                      startIcon={sentRequests.has(user._id) ? <Send /> : <PersonAdd />}
                      onClick={sentRequests.has(user._id) ? undefined : () => handleSendRequest(user._id)}
                      disabled={sentRequests.has(user._id)}
                      sx={{ 
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        borderRadius: 0,
                        px: { xs: 2, sm: 3 },
                        py: { xs: 0.5, sm: 1 },
                        fontSize: { xs: '0.7rem', sm: '0.8rem' },
                        letterSpacing: { xs: '0.3px', sm: '0.5px' },
                        width: { xs: '100%', sm: 'auto' },
                        background: sentRequests.has(user._id) 
                          ? 'transparent' 
                          : 'linear-gradient(135deg, #00ff88 0%, #22c55e 100%)',
                        borderColor: sentRequests.has(user._id) ? '#22c55e' : 'transparent',
                        color: sentRequests.has(user._id) ? '#22c55e' : '#000000',
                        borderWidth: sentRequests.has(user._id) ? 2 : 0,
                        '&:hover': {
                          background: sentRequests.has(user._id) 
                            ? 'rgba(34, 197, 94, 0.1)' 
                            : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                          transform: sentRequests.has(user._id) ? 'none' : 'translateY(-2px) scale(1.02)',
                          boxShadow: sentRequests.has(user._id) 
                            ? '0 4px 12px rgba(34, 197, 94, 0.2)' 
                            : '0 8px 24px rgba(0, 255, 136, 0.4)',
                          borderWidth: sentRequests.has(user._id) ? 2 : 0,
                          color: sentRequests.has(user._id) ? '#16a34a' : '#000000',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: 'transparent',
                          color: '#22c55e',
                          borderColor: '#22c55e',
                          opacity: 0.8
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {sentRequests.has(user._id) ? 'Sent' : 'Connect'}
                    </Button>
                  )}
                </Box>
              )}
            </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
      pt: { xs: 10, sm: 12 },
      pb: 4, 
      px: { xs: 1, sm: 2, md: 4 }
    }}>
      <Container maxWidth="xl">
        {/* Professional Dark Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ 
              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(26, 26, 26, 0.8) 100%)',
              borderRadius: 0,
              p: { xs: 2, sm: 3, md: 4 },
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              border: '2px solid rgba(0, 255, 136, 0.4)',
              backdropFilter: 'blur(20px)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 255, 136, 0.05)',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '4px',
                background: 'linear-gradient(90deg, #00ff88 0%, #22c55e 100%)',
              }
            }}>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 800, 
                    mb: 1,
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: { xs: '1px', md: '2px' },
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3rem' }
                  }}
                >
                  Professional <span style={{ color: '#00ff88' }}>Network</span>
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 400,
                    color: 'rgba(255, 255, 255, 0.8)',
                    maxWidth: { xs: '100%', sm: '500px', md: '600px' },
                    letterSpacing: '0.5px',
                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' }
                  }}
                >
                  Build meaningful connections with professionals worldwide. Grow your network and discover new opportunities.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Professional Dark Search Bar */}
        <Box sx={{ mb: 4 }}>
          <Card sx={{ 
            mb: 4, 
            borderRadius: 0,
            background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
            border: '2px solid rgba(0, 255, 136, 0.3)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 255, 136, 0.1)'
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <TextField
                fullWidth
                placeholder="Search professionals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#00ff88', fontSize: 24 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0,
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    color: '#ffffff',
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 255, 136, 0.15)',
                      borderColor: 'rgba(0, 255, 136, 0.5)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'rgba(0, 255, 136, 0.15)',
                      borderColor: '#00ff88',
                      boxShadow: '0 0 0 2px rgba(0, 255, 136, 0.2)'
                    },
                    '& fieldset': {
                      border: 'none',
                    }
                  },
                  '& .MuiInputBase-input': {
                    color: '#ffffff',
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    padding: { xs: '12px 14px', sm: '16px 14px' },
                    '&::placeholder': {
                      color: 'rgba(255, 255, 255, 0.6)',
                      opacity: 1
                    }
                  }
                }}
              />
            </CardContent>
          </Card>
        </Box>

        {/* Professional Dark Tabs */}
        <Box sx={{ mb: 4 }}>
          <Paper sx={{ 
            mb: 4, 
            borderRadius: 0,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
            border: '2px solid rgba(0, 255, 136, 0.3)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 255, 136, 0.1)'
          }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
                  py: { xs: 1.5, sm: 2, md: 2.5 },
                  px: { xs: 1, sm: 2 },
                  color: 'rgba(255, 255, 255, 0.7)',
                  letterSpacing: { xs: '0.3px', sm: '0.5px' },
                  border: '1px solid rgba(0, 255, 136, 0.2)',
                  borderBottom: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    color: '#ffffff',
                    borderColor: 'rgba(0, 255, 136, 0.4)',
                  },
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #00ff88 0%, #22c55e 100%)',
                    color: '#000000',
                    borderColor: '#00ff88',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    }
                  }
                },
                '& .MuiTabs-indicator': {
                  display: 'none'
                }
              }}
            >
              <Tab 
                label={
                  <Typography variant="body1" sx={{ 
                    fontWeight: 'inherit', 
                    letterSpacing: 'inherit',
                    fontSize: { xs: '0.65rem', sm: '0.8rem', md: '0.9rem' }
                  }}>
                    {/* Mobile: shorter text, Desktop: full text */}
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>My Connections</Box>
                    <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Connected</Box>
                  </Typography>
                }
              />
              <Tab 
                label={
                  <Typography variant="body1" sx={{ 
                    fontWeight: 'inherit', 
                    letterSpacing: 'inherit',
                    fontSize: { xs: '0.65rem', sm: '0.8rem', md: '0.9rem' }
                  }}>
                    Requests
                  </Typography>
                }
              />
              <Tab 
                label={
                  <Typography variant="body1" sx={{ 
                    fontWeight: 'inherit', 
                    letterSpacing: 'inherit',
                    fontSize: { xs: '0.65rem', sm: '0.8rem', md: '0.9rem' }
                  }}>
                    Suggestions
                  </Typography>
                }
              />
              <Tab 
                label={
                  <Typography variant="body1" sx={{ 
                    fontWeight: 'inherit', 
                    letterSpacing: 'inherit',
                    fontSize: { xs: '0.65rem', sm: '0.8rem', md: '0.9rem' }
                  }}>
                    Discover
                  </Typography>
                }
              />
            </Tabs>
          </Paper>
        </Box>

        {/* Professional Dark Error Alert */}
        {error && (
          <Box sx={{ mb: 4 }}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 4,
                borderRadius: 0,
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
                border: '2px solid rgba(239, 68, 68, 0.3)',
                color: '#ffffff',
                '& .MuiAlert-message': {
                  fontWeight: 600,
                  color: '#ffffff'
                },
                '& .MuiAlert-icon': {
                  color: '#ef4444'
                },
                backdropFilter: 'blur(10px)'
              }} 
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          </Box>
        )}

        {/* Professional Dark Loading State */}
        {loading && (
          <Box>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              py: { xs: 4, sm: 6, md: 8 },
              px: { xs: 2, sm: 3, md: 4 },
              mx: { xs: 1, sm: 0 },
              background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
              borderRadius: 0,
              border: '2px solid rgba(0, 255, 136, 0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              <CircularProgress 
                size={50}
                thickness={4}
                sx={{ 
                  color: '#00ff88',
                  mb: { xs: 2, sm: 3 },
                  width: { xs: '40px', sm: '50px', md: '60px' },
                  height: { xs: '40px', sm: '50px', md: '60px' }
                }}
              />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#ffffff', 
                  textTransform: 'uppercase', 
                  letterSpacing: { xs: '0.5px', sm: '1px' },
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                  mb: { xs: 1, sm: 1.5 },
                  textAlign: 'center'
                }}
              >
                Loading your network...
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  maxWidth: { xs: '280px', sm: '350px', md: 'none' },
                  lineHeight: 1.4,
                  textAlign: 'center'
                }}
              >
                Please wait while we fetch your connections
              </Typography>
            </Box>
          </Box>
        )}

      {/* Content */}
      {!loading && (
        <Box>
          {activeTab === 0 && (
            <Box>
              {getFilteredData().length === 0 ? (
                <div>
                  <Paper sx={{ 
                    p: 6, 
                    textAlign: 'center',
                    borderRadius: 0,
                    background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
                    border: '2px solid rgba(0, 255, 136, 0.3)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <Box sx={{ mb: 3 }}>
                      <PersonAdd sx={{ fontSize: 80, color: '#00ff88', opacity: 0.8 }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      No connections yet
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3, maxWidth: '400px', mx: 'auto' }}>
                      Start building your professional network by connecting with colleagues, industry professionals, and potential collaborators.
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => setActiveTab(2)}
                      sx={{
                        borderRadius: 0,
                        px: 4,
                        py: 1.5,
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        letterSpacing: '0.5px',
                        background: 'linear-gradient(135deg, #00ff88 0%, #22c55e 100%)',
                        color: '#000000',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                          transform: 'scale(1.05)',
                          boxShadow: '0 8px 24px rgba(0, 255, 136, 0.4)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Browse Suggestions
                    </Button>
                  </Paper>
                </div>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {getFilteredData().map((connection) => (
                    <ConnectionCard
                      key={connection._id}
                      user={connection.user}
                      connectionId={connection._id}
                    />
                  ))}
                </Box>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              {getFilteredData().length === 0 ? (
                <div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Paper sx={{ 
                    p: 6, 
                    textAlign: 'center',
                    borderRadius: 0,
                    background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
                    border: '2px solid rgba(34, 197, 94, 0.3)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <Box sx={{ mb: 3 }}>
                      <Check sx={{ fontSize: 80, color: '#22c55e', opacity: 0.8 }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      No pending requests
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3, maxWidth: '400px', mx: 'auto' }}>
                      You're all caught up! New connection requests will appear here when they arrive.
                    </Typography>
                  </Paper>
                </div>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {getFilteredData().map((request) => (
                    <ConnectionCard
                      key={request._id}
                      user={request.requester}
                      isRequest={true}
                      requestId={request._id}
                    />
                  ))}
                </Box>
              )}
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              {getFilteredData().length === 0 ? (
                <div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Paper sx={{ 
                    p: { xs: 3, sm: 4, md: 6 }, 
                    textAlign: 'center',
                    borderRadius: 0,
                    background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
                    border: '2px solid rgba(0, 255, 136, 0.3)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <Box sx={{ mb: 3 }}>
                      <Search sx={{ fontSize: 80, color: '#00ff88', opacity: 0.8 }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      No suggestions available
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3, maxWidth: '400px', mx: 'auto' }}>
                      We're working on finding the perfect connections for you. Check back later for personalized suggestions.
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => setActiveTab(3)}
                      sx={{
                        borderRadius: 0,
                        px: 4,
                        py: 1.5,
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        letterSpacing: '0.5px',
                        background: 'linear-gradient(135deg, #00ff88 0%, #22c55e 100%)',
                        color: '#000000',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                          transform: 'scale(1.05)',
                          boxShadow: '0 8px 24px rgba(0, 255, 136, 0.4)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Discover People
                    </Button>
                  </Paper>
                </div>
              ) : (
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  {getFilteredData().map((suggestion) => (
                    <Grid item xs={12} sm={6} lg={4} xl={3} key={suggestion._id}>
                      <ConnectionCard
                        user={suggestion}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {activeTab === 3 && (
            <Box>
              {getFilteredData().length === 0 ? (
                <div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Paper sx={{ 
                    p: { xs: 3, sm: 4, md: 6 }, 
                    textAlign: 'center',
                    borderRadius: 0,
                    background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
                    border: '2px solid rgba(245, 158, 11, 0.3)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <Box sx={{ mb: 3 }}>
                      <PersonAdd sx={{ fontSize: 80, color: '#f59e0b', opacity: 0.8 }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      No users found
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3, maxWidth: '400px', mx: 'auto' }}>
                      Try adjusting your search criteria or check back later as our community grows.
                    </Typography>
                  </Paper>
                </div>
              ) : (
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  {getFilteredData().map((user) => (
                    <Grid item xs={12} sm={6} lg={4} xl={3} key={user._id}>
                      <ConnectionCard
                        user={user}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
        </Box>
      )}
      </Container>
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleNotificationClose}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Connections;
