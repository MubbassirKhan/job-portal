import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import CandidateDashboard from '../components/CandidateDashboard';
import RecruiterDashboard from '../components/RecruiterDashboard';
import { motion } from 'framer-motion';
import { Dashboard as DashboardIcon, Person, AdminPanelSettings } from '@mui/icons-material';

const Dashboard = () => {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Paper
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            color: 'white',
            p: 4,
            mb: 4,
            borderRadius: '20px',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              {user?.role === 'recruiter' || user?.role === 'admin' ? (
                <AdminPanelSettings sx={{ fontSize: 40 }} />
              ) : (
                <Person sx={{ fontSize: 40 }} />
              )}
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {getGreeting()}, {user?.profile?.firstName}!
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                  {user?.role === 'recruiter' || user?.role === 'admin' 
                    ? 'Manage your job postings and review applications' 
                    : 'Track your applications and discover new opportunities'
                  }
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
              <DashboardIcon sx={{ fontSize: 20 }} />
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {user?.role === 'recruiter' || user?.role === 'admin' ? 'Recruiter Dashboard' : 'Candidate Dashboard'}
              </Typography>
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
  );
};

export default Dashboard;