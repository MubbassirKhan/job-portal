import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
  InputAdornment,
  IconButton,
  Grid,
} from '@mui/material';
import { 
  AdminPanelSettings, 
  Person, 
  Email, 
  Lock, 
  Visibility, 
  VisibilityOff,
  Login as LoginIcon,
  ArrowForward,
  Security,
  Work as WorkIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout, loading } = useAuth();
  const [error, setError] = useState('');
  const [loginType, setLoginType] = useState(0); // 0 for candidate, 1 for recruiter
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setError('');
    const result = await login(data.email, data.password);
    
    if (result.success) {
      // Check if the logged-in user's role matches the selected login type
      const user = result.user;
      const expectedRole = loginType === 0 ? 'candidate' : 'recruiter';
      
      if (user && user.role !== expectedRole && !(loginType === 1 && user.role === 'admin')) {
        // Logout the user immediately since they used the wrong tab
        // Allow admin users to login through recruiter tab (loginType === 1)
        logout();
        setError(`This account is registered as ${user.role === 'candidate' ? 'Job Seeker' : 'Recruiter'}. Please use the correct login tab.`);
        return; // Don't navigate if wrong role
      }
      
      // Navigate to appropriate dashboard based on user role
      const defaultRoute = (user.role === 'recruiter' || user.role === 'admin') ? '/dashboard' : '/dashboard';
      const from = location.state?.from?.pathname || defaultRoute;
      navigate(from, { replace: true });
    } else {
      setError(result.message);
    }
  };

  const handleTabChange = (event, newValue) => {
    setLoginType(newValue);
    setError(''); // Clear any existing errors when switching tabs
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, delay: 0.2 }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 4,
      }}
    >
      <Container component="main" maxWidth="lg">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Grid container spacing={0} sx={{ minHeight: '600px' }}>
            {/* Left Side - Branding */}
            <Grid 
              item 
              xs={12} 
              md={6} 
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                borderRadius: { xs: '20px 20px 0 0', md: '20px 0 0 20px' },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: 4,
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
              <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
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
                      width: 120,
                      height: 120,
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <WorkIcon sx={{ fontSize: 60 }} />
                  </Box>
                </motion.div>
                
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
                  Welcome Back
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 4, maxWidth: 300 }}>
                  Sign in to continue your job search journey or manage your job postings
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Security sx={{ fontSize: 20 }} />
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Secure Login
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LoginIcon sx={{ fontSize: 20 }} />
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Quick Access
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Right Side - Form */}
            <Grid 
              item 
              xs={12} 
              md={6}
              sx={{
                background: 'white',
                borderRadius: { xs: '0 0 20px 20px', md: '0 20px 20px 0' },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                p: 4,
              }}
            >
              <motion.div
                variants={formVariants}
                initial="hidden"
                animate="visible"
                style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}
              >
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    Sign In
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Choose your account type and sign in
                  </Typography>
                </Box>
                
                {/* Login Type Tabs */}
                <Box sx={{ mb: 3 }}>
                  <Tabs 
                    value={loginType} 
                    onChange={handleTabChange} 
                    centered
                    sx={{
                      '& .MuiTabs-indicator': {
                        background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                        height: 3,
                        borderRadius: '2px',
                      }
                    }}
                  >
                    <Tab 
                      icon={<Person />} 
                      label={
                        <Chip 
                          label="Job Seeker" 
                          color={loginType === 0 ? "primary" : "default"}
                          variant={loginType === 0 ? "filled" : "outlined"}
                          sx={{ 
                            minWidth: 120,
                            fontWeight: 500,
                            ...(loginType === 0 && {
                              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                              color: 'white',
                            })
                          }}
                        />
                      } 
                    />
                    <Tab 
                      icon={<AdminPanelSettings />} 
                      label={
                        <Chip 
                          label="Recruiter" 
                          color={loginType === 1 ? "secondary" : "default"}
                          variant={loginType === 1 ? "filled" : "outlined"}
                          sx={{ 
                            minWidth: 120,
                            fontWeight: 500,
                            ...(loginType === 1 && {
                              background: 'linear-gradient(135deg, #ec4899 0%, #6366f1 100%)',
                              color: 'white',
                            })
                          }}
                        />
                      } 
                    />
                  </Tabs>
                </Box>
                
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 2,
                        borderRadius: '12px',
                        '& .MuiAlert-message': {
                          fontSize: '0.875rem',
                        }
                      }}
                    >
                      {error}
                    </Alert>
                  </motion.div>
                )}

                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                  <TextField
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                        message: 'Enter a valid email address',
                      },
                    })}
                    margin="normal"
                    fullWidth
                    label="Email Address"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#6366f1',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#6366f1',
                        },
                      }
                    }}
                  />
                  
                  <TextField
                    {...register('password', {
                      required: 'Password is required',
                    })}
                    margin="normal"
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={togglePasswordVisibility}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#6366f1',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#6366f1',
                        },
                      }
                    }}
                  />

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={loading}
                      endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
                      sx={{
                        mt: 3,
                        mb: 2,
                        py: 1.5,
                        background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                        borderRadius: '12px',
                        fontWeight: 600,
                        fontSize: '1rem',
                        textTransform: 'none',
                        boxShadow: '0 8px 30px rgba(99, 102, 241, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #4f46e5 0%, #db2777 100%)',
                          boxShadow: '0 12px 40px rgba(99, 102, 241, 0.4)',
                        },
                        '&:disabled': {
                          background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                        }
                      }}
                    >
                      {loading ? 'Signing In...' : `Sign In as ${loginType === 0 ? 'Job Seeker' : 'Recruiter'}`}
                    </Button>
                  </motion.div>

                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Link 
                      component={RouterLink} 
                      to="/forgot-password" 
                      sx={{ 
                        color: '#6366f1',
                        textDecoration: 'none',
                        fontWeight: 500,
                        '&:hover': {
                          textDecoration: 'underline',
                        }
                      }}
                    >
                      Forgot password?
                    </Link>
                  </Box>
                  
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Don't have an account?{' '}
                      <Link 
                        component={RouterLink} 
                        to="/register"
                        sx={{ 
                          color: '#6366f1',
                          textDecoration: 'none',
                          fontWeight: 600,
                          '&:hover': {
                            textDecoration: 'underline',
                          }
                        }}
                      >
                        Sign up here
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Login;