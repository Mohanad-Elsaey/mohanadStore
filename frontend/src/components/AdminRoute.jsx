import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const AdminRoute = ({ children }) => {
    const { isAuthenticated, isAdmin } = useAuthStore();

    if (!isAuthenticated || !isAdmin) {
        return <Navigate to="/login" replace />;
    }

    return children ? children : <Outlet />;
};

export default AdminRoute;
