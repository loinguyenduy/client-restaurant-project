import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getRoleHome } from "../utils/roleNavigation";

const GuestRoute = ({ children }) => {
  const { isAuthenticated, account } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to={getRoleHome(account?.role)} replace />;
  }

  return children;
};

export default GuestRoute;
