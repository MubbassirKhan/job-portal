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
import { useLocation, useNavigate } from 'react-router-dom';

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
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const shouldAutoScroll = useRef(true);
  const messageInputRef = useRef(null);
  const handledParamsRef = useRef(null);
  const readTimeoutRef = useRef(null);
  const { socket } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [conversationsByUserId, setConversationsByUserId] = useState({});
  const [conversationsByChatId, setConversationsByChatId] = useState({});

  const pickOtherParticipant = useCallback((chat) => {
    if (!chat) return null;

    const participantList = Array.isArray(chat.otherParticipants) && chat.otherParticipants.length > 0
      ? chat.otherParticipants
      : chat.participants;

    if (!Array.isArray(participantList)) return null;

    return participantList.find(participant => {
      const participantId = participant?._id || participant?.id || participant;
      return participantId && participantId.toString() !== (currentUser?.id?.toString() || '');
    }) || null;
  }, [currentUser?.id]);

  const appendMessage = useCallback((incomingMessage) => {
    setMessages(prev => {
      if (!incomingMessage) return prev;

      const incomingId = incomingMessage._id || incomingMessage.id;
      if (incomingId && prev.some(msg => (msg._id || msg.id) === incomingId)) {
        return prev;
      }

      if (!incomingId) {
        const senderId = incomingMessage.sender?._id || incomingMessage.sender;
        const duplicate = prev.some(msg => (
          (msg._id || msg.id) === incomingId ||
          ((msg._id == null && incomingId == null) &&
            (msg.sender?._id || msg.sender) === senderId &&
            msg.content === incomingMessage.content &&
            msg.createdAt === incomingMessage.createdAt)
        ));
        if (duplicate) return prev;
      }

      return [...prev, incomingMessage];
    });
  }, []);

  const loadExistingUnreadCounts = useCallback(async () => {
    if (!currentUser?.id) return;

    try {
      const response = await socialAPI.getConversations();
      const conversations = response.data?.data || response.data || [];

      const unreadCountsMap = {};
      const lastMessageTimeMap = {};
      const byUser = {};
      const byChat = {};

      conversations.forEach(conversation => {
        const otherParticipant = pickOtherParticipant(conversation);
        const otherUserId = otherParticipant?._id || otherParticipant?.id;

        if (!otherUserId) {
          return;
        }

        const normalizedChat = {
          ...conversation,
          otherParticipants: conversation.otherParticipants?.length
            ? conversation.otherParticipants
            : otherParticipant
              ? [otherParticipant]
              : conversation.otherParticipants
        };

        unreadCountsMap[otherUserId] = conversation.unreadCount || 0;

        const lastTimestamp = conversation.lastMessage?.createdAt
          || conversation.lastActivity
          || conversation.updatedAt
          || conversation.createdAt;

        if (lastTimestamp) {
          lastMessageTimeMap[otherUserId] = lastTimestamp;
        }

        byUser[otherUserId] = normalizedChat;
        byChat[conversation._id] = normalizedChat;
      });

      setConversationsByUserId(byUser);
      setConversationsByChatId(byChat);
      setUnreadCounts(unreadCountsMap);
      setLastMessageTime(lastMessageTimeMap);
    } catch (error) {
      console.error('❌ Error loading conversations:', error);
    }
  }, [currentUser?.id, pickOtherParticipant]);

  // Monitor unread counts for debugging
  // Use chat hook for real-time functionality
  const { joinChat, leaveChat } = useChat();

  // Define functions with useCallback to avoid dependency issues
  const loadConnections = useCallback(async () => {
    try {
      setLoading(true);
      const response = await socialAPI.getMyConnections();
      const rawConnections = response.data || [];
      
      // Filter out connections where the user is yourself (temporary debug fix)
      const currentUserId = currentUser?.id; // Get from auth context - user object uses 'id' not '_id'
      const filteredConnections = rawConnections.filter(connection => {
        const userId = connection.user?._id || connection._id;
        const isNotSelf = userId !== currentUserId;
        return isNotSelf;
      });
      
      setConnections(filteredConnections);
      
      // Load existing unread counts for each connection
      await loadExistingUnreadCounts();
    } catch (error) {

    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, loadExistingUnreadCounts]);

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
  const handleChatSelect = useCallback(async (chat, userId = null) => {
    setActiveChat(chat);
    
    // Clear unread count for this user
    if (userId) {
      setUnreadCounts(prev => ({
        ...prev,
        [userId]: 0
      }));

      setConversationsByUserId(prev => {
        const existingChat = prev[userId];
        if (!existingChat) return prev;

        return {
          ...prev,
          [userId]: {
            ...existingChat,
            unreadCount: 0
          }
        };
      });

      if (chat?._id) {
        setConversationsByChatId(prev => {
          const existingChat = prev[chat._id];
          if (!existingChat) return prev;

          return {
            ...prev,
            [chat._id]: {
              ...existingChat,
              unreadCount: 0
            }
          };
        });

        // Mark messages as read on server when chat is opened
        if (socket) {
          socket.emit('chat:mark_all_read', { 
            chatId: chat._id,
            userId: currentUser?.id 
          });
          console.log(`✅ Emitted mark as read for chat ${chat._id} when opened via socket`);
        }
      }
    }
    
    // Load messages if chat exists
    if (chat?._id) {
      loadMessages(chat._id);
    }
  }, [loadMessages, socket, currentUser?.id]);

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
      const chatId = message.chatId || message.chat;
      const messageTimestamp = message.createdAt || new Date().toISOString();
      const isActiveChat = Boolean(activeChat && chatId === activeChat._id);
      const targetUserId = isFromCurrentUser
        ? (() => {
            const otherParticipant = pickOtherParticipant(activeChat);
            return otherParticipant?._id || otherParticipant?.id || null;
          })()
        : senderId;

      if (isActiveChat) {
        appendMessage(message);
        scrollToBottom();

        // Auto-mark as read when new message arrives in active chat
        if (socket && !isFromCurrentUser) {
          // Add a small delay to ensure message is rendered and user can see it
          setTimeout(() => {
            socket.emit('chat:mark_all_read', { 
              chatId: activeChat._id,
              userId: currentUser?.id 
            });
            console.log(`📖 Auto-marked new message as read in active chat ${activeChat._id}`);
          }, 100);
        }
      }

      if (targetUserId) {
        setLastMessageTime(prev => ({
          ...prev,
          [targetUserId]: messageTimestamp
        }));
      }

      if (!isFromCurrentUser && !isActiveChat) {
        setUnreadCounts(prev => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1
        }));
      } else if (isActiveChat && targetUserId) {
        setUnreadCounts(prev => ({
          ...prev,
          [targetUserId]: 0
        }));
      }

      if (chatId) {
        setConversationsByChatId(prev => {
          const existingChat = prev[chatId];
          if (!existingChat) return prev;

          const newUnreadCount = !isFromCurrentUser && !isActiveChat
            ? (existingChat.unreadCount || 0) + 1
            : 0;

          const updatedChat = {
            ...existingChat,
            lastMessage: message,
            lastActivity: messageTimestamp,
            unreadCount: newUnreadCount
          };

          return {
            ...prev,
            [chatId]: updatedChat
          };
        });
      }

      if (targetUserId) {
        setConversationsByUserId(prev => {
          const existingChat = prev[targetUserId];
          if (!existingChat) return prev;

          const newUnreadCount = !isFromCurrentUser && !isActiveChat
            ? (existingChat.unreadCount || 0) + 1
            : 0;

          const updatedChat = {
            ...existingChat,
            lastMessage: message,
            lastActivity: messageTimestamp,
            unreadCount: newUnreadCount
          };

          return {
            ...prev,
            [targetUserId]: updatedChat
          };
        });
      }

      if (!isFromCurrentUser && !isActiveChat) {
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
    };

    const handleMessageRead = (data) => {
      if (activeChat && data.chatId === activeChat._id) {
        // Update read status for messages
        setMessages(prev => prev.map(msg => {
          if (!msg.readBy) msg.readBy = [];
          if (!msg.readBy.some(r => r.user === data.userId)) {
            return { 
              ...msg, 
              readBy: [...msg.readBy, { user: data.userId, readAt: new Date() }] 
            };
          }
          return msg;
        }));
      }

      // Update unread counts when messages are read
      if (data.userId && data.chatId) {
        // Find the other participant in this chat
        const chat = conversationsByChatId[data.chatId];
        if (chat) {
          const otherParticipant = pickOtherParticipant(chat);
          const otherUserId = otherParticipant?._id || otherParticipant?.id;
          
          if (otherUserId === data.userId) {
            setUnreadCounts(prev => ({
              ...prev,
              [otherUserId]: 0
            }));

            // Update conversation objects
            setConversationsByUserId(prev => {
              const existingChat = prev[otherUserId];
              if (existingChat) {
                return {
                  ...prev,
                  [otherUserId]: {
                    ...existingChat,
                    unreadCount: 0
                  }
                };
              }
              return prev;
            });

            setConversationsByChatId(prev => {
              const existingChat = prev[data.chatId];
              if (existingChat) {
                return {
                  ...prev,
                  [data.chatId]: {
                    ...existingChat,
                    unreadCount: 0
                  }
                };
              }
              return prev;
            });
          }
        }
      }
    };

    // Typing indicators
    const handleUserTyping = (data) => {
      if (activeChat && data.chatId === activeChat._id && data.userId !== currentUser?.id) {
        setOtherUserTyping(true);
        // Auto-clear typing indicator after 3 seconds
        setTimeout(() => setOtherUserTyping(false), 3000);
      }
    };

    // Listen for the correct socket events from server
    socket.on('chat:new_message', handleNewMessage);
    socket.on('chat:messages_read', handleMessageRead);
    socket.on('chat:user_typing', handleUserTyping);
    
    // Listen for real-time unread count updates
    socket.on('chat:unread_count_update', (data) => {
      console.log('📊 Unread count update received:', data);
      if (data.userId && typeof data.unreadCount === 'number') {
        setUnreadCounts(prev => ({
          ...prev,
          [data.userId]: data.unreadCount
        }));

        // Update conversation objects with new unread count
        setConversationsByUserId(prev => {
          const existingChat = prev[data.userId];
          if (existingChat) {
            return {
              ...prev,
              [data.userId]: {
                ...existingChat,
                unreadCount: data.unreadCount
              }
            };
          }
          return prev;
        });

        if (data.chatId) {
          setConversationsByChatId(prev => {
            const existingChat = prev[data.chatId];
            if (existingChat) {
              return {
                ...prev,
                [data.chatId]: {
                  ...existingChat,
                  unreadCount: data.unreadCount
                }
              };
            }
            return prev;
          });
        }

        console.log(`✅ Updated unread count for user ${data.userId}: ${data.unreadCount}`);
      }
    });

    return () => {
      socket.off('chat:new_message', handleNewMessage);
      socket.off('chat:messages_read', handleMessageRead);
      socket.off('chat:user_typing', handleUserTyping);
      socket.off('chat:unread_count_update');
    };
  }, [socket, activeChat, currentUser?.id, appendMessage, pickOtherParticipant]);

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

  // Auto-mark messages as read when user scrolls or when new messages arrive in active chat
  useEffect(() => {
    if (!activeChat || !messagesContainerRef.current) return;

    const markMessagesAsReadWhenViewing = () => {
      // Only mark as read if page is visible and user is actively viewing
      if (!document.hidden && activeChat && socket) {
        // Get other participant info
        const otherParticipant = pickOtherParticipant(activeChat);
        const otherUserId = otherParticipant?._id || otherParticipant?.id;
        
        if (otherUserId && unreadCounts[otherUserId] > 0) {
          // Mark messages as read via socket
          socket.emit('chat:mark_all_read', { 
            chatId: activeChat._id,
            userId: currentUser?.id 
          });
          
          console.log(`🔍 Auto-marked messages as read for chat ${activeChat._id} while viewing`);
        }
      }
    };

    const container = messagesContainerRef.current;
    
    // Mark as read immediately when messages load (with delay to ensure rendering)
    const initialMarkTimeout = setTimeout(markMessagesAsReadWhenViewing, 500);
    
    // Mark as read when user scrolls (indicating they're viewing)
    const handleScroll = () => {
      // Debounce scroll events to avoid excessive API calls
      clearTimeout(readTimeoutRef.current);
      readTimeoutRef.current = setTimeout(markMessagesAsReadWhenViewing, 300);
    };

    // Mark as read when container is clicked (user is interacting)
    const handleClick = () => {
      markMessagesAsReadWhenViewing();
    };

    // Mark as read when user focuses on the input (indicating active engagement)
    const handleInputFocus = () => {
      markMessagesAsReadWhenViewing();
    };

    // Mark as read when page becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        markMessagesAsReadWhenViewing();
      }
    };

    container.addEventListener('scroll', handleScroll);
    container.addEventListener('click', handleClick);
    messageInputRef.current?.addEventListener('focus', handleInputFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(initialMarkTimeout);
      clearTimeout(readTimeoutRef.current);
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('click', handleClick);
      messageInputRef.current?.removeEventListener('focus', handleInputFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeChat, socket, currentUser?.id, pickOtherParticipant, unreadCounts]);

  // Auto scroll to bottom only when appropriate
  useEffect(() => {
    if (shouldAutoScroll.current && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Auto-mark messages as read when messages change in active chat
  useEffect(() => {
    if (activeChat && messages.length > 0 && !document.hidden) {
      const otherParticipant = pickOtherParticipant(activeChat);
      const otherUserId = otherParticipant?._id || otherParticipant?.id;
      
      if (otherUserId && unreadCounts[otherUserId] > 0 && socket) {
        // Clear any existing timeout
        clearTimeout(readTimeoutRef.current);
        
        // Mark as read after a short delay to ensure messages are visible
        readTimeoutRef.current = setTimeout(() => {
          if (activeChat && socket) {
            socket.emit('chat:mark_all_read', { 
              chatId: activeChat._id,
              userId: currentUser?.id 
            });
            console.log(`📚 Auto-marked messages as read due to message changes in chat ${activeChat._id}`);
          }
        }, 1000); // 1 second delay to ensure user sees the messages
      }
    }
  }, [messages, activeChat, socket, currentUser?.id, pickOtherParticipant, unreadCounts]);

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

  const startConversationWithConnection = useCallback(async (connection) => {
    try {
      const targetUser = connection.user || connection;
      const targetUserId = targetUser?._id || targetUser?.id;
      const currentUserId = currentUser?.id;

      if (!targetUserId || targetUserId === currentUserId) {
        return null;
      }

      const response = await socialAPI.startConversation(targetUserId);
      const newChat = response.data;

      if (!newChat) {
        return null;
      }

      const normalizedChat = {
        ...newChat,
        otherParticipants: newChat.otherParticipants?.length
          ? newChat.otherParticipants
          : targetUser
            ? [targetUser]
            : newChat.otherParticipants
      };

      setConversationsByUserId(prev => ({
        ...prev,
        [targetUserId]: normalizedChat
      }));

      setConversationsByChatId(prev => ({
        ...prev,
        [normalizedChat._id]: normalizedChat
      }));

      setUnreadCounts(prev => ({
        ...prev,
        [targetUserId]: 0
      }));

      if (normalizedChat.lastMessage?.createdAt || normalizedChat.lastActivity) {
        const timestamp = normalizedChat.lastMessage?.createdAt || normalizedChat.lastActivity;
        setLastMessageTime(prev => ({
          ...prev,
          [targetUserId]: timestamp
        }));
      }

      const chatUserId = targetUserId;
      handleChatSelect(normalizedChat, chatUserId);
      return normalizedChat;
    } catch (error) {
      alert(`Failed to start conversation: ${error.message}`);
      return null;
    }
  }, [currentUser?.id, handleChatSelect]);

  // Mark messages as read
  const markAsRead = useCallback((userId) => {
    // Update local state immediately for better UX
    setUnreadCounts(prev => ({
      ...prev,
      [userId]: 0
    }));
    
    // Find the chat for this user and emit socket event
    const chat = conversationsByUserId[userId];
    if (chat && socket) {
      // Emit socket event to mark messages as read - let server handle the persistence
      socket.emit('chat:mark_all_read', { 
        chatId: chat._id,
        userId: currentUser?.id 
      });
      
      console.log(`✅ Emitted mark as read for user ${userId} in chat ${chat._id} via socket`);
    }
  }, [socket, conversationsByUserId, currentUser?.id]);

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
        socket.emit('chat:typing', { chatId: activeChat._id, isTyping: true });
      }
    }
    
    // Set timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (socket) {
        socket.emit('chat:typing', { chatId: activeChat._id, isTyping: false });
      }
    }, 2000);
  }, [activeChat, isTyping, socket, currentUser]);
  const openChatByChatId = useCallback(async (chatId) => {
    if (!chatId) return false;

    let chat = conversationsByChatId[chatId];

    if (!chat) {
      try {
        const response = await socialAPI.getChatInfo(chatId);
        chat = response.data?.data;
      } catch (error) {
        console.error('❌ Failed to fetch chat info:', error);
        return false;
      }
    }

    if (!chat) return false;

    const otherParticipant = pickOtherParticipant(chat);
    const otherUserId = otherParticipant?._id || otherParticipant?.id;

    if (!otherUserId) return false;

    const normalizedChat = {
      ...chat,
      otherParticipants: chat.otherParticipants?.length
        ? chat.otherParticipants
        : [otherParticipant]
    };

    setConversationsByChatId(prev => ({
      ...prev,
      [normalizedChat._id]: normalizedChat
    }));

    setConversationsByUserId(prev => ({
      ...prev,
      [otherUserId]: normalizedChat
    }));

    setUnreadCounts(prev => ({
      ...prev,
      [otherUserId]: normalizedChat.unreadCount || 0
    }));

    if (normalizedChat.lastMessage?.createdAt || normalizedChat.lastActivity) {
      const timestamp = normalizedChat.lastMessage?.createdAt || normalizedChat.lastActivity;
      setLastMessageTime(prev => ({
        ...prev,
        [otherUserId]: timestamp
      }));
    }

    handleChatSelect(normalizedChat, otherUserId);
    return true;
  }, [conversationsByChatId, pickOtherParticipant, handleChatSelect]);

  const openChatByUserId = useCallback(async (targetUserId) => {
    if (!targetUserId) return false;

    const existingChat = conversationsByUserId[targetUserId];
    if (existingChat) {
      handleChatSelect(existingChat, targetUserId);
      return true;
    }

    const connection = connections.find(conn => {
      const connUser = conn.user || conn;
      const connUserId = connUser?._id || connUser?.id;
      return connUserId === targetUserId;
    });

    if (connection) {
      const newChat = await startConversationWithConnection(connection);
      return Boolean(newChat);
    }

    try {
      const response = await socialAPI.startConversation(targetUserId);
      const newChat = response.data;

      if (!newChat) return false;

      const normalizedChat = {
        ...newChat,
        otherParticipants: newChat.otherParticipants?.length
          ? newChat.otherParticipants
          : newChat.participants
      };

      const otherParticipant = pickOtherParticipant(normalizedChat);
      const otherId = otherParticipant?._id || otherParticipant?.id || targetUserId;

      setConversationsByChatId(prev => ({
        ...prev,
        [normalizedChat._id]: normalizedChat
      }));

      setConversationsByUserId(prev => ({
        ...prev,
        [otherId]: normalizedChat
      }));

      setUnreadCounts(prev => ({
        ...prev,
        [otherId]: normalizedChat.unreadCount || 0
      }));

      if (normalizedChat.lastMessage?.createdAt || normalizedChat.lastActivity) {
        const timestamp = normalizedChat.lastMessage?.createdAt || normalizedChat.lastActivity;
        setLastMessageTime(prev => ({
          ...prev,
          [otherId]: timestamp
        }));
      }

      handleChatSelect(normalizedChat, otherId);
      return true;
    } catch (error) {
      console.error('❌ Failed to start conversation for user:', error);
      return false;
    }
  }, [conversationsByUserId, connections, startConversationWithConnection, pickOtherParticipant, handleChatSelect]);

  useEffect(() => {
    if (!currentUser) return;

    const search = location.search;

    if (!search) {
      handledParamsRef.current = null;
      return;
    }

    if (handledParamsRef.current === search) {
      return;
    }

    handledParamsRef.current = search;

    const params = new URLSearchParams(search);
    const chatIdParam = params.get('chatId');
    const userIdParam = params.get('user');

    if (!chatIdParam && !userIdParam) {
      return;
    }

    const openFromParams = async () => {
      let handled = false;

      if (chatIdParam) {
        handled = await openChatByChatId(chatIdParam);
      } else if (userIdParam) {
        handled = await openChatByUserId(userIdParam);
      }

      if (handled) {
        navigate('/messages', { replace: true });
      }
    };

    openFromParams();
  }, [location.search, currentUser, openChatByChatId, openChatByUserId, navigate]);

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
  appendMessage(message);
      setNewMessage('');
      
      // Re-enable auto-scroll after a brief delay
      setTimeout(() => {
        shouldAutoScroll.current = true;
      }, 100);
      
      // Stop typing indicator when message is sent
      if (isTyping) {
        setIsTyping(false);
        if (socket) {
          socket.emit('chat:typing', { chatId: activeChat._id, isTyping: false });
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
    const container = messagesContainerRef.current;
    if (container) {
      const scrollOptions = { top: container.scrollHeight, behavior: 'smooth' };
      if (typeof container.scrollTo === 'function') {
        container.scrollTo(scrollOptions);
      } else {
        container.scrollTop = container.scrollHeight;
      }
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
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

  const formatLastSeen = (lastActiveTime) => {
    if (!lastActiveTime) return 'Last seen recently';
    
    const lastSeen = new Date(lastActiveTime);
    const now = new Date();
    const diffMs = now - lastSeen;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return 'Last seen just now';
    } else if (diffMinutes < 60) {
      return `Last seen ${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `Last seen ${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `Last seen ${diffDays}d ago`;
    } else {
      return `Last seen ${lastSeen.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })}`;
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
                  // Sort by: 1. Unread messages first, 2. Last message time (most recent first), 3. Connection date
                  .sort((a, b) => {
                    const userA = a.user || a;
                    const userB = b.user || b;
                    const userIdA = userA._id || userA.id;
                    const userIdB = userB._id || userB.id;
                    
                    const unreadA = unreadCounts[userIdA] || 0;
                    const unreadB = unreadCounts[userIdB] || 0;
                    
                    // Priority 1: Users with unread messages come first
                    if (unreadA > 0 && unreadB === 0) return -1;
                    if (unreadB > 0 && unreadA === 0) return 1;
                    if (unreadA > 0 && unreadB > 0) {
                      // If both have unread, prioritize by count (more unread = higher priority)
                      if (unreadA !== unreadB) return unreadB - unreadA;
                    }
                    
                    // Priority 2: Sort by most recent message time (from connection data or local state)
                    const timeA = lastMessageTime[userIdA] || a.lastMessageTime || null;
                    const timeB = lastMessageTime[userIdB] || b.lastMessageTime || null;
                    
                    // If both have message times, sort by most recent
                    if (timeA && timeB) {
                      const dateA = new Date(timeA);
                      const dateB = new Date(timeB);
                      return dateB - dateA;
                    }
                    
                    // If only one has messages, prioritize it
                    if (timeA && !timeB) return -1;
                    if (timeB && !timeA) return 1;
                    
                    // If neither has messages, sort by connection date (most recent connections first)
                    const connectionDateA = new Date(a.connectionDate || a.createdAt || '1970-01-01');
                    const connectionDateB = new Date(b.connectionDate || b.createdAt || '1970-01-01');
                    return connectionDateB - connectionDateA;
                  })
                  .map((connection, index) => {
                    // Handle different connection data structures
                    const user = connection.user || connection;
                    const profile = user.profile || {};
                    
                    const userId = user._id || user.id;
                    const unreadCount = unreadCounts[userId] || 0;
                    const hasNewMessage = unreadCount > 0;
                    const timeLabel = lastMessageTime[userId]
                      ? (() => {
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
                        })()
                      : null;
                    
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
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    ml: 1
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontSize: '0.7rem',
                                      color: hasNewMessage ? '#00ff88' : 'rgba(255, 255, 255, 0.5)',
                                      fontWeight: hasNewMessage ? 600 : 400,
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.3px'
                                    }}
                                  >
                                    {timeLabel}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Box>
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
                                textTransform: getOtherUser(activeChat).isOnline ? 'uppercase' : 'none',
                                letterSpacing: getOtherUser(activeChat).isOnline ? '0.3px' : 'normal'
                              }}
                            >
                              {getOtherUser(activeChat).isOnline 
                                ? 'Online' 
                                : formatLastSeen(getOtherUser(activeChat).lastActive)
                              }
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
                <Box
                  ref={messagesContainerRef}
                  sx={{ 
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
                }}
                >
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