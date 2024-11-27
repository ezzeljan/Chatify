import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { getDatabase, ref, get } from 'firebase/database';
import ChatLayout from './ChatLayout';
import chatifyLogo from '../../assets/chatifylogo.png';

const ChatPage = ({ currentUser, handleLogout }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const db = getDatabase();
      
      try {
        // Fetch user data
        const userSnapshot = await get(ref(db, `users/${currentUser.uid}`));
        if (userSnapshot.exists()) {
          setUserData(userSnapshot.val());
        }

        // Fetch conversations
        const conversationsSnapshot = await get(ref(db, 'messages'));
        if (conversationsSnapshot.exists()) {
          const conversationsData = conversationsSnapshot.val();
          const userConversations = Object.entries(conversationsData)
            .filter(([chatId]) => chatId.includes(currentUser.uid))
            .map(([chatId, messages]) => ({
              chatId,
              messages: Object.values(messages),
            }));
          setConversations(userConversations);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentUser.uid]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <img src={chatifyLogo} alt="Chatify Logo" style={{ width: '250px', height: 'auto' }} />
      </Box>
    );
  }

  return <ChatLayout 
    currentUser={currentUser} 
    userData={userData}
    conversations={conversations}
    handleLogout={handleLogout} 
  />;
};

export default ChatPage;
