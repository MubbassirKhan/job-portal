import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
// Import icons individually to avoid circular dependency issues
import LinkedIn from '@mui/icons-material/LinkedIn';
import Twitter from '@mui/icons-material/Twitter';
import Facebook from '@mui/icons-material/Facebook';
import Instagram from '@mui/icons-material/Instagram';
import Email from '@mui/icons-material/Email';
import Phone from '@mui/icons-material/Phone';
import LocationOn from '@mui/icons-material/LocationOn';
import Work from '@mui/icons-material/Work';
import Business from '@mui/icons-material/Business';
import People from '@mui/icons-material/People';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'For Job Seekers',
      icon: <People />,
      links: [
        { text: 'Browse Jobs', href: '/jobs' },
        { text: 'My Applications', href: '/dashboard' },
        { text: 'Profile', href: '/profile' },
        { text: 'Messages', href: '/messages' },
        { text: 'Connections', href: '/connections' }
      ]
    },
    {
      title: 'For Recruiters',
      icon: <Business />,
      links: [
        { text: 'Post a Job', href: '/recruiter/jobs' },
        { text: 'Find Candidates', href: '/recruiter/applications' },
        { text: 'Recruiter Dashboard', href: '/dashboard' },
        { text: 'Manage Jobs', href: '/recruiter/jobs' },
        { text: 'Company Profile', href: '/profile' }
      ]
    },
    {
      title: 'Company',
      icon: <Work />,
      links: [
        { text: 'Careers', href: '/careers' },
        { text: 'Press', href: '/press' },
        { text: 'Blog', href: '/blog' },
        { text: 'Terms of Service', href: '/terms' }
      ]
    },
    {
      title: 'Support',
      icon: <Email />,
      links: [
        { text: 'Help Center', href: '/help' },
        { text: 'Privacy Policy', href: '/privacy' },
        { text: 'Contact Us', href: '/contact' },
        { text: 'FAQ', href: '/faq' },
        { text: 'Safety', href: '/safety' }
      ]
    }
  ];

  const socialLinks = [
    { icon: <LinkedIn />, href: 'https://linkedin.com/in/mubbassir-khan-jahagirdar-081715271', label: 'LinkedIn' },
    { icon: <Twitter />, href: 'https://twitter.com/talenthub', label: 'Twitter' },
    { icon: <Facebook />, href: 'https://facebook.com/talenthub', label: 'Facebook' },
    { icon: <Instagram />, href: 'https://www.instagram.com/mubbassir_khan/', label: 'Instagram' }
  ];

  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
        borderTop: '3px solid #00ff88',
        mt: 'auto',
        py: { xs: 6, md: 8 },
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }
      }}
    >
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Main Footer Content */}
        <Grid container spacing={{ xs: 4, sm: 6, md: 8 }}>
          {/* Brand Section - Left Side */}
          <Grid item xs={12} md={5}>
            <Box sx={{ mb: { xs: 3, sm: 4 } }}>
              <Typography 
                variant="h3" 
                component="div" 
                sx={{ 
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #00ff88 0%, #ffffff 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: { xs: 3, sm: 4 },
                  display: 'flex',
                  alignItems: 'center',
                  gap: { xs: 2, sm: 3 },
                  textTransform: 'uppercase',
                  letterSpacing: { xs: '1px', sm: '2px' },
                  fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.8rem' },
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: '-8px',
                    left: '0',
                    width: '60px',
                    height: '4px',
                    background: 'linear-gradient(135deg, #00ff88 0%, #00e676 100%)',
                    borderRadius: 0,
                  }
                }}
              >
                <Box
                  sx={{
                    width: { xs: 50, sm: 60 },
                    height: { xs: 50, sm: 60 },
                    background: 'linear-gradient(135deg, #00ff88 0%, #00e676 100%)',
                    borderRadius: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6px 25px rgba(0, 255, 136, 0.5)',
                  }}
                >
                  <Work sx={{ color: '#000000', fontSize: { xs: 28, sm: 35 } }} />
                </Box>
                TalentHub
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: { xs: 3, sm: 4 }, 
                  lineHeight: 1.8,
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' },
                  maxWidth: { xs: '100%', md: '400px' },
                  textAlign: { xs: 'center', md: 'left' },
                  px: { xs: 1, md: 0 }
                }}
              >
                Connecting talented professionals with amazing opportunities. 
                Build your career, find your dream job, and grow your professional network with cutting-edge technology.
              </Typography>
              
              {/* Contact Info */}
              <Box sx={{ mb: { xs: 2, sm: 2 } }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  mb: 2, 
                  '&:hover': { transform: 'translateX(5px)', transition: 'all 0.3s ease' } 
                }}>
                  <Email sx={{ fontSize: { xs: 18, sm: 20 }, mr: 2, color: '#00ff88' }} />
                  <Typography variant="body1" sx={{ 
                    color: '#ffffff', 
                    fontWeight: 500,
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }}>
                    khanmkj96@gmail.com
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  mb: 2,
                  '&:hover': { transform: 'translateX(5px)', transition: 'all 0.3s ease' } 
                }}>
                  <Phone sx={{ fontSize: { xs: 18, sm: 20 }, mr: 2, color: '#00ff88' }} />
                  <Typography variant="body1" sx={{ 
                    color: '#ffffff', 
                    fontWeight: 500,
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }}>
                    +91 7619175596
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  '&:hover': { transform: 'translateX(5px)', transition: 'all 0.3s ease' } 
                }}>
                  <LocationOn sx={{ fontSize: { xs: 18, sm: 20 }, mr: 2, color: '#00ff88' }} />
                  <Typography variant="body1" sx={{ 
                    color: '#ffffff', 
                    fontWeight: 500,
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }}>
                    Dharwad, Karnataka, India
                  </Typography>
                </Box>
              </Box>

              {/* Social Links */}
              <Box sx={{ 
                display: 'flex', 
                gap: { xs: 1.5, sm: 2 }, 
                mt: { xs: 2, sm: 3 },
                justifyContent: { xs: 'center', md: 'flex-start' }
              }}>
                {socialLinks.map((social, index) => (
                  <IconButton
                    key={index}
                    component={Link}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      width: { xs: 45, sm: 50 },
                      height: { xs: 45, sm: 50 },
                      borderRadius: 0,
                      background: 'rgba(0, 255, 136, 0.1)',
                      border: '2px solid rgba(0, 255, 136, 0.3)',
                      color: '#00ff88',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #00ff88 0%, #00e676 100%)',
                        color: '#000000',
                        transform: 'translateY(-3px) scale(1.05)',
                        boxShadow: '0 8px 25px rgba(0, 255, 136, 0.4)',
                        border: '2px solid transparent',
                      }
                    }}
                    aria-label={social.label}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Footer Links - Right Side */}
          <Grid item xs={12} md={7}>
            <Grid container spacing={{ xs: 3, sm: 4 }}>
              {footerSections.map((section, index) => (
                <Grid item xs={6} sm={3} key={index}>
                  <Typography 
                    variant="h6" 
                    component="h3"
                    sx={{ 
                      mb: { xs: 2, sm: 3 },
                      fontWeight: 700,
                      fontSize: { xs: '1rem', sm: '1.1rem' },
                      color: '#ffffff',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: '-6px',
                        left: '0',
                        width: '25px',
                        height: '2px',
                        background: '#00ff88',
                        borderRadius: 0,
                      }
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        background: 'rgba(0, 255, 136, 0.2)',
                        borderRadius: 0,
                        border: '1px solid rgba(0, 255, 136, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {React.cloneElement(section.icon, { 
                        sx: { fontSize: 16, color: '#00ff88' }
                      })}
                    </Box>
                    {section.title}
                  </Typography>
                  <Box component="nav">
                    {section.links.map((link, linkIndex) => (
                      <Link
                        key={linkIndex}
                        href={link.href}
                        underline="none"
                        sx={{
                          display: 'block',
                          py: 0.8,
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: { xs: '0.85rem', sm: '0.9rem' },
                          fontWeight: 500,
                          textTransform: 'uppercase',
                          letterSpacing: '0.3px',
                          position: 'relative',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            color: '#00ff88',
                            transform: 'translateX(8px)',
                            textDecoration: 'none',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              left: '-10px',
                              top: '50%',     
                              transform: 'translateY(-50%)',
                              width: '4px',
                              height: '4px',
                              background: '#00ff88',
                              borderRadius: 0,
                            }
                          }
                        }}
                      >
                        {link.text}
                      </Link>
                    ))}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        {/* Divider */}
        <Divider sx={{ 
          my: 6, 
          backgroundColor: 'rgba(0, 255, 136, 0.3)',
          height: '2px',
          borderRadius: 0
        }} />

        {/* Bottom Footer */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', sm: 'center' },
            gap: { xs: 3, sm: 2 }
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#ffffff',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: { xs: '0.5px', sm: '1px' },
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
              textAlign: 'center'
            }}
          >
            © {currentYear} TALENTHUB. ALL RIGHTS RESERVED.
          </Typography>
          
          <Box 
            sx={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              gap: { xs: 1, sm: 2, md: 3 },
              justifyContent: { xs: 'center', sm: 'flex-end' }
            }}
          >
            <Link
              href="/privacy"
              underline="none"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: { xs: '0.3px', sm: '0.5px' },
                padding: { xs: '6px 12px', sm: '8px 16px' },
                border: '1px solid rgba(0, 255, 136, 0.3)',
                borderRadius: 0,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': { 
                  color: '#00ff88',
                  background: 'rgba(0, 255, 136, 0.1)',
                  border: '1px solid rgba(0, 255, 136, 0.6)',
                  transform: 'translateY(-2px)',
                }
              }}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              underline="none"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: { xs: '0.3px', sm: '0.5px' },
                padding: { xs: '6px 12px', sm: '8px 16px' },
                border: '1px solid rgba(0, 255, 136, 0.3)',
                borderRadius: 0,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': { 
                  color: '#00ff88',
                  background: 'rgba(0, 255, 136, 0.1)',
                  border: '1px solid rgba(0, 255, 136, 0.6)',
                  transform: 'translateY(-2px)',
                }
              }}
            >
              Terms of Service
            </Link>
            <Link
              href="/cookies"
              underline="none"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: { xs: '0.3px', sm: '0.5px' },
                padding: { xs: '6px 12px', sm: '8px 16px' },
                border: '1px solid rgba(0, 255, 136, 0.3)',
                borderRadius: 0,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': { 
                  color: '#00ff88',
                  background: 'rgba(0, 255, 136, 0.1)',
                  border: '1px solid rgba(0, 255, 136, 0.6)',
                  transform: 'translateY(-2px)',
                }
              }}
            >
              Cookie Policy
            </Link>
          </Box>
        </Box>

        {/* Mobile-only Newsletter Signup */}
        <Box 
          sx={{ 
            display: { xs: 'block', md: 'none' },
            mt: 3,
            textAlign: 'center'
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Stay updated with the latest job opportunities
          </Typography>
          <Link
            href="/newsletter"
            underline="none"
            sx={{
              color: '#00ff88',
              fontSize: '0.875rem',
              fontWeight: 500,
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            Subscribe to Newsletter
          </Link>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;