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
	CreateNewTable,
	DeleteTable,
	GetAllTable,
	UpdateTable,
} from "../../services/apiService";
import {
	FaPlus,
	FaEdit,
	FaTrashAlt,
	FaSearch,
	FaInfoCircle,
} from "react-icons/fa";
import { BsTable } from "react-icons/bs";
import Pagination from "../../Component/Pagination/Pagination";

const ManageTables = () => {
	// States for tables data and UI
	const [tables, setTables] = useState([]);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");

	// Pagination states
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage] = useState(6); // Show 6 items per page as requested

	// States for create modal
	const [showModal, setShowModal] = useState(false);
	const [newTable, setNewTable] = useState({
		tableNumber: "",
		status: "AVAILABLE",
	});

	// States for edit modal
	const [showEditModal, setShowEditModal] = useState(false);
	const [editTable, setEditTable] = useState({
		id: "",
		tableNumber: "",
		status: "",
	});

	// States for delete modal
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [tableToDelete, setTableToDelete] = useState(null);

	// Fetch tables on component mount
	useEffect(() => {
		fetchTables();
	}, []);

	// Reset to first page when search term changes
	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm]);

	// Fetch tables from API
	const fetchTables = async () => {
		setLoading(true);
		try {
			let id_Table = "ALL";
			let response = await GetAllTable(id_Table);
			if (response && response.errCode === 0) {
				setTables(response.table);
			} else {
				toast.error("Failed to get tables data");
			}
		} catch (error) {
			console.error("Error fetching tables:", error);
			toast.error("Failed to load tables");
		} finally {
			setLoading(false);
		}
	};

	// Format status for display
	const formatStatus = (status) => {
		switch (status) {
			case "AVAILABLE":
				return "Available";
			case "occupied":
				return "Occupied";
			case "reserved":
				return "Reserved";
			case "maintenance":
				return "Maintenance";
			default:
				return status;
		}
	};

	// Get status badge variant
	const getStatusBadgeVariant = (status) => {
		switch (status) {
			case "AVAILABLE":
				return "success";
			case "occupied":
				return "danger";
			case "reserved":
				return "warning";
			case "maintenance":
				return "secondary";
			default:
				return "info";
		}
	};

	// Handle input change for create form
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setNewTable({ ...newTable, [name]: value });
	};

	// Handle input change for edit form
	const handleEditInputChange = (e) => {
		const { name, value } = e.target;
		setEditTable({ ...editTable, [name]: value });
	};

	// Modal handlers - Create
	const handleShowModal = () => setShowModal(true);
	const handleCloseModal = () => {
		setShowModal(false);
		setNewTable({ tableNumber: "", status: "AVAILABLE" });
	};

	// Modal handlers - Edit
	const handleShowEditModal = (table) => {
		setEditTable({
			id: table.id,
			tableNumber: table.tableNumber,
			status: table.status,
		});
		setShowEditModal(true);
	};
	const handleCloseEditModal = () => {
		setShowEditModal(false);
		setEditTable({ id: "", tableNumber: "", status: "" });
	};

	// Modal handlers - Delete
	const handleShowDeleteModal = (table) => {
		setTableToDelete(table);
		setShowDeleteModal(true);
	};
	const handleCloseDeleteModal = () => {
		setShowDeleteModal(false);
		setTableToDelete(null);
	};

	// Create new table
	const handleCreateTable = async () => {
		if (!newTable.tableNumber.trim()) {
			toast.error("Table number is required");
			return;
		}

		setLoading(true);
		try {
			const createdTable = {
				id: newTable.tableNumber,
				tableNumber: newTable.tableNumber,
				status: newTable.status,
			};
			let response = await CreateNewTable(createdTable);
			if (response && response.errCode === 0) {
				setTables([...tables, createdTable]);
				toast.success(response.errMessage);
				handleCloseModal();
			} else {
				toast.error(response.errMessage);
			}
		} catch (error) {
			console.error("Error creating table:", error);
			toast.error("Failed to create table");
		} finally {
			setLoading(false);
		}
	};

	// Edit table
	const handleEditTable = async () => {
		if (!editTable.tableNumber.trim()) {
			toast.error("Table number is required");
			return;
		}

		setLoading(true);
		try {
			let response = await UpdateTable(editTable);
			if (response && response.errCode === 0) {
				toast.success(response.errMessage);
				const updatedTables = tables.map((table) =>
					table.id === editTable.id ? { ...editTable } : table
				);
				setTables(updatedTables);
				handleCloseEditModal();
			} else {
				toast.error(response.errMessage);
			}
		} catch (error) {
			console.error("Error updating table:", error);
			toast.error("Failed to update table");
		} finally {
			setLoading(false);
		}
	};

	// Delete table
	const handleDeleteTable = async () => {
		if (!tableToDelete) return;

		setLoading(true);
		try {
			let response = await DeleteTable(tableToDelete);
			if (response && response.errCode === 0) {
				toast.success(response.errMessage);
				const filteredTables = tables.filter(
					(table) => table.id !== tableToDelete.id
				);
				setTables(filteredTables);
				handleCloseDeleteModal();

				// If we deleted the last item on the current page, go to the previous page
				const newTotalPages = Math.ceil(filteredTables.length / itemsPerPage);
				if (currentPage > newTotalPages && newTotalPages > 0) {
					setCurrentPage(newTotalPages);
				}
			} else {
				toast.error(response.errMessage);
			}
		} catch (error) {
			console.error("Error deleting table:", error);
			toast.error("Failed to delete table");
		} finally {
			setLoading(false);
		}
	};

	// Filter tables by search term
	const filteredTables = tables.filter((table) => {
		// Convert tableNumber to string and handle null/undefined values
		const tableNumber = String(table.tableNumber || "");
		return tableNumber.toLowerCase().includes(searchTerm.toLowerCase());
	});

	// Get current tables for pagination
	const indexOfLastTable = currentPage * itemsPerPage;
	const indexOfFirstTable = indexOfLastTable - itemsPerPage;
	const currentTables = filteredTables.slice(
		indexOfFirstTable,
		indexOfLastTable
	);

	// Calculate total pages
	const totalPages = Math.ceil(filteredTables.length / itemsPerPage);

	// Change page
	const handlePageChange = (pageNumber) => {
		setCurrentPage(pageNumber);
	};

	// Calculate displayed range
	const startRange = filteredTables.length > 0 ? indexOfFirstTable + 1 : 0;
	const endRange = Math.min(indexOfLastTable, filteredTables.length);

	return (
		<div className="container-fluid px-0">
			<Card className="shadow border-0 mb-4">
				<Card.Header className="bg-gradient-primary d-flex justify-content-between align-items-center py-3">
					<div className="d-flex align-items-center">
						<BsTable className="me-2 fs-4 text-white" />
						<h5 className="m-0 fw-bold text-white">Restaurant Tables</h5>
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
									<FaPlus className="me-2" />
									Create New Table
								</Button>
							</Col>
							<Col md={6}>
								<div className="position-relative">
									<Form.Control
										type="text"
										placeholder="Search tables..."
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
							<p className="mt-2 text-muted">Loading tables...</p>
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
											<th className="fw-semibold py-3">Table Number</th>
											<th className="fw-semibold py-3">Status</th>
											<th className="fw-semibold py-3 text-center">Actions</th>
										</tr>
									</thead>
									<tbody>
										{currentTables.length > 0 ? (
											currentTables.map((table) => (
												<tr key={table.id}>
													<td className="ps-4">
														<span className="fw-medium">{table.id}</span>
													</td>
													<td>
														<div className="d-flex align-items-center">
															<div
																className="bg-light text-primary rounded-circle d-flex align-items-center justify-content-center me-2"
																style={{ width: "45px", height: "45px" }}
															>
																<BsTable className="fs-5" />
															</div>
															<span className="fw-medium">
																Table {table.tableNumber}
															</span>
														</div>
													</td>
													<td>
														<Badge
															bg={getStatusBadgeVariant(table.status)}
															pill
															className="px-3 py-2 fs-6"
														>
															{formatStatus(table.status)}
														</Badge>
													</td>
													<td>
														<div className="d-flex justify-content-center gap-2">
															<Button
																variant="outline-info"
																size="sm"
																className="d-flex align-items-center shadow-sm"
																onClick={() => handleShowEditModal(table)}
																disabled={loading}
															>
																<FaEdit className="me-1" /> Edit
															</Button>
															<Button
																variant="outline-danger"
																size="sm"
																className="d-flex align-items-center shadow-sm"
																onClick={() => handleShowDeleteModal(table)}
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
												<td colSpan="4" className="text-center py-5 fs-5">
													{searchTerm
														? "No tables match your search"
														: "No tables found"}
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>

							<div className="d-flex justify-content-between align-items-center p-4">
								<div className="text-muted">
									Showing {startRange} to {endRange} of {filteredTables.length}{" "}
									tables
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

			{/* Create Table Modal */}
			<Modal show={showModal} onHide={handleCloseModal} centered>
				<Modal.Header closeButton className="border-bottom-0 bg-light">
					<Modal.Title className="text-primary">
						<FaPlus className="me-2" /> Create New Table
					</Modal.Title>
				</Modal.Header>
				<Modal.Body className="pt-0">
					<div className="alert alert-info mb-3 d-flex align-items-start">
						<FaInfoCircle className="me-2 mt-1" />
						<span>Create a new table for customers to sit at</span>
					</div>
					<Form>
						<Form.Group controlId="formTableNumber" className="mb-3">
							<Form.Label>
								Table Number <span className="text-danger">*</span>
							</Form.Label>
							<Form.Control
								type="text"
								placeholder="Enter table number"
								name="tableNumber"
								value={newTable.tableNumber}
								onChange={handleInputChange}
								autoFocus
								className="shadow-sm"
							/>
							<Form.Text className="text-muted">
								Enter a unique identifier for this table
							</Form.Text>
						</Form.Group>
						<Form.Group controlId="formStatus" className="mb-3">
							<Form.Label>Initial Status</Form.Label>
							<Form.Select
								name="status"
								value={newTable.status}
								onChange={handleInputChange}
								className="shadow-sm"
							>
								<option value="AVAILABLE">Available</option>
								<option value="occupied">Occupied</option>
								<option value="reserved">Reserved</option>
								<option value="maintenance">Maintenance</option>
							</Form.Select>
						</Form.Group>
					</Form>
				</Modal.Body>
				<Modal.Footer className="border-top-0">
					<Button variant="light" onClick={handleCloseModal} disabled={loading}>
						Cancel
					</Button>
					<Button
						variant="primary"
						onClick={handleCreateTable}
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
							"Create Table"
						)}
					</Button>
				</Modal.Footer>
			</Modal>

			{/* Edit Table Modal */}
			<Modal show={showEditModal} onHide={handleCloseEditModal} centered>
				<Modal.Header closeButton className="border-bottom-0 bg-light">
					<Modal.Title className="text-info">
						<FaEdit className="me-2" /> Edit Table
					</Modal.Title>
				</Modal.Header>
				<Modal.Body className="pt-0">
					<Form>
						<Form.Group controlId="editTableNumber" className="mb-3">
							<Form.Label>
								Table Number <span className="text-danger">*</span>
							</Form.Label>
							<Form.Control
								type="text"
								placeholder="Enter table number"
								name="tableNumber"
								value={editTable.tableNumber}
								onChange={handleEditInputChange}
								autoFocus
								className="shadow-sm"
							/>
						</Form.Group>
						<Form.Group controlId="editStatus" className="mb-3">
							<Form.Label>Status</Form.Label>
							<Form.Select
								name="status"
								value={editTable.status}
								onChange={handleEditInputChange}
								className="shadow-sm"
							>
								<option value="AVAILABLE">Available</option>
								<option value="occupied">Occupied</option>
								<option value="reserved">Reserved</option>
								<option value="maintenance">Maintenance</option>
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
						onClick={handleEditTable}
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
							"Update Table"
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
					{tableToDelete && (
						<div className="text-center py-3">
							<div className="display-6 text-danger mb-3">
								<FaTrashAlt />
							</div>
							<p className="mb-1">Are you sure you want to delete table: </p>
							<h5 className="fw-bold">Table {tableToDelete.tableNumber}?</h5>
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
						onClick={handleDeleteTable}
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
							"Delete Table"
						)}
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
};

export default ManageTables;
