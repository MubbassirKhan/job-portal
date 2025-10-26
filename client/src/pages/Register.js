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
  InputLabel,
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
  Work as WorkIcon
} from '@mui/icons-material';

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
  const selectedRole = watch('role');

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
          <Grid container spacing={0} sx={{ minHeight: '700px' }}>
            {/* Left Side - Branding */}
            <Grid 
              item 
              xs={12} 
              md={5} 
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
                    <PersonAdd sx={{ fontSize: 60 }} />
                  </Box>
                </motion.div>
                
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
                  Join JobPortal
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 4, maxWidth: 300 }}>
                  Create your account and start your career journey or find the perfect candidates
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ fontSize: 20 }} />
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Free to join
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Security sx={{ fontSize: 20 }} />
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Secure & Private
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WorkIcon sx={{ fontSize: 20 }} />
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Thousands of opportunities
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
                style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}
              >
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    Create Account
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
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

                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                  <Grid container spacing={2}>
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
                        label="First Name"
                        error={!!errors.firstName}
                        helperText={errors.firstName?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                          }
                        }}
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
                        label="Last Name"
                        error={!!errors.lastName}
                        helperText={errors.lastName?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                          }
                        }}
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
                        label="Email Address"
                        type="email"
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
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Account Type</InputLabel>
                        <Select
                          {...register('role', { required: 'Account type is required' })}
                          label="Account Type"
                          defaultValue="candidate"
                          error={!!errors.role}
                          sx={{
                            borderRadius: '12px',
                          }}
                          startAdornment={
                            <InputAdornment position="start">
                              {selectedRole === 'recruiter' ? (
                                <AdminPanelSettings sx={{ color: 'text.secondary', ml: 1 }} />
                              ) : (
                                <AccountCircle sx={{ color: 'text.secondary', ml: 1 }} />
                              )}
                            </InputAdornment>
                          }
                        >
                          <MenuItem value="candidate">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AccountCircle />
                              Job Seeker
                            </Box>
                          </MenuItem>
                          <MenuItem value="recruiter">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AdminPanelSettings />
                              Recruiter
                            </Box>
                          </MenuItem>
                        </Select>
                        {errors.role && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
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
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
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
                          }
                        }}
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
                        label="Confirm Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle confirm password visibility"
                                onClick={toggleConfirmPasswordVisibility}
                                edge="end"
                              >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                          }
                        }}
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
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </motion.div>

                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Already have an account?{' '}
                      <Link 
                        component={RouterLink} 
                        to="/login"
                        sx={{ 
                          color: '#6366f1',
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