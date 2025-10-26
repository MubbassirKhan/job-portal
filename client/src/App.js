//localhost:3000/recruiter/applications
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, GlobalStyles, Box } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';

import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import RecruiterJobs from './pages/RecruiterJobs';
import RecruiterApplications from './pages/RecruiterApplications';

// Social Pages
import SocialFeed from './pages/SocialFeed';
import Connections from './pages/Connections';
import Messages from './pages/Messages';
// import UserProfile from './pages/UserProfile'; // Temporarily commented out

// Enhanced modern theme with professional color scheme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366f1', // Indigo
      light: '#8b5cf6',
      dark: '#4338ca',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ec4899', // Pink
      light: '#f472b6',
      dark: '#be185d',
      contrastText: '#ffffff',
    },
    tertiary: {
      main: '#10b981', // Emerald
      light: '#34d399',
      dark: '#059669',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 800,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.025em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#475569',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#64748b',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          padding: '10px 20px',
          borderRadius: '8px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.25)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          border: '1px solid rgb(226 232 240)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#6366f1',
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#6366f1',
                borderWidth: '2px',
              },
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          fontWeight: 500,
        },
      },
    },
  },
});

// Global styles for animations and additional styling
const globalStyles = (
  <GlobalStyles
    styles={{
      '@import': 'url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap")',
      html: {
        scrollBehavior: 'smooth',
      },
      '*': {
        boxSizing: 'border-box',
      },
      body: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        backgroundColor: '#f8fafc',
      },
      '.gradient-text': {
        background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      },
      '.glassmorphism': {
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
      },
      '.animated-gradient': {
        background: 'linear-gradient(-45deg, #6366f1, #8b5cf6, #ec4899, #f472b6)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite',
      },
      '@keyframes gradientShift': {
        '0%': { backgroundPosition: '0% 50%' },
        '50%': { backgroundPosition: '100% 50%' },
        '100%': { backgroundPosition: '0% 50%' },
      },
      '.pulse': {
        animation: 'pulse 2s infinite',
      },
      '@keyframes pulse': {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0.5 },
      },
    }}
  />
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {globalStyles}
      <AuthProvider>
        <SocketProvider>
          <Router>
            <div className="App">
              <Navbar />
              {/* Spacer for fixed navbar */}
              <Box sx={{ height: '80px' }} />
            <AnimatePresence mode="wait">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Home />
                  </motion.div>
                } />
                <Route path="/login" element={
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Login />
                  </motion.div>
                } />
                <Route path="/register" element={
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Register />
                  </motion.div>
                } />
                <Route path="/jobs" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Jobs />
                  </motion.div>
                } />
                <Route path="/jobs/:id" element={
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <JobDetails />
                  </motion.div>
                } />
                
                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Dashboard />
                      </motion.div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Profile />
                      </motion.div>
                    </ProtectedRoute>
                  }
                />
                
                {/* Recruiter Routes */}
                <Route
                  path="/recruiter/jobs"
                  element={
                    <ProtectedRoute recruiterOnly>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <RecruiterJobs />
                      </motion.div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/applications"
                  element={
                    <ProtectedRoute recruiterOnly>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <RecruiterApplications />
                      </motion.div>
                    </ProtectedRoute>
                  }
                />
                
                {/* Social Routes */}
                <Route
                  path="/feed"
                  element={
                    <ProtectedRoute>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <SocialFeed />
                      </motion.div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/network"
                  element={
                    <ProtectedRoute>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Connections />
                      </motion.div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/connections"
                  element={
                    <ProtectedRoute>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Connections />
                      </motion.div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Messages />
                      </motion.div>
                    </ProtectedRoute>
                  }
                />
                {/* <Route
                  path="/profile/:userId"
                  element={
                    <ProtectedRoute>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <UserProfile />
                      </motion.div>
                    </ProtectedRoute>
                  }
                /> */}
              </Routes>
            </AnimatePresence>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              toastStyle={{
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.25)',
              }}
            />
          </div>
        </Router>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;