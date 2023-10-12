import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Button, Form, Container, Row, Nav, Stack } from "react-bootstrap";
import React, { useState, useRef, useEffect } from "react";

import "./Login.css";

export default function Uploads(props) {
    const [file, setFile] = useState("");
    const [description, setDescription] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const $fileInput = useRef();
    const [currentUser, setCurrentUser] = useState("");

    useEffect(() => {
        if (props.currentUser) {
            setCurrentUser(props.currentUser);
        } else {
            setCurrentUser(localStorage.getItem("currentUser"));
        }
    }, [props.currentUser]);

    const userLogout = async () => {
        axios
            .post("/logout")
            .then((response) => {
                if (response.data.success) {
                    navigate("/login");
                }
            })
            .catch((error) => {
                console.error("Error fetching files:", error);
            });
    };

    const handleUpload = async () => {
        let formData = new FormData();
        formData.append("file", file[0]);
        formData.append("description", description);
        return await axios
            .post("/add_file", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            .then((response) => {
                console.log(response);
                if (response.data.success) {
                    setMessage(response.data.message);
                    setFile(null);
                    setDescription("");
                    $fileInput.current.value = null;
                } else {
                    setMessage(response.data.message);
                }
            })
            .catch((err) => {
                return {
                    status: err.response ? err.response.status : 0,
                    data: {},
                    error: err.message,
                };
            });
    };

    return (
        <div className="fullscreen">
            <Container fluid>
                <Row className={"fullscreen-body"}>
                    <Container className={"fullscreen-form"}>
                        <Stack direction="horizontal" gap={2}>
                            <div className="h1">Online File Manager Dashboard</div>
                            <div className="p-2 ms-auto">
                                <Button
                                    variant="secondary"
                                    style={{ marginLeft: "20px" }}
                                    onClick={userLogout}
                                >
                                    Logout
                                </Button>
                            </div>
                        </Stack>
                        <div id="user-text">
                            <Row>
                                <div className="fullscreen-user">Welcome {currentUser},</div>
                            </Row>
                        </div>
                        <div className="view-files">
                            <Nav variant="tabs" defaultActiveKey="/uploads">
                                <Nav.Item>
                                    <Nav.Link href="/view">
                                        <Link to="/view" params={{ currentUser: currentUser }}>
                                            View Dashboard
                                        </Link>
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link href="/uploads">
                                        <Link to="/uploads" params={{ currentUser: currentUser }}>
                                            Uploads
                                        </Link>
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </div>
                        <Form>
                            <Form.Group controlId="formFile" className="mb-3">
                                <Form.Label>Select a File to upload</Form.Label>
                                <Form.Control
                                    type="file"
                                    ref={$fileInput}
                                    onChange={(e) => setFile(e.target.files)}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formGroupDescription">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    type="description"
                                    placeholder="Description"
                                    value={description}
                                    onChange={(e) => {
                                        setDescription(e.target.value);
                                    }}
                                />
                            </Form.Group>
                        </Form>
                        <Button
                            variant="primary"
                            style={{ margin: "20px" }}
                            onClick={handleUpload}
                        >
                            Upload
                        </Button>
                        <p>{message}</p>
                    </Container>
                </Row>
            </Container>
        </div>
    );
}
