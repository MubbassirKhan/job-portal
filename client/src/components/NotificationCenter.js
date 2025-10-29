import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  Typography,
  Box,
  Avatar,
  Divider,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Notifications,
  NotificationsNone,
  NotificationImportant,
  NotificationsActive,
  PersonAdd,
  Message,
  ThumbUp,
  Comment,
  Share,
  Work,
  MarkAsUnread
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { socialAPI } from '../utils/socialAPI';
import { useSocketEvent } from '../hooks/useSocket';

const NotificationCenter = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  
  // Debug: Log unread count changes
  useEffect(() => {
    console.log('Unread count updated to:', unreadCount);
  }, [unreadCount]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const open = Boolean(anchorEl);

  // Load initial unread count when component mounts and set up periodic refresh
  useEffect(() => {
    loadUnreadCount();
    
    // Refresh unread count every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Load notifications when menu opens
  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open]);

  // Socket event for real-time notifications
  useSocketEvent('notification:new', (notification) => {
    console.log('Received new notification via socket:', notification);
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  });

  // Load only unread count (lightweight call for initial load)
  const loadUnreadCount = async () => {
    try {
      const response = await socialAPI.getUnreadCount();
      const count = response.data?.unreadCount || 0;
      console.log('Loaded unread count response:', response); // Debug log
      console.log('Setting unread count to:', count); // Debug log
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
      // Set to 0 on error to avoid showing stale data
      setUnreadCount(0);
    }
  };

  const loadNotifications = async (pageNum = 1, reset = false) => {
    try {
      setLoading(pageNum === 1);
      const response = await socialAPI.getNotifications(pageNum, 10);
      
      if (reset || pageNum === 1) {
        setNotifications(response.data);
      } else {
        setNotifications(prev => [...prev, ...response.data]);
      }
      
      setUnreadCount(response.unreadCount || 0);
      setHasMore(response.pagination.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await socialAPI.markNotificationAsRead(notificationId);
      setNotifications(prev => prev.map(notif => 
        notif._id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await socialAPI.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'connection_request':
        return <PersonAdd color="primary" />;
      case 'connection_accepted':
        return <PersonAdd color="success" />;
      case 'message':
        return <Message color="info" />;
      case 'post_like':
        return <ThumbUp color="error" />;
      case 'post_comment':
        return <Comment color="warning" />;
      case 'post_share':
        return <Share color="secondary" />;
      case 'job_application':
        return <Work color="primary" />;
      default:
        return <Notifications />;
    }
  };

  const getNotificationText = (notification) => {
    const { type, data, sender } = notification;
    const senderName = sender ? `${sender.profile.firstName} ${sender.profile.lastName}` : 'Someone';
    
    switch (type) {
      case 'connection_request':
        return `${senderName} sent you a connection request`;
      case 'connection_accepted':
        return `${senderName} accepted your connection request`;
      case 'message':
      case 'message_received':
        return `${senderName} sent you a message`;
      case 'post_like':
        return `${senderName} liked your post`;
      case 'post_comment':
        return `${senderName} commented on your post`;
      case 'post_share':
        return `${senderName} shared your post`;
      case 'job_application':
        return `New application for ${data.jobTitle}`;
      default:
        return notification.message || 'New notification';
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark notification as read
    handleMarkAsRead(notification._id);
    
    // Navigate based on notification type and actionUrl
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    } else if (notification.type === 'message' || notification.type === 'message_received') {
      // Navigate to messages page with sender ID
      const senderId = notification.sender?._id;
      if (senderId) {
        navigate(`/messages?user=${senderId}`);
      } else {
        navigate('/messages');
      }
    } else if (notification.type === 'connection_request' || notification.type === 'connection_accepted') {
      navigate('/connections');
    } else if (notification.type === 'job_application') {
      navigate('/admin/applications');
    } else {
      // Default to social feed for posts
      navigate('/social');
    }
    
    // Close the notification menu
    setAnchorEl(null);
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString();
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ 
          color: '#ffffff',
          borderRadius: 0,
          border: '2px solid rgba(0, 255, 136, 0.4)',
          background: 'rgba(0, 255, 136, 0.1)',
          width: { xs: 42, sm: 48 },
          height: { xs: 42, sm: 48 },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': { 
            backgroundColor: 'rgba(0, 255, 136, 0.2)',
            color: '#00ff88',
            border: '2px solid rgba(0, 255, 136, 0.7)',
            transform: 'scale(1.05)',
            boxShadow: '0 4px 15px rgba(0, 255, 136, 0.3)'
          }
        }}
      >
        <Badge 
          badgeContent={unreadCount > 0 ? unreadCount : null} 
          color="error" 
          max={99}
          sx={{
            '& .MuiBadge-badge': {
              right: -2,
              top: 2,
              backgroundColor: '#ff4444',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.7rem',
              minWidth: '18px',
              height: '18px',
              borderRadius: '9px',
              border: '2px solid #000000',
              animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(255, 68, 68, 0.7)' },
                '70%': { transform: 'scale(1)', boxShadow: '0 0 0 10px rgba(255, 68, 68, 0)' },
                '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(255, 68, 68, 0)' }
              }
            }
          }}
        >
          {unreadCount > 0 ? 
            <NotificationsActive sx={{ 
              fontSize: { xs: '20px', sm: '24px' },
              color: '#00ff88',
              filter: 'drop-shadow(0 0 4px rgba(0, 255, 136, 0.5))'
            }} /> : 
            <NotificationsNone sx={{ 
              fontSize: { xs: '20px', sm: '24px' },
              color: 'rgba(255, 255, 255, 0.7)'
            }} />
          }
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: { xs: 350, sm: 400 },
            maxHeight: 600,
            borderRadius: 0,
            background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
            border: '2px solid rgba(0, 255, 136, 0.4)',
            boxShadow: '0 20px 35px rgba(0, 255, 136, 0.3)',
            backdropFilter: 'blur(10px)',
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Header */}
        <Box sx={{ 
          p: 2, 
          borderBottom: '2px solid rgba(0, 255, 136, 0.3)',
          background: 'rgba(0, 255, 136, 0.05)' 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 700,
              color: '#00ff88',
              fontSize: '1.1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Button
                size="small"
                onClick={handleMarkAllAsRead}
                sx={{ 
                  textTransform: 'none',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: 0,
                  border: '1px solid rgba(0, 255, 136, 0.3)',
                  background: 'rgba(0, 255, 136, 0.1)',
                  px: 2,
                  py: 0.5,
                  '&:hover': {
                    background: 'rgba(0, 255, 136, 0.2)',
                    color: '#00ff88',
                    border: '1px solid rgba(0, 255, 136, 0.6)'
                  }
                }}
              >
                Mark all as read
              </Button>
            )}
          </Box>
        </Box>

        {/* Notifications List */}
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {loading && notifications.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <NotificationsNone sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body1" color="text.secondary">
                No notifications yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You'll see updates from your network here
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              <AnimatePresence>
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ListItem
                      onClick={() => handleNotificationClick(notification)}
                      sx={{
                        py: 2,
                        backgroundColor: notification.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.05)',
                        borderLeft: notification.isRead ? 'none' : '3px solid #6366f1',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'rgba(99, 102, 241, 0.1)'
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={notification.sender?.profile?.profileImage}
                          sx={{ width: 40, height: 40 }}
                        >
                          {notification.sender ? 
                            notification.sender.profile.firstName.charAt(0) :
                            getNotificationIcon(notification.type)
                          }
                        </Avatar>
                      </ListItemAvatar>
                      
                      <ListItemText
                        primaryTypographyProps={{ component: 'div' }}
                        secondaryTypographyProps={{ component: 'div' }}
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: notification.isRead ? 400 : 600 }}>
                            {getNotificationText(notification)}
                          </Typography>
                        }
                        secondary={
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <Typography variant="caption" color="text.secondary" component="span">
                              {formatTimeAgo(notification.createdAt)}
                            </Typography>
                            <Chip
                              size="small"
                              label={notification.type.replace('_', ' ')}
                              sx={{ 
                                height: 16, 
                                fontSize: '0.6rem',
                                textTransform: 'capitalize'
                              }}
                            />
                          </span>
                        }
                      />
                      
                      <ListItemSecondaryAction>
                        {!notification.isRead && (
                          <IconButton
                            size="small"
                            onClick={() => handleMarkAsRead(notification._id)}
                            sx={{ ml: 1 }}
                          >
                            <MarkAsUnread fontSize="small" />
                          </IconButton>
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < notifications.length - 1 && <Divider />}
                  </motion.div>
                ))}
              </AnimatePresence>
            </List>
          )}
        </Box>

        {/* Load More */}
        {hasMore && notifications.length > 0 && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => loadNotifications(page + 1)}
              disabled={loading}
              sx={{ textTransform: 'none' }}
            >
              {loading ? <CircularProgress size={16} /> : 'Load More'}
            </Button>
          </Box>
        )}
      </Menu>
    </>
  );
};

export default NotificationCenter;