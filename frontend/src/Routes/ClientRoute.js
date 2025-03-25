import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import ReceptionistDashboard from "../pages/Receptionist/ReceptionistDashboard";
import OrderMenu from "../pages/Waiter/orderMenu";
import LoginForm from "../pages/Login/LoginForm";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import Home from "../pages/Home/Home";
import PrivateRoutesRole from "./PrivateRoutesRole";
import PrivateRoutes from "./PrivateRoutes";
import LoginAdmin from "../pages/Login/LoginAdmin";

const ClientRoute = () => {
	return (
		<div>
			<Switch>
				<Route path="/login" component={LoginForm} />
				<Route path="/login_admin" component={LoginAdmin} />
				<PrivateRoutesRole
					path="/receptionist"
					component={ReceptionistDashboard}
					role="receptionist"
				/>
				<PrivateRoutesRole path="/waiter" component={OrderMenu} role="waiter" />
				<PrivateRoutesRole
					path="/admin"
					component={AdminDashboard}
					role="admin"
				/>
				<Route path="/" exact>
					<Home />
				</Route>
				<Route path="*">404 Not Found</Route>
			</Switch>
		</div>
	);
};

export default ClientRoute;
