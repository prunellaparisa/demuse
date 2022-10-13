import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Settings.css";
import { Tabs, Button } from "antd";
import { useAuth } from "../global/auth/Authentication";
import { useUserData } from "../global/auth/UserData";
import { useMoralis } from "react-moralis";
import { db } from "../utils/firebase";

// an account can currently only hold one wallet address
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
  const [error, setError] = useState("Connect to your Metamask wallet!");

  useEffect(() => {
    if (isAuthenticated) {
      if (userData.ethAddress !== user.get("ethAddress")) {
        logout();
      }
    }
  }, [user]);

  const navigate = useNavigate();
  return (
    <>
      <h1>Username: {userData.username}</h1>
      {isAuthenticated && userData.ethAddress === user.get("ethAddress") ? (
        <h1>
          Your Metamask wallet is currently connected. Address:{" "}
          {user.get("ethAddress")}
        </h1>
      ) : (
        <h1>{error}</h1>
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
                // add ethAddress to firebase
                /*await db
                  .collection("user")
                  .doc(userData.id)
                  .update({ address: user.get("ethAddress") });*/
                if (userData.ethAddress === user.get("ethAddress")) return;
                setError(
                  `The ethAddress connected does not correspond to your account's ethAddress. Try again.`
                );

                if (userData.ethAddress !== undefined) return;
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
