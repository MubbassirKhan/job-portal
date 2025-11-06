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

const NotificationCenter = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  
  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (anchorEl) {
      loadNotifications();
    }
  }, [anchorEl]);

  // TODO: Re-enable socket events after fixing socket connection
  // useSocketEvent('notification:new', (notification) => {
  //   setNotifications(prev => [notification, ...prev]);
  //   setUnreadCount(prev => prev + 1);
  // });

  const loadUnreadCount = async () => {
    try {
      const response = await socialAPI.getUnreadCount();
      const count = response.data?.unreadCount || 0;
      setUnreadCount(count);
    } catch (error) {
      setUnreadCount(0);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await socialAPI.getNotifications(1, 10);
      setNotifications(response.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const open = Boolean(anchorEl);

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

  const handleNotificationClick = (notification) => {
    handleMarkAsRead(notification._id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    } else if (notification.type === 'message' || notification.type === 'message_received') {
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
      navigate('/social');
    }
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick} sx={{ color: '#ffffff' }}>
        <Badge badgeContent={unreadCount > 0 ? unreadCount : null} color="error">
          {unreadCount > 0 ? <NotificationsActive sx={{ color: '#00ff88' }} /> : <NotificationsNone />}
        </Badge>
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose} PaperProps={{ sx: { width: { xs: 350, sm: 400 } } }}>
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <NotificationsNone sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body1" color="text.secondary">No notifications yet</Typography>
            </Box>
          ) : (
            <List>
              {notifications.map((notification) => (
                <ListItem key={notification._id} onClick={() => handleNotificationClick(notification)} sx={{ cursor: 'pointer' }}>
                  <ListItemAvatar>
                    <Avatar src={notification.sender?.profile?.profileImage} />
                  </ListItemAvatar>
                  <ListItemText primary={notification.message || 'Notification'} secondary={new Date(notification.createdAt).toLocaleString()} />
                  <ListItemSecondaryAction>
                    {!notification.isRead && (
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleMarkAsRead(notification._id);
                        }}
                      >
                        <MarkAsUnread fontSize="small" />
                      </IconButton>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Menu>
    </>
  );
};

export default NotificationCenter;
