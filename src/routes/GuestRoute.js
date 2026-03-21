import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

//This route used to redirect to homepage when user enter url to login or register (when they logged)
const GuestRoute = ({ children }) => { // children is wrapper component (ex: </Login> )
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
    //replace: replace current page (login, register) to home page
  }
  return children;
};

export default GuestRoute;
