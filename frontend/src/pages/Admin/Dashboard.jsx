import React, { useState, useEffect } from "react";
import {
	Row,
	Col,
	Card,
	Table,
	Spinner,
	Form,
	Button,
	ButtonGroup,
	Container,
} from "react-bootstrap";
import {
	FaUsers,
	FaTable,
	FaShoppingCart,
	FaUtensils,
	FaChartBar,
	FaCalendarAlt,
} from "react-icons/fa";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import {
	GetAllDish,
	GetAllOrder,
	GetAllOrderPeding,
	GetAllTable,
	GetAllInvoice,
} from "../../services/apiService";
import { GetAllUser } from "../../services/userService";

// Register Chart.js components
ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ArcElement
);

const Dashboard = ({ setActiveView }) => {
	const [loading, setLoading] = useState(true);
	const [users, setUsers] = useState([]);
	const [tables, setTables] = useState([]);
	const [orders, setOrders] = useState([]);
	const [dishes, setDishes] = useState([]);
	const [pendingOrders, setPendingOrders] = useState([]);
	const [invoices, setInvoices] = useState([]); // New state for invoices
	const [error, setError] = useState(null);

	// Date filter states
	const [filterType, setFilterType] = useState("all"); // 'all', 'day', 'month', 'year'
	const [selectedDate, setSelectedDate] = useState(
		new Date().toISOString().split("T")[0]
	);
	const [selectedMonth, setSelectedMonth] = useState(
		new Date().toISOString().slice(0, 7)
	);
	const [selectedYear, setSelectedYear] = useState(
		new Date().getFullYear().toString()
	);

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				setLoading(true);

				// Fetch all required data in parallel including invoices
				const [
					usersResponse,
					tablesResponse,
					ordersResponse,
					dishesResponse,
					pendingOrdersResponse,
					invoicesResponse, // Add invoices response
				] = await Promise.all([
					GetAllUser("ALL"),
					GetAllTable("ALL"),
					GetAllOrder("ALL"),
					GetAllDish("ALL"),
					GetAllOrderPeding(),
					GetAllInvoice("ALL"), // Fetch all invoices
				]);

				// Set state with fetched data
				setUsers(usersResponse.user);
				setTables(tablesResponse.table);
				setOrders(ordersResponse.order);
				setDishes(dishesResponse.dish);
				setPendingOrders(pendingOrdersResponse.order);
				setInvoices(invoicesResponse.invoice); // Set invoices state

				setLoading(false);
			} catch (err) {
				console.error("Error fetching dashboard data:", err);
				setError("Failed to load dashboard data");
				setLoading(false);
			}
		};

		fetchDashboardData();
	}, []);

	// Filter function for invoices instead of orders
	const filterInvoicesByDate = (invoices) => {
		if (filterType === "all") return invoices;

		return invoices.filter((invoice) => {
			const invoiceDate = new Date(invoice.createdAt);
			const invoiceDateStr = invoiceDate.toISOString();

			switch (filterType) {
				case "day":
					return invoiceDateStr.startsWith(selectedDate);
				case "month":
					return invoiceDateStr.startsWith(selectedMonth);
				case "year":
					return invoiceDateStr.startsWith(selectedYear);
				default:
					return true;
			}
		});
	};

	// Calculate metrics
	const filteredInvoices = filterInvoicesByDate(invoices);

	// Calculate revenue metrics directly from invoices
	const revenueData = filteredInvoices.reduce(
		(acc, invoice) => {
			const amount = invoice.totalAmount || 0;
			acc.total += amount;
			if (invoice.paymentMethod === "Cash") {
				acc.cash += amount;
			} else if (invoice.paymentMethod === "Bank Transfer") {
				acc.bankTransfer += amount;
			} else if (invoice.paymentMethod === null) {
				// nếu paymentMethod là null thì là tiền đang chờ thanh toán
				acc.pending += amount;
			}
			return acc;
		},
		{ total: 0, cash: 0, bankTransfer: 0, pending: 0 }
	);

	const occupiedTables = tables.filter(
		(table) => table.status === "Occupied"
	).length;

	const availableTables = tables.filter(
		(table) => table.status === "AVAILABLE"
	).length;

	// Prepare chart data
	const tableStatusData = {
		labels: ["Occupied", "Available"],
		datasets: [
			{
				label: "Table Status",
				data: [occupiedTables, availableTables],
				backgroundColor: ["rgba(255, 99, 132, 0.6)", "rgba(54, 162, 235, 0.6)"],
				borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)"],
				borderWidth: 1,
			},
		],
	};

	// Group dishes by category (filtered by date if dishes have creation date)
	const filteredDishes =
		filterType === "all"
			? dishes
			: dishes.filter((dish) => {
					if (!dish.createdAt) return true; // Include if no date info

					const dishDate = new Date(dish.createdAt);
					const dishDateStr = dishDate.toISOString();
					switch (filterType) {
						case "day":
							return dishDateStr.startsWith(selectedDate);
						case "month":
							return dishDateStr.startsWith(selectedMonth);
						case "year":
							return dishDateStr.startsWith(selectedYear);
						default:
							return true;
					}
			  });

	const dishCategories = filteredDishes.reduce((acc, dish) => {
		acc[dish.Category] = (acc[dish.Category] || 0) + 1;
		return acc;
	}, {});

	const dishCategoryData = {
		labels: Object.keys(dishCategories),
		datasets: [
			{
				label: "Dishes by Category",
				data: Object.values(dishCategories),
				backgroundColor: [
					"rgba(255, 99, 132, 0.6)",
					"rgba(54, 162, 235, 0.6)",
					"rgba(255, 206, 86, 0.6)",
					"rgba(75, 192, 192, 0.6)",
					"rgba(153, 102, 255, 0.6)",
				],
				borderWidth: 1,
			},
		],
	};

	// Format currency
	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(amount);
	};

	// Handle filter changes
	const handleFilterChange = (type) => {
		setFilterType(type);
	};

	if (loading) {
		return (
			<div className="d-flex flex-column justify-content-center align-items-center min-vh-75 p-5">
				<Spinner animation="border" variant="primary" size="lg" />
				<p className="mt-3 text-muted">Loading dashboard data...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="alert alert-danger m-4 shadow-sm" role="alert">
				<h4 className="alert-heading">Error!</h4>
				<p>{error}</p>
				<hr />
				<p className="mb-0">
					Please try refreshing the page or contact support if the issue
					persists.
				</p>
			</div>
		);
	}

	return (
		<div className="dashboard-container">
			<Row className="mb-4">
				<Col>
					<div className="d-flex flex-wrap justify-content-between align-items-center mb-2">
						<div>
							<h1 className="h3 mb-0 text-gray-800">Dashboard</h1>
							<p className="text-muted mb-0">
								Restaurant Management System Overview
							</p>
						</div>
						<div className="d-none d-sm-inline-block shadow-sm p-2 bg-white rounded">
							<FaCalendarAlt className="text-primary me-2" />
							<span>
								{new Date().toLocaleDateString("en-US", {
									weekday: "long",
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</span>
						</div>
					</div>
				</Col>
			</Row>

			{/* Date Filter Controls */}
			<Row className="mb-4">
				<Col>
					<Card className="shadow-sm border-0">
						<Card.Header className="bg-primary text-white py-3">
							<div className="d-flex align-items-center">
								<FaChartBar className="me-2" />
								<h5 className="mb-0">Data Analysis</h5>
							</div>
						</Card.Header>
						<Card.Body className="py-3">
							<Row className="align-items-end">
								<Col lg={3} md={6} className="mb-3 mb-md-0">
									<label className="form-label fw-bold">Filter By:</label>
									<ButtonGroup className="w-100">
										<Button
											variant={
												filterType === "all" ? "primary" : "outline-primary"
											}
											onClick={() => handleFilterChange("all")}
											className="py-2"
										>
											All Time
										</Button>
										<Button
											variant={
												filterType === "day" ? "primary" : "outline-primary"
											}
											onClick={() => handleFilterChange("day")}
											className="py-2"
										>
											Daily
										</Button>
										<Button
											variant={
												filterType === "month" ? "primary" : "outline-primary"
											}
											onClick={() => handleFilterChange("month")}
											className="py-2"
										>
											Monthly
										</Button>
										<Button
											variant={
												filterType === "year" ? "primary" : "outline-primary"
											}
											onClick={() => handleFilterChange("year")}
											className="py-2"
										>
											Yearly
										</Button>
									</ButtonGroup>
								</Col>
								<Col lg={3} md={6}>
									<label className="form-label fw-bold">Select Period:</label>
									{filterType === "day" && (
										<Form.Control
											type="date"
											value={selectedDate}
											onChange={(e) => setSelectedDate(e.target.value)}
											className="shadow-sm py-2"
										/>
									)}
									{filterType === "month" && (
										<Form.Control
											type="month"
											value={selectedMonth}
											onChange={(e) => setSelectedMonth(e.target.value)}
											className="shadow-sm py-2"
										/>
									)}
									{filterType === "year" && (
										<Form.Control
											type="number"
											min="2000"
											max={new Date().getFullYear()}
											value={selectedYear}
											onChange={(e) => setSelectedYear(e.target.value)}
											className="shadow-sm py-2"
										/>
									)}
								</Col>
							</Row>
						</Card.Body>
					</Card>
				</Col>
			</Row>

			<Row className="mb-4 g-3">
				<Col xl={3} lg={6} md={6}>
					<Card className="border-start border-primary border-5 shadow-sm h-100 py-2 border-0">
						<Card.Body>
							<div className="d-flex align-items-center">
								<div className="me-3">
									<div className="icon-circle bg-primary text-white p-3 rounded-circle">
										<FaUsers size={24} />
									</div>
								</div>
								<div>
									<div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
										Users
									</div>
									<div className="h5 mb-0 fw-bold">{users.length}</div>
									<div className="text-muted small">Staff members</div>
								</div>
							</div>
						</Card.Body>
					</Card>
				</Col>

				<Col xl={3} lg={6} md={6}>
					<Card className="border-start border-success border-5 shadow-sm h-100 py-2 border-0">
						<Card.Body>
							<div className="d-flex align-items-center">
								<div className="me-3">
									<div className="icon-circle bg-success text-white p-3 rounded-circle">
										<FaTable size={24} />
									</div>
								</div>
								<div>
									<div className="text-xs font-weight-bold text-success text-uppercase mb-1">
										Tables
									</div>
									<div className="h5 mb-0 fw-bold">{tables.length}</div>
									<div className="text-muted small">
										({availableTables} Available)
									</div>
								</div>
							</div>
						</Card.Body>
					</Card>
				</Col>

				<Col xl={3} lg={6} md={6}>
					<Card className="border-start border-warning border-5 shadow-sm h-100 py-2 border-0">
						<Card.Body>
							<div className="d-flex align-items-center">
								<div className="me-3">
									<div className="icon-circle bg-warning text-white p-3 rounded-circle">
										<FaShoppingCart size={24} />
									</div>
								</div>
								<div>
									<div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
										Pending Orders
									</div>
									<div className="h5 mb-0 fw-bold">{pendingOrders.length}</div>
									<div className="text-muted small">Awaiting processing</div>
								</div>
							</div>
						</Card.Body>
					</Card>
				</Col>

				<Col xl={3} lg={6} md={6}>
					<Card className="border-start border-danger border-5 shadow-sm h-100 py-2 border-0">
						<Card.Body>
							<div className="d-flex align-items-center">
								<div className="me-3">
									<div className="icon-circle bg-danger text-white p-3 rounded-circle">
										<FaUtensils size={24} />
									</div>
								</div>
								<div>
									<div className="text-xs font-weight-bold text-danger text-uppercase mb-1">
										Total Revenue
									</div>
									<div className="h5 mb-0 fw-bold">
										{formatCurrency(revenueData.total)}
									</div>
									<div className="text-muted small">
										{filterType !== "all" ? "(filtered period)" : "(all time)"}
									</div>
								</div>
							</div>
						</Card.Body>
					</Card>
				</Col>
			</Row>

			{/* Revenue Breakdown */}
			<Row className="mb-4">
				<Col>
					<Card className="shadow-sm border-0">
						<Card.Header className="bg-info text-white py-3">
							<h5 className="mb-0">Revenue Breakdown</h5>
						</Card.Header>
						<Card.Body className="py-4">
							<Row className="g-3">
								<Col lg={4} md={4}>
									<Card className="border-0 bg-light h-100">
										<Card.Body className="text-center py-4">
											<h6 className="text-success mb-3">Cash Payments</h6>
											<h3 className="mb-3 fw-bold">
												{formatCurrency(revenueData.cash)}
											</h3>
											<div className="progress mt-2" style={{ height: "10px" }}>
												<div
													className="progress-bar bg-success"
													style={{
														width: `${
															revenueData.total
																? (revenueData.cash / revenueData.total) * 100
																: 0
														}%`,
													}}
													aria-valuenow={revenueData.cash}
													aria-valuemin="0"
													aria-valuemax={revenueData.total}
												></div>
											</div>
										</Card.Body>
									</Card>
								</Col>
								<Col lg={4} md={4}>
									<Card className="border-0 bg-light h-100">
										<Card.Body className="text-center py-4">
											<h6 className="text-info mb-3">Bank Transfers</h6>
											<h3 className="mb-3 fw-bold">
												{formatCurrency(revenueData.bankTransfer)}
											</h3>
											<div className="progress mt-2" style={{ height: "10px" }}>
												<div
													className="progress-bar bg-info"
													style={{
														width: `${
															revenueData.total
																? (revenueData.bankTransfer /
																		revenueData.total) *
																  100
																: 0
														}%`,
													}}
													aria-valuenow={revenueData.bankTransfer}
													aria-valuemin="0"
													aria-valuemax={revenueData.total}
												></div>
											</div>
										</Card.Body>
									</Card>
								</Col>
								<Col lg={4} md={4}>
									<Card className="border-0 bg-light h-100">
										<Card.Body className="text-center py-4">
											<h6 className="text-warning mb-3">Pending Payments</h6>
											<h3 className="mb-3 fw-bold">
												{formatCurrency(revenueData.pending)}
											</h3>
											<div className="progress mt-2" style={{ height: "10px" }}>
												<div
													className="progress-bar bg-warning"
													style={{
														width: `${
															revenueData.total
																? (revenueData.pending / revenueData.total) *
																  100
																: 0
														}%`,
													}}
													aria-valuenow={revenueData.pending}
													aria-valuemin="0"
													aria-valuemax={revenueData.total}
												></div>
											</div>
										</Card.Body>
									</Card>
								</Col>
							</Row>
						</Card.Body>
					</Card>
				</Col>
			</Row>

			<Row className="mb-4 g-4">
				<Col lg={6}>
					<Card className="shadow-sm border-0 h-100">
						<Card.Header className="bg-primary text-white py-3">
							<h5 className="mb-0">Table Status</h5>
						</Card.Header>
						<Card.Body className="d-flex justify-content-center align-items-center p-4">
							<div
								style={{
									height: "300px",
									width: "100%",
									maxWidth: "400px",
									position: "relative",
								}}
							>
								<Pie
									data={tableStatusData}
									options={{
										responsive: true,
										maintainAspectRatio: false,
										plugins: {
											legend: {
												position: "bottom",
											},
										},
									}}
								/>
							</div>
						</Card.Body>
					</Card>
				</Col>
				<Col lg={6}>
					<Card className="shadow-sm border-0 h-100">
						<Card.Header className="bg-primary text-white py-3">
							<h5 className="mb-0">
								Dishes by Category{" "}
								{filterType !== "all"
									? `(${
											filterType === "day"
												? selectedDate
												: filterType === "month"
												? selectedMonth
												: selectedYear
									  })`
									: ""}
							</h5>
						</Card.Header>
						<Card.Body className="p-4">
							<div style={{ height: "300px", position: "relative" }}>
								<Bar
									data={dishCategoryData}
									options={{
										responsive: true,
										maintainAspectRatio: false,
										plugins: {
											legend: {
												display: false,
											},
										},
									}}
								/>
							</div>
						</Card.Body>
					</Card>
				</Col>
			</Row>

			{/* Recent Orders Section */}
			<Row>
				<Col>
					<Card className="shadow-sm border-0">
						<Card.Header className="bg-primary text-white py-3 d-flex justify-content-between align-items-center">
							<h5 className="mb-0">Recent Orders</h5>
							<Button
								variant="light"
								size="sm"
								onClick={() => setActiveView("manage-orders")}
							>
								View All Orders
							</Button>
						</Card.Header>
						<Card.Body className="p-0">
							<div className="table-responsive">
								<Table hover className="mb-0 align-middle">
									<thead className="bg-light">
										<tr>
											<th className="py-3">Order ID</th>
											<th className="py-3">Table</th>
											<th className="py-3">Customer</th>
											<th className="py-3">Status</th>
											<th className="py-3">Created At</th>
										</tr>
									</thead>
									<tbody>
										{[...orders]
											.sort(
												(a, b) => new Date(b.createdAt) - new Date(a.createdAt)
											)
											.slice(0, 5)
											.map((order) => (
												<tr key={order.id}>
													<td>
														<span className="fw-bold">#{order.id}</span>
													</td>
													<td>{order.Table?.tableNumber || "N/A"}</td>
													<td>{order.Customer?.name || "Walk-in"}</td>
													<td>
														<span
															className={`badge ${
																order.status === "PENDING"
																	? "bg-warning"
																	: order.status === "Completed"
																	? "bg-success"
																	: "bg-info"
															} rounded-pill px-3 py-2`}
														>
															{order.status}
														</span>
													</td>
													<td>{new Date(order.createdAt).toLocaleString()}</td>
												</tr>
											))}
										{orders.length === 0 && (
											<tr>
												<td colSpan="5" className="text-center py-4">
													No orders found
												</td>
											</tr>
										)}
									</tbody>
								</Table>
							</div>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</div>
	);
};

export default Dashboard;
