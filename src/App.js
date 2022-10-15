import React, { useEffect } from "react";
import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import SignIn from "./global/signin/SignIn";
import SignUp from "./global/signin/SignUp";
import Album from "./customer/Album";
import MusicUpload from "./customer/MusicUpload";
import { AuthProvider } from "./global/auth/Authentication";
import { UserDataProvider } from "./global/auth/UserData";
import { PrivateLandingRoute } from "./global/routes/PrivateLandingRoute";
import ErrorRoute from "./global/routes/ErrorRoute";
import { PrivateRoute } from "./global/routes/PrivateRoute";
import Landing from "./global/Landing";
import "./App.css";
import { Link } from "react-router-dom";
import Player from "./components/AudioPlayer";
import { Layout } from "antd";
import Spotify from "./images/Spotify.png";
import { SearchOutlined, DownCircleOutlined } from "@ant-design/icons";

const { Content, Sider, Footer } = Layout;

//Roles to access paths
const role = {
  AD: "admin",
  C: "customer",
  A: "all",
};

const App = () => {
  /*<Sider width={300} className="sideBar">
            <img src={Spotify} alt="Logo" className="logo"></img>
            <div className="searchBar">
              <span> Search </span>
              <SearchOutlined style={{ fontSize: "30px" }} />
            </div>
            <Link to="/home">
            <p style={{ color: "#1DB954" }}> Home </p>
            </Link>
            <p> Your Music </p>
            <div className="recentPlayed">
              <p className="recentTitle">RECENTLY PLAYED</p>
              <div className="install">
                <span> Install App </span>
                <DownCircleOutlined style={{ fontSize: "30px" }} />
              </div>
            </div>
          </Sider>*/
  const [nftAlbum, setNftAlbum] = useState();
  const [paymentAddresses, setPaymentAddresses] = useState();
  const [index, setIndex] = useState(0);
  const [userData, setUserData] = useState();
  const [showSideBar, setShowSideBar] = useState();
  const location = useLocation();
  useEffect(() => {
    let paths = ["/", "/album"];
    if (!paths.includes(location.pathname)) {
      setNftAlbum();
      setIndex(0);
      setShowSideBar(false);
    } else {
      setShowSideBar(false);
      if (userData && userData.role === "customer") {
        setShowSideBar(true);
      }
    }
  }, [location.pathname, userData]);

  return (
    <>
      <AuthProvider>
        <Layout>
          {showSideBar && (
            <Sider width={300} className="sideBar">
              <img src={Spotify} alt="Logo" className="logo"></img>
              <div className="searchBar">
                <span> Search </span>
                <SearchOutlined style={{ fontSize: "30px" }} />
              </div>
              <Link to="/">
                <p style={{ color: "#1DB954" }}> Home </p>
              </Link>
              <p> Artist's Corner </p>
              <div className="recentPlayed">
                <p className="recentTitle">RECENTLY PLAYED</p>
                <div className="install">
                  <span> Install App </span>
                  <DownCircleOutlined style={{ fontSize: "30px" }} />
                </div>
              </div>
            </Sider>
          )}
          <Content className="contentWindow">
            <Routes>
              <Route
                path="/"
                element={
                  <PrivateLandingRoute>
                    <UserDataProvider>
                      <Landing setUserData={setUserData} />
                    </UserDataProvider>
                  </PrivateLandingRoute>
                }
              />
              <Route
                path="/album"
                element={
                  <UserDataProvider>
                    <PrivateRoute role={role.C}>
                      <Album
                        setNftAlbum={setNftAlbum}
                        setIndex={setIndex}
                        setPaymentAddresses={setPaymentAddresses}
                        setUserData={setUserData}
                      />
                    </PrivateRoute>
                  </UserDataProvider>
                }
              />
              <Route path="/login" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/error" element={<ErrorRoute />} />
            </Routes>
            <Footer className="footer">
              {nftAlbum && (
                <Player
                  tracks={nftAlbum}
                  index={index}
                  paymentAddresses={paymentAddresses}
                  userData={userData}
                />
              )}
            </Footer>
          </Content>
        </Layout>
      </AuthProvider>
    </>
  );
};

export default App;
