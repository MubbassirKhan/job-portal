import { useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

// Re-export useSocket for convenience
export { useSocket };

// Custom hook for handling socket events with cleanup
export const useSocketEvent = (eventName, handler, dependencies = []) => {
  const { socket } = useSocket();
  const handlerRef = useRef(handler);

  // Update handler ref when handler changes
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!socket) return;

    const wrappedHandler = (...args) => {
      handlerRef.current(...args);
    };

    socket.on(eventName, wrappedHandler);

    return () => {
      socket.off(eventName, wrappedHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, eventName, ...dependencies]);
};

// Hook for managing chat functionality
export const useChat = () => {
  const { connected, joinChat, leaveChat, sendMessage, sendTypingIndicator } = useSocket();

  return {
    connected,
    joinChat,
    leaveChat,
    sendMessage,
    sendTypingIndicator,
    // Helper method to send a text message
    sendTextMessage: (chatId, content) => {
      sendMessage({
        chatId,
        content,
        messageType: 'text'
      });
    }
  };
};

// Hook for managing notifications
export const useNotifications = () => {
  const { connected, markNotificationAsRead, markAllNotificationsAsRead } = useSocket();

  return {
    connected,
    markNotificationAsRead,
    markAllNotificationsAsRead
  };
};