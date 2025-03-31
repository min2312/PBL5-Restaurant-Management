import React, { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { UserContext } from "../../Context/UserProvider";
// import { GetMenuItems } from "../../services/apiService";

const OrderMenu = () => {
	const location = useLocation();
	const { table, customer } = location.state || {};
	const [menuItems, setMenuItems] = useState([]);
	const [selectedItems, setSelectedItems] = useState([]);
	const { user } = useContext(UserContext);
	// useEffect(() => {
	// 	const fetchMenuItems = async () => {
	// 		try {
	// 			const response = await GetMenuItems();
	// 			if (response && response.errCode === 0) {
	// 				setMenuItems(response.menuItems);
	// 			} else {
	// 				toast.error("Failed to fetch menu items");
	// 			}
	// 		} catch (error) {
	// 			toast.error("Error fetching menu items");
	// 		}
	// 	};
	// 	fetchMenuItems();
	// }, []);

	const handleSelectItem = (item) => {
		setSelectedItems((prev) => [...prev, item]);
	};

	const handleRemoveItem = (itemId) => {
		setSelectedItems((prev) => prev.filter((item) => item.id !== itemId));
	};

	const handleSubmitOrder = () => {
		if (selectedItems.length === 0) {
			toast.error("Please select at least one item to order");
			return;
		}
		// Submit order logic here
		toast.success("Order submitted successfully!");
	};

	if (!table || !customer) {
		return <div>No table or customer information provided</div>;
	}

	return (
		<div className="container">
			<h1 className="my-4">Order Menu</h1>
			<div className="mb-4">
				<h4>Customer Information</h4>
				<p>Name: {customer.name}</p>
				<p>Phone: {customer.phone}</p>
				<p>Table: {table.tableNumber}</p>
				<p>Service Staff: {user.account.fullName}</p>
			</div>
			<div className="mb-4">
				<h4>Menu Items</h4>
				<div className="row">
					{menuItems.map((item) => (
						<div
							className="col-lg-4 col-md-6 mb-4 d-flex align-items-stretch"
							key={item.id}
						>
							<div className="card">
								<div className="card-body text-center">
									<h5 className="card-title">{item.name}</h5>
									<p className="card-text">Price: ${item.price}</p>
									<button
										className="btn btn-primary"
										onClick={() => handleSelectItem(item)}
									>
										Add to Order
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
			<div className="mb-4">
				<h4>Selected Items</h4>
				<ul className="list-group">
					{selectedItems.map((item) => (
						<li
							className="list-group-item d-flex justify-content-between align-items-center"
							key={item.id}
						>
							{item.name} - ${item.price}
							<button
								className="btn btn-danger btn-sm"
								onClick={() => handleRemoveItem(item.id)}
							>
								Remove
							</button>
						</li>
					))}
				</ul>
			</div>
			<button className="btn btn-success" onClick={handleSubmitOrder}>
				Submit Order
			</button>
		</div>
	);
};

export default OrderMenu;
