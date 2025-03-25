import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import "./ReceptionistDashboard.css";
import CustomerModal from "../../Component/Customer/CustomerModal";
import { GetAllTable } from "../../services/apiService";
import { toast } from "react-toastify";

const ReceptionistDashboard = () => {
	const [phoneNumber, setPhoneNumber] = useState("");
	const [customerInfo, setCustomerInfo] = useState(null);
	const [newCustomer, setNewCustomer] = useState({ name: "", phone: "" });
	const [table, setTable] = useState("");
	const [modalIsOpen, setModalIsOpen] = useState(false);
	const history = useHistory();
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
	const handleCheckCustomer = () => {
		// Logic to check if customer exists and fetch details
		// setCustomerInfo(fetchedCustomerInfo);
	};

	const handleNewCustomer = () => {
		// Logic to add new customer
		// setCustomerInfo(newCustomer);
	};

	const handleTableSelection = (table) => {
		setModalIsOpen(true);
	};

	const handleProceedToOrder = async () => {
		// Update table status on the server
		await fetch(`/api/tables/${table}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ customer: customerInfo || newCustomer }),
		});
		setModalIsOpen(false);
	};

	return (
		<div className="container">
			<h1 className="my-4">Receptionist Dashboard</h1>
			<div className="rooms-section spad">
				<div className="container">
					<div className="row">
						{table &&
							table.length > 0 &&
							table.map((item, index) => (
								<div
									className={`col-lg-4 col-md-6 mb-3 d-flex align-items-stretch`}
									key={index}
								>
									<div className="room-item text-center">
										<i className="bi bi-table" style={{ fontSize: "2rem" }}></i>{" "}
										<h4>Table {item.tableNumber}</h4>
										<button
											type="button"
											onClick={() => handleTableSelection(item.tableNumber)}
											className="btn btn-primary mt-2"
										>
											Select
										</button>
									</div>
								</div>
							))}
					</div>
				</div>
			</div>
			<CustomerModal
				show={modalIsOpen}
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
