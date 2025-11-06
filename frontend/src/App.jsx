import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, GlobalStyles, Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';


import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationProvider from './components/NotificationProvider';

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
import UserProfile from './pages/UserProfile';

// Keep the existing theme from client App
const theme = createTheme({});

const globalStyles = (
  <GlobalStyles styles={{}} />
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {globalStyles}
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <Router>
            <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
              <Navbar />
              <Box sx={{ flex: 1 }}>
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/jobs" element={<Jobs />} />
                    <Route path="/jobs/:id" element={<JobDetails />} />
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/recruiter/jobs" element={<ProtectedRoute recruiterOnly><RecruiterJobs /></ProtectedRoute>} />
                    <Route path="/recruiter/applications" element={<ProtectedRoute recruiterOnly><RecruiterApplications /></ProtectedRoute>} />
                    <Route path="/feed" element={<ProtectedRoute><SocialFeed /></ProtectedRoute>} />
                    <Route path="/network" element={<ProtectedRoute><Connections /></ProtectedRoute>} />
                    <Route path="/connections" element={<ProtectedRoute><Connections /></ProtectedRoute>} />
                    <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                    <Route path="/profile/:userId" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                  </Routes>
                </AnimatePresence>
              </Box>
              <Footer />
            </Box>
            </Router>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
