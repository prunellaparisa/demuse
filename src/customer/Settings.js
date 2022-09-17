import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Settings.css";
import { Tabs, Button } from "antd";
import { useAuth } from "../global/auth/Authentication";
import { useUserData } from "../global/auth/UserData";
import { useMoralis } from "react-moralis";
import { db } from "../utils/firebase";

// technically a person can own multiple wallet addresses. look into that.
const Settings = () => {
  const { signOut } = useAuth();
  const { userData } = useUserData();
  const {
    authenticate,
    isAuthenticated,
    isAuthenticating,
    user,
    account,
    logout,
  } = useMoralis();

  const navigate = useNavigate();
  return (
    <>
      {isAuthenticated ? (
        <h1>Your Metamask wallet address is {user.get("ethAddress")}</h1>
      ) : (
        <h1>Connect to your Metamask wallet!</h1>
      )}
      <Button
        type="dashed"
        size={"default"}
        onClick={() => {
          logout();
          signOut();
          navigate("/login");
        }}
      >
        Sign Out
      </Button>
      <Button
        type="dashed"
        size={"default"}
        onClick={async () => {
          if (isAuthenticated) {
            await logout();
          } else {
            await authenticate({
              signingMessage: "Log in using Moralis",
            })
              .then(async (user) => {
                if (userData.address !== undefined) return;
                // add ethAddress to firebase
                await db
                  .collection("user")
                  .doc(userData.id)
                  .update({ address: user.get("ethAddress") });
              })
              .catch(function (error) {
                console.log(error);
              });
          }
        }}
      >
        Sign In/Sign Out Metamask
      </Button>
    </>
  );
};

export default Settings;
