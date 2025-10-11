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

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(99, 102, 241, 0.1)',
          color: '#1e293b',
          zIndex: 1100, // Ensure it stays on top
        }}
      >
          <Container maxWidth="lg">
            <Toolbar sx={{ py: 1 }}>
              <motion.div
                variants={logoVariants}
                whileHover="hover"
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => navigate('/')}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
                  }}
                >
                  <Work sx={{ color: 'white', fontSize: 24 }} />
                </Box>
                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: '1.5rem',
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  JobPortal
                </Typography>
              </motion.div>

              <Box sx={{ flexGrow: 1 }} />

              {/* Desktop Navigation */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button
                    component={Link}
                    to="/jobs"
                    sx={{
                      color: isActive('/jobs') ? '#6366f1' : '#64748b',
                      fontWeight: isActive('/jobs') ? 600 : 500,
                      textTransform: 'none',
                      px: 2,
                      py: 1,
                      borderRadius: '8px',
                      position: 'relative',
                      '&::after': isActive('/jobs') ? {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '20px',
                        height: '3px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                        borderRadius: '2px',
                      } : {},
                    }}
                  >
                    Jobs
                  </Button>
                </motion.div>

                {isAuthenticated ? (
                  <>
                    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                      <Button
                        onClick={handleDashboardClick}
                        sx={{
                          color: isActive('/dashboard') ? '#6366f1' : '#64748b',
                          fontWeight: isActive('/dashboard') ? 600 : 500,
                          textTransform: 'none',
                          px: 2,
                          py: 1,
                          borderRadius: '8px',
                          position: 'relative',
                          '&::after': isActive('/dashboard') ? {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '20px',
                            height: '3px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                            borderRadius: '2px',
                          } : {},
                        }}
                      >
                        Dashboard
                      </Button>
                    </motion.div>

                    {user?.role === 'admin' && (
                      <Chip
                        label="Admin"
                        size="small"
                        sx={{
                          background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                          color: 'white',
                          fontWeight: 600,
                          border: 'none',
                        }}
                      />
                    )}

                    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                      <IconButton
                        size="large"
                        aria-label="account menu"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={handleMenu}
                        sx={{
                          ml: 1,
                          '&:hover': {
                            background: 'rgba(99, 102, 241, 0.1)',
                          }
                        }}
                      >
                        <Avatar 
                          sx={{ 
                            width: 36, 
                            height: 36,
                            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                            fontWeight: 600,
                            border: '2px solid rgba(99, 102, 241, 0.2)',
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
                          borderRadius: '12px',
                          border: '1px solid rgba(99, 102, 241, 0.1)',
                          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                          mt: 1,
                          minWidth: 200,
                        }
                      }}
                    >
                      <MenuItem 
                        onClick={handleProfileClick}
                        sx={{ 
                          py: 1.5, 
                          px: 2,
                          '&:hover': {
                            background: 'rgba(99, 102, 241, 0.05)',
                          }
                        }}
                      >
                        <Person sx={{ mr: 2, color: '#6366f1' }} />
                        Profile
                      </MenuItem>
                      <MenuItem 
                        onClick={handleDashboardClick}
                        sx={{ 
                          py: 1.5, 
                          px: 2,
                          '&:hover': {
                            background: 'rgba(99, 102, 241, 0.05)',
                          }
                        }}
                      >
                        <DashboardIcon sx={{ mr: 2, color: '#6366f1' }} />
                        Dashboard
                      </MenuItem>
                      <MenuItem 
                        onClick={handleLogout}
                        sx={{ 
                          py: 1.5, 
                          px: 2,
                          '&:hover': {
                            background: 'rgba(239, 68, 68, 0.05)',
                            color: '#ef4444',
                          }
                        }}
                      >
                        <ExitToApp sx={{ mr: 2, color: '#ef4444' }} />
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
                          color: '#64748b',
                          textTransform: 'none',
                          px: 2,
                          py: 1,
                          borderRadius: '8px',
                          fontWeight: 500,
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
                          background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                          color: 'white',
                          textTransform: 'none',
                          px: 3,
                          py: 1,
                          borderRadius: '8px',
                          fontWeight: 600,
                          boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                          border: 'none',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #4f46e5 0%, #db2777 100%)',
                            boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
                          }
                        }}
                      >
                        Get Started
                      </Button>
                    </motion.div>
                  </>
                )}
              </Box>

              {/* Mobile Menu Button */}
              <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <IconButton
                    size="large"
                    aria-label="mobile menu"
                    onClick={handleMobileMenuToggle}
                    sx={{
                      color: '#1e293b',
                      '&:hover': {
                        background: 'rgba(99, 102, 241, 0.1)',
                      }
                    }}
                  >
                    {mobileMenuOpen ? <Close /> : <MenuIcon />}
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
                  <Box sx={{ pb: 2, borderTop: '1px solid rgba(99, 102, 241, 0.1)' }}>
                    <Button
                      component={Link}
                      to="/jobs"
                      fullWidth
                      onClick={() => setMobileMenuOpen(false)}
                      sx={{
                        justifyContent: 'flex-start',
                        py: 1.5,
                        px: 2,
                        color: '#64748b',
                        textTransform: 'none',
                        fontWeight: 500,
                      }}
                    >
                      Jobs
                    </Button>
                    
                    {isAuthenticated ? (
                      <>
                        <Button
                          onClick={handleDashboardClick}
                          fullWidth
                          sx={{
                            justifyContent: 'flex-start',
                            py: 1.5,
                            px: 2,
                            color: '#64748b',
                            textTransform: 'none',
                            fontWeight: 500,
                          }}
                        >
                          Dashboard
                        </Button>
                        <Button
                          onClick={handleProfileClick}
                          fullWidth
                          sx={{
                            justifyContent: 'flex-start',
                            py: 1.5,
                            px: 2,
                            color: '#64748b',
                            textTransform: 'none',
                            fontWeight: 500,
                          }}
                        >
                          Profile
                        </Button>
                        <Button
                          onClick={handleLogout}
                          fullWidth
                          sx={{
                            justifyContent: 'flex-start',
                            py: 1.5,
                            px: 2,
                            color: '#ef4444',
                            textTransform: 'none',
                            fontWeight: 500,
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
                          sx={{
                            justifyContent: 'flex-start',
                            py: 1.5,
                            px: 2,
                            color: '#64748b',
                            textTransform: 'none',
                            fontWeight: 500,
                          }}
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
                            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: '8px',
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