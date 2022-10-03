import React, { useState, useEffect } from "react";
import "./MusicMint.css";
import { Tabs, Button } from "antd";
import { useUserData } from "../global/auth/UserData";
import { db } from "../utils/firebase";
import { useIPFS } from "../hooks/useIPFS";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { ethers } from "ethers";
import axios from "axios";

// TODO:
// 1. allow artists to make albums/playlists based on what they've minted <= done
// 2. display playable albums/playlists on home page
// 3. record every listener's monthly log
// 4. design systematic payment from listener to payment to artist

// retrieve approved submission, have a mint button for them, and change status to "minted"
const MusicMint = () => {
  const { user, enableWeb3, isWeb3Enabled } = useMoralis();
  const { runContractFunction, data, error, isLoading, isFetching } =
    useWeb3Contract();
  const { resolveLink } = useIPFS();
  const { userData } = useUserData();
  const [submissions, setSubmissions] = useState([]); // approved submissions
  const [submissionsUI, setSubmissionsUI] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubmissions();
    enableWeb3();
  }, []);

  useEffect(() => {
    if (submissions.length > 0) {
      generateSubmissionsUI(submissions);
    } else {
      setSubmissionsUI(<h1>Nothing to moderate here!</h1>);
    }
  }, [submissions]);

  // get approved submissions from db
  const getSubmissions = async () => {
    setSubmissions([]);
    await db
      .collection("mint-request")
      .where("status", "==", "approved")
      .where("artistID", "==", userData.id)
      .get()
      .then((i) => {
        i.docs.map((doc) =>
          setSubmissions((oldArray) => [
            ...oldArray,
            { id: doc.id, ...doc.data() },
          ])
        );
      });
    setLoading(false);
  };

  // connect to solidity contract to mint
  const mintAudio2 = async (uri) => {
    if (!isWeb3Enabled) {
      console.log("web3 not enabled");
      //await enableWeb3();
    }
    const options = {
      chain: "mumbai",
      contractAddress: "0x94790B186424b216eab50b025767Ef44699F99B4",
      functionName: "safeMint",
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
      msgValue: ethers.utils.parseEther((0.001).toString()),
      params: { to: user.get("ethAddress"), uri: uri },
    };
    await runContractFunction({ params: options }).then((i) => {
      console.log("immediate i: " + i);
    });
    console.log(error);

    return data;
  };

  // see all minted music
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
        //console.log("response.data: " + response.data.result);
      })
      .catch(function (error) {
        console.error(error);
      });
    responseArr.map((i) => {
      // access each token's id and uri
      console.log(
        "i.token_id: " + i.token_id + ", i.token_uri: " + i.token_uri
      );
    });
  };

  // mints + updates db of doc state
  const mint = (id, uri) => {
    //getAllTokens();
    uri.map((link) => {
      mintAudio2(link).then((i) => {
        console.log("i:" + i);
      });
    });
    updateStatus(id, "minted");
  };

  // after update, refresh list
  const updateStatus = async (id, status) => {
    await db.collection("mint-request").doc(id).update({
      status: status,
    });
    setSubmissions(submissions.filter((i) => i.id !== id));
  };

  // delete-button function
  const deleteSubmission = async (id) => {
    await db.collection("mint-request").doc(id).delete();
    setSubmissions(submissions.filter((i) => i.id !== id));
  };

  // generate unique key for divs
  const generateKey = (pre) => {
    return `${pre}_${new Date().getTime()}`;
  };

  // is it possible to retrieve music metadata from ipfs link? yes indeed:D
  const generateSubmissionsUI = (submissions) => {
    let temp = [];
    let num = 0;
    submissions.map((doc, index) => {
      num++;
      let json = [];
      doc.links.map(async (i) => {
        await (await fetch(resolveLink(i))).json().then((i) => {
          json.push(i);
        });
        if (doc.links[doc.links.length - 1] === i) {
          //console.log(generateKey(doc.id));
          let intro = (
            <div key={generateKey(doc.id)}>
              <p>{num}.</p>
              <p>submission status: {doc.status}</p>
              <p>music to mint: </p>
            </div>
          );
          temp.push(intro);
          let image = (
            <img
              src={resolveLink(json[0].image)}
              alt="albumcover"
              className="albumCover"
            ></img>
          );
          temp.push(image);
          json.map((i) => {
            //console.log(generateKey(i.animation_url.replace("ipfs://", "")));
            let metadata = (
              <>
                <div key={generateKey(i.animation_url.replace("ipfs://", ""))}>
                  <audio controls>
                    <source src={resolveLink(i.animation_url)} />
                    Your browser does not support the audio element.
                  </audio>
                  <p>
                    Artist: {i.artist}, Title: {i.name}, Year: {i.year},
                    Duration: {i.duration}
                  </p>
                </div>
              </>
            );
            temp.push(metadata);
          });

          let buttons = (
            <>
              <Button
                type="dashed"
                size={"default"}
                onClick={() => {
                  mint(doc.id, doc.links);
                }}
              >
                Confirm Mint
              </Button>
              <Button
                type="dashed"
                size={"default"}
                onClick={() => {
                  deleteSubmission(doc.id);
                }}
              >
                Delete Submission
              </Button>
            </>
          );

          temp.push(buttons);

          setSubmissionsUI(temp);
        }
      });
      //console.log("new line... json.length: " + json.length);
      //console.log("json: " + json);
    });
    //setSubmissionsUI(temp);
  };

  return (
    <>
      <h1>Music Mint</h1>
      {loading ? <h1>loading...</h1> : <div>{submissionsUI}</div>}
    </>
  );
};

export default MusicMint;
