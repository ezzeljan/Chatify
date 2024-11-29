import React, { useState, useEffect } from 'react';
import { Box, List, ListItem, ListItemText, Typography, Avatar, IconButton, Badge, ButtonGroup, Button, useTheme, Fab, AvatarGroup } from '@mui/material';
import { getDatabase, ref, onValue, update, off } from 'firebase/database';
import SearchBar from './SearchBar';
import UserProfile from './UserProfile';
import { MessageOutlined, PeopleOutline } from '@mui/icons-material';
import CircleIcon from '@mui/icons-material/Circle';
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import CreateGroupDialog from './CreateGroupDialog';
import Groups from '@mui/icons-material/Groups';

const Sidebar = ({ currentUser, selectChatUser, handleLogout, activeChatUserId }) => {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userConversations, setUserConversations] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [lastMessages, setLastMessages] = useState({});
  const [unreadMessages, setUnreadMessages] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null); // Track the selected user
  const [view, setView] = useState('recent'); // Filter: 'recent', 'all', or 'groups'
  const [userStatuses, setUserStatuses] = useState({});
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [groups, setGroups] = useState([]);
  const [clickedItemId, setClickedItemId] = useState(null);

  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, 'users');
    const messagesRef = ref(db, 'messages');
    const statusRef = ref(db, 'status');
    const groupsRef = ref(db, 'groups');
    const groupMessagesRef = ref(db, 'groupMessages');
    const userGroupsRef = ref(db, `userGroups/${currentUser.uid}`);

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
      const userConvo = { ...userConversations };
      const unreadMsg = { ...unreadMessages };
      const lastMsgs = { ...lastMessages };

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
              type: 'user'
            };

            unreadMsg[otherUserId] = {
              hasUnread,
              unreadCount,
            };

            lastMsgs[otherUserId] = {
              message: latestMessage.message || '',
              messageOG: latestMessage.messageOG || '',
              senderId: latestMessage.senderId,
              type: latestMessage.type || 'text'
            };
          }
        });
      }

      setUserConversations(prevConvo => ({
        ...prevConvo,
        ...Object.fromEntries(
          Object.entries(userConvo).filter(([key]) => !key.startsWith('group_'))
        )
      }));
      setUnreadMessages(unreadMsg);
      setLastMessages(lastMsgs);
    });

    const groupsUnsubscribe = onValue(groupsRef, (snapshot) => {
      const groupsData = snapshot.val();
      if (groupsData) {
        const userGroups = Object.values(groupsData).filter(group => 
          group.members && group.members[currentUser.uid]
        );
        
        setUserConversations(prev => {
          const updatedConversations = { ...prev };
          Object.keys(updatedConversations).forEach(key => {
            if (key.startsWith('group_')) {
              const groupId = key.replace('group_', '');
              if (!userGroups.find(g => g.id === groupId)) {
                delete updatedConversations[key];
              }
            }
          });
          return updatedConversations;
        });
        
        setGroups(userGroups);
      } else {
        setGroups([]);
      }
    });

    const groupMessagesUnsubscribe = onValue(groupMessagesRef, (snapshot) => {
      const groupMessages = snapshot.val();
      const groupConvo = {};
      const unreadMsg = { ...unreadMessages };
      const lastMsgs = { ...lastMessages };

      if (groupMessages) {
        Object.keys(groupMessages).forEach(groupId => {
          const messages = Object.values(groupMessages[groupId]);
          if (messages.length > 0) {
            const latestMessage = messages.reduce((latest, current) => {
              return (current.timestamp || 0) > (latest.timestamp || 0) ? current : latest;
            });

            const unreadCount = messages.filter(msg => 
              msg.senderId !== currentUser.uid && !msg.read
            ).length;

            const groupKey = `group_${groupId}`;
            groupConvo[groupKey] = {
              hasConversation: true,
              latestMessageTimestamp: latestMessage.timestamp,
              type: 'group'
            };

            unreadMsg[groupKey] = {
              hasUnread: unreadCount > 0,
              unreadCount
            };

            lastMsgs[groupKey] = {
              message: latestMessage.message || '',
              senderId: latestMessage.senderId,
              senderName: latestMessage.senderName,
              type: 'group'
            };
          }
        });
      }

      setUserConversations(prevConvo => ({
        ...prevConvo,
        ...groupConvo
      }));
      setUnreadMessages(prev => ({ ...prev, ...unreadMsg }));
      setLastMessages(prev => ({ ...prev, ...lastMsgs }));
    });

    // Add this new effect to clear unread messages for the active chat
    if (activeChatUserId) {
      setUnreadMessages(prev => ({
        ...prev,
        [activeChatUserId]: { hasUnread: false, unreadCount: 0 }
      }));

      // If it's a group chat, update read status in Firebase
      if (activeChatUserId.startsWith('group_')) {
        const groupId = activeChatUserId.replace('group_', '');
        const db = getDatabase();
        const groupMessagesRef = ref(db, `groupMessages/${groupId}`);
        
        onValue(groupMessagesRef, (snapshot) => {
          const messages = snapshot.val();
          if (messages) {
            const updates = {};
            Object.keys(messages).forEach((messageKey) => {
              if (messages[messageKey].senderId !== currentUser.uid && !messages[messageKey].read) {
                updates[`${messageKey}/read`] = true;
              }
            });
            
            if (Object.keys(updates).length > 0) {
              update(groupMessagesRef, updates);
            }
          }
        }, { onlyOnce: true }); // Only run once
      }
    }

    return () => {
      off(usersRef);
      off(messagesRef);
      off(statusRef);
      off(groupsRef);
      off(groupMessagesRef);
      off(userGroupsRef);
      userUnsubscribe();
      statusUnsubscribe();
      groupsUnsubscribe();
      groupMessagesUnsubscribe();
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
    let itemsToDisplay = [];

    if (searchQuery.trim()) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      if (view === 'groups') {
        itemsToDisplay = groups.filter(group =>
          group.name.toLowerCase().includes(lowerCaseQuery)
        );
      } else {
        itemsToDisplay = users.filter(user =>
          user.username.toLowerCase().includes(lowerCaseQuery) ||
          user.email.toLowerCase().includes(lowerCaseQuery)
        );
      }
    } else if (view === 'recent') {
      const recentUsers = users.filter(user => 
        userConversations[user.userId]?.hasConversation
      );
      const recentGroups = groups.filter(group => 
        userConversations[`group_${group.id}`]?.hasConversation &&
        group.members[currentUser.uid]
      );
      itemsToDisplay = [...recentUsers, ...recentGroups];
    } else if (view === 'all') {
      itemsToDisplay = users;
    } else if (view === 'groups') {
      itemsToDisplay = groups;
    }

    const sortedItems = itemsToDisplay.sort((a, b) => {
      const timestampA = userConversations[a.userId || `group_${a.id}`]?.latestMessageTimestamp || 0;
      const timestampB = userConversations[b.userId || `group_${b.id}`]?.latestMessageTimestamp || 0;
      return timestampB - timestampA;
    });

    setFilteredUsers(sortedItems);
  }, [searchQuery, users, userConversations, view, groups, currentUser.uid]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleUserSelect = (user) => {
    const userId = user.userId;
    setClickedItemId(userId);
    if (userId) {
      setUnreadMessages(prev => ({
        ...prev,
        [userId]: { hasUnread: false, unreadCount: 0 }
      }));
    }
    selectChatUser(user);
  };

  const handleGroupSelect = (group) => {
    const groupId = `group_${group.id}`;
    setClickedItemId(groupId);
    setUnreadMessages(prev => ({
      ...prev,
      [groupId]: { hasUnread: false, unreadCount: 0 }
    }));

    // Update read status in Firebase
    const db = getDatabase();
    const groupMessagesRef = ref(db, `groupMessages/${group.id}`);
    
    onValue(groupMessagesRef, (snapshot) => {
      const messages = snapshot.val();
      if (messages) {
        const updates = {};
        Object.keys(messages).forEach((messageKey) => {
          if (messages[messageKey].senderId !== currentUser.uid && !messages[messageKey].read) {
            updates[`${messageKey}/read`] = true;
          }
        });
        
        if (Object.keys(updates).length > 0) {
          update(groupMessagesRef, updates);
        }
      }
    }, { onlyOnce: true }); // Only run once

    selectChatUser(group);
  };

  const truncateMessage = (message, maxLength = 30) => {
    if (message.length > maxLength) {
      return message.substring(0, maxLength) + '...';
    }
    return message;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return '#66BB6A';
      case 'busy':
        return '#f44336';
      case 'away':
        return '#ffa726';
      default:
        return '#747f8d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <CircleIcon sx={{ fontSize: 12, color: '#66BB6A' }} />;
      case 'busy':
        return <DoNotDisturbOnIcon sx={{ 
          fontSize: 12, 
          color: '#f44336',
          backgroundColor: '#f44336',
          borderRadius: '50%',
          '& path:first-of-type': {
            fill: 'white',
          }
        }} />;
      case 'away':
        return <AccessTimeIcon sx={{ 
          fontSize: 12, 
          color: '#ffa726',
          backgroundColor: '#ffa726',
          borderRadius: '50%',
          '& path': {
            fill: 'white',
          }
        }} />;
      default:
        return <CircleIcon sx={{ fontSize: 12, color: '#747f8d' }} />;
    }
  };

  return (
    <Box sx={{ 
      height: '100vh',
      width: '100%',
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'linear-gradient(180deg, #150016 0%, #29104A 100%)' 
        : 'linear-gradient(135deg, #FFE1FF, #E4B1F0, #7E60BF)',
      borderRight: '1px solid rgba(255, 255, 255, 0.2)',
      display: 'flex',
      flexDirection: 'column',
      backdropFilter: 'blur(10px)',
    }}>
      <Box sx={{ 
        p: 2,
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #29104A 0%, #522C5D 100%)' 
          : '#f5f5f5', // Light gray background
      }}>
        <SearchBar onSearch={handleSearch} />
        <ButtonGroup 
          fullWidth 
          size="small" 
          sx={{ 
            mt: 1,
            background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#fff',
            borderRadius: '20px',
            padding: '2px',
            border: 'none',
            '& .MuiButton-root': {
              border: 'none',
              borderRadius: '18px !important',
              textTransform: 'none',
              fontWeight: 'normal',
            }
          }}
        >
          <Button
            variant={view === 'recent' ? 'contained' : 'outlined'}
            onClick={() => setView('recent')}
            startIcon={<MessageOutlined />}
            sx={{
              backgroundColor: view === 'recent' 
                ? theme.palette.mode === 'dark'
                  ? '#AD49E1'
                  : '#AD49E1'
                : 'transparent',
              color: theme.palette.mode === 'dark'
                ? view === 'recent' 
                  ? '#fff' 
                  : 'rgba(255, 255, 255, 0.7)'
                : view === 'recent' 
                  ? '#fff' 
                  : '#666',
              border: 'none',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: view === 'recent' 
                  ? theme.palette.mode === 'dark'
                    ? '#9A41C8'
                    : '#AD49E1'
                  : theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.04)',
                boxShadow: 'none',
              },
            }}
          >
            Recent
          </Button>
          <Button
            variant={view === 'groups' ? 'contained' : 'outlined'}
            onClick={() => setView('groups')}
            startIcon={<Groups />}
            sx={{
              backgroundColor: view === 'groups' 
                ? theme.palette.mode === 'dark'
                  ? '#AD49E1'
                  : '#AD49E1'
                : 'transparent',
              color: theme.palette.mode === 'dark'
                ? view === 'groups' 
                  ? '#fff' 
                  : 'rgba(255, 255, 255, 0.7)'
                : view === 'groups' 
                  ? '#fff' 
                  : '#666',
              border: 'none',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: view === 'groups' 
                  ? theme.palette.mode === 'dark'
                    ? '#9A41C8'
                    : '#AD49E1'
                  : theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.04)',
                boxShadow: 'none',
              },
            }}
          >
            Groups
          </Button>
          <Button
            variant={view === 'all' ? 'contained' : 'outlined'}
            onClick={() => setView('all')}
            startIcon={<PeopleOutline />}
            sx={{
              backgroundColor: view === 'all' 
                ? theme.palette.mode === 'dark'
                  ? '#AD49E1'
                  : '#AD49E1'
                : 'transparent',
              color: theme.palette.mode === 'dark'
                ? view === 'all' 
                  ? '#fff' 
                  : 'rgba(255, 255, 255, 0.7)'
                : view === 'all' 
                  ? '#fff' 
                  : '#666',
              border: 'none',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: view === 'all' 
                  ? theme.palette.mode === 'dark'
                    ? '#9A41C8'
                    : '#AD49E1'
                  : theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.04)',
                boxShadow: 'none',
              },
            }}
          >
            All Users
          </Button>
        </ButtonGroup>
      </Box>

      <List sx={{ 
        flexGrow: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(180deg, #29104A 0%, #522C5D 50%, #845162 100%)' 
          : 'transparent',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: theme.palette.mode === 'dark' ? '#29104A' : '#f1f1f1',
        },
        '&::-webkit-scrollbar-thumb': {
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(180deg, #845162 0%, #E3B8B1 100%)' 
            : '#888',
          borderRadius: '4px',
        },
      }}>
        {view === 'groups' && (
          <Box sx={{ 
            p: 2, 
            display: 'flex', 
            justifyContent: 'flex-end', 
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? '#522C5D' : 'divider',
          }}>
            <IconButton
              onClick={() => setCreateGroupOpen(true)}
              sx={{
                backgroundColor: theme.palette.mode === 'dark' ? '#8967B3' : 'primary.main',
                color: '#fff',
                '&:hover': { 
                  backgroundColor: theme.palette.mode === 'dark' ? '#7A1CAC' : 'primary.dark' 
                },
                width: 40,
                height: 40,
              }}
            >
              <AddIcon />
            </IconButton>
          </Box>
        )}
        {filteredUsers.map((item) => {
          const isGroup = item.type === 'group' || !item.userId;
          const itemId = isGroup ? `group_${item.id}` : item.userId;
          const lastMessage = lastMessages[itemId];

          return (
            <ListItem
              key={itemId}
              button
              selected={itemId === activeChatUserId}
              onClick={() => isGroup ? handleGroupSelect(item) : handleUserSelect(item)}
              sx={{
                mb: 0.5,
                borderRadius: 1,
                mx: 1,
                width: 'auto',
                backgroundColor: clickedItemId === itemId ? (
                  theme.palette.mode === 'dark'
                    ? 'rgba(173, 73, 225, 0.35)'
                    : 'rgba(173, 73, 225, 0.2)'
                ) : 'transparent',
                '&.Mui-selected': {
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(173, 73, 225, 0.2)'
                    : 'rgba(173, 73, 225, 0.1)',
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(173, 73, 225, 0.3)'
                      : 'rgba(173, 73, 225, 0.2)',
                  }
                },
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(173, 73, 225, 0.1)'
                    : 'rgba(173, 73, 225, 0.05)',
                }
              }}
            >
              <Box sx={{ position: 'relative', mr: 2 }}>
                {isGroup ? (
                  <AvatarGroup max={3} spacing="small" sx={{ width: 40, height: 40 }}>
                    {Object.values(item.members || {}).slice(0, 3).map((member, index) => (
                      <Avatar 
                        key={index} 
                        src={member.profileImageUrl}
                        sx={{ width: 24, height: 24 }}
                      />
                    ))}
                  </AvatarGroup>
                ) : (
                  <Avatar src={item.profileImageUrl}>
                    {!item.profileImageUrl && item.username?.[0]}
                  </Avatar>
                )}
                {!isGroup && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 12,
                      height: 12,
                      backgroundColor: 'transparent',
                      borderRadius: '50%',
                      border: '2px solid #7a49a5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {getStatusIcon(userStatuses[item.userId])}
                  </Box>
                )}
              </Box>
              <ListItemText
                primary={item.username || item.name}
                secondary={
                  lastMessage ? (
                    isGroup ? (
                      `${lastMessage.senderName}: ${lastMessage.message}`
                    ) : (
                      lastMessage.type === 'image' ? 
                        `${lastMessage.senderId === currentUser.uid ? 'You' : item.username} sent a photo` :
                        truncateMessage(lastMessage.senderId === currentUser.uid ? lastMessage.messageOG : lastMessage.message)
                    )
                  ) : (
                    isGroup ? `${Object.keys(item.members).length} members` : item.email
                  )
                }
                sx={{
                  minWidth: 0,
                  '& .MuiListItemText-primary, & .MuiListItemText-secondary': {
                    width: '100%',
                  },
                }}
              />
              {unreadMessages[itemId]?.unreadCount > 0 && (
                <Badge
                  badgeContent={unreadMessages[itemId].unreadCount}
                  color="primary"
                  sx={{
                    position: 'absolute',
                    right: 25,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    flexShrink: 0,
                  }}
                />
              )}
            </ListItem>
          );
        })}
      </List>

      {view === 'groups' && filteredUsers.length === 0 && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '200px',
          p: 2,
          textAlign: 'center',
          mt: 4,
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(41, 16, 74, 0.6)' : 'transparent',
          borderRadius: 2,
          mx: 2,
        }}>
          <Groups sx={{ 
            fontSize: 48, 
            color: theme.palette.mode === 'dark' ? '#8967B3' : 'text.secondary',
            mb: 2,
            opacity: 0.8,
          }} />
          <Typography 
            variant="body1" 
            sx={{ 
              color: theme.palette.mode === 'dark' ? '#E3B8B1' : 'text.secondary',
              mb: 1,
              fontWeight: 500,
            }}
          >
            No group chats yet
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setCreateGroupOpen(true)}
            sx={{ 
              mt: 2,
              borderColor: theme.palette.mode === 'dark' ? '#8967B3' : 'primary.main',
              color: theme.palette.mode === 'dark' ? '#8967B3' : 'primary.main',
              '&:hover': {
                borderColor: theme.palette.mode === 'dark' ? '#AD49E1' : 'primary.dark',
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(173, 73, 225, 0.08)'
                  : 'rgba(122, 28, 172, 0.04)',
              },
              textTransform: 'none',
              borderRadius: '20px',
              px: 3,
              py: 1,
            }}
          >
            Create New Group
          </Button>
        </Box>
      )}

      <Box sx={{ 
        borderTop: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? '#29104A' : 'divider',
        backgroundColor: theme.palette.mode === 'dark' ? '#150016' : '#ffffff',
      }}>
        <UserProfile currentUser={currentUser} handleLogout={handleLogout} />
      </Box>

      <CreateGroupDialog
        open={createGroupOpen}
        onClose={() => setCreateGroupOpen(false)}
        currentUser={currentUser}
        users={users}
      />
    </Box>
  );
};

export default Sidebar;
