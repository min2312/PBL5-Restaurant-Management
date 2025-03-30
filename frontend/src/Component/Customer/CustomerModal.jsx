import React from "react";
import { Modal, Button } from "react-bootstrap";

const CustomerModal = ({
	show,
	close,
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
						<div
							className="formInfor border border-secondary position-relative p-3 mb-3"
							style={{ borderWidth: "3px" }}
						>
							<i
								className="bi bi-x-circle text-danger position-absolute bg-white"
								style={{
									fontSize: "1.5rem",
									top: "-12px",
									right: "-12px",
									cursor: "pointer",
									borderRadius: "50%",
								}}
								onClick={close}
							></i>
							<p>Name: {customerInfo.name}</p>
							<p>Phone: {customerInfo.phone}</p>
							<p>Points: {customerInfo.points}</p>
						</div>
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
							className="form-control mb-3"
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
