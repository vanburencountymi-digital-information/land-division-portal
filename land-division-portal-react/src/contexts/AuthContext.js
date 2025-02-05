// src/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged , signOut} from 'firebase/auth';
import { app } from '../firebase/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const auth = getAuth(app);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        setLoading(false);
        });
        return unsubscribe;
    }, [auth]);

    // Sign out function
    const logout = async () => {
        try {
            await signOut(auth);
            // Optionally, perform additional actions on sign out (e.g., redirect)
        } catch (error) {
            console.error("Error signing out:", error);
        }
        };
      
    return (
        <AuthContext.Provider value={{ currentUser, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
