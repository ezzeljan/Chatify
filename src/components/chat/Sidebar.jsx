import React, { useState, useEffect } from 'react';
import { Box, List, ListItem, ListItemText, Typography, Avatar, IconButton, Badge, ButtonGroup, Button, useTheme } from '@mui/material';
import { getDatabase, ref, onValue, update, off } from 'firebase/database';
import SearchBar from './SearchBar';
import UserProfile from './UserProfile';
import { MessageOutlined, PeopleOutline } from '@mui/icons-material';

const Sidebar = ({ currentUser, selectChatUser, handleLogout, activeChatUserId }) => {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userConversations, setUserConversations] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [lastMessages, setLastMessages] = useState({});
  const [unreadMessages, setUnreadMessages] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null); // Track the selected user
  const [filter, setFilter] = useState('recent'); // Filter: 'recent' or 'all'
  const [userStatuses, setUserStatuses] = useState({});

  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, 'users');
    const messagesRef = ref(db, 'messages');
    const statusRef = ref(db, 'status');

    const userUnsubscribe = onValue(usersRef, (snapshot) => {
      const allUsers = snapshot.val() ? Object.values(snapshot.val()) : [];
      const otherUsers = allUsers.filter(user => user.userId !== currentUser.uid);
      setUsers(otherUsers);
    });

    const statusUnsubscribe = onValue(statusRef, (snapshot) => {
      const statuses = snapshot.val();
      if (statuses) {
        setUserStatuses(statuses);
      }
    });

    const messageUnsubscribe = onValue(messagesRef, (snapshot) => {
      const conversations = snapshot.val();
      const userConvo = {};
      const unreadMsg = {};
      const lastMsgs = {};

      if (conversations) {
        Object.keys(conversations).forEach(chatId => {
          const participants = chatId.split('_');
          if (participants.includes(currentUser.uid)) {
            const otherUserId = participants.find(uid => uid !== currentUser.uid);

            const messages = Object.values(conversations[chatId]);
            const latestMessage = messages.reduce((latest, current) => {
              return new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest;
            });

            const unreadCount = messages.filter(msg => msg.senderId !== currentUser.uid && !msg.read).length;
            const hasUnread = unreadCount > 0;

            userConvo[otherUserId] = {
              hasConversation: true,
              latestMessageTimestamp: latestMessage.timestamp,
            };

            unreadMsg[otherUserId] = {
              hasUnread,
              unreadCount,
            };

            lastMsgs[otherUserId] = {
              message: latestMessage.message || '',
              messageOG: latestMessage.messageOG || '',
              senderId: latestMessage.senderId,
            };
          }
        });
      }

      setUserConversations(userConvo);
      setUnreadMessages(unreadMsg);
      setLastMessages(lastMsgs);
    });

    // Add this new effect to clear unread messages for the active chat
    if (activeChatUserId) {
      setUnreadMessages(prev => ({
        ...prev,
        [activeChatUserId]: { hasUnread: false, unreadCount: 0 }
      }));
    }

    return () => {
      off(usersRef);
      off(messagesRef);
      off(statusRef);
      userUnsubscribe();
      statusUnsubscribe();
    };
  }, [currentUser, activeChatUserId]);

  const sortUsersByLatestMessage = (userList) => {
    return userList.sort((a, b) => {
      const timestampA = userConversations[a.userId]?.latestMessageTimestamp || 0;
      const timestampB = userConversations[b.userId]?.latestMessageTimestamp || 0;
      return new Date(timestampB) - new Date(timestampA);
    });
  };

  useEffect(() => {
    let usersToDisplay = [];

    if (searchQuery.trim()) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      usersToDisplay = users.filter(user =>
        user.username.toLowerCase().includes(lowerCaseQuery) ||
        user.email.toLowerCase().includes(lowerCaseQuery)
      );
    } else if (filter === 'recent') {
      usersToDisplay = users.filter(user => userConversations[user.userId]?.hasConversation);
    } else if (filter === 'all') {
      usersToDisplay = users;
    }

    const sortedUsers = sortUsersByLatestMessage(usersToDisplay);
    setFilteredUsers(sortedUsers);
  }, [searchQuery, users, userConversations, filter]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const markMessagesAsRead = (userId) => {
    const db = getDatabase();
    const chatId = currentUser.uid < userId ? `${currentUser.uid}_${userId}` : `${userId}_${currentUser.uid}`;
    const messagesRef = ref(db, `messages/${chatId}`);

    onValue(messagesRef, (snapshot) => {
      const messages = snapshot.val();
      if (messages) {
        Object.keys(messages).forEach((messageKey) => {
          if (messages[messageKey].senderId !== currentUser.uid && !messages[messageKey].read) {
            update(ref(db, `messages/${chatId}/${messageKey}`), { read: true });
          }
        });
      }
    });
  };

  const handleUserSelect = (user) => {
    setSelectedUserId(user.userId); // Set the selected user
    markMessagesAsRead(user.userId); // Mark all messages as read when user selects a conversation
    selectChatUser(user); // Proceed with opening the conversation
  };

  const truncateMessage = (message, maxLength = 30) => {
    if (message.length > maxLength) {
      return message.substring(0, maxLength) + '...';
    }
    return message;
  };

  return (
    <Box sx={{ 
      height: '100vh',
      width: '100%',
      backgroundColor: 'background.paper',
      borderRight: '1px solid',
      borderColor: 'divider',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Box sx={{ 
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: theme.palette.mode === 'dark' ? 'background.paper' : '#ffffff',
      }}>
        <SearchBar onSearch={handleSearch} />
        <ButtonGroup fullWidth size="small" sx={{ mt: 1 }}>
          <Button
            variant={filter === 'recent' ? 'contained' : 'outlined'}
            onClick={() => setFilter('recent')}
            startIcon={<MessageOutlined />}
            sx={{
              backgroundColor: filter === 'recent' 
                ? theme.palette.primary.main 
                : 'transparent',
              color: filter === 'recent' 
                ? '#fff' 
                : theme.palette.primary.main,
              border: `1px solid ${theme.palette.primary.main}`,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                color: '#fff',
              },
              fontSize: '0.8rem',
              padding: '4px 8px',
            }}
          >
            Recent
          </Button>
          <Button
            variant={filter === 'all' ? 'contained' : 'outlined'}
            onClick={() => setFilter('all')}
            startIcon={<PeopleOutline />}
            sx={{
              backgroundColor: filter === 'all' 
                ? theme.palette.primary.main 
                : 'transparent',
              color: filter === 'all' 
                ? '#fff' 
                : theme.palette.primary.main,
              border: `1px solid ${theme.palette.primary.main}`,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                color: '#fff',
              },
              fontSize: '0.8rem',
              padding: '4px 8px',
            }}
          >
            All Users
          </Button>
        </ButtonGroup>
      </Box>

      <List sx={{ 
        flexGrow: 1,
        overflowY: 'auto',
        overflowX: 'hidden', // Prevent horizontal scrolling
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.05)' 
            : '#f1f1f1',
        },
        '&::-webkit-scrollbar-thumb': {
          background: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.2)' 
            : '#888',
          borderRadius: '4px',
        },
      }}>
        {filteredUsers.map((user) => (
          <ListItem
            key={user.userId}
            button
            selected={user.userId === activeChatUserId}
            onClick={() => selectChatUser(user)}
            sx={{
              mb: 0.5,
              borderRadius: 1,
              mx: 1,
              width: 'auto', // Prevent item from stretching
              minWidth: 0, // Allow content to shrink if needed
              '&.Mui-selected': {
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(173, 73, 225, 0.2)'
                  : 'rgba(173, 73, 225, 0.1)',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(173, 73, 225, 0.3)'
                    : 'rgba(173, 73, 225, 0.2)',
                },
              },
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <Box sx={{ position: 'relative', mr: 2, flexShrink: 0 }}>
              <Avatar src={user.profileImageUrl} />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 12,
                  height: 12,
                  backgroundColor: userStatuses[user.userId] === 'online' ? '#66BB6A' : '#747f8d',
                  borderRadius: '50%',
                  border: `2px solid ${theme.palette.background.paper}`,
                }}
              />
            </Box>
            <ListItemText
              primary={
                <Typography 
                  sx={{ 
                    fontWeight: unreadMessages[user.userId]?.hasUnread && user.userId !== activeChatUserId ? 'bold' : 'normal',
                    fontSize: '0.9rem',
                    color: theme.palette.text.primary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.username}
                </Typography>
              }
              secondary={
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontSize: '0.8rem',
                    color: theme.palette.text.secondary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }} 
                  noWrap
                >
                  {lastMessages[user.userId] 
                    ? truncateMessage(
                        lastMessages[user.userId].senderId === currentUser.uid 
                          ? lastMessages[user.userId].messageOG 
                          : lastMessages[user.userId].message, 
                        20
                      ) 
                    : user.email}
                </Typography>
              }
              sx={{
                minWidth: 0, // Allow text to shrink
                '& .MuiListItemText-primary, & .MuiListItemText-secondary': {
                  width: '100%',
                },
              }}
            />
            {unreadMessages[user.userId]?.unreadCount > 0 && (
              <Badge
                badgeContent={unreadMessages[user.userId].unreadCount}
                color="primary"
                sx={{
                  position: 'absolute',
                  right: 25,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  flexShrink: 0, // Prevent badge from shrinking
                }}
              />
            )}
          </ListItem>
        ))}
      </List>

      <Box sx={{ 
        borderTop: '1px solid',
        borderColor: 'divider',
        backgroundColor: theme.palette.mode === 'dark' ? 'background.paper' : '#ffffff',
      }}>
        <UserProfile currentUser={currentUser} handleLogout={handleLogout} />
      </Box>
    </Box>
  );
};

export default Sidebar;
