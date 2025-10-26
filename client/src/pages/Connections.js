import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  TextField,
  Tabs,
  Tab,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  InputAdornment
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
import { motion } from 'framer-motion';
import { socialAPI } from '../utils/socialAPI';

const Connections = () => {
  const navigate = useNavigate();
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

  // Load data based on active tab
  useEffect(() => {
    loadTabData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadTabData = async () => {
    console.log('🔄 Loading tab data for tab:', activeTab);
    setLoading(true);
    setError('');
    
    try {
      // Always load sent requests to update button states
      const sentRequestsResponse = await socialAPI.getSentRequests();
      const sentUserIds = sentRequestsResponse.data.map(req => req.recipient._id);
      setSentRequests(new Set(sentUserIds));
      
      switch (activeTab) {
        case 0: // My Connections
          console.log('📋 Loading connections...');
          const connectionsResponse = await socialAPI.getMyConnections();
          console.log('✅ Connections response:', connectionsResponse);
          setConnections(connectionsResponse.data || []);
          break;
        case 1: // Pending Requests
          console.log('📧 Loading pending requests...');
          const requestsResponse = await socialAPI.getPendingRequests();
          console.log('✅ Requests response:', requestsResponse);
          setRequests(requestsResponse.data?.received || []);
          break;
        case 2: // Suggestions
          console.log('💡 Loading connection suggestions...');
          const suggestionsResponse = await socialAPI.getConnectionSuggestions();
          console.log('✅ Suggestions response:', suggestionsResponse);
          setSuggestions(suggestionsResponse.data || []);
          break;
        case 3: // All Users
          console.log('👥 Loading all users...');
          const usersResponse = await socialAPI.getAllUsers();
          console.log('✅ All users response:', usersResponse);
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
      console.log('📤 Sending connection request to:', userId);
      await socialAPI.sendConnectionRequest(userId);
      console.log('✅ Connection request sent successfully');
      
      // Add to sent requests set
      setSentRequests(prev => new Set([...prev, userId]));
      
      // Remove from suggestions and all users lists
      setSuggestions(prev => prev.filter(user => user._id !== userId));
      setAllUsers(prev => prev.filter(user => user._id !== userId));
      
      // Show success message
      toast.success('Connection request sent successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error('❌ Error sending request:', error);
      
      // Show user-friendly error message
      let errorMessage = error.message;
      if (error.message.includes('already exists') || error.message.includes('already connected')) {
        errorMessage = 'You are already connected or have a pending request with this user.';
        // If already connected/pending, also mark as sent
        setSentRequests(prev => new Set([...prev, userId]));
      }
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      console.log('✔️ Accepting connection request:', requestId);
      await socialAPI.acceptConnectionRequest(requestId);
      console.log('✅ Connection request accepted');
      setRequests(prev => prev.filter(req => req._id !== requestId));
      // Refresh connections if on that tab
      if (activeTab === 0) {
        loadTabData();
      }
      
      toast.success('Connection request accepted!', {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error('❌ Error accepting request:', error);
      toast.error(error.message, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      console.log('❌ Declining connection request:', requestId);
      await socialAPI.declineConnectionRequest(requestId);
      console.log('✅ Connection request declined');
      setRequests(prev => prev.filter(req => req._id !== requestId));
      
      toast.success('Connection request declined', {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error('❌ Error declining request:', error);
      toast.error(error.message, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const handleRemoveConnection = async (connectionId) => {
    try {
      console.log('🗑️ Removing connection:', connectionId);
      await socialAPI.removeConnection(connectionId);
      console.log('✅ Connection removed');
      setConnections(prev => prev.filter(conn => conn._id !== connectionId));
      
      toast.success('Connection removed successfully', {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error('❌ Error removing connection:', error);
      toast.error(error.message, {
        position: "top-right",
        autoClose: 5000,
      });
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

  const openUserProfile = (user) => {
    navigate(`/profile/${user._id}`);
  };

  const ConnectionCard = ({ user, isRequest = false, requestId = null, connectionId = null, showActions = true }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        sx={{ 
          mb: 3, 
          borderRadius: 3, 
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid rgba(0,0,0,0.08)',
          '&:hover': {
            borderColor: 'primary.main',
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease'
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
            {/* Profile Image with Status Indicator */}
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={user.profile.profileImage}
                sx={{ 
                  width: 80, 
                  height: 80,
                  border: '3px solid',
                  borderColor: 'primary.main',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {user.profile.firstName.charAt(0)}
                </Typography>
              </Avatar>
              {/* Online status indicator */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 4,
                  right: 4,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  border: '3px solid white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              />
            </Box>
            
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Name and Title */}
              <Box sx={{ mb: 2 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 0.5,
                    background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    cursor: 'pointer',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                  onClick={() => openUserProfile(user)}
                >
                  {user.profile.firstName} {user.profile.lastName}
                </Typography>
                
                {user.profile.headline && (
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'text.secondary', 
                      fontWeight: 500,
                      mb: 1,
                      lineHeight: 1.4
                    }}
                  >
                    {user.profile.headline}
                  </Typography>
                )}
              </Box>
              
              {/* Company and Location Info */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                {user.profile.company && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessCenter 
                      fontSize="small" 
                      sx={{ color: 'primary.main' }}
                    />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.primary',
                        fontWeight: 500
                      }}
                    >
                      {user.profile.company}
                    </Typography>
                  </Box>
                )}
                
                {user.profile.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn 
                      fontSize="small" 
                      sx={{ color: 'secondary.main' }}
                    />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.primary',
                        fontWeight: 500
                      }}
                    >
                      {user.profile.location}
                    </Typography>
                  </Box>
                )}
              </Box>
              
              {/* Tags and Connection Count */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                <Chip 
                  label={user.role === 'admin' ? 'Recruiter' : user.role} 
                  size="small" 
                  sx={{
                    backgroundColor: (user.role === 'recruiter' || user.role === 'admin') ? 'primary.main' : 'secondary.main',
                    color: 'white',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    '&:hover': {
                      backgroundColor: (user.role === 'recruiter' || user.role === 'admin') ? 'primary.dark' : 'secondary.dark',
                    }
                  }}
                />
                {user.connectionCount && (
                  <Chip 
                    label={`${user.connectionCount} connections`} 
                    size="small" 
                    variant="outlined"
                    sx={{
                      borderColor: 'divider',
                      color: 'text.secondary',
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      }
                    }}
                  />
                )}
                {user.profile.skills && user.profile.skills.length > 0 && (
                  <Chip 
                    label={`${user.profile.skills.length} skills`} 
                    size="small" 
                    variant="outlined"
                    sx={{
                      borderColor: 'success.main',
                      color: 'success.main',
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: 'success.light',
                        color: 'success.dark'
                      }
                    }}
                  />
                )}
              </Box>
              
              {/* Action Buttons */}
              {showActions && (
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  {isRequest ? (
                    <>
                      <Button
                        size="medium"
                        variant="contained"
                        startIcon={<Check />}
                        onClick={() => handleAcceptRequest(requestId)}
                        sx={{ 
                          textTransform: 'none',
                          fontWeight: 600,
                          borderRadius: 2,
                          px: 3,
                          py: 1,
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                          }
                        }}
                      >
                        Accept
                      </Button>
                      <Button
                        size="medium"
                        variant="outlined"
                        startIcon={<Close />}
                        onClick={() => handleDeclineRequest(requestId)}
                        sx={{ 
                          textTransform: 'none',
                          fontWeight: 600,
                          borderRadius: 2,
                          px: 3,
                          py: 1,
                          borderWidth: 2,
                          '&:hover': {
                            borderWidth: 2,
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                          }
                        }}
                      >
                        Decline
                      </Button>
                    </>
                  ) : activeTab === 0 ? (
                    <>
                      <Button
                        size="medium"
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={() => openUserProfile(user)}
                        sx={{ 
                          textTransform: 'none',
                          fontWeight: 600,
                          borderRadius: 2,
                          px: 3,
                          py: 1,
                          borderWidth: 2,
                          '&:hover': {
                            borderWidth: 2,
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
                          }
                        }}
                      >
                        View Profile
                      </Button>
                      <Button
                        size="medium"
                        variant="outlined"
                        color="error"
                        startIcon={<PersonRemove />}
                        onClick={() => handleRemoveConnection(connectionId || user._id)}
                        sx={{ 
                          textTransform: 'none',
                          fontWeight: 600,
                          borderRadius: 2,
                          px: 3,
                          py: 1,
                          borderWidth: 2,
                          '&:hover': {
                            borderWidth: 2,
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                          }
                        }}
                      >
                        Remove
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="medium"
                      variant={sentRequests.has(user._id) ? "outlined" : "contained"}
                      startIcon={sentRequests.has(user._id) ? <Send /> : <PersonAdd />}
                      onClick={sentRequests.has(user._id) ? undefined : () => handleSendRequest(user._id)}
                      disabled={sentRequests.has(user._id)}
                      sx={{ 
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        background: sentRequests.has(user._id) 
                          ? 'transparent' 
                          : 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                        borderColor: sentRequests.has(user._id) ? 'success.main' : 'transparent',
                        color: sentRequests.has(user._id) ? 'success.main' : 'white',
                        borderWidth: sentRequests.has(user._id) ? 2 : 0,
                        '&:hover': {
                          background: sentRequests.has(user._id) 
                            ? 'success.light' 
                            : 'linear-gradient(135deg, #4338ca 0%, #3730a3 100%)',
                          transform: sentRequests.has(user._id) ? 'none' : 'translateY(-1px)',
                          boxShadow: sentRequests.has(user._id) 
                            ? 'none' 
                            : '0 4px 12px rgba(99, 102, 241, 0.4)',
                          borderWidth: sentRequests.has(user._id) ? 2 : 0,
                          color: sentRequests.has(user._id) ? 'success.dark' : 'white',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: 'transparent',
                          color: 'success.main',
                          borderColor: 'success.main',
                          opacity: 0.8
                        }
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
    </motion.div>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Professional Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
          borderRadius: 4,
          p: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
          }
        }}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800, 
                mb: 1,
                background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              My Professional Network
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 400,
                opacity: 0.9,
                maxWidth: '600px'
              }}
            >
              Build meaningful connections with professionals worldwide. Grow your network and discover new opportunities.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Enhanced Search Bar */}
      <Card sx={{ 
        mb: 4, 
        borderRadius: 3,
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <CardContent sx={{ p: 3 }}>
          <TextField
            fullWidth
            placeholder="Search professionals by name, company, skills, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'primary.main', fontSize: 24 }} />
                </InputAdornment>
              ),
            }}
            sx={{ 
              borderRadius: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: 'rgba(99, 102, 241, 0.04)',
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.08)',
                },
                '&.Mui-focused': {
                  backgroundColor: 'rgba(99, 102, 241, 0.08)',
                }
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Modern Tabs */}
      <Paper sx={{ 
        mb: 4, 
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              py: 2.5,
              '&.Mui-selected': {
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
              }
            },
            '& .MuiTabs-indicator': {
              display: 'none'
            }
          }}
        >
          <Tab 
            label={
              <Typography variant="body1" sx={{ fontWeight: 'inherit' }}>
                My Connections
              </Typography>
            }
          />
          <Tab 
            label={
              <Typography variant="body1" sx={{ fontWeight: 'inherit' }}>
                Requests
              </Typography>
            }
          />
          <Tab 
            label={
              <Typography variant="body1" sx={{ fontWeight: 'inherit' }}>
                Suggestions
              </Typography>
            }
          />
          <Tab 
            label={
              <Typography variant="body1" sx={{ fontWeight: 'inherit' }}>
                Discover
              </Typography>
            }
          />
        </Tabs>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 4,
            borderRadius: 3,
            '& .MuiAlert-message': {
              fontWeight: 500
            }
          }} 
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          py: 8,
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          borderRadius: 4,
          border: '1px solid rgba(0,0,0,0.08)'
        }}>
          <CircularProgress 
            size={60}
            thickness={4}
            sx={{ 
              color: 'primary.main',
              mb: 3
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Loading your network...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we fetch your connections
          </Typography>
        </Box>
      )}

      {/* Content */}
      {!loading && (
        <Box>
          {activeTab === 0 && (
            <Box>
              {getFilteredData().length === 0 ? (
                <Paper sx={{ 
                  p: 6, 
                  textAlign: 'center',
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  border: '1px solid rgba(0,0,0,0.08)'
                }}>
                  <Box sx={{ mb: 3 }}>
                    <PersonAdd sx={{ fontSize: 80, color: 'primary.main', opacity: 0.6 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                    No connections yet
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: '400px', mx: 'auto' }}>
                    Start building your professional network by connecting with colleagues, industry professionals, and potential collaborators.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => setActiveTab(2)}
                    sx={{
                      borderRadius: 3,
                      px: 4,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4338ca 0%, #7c3aed 100%)',
                      }
                    }}
                  >
                    Browse Suggestions
                  </Button>
                </Paper>
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
                <Paper sx={{ 
                  p: 6, 
                  textAlign: 'center',
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  border: '1px solid rgba(245, 158, 11, 0.2)'
                }}>
                  <Box sx={{ mb: 3 }}>
                    <Check sx={{ fontSize: 80, color: 'warning.main', opacity: 0.6 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                    No pending requests
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: '400px', mx: 'auto' }}>
                    You're all caught up! New connection requests will appear here when they arrive.
                  </Typography>
                </Paper>
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
                <Paper sx={{ 
                  p: 6, 
                  textAlign: 'center',
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                  border: '1px solid rgba(34, 197, 94, 0.2)'
                }}>
                  <Box sx={{ mb: 3 }}>
                    <Search sx={{ fontSize: 80, color: 'success.main', opacity: 0.6 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                    No suggestions available
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: '400px', mx: 'auto' }}>
                    We're working on finding the perfect connections for you. Check back later for personalized suggestions.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => setActiveTab(3)}
                    sx={{
                      borderRadius: 3,
                      px: 4,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      }
                    }}
                  >
                    Discover People
                  </Button>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {getFilteredData().map((suggestion) => (
                    <Grid item xs={12} md={6} key={suggestion._id}>
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
                <Paper sx={{ 
                  p: 6, 
                  textAlign: 'center',
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
                  border: '1px solid rgba(245, 158, 11, 0.2)'
                }}>
                  <Box sx={{ mb: 3 }}>
                    <PersonAdd sx={{ fontSize: 80, color: 'warning.main', opacity: 0.6 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                    No users found
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: '400px', mx: 'auto' }}>
                    Try adjusting your search criteria or check back later as our community grows.
                  </Typography>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {getFilteredData().map((user) => (
                    <Grid item xs={12} md={6} key={user._id}>
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
  );
};

export default Connections;