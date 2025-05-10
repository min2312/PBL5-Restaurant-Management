import React, { useState, useEffect } from "react";
import {
	Button,
	Modal,
	Form,
	Card,
	Badge,
	Spinner,
	Row,
	Col,
} from "react-bootstrap";
import { toast } from "react-toastify";
import {
	GetAllUser,
	CreateNewUser,
	EditUserService,
	DeleteUser,
} from "../../services/userService";
import {
	FaUsers,
	FaUserPlus,
	FaEdit,
	FaTrashAlt,
	FaSearch,
	FaInfoCircle,
	FaEnvelope,
	FaLock,
	FaUserTie,
} from "react-icons/fa";
import Pagination from "../../Component/Pagination/Pagination";

const ManageUsers = () => {
	// States for users data and UI
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");

	// Pagination states
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage] = useState(6); // Show 6 items per page as requested

	// States for create modal
	const [showModal, setShowModal] = useState(false);
	const [newUser, setNewUser] = useState({
		fullName: "",
		email: "",
		password: "",
		role: "receptionist",
	});

	// States for edit modal
	const [showEditModal, setShowEditModal] = useState(false);
	const [editUser, setEditUser] = useState({
		id: "",
		fullName: "",
		email: "",
		password: "",
		role: "",
	});

	// States for delete modal
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [userToDelete, setUserToDelete] = useState(null);

	// Fetch users on component mount
	useEffect(() => {
		fetchUsers();
	}, []);

	// Reset to first page when search term changes
	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm]);

	// Fetch users from API
	const fetchUsers = async () => {
		setLoading(true);
		try {
			const response = await GetAllUser("ALL");
			if (response && response.errCode === 0) {
				setUsers(response.user || []);
			} else {
				throw new Error("Failed to fetch users");
			}
		} catch (error) {
			console.error("Error fetching users:", error);
			toast.error(error.message || "Failed to load users");
		} finally {
			setLoading(false);
		}
	};

	// Format role for display
	const formatRole = (role) => {
		switch (role) {
			case "receptionist":
				return "Receptionist";
			case "waiter":
				return "Waiter";
			case "chef":
				return "Chef";
			case "admin":
				return "Admin";
			default:
				return role;
		}
	};

	// Get role badge variant
	const getRoleBadgeVariant = (role) => {
		switch (role) {
			case "receptionist":
				return "info";
			case "waiter":
				return "success";
			case "chef":
				return "warning";
			case "admin":
				return "danger";
			default:
				return "secondary";
		}
	};

	// Handle input change for create form
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setNewUser({ ...newUser, [name]: value });
	};

	// Handle input change for edit form
	const handleEditInputChange = (e) => {
		const { name, value } = e.target;
		setEditUser({ ...editUser, [name]: value });
	};

	// Modal handlers - Create
	const handleShowModal = () => setShowModal(true);
	const handleCloseModal = () => {
		setShowModal(false);
		setNewUser({ fullName: "", email: "", password: "", role: "receptionist" });
	};

	// Modal handlers - Edit
	const handleShowEditModal = (user) => {
		setEditUser({
			id: user.id,
			fullName: user.fullName,
			email: user.email,
			password: "", // Do not show the actual password
			role: user.role,
		});
		setShowEditModal(true);
	};
	const handleCloseEditModal = () => {
		setShowEditModal(false);
		setEditUser({ id: "", fullName: "", email: "", password: "", role: "" });
	};

	// Modal handlers - Delete
	const handleShowDeleteModal = (user) => {
		setUserToDelete(user);
		setShowDeleteModal(true);
	};
	const handleCloseDeleteModal = () => {
		setShowDeleteModal(false);
		setUserToDelete(null);
	};

	// Create new user
	const handleCreateUser = async () => {
		if (
			!newUser.fullName.trim() ||
			!newUser.email.trim() ||
			!newUser.password.trim()
		) {
			toast.error("All fields are required");
			return;
		}

		setLoading(true);
		try {
			const response = await CreateNewUser(newUser);
			if (response?.errCode === 0) {
				toast.success("User created successfully");
				if (response.user) {
					setUsers((prevUsers) => [...prevUsers, response.user]);
				} else {
					throw new Error("Failed to retrieve new user data");
				}
				handleCloseModal();
			} else {
				throw new Error(response?.errMessage || "Failed to create user");
			}
		} catch (error) {
			console.error("Error creating user:", error);
			toast.error(error.message || "Failed to create user");
		} finally {
			setLoading(false);
		}
	};

	// Edit user
	const handleEditUser = async () => {
		if (!editUser.fullName.trim() || !editUser.email.trim()) {
			toast.error("Full name and email are required");
			return;
		}

		setLoading(true);
		try {
			const response = await EditUserService(editUser);
			if (response?.errCode === 0) {
				toast.success("User updated successfully");

				setUsers((prevUsers) =>
					prevUsers.map((u) =>
						u.id === editUser.id ? { ...u, ...editUser } : u
					)
				);
				handleCloseEditModal();
			} else {
				throw new Error(response?.errMessage || "Failed to update user");
			}
		} catch (error) {
			console.error("Error updating user:", error);
			toast.error(error.message || "Failed to update user");
		} finally {
			setLoading(false);
		}
	};

	// Delete user
	const handleDeleteUser = async () => {
		if (!userToDelete) return;

		setLoading(true);
		try {
			const response = await DeleteUser(userToDelete.id);
			if (response?.errCode === 0) {
				toast.success("User deleted successfully");

				setUsers((prevUsers) =>
					prevUsers.filter((u) => u.id !== userToDelete.id)
				);
				handleCloseDeleteModal();

				// If we deleted the last item on the current page, go to the previous page
				const newTotalPages = Math.ceil((users.length - 1) / itemsPerPage);
				if (currentPage > newTotalPages && newTotalPages > 0) {
					setCurrentPage(newTotalPages);
				}
			} else {
				throw new Error(response?.errMessage || "Failed to delete user");
			}
		} catch (error) {
			console.error("Error deleting user:", error);
			toast.error(error.message || "Failed to delete user");
		} finally {
			setLoading(false);
		}
	};

	// Filter users by search term
	const filteredUsers = users.filter((user) => {
		return (
			user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			formatRole(user.role)?.toLowerCase().includes(searchTerm.toLowerCase())
		);
	});

	// Get current users for pagination
	const indexOfLastUser = currentPage * itemsPerPage;
	const indexOfFirstUser = indexOfLastUser - itemsPerPage;
	const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

	// Calculate total pages
	const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

	// Change page
	const handlePageChange = (pageNumber) => {
		setCurrentPage(pageNumber);
	};

	// Calculate displayed range
	const startRange = filteredUsers.length > 0 ? indexOfFirstUser + 1 : 0;
	const endRange = Math.min(indexOfLastUser, filteredUsers.length);

	return (
		<div className="container-fluid px-0">
			<Card className="shadow border-0 mb-4">
				<Card.Header className="bg-gradient-primary d-flex justify-content-between align-items-center py-3">
					<div className="d-flex align-items-center">
						<FaUsers className="me-2 fs-4 text-white" />
						<h5 className="m-0 fw-bold text-white">Restaurant Staff</h5>
					</div>
				</Card.Header>
				<Card.Body className="p-0">
					<div className="p-4">
						<Row className="mb-4 g-3">
							<Col md={6}>
								<Button
									variant="primary"
									className="d-flex align-items-center shadow-sm"
									onClick={handleShowModal}
									disabled={loading}
								>
									<FaUserPlus className="me-2" />
									Create New User
								</Button>
							</Col>
							<Col md={6}>
								<div className="position-relative">
									<Form.Control
										type="text"
										placeholder="Search users by name, email or role..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="ps-5 shadow-sm"
										style={{
											fontSize: "1rem",
											height: "auto",
											padding: "0.65rem 0.75rem",
										}}
									/>
									<FaSearch
										className="position-absolute text-muted"
										style={{
											left: "15px",
											top: "50%",
											transform: "translateY(-50%)",
											fontSize: "0.9rem",
										}}
									/>
								</div>
							</Col>
						</Row>
					</div>

					{loading ? (
						<div className="text-center py-5">
							<Spinner animation="border" variant="primary" />
							<p className="mt-2 text-muted">Loading users...</p>
						</div>
					) : (
						<>
							<div className="table-responsive">
								<table
									className="table table-hover align-middle bg-white mb-0"
									style={{ fontSize: "1.05rem" }}
								>
									<thead>
										<tr className="bg-light">
											<th className="fw-semibold py-3 ps-4">ID</th>
											<th className="fw-semibold py-3">Full Name</th>
											<th className="fw-semibold py-3">Email</th>
											<th className="fw-semibold py-3">Role</th>
											<th className="fw-semibold py-3 text-center">Actions</th>
										</tr>
									</thead>
									<tbody>
										{currentUsers.length > 0 ? (
											currentUsers.map((user) => (
												<tr key={user.id}>
													<td className="ps-4">
														<span className="fw-medium">{user.id}</span>
													</td>
													<td>
														<div className="d-flex align-items-center">
															<div
																className="user-avatar bg-light text-primary border rounded-circle me-2 d-flex align-items-center justify-content-center"
																style={{ width: "45px", height: "45px" }}
															>
																<span className="fw-bold fs-5">
																	{user.fullName?.charAt(0).toUpperCase()}
																</span>
															</div>
															<div>
																<span className="fw-medium">
																	{user.fullName}
																</span>
															</div>
														</div>
													</td>
													<td>
														<div className="d-flex align-items-center">
															<FaEnvelope className="text-muted me-2" />
															<span>{user.email}</span>
														</div>
													</td>
													<td>
														<Badge
															bg={getRoleBadgeVariant(user.role)}
															pill
															className="px-3 py-2 fs-6"
														>
															{formatRole(user.role)}
														</Badge>
													</td>
													<td>
														<div className="d-flex justify-content-center gap-2">
															<Button
																variant="outline-info"
																size="sm"
																className="d-flex align-items-center shadow-sm"
																onClick={() => handleShowEditModal(user)}
																disabled={loading}
															>
																<FaEdit className="me-1" /> Edit
															</Button>
															<Button
																variant="outline-danger"
																size="sm"
																className="d-flex align-items-center shadow-sm"
																onClick={() => handleShowDeleteModal(user)}
																disabled={loading}
															>
																<FaTrashAlt className="me-1" /> Delete
															</Button>
														</div>
													</td>
												</tr>
											))
										) : (
											<tr>
												<td colSpan="5" className="text-center py-5 fs-5">
													{searchTerm
														? "No users match your search"
														: "No users found"}
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>

							<div className="d-flex justify-content-between align-items-center p-4">
								<div className="text-muted">
									Showing {startRange} to {endRange} of {filteredUsers.length}{" "}
									users
								</div>
								<Pagination
									currentPage={currentPage}
									totalPages={totalPages}
									onPageChange={handlePageChange}
								/>
							</div>
						</>
					)}
				</Card.Body>
			</Card>

			{/* Create User Modal */}
			<Modal show={showModal} onHide={handleCloseModal} centered>
				<Modal.Header closeButton className="border-bottom-0 bg-light">
					<Modal.Title className="text-primary">
						<FaUserPlus className="me-2" /> Create New User
					</Modal.Title>
				</Modal.Header>
				<Modal.Body className="pt-0">
					<div className="alert alert-info mb-3 d-flex align-items-start">
						<FaInfoCircle className="me-2 mt-1" />
						<span>
							Create a new staff member account. All fields are required.
						</span>
					</div>
					<Form>
						<Form.Group controlId="formFullName" className="mb-3">
							<Form.Label className="d-flex align-items-center">
								<FaUserTie className="me-2" />
								Full Name <span className="text-danger ms-1">*</span>
							</Form.Label>
							<Form.Control
								type="text"
								placeholder="Enter full name"
								name="fullName"
								value={newUser.fullName}
								onChange={handleInputChange}
								className="shadow-sm"
								autoFocus
							/>
						</Form.Group>
						<Form.Group controlId="formEmail" className="mb-3">
							<Form.Label className="d-flex align-items-center">
								<FaEnvelope className="me-2" />
								Email <span className="text-danger ms-1">*</span>
							</Form.Label>
							<Form.Control
								type="email"
								placeholder="Enter email"
								name="email"
								value={newUser.email}
								onChange={handleInputChange}
								className="shadow-sm"
							/>
						</Form.Group>
						<Form.Group controlId="formPassword" className="mb-3">
							<Form.Label className="d-flex align-items-center">
								<FaLock className="me-2" />
								Password <span className="text-danger ms-1">*</span>
							</Form.Label>
							<Form.Control
								type="password"
								placeholder="Enter password"
								name="password"
								value={newUser.password}
								onChange={handleInputChange}
								className="shadow-sm"
							/>
						</Form.Group>
						<Form.Group controlId="formRole" className="mb-3">
							<Form.Label>Staff Role</Form.Label>
							<Form.Select
								name="role"
								value={newUser.role}
								onChange={handleInputChange}
								className="shadow-sm"
							>
								<option value="receptionist">Receptionist</option>
								<option value="waiter">Waiter</option>
								<option value="chef">Chef</option>
								<option value="admin">Admin</option>
							</Form.Select>
							<Form.Text className="text-muted">
								This determines what functionality the user will have access to.
							</Form.Text>
						</Form.Group>
					</Form>
				</Modal.Body>
				<Modal.Footer className="border-top-0">
					<Button variant="light" onClick={handleCloseModal} disabled={loading}>
						Cancel
					</Button>
					<Button
						variant="primary"
						onClick={handleCreateUser}
						disabled={loading}
						className="px-4 shadow-sm"
					>
						{loading ? (
							<>
								<Spinner
									as="span"
									animation="border"
									size="sm"
									role="status"
									aria-hidden="true"
									className="me-2"
								/>
								Creating...
							</>
						) : (
							"Create User"
						)}
					</Button>
				</Modal.Footer>
			</Modal>

			{/* Edit User Modal */}
			<Modal show={showEditModal} onHide={handleCloseEditModal} centered>
				<Modal.Header closeButton className="border-bottom-0 bg-light">
					<Modal.Title className="text-info">
						<FaEdit className="me-2" /> Edit User
					</Modal.Title>
				</Modal.Header>
				<Modal.Body className="pt-0">
					<Form>
						<Form.Group controlId="editFullName" className="mb-3">
							<Form.Label className="d-flex align-items-center">
								<FaUserTie className="me-2" />
								Full Name <span className="text-danger ms-1">*</span>
							</Form.Label>
							<Form.Control
								type="text"
								placeholder="Enter full name"
								name="fullName"
								value={editUser.fullName}
								onChange={handleEditInputChange}
								className="shadow-sm"
								autoFocus
							/>
						</Form.Group>
						<Form.Group controlId="editEmail" className="mb-3">
							<Form.Label className="d-flex align-items-center">
								<FaEnvelope className="me-2" />
								Email <span className="text-danger ms-1">*</span>
							</Form.Label>
							<Form.Control
								type="email"
								placeholder="Enter email"
								name="email"
								value={editUser.email}
								onChange={handleEditInputChange}
								className="shadow-sm"
							/>
						</Form.Group>
						<Form.Group controlId="editPassword" className="mb-3">
							<Form.Label className="d-flex align-items-center">
								<FaLock className="me-2" />
								Password
							</Form.Label>
							<Form.Control
								type="password"
								placeholder="Enter new password (leave blank to keep current)"
								name="password"
								value={editUser.password}
								onChange={handleEditInputChange}
								className="shadow-sm"
							/>
							<Form.Text className="text-muted">
								Leave blank to keep the current password
							</Form.Text>
						</Form.Group>
						<Form.Group controlId="editRole" className="mb-3">
							<Form.Label>Staff Role</Form.Label>
							<Form.Select
								name="role"
								value={editUser.role}
								onChange={handleEditInputChange}
								className="shadow-sm"
							>
								<option value="receptionist">Receptionist</option>
								<option value="waiter">Waiter</option>
								<option value="chef">Chef</option>
								<option value="admin">Admin</option>
							</Form.Select>
						</Form.Group>
					</Form>
				</Modal.Body>
				<Modal.Footer className="border-top-0">
					<Button
						variant="light"
						onClick={handleCloseEditModal}
						disabled={loading}
					>
						Cancel
					</Button>
					<Button
						variant="info"
						onClick={handleEditUser}
						disabled={loading}
						className="px-4 shadow-sm"
					>
						{loading ? (
							<>
								<Spinner
									as="span"
									animation="border"
									size="sm"
									role="status"
									aria-hidden="true"
									className="me-2"
								/>
								Updating...
							</>
						) : (
							"Update User"
						)}
					</Button>
				</Modal.Footer>
			</Modal>

			{/* Delete Confirmation Modal */}
			<Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
				<Modal.Header closeButton className="border-bottom-0 bg-light">
					<Modal.Title className="text-danger">
						<FaTrashAlt className="me-2" /> Confirm Delete
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{userToDelete && (
						<div className="text-center py-3">
							<div className="display-6 text-danger mb-3">
								<FaTrashAlt />
							</div>
							<p className="mb-1">Are you sure you want to delete: </p>
							<h5 className="fw-bold">{userToDelete.fullName}</h5>
							<p className="text-muted small mt-2">
								This action cannot be undone.
							</p>
						</div>
					)}
				</Modal.Body>
				<Modal.Footer className="border-top-0">
					<Button
						variant="light"
						onClick={handleCloseDeleteModal}
						disabled={loading}
					>
						Cancel
					</Button>
					<Button
						variant="danger"
						onClick={handleDeleteUser}
						disabled={loading}
						className="px-4 shadow-sm"
					>
						{loading ? (
							<>
								<Spinner
									as="span"
									animation="border"
									size="sm"
									role="status"
									aria-hidden="true"
									className="me-2"
								/>
								Deleting...
							</>
						) : (
							"Delete User"
						)}
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
};

export default ManageUsers;
