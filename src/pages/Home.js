import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Home.css";
import { Tabs, Button } from "antd";
import { library } from "../helpers/albumList";

const { TabPane } = Tabs;

const Home = () => {
  const { state } = useLocation();
  const { userUID } = state; // Read values passed on state
  console.log("home user: " + userUID); //able to pass uid
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
            onClick={() => navigate("/upload", { state: { userUID: userUID } })}
          >
            Upload Music
          </Button>
        </TabPane>
        <TabPane tab="NEW RELEASES" key="3">
          <h1 className="featuredTitle">Hot Off The Press</h1>
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
      </Tabs>
    </>
  );
};

export default Home;
