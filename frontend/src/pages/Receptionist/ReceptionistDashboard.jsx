import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import "./ReceptionistDashboard.css";
import CustomerModal from "../../Component/Customer/CustomerModal";
import {
	CheckCustomer,
	CreateInvoice,
	CreateNewCustomer,
	GetAllTable,
	GetInvoice,
	UpdateCustomer,
	UpdateDiscount,
} from "../../services/apiService";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { UserContext } from "../../Context/UserProvider";

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
		discount: 0,
		finalAmount: 0,
	});
	const history = useHistory();
	const { user } = useContext(UserContext);

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

	useEffect(() => {
		GetData();
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

	const handleOpenPayment = async (table) => {
		try {
			const response = await GetInvoice(table.id);

			if (response && response.errCode === 0) {
				const invoiceItems = response.invoice || [];

				// Calculate total amount from all items
				const totalAmount = invoiceItems.reduce((sum, item) => {
					return sum + (item.Dish.price || 0) * (item.quantity || 0);
				}, 0);
				// Calculate discount (ensure it's a number)
				const discount = totalAmount - (response.total || 0);

				// Calculate final amount after discount
				const finalAmount = totalAmount - Math.max(discount, 0);

				setPaymentInfo({
					table,
					totalAmount,
					invoiceItems,
					discount: Math.max(discount, 0), // Ensure discount is non-negative
					finalAmount,
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

	console.log("paymentInfo", paymentInfo);

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
	const handlePaymentMethod = async (method) => {
		if (!paymentInfo.invoiceItems[0] || !paymentInfo.invoiceItems[0].Order) {
			return;
		}

		let data = {
			orderId: paymentInfo.invoiceItems[0].orderId,
			customerId: paymentInfo.invoiceItems[0].Order.customerId,
			discount: paymentInfo.discount / 100,
			totalAmount: paymentInfo.totalAmount,
			paymentMethod: method,
			table: table,
			status: "Completed",
		};
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
				<div
					className="card border-0 shadow-sm"
					style={{ borderRadius: "16px", overflow: "hidden" }}
				>
					<div className="card-header border-0 bg-white p-4">
						<h4 className="mb-0 fw-bold">Floor Map</h4>
					</div>
					<div className="card-body p-4">
						<div className="row g-4">
							{table && table.length > 0 ? (
								table.map((item, index) => (
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
										Please check your connection or try refreshing the page
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
												{paymentInfo.totalAmount.toLocaleString()} đ
											</td>
										</tr>
										<tr>
											<td colSpan="4" className="text-end fw-bold">
												Discount:
											</td>
											<td className="text-end fw-bold text-success">
												- {paymentInfo.discount.toLocaleString()} đ
											</td>
										</tr>
										<tr>
											<td colSpan="4" className="text-end fw-bold">
												Final Amount:
											</td>
											<td className="text-end fw-bold fs-5 text-primary">
												{(
													paymentInfo.totalAmount - paymentInfo.discount
												).toLocaleString()}{" "}
												đ
											</td>
										</tr>
									</tfoot>
								</table>
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
