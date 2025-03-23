import React, { useState } from "react";
import { Container, Row, Col, Nav } from "react-bootstrap";
import Dashboard from "./Dashboard";
import CreateUser from "./CreateUser";
import ManageUsers from "./ManageUsers";
import ManageTables from "./ManageTables";
import ManageOrders from "./ManageOrders";
import ManageReservations from "./ManageReservations";
import "./AdminDashboard.css";

const AdminDashboard = () => {
	const [activeView, setActiveView] = useState("dashboard");

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
				return <ManageReservations />;
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
							Manage Reservations
						</Nav.Link>
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
