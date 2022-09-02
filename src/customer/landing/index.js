import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./index.css";
import { Tabs, Button } from "antd";
import { library } from "../../helpers/albumList";
import { useAuth } from "../../global/auth/Authentication";
const { TabPane } = Tabs;

const CustomerLanding = () => {
  const { signOut } = useAuth();
  //const { state } = useLocation();
  //const { userUID } = state; // Read values passed on state
  //console.log("home user: " + userUID); //able to pass uid
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
          <Button
            type="dashed"
            size={"default"}
            onClick={() => navigate("/upload")}
          >
            Upload Music
          </Button>
        </TabPane>
        <TabPane tab="SETTINGS" key="3">
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
        </TabPane>
      </Tabs>
    </>
  );
};

export default CustomerLanding;
