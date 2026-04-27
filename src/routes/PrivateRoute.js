import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const PrivateRoute = ({ children }) => {
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    const location = useLocation();

    if (!isAuthenticated) {
        toast.warning("Please login to access this page!");
        
        return <Navigate to="/login" state={{ from: location }} replace />;
        //After logging successfully, user will transform to previous page (URL) by useLocation
    }

    
    return children;
};

export default PrivateRoute;