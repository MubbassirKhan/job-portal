import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
} from '@mui/material';
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
    { icon: <LinkedIn />, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: <Twitter />, href: 'https://twitter.com', label: 'Twitter' },
    { icon: <Facebook />, href: 'https://facebook.com', label: 'Facebook' },
    { icon: <Instagram />, href: 'https://instagram.com', label: 'Instagram' }
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
      }}
    >
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Grid container spacing={{ xs: 4, sm: 6, md: 8 }}>
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
                }}
              >
                <Box
                  component="img"
                  src="/android-chrome-144x144.png"
                  alt="TalentHub Logo"
                  sx={{
                    width: { xs: 50, sm: 60 },
                    height: { xs: 50, sm: 60 },
                    filter: 'drop-shadow(0 6px 25px rgba(0, 255, 136, 0.5))',
                  }}
                />
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
                }}
              >
                Connecting talented professionals with amazing opportunities.
              </Typography>

            </Box>
          </Grid>

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
                    }}
                  >
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

        <Divider sx={{ my: 6, backgroundColor: 'rgba(0, 255, 136, 0.3)', height: '2px' }} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'center', sm: 'center' } }}>
          <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700, textTransform: 'uppercase' }}>
            © {currentYear} TALENTHUB. ALL RIGHTS RESERVED.
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Link href="/privacy" underline="none" sx={{ color: 'rgba(255,255,255,0.7)' }}>Privacy</Link>
            <Link href="/terms" underline="none" sx={{ color: 'rgba(255,255,255,0.7)' }}>Terms</Link>
            <Link href="/cookies" underline="none" sx={{ color: 'rgba(255,255,255,0.7)' }}>Cookies</Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
