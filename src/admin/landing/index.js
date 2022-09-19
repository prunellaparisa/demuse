import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./index.css";
import { Tabs, Button } from "antd";
import Settings from "../Settings";
import MintModerate from "../MintModerate";

const { TabPane } = Tabs;

const AdminLanding = () => {
  return (
    <>
      <Tabs defaultActiveKey="1" centered>
        <TabPane tab="MODERATE" key="1">
          <MintModerate />
        </TabPane>
        <TabPane tab="SETTINGS" key="2">
          <Settings />
        </TabPane>
      </Tabs>
    </>
  );
};

export default AdminLanding;
