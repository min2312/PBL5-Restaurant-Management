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
	return (
		<>
			{location.pathname === "/login_admin" ||
			location.pathname === "/login" ||
			location.pathname === "/register" ||
			location.pathname === "/admin" ? (
				<></>
			) : (
				<div>
					<div className="navbarClient">
						<div className="navContainer">
							<Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
								<span className="logo">Restaurant</span>
							</Link>
							<Nav>
								{user && user.isAuthenticated === true ? (
									<>
										{/* <Link className="nav-link" to="/users">
											<button className="btn btn-outline-warning" type="button">
												Users
											</button>
										</Link>
										<Link className="nav-link" to="/SlotCar">
											<button className="btn btn-outline-warning" type="button">
												Slot Parking
											</button>
										</Link> */}
										{/* <Link className="nav-link" to="/ticket">
											<button className="btn btn-outline-warning" type="button">
												Tickets
											</button>
										</Link> */}
										<NavDropdown
											title={`Welcome, ${user.account.fullName || "Admin"}`}
											className="NavDropdown mt-1"
											id="basic-nav-dropdown"
										>
											<NavDropdown.Item>Change Password</NavDropdown.Item>
											<NavDropdown.Divider />
											<NavDropdown.Item>
												<span onClick={() => handleLogout()}>Log out</span>
											</NavDropdown.Item>
										</NavDropdown>
									</>
								) : (
									<>
										{/* <Link className="nav-link" to="/users">
											<button
												className="btn btn-outline-warning me-2 mb-1"
												type="button"
											>
												Users
											</button>
										</Link> */}
										<Link className="nav-link" to="/login">
											<button
												className="btn btn-outline-info me-2 mb-1"
												type="button"
											>
												Login
											</button>
										</Link>
									</>
								)}
							</Nav>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default NavBar;
