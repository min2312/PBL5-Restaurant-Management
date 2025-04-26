import React, { useContext } from "react";
import {
	Link,
	useHistory,
	useLocation,
} from "react-router-dom/cjs/react-router-dom.min";
import "../NavBar/nav.css";
import NavDropdown from "react-bootstrap/NavDropdown";
import Nav from "react-bootstrap/Nav";
import { UserContext } from "../../Context/UserProvider";
import { LogOutUser } from "../../services/userService";
import { toast } from "react-toastify";

const NavBar = () => {
	const { user, logoutContext } = useContext(UserContext);
	const history = useHistory();
	const location = useLocation();

	const handleLogout = async () => {
		let data = await LogOutUser();
		logoutContext();
		if (data && data.errCode === 0) {
			history.push("/");
			toast.success("Log out success");
		} else {
			toast.error(data.errMessage);
		}
	};

	const ChangePassword = () => {
		history.push("/reset-password");
	};

	// Don't render navbar on these paths
	if (
		location.pathname === "/reset-password" ||
		location.pathname === "/login_admin" ||
		location.pathname === "/login" ||
		location.pathname === "/register" ||
		location.pathname === "/admin"
	) {
		return null;
	}

	return (
		<nav
			className="navbar navbar-expand-lg navbar-dark py-3"
			style={{
				background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
				boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
			}}
		>
			<div className="container">
				<Link to="/" className="navbar-brand d-flex align-items-center">
					<i className="bi bi-cup-hot-fill me-2"></i>
					<span className="fw-bold fs-4">Restaurant</span>
				</Link>

				<button
					className="navbar-toggler"
					type="button"
					data-bs-toggle="collapse"
					data-bs-target="#navbarNav"
				>
					<span className="navbar-toggler-icon"></span>
				</button>

				<div
					className="collapse navbar-collapse justify-content-end"
					id="navbarNav"
				>
					<Nav className="ms-auto">
						{user && user.isAuthenticated ? (
							<div className="d-flex align-items-center">
								<NavDropdown
									title={
										<div className="d-inline-flex align-items-center">
											<div className="bg-white bg-opacity-10 rounded-circle p-2 me-2">
												<i className="bi bi-person-fill text-white"></i>
											</div>
											<span className="text-white">
												{user.account.fullName || "Admin"}
											</span>
										</div>
									}
									className="custom-dropdown"
									id="user-dropdown"
								>
									<NavDropdown.Item className="py-2" onClick={ChangePassword}>
										<i className="bi bi-key me-2"></i>Change Password
									</NavDropdown.Item>
									<NavDropdown.Divider />
									<NavDropdown.Item className="py-2" onClick={handleLogout}>
										<i className="bi bi-box-arrow-right me-2"></i>Log out
									</NavDropdown.Item>
								</NavDropdown>
							</div>
						) : (
							<Link to="/login">
								<button
									className="btn text-white px-4 py-2"
									style={{
										borderRadius: "30px",
										background: "rgba(255, 255, 255, 0.2)",
										backdropFilter: "blur(4px)",
										border: "1px solid rgba(255, 255, 255, 0.3)",
									}}
								>
									<i className="bi bi-box-arrow-in-right me-2"></i>
									Login
								</button>
							</Link>
						)}
					</Nav>
				</div>
			</div>
		</nav>
	);
};

export default NavBar;
