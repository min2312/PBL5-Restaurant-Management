import React, { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { CreateNewUser } from "../../services/userService";
import { toast } from "react-toastify";

const CreateUser = () => {
	const history = useHistory();
	const [showModal, setShowModal] = useState(false);
	const [newUser, setNewUser] = useState({
		fullName: "",
		email: "",
		password: "",
		role: "receptionist",
	});

	const handleShowModal = () => setShowModal(true);
	const handleCloseModal = () => {
		setNewUser({
			fullName: "",
			email: "",
			password: "",
			role: "receptionist",
		});
		setShowModal(false);
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setNewUser({ ...newUser, [name]: value });
	};

	const handleCreateUser = async (e) => {
		e.preventDefault();
		if (!newUser.fullName || !newUser.email || !newUser.password) {
			toast.error("Please fill in all fields");
			return;
		}
		try {
			const response = await CreateNewUser(newUser);
			if (response && response.errCode === 0) {
				setNewUser({
					fullName: "",
					email: "",
					password: "",
					role: "receptionist",
				});
				toast.success("Create User Success");
				handleCloseModal();
			} else {
				toast.error(response.errMessage);
			}
		} catch (e) {
			toast.error("Create user failed. Please try again.");
			console.log(e);
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
								name="fullName"
								value={newUser.fullName}
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
