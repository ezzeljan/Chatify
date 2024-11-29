import React, { useState } from 'react';
import { Box, Popover } from '@mui/material';
import { useTheme } from '@mui/material';
import { getDatabase, ref, update, set } from "firebase/database";
import EmojiPicker from 'emoji-picker-react';

const MessageReactions = ({ 
  messageReactions = [], 
  messageId, 
  currentUser, 
  chatUser,
  groupId,
  isCurrentUserMessage,
  reactionAnchorEl,
  selectedMessageForReaction,
  onCloseReactionMenu,
  onReactionClick
}) => {
  const theme = useTheme();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiAnchorEl, setEmojiAnchorEl] = useState(null);
  
  // Common emoji reactions
  const reactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  const handleAddReaction = async (emoji, messageId) => {
    const db = getDatabase();
    let messageRef;
    
    // Determine if this is a group chat or direct message
    if (groupId) {
      messageRef = ref(db, `groupMessages/${groupId}/${messageId}/reactions`);
    } else {
      const chatId = [currentUser.uid, chatUser.userId].sort().join('_');
      messageRef = ref(db, `messages/${chatId}/${messageId}/reactions`);
    }
    
    const reactionKey = `${currentUser.uid}_${emoji}`;
    const updates = {};
    updates[reactionKey] = {
      emoji,
      userId: currentUser.uid,
      timestamp: Date.now()
    };
    
    await update(messageRef, updates);
    onCloseReactionMenu();
    setShowEmojiPicker(false);
  };

  const handleRemoveReaction = async (messageId, emoji) => {
    const db = getDatabase();
    let reactionRef;
    
    if (groupId) {
      reactionRef = ref(db, `groupMessages/${groupId}/${messageId}/reactions/${currentUser.uid}_${emoji}`);
    } else {
      const chatId = [currentUser.uid, chatUser.userId].sort().join('_');
      reactionRef = ref(db, `messages/${chatId}/${messageId}/reactions/${currentUser.uid}_${emoji}`);
    }
    
    await set(reactionRef, null);
  };

  const handleEmojiSelect = (emojiData) => {
    if (selectedMessageForReaction) {
      handleAddReaction(emojiData.emoji, selectedMessageForReaction.messageId);
    }
  };

  return (
    <>
      {/* Reactions display */}
      {messageReactions.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.5,
            position: 'absolute',
            bottom: 0,
            left: isCurrentUserMessage ? 'auto' : 10,
            right: isCurrentUserMessage ? 10 : 'auto',
            transform: 'translateY(50%)',
            zIndex: 1,
            flexDirection: 'row',
            '& > div': {
              backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.15)'
                : 'rgba(255, 255, 255, 1)',
              borderRadius: '12px',
              padding: '1px 4px',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              fontSize: '0.8rem',
              border: '1px solid',
              borderColor: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.2)'
                : 'rgba(0, 0, 0, 0.15)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.15)',
              minWidth: '28px',
              justifyContent: 'center',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.25)'
                  : 'rgba(255, 255, 255, 1)',
                borderColor: theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.3)'
                  : 'rgba(0, 0, 0, 0.25)',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              }
            }
          }}
        >
          {Array.from(new Set(messageReactions.map(r => r.emoji))).map(emoji => {
            const count = messageReactions.filter(r => r.emoji === emoji).length;
            const hasReacted = messageReactions.some(r => r.emoji === emoji && r.userId === currentUser.uid);
            
            return (
              <Box
                key={emoji}
                onClick={(e) => {
                  e.stopPropagation();
                  hasReacted 
                    ? handleRemoveReaction(messageId, emoji)
                    : handleAddReaction(emoji, messageId);
                }}
                sx={{
                  opacity: 1,
                  transform: hasReacted ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  color: 'rgba(0, 0, 0, 0.9)',
                  fontWeight: hasReacted ? 600 : 400,
                }}
              >
                {emoji} {count > 1 && <span style={{ 
                  fontSize: '0.7rem',
                  opacity: 0.9,
                  color: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.9)'
                    : 'rgba(0, 0, 0, 0.7)',
                }}>{count}</span>}
              </Box>
            );
          })}
        </Box>
      )}

      {/* Reaction Picker Popover */}
      <Popover
        open={Boolean(selectedMessageForReaction) && Boolean(reactionAnchorEl)}
        anchorEl={reactionAnchorEl}
        onClose={() => {
          onCloseReactionMenu();
          setShowEmojiPicker(false);
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        sx={{
          '& .MuiPopover-paper': {
            marginTop: '8px',
            backgroundColor: 'transparent',
          }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            p: 1,
            backgroundColor: theme.palette.mode === 'dark' ? '#2f3136' : '#fff',
            borderRadius: 2,
            border: '1px solid',
            borderColor: theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.1)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            position: 'relative',
            '& > span': {
              cursor: 'pointer',
              fontSize: '24px',
              transition: 'transform 0.2s ease',
              padding: '4px 8px',
              borderRadius: '8px',
              '&:hover': {
                transform: 'scale(1.2)',
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.05)',
              },
            },
            '& > .add-button': {
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderLeft: '1px solid',
              borderColor: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.1)',
              marginLeft: '4px',
              paddingLeft: '8px',
              color: theme.palette.text.secondary,
              '&:hover': {
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.05)',
              },
            }
          }}
        >
          {reactions.map((emoji) => (
            <span
              key={emoji}
              onClick={() => {
                if (selectedMessageForReaction) {
                  handleAddReaction(emoji, selectedMessageForReaction.messageId);
                }
              }}
              role="button"
            >
              {emoji}
            </span>
          ))}
          <span 
            className="add-button"
            role="button"
            onClick={(e) => {
              setEmojiAnchorEl(e.currentTarget);
              setShowEmojiPicker(true);
            }}
            title="More reactions"
          >
            +
          </span>
        </Box>
      </Popover>

      {/* Emoji Picker Popover */}
      <Popover
        open={showEmojiPicker}
        anchorEl={reactionAnchorEl}
        onClose={() => setShowEmojiPicker(false)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        sx={{
          '& .MuiPopover-paper': {
            marginTop: '8px',
            backgroundColor: 'transparent',
            boxShadow: 'none',
          }
        }}
      >
        <EmojiPicker
          onEmojiClick={handleEmojiSelect}
          theme={theme.palette.mode}
          searchDisabled
          skinTonesDisabled
          height={350}
          width={300}
        />
      </Popover>
    </>
  );
};

export default MessageReactions; 