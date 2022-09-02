import React from "react";

const ErrorRoute = (props) => {
  const { err } = props;
  const printMessage = () => {
    switch (err) {
      case "already-login":
        return "You have already logged in.";
      default:
        return "Oops! Seems like you don't have permission to access this path!";
    }
  };

  const msg = printMessage();

  return (
    <div>
      <h1>{msg}</h1>
    </div>
  );
};

export default ErrorRoute;
