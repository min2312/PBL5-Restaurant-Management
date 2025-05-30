import React, { useState, useEffect, useRef, useContext } from "react";
import { UserContext } from "../../Context/UserProvider";
import { toast } from "react-toastify";
import {
	useHistory,
	useLocation,
} from "react-router-dom/cjs/react-router-dom.min";
import {
	GetAllDish,
	CreateNewOrderDetail,
	GetAllOrderDetail,
	UpdateOrderDetail,
	UpdateOrder,
	CreateInvoice,
} from "../../services/apiService";
import { io } from "socket.io-client";
import CozeChat from "../../Component/ChatBot/CozeChat";
const OrderMenu = () => {
	const location = useLocation();
	const history = useHistory();
	const { table, customer, order } = location.state || {};
	const { user } = useContext(UserContext);
	const [socket, setSocket] = useState(null);
	// Declare hooks unconditionally
	const [menuItems, setMenuItems] = useState([]);
	const [orderItems, setOrderItems] = useState({});
	const [notification, setNotification] = useState(null);
	const [appliedPoints, setAppliedPoints] = useState(0);
	const [pointsToUse, setPointsToUse] = useState(0);
	const [isOrdered, setIsOrdered] = useState(false);
	const [orderStatus, setOrderStatus] = useState({});
	const [completedOrders, setCompletedOrders] = useState([]);
	const [currentOrder, setCurrentOrder] = useState({});
	const GetDish = async () => {
		try {
			let dishID = "ALL";
			let response = await GetAllDish(dishID);
			if (response && response.errCode === 0) {
				setMenuItems(response.dish);
			} else {
				toast.error("Failed to fetch menu items");
			}
		} catch (error) {
			console.error("Error fetching menu items:", error);
			toast.error("Error fetching menu items");
		}
	};

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

	useEffect(() => {
		GetDish();
	}, []);
	// Refs for Category sections
	const categoryRefs = useRef({});

	// Get unique categories
	const categories = [...new Set(menuItems.map((item) => item.Category))];

	// Group items by Category
	const itemsByCategory = categories.reduce((acc, Category) => {
		acc[Category] = menuItems.filter((item) => item.Category === Category);
		return acc;
	}, {});

	const handleAddItem = (itemId) => {
		setOrderItems((prev) => {
			const currentCount = prev[itemId]?.quantity || 0;
			return {
				...prev,
				[itemId]: {
					...menuItems.find((item) => item.id === itemId),
					quantity: currentCount + 1,
				},
			};
		});
		// toast.success("Đã thêm món vào giỏ hàng");
	};

	const handleRemoveItem = (itemId) => {
		setOrderItems((prev) => {
			const currentCount = prev[itemId]?.quantity || 0;
			if (currentCount <= 1) {
				const newItems = { ...prev };
				delete newItems[itemId];
				return newItems;
			}
			return {
				...prev,
				[itemId]: {
					...prev[itemId],
					quantity: currentCount - 1,
				},
			};
		});
	};

	const handleQuantityChange = (itemId, newQuantity) => {
		if (newQuantity <= 0) {
			const newItems = { ...orderItems };
			delete newItems[itemId];
			setOrderItems(newItems);
			return;
		}

		setOrderItems((prev) => ({
			...prev,
			[itemId]: {
				...prev[itemId],
				quantity: newQuantity,
			},
		}));
	};

	const calculateSubtotal = () => {
		return Object.values(orderItems).reduce(
			(sum, item) => sum + item.price * item.quantity,
			0
		);
	};

	const calculateDiscount = () => {
		// Mỗi 10 điểm = 1,000 VND giảm giá
		const rawTotal = calculateGrandTotalBeforeDiscount();
		return Math.min(appliedPoints * 100, rawTotal);
	};

	const calculateTotal = () => {
		return calculateSubtotal() - calculateDiscount();
	};

	// Add new calculation functions
	const calculateCompletedOrdersTotal = () => {
		return completedOrders.reduce((sum, order) => {
			return (
				sum +
				Object.values(order.items).reduce(
					(orderSum, item) => orderSum + item.price * item.quantity,
					0
				)
			);
		}, 0);
	};

	// First calculate the raw total, then apply discount
	const calculateGrandTotalBeforeDiscount = () => {
		const newItemsTotal = calculateSubtotal();
		const completedTotal = calculateCompletedOrdersTotal();
		return completedTotal + newItemsTotal;
	};

	const calculateGrandTotal = () => {
		const rawTotal = calculateGrandTotalBeforeDiscount();
		const discount = Math.min(appliedPoints * 100, rawTotal);
		return rawTotal - discount;
	};
	// Update handleSubmitOrder to store the applied discount with each order
	const handleSubmitOrder = async () => {
		if (Object.keys(orderItems).length === 0) {
			toast.error("Vui lòng chọn ít nhất một món để đặt hàng");
			return;
		}

		try {
			const response = await CreateNewOrderDetail({
				orderId: order.id,
				dishList: Object.values(orderItems),
			});

			if (response && response.errCode === 0) {
				let data = {
					order: order,
					orderDetail: response.orderDetail,
				};
				socket.emit("sendOrder", data);
				const fetchedOrderItems = response.orderDetail
					.filter((order) => order.Order.status === "PENDING")
					.reduce((acc, order) => {
						const key = `${order.Dish.id}-${order.orderSession}`;
						acc[key] = {
							...order.Dish,
							quantity: order.quantity,
							status: order.status,
							orderSession: order.orderSession,
						};
						return acc;
					}, {});

				// Store the current subtotal without applying the discount yet
				const newOrderSubtotal = Object.values(fetchedOrderItems).reduce(
					(sum, item) => sum + item.price * item.quantity,
					0
				);

				const newOrder = {
					items: fetchedOrderItems,
					timestamp: new Date().toISOString(),
					subtotal: newOrderSubtotal, // Store raw subtotal
				};

				setCompletedOrders((prev) => [...prev, newOrder]);
				toast.success("Đặt món thành công!");
				setOrderItems({}); // Clear current order items
				setIsOrdered(true);
			} else {
				toast.error(response.errMessage || "Thêm món thất bại!");
			}
		} catch (error) {
			console.error("Error creating order details:", error);
			toast.error("Đã xảy ra lỗi khi thêm món!");
		}
	};

	const handleItemReady = async (orderId, itemId) => {
		const dishId =
			completedOrders[orderId].items[itemId].dishId ||
			completedOrders[orderId].items[itemId].id;
		const orderSession = completedOrders[orderId].items[itemId].orderSession;
		const idOrder = order.id;
		const dishName = completedOrders[orderId].items[itemId].name;
		const currentStatus = completedOrders[orderId].items[itemId].status;
		const newStatus = !currentStatus; // Toggle the status

		try {
			const response = await UpdateOrderDetail({
				dishId,
				orderSession,
				idOrder,
			});

			if (response && response.errCode === 0) {
				// Emit socket event with status update information
				if (socket) {
					socket.emit("orderStatusUpdate", {
						orderId: idOrder,
						dishId: dishId,
						dishName: dishName,
						orderSession: orderSession,
						status: newStatus,
						orderDetailId: completedOrders[orderId].items[itemId].id, // Include the orderDetail ID if available
					});
				}

				setCompletedOrders((prev) => {
					const updated = [...prev];
					const targetOrder = { ...updated[orderId] };
					const updatedItems = {
						...targetOrder.items,
						[itemId]: {
							...targetOrder.items[itemId],
							status: newStatus,
						},
					};
					updated[orderId] = {
						...targetOrder,
						items: updatedItems,
					};
					return updated;
				});
			} else {
				toast.error("Không thể cập nhật trạng thái món");
			}
		} catch (err) {
			console.error("Update error:", err);
			toast.error("Lỗi khi gửi yêu cầu cập nhật");
		}
	};

	const isAllItemsReady = (order) => {
		return Object.values(order.items).every((item) => item.status === true);
	};

	const handlePayment = async () => {
		if (!completedOrders.every((order) => isAllItemsReady(order))) {
			toast.error("Vui lòng chờ nhà bếp hoàn thành tất cả món");
			return;
		}

		// Calculate the final total with discount applied
		const finalTotal = calculateGrandTotal();

		let data = {
			order: order,
			totalAmount: finalTotal, // Use the discounted total
			table: table,
			status: "Completed",
			customer: customer || null,
			appliedPoints: appliedPoints, // Pass the points information to the API
		};

		try {
			// Run API calls concurrently
			const [res, respone] = await Promise.all([
				CreateInvoice(data),
				UpdateOrder(data),
			]);

			if (res && respone && res.errCode === 0 && respone.errCode === 0) {
				socket.emit("updateOrder", respone);
				socket.emit("updateTable", data);
				toast.success("Đã Gửi thông tin thanh toán");
				setCompletedOrders([]);
				setIsOrdered(false);
				setOrderItems({});
				setAppliedPoints(0); // Reset applied points after payment
				setPointsToUse(0); // Reset points to use after payment
				history.push("/waiter");
			} else {
				toast.error("Error Notification!");
			}
		} catch (error) {
			console.error("Error during payment:", error);
			toast.error("Đã xảy ra lỗi khi thanh toán!");
		}
	};

	const scrollToCategory = (categoryId) => {
		categoryRefs.current[categoryId]?.scrollIntoView({
			behavior: "smooth",
			block: "start",
		});
	};

	const applyPoints = () => {
		if (customer && pointsToUse > customer.points) {
			toast.error(`Khách hàng chỉ có ${customer.points} điểm`);
			return;
		}

		if (pointsToUse < 0) {
			toast.error("Số điểm sử dụng không hợp lệ");
			return;
		}

		setAppliedPoints(pointsToUse);
		toast.success(
			`Đã áp dụng ${pointsToUse} điểm, giảm ${(
				pointsToUse * 100
			).toLocaleString()}đ`
		);
	};

	useEffect(() => {
		// Ensure pointsToUse does not exceed customer points
		if (customer && pointsToUse > customer.points) {
			setPointsToUse(customer.points);
		}
	}, [pointsToUse, customer?.points]);

	const GetData = async () => {
		try {
			let response = await GetAllOrderDetail(order.id);
			if (response && response.errCode === 0) {
				const fetchedOrderItems = response.orderDetail
					.filter((order) => order.Order.status === "PENDING")
					.reduce((acc, order) => {
						const key = `${order.Dish.id}-${order.orderSession}`;
						acc[key] = {
							...order.Dish,
							quantity: order.quantity,
							status: order.status,
							orderSession: order.orderSession,
						};
						return acc;
					}, {});

				if (Object.keys(fetchedOrderItems).length === 0) {
					return;
				}

				// Calculate the subtotal for existing orders
				const orderSubtotal = Object.values(fetchedOrderItems).reduce(
					(sum, item) => sum + item.price * item.quantity,
					0
				);

				const newOrder = {
					items: fetchedOrderItems,
					timestamp: new Date().toISOString(),
					subtotal: orderSubtotal, // Store raw subtotal
				};

				setCompletedOrders((prev) => {
					const isDuplicate = prev.some(
						(existingOrder) =>
							JSON.stringify(existingOrder.items) ===
							JSON.stringify(newOrder.items)
					);
					if (isDuplicate) {
						return prev; // Skip adding duplicate order
					}
					return [...prev, newOrder];
				});
			} else {
				toast.error("Failed to fetch order details");
			}
		} catch (error) {
			console.error("Error fetching order details:", error);
			toast.error("Error fetching order details");
		}
	};

	useEffect(() => {
		if (order && order.id) {
			GetData();
		}
	}, []);

	// Conditional rendering inside the return statement
	if (!table || !customer) {
		return <div>No table or customer information provided</div>;
	}

	return (
		<div className="bg-light min-vh-100">
			<div className="chatBot" style={{ position: "fixed", zIndex: 1000 }}>
				<CozeChat />
			</div>
			{/* Header */}
			<header
				className="bg-gradient-primary py-4 mb-4"
				style={{
					background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
					boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
				}}
			>
				<div className="container">
					<div className="row align-items-center">
						<div className="col-md-6">
							<h1 className="text-white mb-1 fw-bold">Thực Đơn</h1>
							<p className="text-white-50 mb-0">
								Chọn món ăn yêu thích của bạn
							</p>
						</div>
						<div className="col-md-6 text-md-end">
							<div className="d-inline-block bg-white bg-opacity-10 rounded p-3">
								<p className="m-0 text-white">
									<i className="bi bi-table me-2"></i>Bàn: {table.tableNumber}
								</p>
								<p className="m-0 text-white">
									<i className="bi bi-person me-2"></i>Phục vụ:{" "}
									{user.account.fullName}
								</p>
							</div>
						</div>
					</div>
				</div>
			</header>

			<div className="container">
				<div className="row g-4">
					{/* Left Column - Menu */}
					<div className="col-lg-8">
						{/* Quick Category Navigation */}
						<div
							className="d-flex flex-wrap pb-2 mb-4"
							style={{
								scrollbarWidth: "none",
								msOverflowStyle: "none",
								gap: "10px", // Add spacing between buttons
							}}
						>
							{categories.map((Category) => (
								<button
									key={Category}
									className="btn text-nowrap px-4 py-2"
									style={{
										borderRadius: "30px",
										backgroundColor: "#fff",
										boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
										color: "#333",
										fontWeight: "600",
										whiteSpace: "nowrap",
										fontSize: "0.9rem",
										border: "1px solid rgba(0,0,0,0.05)",
									}}
									onClick={() => scrollToCategory(Category)}
								>
									{Category}
								</button>
							))}
						</div>

						{/* Menu Items */}
						{Object.entries(itemsByCategory).map(([Category, items]) => (
							<div
								key={Category}
								className="mb-5 bg-white rounded-lg shadow-sm p-4"
								ref={(el) => (categoryRefs.current[Category] = el)}
								style={{ borderRadius: "16px" }}
							>
								<h3 className="border-bottom pb-3 mb-4 d-flex align-items-center">
									<span className="bg-primary bg-opacity-10 text-primary p-2 me-3 rounded-circle">
										<i
											className={
												Category === "Main Course"
													? "bi bi-egg-fried"
													: Category === "Appetizer"
													? "bi bi-cup-straw"
													: Category === "Drink"
													? "bi bi-cup-hot"
													: "bi bi-cake"
											}
										></i>
									</span>
									{Category}
								</h3>
								<div className="row g-4">
									{items.map((item) => (
										<div className="col-md-6 col-lg-4" key={item.id}>
											<div
												className="card h-100 border-0"
												style={{
													borderRadius: "16px",
													overflow: "hidden",
													boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
													transition: "all 0.3s ease",
												}}
												onMouseOver={(e) => {
													e.currentTarget.style.transform = "translateY(-8px)";
													e.currentTarget.style.boxShadow =
														"0 12px 20px rgba(0,0,0,0.1)";
												}}
												onMouseOut={(e) => {
													e.currentTarget.style.transform = "translateY(0)";
													e.currentTarget.style.boxShadow =
														"0 4px 15px rgba(0,0,0,0.06)";
												}}
											>
												<div className="position-relative">
													<img
														src={item.pic_link}
														className="card-img-top"
														alt={item.name}
														style={{ height: "160px", objectFit: "cover" }}
													/>
													<div
														className="position-absolute bottom-0 end-0 m-3 px-3 py-1 rounded-pill fw-bold"
														style={{
															background: "rgba(255, 255, 255, 0.9)",
															backdropFilter: "blur(4px)",
															fontSize: "0.9rem",
															color: "#333",
														}}
													>
														{item.price.toLocaleString()}đ
													</div>
												</div>
												<div className="card-body">
													<h5 className="card-title fw-bold mb-1">
														{item.name}
													</h5>

													{!orderItems[item.id] ? (
														<button
															className="btn btn-primary w-100 py-2"
															style={{ borderRadius: "12px" }}
															onClick={() => handleAddItem(item.id)}
														>
															<i className="bi bi-plus-circle me-2"></i>Thêm vào
															giỏ
														</button>
													) : (
														<div className="d-flex align-items-center justify-content-between bg-light p-2 rounded-3">
															<button
																className="btn btn-primary text-white rounded-circle"
																style={{
																	width: "38px",
																	height: "38px",
																	padding: "0",
																}}
																onClick={() => handleRemoveItem(item.id)}
															>
																<i className="bi bi-dash"></i>
															</button>
															<span className="fw-bold">
																{orderItems[item.id].quantity}
															</span>
															<button
																className="btn btn-primary text-white rounded-circle"
																style={{
																	width: "38px",
																	height: "38px",
																	padding: "0",
																}}
																onClick={() => handleAddItem(item.id)}
															>
																<i className="bi bi-plus"></i>
															</button>
														</div>
													)}
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						))}
					</div>

					{/* Right Column - Order Summary */}
					<div className="col-lg-4">
						<div
							className="card border-0 sticky-top mb-4"
							style={{
								top: "20px",
								borderRadius: "16px",
								boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
								overflow: "hidden",
								maxHeight: "80vh", // Limit height for independent scrolling
								overflowY: "auto", // Enable vertical scrolling
							}}
						>
							<div
								className="card-header border-0 p-4"
								style={{
									background:
										"linear-gradient(135deg, #3a8ffe 0%, #0759db 100%)",
								}}
							>
								<h4 className="mb-1 text-white fw-bold">Đơn Hàng</h4>
								<p className="text-white-50 mb-0">Chi tiết đơn hàng của bạn</p>
							</div>

							<div className="card-body p-4">
								{/* Customer Info */}
								<div className="mb-4">
									<div className="d-flex justify-content-between align-items-center mb-3">
										<h5 className="fw-bold mb-0">Thông Tin Khách Hàng</h5>
										<span className="badge bg-primary bg-opacity-10 text-primary p-2">
											<i className="bi bi-coin me-1"></i>
											{customer.points} điểm
										</span>
									</div>
									<div className="bg-light p-3 rounded-3">
										<div className="mb-2">
											<i className="bi bi-person-circle me-2 text-primary"></i>
											<strong>Khách hàng:</strong> {customer.name}
										</div>
										<div>
											<i className="bi bi-telephone me-2 text-primary"></i>
											<strong>Điện thoại:</strong> {customer.phone}
										</div>
									</div>
								</div>

								<hr />

								{/* Points Redemption */}
								<div className="mb-4">
									<h5 className="fw-bold mb-3">Sử Dụng Điểm</h5>
									<div className="bg-light p-3 rounded-3">
										<div className="mb-2 text-muted small">
											<i className="bi bi-info-circle me-1"></i>
											10 điểm = 1,000đ giảm giá
										</div>
										<div className="d-flex gap-2">
											<input
												type="number"
												className="form-control"
												placeholder="Nhập số điểm"
												value={pointsToUse}
												onChange={(e) =>
													setPointsToUse(parseInt(e.target.value) || 0)
												}
												max={customer.points}
												min="0"
											/>
											<button
												className="btn btn-outline-primary"
												onClick={applyPoints}
											>
												Áp dụng
											</button>
										</div>
										{appliedPoints > 0 && (
											<div className="mt-2 text-success">
												<i className="bi bi-check-circle me-1"></i>
												Đã áp dụng {appliedPoints} điểm
											</div>
										)}
									</div>
								</div>

								{/* Order Items */}
								<div className="mb-4">
									<h5 className="fw-bold mb-3">Món Đã Chọn</h5>

									{/* Completed Orders */}
									{completedOrders.map((order, orderIndex) => (
										<div key={orderIndex} className="mb-4">
											<div className="d-flex justify-content-between align-items-center mb-2">
												<h6 className="mb-0">Đơn hàng #{orderIndex + 1}</h6>
												<small className="text-muted">
													{new Date(order.timestamp).toLocaleTimeString()}
												</small>
											</div>
											<div className="table-responsive">
												<table className="table table-borderless">
													<thead className="table-light">
														<tr>
															<th>Món</th>
															<th className="text-center">SL</th>
															<th className="text-end">Tổng</th>
														</tr>
													</thead>
													<tbody>
														{Object.values(order.items).map((item, index) => (
															<tr key={index}>
																<td>{item.name}</td>
																<td className="text-center">{item.quantity}</td>
																<td className="text-end position-relative">
																	{(
																		item.price * item.quantity
																	).toLocaleString()}
																	đ
																	<div className="form-check d-inline-block ms-2">
																		<input
																			className="form-check-input border border-primary"
																			type="checkbox"
																			checked={item.status || false}
																			onChange={() =>
																				handleItemReady(
																					orderIndex,
																					`${item.id}-${item.orderSession}`
																				)
																			}
																			style={{ width: "20px", height: "20px" }}
																		/>
																	</div>
																</td>
															</tr>
														))}
													</tbody>
												</table>
											</div>
										</div>
									))}

									{/* Current Order Items */}
									{Object.values(orderItems).length > 0 && (
										<div className="table-responsive">
											<table className="table table-borderless">
												<thead className="table-light">
													<tr>
														<th>Món mới</th>
														<th className="text-center">SL</th>
														<th className="text-end">Tổng</th>
													</tr>
												</thead>
												<tbody>
													{Object.values(orderItems).map((item) => (
														<tr key={item.id}>
															<td>{item.name}</td>
															<td>
																<div className="d-flex align-items-center justify-content-center">
																	<button
																		className="btn btn-sm btn-light rounded-circle"
																		onClick={() => handleRemoveItem(item.id)}
																	>
																		<i className="bi bi-dash"></i>
																	</button>
																	<input
																		type="number"
																		className="form-control form-control-sm mx-1 text-center"
																		style={{ width: "40px" }}
																		value={item.quantity}
																		onChange={(e) =>
																			handleQuantityChange(
																				item.id,
																				parseInt(e.target.value) || 0
																			)
																		}
																	/>
																	<button
																		className="btn btn-sm btn-light rounded-circle"
																		onClick={() => handleAddItem(item.id)}
																	>
																		<i className="bi bi-plus"></i>
																	</button>
																</div>
															</td>
															<td className="text-end">
																{(item.price * item.quantity).toLocaleString()}đ
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									)}

									{completedOrders.length === 0 &&
										Object.values(orderItems).length === 0 && (
											<div className="text-center py-4 bg-light rounded-3">
												<i
													className="bi bi-basket text-muted"
													style={{ fontSize: "2rem" }}
												></i>
												<p className="text-muted mb-0">Giỏ hàng trống</p>
											</div>
										)}
								</div>

								{/* Price Summary */}
								<div className="bg-light p-3 rounded-3 mb-3">
									{completedOrders.length > 0 && (
										<div className="d-flex justify-content-between mb-2">
											<span>Tổng đơn đã đặt:</span>
											<span>
												{calculateCompletedOrdersTotal().toLocaleString()}đ
											</span>
										</div>
									)}

									{Object.values(orderItems).length > 0 && (
										<div className="d-flex justify-content-between mb-2">
											<span>Món mới:</span>
											<span>{calculateSubtotal().toLocaleString()}đ</span>
										</div>
									)}

									{appliedPoints > 0 && (
										<div className="d-flex justify-content-between mb-2 text-success">
											<span>
												<i className="bi bi-tags me-1"></i>
												Giảm giá ({appliedPoints} điểm):
											</span>
											<span>-{calculateDiscount().toLocaleString()}đ</span>
										</div>
									)}

									<div className="d-flex justify-content-between fw-bold pt-2 border-top mt-2">
										<span>Tổng cộng:</span>
										<span className="text-primary fs-5">
											{calculateGrandTotal().toLocaleString()}đ
										</span>
									</div>
								</div>

								{/* Action Buttons */}
								<div className="card-footer bg-white p-4 border-0">
									<div className="d-flex gap-2">
										{Object.keys(orderItems).length > 0 && (
											<button
												className="btn btn-success flex-grow-1 py-3"
												style={{ borderRadius: "12px" }}
												onClick={handleSubmitOrder}
											>
												<i className="bi bi-check-circle me-2"></i>
												Xác nhận đặt món
											</button>
										)}
										{completedOrders.length > 0 && (
											<button
												className="btn btn-primary flex-grow-1 py-3"
												style={{ borderRadius: "12px" }}
												onClick={handlePayment}
												disabled={
													!completedOrders.every((order) =>
														isAllItemsReady(order)
													) || Object.keys(orderItems).length > 0
												}
											>
												<i className="bi bi-credit-card me-2"></i>
												Thanh toán
											</button>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OrderMenu;
