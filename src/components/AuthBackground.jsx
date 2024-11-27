import React from 'react';
import { Box, Typography } from '@mui/material';
import chatifyLogo from '../assets/chatifylogo.png';

const AuthBackground = ({ children, label, labelVariant = "h4", showLogo = true, labelAlign = 'left' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #FFE1FF, #E4B1F0, #7E60BF)',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
      }}
    >
      {showLogo && (
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: '400px',
            mb: -6,
            zIndex: 2,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <img 
            src={chatifyLogo} 
            alt="Chatify Logo" 
            style={{ 
              width: 'auto',
              height: 'auto',
              maxWidth: '300px',
              display: 'block',
              marginRight: '-35px',
            }} 
          />
        </Box>
      )}
      <Box sx={{ position: 'relative', width: '100%', maxWidth: '400px', mt: showLogo ? 4 : 0 }}>
        <Box
          sx={{
            position: 'absolute',
            top: '-50px',
            left: labelAlign === 'center' ? '50%' : labelAlign === 'right' ? 'auto' : '10px',
            right: labelAlign === 'right' ? '10px' : 'auto',
            transform: labelAlign === 'center' ? 'translateX(-50%)' : 'none',
            background: 'linear-gradient(45deg, #7E60BF, #9D7BB0)',
            borderRadius: '30px',
            padding: '10px 20px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 3,
          }}
        >
          <Typography
            variant={labelVariant}
            component="h1"
            sx={{
              color: '#FFFFFF',
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
              textAlign: labelAlign,
              width: 'auto',
            }}
          >
            {label}
          </Typography>
        </Box>
        {children}
      </Box>
    </Box>
  );
};

export default AuthBackground;