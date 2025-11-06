import React, { useEffect, useState, useCallback } from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';
import { subscribeToNotifications } from '../utils/notificationService';

const SlideTransition = (props) => <Slide {...props} direction="left" />;

const NotificationProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToNotifications((notification) => {
      setQueue((prev) => [...prev, notification]);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0]);
      setQueue((prev) => prev.slice(1));
      setOpen(true);
    }
  }, [queue, current]);

  const handleClose = useCallback((event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  }, []);

  const handleExited = useCallback(() => {
    setCurrent(null);
  }, []);

  return (
    <>
      {children}
      <Snackbar
        key={current ? current.id : undefined}
        open={open}
        anchorOrigin={current?.anchorOrigin || { vertical: 'top', horizontal: 'right' }}
        autoHideDuration={current?.autoHideDuration || 4000}
        onClose={handleClose}
        TransitionComponent={SlideTransition}
        TransitionProps={{ onExited: handleExited }}
      >
        <Alert
          onClose={handleClose}
          severity={current?.variant || 'info'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {current?.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default NotificationProvider;
