import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { UserContext } from "../../Context/UserProvider";
import { toast } from "react-toastify";

const Chef = () => {
	const { user } = useContext(UserContext);
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [currentTime, setCurrentTime] = useState(new Date());

	// Fetch orders data
	useEffect(() => {
		const fetchOrders = async () => {
			setLoading(true);
			try {
				await new Promise((resolve) => setTimeout(resolve, 1000));
				const mockOrders = [
					{
						id: "order-123",
						tableNumber: 1,
						customerName: "Nguyễn Văn A",
						timestamp: new Date().toISOString(),
						items: [
							{
								id: 1,
								name: "Phở bò",
								quantity: 2,
								status: false,
								category: "Main Course",
							},
							{
								id: 2,
								name: "Gỏi cuốn",
								quantity: 1,
								status: false,
								category: "Appetizer",
							},
							{
								id: 3,
								name: "Nước mía",
								quantity: 2,
								status: true,
								category: "Drink",
							},
						],
					},
					{
						id: "order-124",
						tableNumber: 3,
						customerName: "Trần Thị B",
						timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
						items: [
							{
								id: 4,
								name: "Cơm tấm",
								quantity: 1,
								status: false,
								category: "Main Course",
							},
							{
								id: 5,
								name: "Chả giò",
								quantity: 2,
								status: true,
								category: "Appetizer",
							},
							{
								id: 6,
								name: "Trà đá",
								quantity: 3,
								status: true,
								category: "Drink",
							},
						],
					},
					{
						id: "order-125",
						tableNumber: 5,
						customerName: "Lê Văn C",
						timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
						items: [
							{
								id: 7,
								name: "Bún bò Huế",
								quantity: 1,
								status: false,
								category: "Main Course",
							},
							{
								id: 8,
								name: "Bánh xèo",
								quantity: 1,
								status: false,
								category: "Main Course",
							},
							{
								id: 9,
								name: "Cà phê sữa đá",
								quantity: 2,
								status: true,
								category: "Drink",
							},
						],
					},
				];
				setOrders(mockOrders);
				setLoading(false);
				toast.success("Đã tải danh sách đơn hàng");
			} catch (error) {
				console.error("Error fetching orders:", error);
				toast.error("Lỗi khi tải danh sách đơn hàng");
				setLoading(false);
			}
		};

		fetchOrders();

		const intervalId = setInterval(() => {
			fetchOrders();
		}, 30000);

		// Clean up interval on unmount
		return () => {
			clearInterval(intervalId);
		};
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
		const orderTime = new Date(timestamp);
		const now = new Date();
		const diffInMinutes = Math.floor((now - orderTime) / 60000);

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

	// Toggle item status
	const toggleItemStatus = useCallback((orderId, itemId) => {
		setOrders((prevOrders) =>
			prevOrders.map((order) => {
				if (order.id === orderId) {
					return {
						...order,
						items: order.items.map((item) => {
							if (item.id === itemId) {
								return { ...item, status: !item.status };
							}
							return item;
						}),
					};
				}
				return order;
			})
		);
		toast.success("Đã cập nhật trạng thái món ăn");
	}, []);

	// Memoized calculations for better performance
	const { totalPendingOrders, totalPendingItems, totalCompletedItems, ordersByTable } = useMemo(() => {
		const totalPendingOrders = orders.length;
		const totalPendingItems = orders.reduce(
			(total, order) => total + order.items.filter((item) => !item.status).length,
			0
		);
		const totalCompletedItems = orders.reduce(
			(total, order) => total + order.items.filter((item) => item.status).length,
			0
		);

		// Group orders by table
		const ordersByTable = {};
		orders.forEach((order) => {
			const tableNum = order.tableNumber;
			if (!ordersByTable[tableNum]) {
				ordersByTable[tableNum] = [];
			}
			ordersByTable[tableNum].push(order);
		});

		return { totalPendingOrders, totalPendingItems, totalCompletedItems, ordersByTable };
	}, [orders]);

	// Get all food items for a table, separating pending and completed items
	const getTableFoodItems = useCallback((tableOrders) => {
		const pendingItems = [];
		const completedItems = [];
		tableOrders.forEach((order) => {
			order.items.forEach((item) => {
				const itemData = {
					...item,
					orderId: order.id,
					tableNumber: order.tableNumber,
					timestamp: order.timestamp,
				};
				if (item.status) {
					completedItems.push(itemData);
				} else {
					pendingItems.push(itemData);
				}
			});
		});

		// Sort pending items by category and priority
		pendingItems.sort((a, b) => {
			const categoryOrder = {
				"Main Course": 1,
				"Appetizer": 2,
				"Other": 3,
				"Drink": 4
			};
			const catA = categoryOrder[a.category] || categoryOrder["Other"];
			const catB = categoryOrder[b.category] || categoryOrder["Other"];
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
							<h2 className="text-white mb-0 fs-6" style={{ whiteSpace: "nowrap" }}>
								<i className="bi bi-shop me-1"></i>
								Màn Hình Nhà Bếp
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
										hour12: false
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
						<div className="rounded-circle bg-primary bg-opacity-25 p-2 me-2 text-center" style={{ width: "40px", height: "40px" }}>
							<i className="bi bi-receipt text-primary fs-5"></i>
						</div>
						<div>
							
								<div className="text-secondary small">Tổng đơn đang chờ</div>
								<div className="fs-5 fw-bold">{totalPendingOrders}</div>
						</div>
					</div>
					<div className="col-md-4 d-flex align-items-center mb-md-0 mb-2">
						<div className="rounded-circle bg-warning bg-opacity-25 p-2 me-2 text-center" style={{ width: "40px", height: "40px" }}>
							<i className="bi bi-fire text-warning fs-5"></i>
						</div>
						<div>
							<div className="text-secondary small">Món cần chế biến</div>
							<div className="fs-5 fw-bold">{totalPendingItems}</div>
						</div>
					</div>
					<div className="col-md-4 d-flex align-items-center">
						<div className="rounded-circle bg-success bg-opacity-25 p-2 me-2 text-center" style={{ width: "40px", height: "40px" }}>
							<i className="bi bi-check-circle text-success fs-5"></i>
						</div>
						<div>
							<div className="text-secondary small">Món đã hoàn thành</div>
							<div className="fs-5 fw-bold">{totalCompletedItems}</div>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content - Grid Layout with white background */}
			<div className="container-fluid p-2">
				{/* Loading State */}
				{loading && (
					<div className="text-center my-4">
						<div className="spinner-border text-primary" role="status">
							<span className="visually-hidden">Đang tải...</span>
						</div>
						<p className="mt-2 text-dark">Đang tải danh sách đơn hàng...</p>
					</div>
				)}

				{/* No Orders State */}
				{!loading && orders.length === 0 && (
					<div className="text-center my-4 py-4">
						<i
							className="bi bi-emoji-smile text-dark"
							style={{ fontSize: "3rem" }}
						></i>
						<h3 className="mt-3 text-dark">Không có đơn hàng nào đang chờ</h3>
						<p className="text-dark">Nhà bếp đã hoàn thành tất cả món ăn</p>
					</div>
				)}

				{/* Tables Grid - Changed to white background */}
				{!loading && orders.length > 0 && (
					<div className="row g-2">
						{Object.keys(ordersByTable).map((tableNum) => {
							const tableOrders = ordersByTable[tableNum];
							const { pendingItems, completedItems } = getTableFoodItems(tableOrders);
							const hasPendingItems = pendingItems.length > 0;

							return (
								<div className="col-lg-4 col-xl-3" key={tableNum}>
									<div className="card bg-white border border-secondary h-100">
										<div className="card-header bg-white d-flex align-items-center py-2 border-secondary">
											<span className="badge bg-primary text-light p-2 fs-6 me-2">
												Bàn {tableNum}
											</span>
											<span
												className={`badge ${hasPendingItems ? "bg-danger" : "bg-success"
													}`}
											>
												{hasPendingItems
													? `${pendingItems.length} món chờ`
													: "Hoàn thành"}
											</span>
										</div>

										<div className="card-body p-0">
											<div className="list-group list-group-flush">
												{/* Pending Items */}
												{pendingItems.map((item) => (
													<div
														key={`${item.orderId}-${item.id}`}
														className="list-group-item bg-white border-secondary py-2 px-3 text-dark"
														style={{ cursor: "pointer" }}
														onClick={() => toggleItemStatus(item.orderId, item.id)}
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
																<div className="fw-bold">{item.name}</div>
																<div className="d-flex flex-wrap mt-1">
																	<span className="badge bg-secondary me-2">
																		{item.category === "Main Course" ? (
																			<>
																				<i className="bi bi-egg-fried me-1"></i>Main
																			</>
																		) : item.category === "Appetizer" ? (
																			<>
																				<i className="bi bi-cup-straw me-1"></i>App
																			</>
																		) : item.category === "Drink" ? (
																			<>
																				<i className="bi bi-cup me-1"></i>Drink
																			</>
																		) : (
																			<>
																				<i className="bi bi-cake me-1"></i>Other
																			</>
																		)}
																	</span>
																	<span className={`badge ${getTimeClass(item.timestamp)}`}>
																		<i className="bi bi-clock me-1"></i>
																		{getTimeSince(item.timestamp)} trước
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
														className="list-group-item bg-white border-secondary py-2 px-3 text-secondary"
														style={{ cursor: "pointer" }}
														onClick={() => toggleItemStatus(item.orderId, item.id)}
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
																<div className="text-decoration-line-through">{item.name}</div>
																<span className="badge bg-success mt-1">
																	<i className="bi bi-check-circle me-1"></i>Hoàn
																	thành
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

			{/* Live Connection Indicator - Changed to light background */}
			<div className="position-fixed bottom-0 end-0 p-2">
				<div className="d-flex align-items-center bg-white border border-secondary rounded p-2">
					<div
						className="spinner-grow spinner-grow-sm text-success me-2"
						role="status"
					>
						<span className="visually-hidden">Live...</span>
					</div>
					<span className="text-dark small">Kết nối trực tiếp</span>
				</div>
			</div>
		</div>
	);
};

export default Chef;