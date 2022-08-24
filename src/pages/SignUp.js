import React from "react";
import { Link } from "react-router-dom";
import "./SignInSignUp.css";
import {  Form, Input, Button  } from 'antd';

const SignUp = () => {
    const onFinish = (values) => {
        console.log('Success:', values);
        console.log('values.email:', values.email); // use this to access values entered
      };
    
      const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
      };
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
    </>
  );
};

export default SignUp;