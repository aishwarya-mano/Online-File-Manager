import React, { useState, useRef, useEffect } from "react";
import { Button, Modal, Form } from "react-bootstrap";

import axios from "axios";
import "./Login.css";

export default function FileEditor(props) {
    const [file, setFile] = useState("");
    const [description, setDescription] = useState(props.description);
    const [message, setMessage] = useState("");
    const $fileInput = useRef();

    useEffect(() => {
        setDescription(props.description);
    }, [props.description]);

    const handleUpload = async () => {
        let formData = new FormData();
        if (file.length > 0) {
            formData.append("file", file[0]);
        }

        formData.append("file_id", props.fileid);
        formData.append("description", description);
        return axios
            .post("/update_file", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            .then((response) => {
                console.log(response);
                if (response.data.success) {
                    setMessage(response.data.message);
                    $fileInput.current.value = null;
                } else {
                    setMessage(response.data.message);
                }
            })
            .catch((err) => {
                setMessage(err.message);
            });
    };

    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Edit Your File
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label>Previously Uploaded File</Form.Label>
                        <p>
                            <a href={props.file} target="_blank" rel="noreferrer">
                                {" "}
                                {props.filename}{" "}
                            </a>
                        </p>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formGroupDescription">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            type="text"
                            value={description}
                            onChange={(e) => {
                                setDescription(e.target.value);
                            }}
                        />
                    </Form.Group>
                    <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label>
                            Select a new file to replace/ Leave blank just to update desc{" "}
                        </Form.Label>
                        <Form.Control
                            type="file"
                            ref={$fileInput}
                            onChange={(e) => setFile(e.target.files)}
                        />
                    </Form.Group>
                </Form>
                <p>{message}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handleUpload}>Update</Button>
                <Button variant="danger" onClick={props.onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
