import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { 
  Box, Typography, Avatar, IconButton, TextField, CircularProgress,
  Menu, MenuItem, Tooltip, AvatarGroup, Dialog, DialogTitle, 
  DialogContent, List, ListItem, ListItemAvatar, ListItemText,
  useTheme, Snackbar, Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { getDatabase, ref, onValue, push, set, serverTimestamp, off, remove, update } from "firebase/database";
import { translateToMultipleLanguages } from '../../services/geminiTranslator';
import GroupInfoDialog from './GroupInfoDialog';
import { debounce, throttle } from 'lodash';

const GroupChatArea = ({ currentUser, groupChat, onClose, onGroupUpdate }) => {
  const theme = useTheme();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [members, setMembers] = useState({});
  const [isSending, setIsSending] = useState(false);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [userLanguages, setUserLanguages] = useState({});
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [notification, setNotification] = useState(null);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [filteredAvailableUsers, setFilteredAvailableUsers] = useState([]);
  const [currentGroupChat, setCurrentGroupChat] = useState(groupChat);

  // Debounce the hover effects
  const debouncedSetHoveredMessageId = useCallback(
    debounce((id) => {
      setHoveredMessageId(id);
    }, 100),
    []
  );

  // Fetch group members and their languages
  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, 'users');
    const groupRef = ref(db, `groups/${groupChat.id}`);

    // Combine both listeners into one
    const unsubscribe = onValue(groupRef, (snapshot) => {
      const groupData = snapshot.val();
      if (groupData) {
        setCurrentGroupChat(groupData);
        
        // Get users data only when needed
        onValue(usersRef, (usersSnapshot) => {
          const usersData = usersSnapshot.val();
          if (usersData && groupData.members) {
            const groupMembers = {};
            const languages = {};
            
            Object.keys(groupData.members).forEach(userId => {
              if (usersData[userId]) {
                groupMembers[userId] = {
                  ...usersData[userId],
                  role: groupData.members[userId].role
                };
                languages[userId] = usersData[userId].language;
              }
            });
            
            setMembers(groupMembers);
            setUserLanguages(languages);
          }
        }, { onlyOnce: true }); // Only fetch users once
        
        if (onGroupUpdate) {
          onGroupUpdate(groupChat.id);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [groupChat.id, onGroupUpdate]);

  // Fetch messages
  useEffect(() => {
    const db = getDatabase();
    const messagesRef = ref(db, `groupMessages/${groupChat.id}`);

    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageList = Object.values(data).sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );
        setMessages(messageList);

        // Show notification for new messages
        const lastMessage = messageList[messageList.length - 1];
        if (
          lastMessage.senderId !== currentUser.uid &&
          document.hidden && // Only show notification if window is not focused
          lastMessage.timestamp > Date.now() - 1000 // Only for messages in the last second
        ) {
          setNotification({
            sender: members[lastMessage.senderId]?.username || 'Someone',
            message: lastMessage.message
          });
        }
      } else {
        setMessages([]);
      }
    });

    return () => off(messagesRef);
  }, [groupChat.id]);

  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, 'users');

    onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val();
      if (usersData) {
        // Filter out users already in the group
        const nonMembers = Object.values(usersData).filter(user => 
          user.userId !== currentUser.uid && 
          !groupChat.members[user.userId]
        );
        setAvailableUsers(nonMembers);
      }
    });

    return () => off(usersRef);
  }, [groupChat.members, currentUser.uid]);

  useEffect(() => {
    if (memberSearchQuery.trim()) {
      const filtered = availableUsers.filter(user => 
        user.username.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(memberSearchQuery.toLowerCase())
      );
      setFilteredAvailableUsers(filtered);
    } else {
      setFilteredAvailableUsers(availableUsers);
    }
  }, [memberSearchQuery, availableUsers]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Memoize target languages
  const targetLanguages = useMemo(() => 
    [...new Set(Object.values(userLanguages))].filter(
      lang => lang && lang !== userLanguages[currentUser.uid]
    ),
    [userLanguages, currentUser.uid]
  );

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || isSending) return;
    setIsSending(true);
    const messageToSend = newMessage;
    setNewMessage('');

    const db = getDatabase();
    const messagesRef = ref(db, `groupMessages/${groupChat.id}`);
    const newMessageRef = push(messagesRef);

    try {
      // Only translate if there are target languages
      const translations = targetLanguages.length > 0 
        ? await translateToMultipleLanguages(messageToSend, targetLanguages, true)
        : {};

      const messageData = {
        messageId: newMessageRef.key,
        senderId: currentUser.uid,
        senderName: members[currentUser.uid]?.username,
        message: messageToSend,
        translations,
        timestamp: serverTimestamp(),
        originalLanguage: userLanguages[currentUser.uid] || 'en'
      };

      await set(newMessageRef, messageData);
    } catch (error) {
      console.error('Error sending message:', error);
      setNotification({
        severity: 'error',
        message: 'Failed to send message. Please try again.'
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLeaveGroup = async () => {
    if (window.confirm('Are you sure you want to leave this group?')) {
      try {
        const db = getDatabase();
        const memberRef = ref(db, `groups/${groupChat.id}/members/${currentUser.uid}`);
        await remove(memberRef);
        
        const userGroupRef = ref(db, `userGroups/${currentUser.uid}/${groupChat.id}`);
        await remove(userGroupRef);
        
        // Notify parent component of the update
        if (onGroupUpdate) {
          onGroupUpdate(groupChat.id);
        }
        
        onClose();
      } catch (error) {
        console.error('Error leaving group:', error);
        setNotification({
          severity: 'error',
          message: 'Failed to leave group. Please try again.'
        });
      }
    }
  };

  const getMessageDisplay = (message) => {
    const userLanguage = userLanguages[currentUser.uid];
    
    // If it's the sender's message, show original
    if (message.senderId === currentUser.uid) {
      return message.message;
    }
    
    // If translation exists for user's language, show it
    if (message.translations && message.translations[userLanguage]) {
      return message.translations[userLanguage];
    }
    
    // Fallback to original message
    return message.message;
  };

  const formatTimestamp = (timestamp) => {
    const messageDate = new Date(timestamp);
    const now = new Date();

    const isToday = messageDate.toDateString() === now.toDateString();
    const isYesterday = messageDate.toDateString() === new Date(now.setDate(now.getDate() - 1)).toDateString();

    const timeString = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    if (isToday) {
      return `Today ${timeString}`;
    } else if (isYesterday) {
      return `Yesterday ${timeString}`;
    } else {
      const dateString = messageDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      return `(${dateString}) ${timeString}`;
    }
  };

  // Add mouse enter/leave handlers to the message Box component
  const handleMouseEnter = useCallback((messageId) => {
    debouncedSetHoveredMessageId(messageId);
  }, [debouncedSetHoveredMessageId]);

  const handleMouseLeave = useCallback(() => {
    debouncedSetHoveredMessageId(null);
  }, [debouncedSetHoveredMessageId]);

  const handleAddMembers = async (selectedUsers) => {
    try {
      const db = getDatabase();
      const updates = {};
      
      selectedUsers.forEach(user => {
        updates[`groups/${currentGroupChat.id}/members/${user.userId}`] = {
          role: 'member',
          joinedAt: serverTimestamp()
        };
      });
      
      await update(ref(db), updates);
      setAddMemberDialogOpen(false);
      setMembersDialogOpen(false);
      
      // Notify parent component of the update
      if (onGroupUpdate) {
        onGroupUpdate(currentGroupChat.id);
      }

      // Show success notification
      setNotification({
        severity: 'success',
        message: 'Member(s) added successfully'
      });

      // Update available users list
      setAvailableUsers(prev => 
        prev.filter(user => !selectedUsers.some(selected => selected.userId === user.userId))
      );
    } catch (error) {
      console.error('Error adding members:', error);
      setNotification({
        severity: 'error',
        message: 'Failed to add members. Please try again.'
      });
    }
  };

  // Memoize the message list component
  const MessageList = memo(({ messages, currentUser, members, userLanguages, hoveredMessageId, onMouseEnter, onMouseLeave }) => {
    return messages.map((message) => (
      <Box
        key={message.messageId}
        sx={{
          display: 'flex',
          justifyContent: message.senderId === currentUser.uid ? 'flex-end' : 'flex-start',
          mb: 2,
          position: 'relative',
        }}
        onMouseEnter={() => onMouseEnter(message.messageId)}
        onMouseLeave={onMouseLeave}
      >
        {message.senderId !== currentUser.uid && (
          <Box sx={{ position: 'relative', mr: 2 }}>
            <Avatar
              src={members[message.senderId]?.profileImageUrl}
              sx={{ width: 32, height: 32 }}
            />
          </Box>
        )}
        <Box
          sx={{
            maxWidth: { xs: 'calc(100% - 48px)', sm: 'calc(60% - 48px)', md: 'calc(50% - 48px)' },
            minWidth: '50px',
            position: 'relative'
          }}
        >
          {message.senderId !== currentUser.uid && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: theme.palette.text.secondary,
                ml: 1,
                mb: 0.5,
                display: 'block'
              }}
            >
              {members[message.senderId]?.username}
            </Typography>
          )}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              backgroundColor: message.senderId === currentUser.uid
                ? theme.palette.mode === 'dark'
                  ? 'rgba(82, 44, 93, 0.85)'
                  : theme.palette.primary.main
                : theme.palette.mode === 'dark'
                  ? 'rgba(132, 81, 98, 0.75)'
                  : '#E5D9F2',
              color: message.senderId === currentUser.uid 
                ? '#fff' 
                : theme.palette.text.primary,
              borderRadius: '16px',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              wordWrap: 'break-word',
              maxWidth: '100%',
              display: 'inline-block',
              transition: 'all 0.3s ease-in-out',
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              hyphens: 'auto',
              '&:before': message.senderId !== currentUser.uid ? {
                content: '""',
                position: 'absolute',
                bottom: 8,
                left: -6,
                width: 0,
                height: 0,
                borderTop: '8px solid transparent',
                borderRight: theme.palette.mode === 'dark' 
                  ? `8px solid rgba(132, 81, 98, 0.75)`
                  : `8px solid #E5D9F2`,
                borderBottom: '8px solid transparent',
              } : {
                content: '""',
                position: 'absolute',
                bottom: -8,
                right: 10,
                width: 0,
                height: 0,
                borderTop: theme.palette.mode === 'dark'
                  ? `9px solid rgba(82, 44, 93, 0.85)`
                  : `9px solid ${theme.palette.primary.main}`,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
              },
            }}
          >
            <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
              {getMessageDisplay(message)}
            </Typography>
          </Box>
          <Typography 
            variant="caption" 
            sx={{ 
              position: 'absolute',
              [message.senderId === currentUser.uid ? 'left' : 'right']: '-90px',
              bottom: 0,
              whiteSpace: 'nowrap',
              color: 'rgba(0, 0, 0, 0.7)',
              opacity: hoveredMessageId === message.messageId ? 1 : 0,
              visibility: hoveredMessageId === message.messageId ? 'visible' : 'hidden',
              transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              padding: '2px 6px',
              borderRadius: '4px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              fontSize: '0.75rem',
            }}
          >
            {message.timestamp ? formatTimestamp(message.timestamp) : 'Sending...'}
          </Typography>
        </Box>
      </Box>
    ));
  });

  return (
    <Box sx={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: theme.palette.mode === 'dark' ? '#150016' : 'background.paper',
    }}>
      {/* Header */}
      <Box sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? '#522C5D' : 'divider',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #29104A 0%, #522C5D 100%)'
          : '#ffffff',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <AvatarGroup max={3} sx={{ mr: 2 }}>
            {Object.values(members).map((member) => (
              <Avatar key={member.userId} src={member.profileImageUrl} />
            ))}
          </AvatarGroup>
          <Box>
            <Typography variant="h6">{currentGroupChat.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {Object.keys(members).length} members
            </Typography>
          </Box>
        </Box>
        <Box>
          <Tooltip title="Group Info">
            <IconButton onClick={() => setMembersDialogOpen(true)}>
              <InfoIcon />
            </IconButton>
          </Tooltip>
          <IconButton onClick={handleLeaveGroup}>
            <ExitToAppIcon />
          </IconButton>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Messages Area */}
      <Box
        ref={chatContainerRef}
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          p: 2,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(180deg, #29104A 0%, #522C5D 50%, #845162 100%)'
            : 'background.default',
        }}
      >
        <MessageList 
          messages={messages}
          currentUser={currentUser}
          members={members}
          userLanguages={userLanguages}
          hoveredMessageId={hoveredMessageId}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box sx={{
        p: 2,
        borderTop: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? '#522C5D' : 'divider',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #522C5D 0%, #29104A 100%)'
          : 'background.paper',
      }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            variant="outlined"
            disabled={isSending}
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={isSending || !newMessage.trim()}
          >
            {isSending ? <CircularProgress size={24} /> : <SendIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Members Dialog */}
      <GroupInfoDialog
        open={membersDialogOpen}
        onClose={() => setMembersDialogOpen(false)}
        members={members}
        currentUser={currentUser}
        currentGroupChat={currentGroupChat}
        onAddMember={() => setAddMemberDialogOpen(true)}
        onGroupUpdate={onGroupUpdate}
        setNotification={setNotification}
      />

      {/* Add Member Dialog */}
      <Dialog
        open={addMemberDialogOpen}
        onClose={() => setAddMemberDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #29104A 0%, #522C5D 100%)'
              : 'background.paper',
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{
          borderBottom: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? '#522C5D' : 'divider',
          color: theme.palette.mode === 'dark' ? '#E3B8B1' : 'text.primary',
          fontSize: '1.2rem',
          fontWeight: 500,
        }}>
          Add Members
        </DialogTitle>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: theme.palette.mode === 'dark' ? '#522C5D' : 'divider' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search users..."
            value={memberSearchQuery}
            onChange={(e) => setMemberSearchQuery(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(82, 44, 93, 0.3)' : 'background.paper',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(82, 44, 93, 0.4)' : 'background.paper',
                },
                '&.Mui-focused': {
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(82, 44, 93, 0.5)' : 'background.paper',
                }
              },
              '& .MuiOutlinedInput-input': {
                color: theme.palette.mode === 'dark' ? '#E3B8B1' : 'text.primary',
              },
            }}
          />
        </Box>
        <DialogContent sx={{ p: 0 }}>
          <List sx={{
            maxHeight: '400px',
            overflow: 'auto',
            '& .MuiListItem-root': {
              borderBottom: '1px solid',
              borderColor: theme.palette.mode === 'dark' ? 'rgba(82, 44, 93, 0.3)' : 'divider',
              py: 2,
            },
            '& .MuiListItem-root:last-child': {
              borderBottom: 'none',
            },
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
            {filteredAvailableUsers.length > 0 ? (
              filteredAvailableUsers.map((user) => (
                <ListItem 
                  key={user.userId}
                  button
                  onClick={() => handleAddMembers([user])}
                  sx={{
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(173, 73, 225, 0.08)'
                        : 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar 
                      src={user.profileImageUrl}
                      sx={{
                        width: 40,
                        height: 40,
                        border: '2px solid',
                        borderColor: theme.palette.mode === 'dark' ? '#8967B3' : 'primary.main',
                      }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography sx={{
                        color: theme.palette.mode === 'dark' ? '#E3B8B1' : 'text.primary',
                        fontWeight: 500,
                      }}>
                        {user.username}
                      </Typography>
                    }
                    secondary={
                      <Typography 
                        variant="body2" 
                        sx={{
                          color: theme.palette.mode === 'dark' ? '#8967B3' : 'text.secondary',
                        }}
                      >
                        {user.email}
                      </Typography>
                    }
                  />
                </ListItem>
              ))
            ) : (
              <Box sx={{ 
                p: 3, 
                textAlign: 'center',
                color: theme.palette.mode === 'dark' ? '#8967B3' : 'text.secondary',
              }}>
                <Typography>No users found</Typography>
              </Box>
            )}
          </List>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={Boolean(notification)}
        autoHideDuration={3000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={notification?.severity || "info"} onClose={() => setNotification(null)}>
          <Typography variant="subtitle2">{notification?.sender}</Typography>
          <Typography variant="body2">{notification?.message}</Typography>
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GroupChatArea; 