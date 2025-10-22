// Debug component to check environment variables
import React from 'react';
import { API_BASE_URL, SERVER_BASE_URL } from '../config/api';

const EnvDebug = () => {
  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <div>API URL: {API_BASE_URL}</div>
      <div>Server URL: {SERVER_BASE_URL}</div>
      <div>NODE_ENV: {process.env.NODE_ENV}</div>
    </div>
  );
};

export default EnvDebug;