import React, { useState, useEffect, useRef } from 'react';
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
  Divider,
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

const Messages = () => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const { socket } = useSocket();

  // Use chat hook for real-time functionality
  const { sendMessage, joinChat, leaveChat } = useChat();

  // Load user chats
  useEffect(() => {
    loadChats();
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (activeChat && message.chat === activeChat._id) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
      
      // Update last message in chat list
      setChats(prev => prev.map(chat => 
        chat._id === message.chat 
          ? { ...chat, lastMessage: message, updatedAt: new Date() }
          : chat
      ));
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
      setChats(prev => prev.map(chat => {
        const otherUser = chat.participants.find(p => p._id !== userId);
        if (otherUser && otherUser._id === userId) {
          return { ...chat, participants: chat.participants.map(p => 
            p._id === userId ? { ...p, isOnline: true } : p
          )};
        }
        return chat;
      }));
    };

    const handleUserOffline = (userId) => {
      setChats(prev => prev.map(chat => {
        const otherUser = chat.participants.find(p => p._id !== userId);
        if (otherUser && otherUser._id === userId) {
          return { ...chat, participants: chat.participants.map(p => 
            p._id === userId ? { ...p, isOnline: false } : p
          )};
        }
        return chat;
      }));
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
  }, [socket, activeChat]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChat]);

  // Auto scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const response = await socialAPI.getChats();
      setChats(response.data);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatId) => {
    try {
      const response = await socialAPI.getChatMessages(chatId);
      setMessages(response.data);
      
      // Mark messages as read
      await socialAPI.markMessagesAsRead(chatId);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || sending) return;

    setSending(true);
    try {
      const message = await sendMessage(activeChat._id, newMessage.trim());
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Update chat list
      setChats(prev => prev.map(chat => 
        chat._id === activeChat._id 
          ? { ...chat, lastMessage: message, updatedAt: new Date() }
          : chat
      ));
    } catch (error) {
      console.error('Error sending message:', error);
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
    const currentUserId = localStorage.getItem('userId');
    return chat.participants.find(p => p._id !== currentUserId);
  };

  const getFilteredChats = () => {
    if (!searchQuery) return chats;
    
    return chats.filter(chat => {
      const otherUser = getOtherUser(chat);
      const fullName = `${otherUser.profile.firstName} ${otherUser.profile.lastName}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase());
    });
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
    <Container maxWidth="xl" sx={{ py: 4, height: 'calc(100vh - 100px)' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Messages
      </Typography>

      <Grid container spacing={2} sx={{ height: '100%' }}>
        {/* Chat List */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ pb: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
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
              ) : getFilteredChats().length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    No conversations yet
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {getFilteredChats().map((chat, index) => {
                    const otherUser = getOtherUser(chat);
                    const isActive = activeChat?._id === chat._id;
                    
                    return (
                      <React.Fragment key={chat._id}>
                        <ListItem
                          button
                          selected={isActive}
                          onClick={() => setActiveChat(chat)}
                          sx={{
                            py: 2,
                            px: 2,
                            '&.Mui-selected': {
                              backgroundColor: 'rgba(99, 102, 241, 0.1)',
                              '&:hover': {
                                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                              }
                            }
                          }}
                        >
                          <ListItemAvatar>
                            <Badge
                              variant="dot"
                              color="success"
                              invisible={!otherUser.isOnline}
                              anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                              }}
                            >
                              <Avatar src={otherUser.profile.profileImage}>
                                {otherUser.profile.firstName.charAt(0)}
                              </Avatar>
                            </Badge>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {otherUser.profile.firstName} {otherUser.profile.lastName}
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '200px'
                                  }}
                                >
                                  {chat.lastMessage?.content || 'No messages yet'}
                                </Typography>
                                {chat.lastMessage && (
                                  <Typography variant="caption" color="text.secondary">
                                    {formatTime(chat.lastMessage.createdAt)}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                          {chat.unreadCount > 0 && (
                            <Badge
                              badgeContent={chat.unreadCount}
                              color="primary"
                              sx={{ mr: 1 }}
                            />
                          )}
                        </ListItem>
                        {index < getFilteredChats().length - 1 && <Divider />}
                      </React.Fragment>
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
                          const currentUserId = localStorage.getItem('userId');
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
    </Container>
  );
};

export default Messages;