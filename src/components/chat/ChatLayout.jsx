import React, { useState } from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';

const ChatLayout = ({ currentUser, userData, conversations, handleLogout }) => {
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh',
      background: theme.palette.mode === 'dark'
        ? 'linear-gradient(135deg, #150016 0%, #29104A 100%)'
        : 'background.default',
    }}>
      <Box sx={{ 
        width: isMobile ? '100%' : 350,
        display: selectedChatUser && isMobile ? 'none' : 'block',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(180deg, #29104A 0%, #522C5D 100%)'
          : 'background.paper',
        borderRight: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? '#522C5D' : 'divider',
      }}>
        <Sidebar
          currentUser={currentUser}
          selectChatUser={setSelectedChatUser}
          handleLogout={handleLogout}
          activeChatUserId={selectedChatUser?.userId}
        />
      </Box>

      <Box sx={{ 
        flexGrow: 1,
        display: !selectedChatUser && isMobile ? 'none' : 'flex',
        flexDirection: 'column',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(180deg, #29104A 0%, #522C5D 50%, #845162 100%)'
          : 'background.chat',
      }}>
        {selectedChatUser ? (
          <ChatArea
            currentUser={currentUser}
            chatUser={selectedChatUser}
            onClose={() => setSelectedChatUser(null)}
          />
        ) : !isMobile && (
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            p: 3,
            textAlign: 'center',
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #29104A 0%, #522C5D 100%)'
              : 'background.paper',
          }}>
            <Typography variant="h5" sx={{ 
              mb: 2, 
              color: theme.palette.mode === 'dark' ? '#E3B8B1' : 'text.primary',
              textShadow: theme.palette.mode === 'dark' ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
            }}>
              Welcome to Chatify!
            </Typography>
            <Typography sx={{ 
              color: theme.palette.mode === 'dark' ? '#FFE9D8' : 'text.secondary',
              opacity: 0.8,
            }}>
              Select a user from the sidebar to start chatting
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatLayout;
