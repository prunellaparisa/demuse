import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./index.css";
import { Tabs, Button, Spin } from "antd";
import { library } from "../../helpers/albumList";
import { db } from "../../utils/firebase";
import { useIPFS } from "../../hooks/useIPFS";
import Settings from "../Settings";
import MusicUpload from "../MusicUpload";
import MusicMint from "../MusicMint";
import MakeAlbum from "../MakePlaylist";
import { useMoralis } from "react-moralis";
import { useUserData } from "../../global/auth/UserData";
const { TabPane } = Tabs;

// image loading from ipfs is sooooo slow fr
const CustomerLanding = () => {
  const navigate = useNavigate();
  const { resolveLink } = useIPFS();
  const { userData } = useUserData();
  const {
    authenticate,
    isAuthenticated,
    isAuthenticating,
    user,
    account,
    logout,
  } = useMoralis();
  const [albums, setAlbums] = useState([]);
  const [albumsUI, setAlbumsUI] = useState([]);
  const [error, setError] = useState([]);
  const [loading, setLoading] = useState(true);
  let count = 0;
  // instead of hard coding the library, retrieve it from the firebase.
  // useEffect get all albums = const library
  // parse all album tracks into an object properly so that it is easily accessible later on

  useEffect(() => {
    getAllAlbums();
  }, []);

  useEffect(() => {
    if (albums.length > 0) {
      generateAlbumsUI(albums);
    } else if (albums.length === albumsUI.length) {
      setLoading(false);
    } else {
      setAlbumsUI(<h1>Nothing to play here!</h1>);
    }
  }, [albums]);

  const connectWallet = () => {
    authenticate();
    if (userData.ethAddress !== user.get("ethAddress")) {
      logout();
    } else {
      setError();
    }
  };

  // in future development, would probably get a limited amount of albums based on popularity
  const getAllAlbums = async () => {
    setAlbums([]);
    await db
      .collection("tracklist")
      .get()
      .then((res) => {
        res.docs.map((doc) => {
          setAlbums((oldArray) => [...oldArray, { id: doc.id, ...doc.data() }]);
          //console.log("albums: " + JSON.stringify(albums));
        });
      });
  };

  // albums don't come out in order; temporarily solved it
  const generateAlbumsUI = (albums) => {
    let temp = [];
    // let rawTrackURLs = [];
    albums.map(async (e) => {
      // console.log("e: " + JSON.stringify(e)); //attempt to make metadata accessible here
      let tracksMetadata = [];
      //let count = 0;
      let index = 0;
      // e.tracks is in order but tracksMetadata is not; now it is
      // rawTrackURLs = e.tracks; // something wrong here
      await e.tracks.map(async (track) => {
        e.rawTrackURLs = e.tracks;
        let updatedTrackURL = track.replace(
          "https://ipfs.moralis.io:2053",
          "https://cf-ipfs.com"
        );
        let id = index;
        index++;
        let json = await (await fetch(updatedTrackURL)).json();
        tracksMetadata.push(json); // the array pushing is not in order
        json.id = id; // the id made just before the json is attached to help with rearranging
        //console.log("json.id: " + json.id);
        //count++;
        if (
          index === e.tracks.length &&
          e.tracks.length === tracksMetadata.length
        ) {
          tracksMetadata.sort((a, b) => (a.id > b.id ? 1 : -1)); // rearrange tracks based on id
          //tracksMetadata.map((i) => console.log("yo: " + i.name));
          //console.log("tracksMetadata.length:" + tracksMetadata.length);
          // console.log("rawTrackURLs: " + rawTrackURLs);
          //e.rawTrackURLs = e.tracks;
          //console.log("e.tracks: " + e.tracks);
          e.tracks = tracksMetadata;
          //if ()
          //console.log("e.tracks[0]:" + JSON.stringify(e.tracks[0]));
          //console.log("e: " + JSON.stringify(e));
          temp.push(
            <Link to="/album" state={e} className="albumSelection">
              <img
                src={resolveLink(e.image)}
                alt="bull"
                style={{ width: "150px", marginBottom: "10px" }}
              ></img>
              <p>{e.title}</p>
            </Link>
          );
          //console.log("temp.length: " + temp.length);
          //setAlbumsUI(temp);
        }
        if (temp.length === albums.length) {
          setAlbumsUI(temp);
        }
      });
    });
  };

  /*{library.map((e) => (
    <Link to="/album" state={e} className="albumSelection">
      <img
        src={e.image}
        alt="bull"
        style={{ width: "150px", marginBottom: "10px" }}
      ></img>
      <p>{e.title}</p>
    </Link>
  ))}*/
  return (
    <>
      <Tabs defaultActiveKey="1" centered>
        <TabPane tab="FEATURED" key="1">
          <h1 className="featuredTitle">Today Is The Day</h1>
          {isAuthenticated && userData.ethAddress === user.get("ethAddress") ? (
            <p>Your Metamask wallet is currently connected.</p>
          ) : (
            <div>
              <p>
                There's an error connecting to your wallet. Please try again.
              </p>
              <Button type="primary" onClick={() => connectWallet()}>
                Connect Wallet
              </Button>
            </div>
          )}
          <Spin spinning={loading}>
            <div className="albums">{albumsUI}</div>
          </Spin>
        </TabPane>
        <TabPane tab="MUSIC UPLOAD" key="2">
          <MusicUpload />
        </TabPane>
        <TabPane tab="MUSIC MINT" key="3">
          <MusicMint />
        </TabPane>
        <TabPane tab="MAKE PLAYLIST" key="4">
          <MakeAlbum />
        </TabPane>
        <TabPane tab="SETTINGS" key="5">
          <Settings />
        </TabPane>
      </Tabs>
    </>
  );
};

export default CustomerLanding;
