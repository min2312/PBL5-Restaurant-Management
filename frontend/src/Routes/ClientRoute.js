import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import ReceptionistDashboard from "../pages/Receptionist/ReceptionistDashboard";
import OrderMenu from "../pages/Waiter/orderMenu";
import LoginForm from "../pages/Login/LoginForm";

const ClientRoute = () => {
	return (
		<div>
			<Switch>
				{/* <PrivateRoutes path="/users" component={Users} />
				<PrivateRoutes path="/ticket" exact component={Ticket} />
				<PrivateRoutes path="/info-car/id=:id_user" component={InfoCar} />
				<PrivateRoutes path="/ticket/create" component={Add_Ticket} />
				<PrivateRoutes path="/ProcessPayment" component={PaymentCall} />
				<PrivateRoutes path="/SlotCar" component={Slot_Car} />
				<PrivateRoutes path="/Account/DepositMoney" component={DepositMoney} /> */}
				{/* <Route path="/admin">
					<ReceptionistDashboard />
				</Route> */}
				<Route path="/login" component={LoginForm} />
				<Route
					path="/receptionist-dashboard"
					component={ReceptionistDashboard}
				/>
				<Route path="/order-menu" component={OrderMenu} />
				<Route path="/" exact>
					<ReceptionistDashboard />
				</Route>
				<Route path="*">404 Not Found</Route>
			</Switch>
		</div>
	);
};

export default ClientRoute;
