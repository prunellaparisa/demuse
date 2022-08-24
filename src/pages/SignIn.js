import { React, useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SignInSignUp.css";
import {  Form, Input, Button  } from 'antd';
import { auth } from "../utils/firebase";

const SignIn = () => {
    const [error, setError] = useState("");
    const navigate = useNavigate();
      const onFinish = async (values) => {
        try{
            await signIn(values.email, values.password);
            //redirect to home page
            navigate('/home');
        } catch (e){
            switch(e.code){
              case 'auth/user-not-found':
                setError('Email has not been used yet');
                break;
              default:
                setError('Email or password are incorrect.');
            }
        }
      };
    
      const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
      };

      const signIn = (email, password) => {
        return auth.signInWithEmailAndPassword(email, password);
      }
    return (
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
                            message: 'Please input your email!',
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
                <Button type="link" href="/signup">Don't have a demuse account?</Button>
            </div>
        </>
    );
};

export default SignIn;