import React, { useState } from 'react';
import { Box, Typography, useMediaQuery, useTheme, Button, Dialog, DialogTitle, DialogContent, DialogActions, Fade } from '@mui/material';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import InfoIcon from '@mui/icons-material/Info';

const ChatLayout = ({ currentUser, userData, conversations, handleLogout }) => {
  const [chatUser, setChatUser] = useState(null);
  const [openAboutUs, setOpenAboutUs] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));


  const handleSelectChatUser = (user) => {
    setChatUser(user); 
  };


  const handleCloseChat = () => {
    setChatUser(null);
  };


  const handleOpenAboutUs = () => {
    setOpenAboutUs(true);
  };


  const handleCloseAboutUs = () => {
    setOpenAboutUs(false);
  };

  const members = [
    "Rickshel Brent B. Ilustrisimo",
    "Chris Amron A. Luzon",
    "Mary Alexame J. Garces",
    "Ezzel Jan Francisco",
    "Mhart Khiss Degollacion"
  ];

  return (
    <Box sx={{
      display: 'flex',
      height: '100vh',
      backgroundColor: '#f0f2f5',
      overflow: 'hidden', 
    }}>
      <Box sx={{
        width: isMobile ? '100%' : '350px', 
        flexShrink: 0,
        display: isMobile && chatUser ? 'none' : 'block',
      }}>
        <Sidebar 
          currentUser={currentUser} 
          selectChatUser={handleSelectChatUser} 
          handleLogout={handleLogout}
        />
      </Box>
      <Box sx={{
        flexGrow: 1,
        display: isMobile && !chatUser ? 'none' : 'block',
        backgroundColor: '#fff',
        position: 'relative',
      }}>
        {chatUser ? (
          <ChatArea 
            currentUser={currentUser} 
            chatUser={chatUser} 
            onClose={handleCloseChat}
          />
        ) : (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: '20px',
            textAlign: 'center',
          }}>
            <Box sx={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#AD49E1', 
              marginBottom: '24px',
            }}>
              Welcome to Chatify!
            </Box>
            <Box sx={{
              fontSize: '18px',
              color: '#666',
              maxWidth: '400px',
              marginBottom: '32px',
            }}>
              Start a conversation by selecting a contact from the sidebar. Lezzgawwww!
            </Box>
            <Button
              variant="contained"
              startIcon={<InfoIcon />}
              onClick={handleOpenAboutUs}
              sx={{
                borderRadius: '20px',
                padding: '10px 20px',
                fontSize: '16px',
                textTransform: 'none',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                backgroundColor: '#AD49E1', 
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
                  backgroundColor: '#7A1CAC', 
                },
              }}
            >