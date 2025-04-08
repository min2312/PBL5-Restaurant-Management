import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import "./ReceptionistDashboard.css";
import CustomerModal from "../../Component/Customer/CustomerModal";
import {
	CheckCustomer,
	CreateNewCustomer,
	GetAllTable,
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

			{/* Toast Notification - You can add this to your component if needed */}
			<div
				className="position-fixed bottom-0 end-0 p-3"
				style={{ zIndex: 5 }}
				id="toast-container"
			>
				{/* Toast notifications will be added here by react-toastify */}
			</div>

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
		</div>
	);
};

export default ReceptionistDashboard;
