import { React, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SignInSignUp.css";
import { Form, Input, Button } from "antd";
import { useAuth } from "../../global/auth/Authentication";
import ErrorRoute from "../routes/ErrorRoute";

const SignIn = () => {
  //Retrive the sign up from context
  const { signIn, setCurrentUser, currentUser } = useAuth();
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const onFinish = async (values) => {
    let user;
    try {
      await signIn(values.email, values.password).then((i) => {
        user = i.user;
        setCurrentUser(i.user);
        navigate("/");
      });

      //navigate('/', {state: {userUID: user.uid}}); //possible to pass props through navigation? pass user that is
    } catch (e) {
      switch (e.code) {
        case "auth/user-not-found":
          setError("Email has not been used yet");
          break;
        default:
          setError("Email or password are incorrect.");
      }
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };
  return !currentUser ? (
    <>
      <h1 className="appTitle">demuse</h1>
      <h2 className="appTitle">Sign In</h2>

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
        <Button type="link" href="/signup">
          Don't have a demuse account?
        </Button>
      </div>
    </>
  ) : (
    <ErrorRoute err="already-login" />
  );
};

export default SignIn;
