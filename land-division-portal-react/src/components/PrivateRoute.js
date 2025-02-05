// src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
    const { currentUser } = useAuth();
        
    // If the user is not authenticated, redirect to the login page (or wherever)
    if (!currentUser) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PrivateRoute;
