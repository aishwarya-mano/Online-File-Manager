import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container, Form, Row } from "react-bootstrap";

import axios from "axios";

function Registration() {
    const [message, setMessage] = useState("");
    const [emailID, setEmailID] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [userRole, setUserRole] = useState("");
    const [disableRegister, setDisableRegister] = useState(true);

    const navigate = useNavigate();
    const handleRegister = () => {
        if (
            emailID.length > 0 &&
            password.length > 0 &&
            firstName.length > 0 &&
            lastName.length > 0 &&
            userRole.length > 0
        ) {
            setDisableRegister(false);
        }
    };

    const handleSubmit = async (e) => {
        if (
            emailID.length === 0 ||
            password.length === 0 ||
            firstName.length === 0 ||
            lastName.length === 0 ||
            userRole.length === 0
        ) {
            setMessage("Please enter all the required fields");
            return;
        }

        if (userRole !== "Admin" && userRole !== "Regular") {
            setMessage("UserRole allowed values: Admin or Regular");
            return;
        }

        e.preventDefault();
        try {
            const response = await axios.post("/register", {
                email_id: emailID,
                password: password,
                firstname: firstName,
                lastname: lastName,
                user_role: userRole,
            });
            console.log(response.data);

            if (response.data.success) {
                navigate("/login");
                console.log(response.data.message);
            } else {
                setMessage(response.data.message);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    // Redirect to the login page
    const handleLogin = () => {
        navigate("/login");
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
                                    value={emailID}
                                    onChange={(e) => {
                                        setEmailID(e.target.value);
                                        setMessage("");
                                        handleRegister();
                                    }}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formGroupPassword">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setMessage("");
                                        handleRegister();
                                    }}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formGroupFirstName">
                                <Form.Label>First Name</Form.Label>
                                <Form.Control
                                    type="firstname"
                                    placeholder="First Name"
                                    value={firstName}
                                    onChange={(e) => {
                                        setFirstName(e.target.value);
                                        setMessage("");
                                        handleRegister();
                                    }}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formGroupLastName">
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control
                                    type="lastname"
                                    placeholder="Last Name"
                                    value={lastName}
                                    onChange={(e) => {
                                        setLastName(e.target.value);
                                        setMessage("");
                                        handleRegister();
                                    }}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formGroupUserRole">
                                <Form.Label>User Role</Form.Label>
                                <Form.Control
                                    type="userrole"
                                    placeholder="Admin or Regular"
                                    value={userRole}
                                    onChange={(e) => {
                                        setUserRole(e.target.value);
                                        setMessage("");
                                        handleRegister();
                                    }}
                                />
                            </Form.Group>
                            <div class="d-flex align-content-end flex-wrap">
                                <Button
                                    variant="primary"
                                    disabled={disableRegister}
                                    onClick={handleSubmit}
                                >
                                    Register
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleLogin}
                                    style={{ marginLeft: "20px" }}
                                >
                                    Already Register?
                                </Button>
                            </div>
                            <div
                                class="d-flex align-content-end flex-wrap"
                                style={{ "margin-top": "20px" }}
                            >
                                {message && <p>{message}</p>}
                            </div>
                        </Form>
                    </Container>
                </Row>
            </Container>
        </div>
    );
}

export default Registration;
