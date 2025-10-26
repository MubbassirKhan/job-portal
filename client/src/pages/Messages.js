import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Badge,
  CircularProgress,
  Grid,
  InputAdornment
} from '@mui/material';
import {
  Send,
  Search,
  MoreVert,
  AttachFile,
  EmojiEmotions
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { socialAPI } from '../utils/socialAPI';
import { useSocket, useChat } from '../hooks/useSocket';
import { useAuth } from '../context/AuthContext';

const Messages = () => {
  const { user, loading: authLoading } = useAuth(); // Get current user and loading state from auth context
  
  // Fallback: Get user from localStorage if auth is still loading
  const fallbackUser = React.useMemo(() => {
    if (user) return user;
    
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      return null;
    }
  }, [user]);
  
  const currentUser = user || fallbackUser;
  
  // Debug auth state
  
  const [connections, setConnections] = useState([]); // Add connections state
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({}); // Track unread messages per user
  const [lastMessageTime, setLastMessageTime] = useState({}); // Track last message time per user
  const messagesEndRef = useRef(null);
  const { socket } = useSocket();

  // Use chat hook for real-time functionality
  const { joinChat, leaveChat } = useChat();

  // Define functions with useCallback to avoid dependency issues
  const loadConnections = useCallback(async () => {
    try {
      setLoading(true);
      const response = await socialAPI.getMyConnections();
      
      // Debug each connection
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach((connection, index) => {
        });
      }
      
      setConnections(response.data || []); // Load user's connections
      
      // Filter out connections where the user is yourself (temporary debug fix)
      const currentUserId = currentUser?.id; // Get from auth context - user object uses 'id' not '_id'
      const filteredConnections = (response.data || []).filter(connection => {
        const userId = connection.user?._id || connection._id;
        const isNotSelf = userId !== currentUserId;
        return isNotSelf;
      });
      
      setConnections(filteredConnections);
    } catch (error) {

    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  const loadMessages = useCallback(async (chatId) => {
    try {
      const response = await socialAPI.getChatMessages(chatId);
      setMessages(response.data || []); // Ensure we have an array
      
      // Mark messages as read
      await socialAPI.markChatAsRead(chatId); // Fixed function name
    } catch (error) {

    }
  }, []);

  // Helper function to handle chat selection and clear unread counts
  const handleChatSelect = (chat, userId = null) => {
    setActiveChat(chat);
    
    // Clear unread count for this user
    if (userId) {
      setUnreadCounts(prev => ({
        ...prev,
        [userId]: 0
      }));
    }
    
    // Load messages if chat exists
    if (chat?._id) {
      loadMessages(chat._id);
    }
  };

  // Load user chats and connections
  useEffect(() => {
    // Wait for auth to finish loading and user to be available
    if (authLoading || !currentUser) {
      return;
    }
    
    // loadChats(); // REMOVED: Using connections instead
    loadConnections(); // Also load connections
  }, [authLoading, currentUser, loadConnections]); // Re-run when auth loading state or user changes

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
      });
    }
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      const senderId = message.sender._id || message.sender;
      const isFromCurrentUser = senderId === currentUser?.id;
      
      if (activeChat && message.chat === activeChat._id) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      } else if (!isFromCurrentUser) {
        // If message is not from current user and not in active chat, increment unread count
        setUnreadCounts(prev => {
          const newCounts = {
            ...prev,
            [senderId]: (prev[senderId] || 0) + 1
          };
          return newCounts;
        });
        
        // Update last message time
        setLastMessageTime(prev => {
          const newTime = {
            ...prev,
            [senderId]: new Date().toISOString()
          };
          return newTime;
        });
        
        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          const senderName = message.sender.profile?.firstName 
            ? `${message.sender.profile.firstName} ${message.sender.profile.lastName}`
            : message.sender.email || 'Someone';
          
          new Notification(`💬 New message from ${senderName}`, {
            body: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : ''),
            icon: message.sender.profile?.profileImage || '/favicon.ico',
            tag: `message-${senderId}` // Replace previous notifications from same sender
          });
        }
        
        // Play notification sound (optional)
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmsoAT17z+7Lc'); 
          audio.play().catch(() => {});
        } catch (e) {
          // Ignore audio errors
        }
      }
      
      // Update last message in chat list - REMOVED: Using connections instead
      // setChats(prev => prev.map(chat => 
      //   chat._id === message.chat 
      //     ? { ...chat, lastMessage: message, updatedAt: new Date() }
      //     : chat
      // ));
    };

    const handleMessageRead = (data) => {
      if (activeChat && data.chatId === activeChat._id) {
        setMessages(prev => prev.map(msg => 
          msg._id === data.messageId 
            ? { ...msg, readBy: [...(msg.readBy || []), data.userId] }
            : msg
        ));
      }
    };

    const handleUserOnline = (userId) => {
      // setChats(prev => prev.map(chat => {
      //   const otherUser = chat.participants.find(p => p._id !== userId);
      //   if (otherUser && otherUser._id === userId) {
      //     return { ...chat, participants: chat.participants.map(p => 
      //       p._id === userId ? { ...p, isOnline: true } : p
      //     )};
      //   }
      //   return chat;
      // }));
    };

    const handleUserOffline = (userId) => {
      // setChats(prev => prev.map(chat => {
      //   const otherUser = chat.participants.find(p => p._id !== userId);
      //   if (otherUser && otherUser._id === userId) {
      //     return { ...chat, participants: chat.participants.map(p => 
      //       p._id === userId ? { ...p, isOnline: false } : p
      //     )};
      //   }
      //   return chat;
      // }));
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:read', handleMessageRead);
    socket.on('user:online', handleUserOnline);
    socket.on('user:offline', handleUserOffline);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:read', handleMessageRead);
      socket.off('user:online', handleUserOnline);
      socket.off('user:offline', handleUserOffline);
    };
  }, [socket, activeChat, currentUser?.id]);

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat._id);
      joinChat(activeChat._id);
    }
    
    return () => {
      if (activeChat) {
        leaveChat(activeChat._id);
      }
    };
  }, [activeChat, loadMessages, joinChat, leaveChat]);

  // Auto scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startConversationWithConnection = async (connection) => {
    try {
      // Use the connection's user ID, not the connection ID itself
      const targetUserId = connection.user?._id || connection._id;
      const currentUserId = currentUser?.id; // Get from auth context - user object uses 'id' not '_id'
      
      if (targetUserId === currentUserId) {

        return;
      }
      
      const response = await socialAPI.startConversation(targetUserId);
      const newChat = response.data;
      
      // Add to chats if not already exists - REMOVED: Using connections instead
      // setChats(prev => {
      //   const exists = prev.find(chat => chat._id === newChat._id);
      //   if (!exists) {
      //     return [newChat, ...prev];
      //   }
      //   return prev;
      // });
      
      // Set as active chat and clear unread count
      const chatUserId = connection.user?._id || connection.user?.id;
      handleChatSelect(newChat, chatUserId);
    } catch (error) {

      // Show user-friendly error message
      alert(`Failed to start conversation: ${error.message}`);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || sending) return;

    setSending(true);
    try {
      // Use socialAPI.sendMessage instead of hook
      const response = await socialAPI.sendMessage(activeChat._id, {
        content: newMessage.trim()
      });
      const message = response.data;
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Update chat list - REMOVED: Using connections instead
      // setChats(prev => prev.map(chat => 
      //   chat._id === activeChat._id 
      //     ? { ...chat, lastMessage: message, updatedAt: new Date() }
      //     : chat
      // ));
    } catch (error) {

    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const getOtherUser = (chat) => {
    const currentUserId = currentUser?.id; // Get from auth context - user object uses 'id' not '_id'

    
    const otherUser = chat.participants.find(p => p._id !== currentUserId);

    
    return otherUser;
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = formatDate(message.createdAt);
      if (!groups[date]) groups[date] = [];
      groups[date].push(message);
    });
    return groups;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 2, height: 'calc(100vh - 100px)' }}>
      {authLoading || !currentUser ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>
            {authLoading ? 'Loading user...' : 'User not found'}
          </Typography>
        </Box>
      ) : (
        <>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              mb: 3,
              color: '#1e293b',
              textAlign: 'center'
            }}
          >
            💬 Messages
      </Typography>

      <Grid container spacing={2} sx={{ height: '100%' }}>
        {/* Chat List */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 0, // Square edges for professional look
              border: '1px solid rgba(0,0,0,0.08)'
            }}
          >
            <CardContent sx={{ pb: 1, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0, // Square edges
                    backgroundColor: '#f8fafc'
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#64748b' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </CardContent>

            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : connections.length === 0 ? (
                <Box sx={{ p: 2 }}>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                    No connections yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Go to the <strong>Network</strong> tab to connect with people, then come back here to start messaging!
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {connections
                    // Sort connections: unread messages first, then by last message time
                    .sort((a, b) => {
                      const userA = a.user || a;
                      const userB = b.user || b;
                      const userIdA = userA._id || userA.id;
                      const userIdB = userB._id || userB.id;
                      
                      const unreadA = unreadCounts[userIdA] || 0;
                      const unreadB = unreadCounts[userIdB] || 0;
                      
                      // If one has unread messages and other doesn't, prioritize unread
                      if (unreadA > 0 && unreadB === 0) return -1;
                      if (unreadB > 0 && unreadA === 0) return 1;
                      
                      // If both have unread or both don't have unread, sort by last message time
                      const timeA = lastMessageTime[userIdA] || '1970-01-01';
                      const timeB = lastMessageTime[userIdB] || '1970-01-01';
                      
                      return new Date(timeB) - new Date(timeA); // Most recent first
                    })
                    .map((connection, index) => {
                      // Handle different connection data structures
                      const user = connection.user || connection;
                      const profile = user.profile || {};
                      
                      const userId = user._id || user.id;
                      const unreadCount = unreadCounts[userId] || 0;
                      const hasNewMessage = unreadCount > 0;
                      
                      return (
                        <ListItem
                          key={connection._id || user._id}
                          button
                          onClick={() => startConversationWithConnection(connection)}
                          sx={{
                            py: 1.5,
                            px: 2,
                            borderBottom: '1px solid rgba(0,0,0,0.04)',
                            backgroundColor: hasNewMessage ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                            borderLeft: hasNewMessage ? '3px solid #6366f1' : '3px solid transparent',
                            '&:hover': {
                              backgroundColor: hasNewMessage ? 'rgba(99, 102, 241, 0.1)' : 'rgba(30, 41, 59, 0.05)',
                            }
                          }}
                        >
                          <ListItemAvatar>
                            <Badge
                              badgeContent={unreadCount}
                              color="error"
                              invisible={!hasNewMessage}
                              sx={{
                                '& .MuiBadge-badge': {
                                  fontSize: '0.7rem',
                                  minWidth: '18px',
                                  height: '18px',
                                  borderRadius: 0, // Square badge to match design
                                }
                              }}
                            >
                              <Avatar 
                                src={profile.profileImage}
                                sx={{
                                  borderRadius: 0, // Square avatar for professional look
                                  border: hasNewMessage ? '2px solid #6366f1' : '2px solid #e2e8f0'
                                }}
                              >
                                {profile.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                              </Avatar>
                            </Badge>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              profile.firstName && profile.lastName 
                                ? `${profile.firstName} ${profile.lastName}`
                                : user.email || 'Unknown User'
                            }
                            secondary={
                              hasNewMessage 
                                ? `📨 ${unreadCount} new message${unreadCount > 1 ? 's' : ''}`
                                : (profile.headline || user.role || 'Click to start conversation')
                            }
                            primaryTypographyProps={{
                              variant: 'subtitle2',
                              sx: { 
                                fontWeight: hasNewMessage ? 700 : 600, 
                                color: hasNewMessage ? '#6366f1' : '#1e293b' 
                              }
                            }}
                            secondaryTypographyProps={{
                              variant: 'caption',
                              color: hasNewMessage ? '#6366f1' : 'text.secondary',
                              sx: { fontWeight: hasNewMessage ? 600 : 400 }
                            }}
                          />
                          {hasNewMessage && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: 0, // Square dot
                                backgroundColor: '#ef4444',
                                ml: 1
                              }}
                            />
                          )}
                        </ListItem>
                      );
                    })}
                  </List>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Chat Messages */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {activeChat ? (
              <>
                {/* Chat Header */}
                <CardContent sx={{ py: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Badge
                        variant="dot"
                        color="success"
                        invisible={!getOtherUser(activeChat).isOnline}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right',
                        }}
                      >
                        <Avatar src={getOtherUser(activeChat).profile.profileImage}>
                          {getOtherUser(activeChat).profile.firstName.charAt(0)}
                        </Avatar>
                      </Badge>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {getOtherUser(activeChat).profile.firstName} {getOtherUser(activeChat).profile.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {getOtherUser(activeChat).isOnline ? 'Online' : 'Offline'}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton>
                      <MoreVert />
                    </IconButton>
                  </Box>
                </CardContent>

                {/* Messages Area */}
                <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                  {Object.entries(groupMessagesByDate(messages)).map(([date, dayMessages]) => (
                    <Box key={date}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            backgroundColor: 'grey.100',
                            px: 2,
                            py: 0.5,
                            borderRadius: 2,
                            color: 'text.secondary'
                          }}
                        >
                          {date}
                        </Typography>
                      </Box>
                      
                      <AnimatePresence>
                        {dayMessages.map((message) => {
                          const currentUserId = currentUser?.id; // Get from auth context - user object uses 'id' not '_id'
                          const isOwn = message.sender._id === currentUserId;
                          
                          return (
                            <motion.div
                              key={message._id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: isOwn ? 'flex-end' : 'flex-start',
                                  mb: 1
                                }}
                              >
                                <Box
                                  sx={{
                                    maxWidth: '70%',
                                    backgroundColor: isOwn ? 'primary.main' : 'grey.100',
                                    color: isOwn ? 'white' : 'text.primary',
                                    px: 2,
                                    py: 1,
                                    borderRadius: 2,
                                    borderBottomRightRadius: isOwn ? 0.5 : 2,
                                    borderBottomLeftRadius: isOwn ? 2 : 0.5,
                                  }}
                                >
                                  <Typography variant="body2">
                                    {message.content}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      opacity: 0.8,
                                      display: 'block',
                                      textAlign: 'right',
                                      mt: 0.5
                                    }}
                                  >
                                    {formatTime(message.createdAt)}
                                  </Typography>
                                </Box>
                              </Box>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </Box>
                  ))}
                  <div ref={messagesEndRef} />
                </Box>

                {/* Message Input */}
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                  <form onSubmit={handleSendMessage}>
                    <TextField
                      fullWidth
                      multiline
                      maxRows={4}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <IconButton size="small">
                              <AttachFile />
                            </IconButton>
                            <IconButton size="small">
                              <EmojiEmotions />
                            </IconButton>
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              type="submit"
                              disabled={!newMessage.trim() || sending}
                              color="primary"
                            >
                              {sending ? <CircularProgress size={20} /> : <Send />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                  </form>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  textAlign: 'center'
                }}
              >
                <Box>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    Select a conversation
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Choose a conversation from the left to start messaging
                  </Typography>
                </Box>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
        </>
      )}
    </Container>
  );
};

export default Messages;