import React from "react";
import { useLocation } from "react-router-dom";

const OrderMenu = () => {
	const location = useLocation();
	const { customer, table } = location.state;

	return (
		<div>
			<h1>Order Menu for {table}</h1>
			<div>
				<h2>Customer Information</h2>
				<p>Name: {customer.name}</p>
				<p>Phone: {customer.phone}</p>
			</div>
			<div>
				<h2>Menu Items</h2>
				<ul>
					{/* Assuming menuItems is fetched or passed as props */}
					{/* {menuItems.map((item) => (
						<li key={item.id}>
							{item.name} - ${item.price}
							<button>Add to Order</button>
						</li>
					))} */}
				</ul>
			</div>
		</div>
	);
};

export default OrderMenu;
