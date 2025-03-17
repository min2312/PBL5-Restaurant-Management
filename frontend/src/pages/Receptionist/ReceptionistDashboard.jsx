import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import "./ReceptionistDashboard.css";

const ReceptionistDashboard = () => {
	const [phoneNumber, setPhoneNumber] = useState("");
	const [customerInfo, setCustomerInfo] = useState(null);
	const [newCustomer, setNewCustomer] = useState({ name: "", phone: "" });
	const [table, setTable] = useState("");
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
	};

	const handleProceedToOrder = () => {
		history.push({
			pathname: "/order-menu",
			state: { customer: customerInfo || newCustomer, table },
		});
	};

	return (
		<div className="container">
			<h1 className="my-4">Receptionist Dashboard</h1>
			<div className="card mb-4">
				<div className="card-header">Table Selection</div>
				<div className="card-body">
					<div className="table-selection">
						<img
							src="table1.jpg"
							alt="Table 1"
							className={`table-img ${table === "Table 1" ? "selected" : ""}`}
							onClick={() => handleTableSelection("Table 1")}
						/>
						<img
							src="table2.jpg"
							alt="Table 2"
							className={`table-img ${table === "Table 2" ? "selected" : ""}`}
							onClick={() => handleTableSelection("Table 2")}
						/>
						{/* Add more table images as needed */}
					</div>
				</div>
			</div>
			{table && (
				<div className="card mb-4">
					<div className="card-header">Customer Information</div>
					<div className="card-body">
						<input
							type="text"
							className="form-control mb-2"
							placeholder="Enter phone number"
							value={phoneNumber}
							onChange={(e) => setPhoneNumber(e.target.value)}
						/>
						<button className="btn btn-primary" onClick={handleCheckCustomer}>
							Check
						</button>
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
								<button className="btn btn-primary" onClick={handleNewCustomer}>
									Add Customer
								</button>
							</div>
						)}
						<button
							className="btn btn-success mt-3"
							onClick={handleProceedToOrder}
						>
							Proceed to Order
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default ReceptionistDashboard;
