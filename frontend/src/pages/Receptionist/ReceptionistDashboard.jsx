import React, { useContext, useEffect, useRef, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import "./ReceptionistDashboard.css";
import CustomerModal from "../../Component/Customer/CustomerModal";
import {
	CheckCustomer,
	CheckPayment,
	CreateInvoice,
	CreateNewCustomer,
	GetAllTable,
	GetInvoice,
	PaymentZaloPay,
	UpdateCustomer,
	UpdateDiscount,
	GetAllDiscounts,
} from "../../services/apiService";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { UserContext } from "../../Context/UserProvider";
import { useLocation } from "react-router-dom/cjs/react-router-dom.min";

const ReceptionistDashboard = () => {
	const [phoneNumber, setPhoneNumber] = useState("");
	const [customerInfo, setCustomerInfo] = useState(null);
	const [newCustomer, setNewCustomer] = useState({ name: "", phone: "" });
	const [table, setTable] = useState("");
	const [selectedTable, setSelectedTable] = useState(null);
	const [socket, setSocket] = useState(null);
	const [modalIsOpen, setModalIsOpen] = useState(false);
	const [paymentModalOpen, setPaymentModalOpen] = useState(false);
	const [paymentInfo, setPaymentInfo] = useState({
		table: null,
		totalAmount: 0,
		invoiceItems: [],
		loyaltyDiscount: 0, // Track loyalty discount separately
		adminDiscount: 0, // Track admin discount separately
		finalAmount: 0,
		customerInfo: null,
		selectedDiscount: null, // Selected admin discount object
		discount: 0, // Add this property to ensure backward compatibility
	});
	const [availableDiscounts, setAvailableDiscounts] = useState([]); // Store available admin discounts

	const { user } = useContext(UserContext);
	const [filter, setFilter] = useState("ALL");
	const [searchTerm, setSearchTerm] = useState("");

	const GetData = async () => {
		try {
			let id_Table = "ALL";
			let respone = await GetAllTable(id_Table);
			if (respone && respone.errCode === 0) {
				setTable(respone.table);
			} else {
				toast.error("Get Data Failed");
			}
		} catch (e) {
			toast.error("Get Data Failed");
			console.log("err:", e);
		}
	};

	// Add this function to fetch available discounts
	const fetchDiscounts = async () => {
		try {
			const response = await GetAllDiscounts();
			if (response && response.errCode === 0) {
				setAvailableDiscounts(response.discount || []);
			} else {
				console.error("Failed to load discounts:", response?.errMessage);
			}
		} catch (error) {
			console.error("Error fetching discounts:", error);
		}
	};

	// Update useEffect to fetch discounts when component mounts
	useEffect(() => {
		GetData();
		fetchDiscounts(); // Fetch available discounts
	}, []);

	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	const appTransId = queryParams.get("apptransid");
	const status = queryParams.get("status");
	const amount = queryParams.get("amount");
	const hasChecked = useRef(false);
	const tableId = queryParams.get("tableId");
	const CheckCallBackPayment = async () => {
		if (hasChecked.current || !appTransId || !status) return;
		hasChecked.current = true;

		try {
			const [response, table] = await Promise.all([
				GetInvoice(tableId),
				GetAllTable(tableId),
			]);

			if (response && response.errCode === 0) {
				const invoiceItems = response.invoice || [];
				const customerInfo = invoiceItems[0]?.Order?.Customer || null;
				const totalAmount = invoiceItems.reduce(
					(sum, item) => sum + (item.Dish.price || 0) * (item.quantity || 0),
					0
				);
				const loyaltyDiscount = totalAmount - (response.total || 0);
				const finalAmount = totalAmount - Math.max(loyaltyDiscount, 0);

				// Check for saved discount ID in URL params
				const discountId = queryParams.get("discountId");
				let selectedDiscount = null;
				let adminDiscount = 0;

				// If we have a discountId, fetch the discount details
				if (discountId) {
					try {
						// Find the discount in the available discounts
						const discountResponse = await GetAllDiscounts();
						if (discountResponse && discountResponse.errCode === 0) {
							selectedDiscount = discountResponse.discount.find(
								(d) => d.id === parseInt(discountId)
							);

							if (selectedDiscount) {
								// Calculate admin discount amount
								const priceAfterLoyalty =
									totalAmount - Math.max(loyaltyDiscount, 0);
								if (selectedDiscount.type === "Decrease") {
									adminDiscount =
										(priceAfterLoyalty * selectedDiscount.discount_percentage) /
										100;
								} else {
									adminDiscount =
										(priceAfterLoyalty * selectedDiscount.discount_percentage) /
										100;
								}
							}
						}
					} catch (err) {
						console.error("Error fetching discount:", err);
					}
				}

				setPaymentInfo({
					table: table.table[0],
					totalAmount,
					invoiceItems,
					loyaltyDiscount: Math.max(loyaltyDiscount, 0),
					adminDiscount: adminDiscount,
					discount: Math.max(loyaltyDiscount, 0), // Set discount for backward compatibility
					finalAmount,
					customerInfo,
					selectedDiscount,
				});

				if (status !== "-49") {
					const paymentStatus = await CheckPayment(appTransId);

					if (paymentStatus && paymentStatus.return_code === 1) {
						// Calculate total discount amount including both loyalty and admin discount
						const totalDiscountAmount =
							loyaltyDiscount +
							(selectedDiscount?.type === "Decrease"
								? adminDiscount
								: -adminDiscount);

						let data = {
							orderId: invoiceItems[0].orderId,
							customerId: invoiceItems[0].Order.customerId,
							discount: loyaltyDiscount / 100,
							totalAmount: amount, // This is the correct final amount after all discounts
							paymentMethod: "Bank Transfer",
							table: table.table,
							status: "Completed",
						};

						// Add discountId if it was provided
						if (discountId) {
							data.discountId = parseInt(discountId);
						}

						let update = await UpdateDiscount(data);
						const [res, respone1] = await Promise.all([
							CreateInvoice(data),
							UpdateCustomer(data),
						]);

						if (res.errCode === 0 && respone1.errCode === 0) {
							toast.success(`Payment successful via Bank Transfer`);
							try {
								const socketConnection = await createSocketConnection(
									user.token
								);

								let socketData = {
									table: table.table[0],
									status: "AVAILABLE",
								};

								await emitSocketEvent(
									socketConnection,
									"updateTable",
									socketData
								);

								socketConnection.disconnect();
							} catch (socketError) {
								console.error("Socket error:", socketError);
							}
						} else {
							toast.error(res.errMessage || "Failed to update DB");
						}
					} else {
						toast.error(
							paymentStatus.return_message || "Payment verification failed"
						);
					}
				} else {
					toast.error("Transaction failed");
				}
			} else {
				toast.error(response.errMessage || "Failed to get invoice");
			}

			const newUrl = window.location.origin + window.location.pathname;
			window.history.replaceState({}, document.title, newUrl);
		} catch (error) {
			console.error("Error in CheckPayment:", error);
			toast.error("Error while verifying payment");
		}
	};

	const createSocketConnection = (userToken) => {
		if (!userToken) {
			return Promise.reject(new Error("User token not available"));
		}

		return new Promise((resolve, reject) => {
			const newSocket = io("http://localhost:8081", {
				extraHeaders: {
					Authorization: `Bearer ${userToken}`,
				},
			});

			newSocket.on("connect", () => {
				console.log("Socket connected successfully:", newSocket.id);
				resolve(newSocket);
			});

			newSocket.on("connect_error", (err) => {
				console.error("Socket connection error:", err.message);
				reject(err);
			});

			setTimeout(() => {
				if (!newSocket.connected) {
					reject(new Error("Socket connection timeout after 5 seconds"));
				}
			}, 5000);
		});
	};

	const emitSocketEvent = (socketInstance, eventName, data) => {
		return new Promise((resolve, reject) => {
			if (!socketInstance || !socketInstance.connected) {
				reject(new Error("Socket is not connected"));
				return;
			}

			socketInstance.emit(eventName, data, (acknowledgment) => {
				if (acknowledgment && acknowledgment.success) {
					console.log(`${eventName} event acknowledged:`, acknowledgment);
					resolve(acknowledgment);
				} else {
					console.error(`${eventName} event failed:`, acknowledgment);
					reject(new Error(`Failed to emit ${eventName} event`));
				}
			});

			setTimeout(() => {
				reject(
					new Error(`Socket event ${eventName} timed out after 5 seconds`)
				);
			}, 5000);
		});
	};
	useEffect(() => {
		if (appTransId && status && tableId) {
			CheckCallBackPayment();
		}
	}, [appTransId, status, tableId]);

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
			setTable((prevTables) =>
				(prevTables ?? []).map((table) =>
					table.tableNumber === data.table.tableNumber
						? { ...table, status: data.status }
						: table
				)
			);
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
			toast.error("Please enter phone number");
		} else {
			let checkinfo = await CheckCustomer(phoneNumber);
			if (checkinfo && checkinfo.errCode === 0) {
				setCustomerInfo(checkinfo.customer);
			} else {
				toast.error(checkinfo.errMessage);
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
				toast.success("Create New Customer Success");
			} else {
				toast.error(response.errMessage);
			}
		} catch (error) {
			toast.error("Create New Customer Failed");
		}
	};

	const handleTableSelection = (table) => {
		setSelectedTable(table);
		setModalIsOpen(true);
	};

	// Update handleOpenPayment to properly separate loyalty discount
	const handleOpenPayment = async (table) => {
		try {
			const response = await GetInvoice(table.id);

			if (response && response.errCode === 0) {
				const invoiceItems = response.invoice || [];
				const customerInfo = invoiceItems[0]?.Order?.Customer || null;
				// Calculate total amount from all items
				const totalAmount = invoiceItems.reduce((sum, item) => {
					return sum + (item.Dish.price || 0) * (item.quantity || 0);
				}, 0);
				// Calculate loyalty discount (ensure it's a number)
				const loyaltyDiscount = totalAmount - (response.total || 0);

				// Calculate final amount after loyalty discount only
				const finalAmount = totalAmount - Math.max(loyaltyDiscount, 0);

				setPaymentInfo({
					table,
					totalAmount,
					invoiceItems,
					loyaltyDiscount: Math.max(loyaltyDiscount, 0), // Store loyalty discount
					adminDiscount: 0, // Reset admin discount
					finalAmount,
					customerInfo,
					selectedDiscount: null, // Reset selected discount
				});

				setPaymentModalOpen(true);
			} else {
				toast.error(response.errMessage || "Failed to get invoice");
			}
		} catch (error) {
			console.error("Error fetching invoice:", error);
			toast.error("Failed to get invoice data");
		}
	};

	const handleCloseInfo = () => {
		setCustomerInfo(null);
		setPhoneNumber("");
	};

	const handleProceedToOrder = async () => {
		if (!socket) {
			toast.error("Socket connection not established");
			return;
		}
		let data = {
			table: selectedTable,
			status: "Pending",
			customer: customerInfo || null,
		};
		socket.emit("updateTable", data);
		setModalIsOpen(false);
		handleCloseInfo();
		toast.success("Proceed to Order Success");

		setCustomerInfo(null);
		setPhoneNumber("");
		setNewCustomer({ name: "", phone: "" });
	};

	// Update handleDiscountChange to apply admin discount on top of loyalty discount
	const handleDiscountChange = (e) => {
		const selectedId = parseInt(e.target.value);

		// If no discount selected or invalid ID
		if (selectedId === 0 || isNaN(selectedId)) {
			// Keep only the loyalty discount
			setPaymentInfo({
				...paymentInfo,
				selectedDiscount: null,
				adminDiscount: 0,
				finalAmount: paymentInfo.totalAmount - paymentInfo.loyaltyDiscount,
			});
			return;
		}

		// Find the selected discount
		const selectedDiscount = availableDiscounts.find(
			(d) => d.id === selectedId
		);

		if (selectedDiscount) {
			let adminDiscountAmount = 0;
			let finalAmount = 0;

			// Calculate price after loyalty discount is applied
			const priceAfterLoyalty =
				paymentInfo.totalAmount - paymentInfo.loyaltyDiscount;

			if (selectedDiscount.type === "Decrease") {
				// For decrease type, calculate the additional discount to apply
				adminDiscountAmount =
					(priceAfterLoyalty * selectedDiscount.discount_percentage) / 100;
				finalAmount = priceAfterLoyalty - adminDiscountAmount;
			} else {
				// Increase type
				// For increase type, it adds to the price
				adminDiscountAmount =
					(priceAfterLoyalty * selectedDiscount.discount_percentage) / 100;
				finalAmount = priceAfterLoyalty + adminDiscountAmount;
			}

			setPaymentInfo({
				...paymentInfo,
				selectedDiscount: selectedDiscount,
				adminDiscount: adminDiscountAmount,
				finalAmount: finalAmount,
			});
		}
	};

	// Update handlePaymentMethod to include both discount types
	const handlePaymentMethod = async (method) => {
		if (!paymentInfo.invoiceItems[0] || !paymentInfo.invoiceItems[0].Order) {
			return;
		}

		if (method === "Cash") {
			// Calculate total discount amount (both loyalty and admin discount if applicable)
			const totalDiscountAmount =
				paymentInfo.loyaltyDiscount +
				(paymentInfo.selectedDiscount?.type === "Decrease"
					? paymentInfo.adminDiscount
					: -paymentInfo.adminDiscount);

			let data = {
				orderId: paymentInfo.invoiceItems[0].orderId,
				customerId: paymentInfo.invoiceItems[0].Order.customerId,
				discount: paymentInfo.loyaltyDiscount / 100, // Convert to appropriate format for backend
				totalAmount: paymentInfo.finalAmount, // This is already calculated correctly in the UI
				paymentMethod: method,
				table: paymentInfo.table,
				status: "Completed",
			};

			// Add discountId if an admin discount was selected
			if (paymentInfo.selectedDiscount) {
				data.discountId = paymentInfo.selectedDiscount.id;
			}

			let update = await UpdateDiscount(data);
			const [res, respone] = await Promise.all([
				CreateInvoice(data),
				UpdateCustomer(data),
			]);
			if (res && respone && respone.errCode === 0 && res.errCode === 0) {
				toast.success(`Payment successful via ${method}`);
				setPaymentModalOpen(false);
				setPaymentInfo({
					table: null,
					totalAmount: 0,
					invoiceItems: [],
					discount: 0,
					finalAmount: 0,
					customerInfo: null,
				});

				// Update table status after payment
				if (socket && paymentInfo.table) {
					let data = {
						table: paymentInfo.table,
						status: "AVAILABLE",
					};
					socket.emit("updateTable", data);
				}
			} else {
				toast.error(res.errMessage || "Payment failed");
			}
		} else if (method === "Bank Transfer") {
			try {
				// Same logic for bank transfer payment
				const totalDiscountAmount =
					paymentInfo.loyaltyDiscount +
					(paymentInfo.selectedDiscount?.type === "Decrease"
						? paymentInfo.adminDiscount
						: -paymentInfo.adminDiscount);

				let data = {
					orderId: paymentInfo.invoiceItems[0].orderId,
					customerId: paymentInfo.invoiceItems[0].Order.customerId,
					discount: paymentInfo.loyaltyDiscount / 100,
					totalAmount: paymentInfo.finalAmount,
					paymentMethod: method,
					table: paymentInfo.table,
					status: "Completed",
				};

				// Add discountId if an admin discount was selected
				if (paymentInfo.selectedDiscount) {
					data.discountId = paymentInfo.selectedDiscount.id;
				}

				let payment = await PaymentZaloPay(data);
				if (payment && payment.return_code === 1) {
					window.location.href = payment.order_url;
				} else {
					toast.error("Payment Failed");
				}
			} catch (e) {
				toast.error("Error while Payment");
			}
		}
	};

	// Add a function to filter tables
	const getFilteredTables = () => {
		if (!table || table.length === 0) return [];

		let filteredTables = [...table];

		// Filter by status
		if (filter !== "ALL") {
			filteredTables = filteredTables.filter((item) => item.status === filter);
		}

		// Filter by search term (table number)
		if (searchTerm) {
			filteredTables = filteredTables.filter((item) =>
				item.tableNumber.toString().includes(searchTerm)
			);
		}

		return filteredTables;
	};

	return (
		<div className="bg-light min-vh-100">
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
							<h1 className="text-white mb-1 fw-bold">
								Receptionist Dashboard
							</h1>
							<p className="text-white-50 mb-0">
								Manage table assignments and customer check-ins
							</p>
						</div>
						<div className="col-md-4 text-md-end">
							<div className="d-inline-block bg-white bg-opacity-10 rounded p-3">
								<p className="m-0 text-white">
									<i className="bi bi-person-badge me-2"></i>Receptionist:{" "}
									{user?.account?.fullName || "Staff"}
								</p>
							</div>
						</div>
					</div>
				</div>
			</header>

			<div className="container mb-5">
				{/* Add filter card */}
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

				<div
					className="card border-0 shadow-sm"
					style={{ borderRadius: "16px", overflow: "hidden" }}
				>
					<div className="card-header border-0 bg-white p-4">
						<div className="d-flex justify-content-between align-items-center">
							<h4 className="mb-0 fw-bold">Floor Map</h4>
							{filter !== "ALL" && (
								<span className="badge bg-primary">Filter: {filter}</span>
							)}
						</div>
					</div>
					<div className="card-body p-4">
						<div className="row g-4">
							{getFilteredTables().length > 0 ? (
								getFilteredTables().map((item, index) => (
									<div className="col-lg-3 col-md-4 col-sm-6" key={index}>
										<div
											className={`card h-100 border-0 position-relative ${
												item.status === "AVAILABLE" ? "bg-white" : "bg-light"
											}`}
											style={{
												borderRadius: "16px",
												overflow: "hidden",
												boxShadow:
													item.status === "AVAILABLE"
														? "0 8px 16px rgba(37, 117, 252, 0.15)"
														: "0 4px 12px rgba(0, 0, 0, 0.08)",
												transition: "all 0.3s ease",
											}}
										>
											<div className="position-absolute top-0 end-0 m-2">
												<span
													className={`badge ${
														item.status === "AVAILABLE"
															? "bg-success"
															: item.status === "Completed"
															? "bg-primary"
															: "bg-danger"
													}`}
												>
													{item.status}
												</span>
											</div>
											<div className="card-body p-4 text-center">
												<div className="mb-3">
													<i
														className={`bi bi-table ${
															item.status === "AVAILABLE"
																? "text-primary"
																: "text-secondary"
														}`}
														style={{ fontSize: "2.5rem" }}
													></i>
												</div>
												<h5 className="fw-bold mb-3">
													Table {item.tableNumber}
												</h5>
												{item.status === "AVAILABLE" ? (
													<button
														type="button"
														onClick={() => handleTableSelection(item)}
														className="btn btn-primary w-100 py-2"
														style={{ borderRadius: "12px" }}
													>
														<i className="bi bi-person-plus me-2"></i>
														Assign Table
													</button>
												) : item.status === "Completed" ? (
													<button
														type="button"
														onClick={() => handleOpenPayment(item)}
														className="btn btn-warning w-100 py-2"
														style={{ borderRadius: "12px" }}
													>
														<i className="bi bi-cash-stack me-2"></i>
														Payment
													</button>
												) : (
													<button
														type="button"
														className="btn btn-secondary w-100 py-2"
														style={{ borderRadius: "12px" }}
														disabled
													>
														<i className="bi bi-lock me-2"></i>
														{item.status}
													</button>
												)}
											</div>
										</div>
									</div>
								))
							) : (
								<div className="col-12 text-center py-5">
									<div className="mb-3">
										<i
											className="bi bi-exclamation-circle text-muted"
											style={{ fontSize: "3rem" }}
										></i>
									</div>
									<h5 className="text-muted">No tables found</h5>
									<p className="text-muted small">
										{filter !== "ALL"
											? `No tables with status "${filter}" found. Try changing the filter.`
											: "Please check your connection or try refreshing the page"}
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Customer Modal */}
			<CustomerModal
				show={modalIsOpen}
				close={handleCloseInfo}
				onHide={() => setModalIsOpen(false)}
				phoneNumber={phoneNumber}
				setPhoneNumber={setPhoneNumber}
				handleCheckCustomer={handleCheckCustomer}
				customerInfo={customerInfo}
				newCustomer={newCustomer}
				setNewCustomer={setNewCustomer}
				handleNewCustomer={handleNewCustomer}
				handleProceedToOrder={handleProceedToOrder}
			/>

			{/* Payment Modal */}
			<Modal
				show={paymentModalOpen}
				onHide={() => setPaymentModalOpen(false)}
				centered
				size="lg"
			>
				<Modal.Header closeButton className="border-0 pb-0">
					<Modal.Title className="fw-bold">
						<i className="bi bi-receipt me-2 text-warning"></i>
						Table {paymentInfo.table?.tableNumber} Bill
					</Modal.Title>
				</Modal.Header>
				<Modal.Body className="p-4">
					<div className="card bg-white border-0 shadow-sm mb-4">
						<div className="card-body p-3">
							<div className="d-flex align-items-center">
								<div className="me-3">
									<i
										className="bi bi-person-circle text-primary"
										style={{ fontSize: "2rem" }}
									></i>
								</div>
								<div>
									<h6 className="mb-1 fw-bold">Customer Information</h6>
									<p className="mb-0">
										<span className="fw-medium">Name:</span>{" "}
										{paymentInfo.customerInfo?.name
											? paymentInfo.customerInfo.name
											: "N/A"}
									</p>
									<p className="mb-0">
										<span className="fw-medium">Phone:</span>{" "}
										{paymentInfo.customerInfo?.phone
											? paymentInfo.customerInfo.phone
											: "N/A"}
									</p>
								</div>
							</div>
						</div>
					</div>
					<div className="card bg-white border-0 shadow-sm mb-4">
						<div className="card-header bg-light py-3">
							<div className="d-flex justify-content-between align-items-center">
								<h6 className="mb-0 fw-bold">Invoice Details</h6>
								<span className="badge bg-primary">
									Table #{paymentInfo.table?.tableNumber}
								</span>
							</div>
						</div>
						<div className="card-body p-0">
							<div className="table-responsive">
								<table className="table table-hover mb-0">
									<thead className="table-light">
										<tr>
											<th style={{ width: "50px" }}>#</th>
											<th>Dish Name</th>
											<th style={{ width: "100px" }} className="text-center">
												Quantity
											</th>
											<th style={{ width: "150px" }} className="text-end">
												Unit Price
											</th>
											<th style={{ width: "150px" }} className="text-end">
												Amount
											</th>
										</tr>
									</thead>
									<tbody>
										{paymentInfo.invoiceItems &&
										paymentInfo.invoiceItems.length > 0 ? (
											paymentInfo.invoiceItems.map((item, index) => (
												<tr key={index}>
													<td>{index + 1}</td>
													<td>
														<div className="d-flex align-items-center">
															{item.Dish.pic_link && (
																<img
																	src={item.Dish.pic_link}
																	alt={item.Dish.name}
																	className="me-2 rounded"
																	style={{
																		width: "40px",
																		height: "40px",
																		objectFit: "cover",
																	}}
																/>
															)}
															<div>
																<p className="mb-0 fw-medium">
																	{item.Dish.name}
																</p>
																<small className="text-muted">
																	{item.Dish.Category}
																</small>
															</div>
														</div>
													</td>
													<td className="text-center">{item.quantity}</td>
													<td className="text-end">
														{item.Dish.price.toLocaleString()} đ
													</td>
													<td className="text-end fw-medium">
														{(item.Dish.price * item.quantity).toLocaleString()}{" "}
														đ
													</td>
												</tr>
											))
										) : (
											<tr>
												<td colSpan="5" className="text-center py-4">
													<p className="mb-0 text-muted">No items found</p>
												</td>
											</tr>
										)}
									</tbody>
									<tfoot className="table-light">
										<tr>
											<td colSpan="4" className="text-end fw-bold">
												Subtotal:
											</td>
											<td className="text-end fw-bold">
												{(paymentInfo.totalAmount || 0).toLocaleString()} đ
											</td>
										</tr>
										{paymentInfo.loyaltyDiscount > 0 && (
											<tr>
												<td colSpan="4" className="text-end fw-bold">
													Loyalty Discount:
												</td>
												<td className="text-end fw-bold text-success">
													-{" "}
													{(paymentInfo.loyaltyDiscount || 0).toLocaleString()}{" "}
													đ
												</td>
											</tr>
										)}
										{paymentInfo.selectedDiscount && (
											<tr>
												<td colSpan="4" className="text-end fw-bold">
													{paymentInfo.selectedDiscount.type === "Decrease"
														? "Admin Discount:"
														: "Admin Surcharge:"}
												</td>
												<td
													className={`text-end fw-bold ${
														paymentInfo.selectedDiscount.type === "Decrease"
															? "text-success"
															: "text-danger"
													}`}
												>
													{paymentInfo.selectedDiscount.type === "Decrease"
														? `- ${(
																paymentInfo.adminDiscount || 0
														  ).toLocaleString()} đ`
														: `+ ${(
																paymentInfo.adminDiscount || 0
														  ).toLocaleString()} đ`}
												</td>
											</tr>
										)}
										<tr>
											<td colSpan="4" className="text-end fw-bold">
												Final Amount:
											</td>
											<td className="text-end fw-bold fs-5 text-primary">
												{(paymentInfo.finalAmount || 0).toLocaleString()} đ
											</td>
										</tr>
									</tfoot>
								</table>
							</div>
						</div>
					</div>

					{/* Updated Discount Options Card */}
					<div className="card bg-white border-0 shadow-sm mb-4">
						<div className="card-header bg-light py-3">
							<div className="d-flex justify-content-between align-items-center">
								<h6 className="mb-0 fw-bold">Discount Options</h6>
							</div>
						</div>
						<div className="card-body">
							{/* Loyalty discount section - always show */}
							<div className="mb-3 py-2 border-bottom">
								<h6 className="fw-medium mb-2">Customer Loyalty Discount</h6>
								{(paymentInfo.loyaltyDiscount || 0) > 0 ? (
									<div className="d-flex justify-content-between align-items-center">
										<span>
											<span className="badge bg-info me-2">Points</span>
											Loyalty discount applied
										</span>
										<span className="fw-bold text-success">
											- {(paymentInfo.loyaltyDiscount || 0).toLocaleString()} đ
										</span>
									</div>
								) : (
									<div className="text-muted">
										No loyalty discount available
									</div>
								)}
							</div>

							{/* Admin discount selection - below loyalty discount */}
							<div>
								<h6 className="fw-medium mb-2">Additional Admin Discount</h6>
								<Form.Group>
									<Form.Select
										onChange={handleDiscountChange}
										value={paymentInfo.selectedDiscount?.id || 0}
									>
										<option value="0">No admin discount</option>
										{availableDiscounts.map((discount) => (
											<option key={discount.id} value={discount.id}>
												{discount.type === "Increase" ? "+" : "-"}
												{discount.discount_percentage}% ({discount.type})
											</option>
										))}
									</Form.Select>
									<Form.Text className="text-muted">
										Admin discount will be applied in addition to loyalty
										discount
									</Form.Text>
								</Form.Group>

								{/* Show selected admin discount details if any */}
								{paymentInfo.selectedDiscount && (
									<div
										className={`alert ${
											paymentInfo.selectedDiscount.type === "Decrease"
												? "alert-success"
												: "alert-warning"
										} mt-3 mb-0`}
									>
										<div className="d-flex justify-content-between align-items-center">
											<div>
												<strong>
													{paymentInfo.selectedDiscount.type === "Decrease"
														? "Admin Discount"
														: "Admin Surcharge"}
													:
												</strong>{" "}
												{paymentInfo.selectedDiscount.discount_percentage}%
											</div>
											<div>
												<strong>Amount:</strong>
												{paymentInfo.selectedDiscount.type === "Decrease"
													? ` - ${(
															paymentInfo.adminDiscount || 0
													  ).toLocaleString()} đ`
													: ` + ${(
															paymentInfo.adminDiscount || 0
													  ).toLocaleString()} đ`}
											</div>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>

					<h5 className="mb-3 text-center">Select Payment Method</h5>

					<div className="row g-3">
						<div className="col-md-6">
							<Button
								variant="success"
								size="lg"
								className="w-100 py-3"
								onClick={() => handlePaymentMethod("Cash")}
							>
								<i className="bi bi-cash-coin me-2"></i>
								Pay with Cash
							</Button>
						</div>

						<div className="col-md-6">
							<Button
								variant="info"
								size="lg"
								className="w-100 py-3 text-white"
								onClick={() => handlePaymentMethod("Bank Transfer")}
							>
								<i className="bi bi-bank me-2"></i>
								Pay with Bank Transfer
							</Button>
						</div>
					</div>
				</Modal.Body>
				<Modal.Footer className="border-0 pt-0">
					<Button
						variant="outline-secondary"
						onClick={() => setPaymentModalOpen(false)}
					>
						Cancel
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
};

export default ReceptionistDashboard;
