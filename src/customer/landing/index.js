import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./index.css";
import { Tabs, Button } from "antd";
import { library } from "../../helpers/albumList";
import Settings from "../Settings";
import MusicUpload from "../MusicUpload";
import { useAuth } from "../../global/auth/Authentication";
import { useUserData } from "../../global/auth/UserData";
import { useMoralis } from "react-moralis";
import { db } from "../../utils/firebase";
const { TabPane } = Tabs;

const CustomerLanding = () => {
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

  //const { state } = useLocation();
  //const { userUID } = state; // Read values passed on state
  //console.log("home user: " + userUID); //able to pass uid
  /*useEffect(async () => {
    if (userData.address === undefined) {
      console.log("undefined bro");
      await authenticate({ signingMessage: "Log in using Moralis" })
        .then(async (user) => {
          console.log(user.get("ethAddress")); // save ethAddress to firebase upon signup and cross check it when signing in
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

    if (!isAuthenticated) {
      await authenticate({ signingMessage: "Log in using Moralis" });
    }

    if (user.get("ethAddress") !== userData.address) {
      console.log("wallet addresses are not the same");
      console.log('user.get("ethAddress"): ' + user.get("ethAddress"));
      console.log("userData.address: " + userData.address);
    }
  }, []);*/

  //console.log(userData.id);
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
