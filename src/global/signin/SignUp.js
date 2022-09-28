import { React, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SignInSignUp.css";
import { Form, Input, Button } from "antd";
import { db } from "../../utils/firebase";
import { useAuth } from "../../global/auth/Authentication";
import ErrorRoute from "../routes/ErrorRoute";
import { useMoralis } from "react-moralis";

const SignUp = () => {
  //Retrive the sign up from context
  const { signUp, currentUser } = useAuth();
  const {
    authenticate,
    isAuthenticated,
    isAuthenticating,
    user,
    account,
    logout,
  } = useMoralis();
  //Input validation
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const onFinish = async (values) => {
    try {
      await signUp(values.email, values.password).then(async (i) => {
        await authenticate({ signingMessage: "Log in using Moralis" })
          .then((user) => {
            console.log(user.get("ethAddress")); // save ethAddress to firebase upon signup and cross check it when signing in
            addUserToDB(i.user.uid, values.username, user.get("ethAddress"));
            navigate("/"); //possible to pass props through navigation? pass user that is
          })
          .catch(function (error) {
            console.log(error);
          });
        //navigate("/", { state: { userUID: i.user.uid } }); //possible to pass props through navigation? pass user that is
      });
    } catch (err) {
      switch (err.code) {
        case "auth/email-already-in-use":
          return setError(
            "Email has been used, try another one or sign in instead"
          );
        case "auth/weak-password":
          return setError("Password is too weak. Try adding more characters!");
        default:
          return setError("Something is wrong... please try again later");
      }
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const addUserToDB = async (uid, username, address) => {
    const docExists = (await db.collection("user").doc(uid).get()).exists;

    if (!docExists) {
      await db.collection("user").doc(uid).set({
        username: username,
        role: "customer",
        ethAddress: address,
        lastPaidDate: "invalid",
        listeningLog: [],
      });
    } // add user to db
  };
  return !currentUser ? (
    <>
      <h1 className="appTitle">demuse</h1>
      <h2 className="appTitle">Sign Up</h2>
      <div className="form">
        <Form
          name="basic"
          labelCol={{
            span: 2,
          }}
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          className="form"
        >
          <Form.Item
            label={<label style={{ color: "antiquewhite" }}>Email:</label>}
            name="email"
            rules={[
              {
                required: true,
                message: "Please input your email!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={<label style={{ color: "antiquewhite" }}>Username:</label>}
            name="username"
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
            label={<label style={{ color: "antiquewhite" }}>Password:</label>}
            name="password"
            rules={[
              {
                required: true,
                message: "Please input your password!",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            wrapperCol={{
              offset: 2,
            }}
          >
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
      <h3>{error}</h3>
      <div className="div1">
        <Button type="link" href="/">
          Already have a demuse account?
        </Button>
      </div>
    </>
  ) : (
    <ErrorRoute err="already-login" />
  );
};

export default SignUp;
