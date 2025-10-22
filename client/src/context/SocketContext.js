import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { SERVER_BASE_URL } from '../config/api';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      // Initialize socket connection
      const newSocket = io(SERVER_BASE_URL, {
        auth: {
          token: token
        },
        autoConnect: true
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('Connected to server');
        setConnected(true);
        
        // Join user's personal room for notifications
        newSocket.emit('user:join', user.id);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnected(false);
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.close();
      };
    } else {
      // Close socket if user logs out
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);

  const value = {
    socket,
    connected,
    // Helper methods
    joinChat: (chatId) => {
      if (socket) {
        socket.emit('chat:join', chatId);
      }
    },
    leaveChat: (chatId) => {
      if (socket) {
        socket.emit('chat:leave', chatId);
      }
    },
    sendMessage: (messageData) => {
      if (socket) {
        socket.emit('chat:message', messageData);
      }
    },
    sendTypingIndicator: (chatId, isTyping) => {
      if (socket) {
        socket.emit('chat:typing', { chatId, isTyping });
      }
    },
    markNotificationAsRead: (notificationId) => {
      if (socket) {
        socket.emit('notification:mark_read', notificationId);
      }
    },
    markAllNotificationsAsRead: () => {
      if (socket) {
        socket.emit('notification:mark_all_read');
      }
    }
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};