import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./MakePlaylist.css";
import { Tabs, Button } from "antd";
import { useAuth } from "../../global/auth/Authentication";
import { useUserData } from "../../global/auth/UserData";
import { useMoralis } from "react-moralis";
import { db } from "../../utils/firebase";
import axios from "axios";
import { useIPFS } from "../../hooks/useIPFS";
import ReactDOMServer from "react-dom/server";

import { InboxOutlined, UploadOutlined } from "@ant-design/icons";
import { Form, Select, Input, message, Space } from "antd";

const { Option } = Select;
const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 14,
  },
};

const normFile = (e) => {
  console.log("Upload event:", e);

  if (Array.isArray(e)) {
    return e;
  }

  return e?.fileList;
};

// TODO clear form once complete
const MakePlaylist = () => {
  const { userData } = useUserData();
  const { resolveLink } = useIPFS();
  const [ownTokens, setOwnTokens] = useState([]); // all own tokens
  const [tokensUI, setTokensUI] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOwnTokens();
  }, []);

  const addAlbumToDB = async (type, title, image, tracks) => {
    await db.collection("tracklist").add({
      type: type,
      title: title,
      image: image,
      tracks: tracks,
      creator: userData.id,
    });
  };

  // tracklist collection's doc holds type (album or playlist), title (album name), tracklist (array of uri), creator (user id)
  const onFinish = async (values) => {
    //console.log("Received values of form: ", values);
    //console.log("values.album_name: " + values.album_name);
    //console.log("values.select_multiple: " + values.select_multiple);
    let found = ownTokens.find((i) => i.uri === values.select_multiple[0]);
    let image = found.image;
    //console.log("userData.id: " + userData.id);
    await addAlbumToDB(
      "album",
      values.album_name,
      image,
      values.select_multiple
    ).then(message.success("Made album successfully!"));
  };

  const makeAlbumForm = () => {
    if (ownTokens.length > 0) {
      generateTokensUI2();
    } else {
      setTokensUI(<h1>No music to make playlists here!</h1>);
    }
  };

  // generate unique key for divs
  const generateKey = (pre) => {
    return `${pre}_${new Date().getTime()}`;
  };

  // see all own minted music TODO
  const getOwnTokens = async () => {
    setOwnTokens([]);
    let responseArr = [];
    let temp = [];
    const options = {
      method: "GET",
      url: `https://deep-index.moralis.io/api/v2/${userData.ethAddress}/nft`,
      params: { chain: "mumbai", format: "decimal" },
      headers: { accept: "application/json", "X-API-Key": "test" },
    };

    await axios
      .request(options)
      .then(function (response) {
        responseArr = response.data.result;
        responseArr.map(async (i) => {
          // access each token's id and uri
          // console.log("i.owner_of: " + i.owner_of);
          // console.log("userData.ethAddress: " + userData.ethAddress);
          if (i.name === "demuseToken" && i.owner_of === userData.ethAddress) {
            //temp.push(i.token_uri);
            //setOwnTokens((oldArray) => [...oldArray, i.token_uri]);
            let metadata = JSON.parse(i.metadata);
            /*console.log(
              "metadata.name: " +
                metadata.name +
                ", i.token_uri: " +
                i.token_uri
            );*/
            setOwnTokens((oldArray) => [
              ...oldArray,
              { name: metadata.name, uri: i.token_uri, image: metadata.image },
            ]);
            //let obj = await fetch(i.token_uri);
            //let json = await obj.json();
            //console.log("json: " + JSON.stringify(json));
          }
        });
      })
      .catch(function (error) {
        console.error(error);
      });
    setLoading(false);
  };

  const generateOptionsUI = () => {
    let options = [];
    ownTokens.map((token) => {
      let temp = (
        <>
          <Option value={token.uri}>{token.name}</Option>
        </>
      );
      options.push(temp);
    });
    return options;
  };

  const generateTokensUI2 = () => {
    setTokensUI([]);
    let form = (
      <>
        <Form name="validate_other" {...formItemLayout} onFinish={onFinish}>
          <Form.Item
            name="album_name"
            label="Album Name"
            rules={[
              {
                required: true,
                message: "Please input your username!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="select_multiple"
            label="Select Track(s)"
            rules={[
              {
                required: true,
                message: "Please select your tracks!",
                type: "array",
              },
            ]}
          >
            <Select mode="multiple" placeholder="Please select your tracks">
              {generateOptionsUI()}
            </Select>
          </Form.Item>

          <Form.Item
            wrapperCol={{
              span: 12,
              offset: 6,
            }}
          >
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </>
    );
    setTokensUI(form);
  };

  const generateTokensUI = async (tokens) => {
    setTokensUI([]);
    await tokens.map(async (token) => {
      await (await fetch(resolveLink(token))).json().then((i) => {
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
                Artist: {i.artist}, Title: {i.name}, Year: {i.year}, Duration:{" "}
                {i.duration}
              </p>
            </div>
          </>
        );
        setTokensUI((oldArray) => [...oldArray, metadata]);
      });
    });
  };
  return (
    <>
      <h1>MakePlaylist</h1>
      {loading ? (
        <h1>loading...</h1>
      ) : (
        <div>
          <Button
            type="dashed"
            size={"default"}
            onClick={() => {
              makeAlbumForm();
            }}
          >
            Make Album
          </Button>
          {tokensUI}
        </div>
      )}
    </>
  );
};

export default MakePlaylist;
