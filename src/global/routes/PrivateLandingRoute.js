import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/Authentication";

export const PrivateLandingRoute = ({ children, role }) => {
  const { currentUser } = useAuth();

  //render the component if the user signs in, or else redirect them to login path
  return currentUser ? children : <Navigate to="/login" />;
};
