// src/components/PrivateRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../utils/roles';

const PrivateRoute = ({ children, requiredPermissions = [] }) => {
    const { currentUser, userRole } = useAuth();
    const location = useLocation();
    
    console.log('PrivateRoute check:', { currentUser, userRole, requiredPermissions }); // Add this for debugging

    // If the user is not authenticated, redirect to the login page
    if (!currentUser) {
        return <Navigate to="/" replace state={{ from: location }} />;
    }

    // Check permissions if any are required
    if (requiredPermissions.length > 0) {
        const hasAllPermissions = requiredPermissions.every(
            permission => hasPermission(userRole, permission)
        );

        if (!hasAllPermissions) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return children;
};

export default PrivateRoute;
