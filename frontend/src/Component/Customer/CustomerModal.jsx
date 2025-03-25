import React from "react";
import { Modal, Button } from "react-bootstrap";

const CustomerModal = ({
	show,
	onHide,
	phoneNumber,
	setPhoneNumber,
	handleCheckCustomer,
	customerInfo,
	newCustomer,
	setNewCustomer,
	handleNewCustomer,
	handleProceedToOrder,
}) => {
	return (
		<Modal show={show} onHide={onHide}>
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
				<Button variant="secondary" onClick={onHide}>
					Close
				</Button>
				<Button variant="success" onClick={handleProceedToOrder}>
					Proceed to Order
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default CustomerModal;
