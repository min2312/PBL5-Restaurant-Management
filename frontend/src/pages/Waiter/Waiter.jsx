import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import {
	CheckCustomer,
	CreateNewCustomer,
	CreateNewOrder,
	GetAllOrder,
	GetAllReservation,
	GetAllTable,
} from "../../services/apiService";
import { toast } from "react-toastify";
import CustomerModal from "../../Component/Customer/CustomerModal";
import { UserContext } from "../../Context/UserProvider";
import { io } from "socket.io-client";

const Waiter = () => {
	const [phoneNumber, setPhoneNumber] = useState("");
	const [customerInfo, setCustomerInfo] = useState(null);
	const [newCustomer, setNewCustomer] = useState({ name: "", phone: "" });
	const [tables, setTables] = useState([]);
	const [selectedTable, setSelectedTable] = useState(null);
	const [modalIsOpen, setModalIsOpen] = useState(false);
	const [socket, setSocket] = useState(null);
	const [staff, setStaff] = useState({});
	const [order, setOrder] = useState({});
	const { user } = useContext(UserContext);
	const history = useHistory();
	const [customerInfoByTable, setCustomerInfoByTable] = useState({});
	const [notification, setNotification] = useState(null);
	// Add filter state
	const [filter, setFilter] = useState("ALL");
	const [searchTerm, setSearchTerm] = useState("");

	const toast2 = {
		success: (message) => {
			setNotification({ type: "success", message });
			setTimeout(() => setNotification(null), 3000);
		},
		error: (message) => {
			setNotification({ type: "error", message });
			setTimeout(() => setNotification(null), 3000);
		},
	};

	const GetData = async () => {
		try {
			let id_Table = "ALL";
			let respone = await GetAllTable(id_Table);
			if (respone && respone.errCode === 0) {
				setTables(respone.table);
			} else {
				toast.error("Get Data Failed");
			}
		} catch (e) {
			toast.error("Get Data Failed");
			console.log("err:", e);
		}
	};

	const GetOrder = async () => {
		try {
			let id_order = "ALL";
			let respone = await GetAllOrder(id_order);
			if (respone && respone.errCode === 0) {
				if (respone.order && respone.order.length > 0) {
					respone.order.forEach((order) => {
						let tableNumber = order.Table?.tableNumber;
						let tableId = order.Table?.id;
						let user = order.User;
						if (tableNumber && user && order.status === "PENDING") {
							setOrder((prev) => ({ ...prev, [tableId]: order }));
							setStaff((prev) => ({
								...prev,
								[tableNumber]: user,
							}));
						}
					});
				}
			} else {
				toast.error("Get Data Failed");
			}
		} catch (e) {
			toast.error("Get Data Failed");
			console.log("err:", e);
		}
	};
	const GetReservation = async () => {
		try {
			let id_reservation = "ALL";
			let respone = await GetAllReservation(id_reservation);
			if (respone && respone.errCode === 0) {
				let allReservations = respone.Reservation;

				allReservations.forEach((reservation) => {
					let tableNumber = reservation.Table?.tableNumber;
					let customer = reservation.Customer;
					if (tableNumber && customer && reservation.status === "Pending") {
						setCustomerInfoByTable((prev) => ({
							...prev,
							[tableNumber]: customer,
						}));
					}
				});
			} else {
				toast.error("Get Data Failed");
			}
		} catch (e) {
			toast.error("Get Data Failed");
			console.log("err:", e);
		}
	};

	useEffect(() => {
		GetData();
		GetOrder();
		GetReservation();
	}, []);

	useEffect(() => {
		if (!user || !user.token) {
			toast.error("User not authenticated");
			return;
		}

		const newSocket = io("http://localhost:8081", {
			extraHeaders: {
				Authorization: `Bearer ${user.token}`,
			},
		});

		newSocket.on("connect", () => {
			console.log("Receptionist connected to WebSocket:", newSocket.id);
		});

		newSocket.on("tableUpdated", (data) => {
			console.log("Table updated:", data);
			setTables((prevTables) =>
				prevTables.map((table) =>
					table.tableNumber === data.table.tableNumber
						? { ...table, status: data.status }
						: table
				)
			);
			if (data.response && data.response.errCode === 0) {
				if (data.response.reservation?.status === "Pending") {
					setCustomerInfoByTable((prev) => ({
						...prev,
						[data.table.tableNumber]: data.customer,
					}));
				} else {
					setCustomerInfoByTable((prev) => {
						const updated = { ...prev };
						delete updated[data.table.tableNumber];
						return updated;
					});
				}
			}
		});

		newSocket.on("orderUpdated", (respone) => {
			console.log("Update Order:", respone);
			let orders = Array.isArray(respone.order)
				? respone.order
				: [respone.order];
			if (orders && orders.length > 0) {
				orders.forEach((order) => {
					let tableNumber = order.Table?.tableNumber;
					let user = order.User;
					if (tableNumber && user && order.status === "PENDING") {
						setStaff((prev) => ({
							...prev,
							[tableNumber]: user,
						}));
					}
				});
			}
		});

		newSocket.on("connect_error", (err) => {
			console.error("Connection error:", err.message);
		});

		newSocket.on("disconnect", (reason) => {
			console.warn("WebSocket disconnected:", reason);
		});

		setSocket(newSocket);

		return () => {
			newSocket.disconnect();
		};
	}, [user]);

	const handleCheckCustomer = async () => {
		if (!phoneNumber) {
			toast2.error("Please enter phone number");
		} else {
			let checkinfo = await CheckCustomer(phoneNumber);
			if (checkinfo && checkinfo.errCode === 0) {
				setCustomerInfo(checkinfo.customer);
			} else {
				toast2.error(checkinfo.errMessage);
			}
		}
	};

	const handleNewCustomer = async () => {
		try {
			let response = await CreateNewCustomer(newCustomer);
			if (response && response.errCode === 0) {
				setCustomerInfo(response.customer);
				setPhoneNumber(newCustomer.phone);
				setNewCustomer({ name: "", phone: "" });
				toast2.success("Create New Customer Success");
			} else {
				toast2.error(response.errMessage);
			}
		} catch (error) {
			toast2.error("Create New Customer Failed");
		}
	};

	const handleCloseInfo = () => {
		setCustomerInfo(null);
		setPhoneNumber("");
	};

	const handleTableSelection = (table) => {
		let check = false;
		Object.entries(staff).forEach(([tableNumber, staffMember]) => {
			if (staffMember.id === user.account.id) {
				if (tableNumber === table.tableNumber.toString()) {
					history.push("/order-menu", {
						table: table,
						customer: customerInfoByTable[table.tableNumber] || null,
						order: order[table.tableNumber] || null,
					});
					return;
				} else {
					check = true;
					return;
				}
			}
		});
		if (check) {
			toast2.error("You are already serving another table.");
			return;
		}
		setSelectedTable(table);
		setCustomerInfo(customerInfoByTable[table.tableNumber] || null);
		setModalIsOpen(true);
	};

	const handleProceedToOrder = async () => {
		if (!socket) {
			toast2.error("Socket connection not established");
			return;
		}
		if (customerInfo) {
			let data = {
				table: selectedTable,
				status: "Occupied",
				customer: customerInfo || null,
				user: user.account,
			};
			socket.emit("updateTable", data);
			let respone = await CreateNewOrder(data);
			if (respone && respone.errCode === 0) {
				socket.emit("updateOrder", respone);
				setOrder((prev) => ({
					...prev,
					[selectedTable.id]: respone.order,
				}));
				// setOrder(respone.order);
				history.push("/order-menu", {
					table: selectedTable,
					customer: customerInfo,
					order: respone.order,
				});
			} else {
				toast2.error(respone.errMessage);
			}
		} else {
			toast2.error("Please select a customer");
		}
	};

	// Table status color map
	const getStatusColor = (status) => {
		switch (status) {
			case "AVAILABLE":
				return { bg: "bg-success bg-opacity-10", text: "text-success" };
			case "Pending":
				return { bg: "bg-warning bg-opacity-10", text: "text-warning" };
			case "Occupied":
				return { bg: "bg-primary bg-opacity-10", text: "text-primary" };
			default:
				return { bg: "bg-secondary bg-opacity-10", text: "text-secondary" };
		}
	};

	// Add a function to filter tables
	const getFilteredTables = () => {
		if (!tables || tables.length === 0) return [];

		let filteredTables = [...tables];

		// Filter by status
		if (filter !== "ALL") {
			filteredTables = filteredTables.filter(
				(table) => table.status === filter
			);
		}

		// Filter by search term (table number)
		if (searchTerm) {
			filteredTables = filteredTables.filter((table) =>
				table.tableNumber.toString().includes(searchTerm)
			);
		}

		return filteredTables;
	};

	return (
		<div className="bg-light min-vh-100">
			{/* Toast notification */}
			{notification && (
				<div
					className={`toast ${
						notification.type === "success" ? "bg-success" : "bg-danger"
					} text-white position-fixed top-0 end-0 m-4 show`}
					style={{ zIndex: 1050, opacity: 1 }}
				>
					<div className="toast-body p-3">{notification.message}</div>
				</div>
			)}

			{/* Header */}
			<header
				className="py-4 mb-5"
				style={{
					background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
					boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
				}}
			>
				<div className="container">
					<div className="row align-items-center">
						<div className="col-md-8">
							<h1 className="text-white mb-1 fw-bold">Waiter Dashboard</h1>
							<p className="text-white-50 mb-0">
								Manage orders and serve customers efficiently
							</p>
						</div>
						<div className="col-md-4 text-md-end">
							<div className="d-inline-block bg-white bg-opacity-10 rounded p-3">
								<p className="m-0 text-white">
									<i className="bi bi-person me-2"></i>Waiter:{" "}
									{user?.account?.fullName || "Staff"}
								</p>
							</div>
						</div>
					</div>
				</div>
			</header>

			<div className="container mb-5">
				<div className="row mb-4">
					<div className="col-12">
						<div
							className="card border-0 shadow-sm"
							style={{ borderRadius: "16px" }}
						>
							<div className="card-body p-4">
								<h5 className="card-title fw-bold mb-3">
									<i className="bi bi-search me-2 text-primary"></i>Find
									Customer
								</h5>
								<div className="row g-3">
									<div className="col-md-8">
										<div className="input-group">
											<span className="input-group-text bg-light border-0">
												<i className="bi bi-telephone text-primary"></i>
											</span>
											<input
												type="text"
												className="form-control bg-light border-0"
												placeholder="Enter customer phone number"
												value={phoneNumber}
												onChange={(e) => setPhoneNumber(e.target.value)}
											/>
										</div>
									</div>
									<div className="col-md-4">
										<button
											className="btn btn-primary w-100"
											onClick={handleCheckCustomer}
											style={{ borderRadius: "8px" }}
										>
											<i className="bi bi-search me-2"></i>Find Customer
										</button>
									</div>
								</div>

								{customerInfo && (
									<div className="mt-4 p-3 border rounded-3 bg-light">
										<div className="d-flex justify-content-between align-items-center mb-2">
											<h6 className="fw-bold mb-0">Customer Information</h6>
											<button
												className="btn btn-sm btn-outline-secondary"
												onClick={handleCloseInfo}
											>
												<i className="bi bi-x"></i>
											</button>
										</div>
										<div className="row g-3">
											<div className="col-md-6">
												<div className="d-flex align-items-center">
													<div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
														<i className="bi bi-person text-primary"></i>
													</div>
													<div>
														<small className="text-muted d-block">Name</small>
														<span className="fw-medium">
															{customerInfo.name}
														</span>
													</div>
												</div>
											</div>
											<div className="col-md-6">
												<div className="d-flex align-items-center">
													<div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
														<i className="bi bi-telephone text-primary"></i>
													</div>
													<div>
														<small className="text-muted d-block">Phone</small>
														<span className="fw-medium">
															{customerInfo.phone}
														</span>
													</div>
												</div>
											</div>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				<div className="row mb-4">
					<div className="col-12">
						<div
							className="card border-0 shadow-sm"
							style={{ borderRadius: "16px" }}
						>
							<div className="card-body p-4">
								<h5 className="card-title fw-bold mb-3">
									<i className="bi bi-funnel me-2 text-primary"></i>Filter
									Tables
								</h5>
								<div className="row g-3">
									<div className="col-md-6">
										<div className="input-group">
											<span className="input-group-text bg-light border-0">
												<i className="bi bi-search text-primary"></i>
											</span>
											<input
												type="text"
												className="form-control bg-light border-0"
												placeholder="Search by table number"
												value={searchTerm}
												onChange={(e) => setSearchTerm(e.target.value)}
											/>
										</div>
									</div>
									<div className="col-md-6">
										<select
											className="form-select bg-light border-0"
											value={filter}
											onChange={(e) => setFilter(e.target.value)}
										>
											<option value="ALL">All Tables</option>
											<option value="AVAILABLE">Available</option>
											<option value="Pending">Pending</option>
											<option value="Occupied">Occupied</option>
											<option value="Completed">Completed</option>
										</select>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<h4 className="fw-bold mb-4">
					<i className="bi bi-grid me-2 text-primary"></i>Table Status
					{filter !== "ALL" && (
						<span className="badge bg-primary ms-2">Filter: {filter}</span>
					)}
				</h4>

				<div className="row g-4">
					{getFilteredTables().length > 0 ? (
						getFilteredTables().map((table, index) => {
							const statusClass = getStatusColor(table.status);
							const isServedByMe =
								staff[table.tableNumber]?.id === user?.account?.id;
							const isOccupied = table.status === "Occupied";
							const customerForTable = customerInfoByTable[table.tableNumber];

							return (
								<div className="col-lg-4 col-md-6" key={index}>
									<div
										className="card border-0 h-100 shadow-sm"
										style={{
											borderRadius: "16px",
											transition: "transform 0.3s ease, box-shadow 0.3s ease",
											cursor:
												isOccupied && !isServedByMe ? "not-allowed" : "pointer",
										}}
										onMouseOver={(e) => {
											if (!(isOccupied && !isServedByMe)) {
												e.currentTarget.style.transform = "translateY(-5px)";
												e.currentTarget.style.boxShadow =
													"0 10px 20px rgba(0,0,0,0.08)";
											}
										}}
										onMouseOut={(e) => {
											e.currentTarget.style.transform = "translateY(0)";
											e.currentTarget.style.boxShadow = "";
										}}
										onClick={() => {
											if (
												!(isOccupied && !isServedByMe) &&
												table.status !== "AVAILABLE" &&
												table.status !== "Completed"
											) {
												handleTableSelection(table);
											}
										}}
									>
										<div className="card-body p-4">
											<div className="d-flex justify-content-between mb-3">
												<h5 className="fw-bold mb-0">
													Table {table.tableNumber}
												</h5>
												<span
													className={`badge ${statusClass.bg} ${statusClass.text} px-3 py-2`}
												>
													{table.status}
												</span>
											</div>

											<div className="d-flex justify-content-center my-4">
												<div
													className={`table-icon rounded-circle d-flex align-items-center justify-content-center ${statusClass.bg}`}
													style={{ width: "80px", height: "80px" }}
												>
													<i
														className="bi bi-table text-primary"
														style={{ fontSize: "2rem" }}
													></i>
												</div>
											</div>

											{isOccupied && staff[table.tableNumber] && (
												<div className="mb-3 p-3 bg-light rounded-3">
													<div className="d-flex align-items-center">
														<div className="me-3">
															<i
																className="bi bi-person-circle text-primary"
																style={{ fontSize: "1.5rem" }}
															></i>
														</div>
														<div>
															<small className="text-muted">Served by</small>
															<p className="mb-0 fw-medium">
																{staff[table.tableNumber].fullName}
															</p>
														</div>
													</div>
												</div>
											)}

											{customerForTable && (
												<div className="mb-3 p-3 bg-light rounded-3">
													<div className="d-flex align-items-center">
														<div className="me-3">
															<i
																className="bi bi-person text-primary"
																style={{ fontSize: "1.5rem" }}
															></i>
														</div>
														<div>
															<small className="text-muted">Customer</small>
															<p className="mb-0 fw-medium">
																{customerForTable.name}
															</p>
															<small className="text-muted">
																{customerForTable.phone}
															</small>
														</div>
													</div>
												</div>
											)}

											<div className="d-grid mt-3">
												{isOccupied ? (
													isServedByMe ? (
														<button
															className="btn btn-warning"
															onClick={() => handleTableSelection(table)}
														>
															<i className="bi bi-arrow-right-circle me-2"></i>
															Continue Serving
														</button>
													) : (
														<button className="btn btn-secondary" disabled>
															<i className="bi bi-lock me-2"></i>
															Already Served
														</button>
													)
												) : table.status === "AVAILABLE" ? (
													<button className="btn btn-secondary" disabled>
														<i className="bi bi-x-circle me-2"></i>
														Not Available
													</button>
												) : table.status === "Completed" ? (
													<button className="btn btn-info" disabled>
														<i className="bi bi-cash-coin me-2"></i>
														Waiting for Payment
													</button>
												) : (
													<button
														className="btn btn-primary"
														onClick={() => handleTableSelection(table)}
													>
														<i className="bi bi-check-circle me-2"></i>
														Select Table
													</button>
												)}
											</div>
										</div>
									</div>
								</div>
							);
						})
					) : (
						<div className="col-12 text-center py-5">
							<div className="mb-3">
								<i
									className="bi bi-table text-muted"
									style={{ fontSize: "3rem" }}
								></i>
							</div>
							<h5 className="text-muted mb-2">No Tables Found</h5>
							<p className="text-muted mb-0">
								{filter !== "ALL"
									? `No tables with status "${filter}" found. Try changing the filter.`
									: "Please check back later or contact management"}
							</p>
						</div>
					)}
				</div>
			</div>

			<CustomerModal
				show={modalIsOpen}
				close={handleCloseInfo}
				onHide={() => {
					setModalIsOpen(false);
					setPhoneNumber("");
					setNewCustomer({ name: "", phone: "" });
					setCustomerInfo(null);
				}}
				phoneNumber={phoneNumber}
				setPhoneNumber={setPhoneNumber}
				handleCheckCustomer={handleCheckCustomer}
				customerInfo={customerInfo}
				newCustomer={newCustomer}
				setNewCustomer={setNewCustomer}
				handleNewCustomer={handleNewCustomer}
				handleProceedToOrder={handleProceedToOrder}
			/>
		</div>
	);
};

export default Waiter;
