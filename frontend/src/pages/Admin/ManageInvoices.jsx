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
	InputGroup,
} from "react-bootstrap";
import { toast } from "react-toastify";
import {
	GetAllInvoice,
	GetAllOrder,
	GetAllOrderDetail,
} from "../../services/apiService";
import {
	FaFileInvoiceDollar,
	FaSearch,
	FaFilter,
	FaEye,
	FaPrint,
	FaInfoCircle,
	FaMoneyBillWave,
	FaCreditCard,
	FaUtensils,
	FaUserFriends,
	FaCalendarAlt,
} from "react-icons/fa";
import Pagination from "../../Component/Pagination/Pagination";

const ManageInvoices = () => {
	// States for invoices data and UI
	const [invoices, setInvoices] = useState([]);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");

	// Pagination states
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage] = useState(6); // Show 6 items per page as requested

	// States for orders (for reference)
	const [orders, setOrders] = useState([]);

	// Date filter states
	const [filterType, setFilterType] = useState("all"); // "all", "day", "month", "year"
	const [filterDate, setFilterDate] = useState(new Date());

	// States for order details modal
	const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
	const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
	const [orderItemsLoading, setOrderItemsLoading] = useState(false);

	// Fetch invoices and reference data on component mount
	useEffect(() => {
		fetchInvoices();
		fetchOrders();
	}, []);

	// Reset to first page when search term or filter changes
	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, filterType, filterDate]);

	// Fetch invoices from API
	const fetchInvoices = async () => {
		setLoading(true);
		try {
			const response = await GetAllInvoice("ALL");
			if (response && response.errCode === 0) {
				// Ensure we're setting an array to the state
				const invoicesData = response.invoice || [];
				setInvoices(invoicesData);
			} else {
				toast.error("Failed to load invoices");
				// Set empty array when API call fails
				setInvoices([]);
			}
		} catch (error) {
			console.error("Error fetching invoices:", error);
			// Set empty array on error
			setInvoices([]);
		} finally {
			setLoading(false);
		}
	};

	// Fetch orders for dropdown
	const fetchOrders = async () => {
		try {
			// For actual API implementation:
			const response = await GetAllOrder("ALL");
			if (response && response.errCode === 0) {
				setOrders(response.order);
			} else {
				toast.error("Failed to load orders");
			}
		} catch (error) {
			console.error("Error fetching orders:", error);
		}
	};

	// Format currency
	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(amount);
	};

	// Format date for display
	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(date);
	};

	// Get order details by ID
	const getOrderDetails = (orderId) => {
		const order = orders.find((o) => o.id === orderId);
		if (!order) return `Order #${orderId}`;

		// Get customer name if available
		const customerName = order.Customer
			? order.Customer.name
			: "Unknown Customer";

		return `#${order.id} - ${customerName} `;
	};

	// Format payment method for display
	const formatPaymentMethod = (method) => {
		switch (method) {
			case "cash":
				return "Cash";
			case "bank transfer":
				return "Bank Transfer";
			default:
				return method;
		}
	};

	// Handle filter change
	const handleFilterTypeChange = (e) => {
		setFilterType(e.target.value);
	};

	// Handle filter date change
	const handleFilterDateChange = (e) => {
		setFilterDate(new Date(e.target.value));
	};

	// Handle search term change
	const handleSearchTermChange = (e) => {
		setSearchTerm(e.target.value);
	};

	// New function to view order details
	const handleViewOrderDetails = async (invoice) => {
		setOrderItemsLoading(true);
		try {
			// Find the order in the orders array
			const order = orders.find((order) => order.id === invoice.orderId);
			if (order) {
				// Fetch order details specifically for this order
				const orderDetailsResponse = await GetAllOrderDetail(order.id);

				if (
					orderDetailsResponse &&
					orderDetailsResponse.errCode === 0 &&
					orderDetailsResponse.orderDetail &&
					Array.isArray(orderDetailsResponse.orderDetail)
				) {
					// Calculate order subtotal before discount
					let subtotal = 0;
					orderDetailsResponse.orderDetail.forEach((item) => {
						const dish = item.Dish || {};
						const price = dish.price || 0;
						subtotal += price * item.quantity;
					});

					// Calculate discount amount (subtotal - final amount)
					const discountAmount = subtotal - invoice.totalAmount;

					setSelectedOrderDetails({
						orderId: invoice.orderId,
						items: orderDetailsResponse.orderDetail,
						tableName: `Table ${order.tableId}`,
						customerName: order.Customer ? order.Customer.name : "Guest",
						invoice: invoice,
						subtotal: subtotal,
						discountAmount: discountAmount > 0 ? discountAmount : 0,
					});
				} else {
					// If no items found, set empty array
					setSelectedOrderDetails({
						orderId: invoice.orderId,
						items: [],
						tableName: `Table ${order.tableId}`,
						customerName: order.Customer ? order.Customer.name : "Guest",
						invoice: invoice,
						subtotal: 0,
						discountAmount: 0,
					});
					toast.info("No items found for this order");
				}
			} else {
				toast.error("Order details not found");
				setSelectedOrderDetails(null);
			}
		} catch (error) {
			console.error("Error fetching order details:", error);
			toast.error("Failed to load order details");
		} finally {
			setOrderItemsLoading(false);
			setShowOrderDetailsModal(true);
		}
	};

	// Function to close order details modal
	const handleCloseOrderDetailsModal = () => {
		setShowOrderDetailsModal(false);
		setSelectedOrderDetails(null);
	};

	// Function to handle print receipt
	const handlePrintReceipt = () => {
		if (!selectedOrderDetails) return;

		// Here we would typically open a new window and print the receipt
		toast.info("Print functionality would be implemented here");
	};

	// Filter invoices based on search term and date filter
	const filterInvoices = () => {
		if (!invoices || !Array.isArray(invoices)) return [];

		let filtered = invoices.filter((invoice) => invoice.paymentMethod); // Filter out null payment methods

		// Apply date filter
		if (filterType !== "all") {
			const dateToFilter = new Date(filterDate);

			filtered = filtered.filter((invoice) => {
				if (!invoice.updatedAt) return false;

				const invoiceDate = new Date(invoice.updatedAt);
				switch (filterType) {
					case "day":
						return (
							invoiceDate.getDate() === dateToFilter.getDate() &&
							invoiceDate.getMonth() === dateToFilter.getMonth() &&
							invoiceDate.getFullYear() === dateToFilter.getFullYear()
						);
					case "month":
						return (
							invoiceDate.getMonth() === dateToFilter.getMonth() &&
							invoiceDate.getFullYear() === dateToFilter.getFullYear()
						);
					case "year":
						return invoiceDate.getFullYear() === dateToFilter.getFullYear();
					default:
						return true;
				}
			});
		}

		// Apply search term
		if (searchTerm.trim()) {
			filtered = filtered.filter((invoice) => {
				const orderInfo = getOrderDetails(invoice.orderId).toLowerCase();
				const invoiceId = `#${invoice.id}`.toLowerCase();
				const paymentMethodText = formatPaymentMethod(
					invoice.paymentMethod
				).toLowerCase();
				const searchLower = searchTerm.toLowerCase();

				return (
					orderInfo.includes(searchLower) ||
					invoiceId.includes(searchLower) ||
					paymentMethodText.includes(searchLower)
				);
			});
		}

		return filtered;
	};

	// Get filtered invoices
	const filteredInvoices = filterInvoices();

	// Get current invoices for pagination
	const indexOfLastInvoice = currentPage * itemsPerPage;
	const indexOfFirstInvoice = indexOfLastInvoice - itemsPerPage;
	const currentInvoices = filteredInvoices.slice(
		indexOfFirstInvoice,
		indexOfLastInvoice
	);

	// Calculate total pages
	const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

	// Change page
	const handlePageChange = (pageNumber) => {
		setCurrentPage(pageNumber);
	};

	// Calculate displayed range
	const startRange = filteredInvoices.length > 0 ? indexOfFirstInvoice + 1 : 0;
	const endRange = Math.min(indexOfLastInvoice, filteredInvoices.length);

	return (
		<div className="container-fluid px-0">
			<Card className="shadow border-0 mb-4">
				<Card.Header className="bg-gradient-primary d-flex justify-content-between align-items-center py-3">
					<div className="d-flex align-items-center">
						<FaFileInvoiceDollar className="me-2 fs-4 text-white" />
						<h5 className="m-0 fw-bold text-white">Invoice History</h5>
					</div>
				</Card.Header>
				<Card.Body className="p-0">
					<div className="p-4">
						<Row className="mb-4 g-3">
							<Col lg={5} md={12}>
								<div className="position-relative">
									<Form.Control
										type="text"
										placeholder="Search by order ID, customer, or payment method..."
										value={searchTerm}
										onChange={handleSearchTermChange}
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
							<Col lg={3} md={6}>
								<InputGroup className="shadow-sm">
									<InputGroup.Text className="bg-light border-0">
										<FaFilter className="text-muted" />
									</InputGroup.Text>
									<Form.Select
										value={filterType}
										onChange={handleFilterTypeChange}
										className="border-start-0"
										style={{ height: "auto", padding: "0.65rem 0.75rem" }}
									>
										<option value="all">All Time</option>
										<option value="day">By Day</option>
										<option value="month">By Month</option>
										<option value="year">By Year</option>
									</Form.Select>
								</InputGroup>
							</Col>
							<Col lg={4} md={6}>
								{filterType !== "all" && (
									<InputGroup className="shadow-sm">
										<InputGroup.Text className="bg-light border-0">
											<FaCalendarAlt className="text-muted" />
										</InputGroup.Text>
										<Form.Control
											type={
												filterType === "day"
													? "date"
													: filterType === "month"
													? "month"
													: "number"
											}
											min={filterType === "year" ? "2000" : undefined}
											max={
												filterType === "year"
													? new Date().getFullYear()
													: undefined
											}
											onChange={handleFilterDateChange}
											value={
												filterType === "day"
													? filterDate.toISOString().split("T")[0]
													: filterType === "month"
													? `${filterDate.getFullYear()}-${String(
															filterDate.getMonth() + 1
													  ).padStart(2, "0")}`
													: filterDate.getFullYear()
											}
											className="border-start-0"
											style={{ height: "auto", padding: "0.65rem 0.75rem" }}
										/>
									</InputGroup>
								)}
							</Col>
						</Row>
					</div>

					{loading ? (
						<div className="text-center py-5">
							<Spinner animation="border" variant="primary" />
							<p className="mt-2 text-muted">Loading invoices...</p>
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
											<th className="fw-semibold py-3 ps-4">Invoice #</th>
											<th className="fw-semibold py-3">Order</th>
											<th className="fw-semibold py-3">Total Amount</th>
											<th className="fw-semibold py-3">Payment Method</th>
											<th className="fw-semibold py-3">Date & Time</th>
											<th className="fw-semibold py-3 text-center">Actions</th>
										</tr>
									</thead>
									<tbody>
										{currentInvoices.length > 0 ? (
											currentInvoices.map((invoice) => (
												<tr key={invoice.id}>
													<td className="ps-4">
														<span className="fw-medium">{invoice.id}</span>
													</td>
													<td>{getOrderDetails(invoice.orderId)}</td>
													<td>
														<span className="fw-bold text-success">
															{formatCurrency(invoice.totalAmount)}
														</span>
													</td>
													<td>
														<Badge
															bg={
																invoice.paymentMethod === "cash"
																	? "success"
																	: "info"
															}
															className="px-3 py-2 fs-6"
														>
															{invoice.paymentMethod === "cash" ? (
																<>
																	<FaMoneyBillWave className="me-1" />{" "}
																	{formatPaymentMethod(invoice.paymentMethod)}
																</>
															) : (
																<>
																	<FaCreditCard className="me-1" />{" "}
																	{formatPaymentMethod(invoice.paymentMethod)}
																</>
															)}
														</Badge>
													</td>
													<td>
														<div>{formatDate(invoice.updatedAt)}</div>
													</td>
													<td>
														<div className="d-flex justify-content-center gap-2">
															<Button
																variant="outline-primary"
																size="sm"
																className="d-flex align-items-center shadow-sm"
																onClick={() => handleViewOrderDetails(invoice)}
															>
																<FaEye className="me-1" /> View
															</Button>
														</div>
													</td>
												</tr>
											))
										) : (
											<tr>
												<td colSpan="6" className="text-center py-5 fs-5">
													{searchTerm || filterType !== "all"
														? "No invoices match your search criteria"
														: "No invoices found"}
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>

							<div className="d-flex justify-content-between align-items-center p-4">
								<div className="text-muted">
									Showing {startRange} to {endRange} of{" "}
									{filteredInvoices.length} invoices
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

			{/* Order Details Modal */}
			<Modal
				show={showOrderDetailsModal}
				onHide={handleCloseOrderDetailsModal}
				size="lg"
				centered
			>
				<Modal.Header closeButton className="border-bottom-0 bg-light">
					<Modal.Title>
						<div className="d-flex align-items-center">
							<FaFileInvoiceDollar className="me-2 text-primary" />
							{selectedOrderDetails
								? `Invoice #${selectedOrderDetails.invoice.id} Details`
								: "Invoice Details"}
						</div>
					</Modal.Title>
				</Modal.Header>
				<Modal.Body className="pt-0">
					{orderItemsLoading ? (
						<div className="text-center my-4">
							<Spinner animation="border" variant="primary" />
							<p className="mt-2 text-muted">Loading order details...</p>
						</div>
					) : selectedOrderDetails ? (
						<div>
							<div className="card mb-4 bg-light border-0 shadow-sm">
								<div className="card-body">
									<Row className="g-3">
										<Col md={6}>
											<div className="d-flex align-items-center mb-2">
												<FaUserFriends className="text-primary me-2" />
												<span className="fw-medium">Customer:</span>
												<span className="ms-2">
													{selectedOrderDetails.customerName}
												</span>
											</div>
											<div className="d-flex align-items-center">
												<FaUtensils className="text-primary me-2" />
												<span className="fw-medium">Table:</span>
												<span className="ms-2">
													{selectedOrderDetails.tableName}
												</span>
											</div>
										</Col>
										<Col md={6}>
											<div className="d-flex align-items-center mb-2">
												<FaFileInvoiceDollar className="text-primary me-2" />
												<span className="fw-medium">Invoice:</span>
												<span className="ms-2">
													#{selectedOrderDetails.invoice.id}
												</span>
											</div>
											<div className="d-flex align-items-center">
												{selectedOrderDetails.invoice.paymentMethod ===
												"cash" ? (
													<FaMoneyBillWave className="text-success me-2" />
												) : (
													<FaCreditCard className="text-info me-2" />
												)}
												<span className="fw-medium">Payment Method:</span>
												<span className="ms-2">
													{formatPaymentMethod(
														selectedOrderDetails.invoice.paymentMethod
													)}
												</span>
											</div>
										</Col>
									</Row>
								</div>
							</div>

							<h5 className="fw-bold mb-3 d-flex align-items-center">
								<FaUtensils className="me-2 text-primary" /> Ordered Items
							</h5>

							{selectedOrderDetails.items.length > 0 ? (
								<>
									<div className="table-responsive shadow-sm rounded">
										<table className="table table-striped table-hover mb-0">
											<thead className="bg-light">
												<tr>
													<th>Item</th>
													<th className="text-center">Quantity</th>
													<th className="text-end">Price</th>
													<th className="text-end">Subtotal</th>
												</tr>
											</thead>
											<tbody>
												{selectedOrderDetails.items.map((item, idx) => {
													const dish = item.Dish || {};
													const price = dish.price || 0;
													const itemSubtotal = price * item.quantity;

													return (
														<tr key={idx}>
															<td>
																<div className="d-flex align-items-center">
																	<div className="me-3">
																		{dish.image ? (
																			<img
																				src={dish.image}
																				alt={dish.name}
																				className="rounded"
																				style={{
																					width: "40px",
																					height: "40px",
																					objectFit: "cover",
																				}}
																			/>
																		) : (
																			<div
																				className="bg-light rounded d-flex align-items-center justify-content-center"
																				style={{
																					width: "40px",
																					height: "40px",
																				}}
																			>
																				<FaUtensils className="text-secondary" />
																			</div>
																		)}
																	</div>
																	<div>
																		<div className="fw-medium">
																			{dish.name || `Dish #${item.dishId}`}
																		</div>
																		{dish.Category && (
																			<div className="small text-muted">
																				{dish.Category}
																			</div>
																		)}
																	</div>
																</div>
															</td>
															<td className="text-center">{item.quantity}</td>
															<td className="text-end">
																{formatCurrency(price)}
															</td>
															<td className="text-end fw-medium">
																{formatCurrency(itemSubtotal)}
															</td>
														</tr>
													);
												})}
											</tbody>
										</table>
									</div>

									<div className="card mt-4 bg-light border-0 shadow-sm">
										<div className="card-body">
											<div className="d-flex justify-content-between align-items-center mb-2">
												<span className="fw-medium">Subtotal:</span>
												<span>
													{formatCurrency(selectedOrderDetails.subtotal)}
												</span>
											</div>
											<div className="d-flex justify-content-between align-items-center mb-2">
												<span className="fw-medium">Discount:</span>
												<span className="text-danger">
													-{formatCurrency(selectedOrderDetails.discountAmount)}
												</span>
											</div>
											<hr />
											<div className="d-flex justify-content-between align-items-center fw-bold">
												<span className="fs-5">Total:</span>
												<span className="fs-5 text-success">
													{formatCurrency(
														selectedOrderDetails.invoice.totalAmount
													)}
												</span>
											</div>
										</div>
									</div>
								</>
							) : (
								<div className="alert alert-info d-flex align-items-center">
									<FaInfoCircle className="me-2" />
									<span>No items found for this order</span>
								</div>
							)}
						</div>
					) : (
						<div className="alert alert-warning d-flex align-items-center">
							<FaInfoCircle className="me-2" />
							<span>No order details available</span>
						</div>
					)}
				</Modal.Body>
				<Modal.Footer className="border-top-0">
					{selectedOrderDetails && (
						<Button
							variant="outline-primary"
							className="d-flex align-items-center"
							onClick={handlePrintReceipt}
						>
							<FaPrint className="me-2" /> Print Receipt
						</Button>
					)}
					<Button variant="secondary" onClick={handleCloseOrderDetailsModal}>
						Close
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
};

export default ManageInvoices;
