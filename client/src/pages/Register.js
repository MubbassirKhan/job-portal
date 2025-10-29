import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  Grid,
  FormControl,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { 
  Link as RouterLink, 
  useNavigate, 
  useLocation 
} from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  Person,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  AccountCircle,
  AdminPanelSettings,
  CheckCircle,
  PersonAdd,
  ArrowForward,
  Security,
  Work as WorkIcon,
  Google
} from '@mui/icons-material';

// Common input field styling
const inputFieldStyles = {
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
    padding: '12px 14px',
    fontSize: '0.95rem',
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
  },
  '& .MuiSelect-root': {
    color: '#ffffff',
  },
  '& .MuiSelect-icon': {
    color: '#00ff88',
  },
};

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
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = globalStyles;
  document.head.appendChild(styleSheet);
}

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register: registerUser, loading } = useAuth();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setError('');
    const result = await registerUser(data);
    
    if (result.success) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } else {
      setError(result.message);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
              md={5} 
              sx={{
                background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(0, 0, 0, 0.8) 50%, rgba(0, 255, 136, 0.15) 100%)',
                borderRadius: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: 2,
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
                      width: 120,
                      height: 120,
                      background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.3) 0%, rgba(0, 230, 118, 0.2) 50%, rgba(0, 255, 136, 0.1) 100%)',
                      borderRadius: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
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
                    <PersonAdd sx={{ fontSize: 60, color: '#00ff88', position: 'relative', zIndex: 1 }} />
                  </Box>
                </motion.div>
                
                <Typography variant="h3" sx={{ 
                  fontWeight: 900, 
                  mb: 2,
                  background: 'linear-gradient(135deg, #00ff88 0%, #00e676 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  textShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
                  letterSpacing: '1px'
                }}>
                  Join TalentHub
                </Typography>
                <Typography variant="h6" sx={{ 
                  opacity: 0.95, 
                  mb: 3, 
                  maxWidth: 320, 
                  fontSize: '1.1rem',
                  fontWeight: 400,
                  lineHeight: 1.4,
                  color: 'rgba(255, 255, 255, 0.9)'
                }}>
                  Create your account and start your career journey or find the perfect candidates
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    p: 1.5,
                    borderRadius: 0,
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    backgroundColor: 'rgba(0, 255, 136, 0.05)',
                    minWidth: 200,
                    justifyContent: 'flex-start'
                  }}>
                    <CheckCircle sx={{ fontSize: 24, color: '#00ff88' }} />
                    <Typography variant="body2" sx={{ 
                      opacity: 0.95, 
                      fontSize: '0.9rem',
                      fontWeight: 500 
                    }}>
                      Free to join
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    p: 1.5,
                    borderRadius: 0,
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    backgroundColor: 'rgba(0, 255, 136, 0.05)',
                    minWidth: 200,
                    justifyContent: 'flex-start'
                  }}>
                    <Security sx={{ fontSize: 24, color: '#00ff88' }} />
                    <Typography variant="body2" sx={{ 
                      opacity: 0.95, 
                      fontSize: '0.9rem',
                      fontWeight: 500 
                    }}>
                      Secure & Private
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    p: 1.5,
                    borderRadius: 0,
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    backgroundColor: 'rgba(0, 255, 136, 0.05)',
                    minWidth: 200,
                    justifyContent: 'flex-start'
                  }}>
                    <WorkIcon sx={{ fontSize: 24, color: '#00ff88' }} />
                    <Typography variant="body2" sx={{ 
                      opacity: 0.95, 
                      fontSize: '0.9rem',
                      fontWeight: 500 
                    }}>
                      Thousands of jobs
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Right Side - Form */}
            <Grid 
              item 
              xs={12} 
              md={7}
              sx={{
                background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(0, 0, 0, 0.95) 100%)',
                borderRadius: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                p: 3,
                border: '2px solid #00ff88',
                borderLeft: { xs: '2px solid #00ff88', md: 'none' },
                borderTop: { xs: 'none', md: '2px solid #00ff88' },
              }}
            >
              <motion.div
                variants={formVariants}
                initial="hidden"
                animate="visible"
                style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}
              >
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: '#ffffff' }}>
                    Create Account
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>
                    Fill in your details to get started
                  </Typography>
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
                        mb: 3,
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

                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 0 }}>
                  <Grid container spacing={1.5}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...register('firstName', {
                          required: 'First name is required',
                          minLength: {
                            value: 2,
                            message: 'First name must be at least 2 characters',
                          },
                        })}
                        fullWidth
                        placeholder="First Name"
                        error={!!errors.firstName}
                        helperText={errors.firstName?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person sx={{ color: '#00ff88' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={inputFieldStyles}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...register('lastName', {
                          required: 'Last name is required',
                          minLength: {
                            value: 2,
                            message: 'Last name must be at least 2 characters',
                          },
                        })}
                        fullWidth
                        placeholder="Last Name"
                        error={!!errors.lastName}
                        helperText={errors.lastName?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person sx={{ color: '#00ff88' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={inputFieldStyles}
                      />
                    </Grid>
                    <Grid item xs={12}>
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
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email sx={{ color: '#00ff88' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={inputFieldStyles}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth sx={inputFieldStyles}>
                        <Select
                          {...register('role', { required: 'Account type is required' })}
                          displayEmpty
                          defaultValue="candidate"
                          error={!!errors.role}
                          sx={{
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: 'none',
                            },
                            '& .MuiSelect-select': {
                              color: '#ffffff',
                              padding: '12px 14px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }
                          }}
                          renderValue={(selected) => {
                            if (!selected) {
                              return <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Select Account Type</span>;
                            }
                            return (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {selected === 'recruiter' ? (
                                  <>
                                    <AdminPanelSettings sx={{ color: '#00ff88' }} />
                                    Recruiter
                                  </>
                                ) : (
                                  <>
                                    <AccountCircle sx={{ color: '#00ff88' }} />
                                    Job Seeker
                                  </>
                                )}
                              </Box>
                            );
                          }}
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                bgcolor: 'rgba(26, 26, 26, 0.95)',
                                backdropFilter: 'blur(10px)',
                                border: '2px solid rgba(0, 255, 136, 0.3)',
                                borderRadius: 0,
                                '& .MuiMenuItem-root': {
                                  color: '#ffffff',
                                  '&:hover': {
                                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                                  },
                                  '&.Mui-selected': {
                                    backgroundColor: 'rgba(0, 255, 136, 0.2)',
                                    '&:hover': {
                                      backgroundColor: 'rgba(0, 255, 136, 0.3)',
                                    }
                                  }
                                }
                              }
                            }
                          }}
                        >
                          <MenuItem value="candidate">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AccountCircle sx={{ color: '#00ff88' }} />
                              Job Seeker
                            </Box>
                          </MenuItem>
                          <MenuItem value="recruiter">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AdminPanelSettings sx={{ color: '#00ff88' }} />
                              Recruiter
                            </Box>
                          </MenuItem>
                        </Select>
                        {errors.role && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2, fontSize: '0.75rem' }}>
                            {errors.role.message}
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        {...register('password', {
                          required: 'Password is required',
                          minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters',
                          },
                        })}
                        fullWidth
                        placeholder="Password"
                        type={showPassword ? 'text' : 'password'}
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
                        sx={inputFieldStyles}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        {...register('confirmPassword', {
                          required: 'Please confirm your password',
                          validate: (value) =>
                            value === password || 'Passwords do not match',
                        })}
                        fullWidth
                        placeholder="Confirm Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock sx={{ color: '#00ff88' }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle confirm password visibility"
                                onClick={toggleConfirmPasswordVisibility}
                                edge="end"
                                sx={{ color: '#00ff88' }}
                              >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={inputFieldStyles}
                      />
                    </Grid>
                  </Grid>

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
                        mt: 2,
                        mb: 1,
                        py: 1.2,
                        background: '#00ff88',
                        color: '#000000',
                        borderRadius: 0,
                        fontWeight: 700,
                        fontSize: '1rem',
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
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </motion.div>

                  {/* Google Login Section */}
                  <Box sx={{ mt: 3, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.2)' }} />
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', px: 2 }}>
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
                        py: 1.5,
                        borderRadius: 0,
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        color: '#ffffff',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        fontWeight: 600,
                        fontSize: '1rem',
                        textTransform: 'none',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        mb: 2,
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          borderColor: '#ffffff',
                          color: '#ffffff',
                        },
                      }}
                      onClick={() => {
                        // Add Google OAuth logic here
                        console.log('Google signup clicked');
                        // You can integrate with Google OAuth here
                      }}
                    >
                      Sign up with Google
                    </Button>
                  </motion.div>

                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      Already have an account?{' '}
                      <Link 
                        component={RouterLink} 
                        to="/login"
                        sx={{ 
                          color: '#00ff88',
                          textDecoration: 'none',
                          fontWeight: 600,
                          '&:hover': {
                            textDecoration: 'underline',
                          }
                        }}
                      >
                        Sign in here
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

export default Register;