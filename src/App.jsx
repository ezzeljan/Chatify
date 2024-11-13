import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { LanguageProvider } from './contexts/Languages.jsx';
import { ref, get } from "firebase/database";
import { database } from "./firebaseConfig";
import Login from './components/login-register/Login';
import ChatPage from './components/chat/ChatPage';
import Register from './components/login-register/Register';
import ForgotPassword from './components/login-register/ForgotPassword';
import ProfileSetup from './components/login-register/ProfileSetup';
import chatifyLogo from './assets/chatifylogo.png';

const LoadingSpinner = React.memo(() => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <img src={chatifyLogo} alt="Chatify Logo" style={{ width: '250px', height: 'auto' }} />
  </Box>
));

const AuthWrapper = React.memo(({ children }) => {
  const { currentUser, loading } = useAuth();
  const [checkingProfile, setCheckingProfile] = useState(true);

  const checkProfileCompletion = useCallback(async () => {
    if (currentUser) {
      const userRef = ref(database, `users/${currentUser.uid}`);
      const snapshot = await get(userRef);
      const userData = snapshot.val();
      // We're not setting profileComplete here anymore
      // Just finish the checking process
    }
    setCheckingProfile(false);
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      checkProfileCompletion();
    } else {
      setCheckingProfile(false);
    }
  }, [currentUser, checkProfileCompletion]);

  if (loading || checkingProfile) {
    return <LoadingSpinner />;
  }

  return children;
});

const ProtectedRoute = React.memo(({ children }) => {
  const { currentUser } = useAuth();
  const [profileComplete, setProfileComplete] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  const checkProfileCompletion = useCallback(async () => {
    if (currentUser) {
      const userRef = ref(database, `users/${currentUser.uid}`);
      const snapshot = await get(userRef);
      const userData = snapshot.val();
      setProfileComplete(
        userData && 
        userData.language && 
        userData.username && 
        userData.username !== userData.email
      );
    }
    setCheckingProfile(false);
  }, [currentUser]);

  useEffect(() => {
    checkProfileCompletion();
  }, [checkProfileCompletion]);

  if (checkingProfile) {
    return <LoadingSpinner />;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (!profileComplete) {
    return <Navigate to="/profile-setup" />;
  }

  return children;
});

const AppRoutes = React.memo(() => {
  const { currentUser, logout } = useAuth();

  const routes = useMemo(() => [
    { path: "/", element: <Navigate to="/login" /> },
    { path: "/login", element: currentUser ? <Navigate to="/chat" /> : <Login /> },
    { path: "/register", element: currentUser ? <Navigate to="/chat" /> : <Register /> },
    { 
      path: "/chat", 
      element: (
        <ProtectedRoute>
          <ChatPage currentUser={currentUser} handleLogout={logout} />
        </ProtectedRoute>
      )
    },
    { path: "/forgot-password", element: currentUser ? <Navigate to="/chat" /> : <ForgotPassword /> },
    { 
      path: "/profile-setup", 
      element: currentUser ? <ProfileSetup /> : <Navigate to="/login" />
    },
  ], [currentUser, logout]);

  return (
    <Routes>
      {routes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
    </Routes>
  );
});

const App = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <AuthWrapper>
            <AppRoutes />
          </AuthWrapper>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
