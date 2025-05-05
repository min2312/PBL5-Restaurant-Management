import React, { useContext, useState } from "react";
import { Container, Row, Col, Nav, Dropdown } from "react-bootstrap";
import Dashboard from "./Dashboard";
import CreateUser from "./CreateUser";
import ManageUsers from "./ManageUsers";
import ManageTables from "./ManageTables";
import ManageOrders from "./ManageOrders";
import ManageInvoices from "./ManageInvoices";
import "./AdminDashboard.css";
import { UserContext } from "../../Context/UserProvider";
import { toast } from "react-toastify";
import { LogOutAdmin } from "../../services/adminService";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
const AdminDashboard = () => {
	const history = useHistory();
	const [activeView, setActiveView] = useState("dashboard");
	const { logoutContext } = useContext(UserContext);
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
				return <Dashboard />;
			case "create-user":
				return <CreateUser />;
			case "manage-users":
				return <ManageUsers />;
			case "manage-tables":
				return <ManageTables />;
			case "manage-orders":
				return <ManageOrders />;
			case "manage-reservations":
				return <ManageInvoices />;
			default:
				return <Dashboard />;
		}
	};

	return (
		<Container fluid>
			<Row>
				<Col md={2} className="sidebar">
					<Nav className="flex-column">
						<Nav.Link
							href="#dashboard"
							className={activeView === "dashboard" ? "active" : ""}
							onClick={() => setActiveView("dashboard")}
						>
							Dashboard
						</Nav.Link>
						<Nav.Link
							href="#create-user"
							className={activeView === "create-user" ? "active" : ""}
							onClick={() => setActiveView("create-user")}
						>
							Create User
						</Nav.Link>
						<Nav.Link
							href="#manage-users"
							className={activeView === "manage-users" ? "active" : ""}
							onClick={() => setActiveView("manage-users")}
						>
							Manage Users
						</Nav.Link>
						<Nav.Link
							href="#manage-tables"
							className={activeView === "manage-tables" ? "active" : ""}
							onClick={() => setActiveView("manage-tables")}
						>
							Manage Tables
						</Nav.Link>
						<Nav.Link
							href="#manage-orders"
							className={activeView === "manage-orders" ? "active" : ""}
							onClick={() => setActiveView("manage-orders")}
						>
							Manage Orders
						</Nav.Link>
						<Nav.Link
							href="#manage-reservations"
							className={activeView === "manage-reservations" ? "active" : ""}
							onClick={() => setActiveView("manage-reservations")}
						>
							Manage Invoices
						</Nav.Link>

						{/* Dropdown Menu */}
						<div className="dropdown admin-dropdown position-absolute bottom-0 start-50 translate-middle-x mb-3">
							<Dropdown>
								<Dropdown.Toggle variant="primary" id="adminDropdown">
									Welcome, Admin
								</Dropdown.Toggle>

								<Dropdown.Menu>
									<Dropdown.Item
										onClick={() => alert("Change Password clicked!")}
									>
										Change Password
									</Dropdown.Item>
									<Dropdown.Item onClick={() => handleLogout()}>
										Logout
									</Dropdown.Item>
								</Dropdown.Menu>
							</Dropdown>
						</div>
					</Nav>
				</Col>

				<Col md={10} className="content">
					{renderView()}
				</Col>
			</Row>
		</Container>
	);
};

export default AdminDashboard;
