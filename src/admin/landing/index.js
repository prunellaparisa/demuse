import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./index.css";
import { Tabs, Button } from "antd";
//import { library } from "../helpers/albumList";

const { TabPane } = Tabs;

const AdminLanding = () => {
  //const { state } = useLocation();
  //const { userUID } = state; // Read values passed on state
  //console.log("admin user: " + userUID); //able to pass uid
  const navigate = useNavigate();
  // instead of hard coding the library, retrieve it from the blockchain/firebase.
  return (
    <>
      <h1>admin landing</h1>
    </>
  );
};

export default AdminLanding;
