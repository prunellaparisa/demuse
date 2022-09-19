import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Settings.css";
import { Tabs, Button } from "antd";
import { useAuth } from "../global/auth/Authentication";
import { useUserData } from "../global/auth/UserData";

// technically a person can own multiple wallet addresses. look into that.
const Settings = () => {
  const { signOut } = useAuth();
  const { userData } = useUserData();

  const navigate = useNavigate();
  return (
    <>
      <div className="sign-out">
        <Button
          type="dashed"
          size={"default"}
          onClick={() => {
            signOut();
            navigate("/login");
          }}
        >
          Sign Out
        </Button>
      </div>
    </>
  );
};

export default Settings;
