import React from 'react';
import { Box, keyframes } from '@mui/material';

const pulse = keyframes`
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(173, 73, 225, 0.7);
  }
  
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(173, 73, 225, 0);
  }
  
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(173, 73, 225, 0);
  }
`;

const TranslationAnimation = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '24px',
      }}
    >
      {[0, 1, 2].map((index) => (
        <Box
          key={index}
          sx={{
            width: '8px',
            height: '8px',
            backgroundColor: '#AD49E1',
            borderRadius: '50%',
            margin: '0 4px',
            animation: `${pulse} 1.5s infinite`,
            animationDelay: `${index * 0.3}s`,
          }}
        />
      ))}
    </Box>
  );
};

export default TranslationAnimation;
