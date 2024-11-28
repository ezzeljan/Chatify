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
      backgroundColor: 'background.default',
    }}>
      <Box sx={{ 
        width: isMobile ? '100%' : 350,
        display: selectedChatUser && isMobile ? 'none' : 'block',
        backgroundColor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
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
        backgroundColor: 'background.chat',
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
            backgroundColor: 'background.paper',
          }}>
            <Typography variant="h5" sx={{ mb: 2, color: 'text.primary' }}>
              Welcome to Chatify!
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              Select a user from the sidebar to start chatting
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatLayout;
