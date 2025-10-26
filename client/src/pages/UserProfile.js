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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          py: 8 
        }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading profile...</Typography>
        </Box>
      </Container>
    );
  }

  if (error || !user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            {error || 'User not found'}
          </Typography>
          <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
            Go Back
          </Button>
        </Paper>
      </Container>
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
              borderColor: 'rgba(255,255,255,0.5)',
              color: 'white',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              '&.Mui-disabled': {
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
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
              borderColor: 'rgba(255,255,255,0.5)',
              color: 'white',
              '&.Mui-disabled': {
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
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
              borderColor: 'white',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderColor: 'white'
              }
            }}
          >
            Connect
          </Button>
        );
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ textTransform: 'none' }}
        >
          Back to Network
        </Button>
      </Box>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Paper sx={{ 
          borderRadius: 4, 
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
          color: 'white',
          mb: 3
        }}>
          <Box sx={{ p: 4, position: 'relative' }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item>
                <Avatar
                  src={user.profile?.profileImage}
                  sx={{ 
                    width: 120, 
                    height: 120,
                    border: '4px solid white',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                  }}
                >
                  <Typography variant="h2" sx={{ fontWeight: 600 }}>
                    {user.profile?.firstName?.charAt(0)}
                  </Typography>
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  {user.profile?.firstName} {user.profile?.lastName}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                  {user.profile?.headline || `${user.role === 'admin' ? 'Recruiter' : user.role.charAt(0).toUpperCase() + user.role.slice(1)} Professional`}
                </Typography>
                {user.profile?.company && user.profile?.location && (
                  <Typography variant="body1" sx={{ opacity: 0.8, mb: 2 }}>
                    {user.profile.company} • {user.profile.location}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    label={user.role === 'admin' ? 'Recruiter' : user.role.charAt(0).toUpperCase() + user.role.slice(1)} 
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 600
                    }} 
                  />
                  {user.connectionCount !== undefined && (
                    <Chip 
                      label={`${user.connectionCount} connections`} 
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontWeight: 600
                      }} 
                    />
                  )}
                  {user.profile?.skills && user.profile.skills.length > 0 && (
                    <Chip 
                      label={`${user.profile.skills.length} skills`} 
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontWeight: 600
                      }} 
                    />
                  )}
                  {userPosts && userPosts.length > 0 && (
                    <Chip 
                      label={`${userPosts.length} posts`} 
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontWeight: 600
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
                        borderColor: 'white',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      Message
                    </Button>
                  )}
                  <IconButton sx={{ color: 'white' }}>
                    <Share />
                  </IconButton>
                  <IconButton sx={{ color: 'white' }}>
                    <MoreVert />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </motion.div>

      <Grid container spacing={3}>
        {/* Left Column - Main Info */}
        <Grid item xs={12} md={8}>
          {/* About Section */}
          {user.profile?.bio && (
            <Card sx={{ mb: 3, borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  About
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {user.profile.bio}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Experience Section */}
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Professional Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <BusinessCenter color="primary" />
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {user.profile?.company || 'Company not specified'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.role === 'recruiter' ? 'Talent Acquisition' : user.role === 'recruiter' ? 'Recruiter' : 'Professional'}
                    </Typography>
                  </Box>
                </Box>
                
                {user.profile?.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LocationOn color="primary" />
                    <Typography variant="body1">{user.profile.location}</Typography>
                  </Box>
                )}
                
                {user.profile?.education && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <School color="primary" />
                    <Typography variant="body1">{user.profile.education}</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Skills Section */}
          {user.profile?.skills && user.profile.skills.length > 0 && (
            <Card sx={{ mb: 3, borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Skills & Expertise
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {user.profile.skills.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      variant="outlined"
                      sx={{ 
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                          color: 'white'
                        }
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Posts Section */}
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Recent Posts {userPosts.length > 0 && `(${userPosts.length})`}
              </Typography>
              
              {postsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : userPosts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No posts shared yet
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {userPosts.slice(0, 5).map((post) => (
                    <Paper 
                      key={post._id} 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          boxShadow: 2
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Avatar 
                          src={user.profile?.profileImage}
                          sx={{ width: 32, height: 32 }}
                        >
                          {user.profile?.firstName?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {user.profile?.firstName} {user.profile?.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
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
                      
                      <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>
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
                                borderRadius: 1,
                                objectFit: 'cover'
                              }}
                            />
                          ))}
                        </Box>
                      )}
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="caption" color="text.secondary">
                          {post.likes?.length || 0} likes
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {post.comments?.length || 0} comments
                        </Typography>
                        <Chip 
                          label={post.postType || 'text'}
                          size="small"
                          variant="outlined"
                          sx={{ ml: 'auto' }}
                        />
                      </Box>
                    </Paper>
                  ))}
                  
                  {userPosts.length > 5 && (
                    <Button 
                      variant="outlined" 
                      sx={{ mt: 2 }}
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
        </Grid>

        {/* Right Column - Contact & Stats */}
        <Grid item xs={12} md={4}>
          {/* Contact Info */}
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Contact Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Email color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
                
                {user.profile?.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Phone color="primary" />
                    <Typography variant="body2" color="text.secondary">
                      {user.profile.phone}
                    </Typography>
                  </Box>
                )}
                
                {user.profile?.website && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Language color="primary" />
                    <Typography variant="body2" color="text.secondary">
                      {user.profile.website}
                    </Typography>
                  </Box>
                )}
                
                {user.profile?.linkedin && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <BusinessCenter color="primary" />
                    <Typography variant="body2" color="text.secondary">
                      LinkedIn Profile
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Profile Stats */}
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Profile Stats
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Member since
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short'
                    })}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Posts shared
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {userPosts.length}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Skills listed
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {user.profile?.skills?.length || 0}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Account type
                  </Typography>
                  <Chip 
                    label={user.role === 'admin' ? 'Recruiter' : user.role}
                    size="small"
                    color={user.role === 'recruiter' || user.role === 'admin' ? 'error' : 'success'}
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Additional Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {user.profile?.dateOfBirth && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Age
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {new Date().getFullYear() - new Date(user.profile.dateOfBirth).getFullYear()} years
                    </Typography>
                  </Box>
                )}
                
                {user.profile?.experience && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Experience
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {user.profile.experience} years
                    </Typography>
                  </Box>
                )}
                
                {user.profile?.expectedSalary && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Expected Salary
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ${user.profile.expectedSalary}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Profile completed
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
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
  );
};

export default UserProfile;