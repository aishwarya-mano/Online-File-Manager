import React, { useState } from "react";
import axios from "axios";

import { useNavigate } from "react-router-dom";
import { Button, Container, Form, Row } from "react-bootstrap";

import "./Login.css";

export default function Login(props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const handleLogin = async () => {
        console.log(email);
        console.log(password);
        if (email.length === 0 && password.length === 0) {
            setErrorMessage("Please Enter Email ID & Password!");
            return;
        }

        if (email.length === 0) {
            setErrorMessage("Email ID can't be empty!");
            return;
        }

        if (password.length === 0) {
            setErrorMessage("Password can't be empty!");
            return;
        }

        if (!validateEmail(email)) {
            setErrorMessage("Enter a valid Email Address!");
            return;
        }

        try {
            const response = await axios.post("/login", {
                email_id: email,
                password: password,
            });

            if (response.data.success) {
                console.log(response.data.user);
                props.onLoggedIn(response.data.user);
                localStorage.setItem("currentUser", response.data.user);
                if (response.data.is_admin) {
                    navigate("/admin_view", {
                        user: { name: response.data.user },
                    });
                } else {
                    navigate("/view", {
                        user: { name: response.data.user },
                    });
                }
            } else {
                setErrorMessage(response.data.message);
            }
        } catch (error) {
            console.error("Error during login:", error);
            setErrorMessage("Error During Login, Please try again");
        }
    };

    const handleRegister = () => {
        navigate("/register");
    };

    return (
        <div className="fullscreen">
            <Container fluid>
                <Row className={"fullscreen-body"}>
                    <Container className={"fullscreen-form"}>
                        <div className="h1"> Welcome to Online File Manager</div>
                        <Form>
                            <Form.Group className="mb-3" controlId="formGroupEmail">
                                <Form.Label>Email address</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter email"
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setErrorMessage("");
                                    }}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formGroupPassword">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Password"
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setErrorMessage("");
                                    }}
                                />
                            </Form.Group>
                            <div class="d-flex align-content-end flex-wrap">
                                <Button variant="primary" onClick={handleLogin}>
                                    Login
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleRegister}
                                    style={{ marginLeft: "20px" }}
                                >
                                    Register New User
                                </Button>
                            </div>
                            <div
                                class="d-flex align-content-end flex-wrap"
                                style={{ marginTop: "20px" }}
                            >
                                {errorMessage && <p>{errorMessage}</p>}
                            </div>
                        </Form>
                    </Container>
                </Row>
            </Container>
        </div>
    );
}
