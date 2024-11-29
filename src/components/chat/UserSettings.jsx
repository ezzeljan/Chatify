import React from 'react';
import { Box, Typography, Avatar, IconButton, Switch, List, ListItem, ListItemIcon, ListItemText, Dialog, useTheme, TextField } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LanguageIcon from '@mui/icons-material/Language';
import CloseIcon from '@mui/icons-material/Close';

const UserSettings = ({ 
  open, 
  onClose, 
  currentUser, 
  userData,
  editingUsername,
  newUsername,
  setNewUsername,
  handleUsernameDoubleClick,
  languages,
  handleLanguageSelect,
  darkMode,
  toggleDarkMode,
  selectedSetting,
  setSelectedSetting,
  handleAvatarChange,
}) => {
  const theme = useTheme();

  // Settings sections configuration
  const settingsSections = [
    { id: 'My Account', icon: <PersonIcon />, color: '#5865F2' },
    { id: 'Privacy & Safety', icon: <SecurityIcon />, color: '#3BA55C' },
    { id: 'Appearance', icon: <DarkModeIcon />, color: '#FAA61A' },
    { id: 'Notifications', icon: <NotificationsIcon />, color: '#ED4245' },
    { id: 'Language', icon: <LanguageIcon />, color: '#AD49E1' },
  ];

  const renderSettingsContent = () => {
    switch (selectedSetting) {
      case 'My Account':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>My Account</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box sx={{ position: 'relative', mr: 2 }}>
                <input
                  accept="image/*"
                  type="file"
                  id="settings-avatar-upload"
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />
                <label htmlFor="settings-avatar-upload">
                  <Avatar
                    src={userData.profileImageUrl}
                    sx={{ width: 80, height: 80, cursor: 'pointer' }}
                  />
                </label>
              </Box>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {userData.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentUser.email}
                </Typography>
              </Box>
            </Box>
            <TextField
              fullWidth
              label="Username"
              value={editingUsername ? newUsername : userData.username}
              onChange={(e) => setNewUsername(e.target.value)}
              onDoubleClick={handleUsernameDoubleClick}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              value={currentUser.email}
              disabled
            />
          </Box>
        );
      case 'Appearance':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>Appearance</Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <DarkModeIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Dark Mode"
                  secondary="Toggle between light and dark theme"
                />
                <Switch
                  checked={darkMode}
                  onChange={toggleDarkMode}
                  color="primary"
                />
              </ListItem>
            </List>
          </Box>
        );
      case 'Language':
        return (
          <Box sx={{ 
            height: '100%',  // Take full height
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden' // Hide outer scrollbar
          }}>
            <Typography variant="h6" sx={{ p: 3, pb: 2 }}>Language Settings</Typography>
            <List sx={{
              flex: 1,  // Take remaining space
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
              {languages.map((language) => (
                <ListItem
                  key={language.label}
                  button
                  selected={userData.language === language.label}
                  onClick={() => handleLanguageSelect(language)}
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
                  <ListItemText primary={language.label} />
                </ListItem>
              ))}
            </List>
          </Box>
        );
      default:
        return (
          <Box sx={{ p: 3 }}>
            <Typography>Coming soon...</Typography>
          </Box>
        );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          m: 0,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #150016 0%, #29104A 100%)'
            : 'linear-gradient(135deg, #FFE1FF, #E4B1F0, #7E60BF)',
          color: theme.palette.mode === 'dark' ? '#E3B8B1' : '#000',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }
      }}
    >
      <Box sx={{ display: 'flex', height: '100%' }}>
        {/* Settings Sidebar */}
        <Box
          sx={{
            width: 240,
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(180deg, #29104A 0%, #522C5D 100%)'
              : 'linear-gradient(180deg, #FFE1FF, #E4B1F0)',
            borderRight: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? '#522C5D' : 'rgba(255, 255, 255, 0.3)',
            overflow: 'hidden',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
              height: 0,
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
          }}
        >
          <List>
            {settingsSections.map((section) => (
              <ListItem
                key={section.id}
                button
                selected={selectedSetting === section.id}
                onClick={() => setSelectedSetting(section.id)}
                sx={{
                  borderRadius: '4px',
                  mx: 0.5,
                  '&.Mui-selected': {
                    bgcolor: section.color,
                    '&:hover': {
                      bgcolor: section.color,
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  {section.icon}
                </ListItemIcon>
                <ListItemText primary={section.id} />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Settings Content */}
        <Box sx={{ 
          flexGrow: 1, 
          overflow: 'hidden',  // Changed from 'auto' to 'hidden'
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(180deg, #29104A 0%, #522C5D 50%, #845162 100%)'
            : 'background.paper',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            p: 2, 
            borderBottom: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? '#522C5D' : 'divider',
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #522C5D 0%, #845162 100%)'
              : 'inherit',
          }}>
            <Typography variant="h6" sx={{ 
              color: theme.palette.mode === 'dark' ? '#E3B8B1' : 'inherit' 
            }}>
              {selectedSetting}
            </Typography>
            <IconButton 
              onClick={onClose} 
              sx={{ 
                color: theme.palette.mode === 'dark' ? '#FFE9D8' : 'text.primary' 
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ 
            flex: 1,
            overflow: 'hidden'  // Hide scrollbar for content container
          }}>
            {renderSettingsContent()}
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
};

export default UserSettings; 