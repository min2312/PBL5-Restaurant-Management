import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import "./ReceptionistDashboard.css";

const ReceptionistDashboard = () => {
	const [phoneNumber, setPhoneNumber] = useState("");
	const [customerInfo, setCustomerInfo] = useState(null);
	const [newCustomer, setNewCustomer] = useState({ name: "", phone: "" });
	const [table, setTable] = useState("");
	const [modalIsOpen, setModalIsOpen] = useState(false);
	const history = useHistory();

	const handleCheckCustomer = () => {
		// Logic to check if customer exists and fetch details
		// setCustomerInfo(fetchedCustomerInfo);
	};

	const handleNewCustomer = () => {
		// Logic to add new customer
		// setCustomerInfo(newCustomer);
	};

	const handleTableSelection = (table) => {
		setTable(table);
		setModalIsOpen(true);
	};

	const handleProceedToOrder = () => {
		history.push({
			pathname: "/order-menu",
			state: { customer: customerInfo || newCustomer, table },
		});
		setModalIsOpen(false);
	};

	return (
		<div className="container">
			<h1 className="my-4">Receptionist Dashboard</h1>
			<div className="rooms-section spad">
				<div className="container">
					<div className="row">
						{["Table 1", "Table 2", "Table 3"].map((item, index) => (
							<div
								className={`col-lg-4 col-md-6 mb-4 d-flex align-items-stretch`}
								key={index}
							>
								<div className="room-item">
									<img src={`table${index + 1}.jpg`} alt="" />
									<div className="ri-text">
										<h4>{item}</h4>
										<button
											type="button"
											onClick={() => handleTableSelection(item)}
											className="btn btn-primary"
										>
											Select
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
			<Modal show={modalIsOpen} onHide={() => setModalIsOpen(false)}>
				<Modal.Header closeButton>
					<Modal.Title>Customer Information</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<input
						type="text"
						className="form-control mb-2"
						placeholder="Enter phone number"
						value={phoneNumber}
						onChange={(e) => setPhoneNumber(e.target.value)}
					/>
					<Button variant="primary" onClick={handleCheckCustomer}>
						Check
					</Button>
					{customerInfo && (
						<div className="mt-3">
							<p>Name: {customerInfo.name}</p>
							<p>Points: {customerInfo.points}</p>
						</div>
					)}
					{!customerInfo && (
						<div className="mt-3">
							<input
								type="text"
								className="form-control mb-2"
								placeholder="Name"
								value={newCustomer.name}
								onChange={(e) =>
									setNewCustomer({ ...newCustomer, name: e.target.value })
								}
							/>
							<input
								type="text"
								className="form-control mb-2"
								placeholder="Phone"
								value={newCustomer.phone}
								onChange={(e) =>
									setNewCustomer({ ...newCustomer, phone: e.target.value })
								}
							/>
							<Button variant="primary" onClick={handleNewCustomer}>
								Add Customer
							</Button>
						</div>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={() => setModalIsOpen(false)}>
						Close
					</Button>
					<Button variant="success" onClick={handleProceedToOrder}>
						Proceed to Order
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
};

export default ReceptionistDashboard;
