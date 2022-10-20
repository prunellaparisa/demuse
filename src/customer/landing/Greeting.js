import React, { useEffect, useState } from "react";
import "./Greeting.css";
import { Tabs, Button, Spin, Modal } from "antd";
import { useUserData } from "../../global/auth/UserData";
const { TabPane } = Tabs;

// image loading from ipfs is sooooo slow fr
const Greeting = () => {
  //Set dates
  const { userData } = useUserData();
  const [UI, setUI] = useState([]);
  var currentHour = new Date().getHours().toLocaleString();
  useEffect(() => {
    if (currentHour < 12) {
      setUI("Good Morning " + userData.username);
    } else if (currentHour > 12 && currentHour < 18) {
      setUI("Good Afternoon " + userData.username);
    } else {
      setUI("Good Evening " + userData.username);
    }
  }, [currentHour]);

  return (
    <>
      <h1 className="featuredTitle">{UI}</h1>
    </>
  );
};

export default Greeting;
