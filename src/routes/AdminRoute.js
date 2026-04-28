import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = ({ children }) => {
    const { isAuthenticated, account } = useSelector(state => state.auth);

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (account && (account.role === 'admin' || account.role === 'staff')) {
        return children;
    }

    return <Navigate to="/" />;
};

export default AdminRoute;