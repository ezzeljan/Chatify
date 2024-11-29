import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, List, ListItem, 
  ListItemAvatar, ListItemText, Typography, Avatar, 
  IconButton, Menu, MenuItem, useTheme
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { getDatabase, ref, remove, onValue, off } from "firebase/database";

const GroupInfoDialog = ({ 
  open, 
  onClose, 
  members, 
  currentUser, 
  currentGroupChat,
  onAddMember,
  onGroupUpdate,
  setNotification 
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  const handleMenuOpen = (event, member) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMember(null);
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;
    
    // Close menu immediately before starting the removal process
    handleMenuClose();
    
    try {
      const db = getDatabase();
      // Remove member from group
      const memberRef = ref(db, `groups/${currentGroupChat.id}/members/${selectedMember.userId}`);
      await remove(memberRef);
      
      // Remove group from user's groups
      const userGroupRef = ref(db, `userGroups/${selectedMember.userId}/${currentGroupChat.id}`);
      await remove(userGroupRef);
      
      // Show success notification
      setNotification({
        severity: 'success',
        message: `${selectedMember.username} has been removed from the group`
      });
    } catch (error) {
      console.error('Error removing member:', error);
      setNotification({
        severity: 'error',
        message: 'Failed to remove member. Please try again.'
      });
    }
  };

  React.useEffect(() => {
    const db = getDatabase();
    const groupRef = ref(db, `groups/${currentGroupChat.id}`);

    const unsubscribe = onValue(groupRef, (snapshot) => {
      const groupData = snapshot.val();
      if (groupData && onGroupUpdate) {
        onGroupUpdate(currentGroupChat.id);
      }
    });

    return () => {
      off(groupRef);
      unsubscribe();
    };
  }, [currentGroupChat.id, onGroupUpdate]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span>Group Info</span>
        {currentGroupChat.members[currentUser.uid]?.role === 'admin' && (
          <IconButton 
            onClick={onAddMember}
            sx={{
              color: theme.palette.mode === 'dark' ? '#8967B3' : 'primary.main',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(173, 73, 225, 0.08)'
                  : 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <PersonAddIcon />
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <List sx={{
          '& .MuiListItem-root': {
            borderBottom: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? 'rgba(82, 44, 93, 0.3)' : 'divider',
            py: 2,
          },
          '& .MuiListItem-root:last-child': {
            borderBottom: 'none',
          }
        }}>
          {Object.values(members).map((member) => (
            <ListItem 
              key={member.userId}
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
                  src={member.profileImageUrl}
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
                    {member.username}
                  </Typography>
                }
                secondary={
                  <Typography 
                    variant="body2" 
                    sx={{
                      color: theme.palette.mode === 'dark' ? '#8967B3' : 'text.secondary',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    {member.role} • {member.language || 'No language set'}
                  </Typography>
                }
              />
              {currentGroupChat.members[currentUser.uid]?.role === 'admin' && 
               member.userId !== currentUser.uid && (
                <IconButton 
                  edge="end" 
                  onClick={(e) => handleMenuOpen(e, member)}
                  sx={{
                    color: theme.palette.mode === 'dark' ? '#8967B3' : 'text.secondary',
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
              )}
            </ListItem>
          ))}
        </List>
      </DialogContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        onExited={() => setSelectedMember(null)}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.mode === 'dark' 
              ? '#29104A' 
              : 'background.paper',
            borderRadius: 2,
            boxShadow: theme.palette.mode === 'dark'
              ? '0px 4px 20px rgba(0, 0, 0, 0.5)'
              : '0px 4px 20px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <MenuItem 
          onClick={handleRemoveMember}
          sx={{ 
            color: theme.palette.error.main,
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(244, 67, 54, 0.1)'
                : 'rgba(244, 67, 54, 0.08)',
            }
          }}
        >
          Remove from Group
        </MenuItem>
      </Menu>
    </Dialog>
  );
};

export default GroupInfoDialog; 