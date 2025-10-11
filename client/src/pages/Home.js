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
  Assignment
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { motion, useAnimation, useInView } from 'framer-motion';

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
    { value: 5000, label: 'Active Jobs', icon: <BusinessCenter /> },
    { value: 1200, label: 'Partner Companies', icon: <Work /> },
    { value: 25000, label: 'Success Stories', icon: <People /> },
    { value: 98, label: 'Satisfaction Rate', suffix: '%', icon: <Assignment /> },
  ];

  return (
    <>
      {/* Hero Section with Animated Background */}
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            animation: 'float 20s ease-in-out infinite',
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} lg={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 800,
                    color: 'white',
                    mb: 3,
                    fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                    lineHeight: 1.1,
                  }}
                >
                  Find Your{' '}
                  <Box
                    component="span"
                    sx={{
                      background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      position: 'relative',
                    }}
                  >
                    Dream Job
                  </Box>
                </Typography>
                
                <Typography
                  variant="h5"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    mb: 4,
                    lineHeight: 1.6,
                    fontWeight: 400,
                  }}
                >
                  Connect with top employers worldwide and discover opportunities that align with your passions and expertise.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      component={Link}
                      to="/jobs"
                      variant="contained"
                      size="large"
                      endIcon={<ArrowForward />}
                      sx={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                        color: 'white',
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 8px 30px rgba(99, 102, 241, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #4f46e5 0%, #db2777 100%)',
                          boxShadow: '0 12px 40px rgba(99, 102, 241, 0.4)',
                        }
                      }}
                    >
                      Explore Jobs
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      component={Link}
                      to="/register"
                      variant="outlined"
                      size="large"
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        borderRadius: '12px',
                        borderWidth: 2,
                        '&:hover': {
                          borderColor: 'white',
                          background: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(10px)',
                        }
                      }}
                    >
                      Get Started Free
                    </Button>
                  </motion.div>
                </Box>

                <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                  {benefits.slice(0, 3).map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 + index * 0.2 }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                          {benefit}
                        </Typography>
                      </Box>
                    </motion.div>
                  ))}
                </Box>
              </motion.div>
            </Grid>

            <Grid item xs={12} lg={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <motion.div
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                      scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    <Box
                      sx={{
                        width: { xs: 300, md: 400 },
                        height: { xs: 300, md: 400 },
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                        borderRadius: '50%',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                      }}
                    >
                      <Work sx={{ fontSize: { xs: 120, md: 150 }, color: 'rgba(255, 255, 255, 0.8)' }} />
                    </Box>
                  </motion.div>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <AnimatedCard>
          <Box textAlign="center" sx={{ mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                mb: 2,
                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Why Choose JobPortal?
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Everything you need to accelerate your career journey
            </Typography>
          </Box>
        </AnimatedCard>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={6} lg={3} key={index}>
              <AnimatedCard delay={index * 0.2}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 3,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    transition: 'all 0.3s ease-in-out',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '4px',
                      background: `linear-gradient(90deg, ${feature.color} 0%, ${feature.color}80 100%)`,
                    },
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 20px 40px ${feature.color}20`,
                      borderColor: feature.color,
                    },
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '20px',
                        background: `linear-gradient(135deg, ${feature.color}20 0%, ${feature.color}10 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                        color: feature.color,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Stats Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          py: 8,
          position: 'relative',
        }}
      >
        <Container maxWidth="lg">
          <AnimatedCard>
            <Typography
              variant="h3"
              textAlign="center"
              sx={{ fontWeight: 700, mb: 2 }}
            >
              Trusted by Professionals Worldwide
            </Typography>
            <Typography
              variant="h6"
              textAlign="center"
              color="text.secondary"
              sx={{ mb: 6 }}
            >
              Join thousands who have transformed their careers
            </Typography>
          </AnimatedCard>

          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <AnimatedCard delay={index * 0.1}>
                  <Paper
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      borderRadius: '20px',
                      background: 'white',
                      border: '1px solid',
                      borderColor: 'grey.100',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                      }
                    }}
                  >
                    <Box
                      sx={{
                        color: '#6366f1',
                        mb: 2,
                        display: 'flex',
                        justifyContent: 'center',
                      }}
                    >
                      {React.cloneElement(stat.icon, { sx: { fontSize: 40 } })}
                    </Box>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1,
                      }}
                    >
                      <AnimatedCounter target={stat.value} />
                      {stat.suffix || '+'}
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {stat.label}
                    </Typography>
                  </Paper>
                </AnimatedCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <AnimatedCard>
          <Box
            sx={{
              textAlign: 'center',
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              borderRadius: '24px',
              p: 8,
              color: 'white',
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
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
                Ready to Transform Your Career?
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
                Join thousands of professionals who have found their perfect match. Your dream job is just one click away.
              </Typography>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{
                    background: 'white',
                    color: '#6366f1',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: '12px',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.95)',
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
                    }
                  }}
                >
                  Start Your Journey Today
                </Button>
              </motion.div>

              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 3 }}>
                {benefits.slice(3).map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 + index * 0.2 }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                        {benefit}
                      </Typography>
                    </Box>
                  </motion.div>
                ))}
              </Box>
            </Box>
          </Box>
        </AnimatedCard>
      </Container>
    </>
  );
};

export default Home;