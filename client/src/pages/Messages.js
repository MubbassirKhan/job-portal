import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  TextField,
  IconButton,
  Badge,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import {
  Send,
  Search,
  MoreVert,
  EmojiEmotions,
  ArrowBack
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const shouldAutoScroll = useRef(true);
  const messageInputRef = useRef(null);
  const { socket } = useSocket();

  // Monitor unread counts for debugging
  useEffect(() => {
    if (Object.keys(unreadCounts).length > 0) {
      console.log('📬 Unread counts updated:', unreadCounts);
    }
  }, [unreadCounts]);

  // Use chat hook for real-time functionality
  const { joinChat, leaveChat } = useChat();

  // Define functions with useCallback to avoid dependency issues
  const loadConnections = useCallback(async () => {
    try {
      setLoading(true);
      const response = await socialAPI.getMyConnections();
      
      setConnections(response.data || []); // Load user's connections
      
      // Filter out connections where the user is yourself (temporary debug fix)
      const currentUserId = currentUser?.id; // Get from auth context - user object uses 'id' not '_id'
      const filteredConnections = (response.data || []).filter(connection => {
        const userId = connection.user?._id || connection._id;
        const isNotSelf = userId !== currentUserId;
        return isNotSelf;
      });
      
      setConnections(filteredConnections);
      
      // Load existing unread counts for each connection
      await loadExistingUnreadCounts(filteredConnections);
    } catch (error) {

    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  const loadMessages = useCallback(async (chatId) => {
    try {
      // Disable auto-scroll when initially loading messages
      shouldAutoScroll.current = false;
      
      const response = await socialAPI.getChatMessages(chatId);
      setMessages(response.data || []); // Ensure we have an array
      
      // Mark messages as read
      await socialAPI.markChatAsRead(chatId); // Fixed function name
      
      // Re-enable auto-scroll after a short delay to allow UI to settle
      setTimeout(() => {
        shouldAutoScroll.current = true;
      }, 100);
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
      
      console.log('🔔 New message received:', {
        senderId,
        currentUserId: currentUser?.id,
        isFromCurrentUser,
        activeChat: activeChat?._id,
        messageChatId: message.chat
      });
      
      if (activeChat && message.chat === activeChat._id) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      } else if (!isFromCurrentUser) {
        // If message is not from current user and not in active chat, increment unread count
        console.log('📬 Adding unread message from:', senderId);
        setUnreadCounts(prev => {
          const newCounts = {
            ...prev,
            [senderId]: (prev[senderId] || 0) + 1
          };
          console.log('📊 Updated unread counts:', newCounts);
          return newCounts;
        });
        
        // Update last message time
        setLastMessageTime(prev => {
          const newTime = {
            ...prev,
            [senderId]: new Date().toISOString()
          };
          console.log('⏰ Updated last message times:', newTime);
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
        // Temporarily disable auto-scroll for read status updates
        shouldAutoScroll.current = false;
        setMessages(prev => prev.map(msg => 
          msg._id === data.messageId 
            ? { ...msg, readBy: [...(msg.readBy || []), data.userId] }
            : msg
        ));
        // Re-enable auto-scroll after update
        setTimeout(() => {
          shouldAutoScroll.current = true;
        }, 50);
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

    // Typing indicators
    const handleUserTyping = (data) => {
      if (activeChat && data.chatId === activeChat._id && data.userId !== currentUser?.id) {
        setOtherUserTyping(true);
      }
    };

    const handleUserStoppedTyping = (data) => {
      if (activeChat && data.chatId === activeChat._id && data.userId !== currentUser?.id) {
        setOtherUserTyping(false);
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:read', handleMessageRead);
    socket.on('user:online', handleUserOnline);
    socket.on('user:offline', handleUserOffline);
    socket.on('user:typing', handleUserTyping);
    socket.on('user:stopped_typing', handleUserStoppedTyping);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:read', handleMessageRead);
      socket.off('user:online', handleUserOnline);
      socket.off('user:offline', handleUserOffline);
      socket.off('user:typing', handleUserTyping);
      socket.off('user:stopped_typing', handleUserStoppedTyping);
    };
  }, [socket, activeChat, currentUser?.id]);

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat._id);
      joinChat(activeChat._id);
      
      // Focus the message input after a short delay to ensure it's rendered
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 200);
    }
    
    return () => {
      if (activeChat) {
        leaveChat(activeChat._id);
      }
    };
  }, [activeChat, loadMessages, joinChat, leaveChat]);

  // Auto scroll to bottom only when appropriate
  useEffect(() => {
    if (shouldAutoScroll.current && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showEmojiPicker) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showEmojiPicker]);

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
      
      // Clear unread messages for this user when opening chat
      setUnreadCounts(prev => ({
        ...prev,
        [targetUserId]: 0
      }));
      
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

  // Mark messages as read
  const markAsRead = useCallback((userId) => {
    setUnreadCounts(prev => ({
      ...prev,
      [userId]: 0
    }));
    
    // Optionally send to server to mark as read
    if (socket) {
      socket.emit('messages:mark_read', { userId });
    }
  }, [socket]);

  // Typing indicator handler
  const handleTyping = useCallback(() => {
    if (!activeChat) return;
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set typing to true if not already
    if (!isTyping) {
      setIsTyping(true);
      if (socket) {
        socket.emit('typing', { chatId: activeChat._id, userId: currentUser?.id });
      }
    }
    
    // Set timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (socket) {
        socket.emit('stop_typing', { chatId: activeChat._id, userId: currentUser?.id });
      }
    }, 2000);
  }, [activeChat, isTyping, socket, currentUser]);

  // Load existing unread counts when connections are loaded
  const loadExistingUnreadCounts = useCallback(async (connectionsList) => {
    try {
      
      // For each connection, check if there are existing unread messages
      const unreadPromises = connectionsList.map(async (connection) => {
        const user = connection.user || connection;
        const userId = user._id || user.id;
        
        try {
          // Try to get the chat between current user and this connection
          const chatResponse = await socialAPI.getMessages(connection._id);
          if (chatResponse.data && chatResponse.data.length > 0) {
            // Count unread messages (messages not read by current user)
            const unreadCount = chatResponse.data.filter(msg => 
              msg.sender._id !== currentUser?.id && 
              !msg.readBy?.includes(currentUser?.id)
            ).length;
            
            if (unreadCount > 0) {
              return { userId, unreadCount, lastMessage: chatResponse.data[chatResponse.data.length - 1] };
            }
          }
        } catch (error) {
          // Chat might not exist yet, that's okay
          console.log(`No existing chat with ${user.email || 'unknown email'}`, { 
            connection, 
            user, 
            userId,
            error: error.message
          });
        }
        
        return null;
      });
      
      const results = await Promise.all(unreadPromises);
      
      // Update unread counts and last message times
      const newUnreadCounts = {};
      const newLastMessageTimes = {};
      
      results.forEach(result => {
        if (result) {
          newUnreadCounts[result.userId] = result.unreadCount;
          if (result.lastMessage) {
            newLastMessageTimes[result.userId] = result.lastMessage.createdAt;
          }
        }
      });
      
      if (Object.keys(newUnreadCounts).length > 0) {
        console.log('📊 Setting initial unread counts:', newUnreadCounts);
        setUnreadCounts(prev => ({ ...prev, ...newUnreadCounts }));
      }
      
      if (Object.keys(newLastMessageTimes).length > 0) {
        console.log('⏰ Setting initial last message times:', newLastMessageTimes);
        setLastMessageTime(prev => ({ ...prev, ...newLastMessageTimes }));
      }
      
    } catch (error) {
      console.error('❌ Error loading existing unread counts:', error);
    }
  }, [currentUser?.id]);

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
      
      // Temporarily disable auto-scroll for sent messages
      shouldAutoScroll.current = false;
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Re-enable auto-scroll after a brief delay
      setTimeout(() => {
        shouldAutoScroll.current = true;
      }, 100);
      
      // Stop typing indicator when message is sent
      if (isTyping) {
        setIsTyping(false);
        if (socket) {
          socket.emit('stop_typing', { chatId: activeChat._id, userId: currentUser?.id });
        }
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
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
    <Box
      sx={{ 
        height: '100vh',
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        pt: { xs: 7, sm: 8, md: 10 }, // Better mobile spacing
        position: 'relative'
      }}
    >
      {authLoading || !currentUser ? (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          height="100%"
          flexDirection="column"
          sx={{ 
            background: 'rgba(26, 26, 26, 0.95)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <CircularProgress 
            size={60}
            thickness={4}
            sx={{ 
              color: '#00ff88',
              mb: 2
            }}
          />
          <Typography sx={{ 
            color: '#ffffff',
            fontSize: '1.1rem',
            textAlign: 'center',
            fontWeight: 500
          }}>
            {authLoading ? 'Loading Messages...' : 'Unable to load messages'}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', height: '100%', flexDirection: { xs: 'column', md: 'row' }, position: 'relative' }}>
          {/* Chat List Sidebar */}
          <Box
            sx={{
              width: { xs: '100%', sm: '100%', md: '380px' },
              height: { xs: activeChat ? '0' : 'calc(100vh - 56px)', sm: activeChat ? '0' : 'calc(100vh - 64px)', md: '100%' },
              overflow: { xs: activeChat ? 'hidden' : 'auto', md: 'visible' },
              display: { xs: activeChat ? 'none' : 'flex', md: 'flex' },
              flexDirection: 'column',
              backgroundColor: 'rgba(26, 26, 26, 0.95)',
              borderRight: { md: '1px solid rgba(0, 255, 136, 0.2)' },
              backdropFilter: 'blur(10px)',
              position: { xs: 'absolute', md: 'relative' },
              top: { xs: 0, md: 'auto' },
              left: { xs: 0, md: 'auto' },
              zIndex: { xs: 10, md: 'auto' },
            }}
          >
            {/* Header */}
            <Box
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                minHeight: { xs: '60px', sm: '70px' },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: '#00ff88',
                  fontWeight: 700,
                  fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
                  mb: { xs: 1, sm: 2 },
                }}
              >
                Messages
              </Typography>
              
              {/* Mobile menu icon could go here if needed */}




              {/* Search Bar */}
              <TextField
                fullWidth
                size="small"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  mt: { xs: 0, sm: 0 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: { xs: '20px', sm: '25px' },
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    color: '#ffffff',
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    fontSize: { xs: '0.85rem', sm: '0.9rem' },
                    minHeight: { xs: '40px', sm: '44px' },
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
                    fontSize: { xs: '0.85rem', sm: '0.9rem' },
                    padding: { xs: '8px 12px', sm: '10px 14px' },
                    '&::placeholder': {
                      color: 'rgba(255, 255, 255, 0.5)',
                      opacity: 1
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#00ff88', fontSize: { xs: 16, sm: 18 }, ml: { xs: 0.5, sm: 1 } }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Chat List */}
            <Box 
              sx={{ 
                flex: 1, 
                overflow: 'auto',
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-thumb': { 
                  backgroundColor: 'rgba(0, 255, 136, 0.3)', 
                  borderRadius: '2px' 
                }
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress sx={{ color: '#00ff88' }} />
                </Box>
              ) : connections.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                    No conversations yet
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    Go to <span style={{ color: '#00ff88', fontWeight: 600 }}>Network</span> to connect with people and start messaging!
                  </Typography>
                </Box>
              ) : (
                <motion.div
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1
                      }
                    }
                  }}
                  initial="hidden"
                  animate="show"
                >
                  {connections
                  // Enhanced sorting: unread messages first (by count), then by most recent activity
                  .sort((a, b) => {
                    const userA = a.user || a;
                    const userB = b.user || b;
                    const userIdA = userA._id || userA.id;
                    const userIdB = userB._id || userB.id;
                    
                    const unreadA = unreadCounts[userIdA] || 0;
                    const unreadB = unreadCounts[userIdB] || 0;
                    

                    
                    // Priority 1: Users with unread messages come first (higher unread count = higher priority)
                    if (unreadA > 0 && unreadB === 0) return -1;
                    if (unreadB > 0 && unreadA === 0) return 1;
                    if (unreadA > 0 && unreadB > 0) {
                      // If both have unread, prioritize by count (more unread = higher priority)
                      if (unreadA !== unreadB) return unreadB - unreadA;
                    }
                    
                    // Priority 2: Sort by most recent message time
                    const timeA = lastMessageTime[userIdA] || a.updatedAt || a.createdAt || '1970-01-01';
                    const timeB = lastMessageTime[userIdB] || b.updatedAt || b.createdAt || '1970-01-01';
                    
                    const dateA = new Date(timeA);
                    const dateB = new Date(timeB);
                    
                    // Most recent first
                    return dateB - dateA;
                  })
                  .map((connection, index) => {
                    // Handle different connection data structures
                    const user = connection.user || connection;
                    const profile = user.profile || {};
                    
                    const userId = user._id || user.id;
                    const unreadCount = unreadCounts[userId] || 0;
                    const hasNewMessage = unreadCount > 0;
                    
                    return (
                      <motion.div
                        key={connection._id || user._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Box
                          onClick={() => startConversationWithConnection(connection)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: { xs: 1.5, sm: 2 },
                            cursor: 'pointer',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                            backgroundColor: hasNewMessage 
                              ? 'rgba(0, 255, 136, 0.15)' 
                              : lastMessageTime[userId] 
                                ? 'rgba(0, 255, 136, 0.05)' 
                                : 'transparent',
                            borderLeft: hasNewMessage ? '3px solid #00ff88' : 'none',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            minHeight: { xs: '70px', sm: '80px' },
                            '&:hover': {
                              backgroundColor: 'rgba(0, 255, 136, 0.2)',
                              transform: { xs: 'none', sm: 'translateX(5px)' },
                              boxShadow: hasNewMessage 
                                ? '0 4px 20px rgba(0, 255, 136, 0.3)' 
                                : '0 2px 10px rgba(0, 255, 136, 0.1)',
                            },
                            '&::before': hasNewMessage ? {
                              content: '""',
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: '3px',
                              background: 'linear-gradient(180deg, #00ff88 0%, #22c55e 100%)',
                              animation: 'glow 2s ease-in-out infinite alternate',
                              '@keyframes glow': {
                                '0%': { boxShadow: '0 0 5px #00ff88' },
                                '100%': { boxShadow: '0 0 15px #00ff88' }
                              }
                            } : {}
                          }}
                        >
                          {/* Avatar */}
                          <Badge
                            badgeContent={hasNewMessage ? unreadCount : 0}
                            sx={{
                              '& .MuiBadge-badge': {
                                backgroundColor: '#00ff88',
                                color: '#000000',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                minWidth: '18px',
                                height: '18px',
                                borderRadius: '9px',
                              }
                            }}
                          >
                            <Avatar 
                              src={profile.profileImage}
                              sx={{
                                width: { xs: 44, sm: 50 },
                                height: { xs: 44, sm: 50 },
                                borderRadius: '50%',
                                border: '2px solid rgba(0, 255, 136, 0.3)',
                                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                                color: '#00ff88',
                                fontWeight: 600,
                                fontSize: { xs: '1rem', sm: '1.2rem' },
                              }}
                            >
                              {profile.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                            </Avatar>
                          </Badge>
                          <Box sx={{ 
                            flex: 1, 
                            minWidth: 0, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'center',
                            px: { xs: 1, sm: 1.5 },
                            py: { xs: 0.5, sm: 0 }
                          }}>
                            <Typography
                              variant="subtitle2"
                              sx={{ 
                                fontWeight: hasNewMessage ? 700 : 600, 
                                color: hasNewMessage ? '#00ff88' : '#ffffff',
                                fontSize: { xs: '0.9rem', sm: '1rem' },
                                textTransform: hasNewMessage ? 'uppercase' : 'none',
                                letterSpacing: hasNewMessage ? '0.5px' : 'normal',
                                mb: 0.3,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                lineHeight: 1.2
                              }}
                            >
                              {profile.firstName && profile.lastName 
                                ? `${profile.firstName} ${profile.lastName}`
                                : user.email || 'Unknown User'}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                              <Typography
                                variant="caption"
                                sx={{ 
                                  fontWeight: hasNewMessage ? 600 : 400,
                                  color: hasNewMessage ? '#00ff88' : 'rgba(255, 255, 255, 0.7)',
                                  fontSize: { xs: '0.75rem', sm: '0.8rem' },
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  lineHeight: 1.1,
                                  flex: 1
                                }}
                              >
                                {hasNewMessage 
                                  ? `📩 ${unreadCount} new message${unreadCount > 1 ? 's' : ''}`
                                  : (profile.headline || user.role || 'Click to start conversation')}
                              </Typography>
                              {lastMessageTime[userId] && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontSize: '0.7rem',
                                    color: hasNewMessage ? '#00ff88' : 'rgba(255, 255, 255, 0.5)',
                                    fontWeight: hasNewMessage ? 600 : 400,
                                    ml: 1,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.3px'
                                  }}
                                >
                                  {(() => {
                                    const messageTime = new Date(lastMessageTime[userId]);
                                    const now = new Date();
                                    const diffMinutes = Math.floor((now - messageTime) / (1000 * 60));
                                    
                                    if (diffMinutes < 1) return 'now';
                                    if (diffMinutes < 60) return `${diffMinutes}m`;
                                    
                                    const diffHours = Math.floor(diffMinutes / 60);
                                    if (diffHours < 24) return `${diffHours}h`;
                                    
                                    const diffDays = Math.floor(diffHours / 24);
                                    if (diffDays < 7) return `${diffDays}d`;
                                    
                                    return messageTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                  })()}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          {hasNewMessage && (
                            <Box 
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1,
                                ml: 1
                              }}
                            >
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: 0, // Square dot
                                  backgroundColor: '#ef4444',
                                  animation: 'pulse 2s infinite',
                                  '@keyframes pulse': {
                                    '0%': { opacity: 1 },
                                    '50%': { opacity: 0.5 },
                                    '100%': { opacity: 1 }
                                  }
                                }}
                              />
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent opening chat
                                    markAsRead(userId);
                                  }}
                                  sx={{
                                    width: 20,
                                    height: 20,
                                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                                    color: '#00ff88',
                                    border: '1px solid rgba(0, 255, 136, 0.3)',
                                    borderRadius: 0,
                                    opacity: 0.7,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      backgroundColor: 'rgba(0, 255, 136, 0.2)',
                                      opacity: 1,
                                      borderColor: '#00ff88'
                                    }
                                  }}
                                  title="Mark as read"
                                >
                                  <Box
                                    sx={{
                                      fontSize: '10px',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    ✓
                                  </Box>
                                </IconButton>
                              </motion.div>
                            </Box>
                          )}
                        </Box>
                      </motion.div>
                    );
                    })}
                </motion.div>
              )}
            </Box>
          </Box>

        {/* Chat Messages */}
        <Box
          sx={{
            flex: 1,
            height: '100%',
            display: { xs: activeChat ? 'flex' : 'none', md: 'flex' },
            flexDirection: 'column',
            position: 'relative',
            zIndex: { xs: 5, md: 'auto' }
          }}
        >
          <Card sx={{ 
            height: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)', md: '100%' }, 
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: { xs: 0, md: 0 },
            background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
            border: { xs: 'none', md: '2px solid rgba(0, 255, 136, 0.3)' },
            backdropFilter: 'blur(10px)',
            '&:hover': {
              borderColor: { xs: 'none', md: 'rgba(0, 255, 136, 0.5)' }
            },
            overflow: 'hidden'
          }}>
            {activeChat ? (
              <>
                {/* Chat Header */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent sx={{ 
                    py: { xs: 1, sm: 1.5, md: 2 }, 
                    px: { xs: 1, sm: 1.5, md: 2 },
                    borderBottom: '2px solid rgba(0, 255, 136, 0.3)', 
                    background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(0, 0, 0, 0.3) 100%)',
                    backdropFilter: 'blur(10px)',
                    minHeight: { xs: '60px', sm: '70px', md: '80px' },
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {/* Mobile Back Button */}
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <IconButton
                            onClick={() => setActiveChat(null)}
                            sx={{
                              color: '#00ff88',
                              backgroundColor: 'rgba(0, 255, 136, 0.1)',
                              borderRadius: '8px',
                              mr: { xs: 0.5, sm: 1 },
                              p: { xs: 0.5, sm: 1 },
                              minWidth: { xs: '36px', sm: '40px' },
                              height: { xs: '36px', sm: '40px' },
                              display: { xs: 'flex', md: 'none' },
                              '&:hover': {
                                backgroundColor: 'rgba(0, 255, 136, 0.2)',
                                transform: 'translateX(-2px)'
                              }
                            }}
                          >
                            <ArrowBack sx={{ fontSize: { xs: '18px', sm: '20px' } }} />
                          </IconButton>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Badge
                            variant="dot"
                            color="success"
                            invisible={!getOtherUser(activeChat).isOnline}
                            anchorOrigin={{
                              vertical: 'bottom',
                              horizontal: 'right',
                            }}
                            sx={{
                              '& .MuiBadge-dot': {
                                backgroundColor: '#00ff88',
                                border: '2px solid #000000',
                                width: 12,
                                height: 12
                              }
                            }}
                          >
                            <Avatar 
                              src={getOtherUser(activeChat).profile.profileImage}
                              sx={{
                                width: { xs: 36, sm: 42, md: 48 },
                                height: { xs: 36, sm: 42, md: 48 },
                                border: '2px solid rgba(0, 255, 136, 0.3)',
                                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                                color: '#00ff88',
                                fontWeight: 600,
                                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }
                              }}
                            >
                              {getOtherUser(activeChat).profile.firstName?.charAt(0) || 'U'}
                            </Avatar>
                          </Badge>
                        </motion.div>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 700,
                              color: '#ffffff',
                              fontSize: { xs: '1rem', sm: '1.1rem' },
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}
                          >
                            {getOtherUser(activeChat).profile.firstName} {getOtherUser(activeChat).profile.lastName}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: getOtherUser(activeChat).isOnline ? '#00ff88' : 'rgba(255, 255, 255, 0.3)',
                                animation: getOtherUser(activeChat).isOnline ? 'pulse 2s infinite' : 'none',
                                '@keyframes pulse': {
                                  '0%': { opacity: 1 },
                                  '50%': { opacity: 0.5 },
                                  '100%': { opacity: 1 }
                                }
                              }}
                            />
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: getOtherUser(activeChat).isOnline ? '#00ff88' : 'rgba(255, 255, 255, 0.7)',
                                fontWeight: 600,
                                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                                textTransform: 'uppercase',
                                letterSpacing: '0.3px'
                              }}
                            >
                              {getOtherUser(activeChat).isOnline ? 'Online' : 'Last seen recently'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <IconButton
                            sx={{
                              color: 'rgba(255, 255, 255, 0.7)',
                              borderRadius: 0,
                              '&:hover': {
                                color: '#00ff88',
                                backgroundColor: 'rgba(0, 255, 136, 0.1)'
                              }
                            }}
                          >
                            <MoreVert />
                          </IconButton>
                        </motion.div>
                      </Box>
                    </Box>
                  </CardContent>
                </motion.div>

                {/* Messages Area */}
                <Box sx={{ 
                  flex: 1, 
                  overflow: 'auto', 
                  p: { xs: 1, sm: 1.5, md: 2 },
                  maxHeight: { xs: 'calc(100vh - 200px)', sm: 'calc(100vh - 220px)', md: '70vh' },
                  minHeight: { xs: '200px', sm: '300px', md: '400px' },
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  WebkitOverflowScrolling: 'touch',
                  '&::-webkit-scrollbar': {
                    width: { xs: '3px', sm: '6px' },
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
                }}>
                  {Object.entries(groupMessagesByDate(messages)).map(([date, dayMessages]) => (
                    <Box key={date}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            backgroundColor: 'rgba(0, 255, 136, 0.1)',
                            color: '#00ff88',
                            px: 2,
                            py: 0.5,
                            borderRadius: 0,
                            border: '1px solid rgba(0, 255, 136, 0.3)',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
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
                                  mb: { xs: 1.5, sm: 2 },
                                  px: { xs: 1, sm: 1.5 }
                                }}
                              >
                                <Box
                                  sx={{
                                    maxWidth: { xs: '80%', sm: '65%', md: '60%' },
                                    background: isOwn 
                                      ? 'linear-gradient(135deg, #00ff88 0%, #22c55e 100%)'
                                      : 'linear-gradient(135deg, rgba(42, 42, 42, 0.95) 0%, rgba(32, 32, 32, 0.9) 100%)',
                                    color: isOwn ? '#000000' : '#ffffff',
                                    px: { xs: 2, sm: 2.5 },
                                    py: { xs: 1.2, sm: 1.5 },
                                    borderRadius: isOwn 
                                      ? '18px 18px 4px 18px'  // Rounded with small corner on sent side
                                      : '18px 18px 18px 4px', // Rounded with small corner on received side
                                    border: isOwn 
                                      ? 'none'
                                      : '1px solid rgba(255, 255, 255, 0.1)',
                                    position: 'relative',
                                    backdropFilter: 'blur(15px)',
                                    boxShadow: isOwn 
                                      ? '0 2px 8px rgba(0, 255, 136, 0.25), 0 1px 2px rgba(0, 0, 0, 0.1)'
                                      : '0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(255, 255, 255, 0.1)',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      transform: 'translateY(-1px)',
                                      boxShadow: isOwn 
                                        ? '0 4px 12px rgba(0, 255, 136, 0.35), 0 2px 4px rgba(0, 0, 0, 0.15)'
                                        : '0 4px 12px rgba(0, 0, 0, 0.25), 0 2px 6px rgba(255, 255, 255, 0.15)'
                                    },

                                  }}
                                >
                                  <Typography 
                                    variant="body2"
                                    sx={{
                                      fontSize: { xs: '0.9rem', sm: '0.95rem' },
                                      lineHeight: 1.45,
                                      fontWeight: isOwn ? 500 : 400,
                                      letterSpacing: '0.02em',
                                      wordBreak: 'break-word',
                                      color: isOwn ? '#000000' : '#ffffff'
                                    }}
                                  >
                                    {message.content}
                                  </Typography>
                                  <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    mt: 0.8 
                                  }}>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        opacity: isOwn ? 0.7 : 0.6,
                                        fontSize: { xs: '0.65rem', sm: '0.7rem' },
                                        fontWeight: 500,
                                        color: isOwn ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.6)',
                                        letterSpacing: '0.02em'
                                      }}
                                    >
                                      {formatTime(message.createdAt)}
                                    </Typography>
                                    {isOwn && (
                                      <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 0.5,
                                        ml: 1
                                      }}>
                                        {/* Read status indicator */}
                                        <Box
                                          sx={{
                                            width: 12,
                                            height: 12,
                                            borderRadius: '50%',
                                            backgroundColor: message.read ? '#000000' : 'rgba(0, 0, 0, 0.3)',
                                            border: '1px solid #000000',
                                            position: 'relative',
                                            '&::after': message.read ? {
                                              content: '"✓"',
                                              position: 'absolute',
                                              top: '50%',
                                              left: '50%',
                                              transform: 'translate(-50%, -50%)',
                                              fontSize: '8px',
                                              color: '#ffffff',
                                              fontWeight: 'bold'
                                            } : {}
                                          }}
                                        />
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            fontSize: '0.65rem',
                                            opacity: 0.8,
                                            fontWeight: 600
                                          }}
                                        >
                                          {message.read ? 'Read' : 'Sent'}
                                        </Typography>
                                      </Box>
                                    )}
                                  </Box>
                                </Box>
                              </Box>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </Box>
                  ))}
                  {/* Typing Indicator */}
                  <AnimatePresence>
                    {otherUserTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'flex-start',
                            mb: 1
                          }}
                        >
                          <Box
                            sx={{
                              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                              px: 2,
                              py: 1.5,
                              borderRadius: 0,
                              border: '1px solid rgba(0, 255, 136, 0.3)',
                              backdropFilter: 'blur(10px)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'rgba(255, 255, 255, 0.8)',
                                fontSize: '0.85rem',
                                fontStyle: 'italic'
                              }}
                            >
                              typing
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              {[0, 1, 2].map((dot) => (
                                <motion.div
                                  key={dot}
                                  animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.5, 1, 0.5]
                                  }}
                                  transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: dot * 0.2
                                  }}
                                  style={{
                                    width: 4,
                                    height: 4,
                                    borderRadius: '50%',
                                    backgroundColor: '#00ff88'
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        </Box>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </Box>

                {/* Message Input */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Box sx={{ 
                    p: { xs: 1, sm: 1.5, md: 2 }, 
                    borderTop: '2px solid rgba(0, 255, 136, 0.3)', 
                    background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%)',
                    minHeight: { xs: '60px', sm: '80px', md: '100px' },
                    display: 'flex',
                    alignItems: 'center',
                    backdropFilter: 'blur(10px)',
                    position: { xs: 'sticky', md: 'static' },
                    bottom: { xs: 0, md: 'auto' },
                    zIndex: 10
                  }}>
                  <form onSubmit={handleSendMessage} style={{ width: '100%' }}>
                    <TextField
                      ref={messageInputRef}
                      fullWidth
                      multiline
                      maxRows={4}
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      placeholder="Type a message..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: { xs: '20px', sm: '24px', md: '0px' },
                          backgroundColor: 'rgba(0, 255, 136, 0.1)',
                          color: '#ffffff',
                          border: '1px solid rgba(0, 255, 136, 0.3)',
                          minHeight: { xs: '44px', sm: '48px', md: '56px' },
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
                          fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
                          padding: { xs: '8px 12px', sm: '10px 14px', md: '12px 16px' },
                          '&::placeholder': {
                            color: 'rgba(255, 255, 255, 0.6)',
                            opacity: 1
                          }
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Box sx={{ position: 'relative' }}>
                              <IconButton 
                                size="small"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                sx={{ 
                                  color: showEmojiPicker ? '#00ff88' : 'rgba(255, 255, 255, 0.7)',
                                  borderRadius: 0,
                                  backgroundColor: showEmojiPicker ? 'rgba(0, 255, 136, 0.2)' : 'transparent',
                                  '&:hover': { 
                                    color: '#00ff88',
                                    backgroundColor: 'rgba(0, 255, 136, 0.15)',
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.3s ease'
                                }}
                              >
                                <EmojiEmotions />
                              </IconButton>
                              {showEmojiPicker && (
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    bottom: '100%',
                                    left: { xs: '-50px', sm: '0' },
                                    mb: 1,
                                    p: { xs: 1.5, sm: 2 },
                                    background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(0, 0, 0, 0.95) 100%)',
                                    border: '2px solid rgba(0, 255, 136, 0.3)',
                                    borderRadius: { xs: '12px', md: '0px' },
                                    backdropFilter: 'blur(10px)',
                                    display: 'grid',
                                    gridTemplateColumns: { xs: 'repeat(6, 1fr)', sm: 'repeat(8, 1fr)', md: 'repeat(10, 1fr)' },
                                    gap: { xs: 0.3, sm: 0.5 },
                                    minWidth: { xs: '200px', sm: '280px', md: '350px' },
                                    maxWidth: { xs: '250px', sm: '320px', md: '400px' },
                                    maxHeight: { xs: '200px', sm: '250px', md: '300px' },
                                    overflowY: 'auto',
                                    '&::-webkit-scrollbar': {
                                      width: '4px',
                                    },
                                    '&::-webkit-scrollbar-track': {
                                      background: 'rgba(0, 0, 0, 0.2)',
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                      background: 'rgba(0, 255, 136, 0.5)',
                                      borderRadius: '2px',
                                    },
                                    zIndex: 1000,
                                    boxShadow: '0 8px 24px rgba(0, 255, 136, 0.2)'
                                  }}
                                >
                                  {[
                                    '😀', '😃', '😄', '😁', '�', '😇', '�', '🙃', '😉', '😌',
                                    '�😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
                                    '🤪', '🤨', '🧐', '🤓', '😎', '�', '🥳', '😏', '😒', '😞',
                                    '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺',
                                    '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶',
                                    '😱', '😨', '😰', '😥', '😓', '🤗', '�🤔', '🤭', '🤫', '🤐',
                                    '😴', '😪', '😵', '🤤', '😷', '🤒', '🤕', '🤢', '🤮', '🤧',
                                    '🥴', '😈', '�', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️',
                                    '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽',
                                    '🙀', '😿', '😾', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏',
                                    '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇',
                                    '☝️', '�👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐',
                                    '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '❤️', '🧡', '💛',
                                    '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞',
                                    '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️',
                                    '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉',
                                    '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓',
                                    '🔥', '💯', '�', '⭐', '🌟', '✨', '⚡', '☄️', '�', '🔸',
                                    '�', '�', '🔷', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈',
                                    '🥉', '🏅', '🎖️', '🏵️', '🎗️', '🎫', '🎟️', '🎪', '🎭', '🎨'
                                  ].map((emoji, index) => (
                                    <IconButton
                                      key={`emoji-${index}-${emoji}`}
                                      size="small"
                                      onClick={() => {
                                        setNewMessage(prev => prev + emoji);
                                        setShowEmojiPicker(false);
                                      }}
                                      sx={{
                                        fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.4rem' },
                                        borderRadius: { xs: '4px', md: '0px' },
                                        minWidth: { xs: '24px', sm: '28px', md: '32px' },
                                        height: { xs: '24px', sm: '28px', md: '32px' },
                                        p: 0,
                                        fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Emoji", sans-serif',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        '&:hover': {
                                          backgroundColor: 'rgba(0, 255, 136, 0.2)',
                                          transform: 'scale(1.15)',
                                          boxShadow: '0 2px 8px rgba(0, 255, 136, 0.3)'
                                        },
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      {emoji}
                                    </IconButton>
                                  ))}
                                </Box>
                              )}
                            </Box>
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              type="submit"
                              disabled={!newMessage.trim() || sending}
                              sx={{
                                color: !newMessage.trim() || sending ? 'rgba(255, 255, 255, 0.3)' : '#00ff88',
                                backgroundColor: !newMessage.trim() || sending ? 'transparent' : 'rgba(0, 255, 136, 0.1)',
                                borderRadius: 0,
                                '&:hover': {
                                  backgroundColor: !newMessage.trim() || sending ? 'transparent' : 'rgba(0, 255, 136, 0.2)',
                                  color: !newMessage.trim() || sending ? 'rgba(255, 255, 255, 0.3)' : '#00ff88'
                                },
                                '&:disabled': {
                                  color: 'rgba(255, 255, 255, 0.3)'
                                }
                              }}
                            >
                              {sending ? (
                                <CircularProgress 
                                  size={20} 
                                  sx={{ color: '#00ff88' }}
                                />
                              ) : (
                                <Send />
                              )}
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
                </motion.div>
              </>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  textAlign: 'center',
                  flexDirection: 'column',
                  p: { xs: 2, sm: 4 }
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Box sx={{ mb: 3 }}>
                    <Typography 
                      sx={{ 
                        fontSize: { xs: '3rem', sm: '4rem' },
                        opacity: 0.8,
                        background: 'linear-gradient(135deg, #00ff88 0%, #22c55e 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}
                    >
                      💬
                    </Typography>
                  </Box>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      mb: 2,
                      color: '#ffffff',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontSize: { xs: '1.2rem', sm: '1.5rem' }
                    }}
                  >
                    Select a <span style={{ color: '#00ff88' }}>Conversation</span>
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      maxWidth: { xs: '280px', sm: '300px' },
                      mx: 'auto',
                      lineHeight: 1.5,
                      fontSize: { xs: '0.85rem', sm: '1rem' },
                      textAlign: 'center',
                      display: { xs: 'none', md: 'block' }
                    }}
                  >
                    Choose a conversation from the left to start messaging and build your professional network
                  </Typography>
                  
                  {/* Mobile-specific message */}
                  <Typography 
                    variant="body1" 
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      maxWidth: '280px',
                      mx: 'auto',
                      lineHeight: 1.5,
                      fontSize: '0.85rem',
                      textAlign: 'center',
                      display: { xs: 'block', md: 'none' }
                    }}
                  >
                    Select a contact from your chat list to start messaging
                  </Typography>
                  <Box
                    sx={{
                      mt: 3,
                      width: '60px',
                      height: '3px',
                      background: 'linear-gradient(90deg, #00ff88 0%, #22c55e 100%)',
                      mx: 'auto',
                      borderRadius: 0
                    }}
                  />
                </motion.div>
              </Box>
            )}
          </Card>
        </Box>
        </Box>
      )}
    </Box>
  );
};

export default Messages;