import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./MusicUpload.css";
import { Button, Form, Upload, Alert } from "antd";
import { InboxOutlined, UploadOutlined } from "@ant-design/icons";
// make a dummy form

//const {  InboxOutlined, UploadOutlined  } = icons;
// TODO: upload files to IPFS (music.js step), add doc to db to collection "mint-request",
// goes to submissions page to check submission state, if approved there's a mint button,
// when mint btn pressed, metadata.js step invoked and the resulting uris will be minted one by one (for-loop)

// at some point need to inject metamask
// admin checks "mint-request" docs to see "submitted" requests and checks if user owns the image and
// if the audio is authentic and owned by no one else
const MusicUpload = () => {
  //const { state } = useLocation();
  //const { userUID } = state; // Read values passed on state
  //console.log("music upload user: " + userUID); //able to pass uid
  const navigate = useNavigate();

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
      setAlert(<Alert message="Submission successful." type="success" />);
      console.log("Received values of form: ", values);
    }
  };

  return (
    <>
      <div className="musicUpload">
        <h1 className="title">Upload Music To IPFS</h1>
        {alert}
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
      </div>
    </>
  );
};

export default MusicUpload;
