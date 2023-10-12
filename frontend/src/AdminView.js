import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';

import { useNavigate } from 'react-router-dom';
import { Button, Container, Row, Nav, Stack } from "react-bootstrap";

import DeletionModal from './DeletionModal';
import './Login.css';

export default function AdminView(props) {
    const [files, setFiles] = useState([]);
    const [currentUser, setCurrentUser] = useState('');
    const [deletionShow, setDeletionShow] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (props.currentUser) {
            setCurrentUser(props.currentUser)
        } else {
            setCurrentUser(localStorage.getItem('currentUser'));
        }
        fetchAllUploadedFiles();
    }, [props.currentUser]);

    const fetchAllUploadedFiles = () => {
        axios.get('/view_files')
            .then((response) => {
                const { data } = response;
                if (data.files) {
                    setFiles(data.files);
                }
            })
            .catch((error) => {
                console.error('Error fetching files:', error);
            });
    }


    const handleDelete = (fileId) => {
        axios.delete(`/delete_file/${fileId}`)
            .then((response) => {
                if (response.data.success) {
                    setDeletionShow(true)
                }
            })
            .catch((error) => {
                console.error('Error fetching files:', error);
            });
    };

    const userLogout = async () => {
        axios.post('/logout')
            .then((response) => {
                if (response.data.success) {
                    setCurrentUser(localStorage.setItem('currentUser', null));
                    navigate('/login');
                }
            })
            .catch((error) => {
                console.error('Error fetching files:', error);
            });
    }
    return (
        <div className='fullscreen'>
            <Container fluid>
                <Row className={"fullscreen-body"}>
                    <Container className={"fullscreen-form"}>
                        <Stack direction="horizontal" gap={2}>
                            <div className="h1">Online File Manager Dashboard - Admin View</div>
                            <div className="p-2 ms-auto">
                                <Button variant="secondary" style={{ "marginLeft": "20px" }} onClick={userLogout}>Logout</Button>
                            </div>
                        </Stack>
                        <div id='user-text'>
                            <Row >
                                <div className='fullscreen-user'> Welcome {currentUser}, </div>
                            </Row>
                        </div>
                        <div className='view-files'>
                            <Nav variant="tabs" defaultActiveKey="/admin_view">
                                <Nav.Item>
                                    <Nav.Link href="/admin_view">Admin View</Nav.Link>
                                </Nav.Item>
                            </Nav>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>File Name</th>
                                        <th>Description</th>
                                        <th>Uploaded By</th>
                                        <th>Uploaded File</th>
                                        <th>Creation Time</th>
                                        <th>Last Updated Time</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {files.map((file) => (
                                        <tr key={file.file_id}>
                                            <td>{file.filename}</td>
                                            <td>{file.description}</td>
                                            <td>{file.uploaded_by}</td>
                                            <td><a href={file.file_url} target="_blank" rel="noopener noreferrer">View File</a></td>
                                            <td>{file.creation_time}</td>
                                            <td>{file.updated_time}</td>
                                            <td>
                                                <Button variant="danger" onClick={() => {
                                                    handleDelete(file.file_id);
                                                }}>Delete</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            <DeletionModal show={deletionShow} onHide={() => {
                                fetchAllUploadedFiles()
                                setDeletionShow(false)
                            }} />
                        </div>
                    </Container>
                </Row>
            </Container></div>
    );
}