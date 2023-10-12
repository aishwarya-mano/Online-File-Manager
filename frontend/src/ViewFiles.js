import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Container, Row, Nav, Stack } from "react-bootstrap";

import axios from "axios";
import Table from "react-bootstrap/Table";

import FileEditor from "./FileEditor";
import DeletionModal from "./DeletionModal";
import "./Login.css";

export default function ViewFiles(props) {
    const [files, setFiles] = useState([]);
    const [modalShow, setModalShow] = useState(false);
    const [fileId, setFileId] = useState("");
    const [description, setDescription] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState("");
    const [deletionShow, setDeletionShow] = useState(false);
    const [currentUser, setCurrentUser] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (props.currentUser) {
            setCurrentUser(props.currentUser);
        } else {
            setCurrentUser(localStorage.getItem("currentUser"));
        }
        fetchAllUploadedFiles();
    }, [props.currentUser]);

    const fetchAllUploadedFiles = () => {
        axios
            .get("/view_files")
            .then((response) => {
                const { data } = response;
                if (data.files) {
                    setFiles(data.files);
                }
            })
            .catch((error) => {
                console.error("Error fetching files:", error);
            });
    };

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

    const handleDelete = (fileId) => {
        axios
            .delete(`/delete_file/${fileId}`)
            .then((response) => {
                if (response.data.success) {
                    setDeletionShow(true);
                }
            })
            .catch((error) => {
                console.error("Error fetching files:", error);
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
                                <div className="fullscreen-user"> Welcome {currentUser}, </div>
                            </Row>
                        </div>
                        <div className="view-files">
                            <Nav variant="tabs" defaultActiveKey="/view">
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
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>File Name</th>
                                        <th>Description</th>
                                        <th>Uploaded File</th>
                                        <th>Creation Time</th>
                                        <th>Last Updated Time</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {files.map((file) => (
                                        <tr key={file.file_id}>
                                            <td>{file.filename}</td>
                                            <td>{file.description}</td>
                                            <td>
                                                <a
                                                    href={file.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    View File
                                                </a>
                                            </td>
                                            <td>{file.creation_time}</td>
                                            <td>{file.updated_time}</td>
                                            <td>
                                                <Button
                                                    variant="dark"
                                                    onClick={() => {
                                                        setFileId(file.file_id);
                                                        setDescription(file.description);
                                                        setSelectedFile(file.file_url);
                                                        setSelectedFileName(file.filename);
                                                        setModalShow(true);
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    style={{ marginLeft: "20px" }}
                                                    onClick={() => {
                                                        handleDelete(file.file_id);
                                                    }}
                                                >
                                                    Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            <FileEditor
                                show={modalShow}
                                fileid={fileId}
                                file={selectedFile}
                                filename={selectedFileName}
                                description={description}
                                onHide={() => {
                                    fetchAllUploadedFiles();
                                    setModalShow(false);
                                }}
                            />
                            <DeletionModal
                                show={deletionShow}
                                onHide={() => {
                                    fetchAllUploadedFiles();
                                    setDeletionShow(false);
                                }}
                            />
                        </div>
                    </Container>
                </Row>
            </Container>
        </div>
    );
}
