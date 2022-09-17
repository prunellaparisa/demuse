import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./MusicUpload.css";
import { Button, Form, Upload, Alert, Spin } from "antd";
import { InboxOutlined, UploadOutlined } from "@ant-design/icons";
import { useMoralisFile } from "react-moralis";
import { useUserData } from "../global/auth/UserData";
import { db } from "../utils/firebase";
import { Buffer } from "buffer";
import getBlobDuration from "get-blob-duration";
// make a dummy form

//const {  InboxOutlined, UploadOutlined  } = icons;
// upload files to IPFS, add doc to db to collection "mint-request",
// TODO: goes to submissions page to check submission state, if approved there's a mint button,
// when mint btn pressed, the resulting metadata uris will be minted one by one (for-loop)

// admin checks "mint-request" docs to see "submitted" requests and checks if user owns the image and
// if the audio is authentic and owned by no one else
const MusicUpload = () => {
  const { error, isUploading, moralisFile, saveFile } = useMoralisFile();
  //const { state } = useLocation();
  //const { userUID } = state; // Read values passed on state
  //console.log("music upload user: " + userUID); //able to pass uid
  const navigate = useNavigate();
  const { userData } = useUserData();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState("");
  const formItemLayout = {
    labelCol: {
      span: 6,
    },
    wrapperCol: {
      span: 14,
    },
  };

  const normFile = (e) => {
    // console.log('Upload event:', e);

    if (Array.isArray(e)) {
      return e;
    }

    return e?.fileList;
  };

  const dummyRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  const onFinish = (values) => {
    if (values.image_upload.length > 1) {
      setAlert(
        <Alert message="Only one album cover is allowed." type="error" />
      );
    } else if (
      values.image_upload === undefined ||
      values.audio_dragger === undefined ||
      values.image_upload < 1 ||
      values.audio_dragger < 1
    ) {
      setAlert(
        <Alert
          message="At least one album cover and one audio file to be submitted."
          type="error"
        />
      );
    } else {
      setLoading(true);
      let uploadArray = [...values.audio_dragger, ...values.image_upload];
      IPFSInitial(uploadArray).then((o) => {
        IPFSMetadata(uploadArray, o);
      });
    }
  };
  const IPFSInitial = async (uploadArray) => {
    let hashes = [];

    for (let i = 0; i < uploadArray.length; i++) {
      await saveFile(
        uploadArray[i].originFileObj.name,
        uploadArray[i].originFileObj,
        {
          saveIPFS: true,
        }
      )
        .then((o) => {
          hashes.push(o._hash);
        })
        .catch(() => {
          console.log(error);
        });
    }
    return hashes;
  };

  const IPFSMetadata = async (uploadArray, hashes) => {
    let dur = "";
    let results = [];
    for (let i = 0; i < uploadArray.length - 1; i++) {
      await duration(uploadArray[i]).then((j) => {
        dur = j;
      });
      let metadataObj = {
        image: `ipfs://${hashes[hashes.length - 1]}`, //xxx = hash
        name: uploadArray[i].originFileObj.name.replace(".mp3", ""),
        animation_url: `ipfs://${hashes[i]}`, //xxx = hash
        duration: dur, //
        artist: userData.username,
        year: new Date().getFullYear(),
      };
      await saveFile(
        uploadArray[i].originFileObj.name.replace(".mp3", ".json"),
        { base64: Buffer.from(JSON.stringify(metadataObj)).toString("base64") },
        {
          type: "application/json",
          metadata: metadataObj,
          saveIPFS: true,
        }
      )
        .then((o) => {
          let metadataLink = `ipfs://${o._hash}`;
          results.push(metadataLink);
        })
        .catch(() => {
          console.log(error);
        });
    }
    metadataApproval(results);
  };

  const metadataApproval = async (metadataLinks) => {
    await db
      .collection("mint-request")
      .add({
        links: metadataLinks,
        status: "submitted",
        adminID: "QW41a9A8aASIKm90KXENdHfWzXr2",
      })
      .then((o) => {
        setLoading(false);
        setAlert(<Alert message="Submission successful." type="success" />);
      });
  };

  const duration = async (audio) => {
    let duration = "00:00";
    await getBlobDuration(audio.originFileObj).then((res) => {
      let minutes = "0" + parseInt(res / 60, 10);
      let seconds = "0" + parseInt(res % 60);
      duration = minutes + ":" + seconds.slice(-2);
    });
    return duration;
  };

  return (
    <>
      <div className="musicUpload">
        <h1 className="title">Upload Music To IPFS</h1>
        {alert}
        <Spin spinning={loading}>
          <div className="uploadForm">
            <Form name="validate_other" {...formItemLayout} onFinish={onFinish}>
              <Form.Item
                name="image_upload"
                label="Album Cover"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                extra="Only one is permitted."
              >
                <Upload
                  name="logo"
                  customRequest={dummyRequest}
                  listType="picture"
                  accept="image/*"
                >
                  <Button icon={<UploadOutlined />}>Upload Album Cover</Button>
                </Upload>
              </Form.Item>

              <Form.Item label="Audio(s)">
                <Form.Item
                  name="audio_dragger"
                  valuePropName="fileList"
                  getValueFromEvent={normFile}
                  extra="Multiple files are accepted."
                >
                  <Upload.Dragger
                    name="files"
                    customRequest={dummyRequest}
                    accept="audio/*"
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">
                      Click or drag file to this area to upload
                    </p>
                    <p className="ant-upload-hint">
                      Support for a single or bulk upload.
                    </p>
                  </Upload.Dragger>
                </Form.Item>
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
          </div>
        </Spin>
      </div>
    </>
  );
};

export default MusicUpload;
