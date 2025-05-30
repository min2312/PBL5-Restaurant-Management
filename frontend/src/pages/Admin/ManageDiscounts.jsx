import React, { useState, useEffect } from "react";
import {
	Button,
	Card,
	Form,
	Table,
	Modal,
	Row,
	Col,
	Spinner,
} from "react-bootstrap";
import { toast } from "react-toastify";
import {
	FaPercentage,
	FaPlus,
	FaEdit,
	FaTrash,
	FaSearch,
} from "react-icons/fa";
import {
	CreateDiscount,
	GetAllDiscounts,
	UpdateDiscounts,
	DeleteDiscount,
} from "../../services/apiService";

const ManageDiscounts = () => {
	const [discounts, setDiscounts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleteId, setDeleteId] = useState(null);
	const [currentDiscount, setCurrentDiscount] = useState({
		id: null,
		discount_percentage: 0,
		type: "Decrease", // Default type is Decrease
	});
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		fetchDiscounts();
	}, []);

	const fetchDiscounts = async () => {
		setLoading(true);
		try {
			const response = await GetAllDiscounts();
			if (response && response.errCode === 0) {
				setDiscounts(response.discount || []);
			} else {
				toast.error("Failed to load discounts");
			}
		} catch (error) {
			console.error("Error fetching discounts:", error);
			toast.error("Error loading discounts");
		} finally {
			setLoading(false);
		}
	};

	const handleOpenModal = (discount = null) => {
		if (discount) {
			// Edit mode
			setCurrentDiscount({
				id: discount.id,
				discount_percentage: discount.discount_percentage,
				type: discount.type || "Decrease",
			});
		} else {
			// Create mode
			setCurrentDiscount({
				id: null,
				discount_percentage: 0,
				type: "Decrease",
			});
		}
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setShowModal(false);
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setCurrentDiscount({
			...currentDiscount,
			[name]: value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Validate form
		if (
			currentDiscount.discount_percentage <= 0 ||
			currentDiscount.discount_percentage > 100
		) {
			toast.error("Please enter a valid discount percentage (1-100)");
			return;
		}

		try {
			setLoading(true);
			let response;

			if (currentDiscount.id) {
				// Update existing discount
				response = await UpdateDiscounts(currentDiscount);
				if (response && response.errCode === 0) {
					setDiscounts((prevDiscounts) =>
						prevDiscounts.map((discount) =>
							discount.id === currentDiscount.id
								? {
										...discount,
										discount_percentage: currentDiscount.discount_percentage,
										type: currentDiscount.type,
								  }
								: discount
						)
					);
				}
			} else {
				// Create new discount
				response = await CreateDiscount(currentDiscount);
				if (response && response.errCode === 0) {
					setDiscounts((prevDiscounts) => [
						...prevDiscounts,
						response.discount,
					]);
				}
			}

			if (response && response.errCode === 0) {
				toast.success(
					currentDiscount.id
						? "Discount updated successfully"
						: "Discount created successfully"
				);
				setShowModal(false);
			} else {
				toast.error(response?.errMessage || "Failed to save discount");
			}
		} catch (error) {
			console.error("Error saving discount:", error);
			toast.error("Error saving discount");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id) => {
		try {
			setLoading(true);
			const response = await DeleteDiscount(id);

			if (response && response.errCode === 0) {
				setDiscounts((prevDiscounts) =>
					prevDiscounts.filter((discount) => discount.id !== id)
				);
				toast.success("Discount deleted successfully");
			} else {
				toast.error(response?.errMessage || "Failed to delete discount");
			}
		} catch (error) {
			console.error("Error deleting discount:", error);
			toast.error("Error deleting discount");
		} finally {
			setLoading(false);
			setShowDeleteModal(false);
		}
	};

	const confirmDelete = (id) => {
		setDeleteId(id);
		setShowDeleteModal(true);
	};

	const filteredDiscounts = discounts.filter((discount) => {
		return (
			discount.discount_percentage?.toString().includes(searchTerm) ||
			(discount.type &&
				discount.type.toLowerCase().includes(searchTerm.toLowerCase()))
		);
	});

	return (
		<div className="container-fluid px-0">
			<Card className="shadow border-0 mb-4">
				<Card.Header className="bg-gradient-primary d-flex justify-content-between align-items-center py-3">
					<div className="d-flex align-items-center">
						<FaPercentage className="me-2 fs-4 text-white" />
						<h5 className="m-0 fw-bold text-white">Discount Management</h5>
					</div>
					<Button
						variant="light"
						size="sm"
						className="d-flex align-items-center shadow-sm"
						onClick={() => handleOpenModal()}
					>
						<FaPlus className="me-1" /> Add New Discount
					</Button>
				</Card.Header>
				<Card.Body>
					<Row className="mb-4">
						<Col lg={6}>
							<div className="position-relative">
								<Form.Control
									type="text"
									placeholder="Search discounts..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="ps-5 shadow-sm"
								/>
								<FaSearch
									className="position-absolute text-muted"
									style={{
										left: "15px",
										top: "50%",
										transform: "translateY(-50%)",
									}}
								/>
							</div>
						</Col>
					</Row>

					{loading && !showModal ? (
						<div className="text-center py-5">
							<Spinner animation="border" variant="primary" />
							<p className="mt-2 text-muted">Loading discounts...</p>
						</div>
					) : (
						<div className="table-responsive">
							<Table hover className="align-middle">
								<thead className="bg-light">
									<tr>
										<th>ID</th>
										<th>Type</th>
										<th>Discount Percentage</th>
										<th className="text-end">Actions</th>
									</tr>
								</thead>
								<tbody>
									{filteredDiscounts.length > 0 ? (
										filteredDiscounts.map((discount) => (
											<tr key={discount.id}>
												<td>{discount.id}</td>
												<td>
													<span
														className={`badge ${
															discount.type === "Increase"
																? "bg-success"
																: "bg-danger"
														}`}
													>
														{discount.type || "Decrease"}
													</span>
												</td>
												<td>
													<span className="fw-bold text-primary">
														{discount.type === "Increase" ? "+" : "-"}
														{discount.discount_percentage}%
													</span>
												</td>
												<td>
													<div className="d-flex justify-content-end gap-2">
														<Button
															variant="outline-primary"
															size="sm"
															onClick={() => handleOpenModal(discount)}
														>
															<FaEdit />
														</Button>
														<Button
															variant="outline-danger"
															size="sm"
															onClick={() => confirmDelete(discount.id)}
														>
															<FaTrash />
														</Button>
													</div>
												</td>
											</tr>
										))
									) : (
										<tr>
											<td colSpan="4" className="text-center py-4">
												{searchTerm
													? "No discounts match your search"
													: "No discounts found"}
											</td>
										</tr>
									)}
								</tbody>
							</Table>
						</div>
					)}
				</Card.Body>
			</Card>

			{/* Discount Form Modal */}
			<Modal show={showModal} onHide={handleCloseModal} centered>
				<Modal.Header closeButton className="bg-light">
					<Modal.Title>
						{currentDiscount.id ? "Edit Discount" : "Create New Discount"}
					</Modal.Title>
				</Modal.Header>
				<Form onSubmit={handleSubmit}>
					<Modal.Body>
						<Form.Group className="mb-3">
							<Form.Label>
								Discount Type <span className="text-danger">*</span>
							</Form.Label>
							<Form.Select
								name="type"
								value={currentDiscount.type}
								onChange={handleInputChange}
								required
							>
								<option value="Increase">Increase</option>
								<option value="Decrease">Decrease</option>
							</Form.Select>
							<Form.Text className="text-muted">
								Increase will add to the price, Decrease will subtract from the
								price
							</Form.Text>
						</Form.Group>

						<Form.Group className="mb-3">
							<Form.Label>
								Discount Percentage <span className="text-danger">*</span>
							</Form.Label>
							<Form.Control
								type="number"
								name="discount_percentage"
								min="1"
								max="100"
								value={currentDiscount.discount_percentage}
								onChange={handleInputChange}
								required
							/>
							<Form.Text className="text-muted">
								Discount percentage (1-100)
							</Form.Text>
						</Form.Group>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={handleCloseModal}>
							Cancel
						</Button>
						<Button variant="primary" type="submit" disabled={loading}>
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
									Saving...
								</>
							) : (
								"Save Discount"
							)}
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>

			{/* Delete Confirmation Modal */}
			<Modal
				show={showDeleteModal}
				onHide={() => setShowDeleteModal(false)}
				centered
			>
				<Modal.Header closeButton className="bg-light">
					<Modal.Title>Confirm Deletion</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="text-center mb-3">
						<FaTrash className="text-danger" size={48} />
					</div>
					<p className="text-center mb-0">
						Are you sure you want to delete this discount? This action cannot be
						undone.
					</p>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
						Cancel
					</Button>
					<Button
						variant="danger"
						onClick={() => handleDelete(deleteId)}
						disabled={loading}
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
							"Delete Discount"
						)}
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
};

export default ManageDiscounts;
