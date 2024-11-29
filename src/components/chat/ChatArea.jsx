import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Avatar, Grid, TextField, Button, Menu, MenuItem, IconButton, Snackbar, CircularProgress, Fab, useTheme } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ReplyIcon from '@mui/icons-material/Reply';
import CircleIcon from '@mui/icons-material/Circle';
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { getDatabase, ref, onValue, push, set, serverTimestamp, off, update, get } from "firebase/database";
import { translateToLanguage } from '../../services/geminiTranslator';
import TranslationAnimation from './TranslationAnimation';
import UserInfoModal from './UserInfoModal';
import { keyframes } from '@mui/system';

const ChatArea = ({ currentUser, chatUser, onClose }) => {
  const theme = useTheme();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [showOriginalFor, setShowOriginalFor] = useState(null);
  const [contactLanguage, setContactLanguage] = useState(chatUser.language);
  const [showLanguageNotification, setShowLanguageNotification] = useState(false);
  const [chatUserStatus, setChatUserStatus] = useState('offline');
  const messagesEndRef = useRef(null);
  const previousChatUserRef = useRef(chatUser);
  const [isSending, setIsSending] = useState(false);
  const [isUserInfoModalOpen, setIsUserInfoModalOpen] = useState(false);
  const [currentVariation, setCurrentVariation] = useState({});
  const [regeneratingTranslation, setRegeneratingTranslation] = useState(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [shownTimestamps, setShownTimestamps] = useState(new Set());
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const hoverTimeoutRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const chatContainerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [isScrolledAway, setIsScrolledAway] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const messageRefs = useRef({});
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const [previousLanguage, setPreviousLanguage] = useState(chatUser.language);

  const pulseAnimation = keyframes`
    0% {
      box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.4);
    }
    50% {
      box-shadow: 0 0 0 10px rgba(255, 0, 0, 0);
      background-color: #FFCCCB; // Light red for contrast
    }
    100% {
      box-shadow: 0 0 0 0 rgba(255, 0, 0, 0);
      background-color: inherit; // Return to original background color
    }
  `;

  const scrollToBottom = useCallback(() => {
    if (isAtBottom) {
        // Check if the number of messages exceeds a certain threshold
        const scrollThreshold = 50; // Adjust this value as needed
        const behavior = messages.length > scrollThreshold ? 'auto' : 'smooth';
        messagesEndRef.current?.scrollIntoView({ behavior });
    }
  }, [isAtBottom, messages.length]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = chatContainer;
        const isBottom = scrollHeight - scrollTop - clientHeight < 1;
        setIsAtBottom(isBottom);
        
        // Check if scrolled away (e.g., more than 300px from bottom)
        const scrollThreshold = 300;
        setIsScrolledAway(scrollHeight - scrollTop - clientHeight > scrollThreshold);
        
        // If scrolled to bottom, reset hasNewMessages
        if (isBottom) {
          setHasNewMessages(false);
        }
      };

      chatContainer.addEventListener('scroll', handleScroll);
      return () => chatContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    if (chatUser) {
      const db = getDatabase();
      const chatId = [currentUser.uid, chatUser.userId].sort().join('_');
      const messagesRef = ref(db, `messages/${chatId}`);
      const userLanguageRef = ref(db, `users/${chatUser.userId}/language`);
      const userStatusRef = ref(db, `status/${chatUser.userId}`);

      const messageUnsubscribe = onValue(messagesRef, (snapshot) => {
        const data = snapshot.val();
        const newMessages = data ? Object.values(data) : [];
        setMessages(newMessages);
        
        // Check if there are new messages and the user is not at the bottom
        if (newMessages.length > messages.length && !isAtBottom) {
          setHasNewMessages(true);
        }
      });

      const languageUnsubscribe = onValue(userLanguageRef, (snapshot) => {
        const newLanguage = snapshot.val();
        if (newLanguage && newLanguage !== previousLanguage) {
          setContactLanguage(newLanguage);
          if (previousChatUserRef.current.userId === chatUser.userId) {
            setShowLanguageNotification(true);
          }
          setPreviousLanguage(newLanguage);
        }
      });

      const statusUnsubscribe = onValue(userStatusRef, (snapshot) => {
        const status = snapshot.val();
        setChatUserStatus(status || 'offline');
      });

      return () => {
        off(messagesRef);
        off(userLanguageRef);
        off(userStatusRef);
      };
    }
  }, [currentUser, chatUser, messages.length, isAtBottom, previousLanguage]);

  useEffect(() => {
    setContactLanguage(chatUser.language);
    setPreviousLanguage(chatUser.language);
    setShowLanguageNotification(false);
    previousChatUserRef.current = chatUser;
  }, [chatUser]);

  useEffect(() => {
    if (isAtBottom) {
      setHasNewMessages(false);
    }
  }, [isAtBottom]);

  useEffect(() => {
    if (chatUser) {
      scrollToBottom();
    }
  }, [chatUser, scrollToBottom]);

  const handleSendMessage = useCallback(async () => {
    if (newMessage.trim() === '' || isSending) return;

    setShouldScrollToBottom(true);
    setIsSending(true);
    const messageToSend = newMessage;
    setNewMessage('');

    const db = getDatabase();
    const chatId = [currentUser.uid, chatUser.userId].sort().join('_');
    const messagesRef = ref(db, `messages/${chatId}`);
    const newMessageRef = push(messagesRef);

    const messageData = {
      messageId: newMessageRef.key,
      messageOG: messageToSend,
      message: "Translating...",
      senderId: currentUser.uid,
      timestamp: serverTimestamp(),
      replyTo: replyingTo ? {
        messageId: replyingTo.messageId,
        message: replyingTo.message,
        senderId: replyingTo.senderId
      } : null
    };

    setReplyingTo(null); // Clear the replying state

    try {
      await set(newMessageRef, messageData);
      const translatedMessage = await translateToLanguage(messageToSend, contactLanguage);
      
      // Parse the translated message to extract the three variations
      const variations = translatedMessage.split('\n').filter(line => line.trim() !== '');
      const messageVar1 = variations[0]?.replace(/^\d+\.\s*/, '') || messageToSend;
      const messageVar2 = variations[1]?.replace(/^\d+\.\s*/, '') || '';
      const messageVar3 = variations[2]?.replace(/^\d+\.\s*/, '') || '';

      await set(newMessageRef, {
        ...messageData,
        message: messageVar1,
        messageVar1: messageVar1,
        messageVar2: messageVar2,
        messageVar3: messageVar3,
      });
    } catch (error) {
      console.error('Translation error:', error);
      await set(newMessageRef, {
        ...messageData,
        message: messageToSend,
      });
    } finally {
      setIsSending(false);
    }
  }, [newMessage, currentUser.uid, chatUser.userId, contactLanguage, isSending, replyingTo]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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

  const handleMessageClick = (event, message) => {
    if (message.senderId !== currentUser.uid) {
      setAnchorEl(event.currentTarget);
      setSelectedMessageId(message.messageId);
    } else {
      // Toggle timestamp visibility for current user's messages
      setShownTimestamps(prev => {
        const newSet = new Set(prev);
        if (newSet.has(message.messageId)) {
          newSet.delete(message.messageId);
        } else {
          newSet.add(message.messageId);
        }
        return newSet;
      });
    }
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedMessageId(null);
    // We no longer clear all shown timestamps here
  };

  const handleMenuOption = async (option, messageId) => {
    if (option === 'regenerate') {
      setShouldScrollToBottom(false);
      setRegeneratingTranslation(messageId);
      const db = getDatabase();
      const chatId = [currentUser.uid, chatUser.userId].sort().join('_');
      const messageRef = ref(db, `messages/${chatId}/${messageId}`);

      const snapshot = await get(messageRef);
      const messageData = snapshot.val();

      if (messageData) {
        let nextVar = 'messageVar1';
        if (messageData.message === messageData.messageVar1) nextVar = 'messageVar2';
        else if (messageData.message === messageData.messageVar2) nextVar = 'messageVar3';
        else if (messageData.message === messageData.messageVar3) nextVar = 'messageVar1';

        await update(messageRef, { message: messageData[nextVar] });
        setCurrentVariation(prev => ({...prev, [messageId]: nextVar}));
        
        // Set a timeout to remove the regenerating state after 1 second
        setTimeout(() => {
          setRegeneratingTranslation(null);
          // Remove this line to prevent scrolling after regeneration
          // setShouldScrollToBottom(true);
        }, 1000);
      }
    } else if (option === 'toggleOriginal') {
      setShowOriginalFor(prev => prev === messageId ? null : messageId);
    }
    handleCloseMenu();
  };

  const handleUserInfoClick = () => {
    setIsUserInfoModalOpen(true);
  };

  const handleMouseEnter = (messageId) => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredMessageId(messageId);
    }, 1000); // 1000 milliseconds = 1 second
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredMessageId(null);
  };

  const markMessagesAsRead = useCallback(() => {
    if (chatUser && isAtBottom) {
      const db = getDatabase();
      const chatId = [currentUser.uid, chatUser.userId].sort().join('_');
      const messagesRef = ref(db, `messages/${chatId}`);

      get(messagesRef).then((snapshot) => {
        const messages = snapshot.val();
        if (messages) {
          const updates = {};
          Object.keys(messages).forEach((messageKey) => {
            if (messages[messageKey].senderId !== currentUser.uid && !messages[messageKey].read) {
              updates[`${messageKey}/read`] = true;
            }
          });
          if (Object.keys(updates).length > 0) {
            update(messagesRef, updates);
          }
        }
      });
    }
  }, [currentUser.uid, chatUser, isAtBottom]);

  useEffect(() => {
    markMessagesAsRead();
  }, [markMessagesAsRead, messages, isAtBottom]);

  const handleScrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollButton(false);
    setIsAtBottom(true);
    setHasNewMessages(false);
    markMessagesAsRead();
  };

  const handleReply = (message) => {
    setReplyingTo(message);
    // Optionally, you can focus on the text input here
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const scrollToMessage = (messageId) => {
    const messageElement = messageRefs.current[messageId];
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMessageId(messageId);
      setTimeout(() => setHighlightedMessageId(null), 5000); // Remove highlight after 5 seconds
    }
  };

  const handleReplyClick = (replyToMessageId) => {
    scrollToMessage(replyToMessageId);
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

  const getStatusText = (status) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'busy':
        return 'Busy';
      case 'away':
        return 'Away';
      default:
        return 'Offline';
    }
  };

  return (
    <Box sx={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: theme.palette.mode === 'dark' ? '#150016' : 'background.paper',
    }}>
      {/* Chat Header */}
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
        <Box sx={{ position: 'relative', mr: 2 }}>
          <Avatar
            src={chatUser.profileImageUrl}
            sx={{ width: 40, height: 40, cursor: 'pointer' }}
            onClick={() => setIsUserInfoModalOpen(true)}
          />
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
              '& .MuiSvgIcon-root': {
                width: '100%',
                height: '100%',
              }
            }}
          >
            {getStatusIcon(chatUserStatus)}
          </Box>
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 500, color: theme.palette.text.primary }}>
            {chatUser.username}
          </Typography>
          <Typography variant="caption" sx={{ color: getStatusColor(chatUserStatus), display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {getStatusText(chatUserStatus)}
          </Typography>
        </Box>
        <Box sx={{ ml: 'auto' }}>
          <IconButton onClick={onClose} sx={{ color: theme.palette.text.secondary }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <Box ref={chatContainerRef} sx={{ 
        flexGrow: 1,
        overflowY: 'auto',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(180deg, #29104A 0%, #522C5D 50%, #845162 100%)' 
          : 'background.default',
        p: 3,
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(180deg, #845162 0%, #E3B8B1 100%)' 
            : '#888',
          borderRadius: '4px',
        },
      }}>
        {messages.map((msg, index) => {
          const showAvatar = index === messages.length - 1 || messages[index + 1]?.senderId !== msg.senderId;
          const isLastMessageFromContact = (index === messages.length - 1 || messages[index + 1]?.senderId !== msg.senderId) && msg.senderId !== currentUser.uid;
          const isLastMessageFromCurrentUser = (index === messages.length - 1 || messages[index + 1]?.senderId !== msg.senderId) && msg.senderId === currentUser.uid;
          const isCurrentUserMessage = msg.senderId === currentUser.uid;
          const messageToDisplay = isCurrentUserMessage ? msg.messageOG : (msg.message || msg.messageOG);
          const isTranslating = !isCurrentUserMessage && msg.message === "Translating...";

          return (
            <Grid
              container
              spacing={2}
              key={index}
              ref={el => messageRefs.current[msg.messageId] = el}
              justifyContent={isCurrentUserMessage ? 'flex-end' : 'flex-start'}
              alignItems="flex-end"
              sx={{ 
                mb: 2, 
                position: 'relative',
              }}
              onMouseEnter={() => handleMouseEnter(msg.messageId)}
              onMouseLeave={handleMouseLeave}
            >
              {!isCurrentUserMessage && (
                <Grid item sx={{ width: 40, visibility: showAvatar ? 'visible' : 'hidden' }}>
                  {showAvatar && (
                    <Avatar 
                      src={chatUser.profileImageUrl} 
                      sx={{ width: 32, height: 32 }}
                    />
                  )}
                </Grid>
              )}
              <Grid 
                item 
                xs="auto"
                sx={{ 
                  maxWidth: { xs: 'calc(100% - 48px)', sm: 'calc(60% - 48px)', md: 'calc(50% - 48px)' },
                  minWidth: '50px',
                  position: 'relative'
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    backgroundColor: isCurrentUserMessage
                      ? theme.palette.mode === 'dark'
                        ? 'rgba(82, 44, 93, 0.85)'  // Solid color with slight transparency for user messages
                        : theme.palette.primary.main
                      : theme.palette.mode === 'dark'
                        ? 'rgba(132, 81, 98, 0.75)' // Solid color with slight transparency for contact messages
                        : '#E5D9F2',
                    color: isCurrentUserMessage 
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
                    animation: highlightedMessageId === msg.messageId ? `${pulseAnimation} 5s ease-in-out` : 'none',
                    '&:before': (!isCurrentUserMessage && isLastMessageFromContact) ? {
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
                    } : (isCurrentUserMessage && isLastMessageFromCurrentUser) ? {
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
                    } : undefined,
                    '&:hover': {
                      backgroundColor: isCurrentUserMessage
                        ? theme.palette.mode === 'dark'
                          ? 'rgba(82, 44, 93, 0.95)'  // Slightly more opaque on hover
                          : theme.palette.primary.dark
                        : theme.palette.mode === 'dark'
                          ? 'rgba(132, 81, 98, 0.85)'  // Slightly more opaque on hover
                          : '#d8c8eb',
                    },
                  }}
                  onClick={(e) => handleMessageClick(e, msg)}
                >
                  {msg.replyTo && (
                    <Box 
                      sx={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.05)', 
                        borderLeft: '3px solid #AD49E1', 
                        padding: '4px 8px', 
                        marginBottom: '4px', 
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReplyClick(msg.replyTo.messageId);
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                        {msg.replyTo.senderId === currentUser.uid ? 'You' : chatUser.username}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                        {msg.replyTo.message}
                      </Typography>
                    </Box>
                  )}
                  {regeneratingTranslation === msg.messageId ? (
                    <TranslationAnimation />
                  ) : isTranslating ? (
                    <TranslationAnimation />
                  ) : (
                    <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>{messageToDisplay}</Typography>
                  )}
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block', 
                      mt: 0.5,
                      color: 'rgba(0, 0, 0, 0.6)',
                      maxHeight: showOriginalFor === msg.messageId ? '100px' : '0px',
                      opacity: showOriginalFor === msg.messageId ? 1 : 0,
                      overflow: 'hidden',
                      transition: 'all 0.3s ease-in-out',
                    }}
                  >
                    {msg.messageOG}
                  </Typography>
                </Box>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    position: 'absolute',
                    [isCurrentUserMessage ? 'left' : 'right']: '-90px',
                    bottom: 0,
                    whiteSpace: 'nowrap',
                    color: 'rgba(0, 0, 0, 0.7)',
                    opacity: hoveredMessageId === msg.messageId ? 1 : 0,
                    visibility: hoveredMessageId === msg.messageId ? 'visible' : 'hidden',
                    transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    fontSize: '0.75rem',
                  }}
                >
                  {msg.timestamp ? formatTimestamp(msg.timestamp) : 'Sending...'}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReply(msg);
                  }}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    [isCurrentUserMessage ? 'left' : 'right']: '-28px',
                    transform: 'translateY(-50%)',
                    opacity: hoveredMessageId === msg.messageId ? 1 : 0,
                    transition: 'opacity 0.2s',
                  }}
                >
                  <ReplyIcon fontSize="small" />
                </IconButton>
              </Grid>
            </Grid>
          );
        })}

        <div ref={messagesEndRef} />
      </Box>

      {isScrolledAway && (
        <Fab
          color="primary"
          variant={hasNewMessages ? "extended" : "circular"}
          size={hasNewMessages ? "medium" : "small"}
          onClick={handleScrollToBottom}
          sx={{
            position: 'absolute',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#8967B3',
            '&:hover': { backgroundColor: '#7A1CAC' },
            zIndex: 1000,
            boxShadow: '0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12)',
          }}
        >
          <KeyboardArrowDownIcon sx={{ mr: hasNewMessages ? 1 : 0 }} />
          {hasNewMessages && "New Messages"}
        </Fab>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        sx={{
          '& .MuiPaper-root': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? '#2f3136' 
              : '#CDC1FF',
            borderRadius: 2,
            boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.2)',
            minWidth: 180,
            border: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        {messages.find(msg => msg.messageId === selectedMessageId)?.messageVar2 && (
          <MenuItem
            onClick={() => handleMenuOption('regenerate', selectedMessageId)}
            sx={{
              fontSize: '14px',
              padding: '8px 16px',
              '&:hover': {
                backgroundColor: '#FFE1FF',
              },
            }}
          >
            Regenerate Translation
          </MenuItem>
        )}
        <MenuItem
          onClick={() => handleMenuOption('toggleOriginal', selectedMessageId)}
          sx={{
            fontSize: '14px',
            padding: '8px 16px',
            '&:hover': {
              backgroundColor: '#FFE1FF',
            },
          }}
        >
          {showOriginalFor === selectedMessageId ? 'Hide Original Message' : 'Show Original Message'}
        </MenuItem>
      </Menu>

      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        p: 2,
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(180deg, #522C5D 0%, #29104A 100%)' 
          : 'background.paper',
        borderTop: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? '#522C5D' : 'divider',
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 -2px 8px rgba(21, 0, 22, 0.2)'
          : '0 -2px 8px rgba(0, 0, 0, 0.05)',
        position: 'relative',
        zIndex: 1,
      }}>
        {replyingTo && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.05)' 
              : '#f0f4f8', 
            padding: '8px', 
            borderRadius: '4px', 
            marginBottom: '8px'
          }}>
            <Typography variant="body2" sx={{ flexGrow: 1, marginRight: '8px' }}>
              Replying to: {replyingTo.message}
            </Typography>
            <IconButton size="small" onClick={handleCancelReply}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSending}
            sx={{
              borderRadius: 2,
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.05)' 
                : '#f5f7fb',
              mr: 2,
              '& .MuiOutlinedInput-root': {
                color: 'text.primary',
                '& fieldset': {
                  borderColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.2)' 
                    : '#ddd',
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main,
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              },
              '& .MuiInputBase-input::placeholder': {
                color: theme.palette.text.secondary,
                opacity: theme.palette.mode === 'dark' ? 0.5 : 0.7,
              },
            }}
          />
          <IconButton 
            color="primary" 
            onClick={handleSendMessage}
            disabled={isSending || newMessage.trim() === ''}
            sx={{ 
              backgroundColor: theme.palette.primary.main, 
              color: '#fff',
              '&:hover': { 
                backgroundColor: theme.palette.primary.dark 
              },
              '&.Mui-disabled': { 
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.12)' 
                  : '#ccc' 
              },
            }}
          >
            {isSending ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
          </IconButton>
        </Box>
      </Box>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={showLanguageNotification}
        autoHideDuration={3000}
        onClose={() => setShowLanguageNotification(false)}
        message={`${chatUser.username} has updated their language to ${contactLanguage}`}
      />

      <UserInfoModal
        user={chatUser}
        open={isUserInfoModalOpen}
        onClose={() => setIsUserInfoModalOpen(false)}
      />
    </Box>
  );
};

export default React.memo(ChatArea);