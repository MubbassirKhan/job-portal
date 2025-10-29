import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
} from '@mui/material';
import { 
  Work, 
  Group, 
  Search,
  RocketLaunch,
  Analytics,
  ArrowForward,
  CheckCircle,
  BusinessCenter,
  People,
  Assignment,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { motion, useAnimation, useInView } from 'framer-motion';

// Add global styles for animations
const globalStyles = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  @keyframes underlineExpand {
    0% { transform: scaleX(0); }
    100% { transform: scaleX(1); }
  }

  @keyframes borderGlow {
    0% { opacity: 0.3; }
    50% { opacity: 0.7; }
    100% { opacity: 0.3; }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = globalStyles;
  document.head.appendChild(styleSheet);
}

const AnimatedCard = ({ children, delay = 0 }) => {
  const controls = useAnimation();
  const ref = React.useRef(null);
  const inView = useInView(ref);

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      transition={{ duration: 0.6, delay }}
      variants={{
        visible: { opacity: 1, y: 0, scale: 1 },
        hidden: { opacity: 0, y: 50, scale: 0.95 }
      }}
    >
      {children}
    </motion.div>
  );
};

const AnimatedCounter = ({ target, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = React.useRef(null);
  const inView = useInView(ref);

  useEffect(() => {
    if (inView) {
      let startTime;
      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = (currentTime - startTime) / duration;
        
        if (progress < 1) {
          setCount(Math.floor(target * progress));
          requestAnimationFrame(animate);
        } else {
          setCount(target);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [inView, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
};

const Home = () => {
  const features = [
    {
      icon: <Search sx={{ fontSize: 40 }} />,
      title: 'Smart Job Search',
      description: 'AI-powered search that finds opportunities matching your skills and preferences',
      color: '#6366f1',
    },
    {
      icon: <RocketLaunch sx={{ fontSize: 40 }} />,
      title: 'Quick Applications',
      description: 'Apply to multiple jobs instantly with your pre-filled profile and resume',
      color: '#ec4899',
    },
    {
      icon: <Group sx={{ fontSize: 40 }} />,
      title: 'Direct Connect',
      description: 'Get discovered by hiring managers and connect directly with recruiters',
      color: '#10b981',
    },
    {
      icon: <Analytics sx={{ fontSize: 40 }} />,
      title: 'Career Analytics',
      description: 'Track your application progress and get insights to improve your success rate',
      color: '#f59e0b',
    },
  ];

  const benefits = [
    'Free job alerts & recommendations',
    'Professional resume builder',
    'Interview preparation resources',
    'Career counseling & guidance',
    'Salary insights & negotiation tips',
    'Direct employer communication'
  ];

  const stats = [
    { value: 50000, label: 'Active Jobs', icon: <BusinessCenter /> },
    { value: 12000, label: 'Partner Companies', icon: <Work /> },
    { value: 250000, label: 'Success Stories', icon: <People /> },
    { value: 98, label: 'Satisfaction Rate', suffix: '%', icon: <Assignment /> },
  ];



  return (
    <Box sx={{ m: 0, p: 0 }}>
      {/* Enhanced Hero Section with Animated Background */}
      <Box
        sx={{
          minHeight: '100vh',
          height: 'auto',
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 40%, #2a2a2a 60%, #000000 100%)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          pt: { xs: '70px', sm: '80px' },
          pb: { xs: 2, sm: 4 },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 30%, rgba(0, 255, 136, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(0, 255, 136, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 40% 70%, rgba(0, 255, 136, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 90% 80%, rgba(0, 255, 136, 0.12) 0%, transparent 50%)
            `,
            animation: 'pulse 10s ease-in-out infinite',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%2300ff88" fill-opacity="0.06"%3E%3Ccircle cx="30" cy="30" r="1.5"/%3E%3C/g%3E%3C/svg%3E")',
          }
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, px: { xs: 2, sm: 3, md: 4 }, height: '100%' }}>
          <Grid container spacing={{ xs: 3, sm: 4, md: 6 }} alignItems="center" sx={{ minHeight: '100vh', pt: { xs: 4, sm: 6 } }}>
            <Grid item xs={12} lg={7}>
              <motion.div
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                {/* Pre-title */}
        

                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 900,
                    color: '#ffffff',
                    mb: { xs: 2, sm: 3, md: 4 },
                    fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.8rem', lg: '6rem' },
                    lineHeight: { xs: 1.1, sm: 1.0, md: 0.95 },
                    letterSpacing: { xs: '-0.02em', sm: '-0.03em' },
                    textAlign: { xs: 'center', lg: 'left' },
                    px: { xs: 1, sm: 0 },
                    textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  Launch Your{' '}
                  <Box
                    component="span"
                    sx={{
                      background: 'linear-gradient(135deg, #00ff88 0%, #22c55e 50%, #16a34a 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      position: 'relative',
                      display: 'inline-block',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: { xs: '-5px', md: '-8px' },
                        left: 0,
                        width: '100%',
                        height: { xs: '4px', md: '6px' },
                        background: 'linear-gradient(135deg, #00ff88 0%, #22c55e 100%)',
                        transform: 'scaleX(0)',
                        transformOrigin: 'left',
                        animation: 'underlineExpand 2s ease-out 0.8s forwards',
                        borderRadius: '2px',
                        boxShadow: '0 0 15px rgba(0, 255, 136, 0.6)',
                      }
                    }}
                  >
                    Career
                  </Box>{' '}
                  <br />
                  <Box
                    component="span"
                    sx={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #e5e5e5 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Journey
                  </Box>
                </Typography>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      mb: { xs: 3, sm: 4, md: 5 },
                      lineHeight: { xs: 1.6, sm: 1.7, md: 1.8 },
                      fontWeight: 500,
                      fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' },
                      textAlign: { xs: 'center', lg: 'left' },
                      maxWidth: { lg: '95%' },
                      px: { xs: 1, sm: 0 },
                    }}
                  >
                    Connect with <Box component="span" sx={{ color: '#00ff88', fontWeight: 700 }}>elite employers worldwide</Box> and unlock 
                    opportunities that perfectly align with your professional aspirations. 
                    <Box component="span" sx={{ color: '#22c55e', fontWeight: 600 }}> Join 250,000+ professionals</Box> who found their dream careers.
                  </Typography>
                </motion.div>

                {/* Mini Stats in Hero */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <Grid container spacing={2} sx={{ 
                    mb: { xs: 4, sm: 5 }, 
                    maxWidth: { lg: '500px' },
                    px: { xs: 1, sm: 0 }
                  }}>
                    {[
                      { number: "50K+", label: "Active Jobs", icon: <Work /> },
                      { number: "12K+", label: "Companies", icon: <BusinessCenter /> },
                      { number: "250K+", label: "Success Stories", icon: <People /> }
                    ].map((stat, index) => (
                      <Grid item xs={4} key={index}>
                        <motion.div
                          whileHover={{ scale: 1.05, y: -2 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Box sx={{
                            textAlign: 'center',
                            p: { xs: 1.5, sm: 2 },
                            background: 'rgba(0, 255, 136, 0.08)',
                            border: '1px solid rgba(0, 255, 136, 0.3)',
                            borderRadius: '8px',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              background: 'rgba(0, 255, 136, 0.15)',
                              borderColor: 'rgba(0, 255, 136, 0.5)',
                              transform: 'translateY(-2px)',
                            }
                          }}>
                            <Box sx={{ color: '#00ff88', mb: 0.5, fontSize: { xs: 16, sm: 20 } }}>
                              {stat.icon}
                            </Box>
                            <Typography variant="h6" sx={{ 
                              color: '#ffffff', 
                              fontWeight: 700,
                              fontSize: { xs: '1rem', sm: '1.1rem' },
                              mb: 0.5
                            }}>
                              {stat.number}
                            </Typography>
                            <Typography variant="caption" sx={{ 
                              color: 'rgba(255, 255, 255, 0.7)',
                              fontSize: { xs: '0.7rem', sm: '0.8rem' },
                              fontWeight: 500
                            }}>
                              {stat.label}
                            </Typography>
                          </Box>
                        </motion.div>
                      </Grid>
                    ))}
                  </Grid>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    gap: { xs: 2, sm: 3 }, 
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: 'center',
                    justifyContent: { xs: 'center', lg: 'flex-start' },
                    mb: { xs: 3, sm: 4 },
                    px: { xs: 1, sm: 0 }
                  }}>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Button
                        component={Link}
                        to="/jobs"
                        variant="contained"
                        size="large"
                        endIcon={<ArrowForward />}
                        sx={{
                          background: 'linear-gradient(135deg, #00ff88 0%, #22c55e 100%)',
                          color: '#000000',
                          px: { xs: 5, sm: 6, md: 7 },
                          py: { xs: 2, sm: 2.5, md: 3 },
                          fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                          fontWeight: 800,
                          borderRadius: '50px',
                          border: '3px solid transparent',
                          backgroundClip: 'padding-box',
                          boxShadow: '0 8px 32px rgba(0, 255, 136, 0.4), 0 0 0 1px rgba(0, 255, 136, 0.1)',
                          textTransform: 'none',
                          letterSpacing: '0.5px',
                          position: 'relative',
                          overflow: 'hidden',
                          minWidth: { xs: '220px', sm: 'auto' },
                          width: { xs: '100%', sm: 'auto' },
                          maxWidth: { xs: '300px', sm: 'none' },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                            transition: 'left 0.5s',
                          },
                          '&:hover': {
                            background: 'linear-gradient(135deg, #22c55e 0%, #00ff88 100%)',
                            boxShadow: '0 12px 40px rgba(0, 255, 136, 0.6), 0 0 0 2px rgba(0, 255, 136, 0.3)',
                            transform: 'translateY(-3px)',
                            '&::before': {
                              left: '100%',
                            }
                          }
                        }}
                      >
                        🚀 Find Dream Jobs
                      </Button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Button
                        component={Link}
                        to="/register"
                        variant="outlined"
                        size="large"
                        startIcon={<People />}
                        sx={{
                          borderColor: 'rgba(255, 255, 255, 0.6)',
                          color: '#ffffff',
                          px: { xs: 5, sm: 6, md: 7 },
                          py: { xs: 2, sm: 2.5, md: 3 },
                          fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                          fontWeight: 700,
                          borderRadius: '50px',
                          borderWidth: 2,
                          textTransform: 'none',
                          letterSpacing: '0.5px',
                          backdropFilter: 'blur(10px)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          minWidth: { xs: '220px', sm: 'auto' },
                          width: { xs: '100%', sm: 'auto' },
                          maxWidth: { xs: '300px', sm: 'none' },
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%)',
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                          },
                          '&:hover': {
                            borderColor: '#00ff88',
                            background: 'rgba(0, 255, 136, 0.1)',
                            color: '#00ff88',
                            transform: 'translateY(-3px)',
                            boxShadow: '0 8px 32px rgba(0, 255, 136, 0.2)',
                            '&::before': {
                              opacity: 1,
                            }
                          }
                        }}
                      >
                        Join Community
                      </Button>
                    </motion.div>
                  </Box>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.0 }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      mb: 2,
                      fontWeight: 500,
                      textAlign: { xs: 'center', lg: 'left' },
                      px: { xs: 1, sm: 0 },
                    }}
                  >
                    ✨ What you get with TalentHub:
                  </Typography>
                  <Grid container spacing={1} sx={{ 
                    maxWidth: { lg: '600px' },
                    px: { xs: 1, sm: 0 }
                  }}>
                    {benefits.slice(0, 6).map((benefit, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.2 + index * 0.1 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                        >
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1.5,
                            p: { xs: 1.5, sm: 2 },
                            borderRadius: '12px',
                            background: 'rgba(0, 255, 136, 0.08)',
                            border: '1px solid rgba(0, 255, 136, 0.2)',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'pointer',
                            '&:hover': {
                              background: 'rgba(0, 255, 136, 0.15)',
                              borderColor: 'rgba(0, 255, 136, 0.4)',
                              transform: 'translateX(5px)',
                              boxShadow: '0 4px 20px rgba(0, 255, 136, 0.1)',
                            }
                          }}>
                            <CheckCircle sx={{ 
                              color: '#00ff88', 
                              fontSize: { xs: 20, sm: 22 },
                              filter: 'drop-shadow(0 0 8px rgba(0, 255, 136, 0.4))'
                            }} />
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: 'rgba(255, 255, 255, 0.95)',
                                fontWeight: 600,
                                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                                lineHeight: 1.4,
                              }}
                            >
                              {benefit}
                            </Typography>
                          </Box>
                        </motion.div>
                      </Grid>
                    ))}
                  </Grid>
                </motion.div>
              </motion.div>
            </Grid>

            <Grid item xs={12} lg={5}>
              <motion.div
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mt: { xs: 3, sm: 4, lg: 0 },
                    px: { xs: 2, sm: 1 },
                    height: { lg: 'auto' }
                  }}
                >
                  {/* Main Interactive Card */}
                  <motion.div
                    animate={{ 
                      y: [0, -15, 0],
                      rotateY: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    whileHover={{ scale: 1.02, rotateY: 0 }}
                  >
                    <Box
                      sx={{
                        width: { xs: 280, sm: 320, md: 380, lg: 420 },
                        height: { xs: 350, sm: 400, md: 450, lg: 500 },
                        background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.12) 0%, rgba(0, 0, 0, 0.9) 50%, rgba(0, 255, 136, 0.08) 100%)',
                        borderRadius: '24px',
                        border: '2px solid rgba(0, 255, 136, 0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 20px 60px rgba(0, 255, 136, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(45deg, transparent 30%, rgba(0, 255, 136, 0.1) 50%, transparent 70%)',
                          transform: 'translateX(-100%)',
                          animation: 'shimmer 4s infinite',
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: '-2px',
                          left: '-2px',
                          right: '-2px',
                          bottom: '-2px',
                          background: 'linear-gradient(45deg, #00ff88, transparent, #22c55e, transparent, #00ff88)',
                          borderRadius: '24px',
                          zIndex: -1,
                          animation: 'borderGlow 3s linear infinite',
                        }
                      }}
                    >
                      {/* Content */}
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: { xs: 3, sm: 4 },
                          textAlign: 'center',
                          zIndex: 1,
                          p: { xs: 3, sm: 4 },
                        }}
                      >
                        {/* Main Icon */}
                        <motion.div
                          animate={{ 
                            rotate: [0, 5, -5, 0],
                            scale: [1, 1.05, 1],
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <Work sx={{ 
                            fontSize: { xs: 80, sm: 100, md: 120, lg: 140 }, 
                            color: '#00ff88',
                            filter: 'drop-shadow(0 0 30px rgba(0, 255, 136, 0.8))',
                          }} />
                        </motion.div>
                        
                        {/* Feature Icons Grid */}
                        <Grid container spacing={2} sx={{ maxWidth: '280px' }}>
                          {[
                            { icon: Search, label: 'Smart Search', delay: 0 },
                            { icon: Group, label: 'Network', delay: 0.2 },
                            { icon: RocketLaunch, label: 'Fast Apply', delay: 0.4 },
                            { icon: Analytics, label: 'Analytics', delay: 0.6 }
                          ].map((item, index) => (
                            <Grid item xs={6} key={index}>
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ 
                                  delay: 1.5 + item.delay, 
                                  type: "spring",
                                  stiffness: 200,
                                  damping: 15
                                }}
                                whileHover={{ 
                                  scale: 1.1, 
                                  y: -5,
                                  transition: { duration: 0.2 }
                                }}
                              >
                                <Box
                                  sx={{
                                    p: { xs: 2, sm: 2.5 },
                                    background: 'rgba(0, 255, 136, 0.15)',
                                    border: '1.5px solid rgba(0, 255, 136, 0.4)',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 1,
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    cursor: 'pointer',
                                    '&:hover': {
                                      background: 'rgba(0, 255, 136, 0.25)',
                                      borderColor: 'rgba(0, 255, 136, 0.6)',
                                      boxShadow: '0 8px 25px rgba(0, 255, 136, 0.2)',
                                    }
                                  }}
                                >
                                  <item.icon sx={{ 
                                    fontSize: { xs: 28, sm: 32 }, 
                                    color: '#00ff88',
                                    filter: 'drop-shadow(0 0 10px rgba(0, 255, 136, 0.5))'
                                  }} />
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: 'rgba(255, 255, 255, 0.9)',
                                      fontWeight: 600,
                                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                      textAlign: 'center'
                                    }}
                                  >
                                    {item.label}
                                  </Typography>
                                </Box>
                              </motion.div>
                            </Grid>
                          ))}
                        </Grid>
                        
                        {/* Bottom Text */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 2.5 }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              color: '#ffffff',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: { xs: '1.5px', sm: '2px' },
                              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                              background: 'linear-gradient(135deg, #ffffff 0%, #00ff88 100%)',
                              backgroundClip: 'text',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                            }}
                          >
                            Professional Network
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'rgba(255, 255, 255, 0.7)',
                              fontWeight: 500,
                              fontSize: { xs: '0.8rem', sm: '0.85rem' },
                              mt: 1,
                            }}
                          >
                            Join 250K+ Professionals
                          </Typography>
                        </motion.div>
                      </Box>
                    </Box>
                  </motion.div>

                  {/* Floating Elements */}
                  {[
                    { icon: <BusinessCenter />, top: '10%', right: '10%', delay: 2 },
                    { icon: <Assignment />, bottom: '15%', left: '5%', delay: 2.5 },
                    { icon: <People />, top: '60%', right: '-5%', delay: 3 },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: [0, 1, 1, 0],
                        scale: [0, 1, 1, 0],
                        y: [0, -20, 0],
                      }}
                      transition={{
                        duration: 4,
                        delay: item.delay,
                        repeat: Infinity,
                        repeatDelay: 3,
                      }}
                      style={{
                        position: 'absolute',
                        ...item,
                        zIndex: 0,
                      }}
                    >
                      <Box
                        sx={{
                          p: 1.5,
                          background: 'rgba(0, 255, 136, 0.2)',
                          border: '1px solid rgba(0, 255, 136, 0.4)',
                          borderRadius: '12px',
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        {React.cloneElement(item.icon, { 
                          sx: { fontSize: 24, color: '#00ff88' }
                        })}
                      </Box>
                    </motion.div>
                  ))}
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
          py: { xs: 6, sm: 8, md: 12 },
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }
        }}
      >
        <Container maxWidth={false} sx={{ px: { xs: 1, sm: 2, md: 4 }, position: 'relative', zIndex: 1 }}>
          <AnimatedCard>
            <Box textAlign="center" sx={{ mb: { xs: 6, sm: 8, md: 10 } }}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  mb: { xs: 2, sm: 3 },
                  background: 'linear-gradient(135deg, #00ff88 0%, #00e676 50%, #ffffff 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3.5rem' },
                  textTransform: 'uppercase',
                  letterSpacing: { xs: '1px', sm: '2px' },
                  px: { xs: 1, sm: 0 },
                }}
              >
                Why Choose TalentHub?
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  maxWidth: 700, 
                  mx: 'auto',
                  color: '#ffffff',
                  fontWeight: 300,
                  fontSize: { xs: '1rem', sm: '1.2rem', md: '1.4rem' },
                  lineHeight: 1.6,
                  px: { xs: 2, sm: 0 },
                }}
              >
                Everything you need to accelerate your career journey in the digital age
              </Typography>
            </Box>
          </AnimatedCard>

          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={6} lg={3} key={index}>
                <AnimatedCard delay={index * 0.2}>
                  <motion.div
                    whileHover={{ y: -10, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        textAlign: 'center',
                        p: { xs: 3, sm: 4 },
                        background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
                        border: '2px solid rgba(0, 255, 136, 0.4)',
                        borderRadius: 0,
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        backdropFilter: 'blur(10px)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '4px',
                          background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(45deg, transparent 30%, rgba(0, 255, 136, 0.08) 50%, transparent 70%)',
                          transform: 'translateX(-100%)',
                          transition: 'transform 0.6s ease',
                        },
                        '&:hover': {
                          borderColor: '#00ff88',
                          boxShadow: '0 20px 40px rgba(0, 255, 136, 0.3)',
                          '&::after': {
                            transform: 'translateX(100%)',
                          }
                        },
                      }}
                    >
                      <CardContent sx={{ p: 0 }}>
                        <Box
                          sx={{
                            width: { xs: 70, sm: 80, md: 90 },
                            height: { xs: 70, sm: 80, md: 90 },
                            borderRadius: 0,
                            background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.25) 0%, rgba(0, 230, 118, 0.15) 100%)',
                            border: '2px solid rgba(0, 255, 136, 0.6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 3,
                            color: '#00ff88',
                            position: 'relative',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              width: '120%',
                              height: '120%',
                              border: '1px solid rgba(0, 255, 136, 0.4)',
                              borderRadius: 0,
                              transform: 'translate(-50%, -50%)',
                              animation: 'pulse 2s infinite',
                            }
                          }}
                        >
                          {React.cloneElement(feature.icon, { sx: { fontSize: 40 } })}
                        </Box>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 700, 
                            mb: 3,
                            color: '#ffffff',
                            fontSize: '1.3rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                          }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            lineHeight: 1.8,
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: '1rem',
                            fontWeight: 300
                          }}
                        >
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatedCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.08) 0%, rgba(0, 0, 0, 0.95) 50%, rgba(0, 255, 136, 0.08) 100%)',
          py: 10,
          position: 'relative',
          borderTop: '2px solid rgba(0, 255, 136, 0.4)',
          borderBottom: '2px solid rgba(0, 255, 136, 0.4)',
        }}
      >
        <Container maxWidth={false} sx={{ px: { xs: 1, sm: 2, md: 4 } }}>
          <AnimatedCard>
            <Typography
              variant="h3"
              textAlign="center"
              sx={{ 
                fontWeight: 800, 
                mb: { xs: 1, sm: 2 },
                color: '#ffffff',
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
                textTransform: 'uppercase',
                letterSpacing: { xs: '1px', sm: '2px' },
                px: { xs: 1, sm: 0 }
              }}
            >
              Trusted by Professionals Worldwide
            </Typography>
            <Typography
              variant="h6"
              textAlign="center"
              sx={{ 
                mb: { xs: 4, sm: 6, md: 8 },
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.3rem' },
                fontWeight: 300,
                px: { xs: 2, sm: 0 }
              }}
            >
              Join thousands who have transformed their careers
            </Typography>
          </AnimatedCard>

          <Grid container spacing={{ xs: 1, sm: 2, md: 3, lg: 4 }}>
            {stats.map((stat, index) => (
              <Grid item xs={6} sm={6} md={3} key={index}>
                <AnimatedCard delay={index * 0.1}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Paper
                      sx={{
                        p: { xs: 1.5, sm: 2, md: 3, lg: 4 },
                        textAlign: 'center',
                        borderRadius: 0,
                        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(26, 26, 26, 0.9) 100%)',
                        border: '2px solid rgba(0, 255, 136, 0.4)',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        minHeight: { xs: '120px', sm: '140px', md: '160px', lg: '180px' },
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(45deg, transparent 30%, rgba(0, 255, 136, 0.15) 50%, transparent 70%)',
                          transform: 'translateX(-100%)',
                          transition: 'transform 0.6s ease',
                        },
                        '&:hover': {
                          borderColor: '#00ff88',
                          boxShadow: '0 20px 40px rgba(0, 255, 136, 0.4)',
                          '&::before': {
                            transform: 'translateX(100%)',
                          }
                        }
                      }}
                    >
                      <Box
                        sx={{
                          color: '#00ff88',
                          mb: { xs: 1.5, sm: 2, md: 3 },
                          display: 'flex',
                          justifyContent: 'center',
                          position: 'relative',
                          zIndex: 1,
                        }}
                      >
                        {React.cloneElement(stat.icon, { sx: { fontSize: { xs: 28, sm: 35, md: 45, lg: 50 } } })}
                      </Box>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 800,
                          background: 'linear-gradient(135deg, #00ff88 0%, #00e676 50%, #ffffff 100%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          mb: { xs: 0.5, sm: 1, md: 2 },
                          fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2rem', lg: '2.5rem', xl: '3rem' },
                          position: 'relative',
                          zIndex: 1,
                          lineHeight: 1.2,
                        }}
                      >
                        <AnimatedCounter target={stat.value} />
                        {stat.suffix || '+'}
                      </Typography>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600,
                          color: 'rgba(255, 255, 255, 0.8)',
                          textTransform: 'uppercase',
                          letterSpacing: { xs: '0.3px', sm: '0.5px' },
                          fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.8rem', lg: '0.9rem' },
                          position: 'relative',
                          zIndex: 1,
                          lineHeight: 1.3,
                        }}
                      >
                        {stat.label}
                      </Typography>
                    </Paper>
                  </motion.div>
                </AnimatedCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
          py: { xs: 6, sm: 8, md: 10, lg: 12 },
          position: 'relative',
          borderTop: '2px solid rgba(0, 255, 136, 0.4)',
        }}
      >
        <Container maxWidth={false} sx={{ px: { xs: 1, sm: 2, md: 4 } }}>
          <AnimatedCard>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Box
                sx={{
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(0, 0, 0, 0.8) 50%, rgba(0, 255, 136, 0.15) 100%)',
                  borderRadius: 0,
                  border: '2px solid #00ff88',
                  p: { xs: 3, sm: 4, md: 6, lg: 8, xl: 10 },
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  backdropFilter: 'blur(10px)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.15) 0%, transparent 70%)',
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(45deg, transparent 30%, rgba(0, 255, 136, 0.08) 50%, transparent 70%)',
                    transform: 'translateX(-100%)',
                    animation: 'shimmer 4s infinite',
                  }
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 800, 
                      mb: { xs: 2, sm: 3, md: 4 },
                      background: 'linear-gradient(135deg, #00ff88 0%, #00e676 50%, #ffffff 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.2rem', lg: '2.8rem' },
                      textTransform: 'uppercase',
                      letterSpacing: { xs: '0.5px', sm: '1px', md: '2px' },
                      lineHeight: { xs: 1.3, sm: 1.2, md: 1.1 },
                      px: { xs: 1, sm: 0 }
                    }}
                  >
                    Ready to Transform Your Career?
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: { xs: 3, sm: 4, md: 5, lg: 6 }, 
                      color: 'rgba(255, 255, 255, 0.9)', 
                      maxWidth: { xs: '100%', sm: 600, md: 700 }, 
                      mx: 'auto',
                      fontSize: { xs: '0.9rem', sm: '1rem', md: '1.2rem', lg: '1.3rem' },
                      lineHeight: { xs: 1.5, sm: 1.6 },
                      fontWeight: 300,
                      px: { xs: 1, sm: 2, md: 0 }
                    }}
                  >
                    Join thousands of professionals who have found their perfect match. Your dream job is just one click away.
                  </Typography>
                  
                  <motion.div
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Button
                      component={Link}
                      to="/register"
                      variant="contained"
                      size="large"
                      endIcon={<ArrowForward />}
                      sx={{
                        background: '#00ff88',
                        color: '#000000',
                        px: { xs: 3, sm: 4, md: 5, lg: 6 },
                        py: { xs: 1.5, sm: 2, md: 2.5 },
                        fontSize: { xs: '0.85rem', sm: '1rem', md: '1.1rem', lg: '1.2rem' },
                        fontWeight: 700,
                        borderRadius: 0,
                        border: '2px solid #00ff88',
                        boxShadow: '0 8px 30px rgba(0, 255, 136, 0.5)',
                        textTransform: 'uppercase',
                        letterSpacing: { xs: '0.5px', sm: '1px' },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        minWidth: { xs: '220px', sm: '250px', md: 'auto' },
                        width: { xs: '90%', sm: 'auto' },
                        maxWidth: { xs: '300px', sm: 'none' },
                        '&:hover': {
                          background: 'transparent',
                          color: '#00ff88',
                          boxShadow: '0 12px 40px rgba(0, 255, 136, 0.7)',
                          transform: 'translateY(-3px)',
                        }
                      }}
                    >
                      Start Your Journey Today
                    </Button>
                  </motion.div>

                  <Box sx={{ 
                    mt: { xs: 3, sm: 4, md: 5, lg: 6 }, 
                    display: 'flex', 
                    justifyContent: 'center', 
                    flexWrap: 'wrap', 
                    gap: { xs: 1.5, sm: 2, md: 3, lg: 4 },
                    px: { xs: 1, sm: 2, md: 0 }
                  }}>
                    {benefits.slice(3).map((benefit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5 + index * 0.2 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: { xs: 1, sm: 1.5, md: 2 },
                            p: { xs: 1, sm: 1.5, md: 2 },
                            borderRadius: 0,
                            background: 'rgba(0, 255, 136, 0.12)',
                            border: '1px solid rgba(0, 255, 136, 0.4)',
                            transition: 'all 0.3s ease',
                            minWidth: { xs: '140px', sm: 'auto' },
                            '&:hover': {
                              background: 'rgba(0, 255, 136, 0.25)',
                            }
                          }}
                        >
                          <CheckCircle sx={{ color: '#00ff88', fontSize: { xs: 20, sm: 22, md: 24 } }} />
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              color: '#ffffff',
                              fontWeight: 500,
                              fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.95rem', lg: '1rem' },
                              lineHeight: { xs: 1.3, sm: 1.4 }
                            }}
                          >
                            {benefit}
                          </Typography>
                        </Box>
                      </motion.div>
                    ))}
                  </Box>
                </Box>
              </Box>
            </motion.div>
          </AnimatedCard>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;