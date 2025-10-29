import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Container,
  Chip,
} from '@mui/material';
import { 
  Work, 
  Dashboard as DashboardIcon,
  Person,
  ExitToApp,
  Menu as MenuIcon,
  Close
} from '@mui/icons-material';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationCenter from './NotificationCenter';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mobile menu button style
  const getMobileButtonStyle = (path) => ({
    justifyContent: 'flex-start',
    py: 2,
    px: 3,
    mx: 2,
    my: 0.5,
    color: isActive(path) ? '#00ff88' : 'rgba(255, 255, 255, 0.85)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: isActive(path) ? 700 : 600,
    borderRadius: 0,
    border: isActive(path) ? '1px solid rgba(0, 255, 136, 0.5)' : '1px solid transparent',
    background: isActive(path) ? 'rgba(0, 255, 136, 0.15)' : 'transparent',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      background: 'rgba(0, 255, 136, 0.1)',
      color: '#00ff88',
      border: '1px solid rgba(0, 255, 136, 0.6)',
      transform: 'translateX(4px)',
    }
  });

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const handleProfileClick = () => {
    handleClose();
    setMobileMenuOpen(false);
    navigate('/profile');
  };

  const handleDashboardClick = () => {
    handleClose();
    setMobileMenuOpen(false);
    navigate('/dashboard');
  };

  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const logoVariants = {
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 }
  };

  const isActive = (path) => location.pathname === path;

  const getNavButtonStyle = (path) => ({
    color: isActive(path) ? '#00ff88' : 'rgba(255, 255, 255, 0.85)',
    fontWeight: isActive(path) ? 700 : 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    px: 3,
    py: 1.5,
    borderRadius: 0,
    position: 'relative',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    background: isActive(path) ? 'rgba(0, 255, 136, 0.15)' : 'transparent',
    border: isActive(path) ? '1px solid rgba(0, 255, 136, 0.5)' : '1px solid transparent',
    '&:hover': {
      background: isActive(path) 
        ? 'rgba(0, 255, 136, 0.2)' 
        : 'rgba(0, 255, 136, 0.1)',
      transform: 'translateY(-1px)',
      color: '#00ff88',
      border: '1px solid rgba(0, 255, 136, 0.6)',
      boxShadow: '0 4px 15px rgba(0, 255, 136, 0.3)',
    },
    '&::after': isActive(path) ? {
      content: '""',
      position: 'absolute',
      bottom: '-2px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '30px',
      height: '3px',
      background: 'linear-gradient(135deg, #00ff88 0%, #00e676 100%)',
      borderRadius: 0,
      boxShadow: '0 0 10px rgba(0, 255, 136, 0.6)',
    } : {},
  });

  return (
    <motion.div
      variants={navVariants}
      initial="hidden"
      animate="visible"
    >
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(26, 26, 26, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: '2px solid rgba(0, 255, 136, 0.4)',
          color: '#ffffff',
          zIndex: 1300,
          boxShadow: '0 4px 30px rgba(0, 255, 136, 0.2)',
          transition: 'all 0.3s ease-in-out',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
        }}
      >
          <Container maxWidth={false} sx={{ px: { xs: 1, sm: 2, md: 4 } }}>
            <Toolbar sx={{ 
              py: { xs: 0.5, sm: 1 },
              minHeight: { xs: '64px', sm: '70px' },
              height: { xs: '64px', sm: '70px' },
              justifyContent: 'space-between'
            }}>
              <motion.div
                variants={logoVariants}
                whileHover="hover"
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => navigate('/')}
              >
                <Box
                  sx={{
                    width: { xs: 45, sm: 50 },
                    height: { xs: 45, sm: 50 },
                    background: 'linear-gradient(135deg, #00ff88 0%, #00e676 100%)',
                    borderRadius: 0,
                    border: '2px solid rgba(0, 255, 136, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: { xs: 1, sm: 2 },
                    boxShadow: '0 4px 20px rgba(0, 255, 136, 0.4)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)',
                      transform: 'translateX(-100%)',
                      transition: 'transform 0.6s ease',
                    },
                    '&:hover': {
                      transform: 'translateY(-2px) scale(1.05)',
                      boxShadow: '0 8px 30px rgba(0, 255, 136, 0.6)',
                      '&::before': {
                        transform: 'translateX(100%)',
                      }
                    }
                  }}
                >
                  <Work sx={{ color: 'white', fontSize: { xs: 20, sm: 24 } }} />
                </Box>
                <Typography
                  variant="h4"
                  component="div"
                  sx={{
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #00ff88 0%, #ffffff 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '1.2rem', sm: '1.6rem', md: '1.8rem' },
                    display: { xs: 'none', sm: 'block' },
                    letterSpacing: { xs: '1px', sm: '2px' },
                    textTransform: 'uppercase',
                    textShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: '-2px',
                      left: 0,
                      width: '0%',
                      height: '2px',
                      background: '#00ff88',
                      transition: 'width 0.3s ease',
                    },
                    '&:hover::after': {
                      width: '100%',
                    }
                  }}
                >
                  TalentHub
                </Typography>
              </motion.div>

              <Box sx={{ flexGrow: 1 }} />

              {/* Desktop Navigation */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button
                    component={Link}
                    to="/jobs"
                    sx={getNavButtonStyle('/jobs')}
                  >
                    Jobs
                  </Button>
                </motion.div>

                {isAuthenticated && (
                  <>
                    {/* Social Navigation Items */}
                    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                      <Button
                        component={Link}
                        to="/feed"
                        sx={getNavButtonStyle('/feed')}
                      >
                        Feed
                      </Button>
                    </motion.div>

                    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                      <Button
                        component={Link}
                        to="/connections"
                        sx={getNavButtonStyle('/connections')}
                      >
                        Network
                      </Button>
                    </motion.div>

                    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                      <Button
                        component={Link}
                        to="/messages"
                        sx={getNavButtonStyle('/messages')}
                      >
                        Messages
                      </Button>
                    </motion.div>
                  </>
                )}

                {isAuthenticated ? (
                  <>
                    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                      <Button
                        onClick={handleDashboardClick}
                        sx={getNavButtonStyle('/dashboard')}
                      >
                        Dashboard
                      </Button>
                    </motion.div>

                    {(user?.role === 'recruiter' || user?.role === 'admin') && (
                      <Chip 
                        label="Recruiter"
                        size="small"
                        sx={{
                          background: '#000000',
                          color: 'white',
                          fontWeight: 700,
                          border: '1px solid #22c55e',
                          fontSize: '0.75rem',
                          height: '28px',
                          borderRadius: '14px',
                          boxShadow: '0 2px 10px rgba(34, 197, 94, 0.3)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            background: '#22c55e',
                            transform: 'translateY(-1px) scale(1.02)',
                            boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)',
                          }
                        }}
                      />
                    )}

                    {/* Notification Center */}
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                      <NotificationCenter />
                    </Box>

                    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                      <IconButton
                        size="large"
                        aria-label="account menu"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={handleMenu}
                        sx={{
                          ml: 2,
                          p: 0.5,
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            background: 'rgba(0, 255, 136, 0.1)',
                            transform: 'scale(1.05)',
                          }
                        }}
                      >
                        <Avatar 
                          sx={{ 
                            width: 45, 
                            height: 45,
                            borderRadius: 0,
                            background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                            color: '#00ff88',
                            fontWeight: 800,
                            border: '2px solid #00ff88',
                            fontSize: '1.2rem',
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                            boxShadow: '0 4px 15px rgba(0, 255, 136, 0.4)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              background: 'linear-gradient(45deg, transparent 30%, rgba(0, 255, 136, 0.1) 50%, transparent 70%)',
                              transform: 'translateX(-100%)',
                              transition: 'transform 0.6s ease',
                            },
                            '&:hover': {
                              background: 'linear-gradient(135deg, #00ff88 0%, #00e676 100%)',
                              color: '#000000',
                              transform: 'scale(1.05)',
                              boxShadow: '0 6px 25px rgba(0, 255, 136, 0.6)',
                              '&::before': {
                                transform: 'translateX(100%)',
                              }
                            }
                          }}
                        >
                          {user?.profile?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                        </Avatar>
                      </IconButton>
                    </motion.div>

                    <Menu
                      id="menu-appbar"
                      anchorEl={anchorEl}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      keepMounted
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      open={Boolean(anchorEl)}
                      onClose={handleClose}
                      sx={{
                        '& .MuiPaper-root': {
                          borderRadius: 0,
                          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                          border: '2px solid rgba(0, 255, 136, 0.4)',
                          boxShadow: '0 20px 35px rgba(0, 255, 136, 0.3)',
                          mt: 1,
                          minWidth: 220,
                          backdropFilter: 'blur(10px)',
                        }
                      }}
                    >
                      <MenuItem 
                        onClick={handleProfileClick}
                        sx={{ 
                          py: 1.5, 
                          px: 2,
                          color: '#ffffff',
                          background: 'transparent',
                          borderRadius: 0,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          fontWeight: 600,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'rgba(0, 255, 136, 0.1)',
                            color: '#00ff88',
                            transform: 'translateX(5px)',
                          }
                        }}
                      >
                        <Person sx={{ mr: 2, color: '#00ff88' }} />
                        Profile
                      </MenuItem>
                      <MenuItem 
                        onClick={handleDashboardClick}
                        sx={{ 
                          py: 1.5, 
                          px: 2,
                          color: '#ffffff',
                          background: 'transparent',
                          borderRadius: 0,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          fontWeight: 600,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'rgba(0, 255, 136, 0.1)',
                            color: '#00ff88',
                            transform: 'translateX(5px)',
                          }
                        }}
                      >
                        <DashboardIcon sx={{ mr: 2, color: '#00ff88' }} />
                        Dashboard
                      </MenuItem>
                      <MenuItem 
                        onClick={handleLogout}
                        sx={{ 
                          py: 1.5, 
                          px: 2,
                          color: '#ffffff',
                          background: 'transparent',
                          borderRadius: 0,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          fontWeight: 600,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'rgba(255, 0, 0, 0.1)',
                            color: '#ff4444',
                            transform: 'translateX(5px)',
                          }
                        }}
                      >
                        <ExitToApp sx={{ mr: 2, color: '#ff4444' }} />
                        Logout
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  <>
                    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                      <Button
                        component={Link}
                        to="/login"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.85)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          px: 3,
                          py: 1.5,
                          borderRadius: 0,
                          fontWeight: 700,
                          border: '2px solid rgba(0, 255, 136, 0.3)',
                          background: 'transparent',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            background: 'rgba(0, 255, 136, 0.1)',
                            color: '#00ff88',
                            border: '2px solid rgba(0, 255, 136, 0.6)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 15px rgba(0, 255, 136, 0.3)',
                          }
                        }}
                      >
                        Login
                      </Button>
                    </motion.div>
                    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                      <Button
                        component={Link}
                        to="/register"
                        variant="contained"
                        sx={{
                          background: 'linear-gradient(135deg, #00ff88 0%, #00e676 100%)',
                          color: '#000000',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          px: 4,
                          py: 1.5,
                          borderRadius: 0,
                          fontWeight: 800,
                          border: '2px solid transparent',
                          boxShadow: '0 4px 15px rgba(0, 255, 136, 0.4)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)',
                            transform: 'translateX(-100%)',
                            transition: 'transform 0.6s ease',
                          },
                          '&:hover': {
                            background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                            color: '#00ff88',
                            border: '2px solid #00ff88',
                            boxShadow: '0 6px 25px rgba(0, 255, 136, 0.6)',
                            transform: 'translateY(-2px) scale(1.02)',
                            '&::before': {
                              transform: 'translateX(100%)',
                            }
                          }
                        }}
                      >
                        Get Started
                      </Button>
                    </motion.div>
                  </>
                )}
              </Box>

              {/* Mobile Menu Button & Notification */}
              <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
                {/* Mobile Notification Icon */}
                {isAuthenticated && (
                  <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                    <NotificationCenter />
                  </motion.div>
                )}
                
                {/* Mobile Menu Button */}
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <IconButton
                    size="large"
                    aria-label="mobile menu"
                    onClick={handleMobileMenuToggle}
                    sx={{
                      color: '#ffffff',
                      borderRadius: 0,
                      border: '2px solid rgba(0, 255, 136, 0.4)',
                      background: 'rgba(0, 255, 136, 0.15)',
                      width: { xs: 48, sm: 54 },
                      height: { xs: 48, sm: 54 },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        background: 'rgba(0, 255, 136, 0.25)',
                        color: '#00ff88',
                        border: '2px solid rgba(0, 255, 136, 0.7)',
                        transform: 'scale(1.05)',
                        boxShadow: '0 4px 15px rgba(0, 255, 136, 0.3)',
                      }
                    }}
                  >
                    {mobileMenuOpen ? 
                      <Close sx={{ fontSize: { xs: 24, sm: 28 } }} /> : 
                      <MenuIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />
                    }
                  </IconButton>
                </motion.div>
              </Box>
            </Toolbar>

            {/* Mobile Navigation Menu */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden' }}
                >
                  <Box sx={{ 
                    pb: 2, 
                    borderTop: '2px solid rgba(0, 255, 136, 0.4)',
                    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.98) 0%, rgba(26, 26, 26, 0.98) 100%)',
                    backdropFilter: 'blur(20px)',
                    position: 'relative',
                    zIndex: 1200,
                  }}>
                    <Button
                      component={Link}
                      to="/jobs"
                      fullWidth
                      onClick={() => setMobileMenuOpen(false)}
                      sx={getMobileButtonStyle('/jobs')}
                    >
                      Jobs
                    </Button>
                    
                    {isAuthenticated ? (
                      <>
                        {/* Social Navigation Items */}
                        <Button
                          component={Link}
                          to="/feed"
                          fullWidth
                          onClick={() => setMobileMenuOpen(false)}
                          sx={getMobileButtonStyle('/feed')}
                        >
                          Feed
                        </Button>
                        <Button
                          component={Link}
                          to="/connections"
                          fullWidth
                          onClick={() => setMobileMenuOpen(false)}
                          sx={getMobileButtonStyle('/connections')}
                        >
                          Network
                        </Button>
                        <Button
                          component={Link}
                          to="/messages"
                          fullWidth
                          onClick={() => setMobileMenuOpen(false)}
                          sx={getMobileButtonStyle('/messages')}
                        >
                          Messages
                        </Button>
                        
                        <Button
                          onClick={handleDashboardClick}
                          fullWidth
                          sx={getMobileButtonStyle('/dashboard')}
                        >
                          Dashboard
                        </Button>
                        <Button
                          onClick={handleProfileClick}
                          fullWidth
                          sx={getMobileButtonStyle('/profile')}
                        >
                          Profile
                        </Button>
                        <Button
                          onClick={handleLogout}
                          fullWidth
                          sx={{
                            justifyContent: 'flex-start',
                            py: 2,
                            px: 3,
                            mx: 2,
                            my: 0.5,
                            color: '#ef4444',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            fontWeight: 600,
                            borderRadius: 0,
                            border: '1px solid rgba(239, 68, 68, 0.5)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              background: 'rgba(239, 68, 68, 0.2)',
                              color: '#ef4444',
                              border: '1px solid rgba(239, 68, 68, 0.8)',
                              transform: 'translateX(4px)',
                            }
                          }}
                        >
                          Logout
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          component={Link}
                          to="/login"
                          fullWidth
                          onClick={() => setMobileMenuOpen(false)}
                          sx={getMobileButtonStyle('/login')}
                        >
                          Login
                        </Button>
                        <Button
                          component={Link}
                          to="/register"
                          fullWidth
                          onClick={() => setMobileMenuOpen(false)}
                          variant="contained"
                          sx={{
                            mx: 2,
                            mt: 1,
                            py: 2,
                            background: 'linear-gradient(135deg, #00ff88 0%, #00e676 100%)',
                            color: '#000000',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            fontWeight: 700,
                            borderRadius: 0,
                            border: '2px solid #00ff88',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              background: 'transparent',
                              color: '#00ff88',
                              transform: 'translateX(4px)',
                            }
                          }}
                        >
                          Get Started
                        </Button>
                      </>
                    )}
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          </Container>
        </AppBar>
    </motion.div>
  );
};

export default Navbar;