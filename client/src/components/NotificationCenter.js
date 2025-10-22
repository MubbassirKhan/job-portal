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
  PersonAdd,
  Message,
  ThumbUp,
  Comment,
  Share,
  Work,
  MarkAsUnread
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { socialAPI } from '../utils/socialAPI';
import { useSocketEvent } from '../hooks/useSocket';

const NotificationCenter = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const open = Boolean(anchorEl);

  // Load notifications when menu opens
  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open]);

  // Socket event for real-time notifications
  useSocketEvent('notification:new', (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  });

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
          color: 'text.primary',
          '&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.1)' }
        }}
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
          {unreadCount > 0 ? <Notifications /> : <NotificationsNone />}
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 600,
            borderRadius: 2,
            boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.25)',
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Button
                size="small"
                onClick={handleMarkAllAsRead}
                sx={{ textTransform: 'none' }}
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
                      sx={{
                        py: 2,
                        backgroundColor: notification.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.05)',
                        borderLeft: notification.isRead ? 'none' : '3px solid #6366f1',
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
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: notification.isRead ? 400 : 600 }}>
                            {getNotificationText(notification)}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
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
                          </Box>
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