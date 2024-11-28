import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { ref, set, update } from 'firebase/database';
import { database } from '../firebaseConfig';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const auth = getAuth();

  async function registerUser(email, password) {
    setIsRegistering(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const currentDate = new Date().toISOString();

      const userData = {
        userId: user.uid,
        email: email,
        username: email,
        profileImageUrl: "none",
        accountType: "free",
        language: null,
        createdAt: currentDate,
        lastLoginDate: currentDate,
        translator: "google",
      };

      const userRef = ref(database, `users/${user.uid}`);
      await set(userRef, userData);

      // Immediately sign out the user after registration
      await signOut(auth);
    } finally {
      setIsRegistering(false);
    }
  }

  async function login(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result;
  }

  async function logout() {
    await signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!isRegistering) {
        setCurrentUser(user);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [auth, isRegistering]);

  async function updateUserProfile(userData) {
    if (!currentUser) {
      throw new Error('No user is currently logged in');
    }

    const userRef = ref(database, `users/${currentUser.uid}`);
    await update(userRef, userData);

    // Update the currentUser state
    setCurrentUser(prevUser => ({
      ...prevUser,
      ...userData
    }));
  }

  const value = {
    currentUser,
    registerUser,
    login,
    logout,
    loading,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
