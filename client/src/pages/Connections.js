import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Visibility
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { socialAPI } from '../utils/socialAPI';

const Connections = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [connections, setConnections] = useState([]);
  const [requests, setRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  // Load data based on active tab
  useEffect(() => {
    loadTabData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadTabData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 0: // My Connections
          const connectionsResponse = await socialAPI.getConnections();
          setConnections(connectionsResponse.data);
          break;
        case 1: // Pending Requests
          const requestsResponse = await socialAPI.getConnectionRequests();
          setRequests(requestsResponse.data);
          break;
        case 2: // Suggestions
          const suggestionsResponse = await socialAPI.getConnectionSuggestions();
          setSuggestions(suggestionsResponse.data);
          break;
        default:
          break;
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle connection actions
  const handleSendRequest = async (userId) => {
    try {
      await socialAPI.sendConnectionRequest(userId);
      setSuggestions(prev => prev.filter(user => user._id !== userId));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await socialAPI.acceptConnectionRequest(requestId);
      setRequests(prev => prev.filter(req => req._id !== requestId));
      // Refresh connections if on that tab
      if (activeTab === 0) {
        loadTabData();
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      await socialAPI.declineConnectionRequest(requestId);
      setRequests(prev => prev.filter(req => req._id !== requestId));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRemoveConnection = async (connectionId) => {
    try {
      await socialAPI.removeConnection(connectionId);
      setConnections(prev => prev.filter(conn => conn._id !== connectionId));
    } catch (error) {
      setError(error.message);
    }
  };

  // Filter data based on search
  const getFilteredData = () => {
    const currentData = activeTab === 0 ? connections : 
                       activeTab === 1 ? requests : suggestions;
    
    if (!searchQuery) return currentData;
    
    return currentData.filter(item => {
      const user = activeTab === 1 ? item.requester : item;
      const fullName = `${user.profile.firstName} ${user.profile.lastName}`.toLowerCase();
      const company = user.profile.company?.toLowerCase() || '';
      const headline = user.profile.headline?.toLowerCase() || '';
      
      return fullName.includes(searchQuery.toLowerCase()) ||
             company.includes(searchQuery.toLowerCase()) ||
             headline.includes(searchQuery.toLowerCase());
    });
  };

  const openProfileDialog = (user) => {
    setSelectedProfile(user);
    setProfileDialogOpen(true);
  };

  const ConnectionCard = ({ user, isRequest = false, requestId = null, showActions = true }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Avatar
              src={user.profile.profileImage}
              sx={{ width: 60, height: 60 }}
            >
              {user.profile.firstName.charAt(0)}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {user.profile.firstName} {user.profile.lastName}
              </Typography>
              
              {user.profile.headline && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {user.profile.headline}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                {user.profile.company && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <BusinessCenter fontSize="small" color="disabled" />
                    <Typography variant="caption" color="text.secondary">
                      {user.profile.company}
                    </Typography>
                  </Box>
                )}
                
                {user.profile.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOn fontSize="small" color="disabled" />
                    <Typography variant="caption" color="text.secondary">
                      {user.profile.location}
                    </Typography>
                  </Box>
                )}
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip 
                  label={user.role} 
                  size="small" 
                  color={user.role === 'recruiter' ? 'primary' : 'secondary'}
                />
                {user.connectionCount && (
                  <Chip 
                    label={`${user.connectionCount} connections`} 
                    size="small" 
                    variant="outlined"
                  />
                )}
              </Box>
              
              {showActions && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {isRequest ? (
                    <>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<Check />}
                        onClick={() => handleAcceptRequest(requestId)}
                        sx={{ textTransform: 'none' }}
                      >
                        Accept
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Close />}
                        onClick={() => handleDeclineRequest(requestId)}
                        sx={{ textTransform: 'none' }}
                      >
                        Decline
                      </Button>
                    </>
                  ) : activeTab === 0 ? (
                    <>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={() => openProfileDialog(user)}
                        sx={{ textTransform: 'none' }}
                      >
                        View Profile
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<PersonRemove />}
                        onClick={() => handleRemoveConnection(user._id)}
                        sx={{ textTransform: 'none' }}
                      >
                        Remove
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<PersonAdd />}
                      onClick={() => handleSendRequest(user._id)}
                      sx={{ textTransform: 'none' }}
                    >
                      Connect
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
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          My Network
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your professional connections
        </Typography>
      </Box>

      {/* Search Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search connections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ borderRadius: 2 }}
          />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab label={`Connections (${connections.length})`} />
          <Tab label={`Requests (${requests.length})`} />
          <Tab label={`Suggestions (${suggestions.length})`} />
        </Tabs>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Content */}
      {!loading && (
        <Box>
          {activeTab === 0 && (
            <Box>
              {getFilteredData().length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary">
                    No connections found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Start building your network by connecting with professionals
                  </Typography>
                </Paper>
              ) : (
                getFilteredData().map((connection) => (
                  <ConnectionCard
                    key={connection._id}
                    user={connection}
                  />
                ))
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              {getFilteredData().length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary">
                    No pending requests
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    You'll see connection requests here
                  </Typography>
                </Paper>
              ) : (
                getFilteredData().map((request) => (
                  <ConnectionCard
                    key={request._id}
                    user={request.requester}
                    isRequest={true}
                    requestId={request._id}
                  />
                ))
              )}
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              {getFilteredData().length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary">
                    No suggestions available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Check back later for new connection suggestions
                  </Typography>
                </Paper>
              ) : (
                <Grid container spacing={2}>
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
        </Box>
      )}

      {/* Profile Dialog */}
      <Dialog
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedProfile && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={selectedProfile.profile.profileImage}
                  sx={{ width: 50, height: 50 }}
                >
                  {selectedProfile.profile.firstName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {selectedProfile.profile.firstName} {selectedProfile.profile.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedProfile.profile.headline || selectedProfile.role}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ space: 2 }}>
                {selectedProfile.profile.company && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <BusinessCenter color="disabled" />
                    <Typography>{selectedProfile.profile.company}</Typography>
                  </Box>
                )}
                
                {selectedProfile.profile.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <LocationOn color="disabled" />
                    <Typography>{selectedProfile.profile.location}</Typography>
                  </Box>
                )}
                
                {selectedProfile.profile.education && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <School color="disabled" />
                    <Typography>{selectedProfile.profile.education}</Typography>
                  </Box>
                )}

                {selectedProfile.profile.bio && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      About
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedProfile.profile.bio}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Network
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedProfile.connectionCount || 0} connections
                  </Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setProfileDialogOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default Connections;