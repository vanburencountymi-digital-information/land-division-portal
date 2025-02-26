// src/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged , signOut } from 'firebase/auth';
import { app } from '../firebase/firebase';
import { db } from '../firebase/firebase';
// import { auth } from '../firebase/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const auth = getAuth(app);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            console.log('Auth state changed:', user);
            try {
                if (user) {
                    // Set current user immediately
                    setCurrentUser(user);
                    
                    // Then fetch additional user data
                    const userDoc = await db.collection('users').doc(user.uid).get();
                    const userData = userDoc.data();
                    setUserRole(userData?.role || 'user');
                } else {
                    setCurrentUser(null);
                    setUserRole(null);
                }
            } catch (error) {
                console.error("Error in auth state change:", error);
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    // Wait until initial auth state is resolved
    if (loading) {
        return <div>Loading...</div>; // Or your loading component
    }

    // Sign out function
    const logout = async () => {
        try {
            await auth.signOut();
            // AuthContext's useEffect will handle state updates
        } catch (error) {
            console.error("Error signing out:", error);
            throw error;
        }
    };

    const value = {
        currentUser,
        userRole,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
