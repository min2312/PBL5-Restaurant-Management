import React, { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import axios from "../../setup/axios";

const CreateUser = () => {
	const [showModal, setShowModal] = useState(false);
	const [newUser, setNewUser] = useState({
		username: "",
		email: "",
		password: "",
		role: "receptionist",
	});

	const handleShowModal = () => setShowModal(true);
	const handleCloseModal = () => setShowModal(false);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setNewUser({ ...newUser, [name]: value });
	};

	const handleCreateUser = async () => {
		try {
			const response = await axios.post("/api/create-new-user", newUser);
			if (response.errCode === 0) {
				alert("User created successfully!");
				handleCloseModal();
			} else {
				alert(response.errMessage);
			}
		} catch (error) {
			console.error("Error creating user:", error);
		}
	};

	return (
		<>
			<Button variant="primary" onClick={handleShowModal}>
				Create New User
			</Button>

			<Modal show={showModal} onHide={handleCloseModal}>
				<Modal.Header closeButton>
					<Modal.Title>Create New User</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form>
						<Form.Group controlId="formUsername">
							<Form.Label>Username</Form.Label>
							<Form.Control
								type="text"
								placeholder="Enter username"
								name="username"
								value={newUser.username}
								onChange={handleInputChange}
							/>
						</Form.Group>
						<Form.Group controlId="formEmail">
							<Form.Label>Email</Form.Label>
							<Form.Control
								type="email"
								placeholder="Enter email"
								name="email"
								value={newUser.email}
								onChange={handleInputChange}
							/>
						</Form.Group>
						<Form.Group controlId="formPassword">
							<Form.Label>Password</Form.Label>
							<Form.Control
								type="password"
								placeholder="Enter password"
								name="password"
								value={newUser.password}
								onChange={handleInputChange}
							/>
						</Form.Group>
						<Form.Group controlId="formRole">
							<Form.Label>Role</Form.Label>
							<Form.Control
								as="select"
								name="role"
								value={newUser.role}
								onChange={handleInputChange}
							>
								<option value="receptionist">Receptionist</option>
								<option value="waiter">Waiter</option>
								<option value="chef">Chef</option>
							</Form.Control>
						</Form.Group>
					</Form>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={handleCloseModal}>
						Close
					</Button>
					<Button variant="primary" onClick={handleCreateUser}>
						Create User
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
};

export default CreateUser;
