import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Button, Box, Avatar, Chip, List, 
  ListItem, ListItemAvatar, ListItemText, useTheme 
} from '@mui/material';
import { getDatabase, ref, push, set } from 'firebase/database';

const CreateGroupDialog = ({ open, onClose, currentUser, users }) => {
  const theme = useTheme();
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateGroup = async () => {
    if (groupName.trim() && selectedUsers.length > 0) {
      const db = getDatabase();
      const groupsRef = ref(db, 'groups');
      const newGroupRef = push(groupsRef);

      const groupData = {
        id: newGroupRef.key,
        name: groupName.trim(),
        createdBy: currentUser.uid,
        createdAt: Date.now(),
        members: {
          [currentUser.uid]: {
            role: 'admin',
            joinedAt: Date.now()
          },
          ...Object.fromEntries(
            selectedUsers.map(user => [
              user.userId,
              {
                role: 'member',
                joinedAt: Date.now()
              }
            ])
          )
        },
        type: 'group'
      };

      await set(newGroupRef, groupData);
      onClose();
      setGroupName('');
      setSelectedUsers([]);
    }
  };

  const handleUserSelect = (user) => {
    if (selectedUsers.find(u => u.userId === user.userId)) {
      setSelectedUsers(selectedUsers.filter(u => u.userId !== user.userId));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
    user.userId !== currentUser.uid
  );

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
            : 'linear-gradient(135deg, #FFE1FF, #E4B1F0, #7E60BF)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }
      }}
    >
      <DialogTitle>Create New Group</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Group Name"
          fullWidth
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Search Users"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Box sx={{ mb: 2 }}>
          {selectedUsers.map((user) => (
            <Chip
              key={user.userId}
              avatar={<Avatar src={user.profileImageUrl} />}
              label={user.username}
              onDelete={() => handleUserSelect(user)}
              sx={{ m: 0.5 }}
            />
          ))}
        </Box>
        <List sx={{ 
          maxHeight: 300, 
          overflow: 'auto',
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
          '&::-webkit-scrollbar-thumb:hover': {
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(180deg, #8967B3 0%, #E3B8B1 100%)'
              : '#555',
          },
          scrollbarWidth: 'thin',
          scrollbarColor: theme.palette.mode === 'dark'
            ? '#845162 #29104A'
            : '#888 #f1f1f1',
        }}>
          {filteredUsers.map((user) => (
            <ListItem
              key={user.userId}
              button
              onClick={() => handleUserSelect(user)}
              selected={selectedUsers.some(u => u.userId === user.userId)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(173, 73, 225, 0.15)'
                    : 'rgba(0, 0, 0, 0.08)',
                },
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(173, 73, 225, 0.08)'
                    : 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <ListItemAvatar>
                <Avatar src={user.profileImageUrl} />
              </ListItemAvatar>
              <ListItemText primary={user.username} secondary={user.email} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleCreateGroup}
          disabled={!groupName.trim() || selectedUsers.length === 0}
        >
          Create Group
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateGroupDialog; 