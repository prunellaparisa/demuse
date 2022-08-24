import { React, useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SignInSignUp.css";
import {  Form, Input, Button  } from 'antd';
import { auth } from "../utils/firebase";

const SignUp = () => {
    //Input validation
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const onFinish = async (values) => {
        try{
            await signUp(values.email, values.password).then(navigate('/')); // add user to db
          }catch(err){ 
            switch(err.code){
              case 'auth/email-already-in-use':
                return setError("Email has been used, try another one");
              case 'auth/weak-password':
                return setError("Password is too weak. Try adding more characters!");
              default:
                return setError("Something is wrong... please try again later");
            }
          }
      };
    
      const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
      };

      const signUp = (email, password) => {
        return auth.createUserWithEmailAndPassword(email,password);
      }
    return (
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
                            message: 'Please input your email!',
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
                            message: 'Please input your username!',
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
                            message: 'Please input your password!',
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
                <Button type="link" href="/">Already have a demuse account?</Button>
            </div>
    </>
  );
};

export default SignUp;