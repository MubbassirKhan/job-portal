import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import CandidateDashboard from '../components/CandidateDashboard';
import RecruiterDashboard from '../components/RecruiterDashboard';
import { motion } from 'framer-motion';
import { Dashboard as DashboardIcon, Person, AdminPanelSettings } from '@mui/icons-material';

// Add global styles for animations
const globalStyles = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 136, 0.3); }
    50% { box-shadow: 0 0 40px rgba(0, 255, 136, 0.6); }
  }
  
  @keyframes underlineExpand {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = globalStyles;
  document.head.appendChild(styleSheet);
}

const Dashboard = () => {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
      py: { xs: 4, sm: 5, md: 6 },
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 25% 25%, rgba(0, 255, 136, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(0, 255, 136, 0.08) 0%, transparent 50%)',
        animation: 'pulse 8s ease-in-out infinite',
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%2300ff88" fill-opacity="0.05"%3E%3Crect x="0" y="0" width="2" height="2"/%3E%3C/g%3E%3C/svg%3E")',
      }
    }}>
      <Container maxWidth={false} sx={{ position: 'relative', zIndex: 1, px: { xs: 2, sm: 3, md: 4 }, width: '100%' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            sx={{
              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(26, 26, 26, 0.8) 50%, rgba(0, 0, 0, 0.9) 100%)',
              backdropFilter: 'blur(20px)',
              color: 'white',
              p: { xs: 3, sm: 4, md: 5 },
              mt: { xs: 4, sm: 5, md: 6 },
              mb: { xs: 3, sm: 4 },
              borderRadius: 0,
              position: 'relative',
              overflow: 'hidden',
              border: '2px solid',
              borderImageSource: 'linear-gradient(45deg, #00ff88, rgba(0, 255, 136, 0.3), #00ff88)',
              borderImageSlice: 1,
              boxShadow: '0 0 30px rgba(0, 255, 136, 0.3), inset 0 0 20px rgba(0, 255, 136, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 0 40px rgba(0, 255, 136, 0.4), inset 0 0 30px rgba(0, 255, 136, 0.2)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(45deg, transparent 30%, rgba(0, 255, 136, 0.1) 50%, transparent 70%)',
                animation: 'shimmer 3s ease-in-out infinite',
                pointerEvents: 'none',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, transparent 0%, #00ff88 50%, transparent 100%)',
                animation: 'glow 2s ease-in-out infinite alternate',
              }
            }}
          >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
              {user?.role === 'recruiter' || user?.role === 'admin' ? (
                <AdminPanelSettings sx={{ 
                  fontSize: { xs: 35, sm: 40, md: 45 },
                  color: '#00ff88',
                  filter: 'drop-shadow(0 2px 10px rgba(0, 255, 136, 0.4))'
                }} />
              ) : (
                <Person sx={{ 
                  fontSize: { xs: 35, sm: 40, md: 45 },
                  color: '#00ff88',
                  filter: 'drop-shadow(0 2px 10px rgba(0, 255, 136, 0.4))'
                }} />
              )}
              <Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 800,
                    fontSize: { xs: '1.75rem', sm: '2.125rem', md: '2.5rem' },
                    background: 'linear-gradient(135deg, #ffffff 0%, #00ff88 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 2px 20px rgba(0, 255, 136, 0.3)',
                    mb: 0.5
                  }}
                >
                  {getGreeting()}, {user?.profile?.firstName}!
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    opacity: 0.85, 
                    fontWeight: 500,
                    fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                    color: '#cccccc',
                    lineHeight: 1.4
                  }}
                >
                  {user?.role === 'recruiter' || user?.role === 'admin' 
                    ? 'Manage your job postings and review applications' 
                    : 'Track your applications and discover new opportunities'
                  }
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              mt: 3,
              pt: 2,
              borderTop: '1px solid rgba(0, 255, 136, 0.2)',
              position: 'relative'
            }}>
              <DashboardIcon sx={{ 
                fontSize: 20, 
                color: '#00ff88',
                filter: 'drop-shadow(0 0 5px rgba(0, 255, 136, 0.6))'
              }} />
              <Typography variant="body1" sx={{ 
                opacity: 0.9,
                color: '#cccccc',
                fontWeight: 500,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}>
                {user?.role === 'recruiter' || user?.role === 'admin' ? 'Recruiter Dashboard' : 'Candidate Dashboard'}
              </Typography>
              <Box sx={{
                position: 'absolute',
                right: 0,
                width: '20px',
                height: '2px',
                background: 'linear-gradient(90deg, transparent 0%, #00ff88 100%)',
                animation: 'underlineExpand 2s ease-in-out infinite alternate'
              }} />
            </Box>
          </Box>
        </Paper>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {user?.role === 'recruiter' || user?.role === 'admin' ? <RecruiterDashboard /> : <CandidateDashboard />}
      </motion.div>
      </Container>
    </Box>
  );
};

export default Dashboard;