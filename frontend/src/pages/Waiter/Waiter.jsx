import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import {
	CheckCustomer,
	CreateNewCustomer,
	GetAllTable,
} from "../../services/apiService";
import { toast } from "react-toastify";
import CustomerModal from "../../Component/Customer/CustomerModal";
import { UserContext } from "../../Context/UserProvider";
import { io } from "socket.io-client";
// import "./OrderMenu.css";

const Waiter = () => {
	const [phoneNumber, setPhoneNumber] = useState("");
	const [customerInfo, setCustomerInfo] = useState(null);
	const [newCustomer, setNewCustomer] = useState({ name: "", phone: "" });
	const [tables, setTables] = useState([]);
	const [selectedTable, setSelectedTable] = useState(null);
	const [modalIsOpen, setModalIsOpen] = useState(false);
	const [socket, setSocket] = useState(null);
	const { user } = useContext(UserContext);
	const history = useHistory();

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
			setCustomerInfo(data.customer);
			setTables((prevTables) =>
				prevTables.map((table) =>
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

	const handleCloseInfo = () => {
		setCustomerInfo(null);
		setPhoneNumber("");
	};

	const handleTableSelection = (table) => {
		setSelectedTable(table);
		setModalIsOpen(true);
	};

	const handleProceedToOrder = async () => {
		if (!socket) {
			toast.error("Socket connection not established");
			return;
		}
		let data = {
			table: selectedTable,
			status: "Occupied",
			customer: customerInfo || null,
		};
		socket.emit("updateTable", data);
		if (customerInfo) {
			history.push("/order-menu", {
				table: selectedTable,
				customer: customerInfo,
			});
		} else {
			toast.error("Please select a customer");
		}
	};

	return (
		<div className="container">
			<h1 className="my-4">Waiter DashBoard</h1>
			<div className="rooms-section spad">
				<div className="container">
					<div className="row">
						{tables &&
							tables.length > 0 &&
							tables.map((table, index) => (
								<div
									className={`col-lg-4 col-md-6 mb-4 d-flex align-items-stretch`}
									key={index}
								>
									<div className="room-item text-center">
										<i
											className="bi bi-table text-secondary"
											style={{ fontSize: "2rem" }}
										></i>{" "}
										<div className="ri-text">
											<h4>Table {table.tableNumber}</h4>
											{table.status === "AVAILABLE" ? (
												<button
													type="button"
													className="btn btn-secondary"
													disabled
												>
													Not Available
												</button>
											) : (
												<button
													type="button"
													onClick={() => handleTableSelection(table)}
													className="btn btn-primary"
												>
													Select
												</button>
											)}
										</div>
									</div>
								</div>
							))}
					</div>
				</div>
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

export default Waiter;
