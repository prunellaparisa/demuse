/*This is a private route
Private route only allows access if the user is allowed to access the route
by checking their role
*/
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/Authentication";
import { useUserData } from "../auth/UserData";
import ErrorRoute from "./ErrorRoute";

export const PrivateRoute = ({ children, role }) => {
  const { currentUser } = useAuth();
  const { userData } = useUserData();
  // console.log(userData);

  //Return the error page if the role is not allowed to access the path
  if (role !== "all" && role !== userData.role) {
    return <ErrorRoute />;
  }

  //render the component if the user signs in and their role is permitted, or else redirect them to login path
  return currentUser ? children : <Navigate to="/login" />;
};
