import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
// import "./OrderMenu.css";

const Waiter = () => {
	const [tables, setTables] = useState([]);
	const [selectedTable, setSelectedTable] = useState(null);
	const [modalIsOpen, setModalIsOpen] = useState(false);
	const history = useHistory();

	useEffect(() => {
		// Fetch tables with customer information from the server
		const fetchTables = async () => {
			const response = await fetch("/api/tables");
			const data = await response.json();
			setTables(data);
		};

		fetchTables();
	}, []);

	const handleTableSelection = (table) => {
		setSelectedTable(table);
		setModalIsOpen(true);
	};

	const handleProceedToOrder = async () => {
		// Update table status on the server
		await fetch(`/api/tables/${selectedTable.name}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ status: "occupied" }),
		});

		history.push({
			pathname: "/order",
			state: { customer: selectedTable.customer, table: selectedTable.name },
		});
		setModalIsOpen(false);
	};

	return (
		<div className="container">
			<h1 className="my-4">Waiter DashBoard</h1>
			<div className="rooms-section spad">
				<div className="container">
					<div className="row">
						{tables.map((table, index) => (
							<div
								className={`col-lg-4 col-md-6 mb-4 d-flex align-items-stretch`}
								key={index}
							>
								<div className="room-item">
									<img src={`table${index + 1}.jpg`} alt="" />
									<div className="ri-text">
										<h4>{table.name}</h4>
										{table.customer ? (
											<button
												type="button"
												onClick={() => handleTableSelection(table)}
												className="btn btn-primary"
											>
												Select
											</button>
										) : (
											<button
												type="button"
												className="btn btn-secondary"
												disabled
											>
												Not Available
											</button>
										)}
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
					{selectedTable && selectedTable.customer && (
						<div>
							<p>Name: {selectedTable.customer.name}</p>
							<p>Phone: {selectedTable.customer.phone}</p>
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

export default Waiter;
