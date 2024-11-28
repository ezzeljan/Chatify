import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, IconButton, Button, Dialog, DialogActions, DialogContent, LinearProgress, TextField, Popover, List, ListItem, ListItemButton, useMediaQuery, useTheme as useMuiTheme, Switch, ListItemIcon, ListItemText } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LanguageIcon from '@mui/icons-material/Language';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import CloseIcon from '@mui/icons-material/Close';
import { auth, database, storage } from '../../firebaseConfig';
import { ref, onValue, update, onDisconnect, set } from 'firebase/database';
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from './cropImage';
import { useLanguage } from '../../contexts/Languages';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';

const UserProfile = ({ currentUser, handleLogout: parentHandleLogout }) => {
  const [userData, setUserData] = useState({
    profileImageUrl: '/default-avatar.png',
    username: 'Anonymous User',
    language: '',
    status: 'offline',
  });
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [avatarFile, setAvatarFile] = useState(null); // State for selected avatar file
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [openCropDialog, setOpenCropDialog] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // Progress state
  const [uploading, setUploading] = useState(false); // Flag to check if the image is being uploaded
  const [oldAvatarUrl, setOldAvatarUrl] = useState(''); // Store the old avatar URL
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // Anchor element for language popover
  const { darkMode, toggleDarkMode } = useCustomTheme();
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { languages } = useLanguage(); // Use the languages from the context
  const [filteredLanguages, setFilteredLanguages] = useState(languages);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState('My Account');
  const muiTheme = useMediaQuery('(prefers-reduced-motion: reduce)');

  // Settings sections configuration
  const settingsSections = [
    { id: 'My Account', icon: <PersonIcon />, color: '#5865F2' },
    { id: 'Privacy & Safety', icon: <SecurityIcon />, color: '#3BA55C' },
    { id: 'Appearance', icon: <DarkModeIcon />, color: '#FAA61A' },
    { id: 'Notifications', icon: <NotificationsIcon />, color: '#ED4245' },
    { id: 'Language', icon: <LanguageIcon />, color: '#AD49E1' },
  ];

  useEffect(() => {
    const userRef = ref(database, `users/${currentUser.uid}`);
    const userStatusRef = ref(database, `status/${currentUser.uid}`);

    // Set user status to online when connected
    set(userStatusRef, 'online');

    // Set user status to offline when disconnected
    onDisconnect(userStatusRef).set('offline');

    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUserData({
          profileImageUrl: data.profileImageUrl || '/default-avatar.png',
          username: data.username || 'Anonymous User',
          language: data.language || '',
          status: data.status || 'offline',
        });

        setOldAvatarUrl(data.profileImageUrl || '');
      }
    });

    // Listen for status changes
    const statusUnsubscribe = onValue(userStatusRef, (snapshot) => {
      const status = snapshot.val();
      update(userRef, { status: status });
    });

    return () => {
      unsubscribe();
      statusUnsubscribe();
    };
  }, [currentUser.uid]);

  // Add these utility functions at the beginning of the component
  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
  };

  const truncatedUsername = truncateText(userData.username, 20);
  const truncatedEmail = truncateText(currentUser.email, 25);

  // Handle avatar selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setOpenCropDialog(true); // Open the crop dialog after selecting an image
    }
  };

  // Handle crop complete
  const onCropComplete = (_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  // Upload cropped image
  const handleCropUpload = async () => {
    const croppedImage = await getCroppedImg(avatarFile, croppedAreaPixels); // Crop the image
    uploadAvatar(croppedImage); // Upload the cropped image to Firebase
    setOpenCropDialog(false); // Close the dialog after cropping
  };

  // Upload the cropped image to Firebase with progress tracking
  const uploadAvatar = async (croppedImage) => {
    const storagePath = `avatars/${currentUser.uid}/${avatarFile.name}`;
    const avatarStorageRef = storageRef(storage, storagePath);

    setUploading(true); // Start uploading

    // Use uploadBytesResumable to track progress
    const uploadTask = uploadBytesResumable(avatarStorageRef, croppedImage);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Track progress (percentage)
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Error uploading avatar:', error);
        setUploading(false); // Stop uploading on error
      },
      async () => {
        // Handle successful upload and get download URL
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const userRef = ref(database, `users/${currentUser.uid}`);
        await update(userRef, { profileImageUrl: downloadURL });

        // Delete the old avatar after uploading the new one
        if (oldAvatarUrl && oldAvatarUrl !== '/default-avatar.png') {
          deleteOldAvatar(oldAvatarUrl);
        }

        setUserData((prevData) => ({
          ...prevData,
          profileImageUrl: downloadURL,
        }));

        setUploading(false); // Stop uploading on success
      }
    );
  };

  // Delete the old avatar from Firebase Storage
  const deleteOldAvatar = async (oldAvatarUrl) => {
    const oldAvatarRef = storageRef(storage, oldAvatarUrl); // Get the reference to the old avatar in storage
    try {
      await deleteObject(oldAvatarRef);
      console.log('Old avatar deleted successfully');
    } catch (error) {
      console.error('Error deleting old avatar:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const userStatusRef = ref(database, `status/${currentUser.uid}`);
      const userRef = ref(database, `users/${currentUser.uid}`);
      
      // Set user status to offline
      await set(userStatusRef, 'offline');
      await update(userRef, { status: 'offline' });
      
      // Cancel the onDisconnect operation
      await onDisconnect(userStatusRef).cancel();
      
      // Call the parent handleLogout function
      await parentHandleLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleUsernameDoubleClick = () => {
    setEditingUsername(true);
    setNewUsername(userData.username);
  };

  const handleUsernameChange = async () => {
    if (newUsername.trim() !== '') {
      const userRef = ref(database, `users/${currentUser.uid}`);
      await update(userRef, { username: newUsername });
      setUserData((prevData) => ({ ...prevData, username: newUsername }));
    }
    setEditingUsername(false);
  };

  const handleLanguageDoubleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setFilteredLanguages(languages); // Reset filtered languages when opening popover
  };

  const handleLanguageSelect = async (language) => {
    const userRef = ref(database, `users/${currentUser.uid}`);
    await update(userRef, { language: language.label });
    setUserData((prevData) => ({ ...prevData, language: language.label }));
    setAnchorEl(null);
  };

  const handleSearchChange = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = languages.filter(lang => 
      lang.label.toLowerCase().includes(searchTerm)
    );
    setFilteredLanguages(filtered);
    setSearchTerm(e.target.value);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const handleSettingsOpen = () => {
    setSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

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
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Language Settings</Typography>
            <List>
              {languages.map((language) => (
                <ListItem
                  key={language.label}
                  button
                  selected={userData.language === language.label}
                  onClick={() => handleLanguageSelect(language)}
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
    <Box>
      {/* Progress Bar for uploading */}
      {uploading && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="caption" sx={{ color: '#b9bbbe' }}>
            Uploading: {Math.round(uploadProgress)}%
          </Typography>
        </Box>
      )}

      <Box sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        p: 1.5,
        borderRadius: '5px',
        backgroundColor: '#7a49a5',
        color: '#fff',
        borderTop: '1px solid #23272A'
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          width: isMobile ? '100%' : 'auto',
          marginBottom: isMobile ? 2 : 0,
          maxWidth: isMobile ? '100%' : 'calc(100% - 120px)', // Adjusted width to accommodate new icon
        }}>
          <Box sx={{ position: 'relative', mr: 2 }}>
            <input
              accept="image/*"
              type="file"
              id="avatar-upload"
              style={{ display: 'none' }}
              onChange={handleAvatarChange} // Handle the file selection
            />
            <label htmlFor="avatar-upload">
              <Avatar 
                src={userData.profileImageUrl}
                sx={{ width: 40, height: 40, cursor: 'pointer' }}
              />
            </label>
            {/* Online status indicator */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 12,
                height: 12,
                backgroundColor: userData.status === 'online' ? '#66BB6A' : '#747f8d', // Changed from '#43b581' to '#66BB6A'
                borderRadius: '50%',
                border: '2px solid #7a49a5',
              }}
            />
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}> {/* Add minWidth: 0 to allow text truncation */}
            {editingUsername ? (
              <TextField
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                onBlur={handleUsernameChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUsernameChange();
                }}
                size="small"
                autoFocus
                sx={{
                  input: { color: '#fff' },
                  maxWidth: '100%',
                }}
              />
            ) : (
              <Typography
                variant="body1"
                sx={{ 
                  fontWeight: '500', 
                  cursor: 'pointer',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                onClick={handleUsernameDoubleClick}
                title={userData.username} // Show full username on hover
              >
                {truncatedUsername}
              </Typography>
            )}
            <Typography
              variant="caption"
              sx={{ 
                color: '#b9bbbe', 
                cursor: 'pointer',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              onClick={handleLanguageDoubleClick}
              title={userData.language || currentUser.email} // Show full email/language on hover
            >
              {userData.language || truncatedEmail}
            </Typography>
          </Box>
        </Box>

        {/* Language Popover */}
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
        >
          <Box sx={{ p: 2, minWidth: 250 }}>
            <TextField 
              placeholder='Search language...' 
              variant='outlined' 
              size='small' 
              fullWidth 
              sx={{ mb: 1 }} 
              value={searchTerm} 
              onChange={handleSearchChange}
            />
            <List sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #ccc', borderRadius: '4px' }}>
              {filteredLanguages.map((language) => (
                <ListItem key={language.label} disablePadding>
                  <ListItemButton onClick={() => handleLanguageSelect(language)}>
                    {language.label}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Popover>

        {/* Crop Dialog */}
        <Dialog
          open={openCropDialog}
          onClose={() => setOpenCropDialog(false)}
          maxWidth="md" // Set a larger width for the dialog
          fullWidth={true} // Make it use the full available width
        >
          <DialogContent
            sx={{
              position: 'relative',
              width: '100%',
              height: '400px', // Adjust height for larger crop area
              backgroundColor: '#333', // Dark background for contrast
            }}
          >
            <Cropper
              image={avatarFile ? URL.createObjectURL(avatarFile) : null}
              crop={crop}
              zoom={zoom}
              aspect={1} // 1:1 aspect ratio for avatar
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: {
                  width: '100%',
                  height: '100%',
                },
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCropDialog(false)} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleCropUpload} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          width: isMobile ? '100%' : 'auto',
          justifyContent: isMobile ? 'flex-end' : 'flex-start',
          marginTop: isMobile ? 2 : 0,
          flexShrink: 0, // Prevent icons from shrinking
        }}>
          <IconButton 
            sx={{ 
              color: '#b9bbbe',
              '&:hover': {
                color: '#fff',
              },
            }} 
            onClick={toggleDarkMode}
          >
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          <IconButton sx={{ color: '#b9bbbe' }} onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
          <IconButton sx={{ color: '#b9bbbe' }} onClick={handleSettingsOpen}>
            <SettingsIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Settings Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={handleSettingsClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            height: '80vh',
            m: 0,
            bgcolor: 'background.paper',
            color: 'text.primary',
          }
        }}
      >
        <Box sx={{ display: 'flex', height: '100%' }}>
          {/* Sidebar */}
          <Box
            sx={{
              width: 240,
              bgcolor: 'background.default',
              borderRight: '1px solid',
              borderColor: 'divider',
              overflow: 'auto',
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

          {/* Content */}
          <Box sx={{ flexGrow: 1, overflow: 'auto', bgcolor: 'background.paper' }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              p: 2, 
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography variant="h6">{selectedSetting}</Typography>
              <IconButton onClick={handleSettingsClose} sx={{ color: 'text.primary' }}>
                <CloseIcon />
              </IconButton>
            </Box>
            {renderSettingsContent()}
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default UserProfile;