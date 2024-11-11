import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/Languages'; // Import the useLanguage hook
import { TextField, Button, Box, Autocomplete, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AuthBackground from '../AuthBackground';
import { ref, get } from 'firebase/database';
import { database } from '../../firebaseConfig';

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: '#E4B1F0' },
    '&:hover fieldset': { borderColor: '#FFE1FF' },
    '&.Mui-focused fieldset': { borderColor: '#FFE1FF' },
  },
  '& .MuiInputBase-input': { color: '#433878' },
  '& .MuiInputLabel-root': { color: '#7E60BF' },
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  borderRadius: '4px',
});

const StyledButton = styled(Button)({
  background: 'linear-gradient(45deg, #7E60BF, #433878)',
  color: '#FFE1FF',
  '&:hover': { background: 'linear-gradient(45deg, #433878, #7E60BF)' },
});

const StyledIconButton = styled(IconButton)({
  color: '#7E60BF',
  '&:hover': {
    backgroundColor: 'rgba(126, 96, 191, 0.04)',
  },
});

const ProfileSetup = () => {
  const [displayName, setDisplayName] = useState('');
  const [language, setLanguage] = useState(null);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { currentUser, updateUserProfile } = useAuth();
  const { languages } = useLanguage(); // Use the languages from the context
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      const userRef = ref(database, `users/${currentUser.uid}`);
      const snapshot = await get(userRef);
      const userData = snapshot.val();

      if (userData && userData.language && userData.username && userData.username !== userData.email) {
        navigate('/chat');
      } else {
        setLoading(false);
      }
    };

    checkUserStatus();
  }, [currentUser, navigate]);

  if (loading) {
    return null; // or return a loading spinner
  }

  const handleDisplayNameSubmit = (e) => {
    e.preventDefault();
    if (displayName.trim()) {
      setStep(2);
    }
  };

  const handleLanguageSubmit = async (e) => {
    e.preventDefault();
    if (language) {
      try {
        await updateUserProfile({
          username: displayName.trim(),
          language: language.label // Changed from language.value to language.label
        });
        navigate('/chat');
      } catch (error) {
        console.error('Error updating user profile:', error);
        // You might want to show an error message to the user here
      }
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const renderStep1 = () => (
    <AuthBackground label="Display Name" labelVariant="h6" labelAlign="center" showLogo={false}>
      <Box component="form" onSubmit={handleDisplayNameSubmit} sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <StyledTextField
          fullWidth
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="What should we call you?"
          required
          variant="outlined"
          size="medium"
        />
        <StyledButton
          type="submit"
          fullWidth
          variant="contained"
          size="large"
        >
          Continue
        </StyledButton>
      </Box>
    </AuthBackground>
  );

  const renderStep2 = () => (
    <AuthBackground label="Language" labelVariant="h6" labelAlign="center" showLogo={false}>
      <Box component="form" onSubmit={handleLanguageSubmit} sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Autocomplete
          options={languages} // Use the languages from the context
          value={language}
          onChange={(event, newValue) => setLanguage(newValue)}
          renderInput={(params) => (
            <StyledTextField
              {...params}
              label="What language do you prefer for chat translation?"
              variant="outlined"
              required
              InputLabelProps={{
                style: { fontSize: '0.9rem' }
              }}
            />
          )}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <StyledIconButton onClick={handleBack} aria-label="back">
            <ArrowBackIcon />
          </StyledIconButton>
          <StyledButton
            type="submit"
            variant="contained"
            size="large"
            disabled={!language}
            sx={{ flex: 1 }}
          >
            Finish Setup
          </StyledButton>
        </Box>
      </Box>
    </AuthBackground>
  );

  return step === 1 ? renderStep1() : renderStep2();
};

export default ProfileSetup;
