import React, { useState, useEffect } from "react";
import "./MusicMint.css";
import { Tabs, Button } from "antd";
import { useUserData } from "../global/auth/UserData";
import { db } from "../utils/firebase";
import { useIPFS } from "../hooks/useIPFS";
import { type } from "@testing-library/user-event/dist/type";

// retrieve approved submission, have a mint button for them, and change status to "minted"
const MusicMint = () => {
  const { resolveLink } = useIPFS();
  const { userData } = useUserData();
  const [submissions, setSubmissions] = useState([]); // approved submissions
  const [submissionsUI, setSubmissionsUI] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubmissions();
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

  // after update, refresh list
  const updateStatus = async (id, status) => {
    await db.collection("mint-request").doc(id).update({
      status: status,
    });
    setSubmissions(submissions.filter((i) => i.id !== id));
  };

  // mint-button function TODO:)
  const mint = () => {};

  // delete-button function
  const deleteSubmission = async (id) => {
    await db.collection("mint-request").doc(id).delete();
    setSubmissions(submissions.filter((i) => i.id !== id));
  };

  const getIPFSMetadata = async (doc) => {
    let resolvedLinks = [];
    await doc.links.map(async (i) => {
      let json = await (await fetch(resolveLink(i))).json();
      resolvedLinks.push(json);
    });
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(resolvedLinks);
      }, 2000);
    });
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
          json.map((i) => {
            //console.log(generateKey(i.animation_url.replace("ipfs://", "")));
            let metadata = (
              <>
                <div key={generateKey(i.animation_url.replace("ipfs://", ""))}>
                  <img
                    src={resolveLink(i.image)}
                    alt="albumcover"
                    className="albumCover"
                  ></img>
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
                  console.log("Mint!");
                }}
              >
                Confirm Mint
              </Button>
              <Button
                type="dashed"
                size={"default"}
                onClick={() => {
                  console.log("Delete!");
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
