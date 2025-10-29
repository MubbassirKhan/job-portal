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
  Work as WorkIcon,
  Google
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

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
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }
  
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 136, 0.3); }
    50% { box-shadow: 0 0 40px rgba(0, 255, 136, 0.6); }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = globalStyles;
  document.head.appendChild(styleSheet);
}

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
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 4,
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
      }}
    >
      <Container component="main" maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pt: 6, pb: 2 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Grid container spacing={0} sx={{ minHeight: '500px' }}>
            {/* Left Side - Branding */}
            <Grid 
              item 
              xs={12} 
              md={6} 
              sx={{
                background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(0, 0, 0, 0.8) 50%, rgba(0, 255, 136, 0.15) 100%)',
                borderRadius: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: { xs: 2, md: 2 },
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                border: '2px solid #00ff88',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%2300ff88" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
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
                      width: { xs: 100, md: 120 },
                      height: { xs: 100, md: 120 },
                      background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.3) 0%, rgba(0, 230, 118, 0.2) 50%, rgba(0, 255, 136, 0.1) 100%)',
                      borderRadius: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: { xs: 2, md: 3 },
                      backdropFilter: 'blur(15px)',
                      border: '3px solid #00ff88',
                      color: '#00ff88',
                      filter: 'drop-shadow(0 0 30px rgba(0, 255, 136, 0.8))',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(45deg, transparent 30%, rgba(0, 255, 136, 0.1) 50%, transparent 70%)',
                        animation: 'shimmer 3s ease-in-out infinite',
                      }
                    }}
                  >
                    <WorkIcon sx={{ fontSize: { xs: 50, md: 60 }, color: '#00ff88', position: 'relative', zIndex: 1 }} />
                  </Box>
                </motion.div>
                
                <Typography variant="h3" sx={{ 
                  fontWeight: 900, 
                  mb: { xs: 1, md: 2 },
                  fontSize: { xs: '1.8rem', sm: '2.2rem', md: '3rem' },
                  background: 'linear-gradient(135deg, #00ff88 0%, #00e676 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  textShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
                  letterSpacing: '1px'
                }}>
                  Welcome Back
                </Typography>
                <Typography variant="h6" sx={{ 
                  opacity: 0.95, 
                  mb: { xs: 2, md: 3 }, 
                  maxWidth: 320, 
                  fontSize: { xs: '1rem', sm: '1.05rem', md: '1.1rem' },
                  fontWeight: 400,
                  lineHeight: 1.4,
                  color: 'rgba(255, 255, 255, 0.9)',
                  textAlign: 'center'
                }}>
                  Sign in to continue your job search journey or manage your job postings
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1.5, sm: 2 }, alignItems: 'center', justifyContent: 'center' }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5,
                    p: 1.2,
                    borderRadius: 0,
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    backgroundColor: 'rgba(0, 255, 136, 0.05)',
                    minWidth: { xs: 140, sm: 120 },
                    justifyContent: 'center'
                  }}>
                    <Security sx={{ fontSize: { xs: 20, sm: 22 }, color: '#00ff88' }} />
                    <Typography variant="body2" sx={{ 
                      opacity: 0.95, 
                      fontSize: { xs: '0.8rem', sm: '0.85rem' },
                      fontWeight: 500 
                    }}>
                      Secure Login
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5,
                    p: 1.2,
                    borderRadius: 0,
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    backgroundColor: 'rgba(0, 255, 136, 0.05)',
                    minWidth: { xs: 140, sm: 120 },
                    justifyContent: 'center'
                  }}>
                    <LoginIcon sx={{ fontSize: { xs: 20, sm: 22 }, color: '#00ff88' }} />
                    <Typography variant="body2" sx={{ 
                      opacity: 0.95, 
                      fontSize: { xs: '0.8rem', sm: '0.85rem' },
                      fontWeight: 500 
                    }}>
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
                background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(0, 0, 0, 0.95) 100%)',
                borderRadius: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                p: { xs: 2, sm: 3, md: 3 },
                border: '2px solid #00ff88',
                borderLeft: { xs: '2px solid #00ff88', md: 'none' },
                borderTop: { xs: 'none', md: '2px solid #00ff88' },
              }}
            >
              <motion.div
                variants={formVariants}
                initial="hidden"
                animate="visible"
                style={{ width: '100%', maxWidth: '400px', margin: '0 auto', padding: '0 8px' }}
              >
                <Box sx={{ textAlign: 'center', mb: { xs: 2, md: 3 } }}>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 700, 
                    mb: 0.5, 
                    color: '#ffffff',
                    fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.8rem' }
                  }}>
                    Sign In
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)', 
                    fontSize: { xs: '0.8rem', sm: '0.85rem' }
                  }}>
                    Choose your account type and sign in
                  </Typography>
                </Box>
                
                {/* Login Type Tabs */}
                <Box sx={{ mb: { xs: 2, md: 3 } }}>
                  <Tabs 
                    value={loginType} 
                    onChange={handleTabChange} 
                    centered
                    variant="fullWidth"
                    sx={{
                      '& .MuiTabs-indicator': {
                        background: '#00ff88',
                        height: 3,
                        borderRadius: '2px',
                      },
                      '& .MuiTab-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: { xs: '0.8rem', sm: '0.9rem' },
                        minHeight: { xs: 60, sm: 72 },
                        '&.Mui-selected': {
                          color: '#00ff88',
                        }
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
                            minWidth: { xs: 90, sm: 110, md: 120 },
                            fontWeight: 500,
                            fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
                            ...(loginType === 0 && {
                              background: '#00ff88',
                              color: '#000000',
                            }),
                            ...(loginType !== 0 && {
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                              color: 'rgba(255, 255, 255, 0.7)',
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
                            minWidth: { xs: 90, sm: 110, md: 120 },
                            fontWeight: 500,
                            fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
                            ...(loginType === 1 && {
                              background: '#00ff88',
                              color: '#000000',
                            }),
                            ...(loginType !== 1 && {
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                              color: 'rgba(255, 255, 255, 0.7)',
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
                    fullWidth
                    placeholder="Email Address"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: '#00ff88' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 1.5,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        border: '2px solid rgba(0, 255, 136, 0.3)',
                        backdropFilter: 'blur(10px)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: 'none',
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          borderColor: '#00ff88',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 15px rgba(0, 255, 136, 0.2)',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          borderColor: '#00ff88',
                          boxShadow: '0 0 20px rgba(0, 255, 136, 0.4)',
                          transform: 'translateY(-1px)',
                        },
                        '&.Mui-error': {
                          borderColor: '#ff4444',
                          '&:hover, &.Mui-focused': {
                            borderColor: '#ff4444',
                            boxShadow: '0 0 20px rgba(255, 68, 68, 0.3)',
                          }
                        }
                      },
                      '& .MuiOutlinedInput-input': {
                        color: '#ffffff',
                        padding: { xs: '12px 14px', sm: '14px' },
                        fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
                        fontWeight: 400,
                        '&::placeholder': {
                          color: 'rgba(255, 255, 255, 0.6)',
                          opacity: 1,
                        }
                      },
                      '& .MuiFormHelperText-root': {
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.75rem',
                        marginLeft: '14px',
                        '&.Mui-error': {
                          color: '#ff4444',
                        }
                      }
                    }}
                  />
                  
                  <TextField
                    {...register('password', {
                      required: 'Password is required',
                    })}
                    fullWidth
                    placeholder="Password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: '#00ff88' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={togglePasswordVisibility}
                            edge="end"
                            sx={{ color: '#00ff88' }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        border: '2px solid rgba(0, 255, 136, 0.3)',
                        backdropFilter: 'blur(10px)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: 'none',
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          borderColor: '#00ff88',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 15px rgba(0, 255, 136, 0.2)',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          borderColor: '#00ff88',
                          boxShadow: '0 0 20px rgba(0, 255, 136, 0.4)',
                          transform: 'translateY(-1px)',
                        },
                        '&.Mui-error': {
                          borderColor: '#ff4444',
                          '&:hover, &.Mui-focused': {
                            borderColor: '#ff4444',
                            boxShadow: '0 0 20px rgba(255, 68, 68, 0.3)',
                          }
                        }
                      },
                      '& .MuiOutlinedInput-input': {
                        color: '#ffffff',
                        padding: { xs: '12px 14px', sm: '14px' },
                        fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
                        fontWeight: 400,
                        '&::placeholder': {
                          color: 'rgba(255, 255, 255, 0.6)',
                          opacity: 1,
                        }
                      },
                      '& .MuiFormHelperText-root': {
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.75rem',
                        marginLeft: '14px',
                        '&.Mui-error': {
                          color: '#ff4444',
                        }
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
                        mt: { xs: 2, md: 3 },
                        mb: 1,
                        py: { xs: 1.2, sm: 1.4, md: 1.5 },
                        background: '#00ff88',
                        color: '#000000',
                        borderRadius: 0,
                        fontWeight: 700,
                        fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        border: '2px solid #00ff88',
                        boxShadow: '0 8px 30px rgba(0, 255, 136, 0.4)',
                        '&:hover': {
                          background: 'transparent',
                          color: '#00ff88',
                          boxShadow: '0 12px 40px rgba(0, 255, 136, 0.6)',
                        },
                        '&:disabled': {
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: 'rgba(255, 255, 255, 0.3)',
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                        }
                      }}
                    >
                      {loading ? 'Signing In...' : `Sign In as ${loginType === 0 ? 'Job Seeker' : 'Recruiter'}`}
                    </Button>
                  </motion.div>

                  {/* Google Login Section */}
                  <Box sx={{ mt: { xs: 2, md: 3 }, mb: { xs: 2, md: 3 }, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.2)' }} />
                    <Typography variant="body2" sx={{ 
                      color: 'rgba(255, 255, 255, 0.6)', 
                      px: 2,
                      fontSize: { xs: '0.75rem', sm: '0.8rem' }
                    }}>
                      OR
                    </Typography>
                    <Box sx={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.2)' }} />
                  </Box>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Google />}
                      sx={{
                        py: { xs: 1.2, sm: 1.4, md: 1.5 },
                        borderRadius: 0,
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        color: '#ffffff',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        fontWeight: 600,
                        fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
                        textTransform: 'none',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          borderColor: '#ffffff',
                          color: '#ffffff',
                        },
                      }}
                      onClick={() => {
                        // Add Google OAuth logic here
                        console.log('Google login clicked');
                        // You can integrate with Google OAuth here
                      }}
                    >
                      Continue with Google
                    </Button>
                  </motion.div>

                  <Box sx={{ textAlign: 'center', mt: { xs: 2, md: 3 } }}>
                    <Link 
                      component={RouterLink} 
                      to="/forgot-password" 
                      sx={{ 
                        color: '#00ff88',
                        textDecoration: 'none',
                        fontWeight: 500,
                        fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
                        '&:hover': {
                          textDecoration: 'underline',
                        }
                      }}
                    >
                      Forgot password?
                    </Link>
                  </Box>
                  
                  <Box sx={{ textAlign: 'center', mt: { xs: 1.5, md: 2 } }}>
                    <Typography variant="body2" sx={{ 
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' }
                    }}>
                      Don't have an account?{' '}
                      <Link 
                        component={RouterLink} 
                        to="/register"
                        sx={{ 
                          color: '#00ff88',
                          textDecoration: 'none',
                          fontWeight: 600,
                          fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' },
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