import React, { useContext, useState, useEffect } from "react";
import { Nav, Dropdown } from "react-bootstrap";
import {
	FaTachometerAlt,
	FaUsers,
	FaTable,
	FaShoppingCart,
	FaFileInvoiceDollar,
	FaCog,
	FaSignOutAlt,
	FaBars,
	FaUtensils,
	FaPercentage,
} from "react-icons/fa";
import Dashboard from "./Dashboard";
import CreateUser from "./CreateUser";
import ManageUsers from "./ManageUsers";
import ManageTables from "./ManageTables";
import ManageOrders from "./ManageOrders";
import ManageInvoices from "./ManageInvoices";
import ManageDiscounts from "./ManageDiscounts"; // Import the new component
import "./AdminDashboard.css";
import { UserContext } from "../../Context/UserProvider";
import { toast } from "react-toastify";
import { LogOutAdmin } from "../../services/adminService";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import ManageDishes from "./ManageDishes";

const AdminDashboard = () => {
	const history = useHistory();
	const [activeView, setActiveView] = useState("dashboard");
	const { logoutContext, userState } = useContext(UserContext);
	const [collapsed, setCollapsed] = useState(false);

	// Responsive sidebar handler
	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 992) {
				setCollapsed(true);
			} else {
				setCollapsed(false);
			}
		};

		// Initial call and event listener
		window.addEventListener("resize", handleResize);
		handleResize();

		// Prevent body scrolling to avoid issues with fixed sidebar
		document.body.style.overflow = "hidden";

		return () => {
			window.removeEventListener("resize", handleResize);
			document.body.style.overflow = "";
		};
	}, []);

	const handleLogout = async () => {
		let data = await LogOutAdmin();
		logoutContext();
		if (data && data.errCode === 0) {
			history.push("/");
			toast.success("Log out success");
		} else {
			toast.error(data.errMessage);
		}
	};

	const renderView = () => {
		switch (activeView) {
			case "dashboard":
				return <Dashboard setActiveView={setActiveView} />; // Pass setActiveView as a prop
			case "create-user":
				return <CreateUser />;
			case "manage-users":
				return <ManageUsers />;
			case "manage-tables":
				return <ManageTables />;
			case "manage-orders":
				return <ManageOrders />;
			case "manage-invoices":
				return <ManageInvoices />;
			case "manage-dishes":
				return <ManageDishes />;
			case "manage-discounts":
				return <ManageDiscounts />;
			default:
				return <Dashboard setActiveView={setActiveView} />;
		}
	};

	const toggleSidebar = () => {
		setCollapsed(!collapsed);
	};

	return (
		<div className="admin-dashboard admin-area">
			<div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
				<div className="sidebar-header">
					<h3 className={collapsed ? "d-none" : ""}>
						<span className="brand-icon">🍽️</span>
						<span className="brand-text">Restaurant</span>
					</h3>
					<button className="toggle-btn" onClick={toggleSidebar}>
						<FaBars />
					</button>
				</div>

				<div className="sidebar-menu">
					<Nav className="flex-column">
						<Nav.Link
							className={activeView === "dashboard" ? "active" : ""}
							onClick={() => setActiveView("dashboard")}
						>
							<FaTachometerAlt />
							<span className={collapsed ? "d-none" : ""}>Dashboard</span>
						</Nav.Link>

						<Nav.Link
							className={activeView === "manage-users" ? "active" : ""}
							onClick={() => setActiveView("manage-users")}
						>
							<FaUsers />
							<span className={collapsed ? "d-none" : ""}>Manage Users</span>
						</Nav.Link>

						<Nav.Link
							className={activeView === "manage-tables" ? "active" : ""}
							onClick={() => setActiveView("manage-tables")}
						>
							<FaTable />
							<span className={collapsed ? "d-none" : ""}>Manage Tables</span>
						</Nav.Link>

						<Nav.Link
							className={activeView === "manage-dishes" ? "active" : ""}
							onClick={() => setActiveView("manage-dishes")}
						>
							<FaUtensils />
							<span className={collapsed ? "d-none" : ""}>Manage Dishes</span>
						</Nav.Link>

						<Nav.Link
							className={activeView === "manage-discounts" ? "active" : ""}
							onClick={() => setActiveView("manage-discounts")}
						>
							<FaPercentage />
							<span className={collapsed ? "d-none" : ""}>
								Manage Discounts
							</span>
						</Nav.Link>

						<Nav.Link
							className={activeView === "manage-orders" ? "active" : ""}
							onClick={() => setActiveView("manage-orders")}
						>
							<FaShoppingCart />
							<span className={collapsed ? "d-none" : ""}>Manage Orders</span>
						</Nav.Link>

						<Nav.Link
							className={activeView === "manage-invoices" ? "active" : ""}
							onClick={() => setActiveView("manage-invoices")}
						>
							<FaFileInvoiceDollar />
							<span className={collapsed ? "d-none" : ""}>Manage Invoices</span>
						</Nav.Link>
					</Nav>
				</div>

				<div className="sidebar-footer">
					<Dropdown drop="up" align="end">
						<Dropdown.Toggle id="user-dropdown" className="user-dropdown">
							<div className="user-avatar">
								<span>{userState?.userData?.name?.charAt(0) || "A"}</span>
							</div>
							{!collapsed && (
								<div className="user-info">
									<h6 className="mb-0">
										{userState?.userData?.name || "Admin"}
									</h6>
									<small>Administrator</small>
								</div>
							)}
						</Dropdown.Toggle>

						<Dropdown.Menu className="dropdown-menu-dark">
							<Dropdown.Item>
								<FaCog className="me-2" /> Settings
							</Dropdown.Item>
							<Dropdown.Divider />
							<Dropdown.Item onClick={handleLogout}>
								<FaSignOutAlt className="me-2" /> Log Out
							</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
				</div>
			</div>

			<div className={`main-content ${collapsed ? "expanded" : ""}`}>
				<div className="header">
					<div className="header-left">
						<h4>
							{activeView
								.replace("-", " ")
								.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())}
						</h4>
					</div>
					<div className="header-right">
						{/* You can add additional header elements here */}
					</div>
				</div>
				<div className="content-wrapper">{renderView()}</div>
			</div>
		</div>
	);
};

export default AdminDashboard;
