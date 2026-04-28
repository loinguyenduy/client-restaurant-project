import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const GuestRoute = ({ children }) => {
  const { isAuthenticated, account } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    //Tự động đá về đúng trang theo Role
    if (account?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    // if (account?.role === 'staff') {
    //   return <Navigate to="/admin/orders" replace />;
    // }
    
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default GuestRoute;