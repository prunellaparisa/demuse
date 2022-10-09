import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import "./Album.css";
import Opensea from "../images/opensea.png";
import { useIPFS } from "../hooks/useIPFS";
import axios from "axios";
import { Tabs, Button, Spin } from "antd";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { ClockCircleOutlined } from "@ant-design/icons";
import { useUserData } from "../global/auth/UserData";

// authenticate wallet TODO
const Album = ({ setNftAlbum, setIndex, setPaymentAddresses, setUserData }) => {
  const { state: album } = useLocation();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [UI, setUI] = useState([]);
  const { userData } = useUserData();
  const { resolveLink } = useIPFS();
  const { runContractFunction, data, error, isLoading, isFetching } =
    useWeb3Contract();
  const {
    authenticate,
    isAuthenticated,
    isAuthenticating,
    user,
    account,
    logout,
    isWeb3Enabled,
    enableWeb3,
  } = useMoralis();
  //console.log("album.rawTrackURLs: " + album.rawTrackURLs.length);

  useEffect(() => {
    // get owners of the rawTrackURLs
    //console.log("album.rawTrackURLs: " + album.rawTrackURLs);
    if (!isWeb3Enabled) {
      console.log("isWeb3Enabled disabled!");
      enableWeb3();
    }
    getAllTokens();
  }, []);

  useEffect(() => {
    console.log("addresses.length: " + addresses.length);
    if (
      addresses.length === 1 ||
      addresses.length === album.rawTrackURLs.length
    ) {
      setUI(
        <div className="albumContent">
          <div className="topBan">
            <img
              src={resolveLink(album.image)}
              alt="albumcover"
              className="albumCover"
            ></img>
            <div className="albumDeets">
              <div>{album.type.toUpperCase()}</div>
              <div className="title">{album.title}</div>
              <div className="artist">{album && album.tracks[0].artist}</div>
              <div>
                {album && album.tracks[0].year} • {album && album.tracks.length}{" "}
                Songs
              </div>
            </div>
          </div>
          <div className="topBan">
            <div
              className="playButton"
              onClick={() => {
                setNftAlbum(album.tracks);
                setIndex(0); // could add another variable to record who the token owners are
                setPaymentAddresses(addresses);
                setUserData(userData);
              }}
            >
              PLAY
            </div>
            <div
              className="openButton"
              onClick={() =>
                window.open(
                  `https://testnets.opensea.io/collection/demusetoken`
                )
              }
            >
              OpenSea
              <img src={Opensea} className="openLogo" />
            </div>
            <div className="openButton" onClick={() => navigate("/")}>
              Go Home
            </div>
          </div>
          <div className="tableHeader">
            <div className="numberHeader">#</div>
            <div className="titleHeader">TITLE</div>
            <div className="numberHeader">
              <ClockCircleOutlined />
            </div>
          </div>
          {album &&
            album.tracks.map((track, i) => {
              return (
                <>
                  <div
                    className="tableContent"
                    onDoubleClick={() => {
                      setNftAlbum(album.tracks);
                      setIndex(i);
                      setPaymentAddresses(addresses);
                      setUserData(userData);
                    }}
                  >
                    <div className="numberHeader">{i + 1}</div>
                    <div
                      className="titleHeader"
                      style={{ color: "rgb(205, 203, 203)" }}
                    >
                      {track.name}
                    </div>
                    <div className="numberHeader">{track.duration}</div>
                  </div>
                </>
              );
            })}
        </div>
      );
    } else {
      setUI(<h1>loading...</h1>);
    }
  }, [addresses]);

  const connectWallet = () => {
    enableWeb3();
    if (userData.ethAddress !== user.get("ethAddress")) {
      logout();
    }
  };

  const getAllTokens = async () => {
    let responseArr = [];
    const options = {
      method: "GET",
      url: "https://deep-index.moralis.io/api/v2/nft/0x94790B186424b216eab50b025767Ef44699F99B4",
      params: { chain: "mumbai", format: "decimal" },
      headers: { accept: "application/json", "X-API-Key": "test" },
    };

    await axios
      .request(options)
      .then(function (response) {
        responseArr = response.data.result;
        // console.log("response.data: " + JSON.stringify(response.data.result));
      })
      .catch(function (error) {
        console.error(error);
      });
    getAllTokenIDs(responseArr);
  };

  const getAllTokenIDs = (responseArr) => {
    let albumTokenIDs = [];

    for (var i = 0; i < album.rawTrackURLs.length; ++i) {
      let found = responseArr.find(
        (token) => token.token_uri === album.rawTrackURLs[i]
      );
      albumTokenIDs.push(found.token_id);
      //console.log("hehe " + found.token_id);
      //console.log("found");
      console.log(found.metadata);
    }
    getTokenOwners(albumTokenIDs);
  };

  // in order to run any contract function from moralis, a contract address needs to be signed in
  const getTokenOwners = (albumTokenIDs) => {
    let count = 0;
    let temp = [];
    setAddresses([]);
    albumTokenIDs.map(async (i) => {
      //console.log("id: "+i)

      const options = {
        chain: "mumbai",
        contractAddress: "0x94790B186424b216eab50b025767Ef44699F99B4",
        functionName: "ownerOf",
        abi: [
          {
            inputs: [],
            stateMutability: "nonpayable",
            type: "constructor",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "approved",
                type: "address",
              },
              {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
              },
            ],
            name: "Approval",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "operator",
                type: "address",
              },
              {
                indexed: false,
                internalType: "bool",
                name: "approved",
                type: "bool",
              },
            ],
            name: "ApprovalForAll",
            type: "event",
          },
          {
            inputs: [
              {
                internalType: "address",
                name: "to",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
              },
            ],
            name: "approve",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
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
            inputs: [],
            name: "renounceOwnership",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              {
                internalType: "address",
                name: "to",
                type: "address",
              },
              {
                internalType: "string",
                name: "uri",
                type: "string",
              },
            ],
            name: "safeMint",
            outputs: [],
            stateMutability: "payable",
            type: "function",
          },
          {
            inputs: [
              {
                internalType: "address",
                name: "from",
                type: "address",
              },
              {
                internalType: "address",
                name: "to",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
              },
            ],
            name: "safeTransferFrom",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              {
                internalType: "address",
                name: "from",
                type: "address",
              },
              {
                internalType: "address",
                name: "to",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
              },
              {
                internalType: "bytes",
                name: "data",
                type: "bytes",
              },
            ],
            name: "safeTransferFrom",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              {
                internalType: "address",
                name: "operator",
                type: "address",
              },
              {
                internalType: "bool",
                name: "approved",
                type: "bool",
              },
            ],
            name: "setApprovalForAll",
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
            name: "setMintingFee",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "address",
                name: "from",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "to",
                type: "address",
              },
              {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
              },
            ],
            name: "Transfer",
            type: "event",
          },
          {
            inputs: [
              {
                internalType: "address",
                name: "from",
                type: "address",
              },
              {
                internalType: "address",
                name: "to",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
              },
            ],
            name: "transferFrom",
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
          {
            inputs: [],
            name: "withdraw",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              {
                internalType: "address",
                name: "owner",
                type: "address",
              },
            ],
            name: "balanceOf",
            outputs: [
              {
                internalType: "uint256",
                name: "",
                type: "uint256",
              },
            ],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [
              {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
              },
            ],
            name: "getApproved",
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
            inputs: [
              {
                internalType: "address",
                name: "owner",
                type: "address",
              },
              {
                internalType: "address",
                name: "operator",
                type: "address",
              },
            ],
            name: "isApprovedForAll",
            outputs: [
              {
                internalType: "bool",
                name: "",
                type: "bool",
              },
            ],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [],
            name: "name",
            outputs: [
              {
                internalType: "string",
                name: "",
                type: "string",
              },
            ],
            stateMutability: "view",
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
            inputs: [
              {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
              },
            ],
            name: "ownerOf",
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
            inputs: [
              {
                internalType: "bytes4",
                name: "interfaceId",
                type: "bytes4",
              },
            ],
            name: "supportsInterface",
            outputs: [
              {
                internalType: "bool",
                name: "",
                type: "bool",
              },
            ],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [],
            name: "symbol",
            outputs: [
              {
                internalType: "string",
                name: "",
                type: "string",
              },
            ],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [
              {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
              },
            ],
            name: "tokenURI",
            outputs: [
              {
                internalType: "string",
                name: "",
                type: "string",
              },
            ],
            stateMutability: "view",
            type: "function",
          },
        ],
        params: { tokenId: i },
      };
      await runContractFunction({ params: options }).then((j) => {
        count++;
        //console.log("count: " + count);
        //console.log("i: " + i);
        // if "j" is undefined, user needs to reconnect to metamask
        temp.push(j);
        //console.log("j: " + j);
      });
      //console.log("temp: " + temp);
      setAddresses(temp);
    });
  };
  //const { album } = useAlbum(albumDetails.contract); // album is straight from firebase
  // for the setNftAlbum, probably use album.tracklist array? yes indeed
  return (
    <>
      {isWeb3Enabled && userData.ethAddress === user.get("ethAddress") ? (
        <p>{UI}</p>
      ) : (
        <div>
          <p>There's an error connecting to your wallet. Please try again.</p>
          <Button type="primary" onClick={() => connectWallet()}>
            Connect Wallet
          </Button>
        </div>
      )}
    </>
  );
};

export default Album;
