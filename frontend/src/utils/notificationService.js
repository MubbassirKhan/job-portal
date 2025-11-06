const listeners = new Set();

export const subscribeToNotifications = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const emitNotification = (variant, message, options = {}) => {
  if (!message) {
    return;
  }
  listeners.forEach((listener) => listener({
    id: options.id || `${Date.now()}-${Math.random()}`,
    message,
    variant,
    ...options,
  }));
};

export const toast = {
  success: (message, options) => emitNotification('success', message, options),
  error: (message, options) => emitNotification('error', message, options),
  info: (message, options) => emitNotification('info', message, options),
  warning: (message, options) => emitNotification('warning', message, options),
};

export default toast;
