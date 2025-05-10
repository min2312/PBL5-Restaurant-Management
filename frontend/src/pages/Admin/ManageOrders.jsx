import React, { useState, useEffect } from "react";
import { Button, Form, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import { GetAllOrder } from "../../services/apiService";

const ManageOrders = () => {
	// States for orders data and UI
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(false);

	// Pagination states
	const [currentPage, setCurrentPage] = useState(1);
	const [ordersPerPage] = useState(6);

	// Filter states
	const [filters, setFilters] = useState({
		startDate: "",
		endDate: "",
		customerId: "",
		tableId: "",
		userId: "",
		status: "",
	});

	// Fetch orders with included relations on component mount
	useEffect(() => {
		fetchOrders();
	}, []);

	// Fetch orders from API with included relations
	const fetchOrders = async () => {
		setLoading(true);
		try {
			let response = await GetAllOrder("ALL");
			if (response && response.errCode === 0) {
				setOrders(response.order);
			} else {
				toast.error("Failed to load orders");
			}
		} catch (error) {
			console.error("Error fetching orders:", error);
			toast.error("Failed to load orders");
		} finally {
			setLoading(false);
		}
	};

	// Format status for display
	const formatStatus = (status) => {
		switch (status) {
			case "PENDING":
				return "Pending";
			case "processing":
				return "Processing";
			case "Completed":
				return "Completed";
			case "cancelled":
				return "Cancelled";
			default:
				return status;
		}
	};

	// Extract unique customers, tables, and users from orders for filters
	const uniqueCustomers = [
		...new Map(
			orders.map((order) => [order.Customer.id, order.Customer])
		).values(),
	];

	const uniqueTables = [
		...new Map(orders.map((order) => [order.Table.id, order.Table])).values(),
	];

	const uniqueUsers = [
		...new Map(orders.map((order) => [order.User.id, order.User])).values(),
	];

	// Handle filter changes
	const handleFilterChange = (e) => {
		const { name, value } = e.target;
		setFilters((prevFilters) => ({
			...prevFilters,
			[name]: value,
		}));
		setCurrentPage(1); // Reset to first page when filters change
	};

	// Clear all filters
	const clearFilters = () => {
		setFilters({
			startDate: "",
			endDate: "",
			customerId: "",
			tableId: "",
			userId: "",
			status: "",
		});
		setCurrentPage(1);
	};

	// Apply filters to orders
	const filteredOrders = orders.filter((order) => {
		// Date range filter
		if (
			filters.startDate &&
			new Date(order.createdAt) < new Date(filters.startDate)
		) {
			return false;
		}
		if (
			filters.endDate &&
			new Date(order.createdAt) > new Date(`${filters.endDate}T23:59:59`)
		) {
			return false;
		}

		// Customer filter
		if (
			filters.customerId &&
			Number(filters.customerId) !== order.Customer.id
		) {
			return false;
		}

		// Table filter
		if (filters.tableId && Number(filters.tableId) !== order.Table.id) {
			return false;
		}

		// User/server filter
		if (filters.userId && Number(filters.userId) !== order.User.id) {
			return false;
		}

		// Status filter
		if (filters.status && filters.status !== order.status) {
			return false;
		}

		return true;
	});

	// Pagination logic
	const indexOfLastOrder = currentPage * ordersPerPage;
	const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
	const currentOrders = filteredOrders.slice(
		indexOfFirstOrder,
		indexOfLastOrder
	);
	const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

	// Handle page change
	const paginate = (pageNumber) => setCurrentPage(pageNumber);

	// Format date for display
	const formatDate = (dateString) => {
		const options = {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		};
		return new Date(dateString).toLocaleDateString(undefined, options);
	};

	return (
		<div className="container-fluid p-4">
			<div className="row mb-4">
				<div className="col-12">
					<div className="card shadow border-0">
						<div className="card-header bg-gradient-primary py-3">
							<h3 className="m-0 font-weight-bold text-white text-center">
								Orders Management
							</h3>
						</div>
						<div className="card-body">
							{/* Filter Section */}
							<div className="bg-light p-3 mb-4 rounded">
								<h5 className="mb-3">Filters</h5>
								<Row>
									<Col md={4} className="mb-3">
										<Form.Group>
											<Form.Label>Start Date</Form.Label>
											<Form.Control
												type="date"
												name="startDate"
												value={filters.startDate}
												onChange={handleFilterChange}
											/>
										</Form.Group>
									</Col>
									<Col md={4} className="mb-3">
										<Form.Group>
											<Form.Label>End Date</Form.Label>
											<Form.Control
												type="date"
												name="endDate"
												value={filters.endDate}
												onChange={handleFilterChange}
											/>
										</Form.Group>
									</Col>
									<Col md={4} className="mb-3">
										<Form.Group>
											<Form.Label>Status</Form.Label>
											<Form.Select
												name="status"
												value={filters.status}
												onChange={handleFilterChange}
											>
												<option value="">All Statuses</option>
												<option value="PENDING">Pending</option>
												<option value="processing">Processing</option>
												<option value="Completed">Completed</option>
												<option value="cancelled">Cancelled</option>
											</Form.Select>
										</Form.Group>
									</Col>
								</Row>
								<Row>
									<Col md={4} className="mb-3">
										<Form.Group>
											<Form.Label>Customer</Form.Label>
											<Form.Select
												name="customerId"
												value={filters.customerId}
												onChange={handleFilterChange}
											>
												<option value="">All Customers</option>
												{uniqueCustomers.map((Customer) => (
													<option key={Customer.id} value={Customer.id}>
														{Customer.name}
													</option>
												))}
											</Form.Select>
										</Form.Group>
									</Col>
									<Col md={4} className="mb-3">
										<Form.Group>
											<Form.Label>Table</Form.Label>
											<Form.Select
												name="tableId"
												value={filters.tableId}
												onChange={handleFilterChange}
											>
												<option value="">All Tables</option>
												{uniqueTables.map((Table) => (
													<option key={Table.id} value={Table.id}>
														{Table.tableNumber}
													</option>
												))}
											</Form.Select>
										</Form.Group>
									</Col>
									<Col md={4} className="mb-3">
										<Form.Group>
											<Form.Label>Server</Form.Label>
											<Form.Select
												name="userId"
												value={filters.userId}
												onChange={handleFilterChange}
											>
												<option value="">All Servers</option>
												{uniqueUsers.map((User) => (
													<option key={User.id} value={User.id}>
														{User.fullName}
													</option>
												))}
											</Form.Select>
										</Form.Group>
									</Col>
								</Row>
								<Row>
									<Col className="d-flex justify-content-end">
										<Button variant="secondary" onClick={clearFilters}>
											Clear Filters
										</Button>
									</Col>
								</Row>
							</div>

							{loading ? (
								<div className="text-center my-4">
									<div className="spinner-border text-primary" role="status">
										<span className="visually-hidden">Loading...</span>
									</div>
								</div>
							) : (
								<>
									<div className="table-responsive">
										<table className="table table-striped table-hover bg-white">
											<thead className="bg-primary text-white">
												<tr>
													<th>Order ID</th>
													<th>Date & Time</th>
													<th>Customer</th>
													<th>Table</th>
													<th>Server</th>
													<th>Status</th>
												</tr>
											</thead>
											<tbody>
												{currentOrders.length > 0 ? (
													currentOrders.map((order) => (
														<tr key={order.id}>
															<td>{order.id}</td>
															<td>{formatDate(order.createdAt)}</td>
															<td>{order.Customer.name}</td>
															<td>{order.Table.tableNumber}</td>
															<td>{order.User.fullName}</td>
															<td>
																<span
																	className={`badge ${
																		order.status === "PENDING"
																			? "bg-warning text-dark"
																			: order.status === "processing"
																			? "bg-info text-dark"
																			: order.status === "Completed"
																			? "bg-success"
																			: "bg-danger"
																	}`}
																	style={{
																		fontSize: "0.85rem",
																		padding: "0.35em 0.65em",
																	}}
																>
																	{formatStatus(order.status)}
																</span>
															</td>
														</tr>
													))
												) : (
													<tr>
														<td colSpan="6" className="text-center">
															No orders found
														</td>
													</tr>
												)}
											</tbody>
										</table>
									</div>

									{/* Pagination */}
									{filteredOrders.length > 0 && (
										<div className="d-flex justify-content-center mt-4">
											<nav>
												<ul className="pagination">
													<li
														className={`page-item ${
															currentPage === 1 ? "disabled" : ""
														}`}
													>
														<button
															className="page-link"
															onClick={() => paginate(currentPage - 1)}
															disabled={currentPage === 1}
														>
															Previous
														</button>
													</li>
													{[...Array(totalPages).keys()].map((number) => (
														<li
															key={number + 1}
															className={`page-item ${
																currentPage === number + 1 ? "active" : ""
															}`}
														>
															<button
																className="page-link"
																onClick={() => paginate(number + 1)}
															>
																{number + 1}
															</button>
														</li>
													))}
													<li
														className={`page-item ${
															currentPage === totalPages ? "disabled" : ""
														}`}
													>
														<button
															className="page-link"
															onClick={() => paginate(currentPage + 1)}
															disabled={currentPage === totalPages}
														>
															Next
														</button>
													</li>
												</ul>
											</nav>
										</div>
									)}

									<div className="text-muted mt-2 text-center">
										Showing {indexOfFirstOrder + 1} to{" "}
										{Math.min(indexOfLastOrder, filteredOrders.length)} of{" "}
										{filteredOrders.length} orders
									</div>
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ManageOrders;
