import React, { useState } from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import GroupChatArea from './GroupChatArea';

const ChatLayout = ({ currentUser, userData, conversations, handleLogout }) => {
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [selectedGroupChat, setSelectedGroupChat] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleChatSelect = (chat) => {
    if (chat.type === 'group') {
      setSelectedGroupChat(chat);
      setSelectedChatUser(null);
    } else {
      setSelectedChatUser(chat);
      setSelectedGroupChat(null);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh',
      background: theme.palette.mode === 'dark'
        ? 'linear-gradient(135deg, #150016 0%, #29104A 100%)'
        : 'linear-gradient(135deg, #FFE1FF, #E4B1F0, #7E60BF)',
    }}>
      <Box sx={{ 
        width: isMobile ? '100%' : 350,
        display: (selectedChatUser || selectedGroupChat) && isMobile ? 'none' : 'block',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(180deg, #29104A 0%, #522C5D 100%)'
          : 'rgba(255, 255, 255, 0.85)',
        borderRight: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? '#522C5D' : 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
      }}>
        <Sidebar
          currentUser={currentUser}
          selectChatUser={handleChatSelect}
          handleLogout={handleLogout}
          activeChatUserId={selectedChatUser?.userId || selectedGroupChat?.id}
        />
      </Box>

      <Box sx={{ 
        flexGrow: 1,
        display: (!selectedChatUser && !selectedGroupChat) && isMobile ? 'none' : 'flex',
        flexDirection: 'column',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(180deg, #29104A 0%, #522C5D 50%, #845162 100%)'
          : 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(10px)',
      }}>
        {selectedChatUser ? (
          <ChatArea
            currentUser={currentUser}
            chatUser={selectedChatUser}
            onClose={() => setSelectedChatUser(null)}
          />
        ) : selectedGroupChat ? (
          <GroupChatArea
            currentUser={currentUser}
            groupChat={selectedGroupChat}
            onClose={() => setSelectedGroupChat(null)}
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
