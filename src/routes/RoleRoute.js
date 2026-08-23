import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  getLegacyStaffDestination,
  getRoleHome,
} from "../utils/roleNavigation";

const RoleRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, account } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/portal/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.includes(account.role)) {
    return children;
  }

  if (account.role === "staff" && location.pathname.startsWith("/admin")) {
    return <Navigate to={getLegacyStaffDestination(location.pathname)} replace />;
  }

  return <Navigate to={getRoleHome(account.role)} replace />;
};

export default RoleRoute;
