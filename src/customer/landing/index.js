import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./index.css";
import { Tabs, Button } from "antd";
import { library } from "../../helpers/albumList";
import Settings from "../Settings";
import MusicUpload from "../MusicUpload";
const { TabPane } = Tabs;

const CustomerLanding = () => {
  const navigate = useNavigate();
  // instead of hard coding the library, retrieve it from the blockchain/firebase.
  return (
    <>
      <Tabs defaultActiveKey="1" centered>
        <TabPane tab="FEATURED" key="1">
          <h1 className="featuredTitle">Today Is The Day</h1>
          <div className="albums">
            {library.map((e) => (
              <Link to="/album" state={e} className="albumSelection">
                <img
                  src={e.image}
                  alt="bull"
                  style={{ width: "150px", marginBottom: "10px" }}
                ></img>
                <p>{e.title}</p>
              </Link>
            ))}
          </div>
        </TabPane>
        <TabPane tab="FOR ARTISTS" key="2">
          <MusicUpload />
        </TabPane>
        <TabPane tab="SETTINGS" key="3">
          <Settings />
        </TabPane>
      </Tabs>
    </>
  );
};

export default CustomerLanding;
