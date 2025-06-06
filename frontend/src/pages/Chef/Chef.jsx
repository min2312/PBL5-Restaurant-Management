import React, {
	useState,
	useEffect,
	useContext,
	useCallback,
	useMemo,
} from "react";
import { UserContext } from "../../Context/UserProvider";
import { toast } from "react-toastify";
import { GetAllOrderPeding } from "../../services/apiService";
import io from "socket.io-client";

const Chef = () => {
	const { user } = useContext(UserContext);
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [currentTime, setCurrentTime] = useState(new Date());
	const [socket, setSocket] = useState(null);
	// Fetch orders data from API
	const fetchOrders = async () => {
		setLoading(true);
		try {
			let respone = await GetAllOrderPeding();
			let mockOrdersData = respone.order;
			// 		id: 123,
			// 		tableId: 1,
			// 		Customer: {
			// 			id: 1,
			// 			name: "Nguyễn Văn A",
			// 		},
			// 		Table: {
			// 			id: 1,
			// 			name: "Bàn 1",
			// 		},
			// 		createdAt: new Date().toISOString(),
			// 		OrderDetails: [
			// 			{
			// 				id: 1,
			// 				dishId: 101,
			// 				quantity: 2,
			// 				status: false,
			// 				Dish: {
			// 					name: "Phở bò",
			// 					Category: "Main Course",
			// 				},
			// 			},
			// 			{
			// 				id: 2,
			// 				dishId: 102,
			// 				quantity: 1,
			// 				status: false,
			// 				Dish: {
			// 					name: "Gỏi cuốn",
			// 					Category: "Appetizer",
			// 				},
			// 			},
			// 			{
			// 				id: 3,
			// 				dishId: 103,
			// 				quantity: 2,
			// 				status: true,
			// 				Dish: {
			// 					name: "Nước mía",
			// 					Category: "Drink",
			// 				},
			// 			},
			// 		],
			// 	},
			// 	{
			// 		id: 124,
			// 		tableId: 3,
			// 		Customer: {
			// 			id: 2,
			// 			name: "Trần Thị B",
			// 		},
			// 		Table: {
			// 			id: 3,
			// 			name: "Bàn 3",
			// 		},
			// 		createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
			// 		OrderDetails: [
			// 			{
			// 				id: 4,
			// 				dishId: 104,
			// 				quantity: 1,
			// 				status: false,
			// 				Dish: {
			// 					name: "Cơm tấm",
			// 					Category: "Main Course",
			// 				},
			// 			},
			// 			{
			// 				id: 5,
			// 				dishId: 105,
			// 				quantity: 2,
			// 				status: true,
			// 				Dish: {
			// 					name: "Chả giò",
			// 					Category: "Appetizer",
			// 				},
			// 			},
			// 			{
			// 				id: 6,
			// 				dishId: 106,
			// 				quantity: 3,
			// 				status: true,
			// 				Dish: {
			// 					name: "Trà đá",
			// 					Category: "Drink",
			// 				},
			// 			},
			// 		],
			// 	},
			// 	{
			// 		id: 125,
			// 		tableId: 5,
			// 		Customer: {
			// 			id: 3,
			// 			name: "Lê Văn C",
			// 		},
			// 		Table: {
			// 			id: 5,
			// 			name: "Bàn 5",
			// 		},
			// 		createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
			// 		OrderDetails: [
			// 			{
			// 				id: 7,
			// 				dishId: 107,
			// 				quantity: 1,
			// 				status: false,
			// 				Dish: {
			// 					name: "Bún bò Huế",
			// 					Category: "Main Course",
			// 				},
			// 			},
			// 			{
			// 				id: 8,
			// 				dishId: 108,
			// 				quantity: 1,
			// 				status: false,
			// 				Dish: {
			// 					name: "Bánh xèo",
			// 					Category: "Main Course",
			// 				},
			// 			},
			// 			{
			// 				id: 9,
			// 				dishId: 109,
			// 				quantity: 2,
			// 				status: true,
			// 				Dish: {
			// 					name: "Cà phê sữa đá",
			// 					Category: "Drink",
			// 				},
			// 			},
			// 		],
			// 	},
			// ];

			// Filter out orders where all items are completed
			const filteredOrders = mockOrdersData.filter((order) =>
				order.OrderDetails.some((item) => item.status === false)
			);

			setOrders(filteredOrders);
			setLoading(false);
			toast.success("Đã tải danh sách đơn hàng");
		} catch (error) {
			console.error("Error fetching orders:", error);
			toast.error("Lỗi khi tải danh sách đơn hàng");
			setLoading(false);
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

		newSocket.on("receiveOrder", (data) => {
			console.log("Received order data:", data);
			// Map socket data to expected order structure if needed
			if (data.order && data.orderDetail) {
				const newOrder = { ...data.order, OrderDetails: data.orderDetail };
				setOrders((prevOrders) => [...prevOrders, newOrder]);
			} else {
				setOrders((prevOrders) => [...prevOrders, data]);
			}
		});

		// Update orderStatusUpdate event handler to handle complete orders
		newSocket.on("orderStatusUpdate", (data) => {
			console.log("Received status update:", data);

			setOrders((prevOrders) => {
				let found = false;
				const updatedOrders = prevOrders.map((order) => {
					if (order.id === data.orderId) {
						found = true;
						const updatedOrder = { ...order };
						updatedOrder.OrderDetails = updatedOrder.OrderDetails.map(
							(detail) => {
								if (
									detail.id === data.orderDetailId ||
									(detail.dishId === data.dishId &&
										detail.orderSession === data.orderSession)
								) {
									return { ...detail, status: data.status };
								}
								return detail;
							}
						);
						return updatedOrder;
					}
					return order;
				});
				// If order is not found and the update makes an item pending, add the order from socket data
				if (!found && data.status === false) {
					if (data.order && data.orderDetail) {
						updatedOrders.push({
							...data.order,
							OrderDetails: data.orderDetail,
						});
					}
				}
				return updatedOrders;
			});
		});

		newSocket.on("dishCancelled", (data) => {
			console.log("Dish cancelled:", data);
			setOrders((prevOrders) =>
				prevOrders.map((order) => {
					if (order.id === data.orderId) {
						const updatedOrder = { ...order };
						updatedOrder.OrderDetails = updatedOrder.OrderDetails.filter(
							(detail) => detail.dishId !== data.dishId
						);
						return updatedOrder;
					}
					return order;
				})
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

	// Fetch orders data
	useEffect(() => {
		fetchOrders();
	}, []);

	// Update clock every second
	useEffect(() => {
		const clockInterval = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);

		return () => clearInterval(clockInterval);
	}, []);

	// Calculate time since order was placed - giữ ngắn gọn
	const getTimeSince = useCallback((timestamp) => {
		// Convert the stored timestamp into a Vietnam time date
		const orderTimeUTC = new Date(timestamp);
		// Convert to Vietnam time using toLocaleString then create a new Date object
		const vietnamTime = new Date(
			orderTimeUTC.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
		);
		const now = new Date();
		const diffInMinutes = Math.floor(
			(now.getTime() - vietnamTime.getTime()) / 60000
		);
		if (diffInMinutes < 1) return "Vừa xong";
		if (diffInMinutes < 60) return `${diffInMinutes} phút`;
		const diffInHours = Math.floor(diffInMinutes / 60);
		return `${diffInHours}g ${diffInMinutes % 60}p`;
	}, []);

	// Get time class based on waiting time
	const getTimeClass = useCallback((timestamp) => {
		const orderTime = new Date(timestamp);
		const now = new Date();
		const diffInMinutes = Math.floor((now - orderTime) / 60000);

		if (diffInMinutes >= 15) return "text-warning";
		return "text-success";
	}, []);

	// Modified to work with the new data structure - separating orders by orderSession
	const {
		totalPendingOrders,
		totalPendingItems,
		totalCompletedItems,
		ordersByTableSession,
	} = useMemo(() => {
		const totalPendingOrders = orders.length;

		// Add safety checks to prevent undefined errors
		const totalPendingItems = orders.reduce((total, order) => {
			if (!order.OrderDetails || !Array.isArray(order.OrderDetails))
				return total;
			return (
				total +
				order.OrderDetails.filter((item) => item.status === false).length
			);
		}, 0);

		const totalCompletedItems = orders.reduce((total, order) => {
			if (!order.OrderDetails || !Array.isArray(order.OrderDetails))
				return total;
			return (
				total + order.OrderDetails.filter((item) => item.status === true).length
			);
		}, 0);

		// Group orders by table and orderSession
		const ordersByTableSession = {};

		orders.forEach((order) => {
			if (!order || !order.OrderDetails || order.OrderDetails.length === 0)
				return;

			// Group the order details by orderSession
			const detailsBySession = {};
			order.OrderDetails.forEach((detail) => {
				if (!detail) return;
				const session = detail.orderSession || 1;
				if (!detailsBySession[session]) {
					detailsBySession[session] = [];
				}
				detailsBySession[session].push(detail);
			});

			// Create a separate order object for each session - only if there's at least one pending item
			Object.keys(detailsBySession).forEach((session) => {
				// Skip sessions where all items are completed
				if (!detailsBySession[session].some((item) => item.status === false)) {
					return;
				}

				const tableId = order.tableId || 0;
				const sessionKey = parseInt(session);
				const groupKey = `${tableId}-${sessionKey}`;
				const tableName = order.Table?.name || `Bàn ${tableId}`;

				// Create an order object for this session with only the relevant details
				const sessionOrder = {
					...order,
					OrderDetails: detailsBySession[session],
				};

				if (!ordersByTableSession[groupKey]) {
					ordersByTableSession[groupKey] = {
						tableName,
						orderSession: sessionKey,
						orders: [],
					};
				}
				ordersByTableSession[groupKey].orders.push(sessionOrder);
			});
		});

		return {
			totalPendingOrders,
			totalPendingItems,
			totalCompletedItems,
			ordersByTableSession,
		};
	}, [orders]);

	const getTableFoodItems = useCallback((tableOrders) => {
		const pendingItems = [];
		const completedItems = [];

		tableOrders.forEach((order) => {
			if (!order.OrderDetails || !Array.isArray(order.OrderDetails)) {
				return;
			}

			order.OrderDetails.forEach((detail) => {
				if (!detail) return;

				const itemData = {
					id: detail.id || Math.random().toString(36).substr(2, 9), // Fallback ID if none exists
					orderId: order.id,
					dishId: detail.dishId,
					name: detail.Dish?.name || "Unknown Dish",
					quantity: detail.quantity || 1,
					status: !!detail.status, // Convert to boolean
					Category: detail.Dish?.Category || "Other",
					timestamp:
						detail.createdAt || order.createdAt || new Date().toISOString(),
					tableId: order.tableId,
					tableName: order.Table?.name || `Bàn ${order.tableId}`,
				};

				if (itemData.status) {
					completedItems.push(itemData);
				} else {
					pendingItems.push(itemData);
				}
			});
		});

		// Sort pending items using local category names
		pendingItems.sort((a, b) => {
			const categoryOrder = {
				"Món khai vị": 1,
				"Món chính": 2,
				"Món tráng miệng": 3,
				"Đồ uống": 4,
				"Món Rau, củ, quả": 5,
				"Món ăn nhẹ": 6,
				"Món canh": 7,
				"Món ăn về cơm": 8,
				" Lẩu ": 9,
				Other: 10,
			};
			const catA = categoryOrder[a.Category] || categoryOrder.Other;
			const catB = categoryOrder[b.Category] || categoryOrder.Other;
			if (catA !== catB) return catA - catB;
			return new Date(a.timestamp) - new Date(b.timestamp);
		});

		return { pendingItems, completedItems };
	}, []);

	return (
		<div className="bg-light text-dark min-vh-100">
			{/* Header - Made smaller and more compact */}
			<div
				className="py-1"
				style={{
					background: "linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)",
					height: "40px",
				}}
			>
				<div className="container-fluid px-3">
					<div className="row align-items-center h-100">
						<div className="col-6">
							<h2
								className="text-white mb-0 fs-6"
								style={{ whiteSpace: "nowrap" }}
							>
								<i className="bi bi-shop me-1"></i>
								Chef Dashboard
							</h2>
						</div>
						<div className="col-6 text-end">
							<div className="bg-white bg-opacity-10 rounded py-1 px-2 d-inline-block">
								<i className="bi bi-clock me-1"></i>
								<span id="current-time">
									{currentTime.toLocaleTimeString("vi-VN", {
										hour: "2-digit",
										minute: "2-digit",
										second: "2-digit",
										hour12: false,
									})}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Stats */}
			<div className="container-fluid px-3 py-2 border-bottom border-secondary">
				<div className="row gx-3">
					<div className="col-md-4 d-flex align-items-center mb-md-0 mb-2">
						<div
							className="rounded-circle bg-primary bg-opacity-25 p-2 me-2 text-center"
							style={{ width: "40px", height: "40px" }}
						>
							<i className="bi bi-receipt text-primary fs-5"></i>
						</div>
						<div>
							<div className="text-secondary small">Total Pending Orders</div>
							<div className="fs-5 fw-bold">{totalPendingOrders}</div>
						</div>
					</div>
					<div className="col-md-4 d-flex align-items-center mb-md-0 mb-2">
						<div
							className="rounded-circle bg-warning bg-opacity-25 p-2 me-2 text-center"
							style={{ width: "40px", height: "40px" }}
						>
							<i className="bi bi-fire text-warning fs-5"></i>
						</div>
						<div>
							<div className="text-secondary small">Items to Prepare</div>
							<div className="fs-5 fw-bold">{totalPendingItems}</div>
						</div>
					</div>
					<div className="col-md-4 d-flex align-items-center">
						<div
							className="rounded-circle bg-success bg-opacity-25 p-2 me-2 text-center"
							style={{ width: "40px", height: "40px" }}
						>
							<i className="bi bi-check-circle text-success fs-5"></i>
						</div>
						<div>
							<div className="text-secondary small">Completed Items</div>
							<div className="fs-5 fw-bold">{totalCompletedItems}</div>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content - Improved Grid Layout */}
			<div className="container-fluid p-2">
				{/* Loading State */}
				{loading && (
					<div className="text-center my-4">
						<div className="spinner-border text-primary" role="status">
							<span className="visually-hidden">Đang tải...</span>
						</div>
						<p className="mt-2 text-dark">Loading order list...</p>
					</div>
				)}

				{/* No Orders State */}
				{!loading && Object.keys(ordersByTableSession).length === 0 && (
					<div className="text-center my-4 py-4">
						<i
							className="bi bi-emoji-smile text-dark"
							style={{ fontSize: "3rem" }}
						></i>
						<h3 className="mt-3 text-dark">No pending orders</h3>
						<p className="text-dark">The kitchen has completed all dishes</p>
					</div>
				)}

				{/* Tables Grid - Changed to better responsive layout */}
				{!loading && orders.length > 0 && (
					<div className="row g-3">
						{Object.keys(ordersByTableSession).map((groupKey) => {
							const {
								tableName,
								orders: tableOrders,
								orderSession,
							} = ordersByTableSession[groupKey];
							const { pendingItems, completedItems } =
								getTableFoodItems(tableOrders);
							const hasPendingItems = pendingItems.length > 0;
							const sessionDisplay =
								orderSession > 1 ? `Oder thêm - ${orderSession}` : "Lần 1";
							return (
								<div className="col-md-6 col-lg-4" key={groupKey}>
									<div className="card bg-white border border-secondary shadow-sm">
										<div className="card-header bg-white d-flex align-items-center justify-content-between py-2 border-secondary">
											<div>
												<span className="badge bg-primary text-light p-2 fs-6 me-2 mb-2">
													{tableName}
												</span>
												<span className="badge bg-info text-light p-2 fs-6">
													{sessionDisplay}
												</span>
											</div>
											<span
												className={`badge ms-2 ${
													hasPendingItems ? "bg-danger" : "bg-success"
												}`}
											>
												{hasPendingItems
													? `${pendingItems.length} items pending`
													: "Completed"}
											</span>
										</div>
										<div className="card-body p-2">
											<div className="list-group list-group-flush">
												{/* Pending Items */}
												{pendingItems.map((item) => (
													<div
														key={`${item.orderId}-${item.id}`}
														className="list-group-item border-secondary py-2 px-3 text-dark"
													>
														<div className="d-flex align-items-center">
															<span
																className="badge bg-secondary rounded-circle me-2"
																style={{
																	width: "24px",
																	height: "24px",
																	lineHeight: "16px",
																}}
															>
																{item.quantity}
															</span>
															<div className="flex-grow-1">
																{/* Removed text-truncate to allow full expansion */}
																<div className="fw-bold">{item.name}</div>
																<div className="d-flex flex-wrap mt-1">
																	<span className="badge bg-secondary me-2">
																		{item.Category === "Appetizer" ? (
																			<>
																				<i className="bi bi-egg-fried me-1"></i>
																				Appetizer
																			</>
																		) : item.Category === "Main Course" ? (
																			<>
																				<i className="bi bi-basket-fill me-1"></i>
																				Main Course
																			</>
																		) : item.Category === "Dessert" ? (
																			<>
																				<i className="bi bi-wine me-1"></i>
																				Dessert
																			</>
																		) : item.Category === "Drink" ? (
																			<>
																				<i className="bi bi-cup me-1"></i>Drink
																			</>
																		) : (
																			<>
																				<i className="bi bi-cake me-1"></i>
																				{item.Category}
																			</>
																		)}
																	</span>
																	<span
																		className={`badge ${getTimeClass(
																			item.timestamp
																		)}`}
																	>
																		<i className="bi bi-clock me-1"></i>
																		{getTimeSince(item.timestamp)} ago
																	</span>
																</div>
															</div>
														</div>
													</div>
												))}
												{/* Completed Items */}
												{completedItems.map((item) => (
													<div
														key={`${item.orderId}-${item.id}`}
														className="list-group-item border-secondary py-2 px-3 text-secondary"
													>
														<div className="d-flex align-items-center">
															<span
																className="badge bg-secondary rounded-circle me-2"
																style={{
																	width: "24px",
																	height: "24px",
																	lineHeight: "16px",
																}}
															>
																{item.quantity}
															</span>
															<div className="flex-grow-1">
																<div className="text-decoration-line-through">
																	{item.name}
																</div>
																<span className="badge bg-success mt-1">
																	<i className="bi bi-check-circle me-1"></i>
																	Hoàn thành
																</span>
															</div>
														</div>
													</div>
												))}
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};

export default Chef;
