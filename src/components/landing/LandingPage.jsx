import React from 'react';
import { Box, Container, Typography, Button, Grid, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import chatifyLogo from '../../assets/chatifylogo.png';
import ChristmasSnow from './ChristmasSnow';

const LandingPage = () => {
  const navigate = useNavigate();

  const teamMembers = [
    "Rickshel Brent B. Ilustrisimo",
    "Chris Amron A. Luzon",
    "Mary Alexame J. Garces",
    "Ezzel Jan Francisco",
    "Mhart Khiss Degollacion"
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #7E60BF, #E4B1F0, #FFE1FF)',
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
      color: '#433878'
    }}>
      <ChristmasSnow />
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          py: 2 ,
        }}>
          <img src={chatifyLogo} alt="Chatify Logo" style={{ height: '50px' }} />
          <Box>
            <Button 
              sx={{ 
                mr: 2,
                color: '#7E60BF',
                '&:hover': {
                  backgroundColor: 'rgba(126, 96, 191, 0.1)'
                }
              }}
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
            <Button 
              variant="contained" 
              onClick={() => navigate('/register')}
              sx={{ 
                background: 'linear-gradient(45deg, #7E60BF, #9D7BB0)',
                color: '#FFFFFF',
                '&:hover': {
                  background: 'linear-gradient(45deg, #9D7BB0, #7E60BF)'
                }
              }}
            >
              Sign Up
            </Button>
          </Box>
        </Box>

        <Grid container spacing={4} sx={{ mt: 8 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ pt: 8 }}>
              <Typography variant="h2" component="h1" sx={{ 
                fontWeight: 'bold', 
                mb: 4, 
                color: '#433878',
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
              }}>
                Chat Across Languages, Connect Globally
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, color: '#7E60BF' }}>
                Break down language barriers with Chatify's real-time translation. Message anyone, in any language, and let our AI-powered translation do the rest.
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                onClick={() => navigate('/login')}
                sx={{ 
                  background: 'linear-gradient(45deg, #7E60BF, #9D7BB0)',
                  color: '#FFFFFF',
                  fontSize: '1.2rem',
                  py: 1.5,
                  px: 4,
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #9D7BB0, #7E60BF)'
                  }
                }}
              >
                Start Chatting
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              height: '100%'
            }}>
              <img 
                src={chatifyLogo} 
                alt="Chatify App Preview" 
                style={{ 
                  maxWidth: '100%',
                  height: 'auto',
                  filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.2))'
                }} 
              />
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ textAlign: 'center', py: 8, mt: 8 }}>
          <Typography variant="h4" sx={{ 
            mb: 4, 
            color: '#433878',
            fontWeight: 'bold',
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
          }}>
            Why Choose Chatify?
          </Typography>
          <Grid container spacing={4}>
            {[
              {
                title: 'Real-time Translation',
                description: 'Powered by Gemini API, messages are instantly translated to your preferred language'
              },
              {
                title: 'Global Connection',
                description: 'Chat with anyone, anywhere, regardless of the language they speak'
              },
              {
                title: 'Seamless Experience',
                description: 'Beautiful, responsive interface with secure authentication and real-time updates'
              }
            ].map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box
                  sx={{
                    p: 3,
                    background: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: '10px',
                    height: '100%',
                    transition: 'transform 0.2s',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 6px 12px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, color: '#7E60BF', fontWeight: 'bold' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#433878' }}>
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ textAlign: 'center', py: 8, mt: 8 }}>
          <Typography variant="h4" sx={{ 
            mb: 6, 
            color: '#433878',
            fontWeight: 'bold',
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
          }}>
            Meet Our Team
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {teamMembers.map((member, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 3,
                    background: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: '20px',
                    transition: 'transform 0.2s',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 6px 12px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      mb: 2,
                      background: 'linear-gradient(45deg, #7E60BF, #9D7BB0)',
                      color: '#FFFFFF',
                      fontSize: '2rem',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  >
                    {member.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 500,
                      textAlign: 'center',
                      lineHeight: 1.2,
                      color: '#7E60BF'
                    }}
                  >
                    {member}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
      <footer style={{
                backgroundColor: 'rgba(248, 248, 248, 0.2)', // Background color for the footer
                padding: '0 0 20px 0', // Padding for the footer
                textAlign: 'center', // Center the text
                position: 'relative', // Position relative for any absolute positioning inside
            }}>
                <hr style={{
                    border: 'none', // Remove default border
                    margin: '50px 0 20px 0',
                    height: '1px', // Set height
                    backgroundColor: '#b27fd4', // Color of the hr
                }} />
                <Typography variant="body1" sx={{ 
                    mb: 1, 
                    color: '#a26cc8',
                    fontWeight: 'bold',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                }}>
                    Chatify
                </Typography>
                <Typography variant="body2" sx={{ 
                    color: '#a26cc8', 
                    textAlign: 'center', 
                    maxWidth: '600px', 
                    margin: '0 auto' 
                }}>
                    Chatify is an AI-integrated messaging application that provides real-time translation of chats into user's preferred language.
                </Typography>
                <Typography variant="body2" sx={{ 
                    color: '#a26cc8', 
                    textAlign: 'center', 
                    maxWidth: '600px', 
                    margin: '0 auto',
                    mt: 2 
                }}>
                    Copyright &copy; 2024
                </Typography>
            </footer>
    </Box>
  );
};

export default LandingPage; 