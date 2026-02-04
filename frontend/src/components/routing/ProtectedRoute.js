import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-8 h-8 border-2 border-[#222222] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        // Redirect to home or show login modal (handling this via state in a real app)
        // For now, redirect to home page
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (adminOnly && !user.is_admin) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
