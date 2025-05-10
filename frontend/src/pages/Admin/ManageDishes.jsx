import React, { useState, useEffect } from "react";
import {
	Container,
	Row,
	Col,
	Table,
	Button,
	Modal,
	Form,
	InputGroup,
	Badge,
	Spinner,
	Dropdown,
	Card,
} from "react-bootstrap";
import {
	FaPlus,
	FaEdit,
	FaTrash,
	FaSearch,
	FaFilter,
	FaExclamationTriangle,
} from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import {
	CreateNewDish,
	DeleteDish,
	GetAllCategory,
	GetAllDish,
	UpdateDish,
} from "../../services/apiService";
import Pagination from "../../Component/Pagination/Pagination";

const ManageDishes = () => {
	const [dishes, setDishes] = useState([]);
	const [loading, setLoading] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [currentDish, setCurrentDish] = useState({});
	const [isEditing, setIsEditing] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [filteredDishes, setFilteredDishes] = useState([]);
	const [categories, setCategories] = useState([]);
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [imagePreview, setImagePreview] = useState(null);
	const [formData, setFormData] = useState({
		name: "",
		price: "",
		Category: "",
		image: null,
	});
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [dishToDelete, setDishToDelete] = useState(null);

	// Pagination states
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage] = useState(6); // Same as ManageInvoices

	useEffect(() => {
		fetchDishes();
		fetchCategories();
	}, []);

	// Reset to first page when search term or category filter changes
	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, selectedCategory]);

	// Filter dishes based on search term and selected category
	useEffect(() => {
		let filtered = [...dishes];

		// Filter by category if not "All"
		if (selectedCategory !== "All") {
			filtered = filtered.filter((dish) => dish.Category === selectedCategory);
		}

		// Then filter by search term
		if (searchTerm) {
			filtered = filtered.filter(
				(dish) =>
					dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					dish.Category.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		setFilteredDishes(filtered);
	}, [searchTerm, dishes, selectedCategory]);

	const fetchCategories = async () => {
		try {
			let response = await GetAllCategory();
			if (response && response.errCode === 0) {
				// Extract just the category names from the response
				const categoryNames = response.categories.map((cat) => cat.Category);
				setCategories(categoryNames);
			} else {
				toast.error("Failed to fetch categories");
				// Fallback categories
				setCategories([
					"Lẩu",
					"Món ăn nhẹ",
					"Món ăn về cơm",
					"Món canh",
					"Món chính",
					"Món khai vị",
					"Món Rau, củ, quả",
					"Món tráng miệng",
					"Đồ uống",
				]);
			}
		} catch (error) {
			console.error("Error fetching categories:", error);
			// Fallback categories
			setCategories([
				"Lẩu",
				"Món ăn nhẹ",
				"Món ăn về cơm",
				"Món canh",
				"Món chính",
				"Món khai vị",
				"Món Rau, củ, quả",
				"Món tráng miệng",
				"Đồ uống",
			]);
		}
	};

	// Format price to VND
	const formatPrice = (price) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(price);
	};

	const fetchDishes = async () => {
		setLoading(true);
		try {
			let dishID = "ALL";
			let response = await GetAllDish(dishID);
			if (response && response.errCode === 0) {
				setDishes(response.dish);
				setFilteredDishes(response.dish);
			} else {
				toast.error("Failed to fetch dishes");
			}
		} catch (error) {
			toast.error("Failed to fetch dishes");
			console.error("Error fetching dishes:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleModalClose = () => {
		setShowModal(false);
		setCurrentDish({});
		setIsEditing(false);
		setImagePreview(null);
		setFormData({
			name: "",
			price: "",
			Category: "",
			image: null,
		});
	};

	const handleModalShow = (dish = null) => {
		if (dish) {
			setCurrentDish(dish);
			setFormData({
				name: dish.name,
				price: dish.price,
				Category: dish.Category,
				image: null,
			});
			setImagePreview(dish.pic_link);
			setIsEditing(true);
		} else {
			setIsEditing(false);
			setFormData({
				name: "",
				price: "",
				Category: categories.length > 0 ? categories[0] : "",
				image: null,
			});
		}
		setShowModal(true);
	};

	const handleInputChange = (e) => {
		const { name, value, files } = e.target;
		if (name === "image" && files && files[0]) {
			setFormData({
				...formData,
				image: files[0],
			});
			setImagePreview(URL.createObjectURL(files[0]));
		} else {
			setFormData({
				...formData,
				[name]: value,
			});
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		const dishData = new FormData();
		dishData.append("name", formData.name);
		dishData.append("price", formData.price);
		dishData.append("category", formData.Category);

		if (formData.image) {
			dishData.append("image", formData.image);
		}

		if (isEditing) {
			dishData.append("id", currentDish.id);
		}

		try {
			if (isEditing) {
				let responseEdit = await UpdateDish(dishData);
				if (responseEdit && responseEdit.errCode === 0) {
					toast.success("Dish updated successfully");

					// Update the state locally
					const updatedDish = {
						...currentDish,
						name: formData.name,
						price: formData.price,
						Category: formData.Category,
						pic_link: formData.image
							? URL.createObjectURL(formData.image)
							: currentDish.pic_link,
					};

					const updatedDishes = dishes.map((dish) =>
						dish.id === currentDish.id ? updatedDish : dish
					);

					setDishes(updatedDishes);
					setFilteredDishes(updatedDishes);
				} else {
					toast.error("Failed to update dish");
				}
			} else {
				let response = await CreateNewDish(dishData);
				if (response && response.errCode === 0) {
					console.log("response", response);
					toast.success("Dish added successfully");

					// Add new dish to the state
					const newDish = {
						id: response.dish.id,
						name: formData.name,
						price: formData.price,
						Category: formData.Category,
						pic_link: formData.image
							? URL.createObjectURL(formData.image)
							: null,
					};

					const updatedDishes = [newDish, ...dishes];
					setDishes(updatedDishes);
					setFilteredDishes(updatedDishes);
				} else {
					toast.error("Failed to add dish");
				}
			}

			handleModalClose();
		} catch (error) {
			toast.error(isEditing ? "Failed to update dish" : "Failed to add dish");
			console.error("Error:", error);
		} finally {
			setLoading(false);
		}
	};

	const showDeleteConfirmation = (dish) => {
		setDishToDelete(dish);
		setShowDeleteModal(true);
	};

	const closeDeleteModal = () => {
		setShowDeleteModal(false);
		setDishToDelete(null);
	};

	const handleDelete = async () => {
		if (!dishToDelete) return;

		setLoading(true);
		try {
			let idDelete = dishToDelete.id;
			const response = await DeleteDish(idDelete);
			if (response && response.errCode === 0) {
				toast.success("Dish deleted successfully");
				const updatedDishes = dishes.filter(
					(dish) => dish.id !== dishToDelete.id
				);
				setDishes(updatedDishes);
				setFilteredDishes(updatedDishes);
			} else {
				toast.error("Failed to delete dish");
			}
			closeDeleteModal();
		} catch (error) {
			toast.error("Failed to delete dish");
			console.error("Error deleting dish:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleCategoryFilter = (category) => {
		setSelectedCategory(category);
	};

	// Pagination logic
	const indexOfLastDish = currentPage * itemsPerPage;
	const indexOfFirstDish = indexOfLastDish - itemsPerPage;
	const currentDishes = filteredDishes.slice(indexOfFirstDish, indexOfLastDish);

	// Calculate total pages
	const totalPages = Math.ceil(filteredDishes.length / itemsPerPage);

	// Change page
	const handlePageChange = (pageNumber) => {
		setCurrentPage(pageNumber);
	};

	// Calculate displayed range
	const startRange = filteredDishes.length > 0 ? indexOfFirstDish + 1 : 0;
	const endRange = Math.min(indexOfLastDish, filteredDishes.length);

	return (
		<Container fluid className="p-4">
			<Card className="shadow border-0 mb-4">
				<Card.Header className="bg-gradient-primary d-flex justify-content-between align-items-center py-3">
					<div className="d-flex align-items-center">
						<h3 className="m-0 text-white">Dish Management</h3>
					</div>
					<Button variant="light" onClick={() => handleModalShow()}>
						<FaPlus className="me-2" /> Add New Dish
					</Button>
				</Card.Header>

				<Card.Body>
					<Row className="mb-4">
						<Col md={6}>
							<InputGroup>
								<InputGroup.Text>
									<FaSearch />
								</InputGroup.Text>
								<Form.Control
									type="text"
									placeholder="Search dishes by name or category..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</InputGroup>
						</Col>
						<Col md={6}>
							<InputGroup>
								<InputGroup.Text>
									<FaFilter />
								</InputGroup.Text>
								<Form.Select
									value={selectedCategory}
									onChange={(e) => handleCategoryFilter(e.target.value)}
								>
									<option value="All">All Categories</option>
									{categories.map((category, index) => (
										<option key={index} value={category}>
											{category}
										</option>
									))}
								</Form.Select>
							</InputGroup>
						</Col>
					</Row>

					{loading ? (
						<div className="text-center py-5">
							<Spinner animation="border" role="status">
								<span className="visually-hidden">Loading...</span>
							</Spinner>
							<p className="mt-2 text-muted">Loading dishes...</p>
						</div>
					) : filteredDishes.length === 0 ? (
						<div className="text-center py-5">
							<p>No dishes found. Create a new dish to get started!</p>
						</div>
					) : (
						<>
							<div className="table-responsive">
								<Table hover className="align-middle mb-0">
									<thead className="bg-light">
										<tr>
											<th>#</th>
											<th>Image</th>
											<th>Name</th>
											<th>Price</th>
											<th>Category</th>
											<th>Actions</th>
										</tr>
									</thead>
									<tbody>
										{currentDishes.map((dish, index) => (
											<tr key={dish.id}>
												<td>{indexOfFirstDish + index + 1}</td>
												<td>
													<img
														src={dish.pic_link || "/default-dish.png"}
														alt={dish.name}
														style={{
															width: "50px",
															height: "50px",
															objectFit: "cover",
															borderRadius: "4px",
														}}
													/>
												</td>
												<td>{dish.name}</td>
												<td>{formatPrice(dish.price)}</td>
												<td>
													<Badge bg="info" pill>
														{dish.Category}
													</Badge>
												</td>
												<td>
													<Button
														variant="outline-primary"
														size="sm"
														className="me-2"
														onClick={() => handleModalShow(dish)}
													>
														<FaEdit />
													</Button>
													<Button
														variant="outline-danger"
														size="sm"
														onClick={() => showDeleteConfirmation(dish)}
													>
														<FaTrash />
													</Button>
												</td>
											</tr>
										))}
									</tbody>
								</Table>
							</div>

							{/* Pagination */}
							<div className="d-flex justify-content-between align-items-center p-3">
								<div className="text-muted">
									Showing {startRange} to {endRange} of {filteredDishes.length}{" "}
									dishes
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

			{/* Add/Edit Dish Modal */}
			<Modal show={showModal} onHide={handleModalClose} backdrop="static">
				<Modal.Header closeButton>
					<Modal.Title>{isEditing ? "Edit Dish" : "Add New Dish"}</Modal.Title>
				</Modal.Header>
				<Form onSubmit={handleSubmit}>
					<Modal.Body>
						<Form.Group className="mb-3">
							<Form.Label>Dish Name</Form.Label>
							<Form.Control
								type="text"
								name="name"
								value={formData.name}
								onChange={handleInputChange}
								required
								placeholder="Enter dish name"
							/>
						</Form.Group>

						<Form.Group className="mb-3">
							<Form.Label>Price (VND)</Form.Label>
							<InputGroup>
								<Form.Control
									type="number"
									min="0"
									name="price"
									value={formData.price}
									onChange={handleInputChange}
									required
									placeholder="0"
								/>
								<InputGroup.Text>VNĐ</InputGroup.Text>
							</InputGroup>
						</Form.Group>

						<Form.Group className="mb-3">
							<Form.Label>Category</Form.Label>
							<Form.Select
								name="Category"
								value={formData.Category}
								onChange={handleInputChange}
								required
							>
								<option value="">Select a category</option>
								{categories.map((category, index) => (
									<option key={index} value={category}>
										{category}
									</option>
								))}
							</Form.Select>
						</Form.Group>

						<Form.Group className="mb-3">
							<Form.Label>Dish Image</Form.Label>
							<Form.Control
								type="file"
								name="image"
								onChange={handleInputChange}
								accept="image/*"
							/>
							<Form.Text className="text-muted">
								{isEditing
									? "Upload a new image to replace the current one"
									: "Upload an image of the dish"}
							</Form.Text>
						</Form.Group>

						{imagePreview && (
							<div className="text-center mb-3">
								<p>Preview:</p>
								<img
									src={imagePreview}
									alt="Dish Preview"
									style={{
										maxWidth: "100%",
										maxHeight: "200px",
										objectFit: "contain",
									}}
								/>
							</div>
						)}
					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={handleModalClose}>
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
									Loading...
								</>
							) : isEditing ? (
								"Update Dish"
							) : (
								"Add Dish"
							)}
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>

			{/* Delete Confirmation Modal */}
			<Modal
				show={showDeleteModal}
				onHide={closeDeleteModal}
				centered
				size="sm"
				className="delete-confirmation-modal"
			>
				<Modal.Header closeButton className="bg-danger text-white">
					<Modal.Title className="d-flex align-items-center">
						<FaExclamationTriangle className="me-2" />
						Delete Dish
					</Modal.Title>
				</Modal.Header>
				<Modal.Body className="text-center py-4">
					{dishToDelete && (
						<>
							<p className="mb-3">Are you sure you want to delete this dish?</p>
							<h5 className="mb-4">"{dishToDelete.name}"</h5>
							<div className="text-muted mb-3">
								This action cannot be undone.
							</div>
						</>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={closeDeleteModal}>
						Cancel
					</Button>
					<Button variant="danger" onClick={handleDelete} disabled={loading}>
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
							"Delete"
						)}
					</Button>
				</Modal.Footer>
			</Modal>
		</Container>
	);
};

export default ManageDishes;
