import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./index.css";
import { Tabs, Button, Spin, Modal } from "antd";
import { library } from "../../helpers/albumList";
import { db } from "../../utils/firebase";
import { useIPFS } from "../../hooks/useIPFS";
import Settings from "../Settings";
import MusicUpload from "../MusicUpload";
import MusicMint from "../MusicMint";
import MakeAlbum from "../MakePlaylist";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { ethers } from "ethers";
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
    user,
    isWeb3Enabled,
    enableWeb3,
    logout,
  } = useMoralis();
  const { runContractFunction, data, error, isLoading, isFetching } =
    useWeb3Contract();
  const [albums, setAlbums] = useState([]);
  const [albumsUI, setAlbumsUI] = useState([]);
  //Set dates
  var today = new Date();
  var priorDate = new Date(new Date().setDate(today.getDate() - 30));
  // const [error, setError] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paid, setPaid] = useState(false);
  let count = 0;
  // instead of hard coding the library, retrieve it from the firebase.
  // useEffect get all albums = const library
  // parse all album tracks into an object properly so that it is easily accessible later on

  useEffect(() => {
    if (!isWeb3Enabled) {
      enableWeb3();
    }
    if (
      compareTime(new Date(userData.lastPaidDate.seconds * 1000), priorDate)
    ) {
      // if last paid date was within the last 30 days
      //console.log("333");
      setPaid(true);
      getAllAlbums();
    }
    // TODO
    // 1. check if user has paid subscription fee yet.
    // 2. if end of the month, distribute fee to artists using listening log, clear listening log,
    // pay subscription fee again.
    // 3. if paid, getAllAlbums().
    //checkSubscription();
    //getAllAlbums();
  }, []);

  useEffect(() => {
    if (albums.length > 0) {
      generateAlbumsUI(albums);
    } else if (albums.length === albumsUI.length) {
      // albumsUI takes time
      setLoading(false);
    } else {
      setAlbumsUI(<h1>Nothing to play here!</h1>);
    }
  }, [albums]);

  const checkSubscription = async () => {
    if (userData.lastPaidDate === "invalid") {
      // get user to pay, adjust lastPaidDate to today, getAllAlbums()
      updateLastPaidDate();
      setPaid(true);
      getAllAlbums();
    } else if (
      !compareTime(new Date(userData.lastPaidDate.seconds * 1000), priorDate)
    ) {
      // if lastPaidDate was more than 30 days ago, distribute pay to artists, clear listening log,
      // get user to pay, adjust lastPaidDate to today, getAllAlbums()
      distributePayment();
    }
  };

  const compareTime = (time1, time2) => {
    return new Date(time1) > new Date(time2); // true if time1 is later
  };

  const paySubscription = async () => {
    if (userData.ethAddress !== user.get("ethAddress")) return;
    if (!isWeb3Enabled) {
      console.log("web3 not enabled");
      //await enableWeb3();
    }
    const options = {
      chain: "mumbai",
      contractAddress: "0xC41d23A83b7718bdf8c247D1E4772Cd820F81f60",
      functionName: "paySubscriptionFee",
      abi: [
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "address",
              name: "sender",
              type: "address",
            },
            {
              indexed: false,
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "LogTransfer",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "previousOwner",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "newOwner",
              type: "address",
            },
          ],
          name: "OwnershipTransferred",
          type: "event",
        },
        {
          inputs: [
            {
              internalType: "address payable[]",
              name: "wallets",
              type: "address[]",
            },
            {
              internalType: "uint256[]",
              name: "frequency",
              type: "uint256[]",
            },
          ],
          name: "distributeSubscriptionFee",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "owner",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "paySubscriptionFee",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [],
          name: "renounceOwnership",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_fee",
              type: "uint256",
            },
          ],
          name: "setSubscriptionFee",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "newOwner",
              type: "address",
            },
          ],
          name: "transferOwnership",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      msgValue: ethers.utils.parseEther((0.001).toString()),
    };
    await runContractFunction({ params: options }).then((i) => {
      if (typeof i === "object") {
        checkSubscription();
      }
    });
  };

  const distributePayment = async () => {
    if (userData.ethAddress !== user.get("ethAddress")) return;
    if (!isWeb3Enabled) {
      console.log("web3 not enabled");
      //await enableWeb3();
    }
    let wallets = Object.keys(userData.listeningLog).map((key) => key);
    let frequency = Object.keys(userData.listeningLog).map(
      (key) => userData.listeningLog[key]
    );
    let filteredWallets = [];
    let targetIndex = 0;
    wallets.map((i) => {
      // match wallet address (case insensitive)
      if (
        i.localeCompare(userData.ethAddress, undefined, {
          sensitivity: "base",
        }) // if address is not my address, add the address in the array to distribute
      ) {
        filteredWallets.push(i);
      } else {
        targetIndex = wallets.indexOf(i);
      }
    });
    let filteredFreq = frequency.filter(
      (item) => frequency.indexOf(item) !== targetIndex
    );
    if (filteredWallets.length === 0) {
      clearListeningLog();
      updateLastPaidDate();
      setPaid(true);
      getAllAlbums();
      return;
    }
    const options = {
      chain: "mumbai",
      contractAddress: "0xC41d23A83b7718bdf8c247D1E4772Cd820F81f60",
      functionName: "distributeSubscriptionFee",
      abi: [
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "address",
              name: "sender",
              type: "address",
            },
            {
              indexed: false,
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "LogTransfer",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "previousOwner",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "newOwner",
              type: "address",
            },
          ],
          name: "OwnershipTransferred",
          type: "event",
        },
        {
          inputs: [
            {
              internalType: "address payable[]",
              name: "wallets",
              type: "address[]",
            },
            {
              internalType: "uint256[]",
              name: "frequency",
              type: "uint256[]",
            },
          ],
          name: "distributeSubscriptionFee",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "owner",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "paySubscriptionFee",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [],
          name: "renounceOwnership",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_fee",
              type: "uint256",
            },
          ],
          name: "setSubscriptionFee",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "newOwner",
              type: "address",
            },
          ],
          name: "transferOwnership",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      params: { wallets: filteredWallets, frequency: filteredFreq }, // address[] wallets, uint[] frequency
    };
    await runContractFunction({ params: options }).then((i) => {
      if (typeof i === "object") {
        clearListeningLog();
        updateLastPaidDate();
        setPaid(true);
        getAllAlbums();
      }
    });
  };

  const connectWallet = () => {
    authenticate().then(() => {
      if (userData.ethAddress !== user.get("ethAddress")) {
        logout();
      }
    });
  };

  const updateLastPaidDate = async () => {
    await db.collection("user").doc(userData.id).update({
      lastPaidDate: today,
    });
  };

  const clearListeningLog = async () => {
    await db.collection("user").doc(userData.id).update({
      listeningLog: [],
    });
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
          "https://demuse.infura-ipfs.io" // made a paid dedicated gateway. don't go over 5GB a month.
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

  // paySubscription
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
          {isWeb3Enabled &&
          isAuthenticated &&
          userData.ethAddress === user.get("ethAddress") ? (
            <div>
              <p>
                Your Metamask wallet is currently connected. Address:{" "}
                {user.get("ethAddress")}
              </p>
              {paid ? (
                <Spin spinning={loading}>
                  <div className="albums">{albumsUI}</div>
                </Spin>
              ) : (
                <div>
                  <h1>Please pay to continue using demuse services.</h1>
                  <Button type="primary" onClick={() => paySubscription()}>
                    Pay Subscription
                  </Button>
                </div>
              )}
            </div>
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
