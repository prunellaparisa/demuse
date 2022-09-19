import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./MintModerate.css";
import { Tabs, Button } from "antd";
import { useAuth } from "../global/auth/Authentication";
import { useUserData } from "../global/auth/UserData";
import { db } from "../utils/firebase";

// display all unmoderated submissions
const MintModerate = () => {
  const { userData } = useUserData();
  const [submissions, setSubmissions] = useState([]);
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

  // get submissions from db
  const getSubmissions = async () => {
    setSubmissions([]);
    await db
      .collection("mint-request")
      .where("status", "==", "submitted")
      .where("adminID", "==", userData.id)
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

  // TODO make UI more presentable
  const generateSubmissionsUI = (submissions) => {
    let temp = [];
    let num = 0;
    submissions.map((doc, index) => {
      num++;
      let temp2 = (
        <div key={index}>
          <p>{num}.</p>
          <p>artistID: {doc.artistID}</p>
          <p>status: {doc.status}</p>
          <p>links to mint: </p>
          {doc.links.map((i) => (
            <p>{i}</p>
          ))}
          <Button
            type="dashed"
            size={"default"}
            onClick={() => {
              updateStatus(doc.id, "approved");
            }}
          >
            Approve
          </Button>
          <Button
            type="dashed"
            size={"default"}
            onClick={() => {
              updateStatus(doc.id, "rejected");
            }}
          >
            Reject
          </Button>
          ;
        </div>
      );
      temp.push(temp2);
    });
    setSubmissionsUI(temp);
  };
  return (
    <>
      <h1>Mint moderate page</h1>
      {loading ? <h1>loading...</h1> : <div>{submissionsUI}</div>}
    </>
  );
};

export default MintModerate;
