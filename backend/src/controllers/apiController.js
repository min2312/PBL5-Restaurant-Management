import apiService from "../service/apiService";
let HandleGetAllTable = async (req, res) => {
	let id = req.query.id;
	if (!id) {
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameter",
			table: [],
		});
	}
	let table = await apiService.GetAllTable(id);
	return res.status(200).json({
		errCode: 0,
		errMessage: "OK",
		table: table,
	});
};

let HandleGetAllOrder = async (req, res) => {
	let id = req.query.id;
	if (!id) {
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameter",
			order: [],
		});
	}
	let order = await apiService.GetAllOrder(id);
	return res.status(200).json({
		errCode: 0,
		errMessage: "OK",
		order: order,
	});
};

let HandleGetAllReservation = async (req, res) => {
	let id = req.query.id;
	if (!id) {
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameter",
			order: [],
		});
	}
	let reservation = await apiService.GetAllReservation(id);
	return res.status(200).json({
		errCode: 0,
		errMessage: "OK",
		Reservation: reservation,
	});
};

let HandleCreateNewCustomer = async (req, res) => {
	let customer = req.body;
	if (!customer) {
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameter",
		});
	}
	let result = await apiService.CreateNewCustomer(customer);
	return res.status(200).json({
		errCode: result.errCode,
		errMessage: result.errMessage,
		customer: result.customer,
	});
};

let HandleCheckCustomer = async (req, res) => {
	let phoneNumber = req.body.phoneNumber;
	console.log(phoneNumber);
	if (!phoneNumber) {
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameter",
		});
	}
	let customer = await apiService.CheckCustomer(phoneNumber);
	return res.status(200).json({
		errCode: customer.errCode,
		errMessage: customer.errMessage,
		customer: customer.customer,
	});
};

let HandleCreateNewOrder = async (req, res) => {
	let data = req.body;
	if (!data) {
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameter",
		});
	}
	let result = await apiService.CreateOrder(data);
	return res.status(200).json({
		errCode: result.errCode,
		errMessage: result.errMessage,
		order: result.order,
	});
};
module.exports = {
	HandleGetAllTable,
	HandleCreateNewCustomer,
	HandleCheckCustomer,
	HandleCreateNewOrder,
	HandleGetAllOrder,
	HandleGetAllReservation,
};
