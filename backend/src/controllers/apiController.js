import { or } from "sequelize";
import apiService from "../service/apiService";
const cloudinary = require("cloudinary").v2;

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

let HandleGetAllOrderDetail = async (req, res) => {
	let id = req.query.id;
	if (!id) {
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameter",
			orderDetail: [],
		});
	}
	let orderDetail = await apiService.GetAllOrderDetail(id);
	return res.status(200).json({
		errCode: 0,
		errMessage: "OK",
		orderDetail: orderDetail,
	});
};

let HandleGetAllOrderPending = async (req, res) => {
	let order = await apiService.GetOrderPending();
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
		errCode: 0,
		errMessage: "OK",
		order: result.order,
	});
};

let HandleUpdateOrder = async (req, res) => {
	let data = req.body;
	if (!data) {
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameter",
		});
	}
	let result = await apiService.updateOrder(data);
	return res.status(200).json({
		errCode: result.errCode,
		errMessage: result.errMessage,
		order: result.order,
	});
};

let HandleCreateDish = async (req, res) => {
	let data = req.body;
	let fileImage = req.file;
	let urlImage = data.url_image;

	if (!data || Object.keys(data).length === 0) {
		if (fileImage) {
			await cloudinary.uploader.destroy(fileImage.filename);
		}
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameter",
		});
	}

	try {
		if (urlImage) {
			const uploadResponse = await cloudinary.uploader.upload(urlImage, {
				folder: "Restaurant",
			});
			data.image = uploadResponse.secure_url;
		}

		let result = await apiService.CreateDish(data, fileImage);
		return res.status(200).json({
			errCode: result.errCode,
			errMessage: result.errMessage,
			dish: result.dish,
		});
	} catch (error) {
		if (fileImage) {
			await cloudinary.uploader.destroy(fileImage.filename);
		}
		return res.status(500).json({
			errCode: 1,
			errMessage: "Error creating dish",
		});
	}
};

let HandleGetAllDish = async (req, res) => {
	let id = req.query.id;
	if (!id) {
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameter",
			dish: [],
		});
	}
	let dish = await apiService.GetAllDish(id);
	return res.status(200).json({
		errCode: 0,
		errMessage: "OK",
		dish: dish,
	});
};

let HandleCreateOrderDetail = async (req, res) => {
	let { orderId, dishList } = req.body;
	if (!orderId || !dishList || !Array.isArray(dishList)) {
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameter",
		});
	}
	let result = await apiService.CreateOrderDetail(orderId, dishList);
	return res.status(200).json({
		errCode: result.errCode,
		errMessage: result.errMessage,
		orderDetail: result.orderDetail,
	});
};

let HandleUpdateOrderDetail = async (req, res) => {
	let { dishId, orderSession, idOrder } = req.body;
	if (!dishId || !orderSession || !idOrder) {
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameter",
		});
	}
	let result = await apiService.updateOrderDetail(
		dishId,
		orderSession,
		idOrder
	);
	return res.status(200).json({
		errCode: result.errCode,
		errMessage: result.errMessage,
		orderDetail: result.orderDetail,
	});
};

let HandleCreateInvoice = async (req, res) => {
	let data = req.body;
	if (!data) {
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameter",
		});
	}
	let result = await apiService.CreateInvoice(data);
	return res.status(200).json({
		errCode: result.errCode,
		errMessage: result.errMessage,
		invoice: result.invoice,
	});
};

let HandleGetInvoice = async (req, res) => {
	let id = req.query.id;
	if (!id) {
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameter",
			invoice: [],
		});
	}
	let invoice = await apiService.GetInvoice(id);
	return res.status(200).json({
		errCode: invoice.errCode,
		errMessage: invoice.errMessage,
		invoice: invoice.invoice,
		total: invoice.total,
	});
};

let HandleUpdateCustomer = async (req, res) => {
	let data = req.body;
	if (!data) {
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameter",
		});
	}
	let result = await apiService.UpdateCustomer(data);
	return res.status(200).json({
		errCode: result.errCode,
		errMessage: result.errMessage,
		customer: result.customer,
	});
};

let HandleUpdateDiscount = async (req, res) => {
	let data = req.body;
	if (!data) {
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameter",
		});
	}
	let result = await apiService.updateCustomerDiscount(data);
	return res.status(200).json({
		errCode: result.errCode,
		errMessage: result.errMessage,
		customer: result.customer,
	});
};

let handlePaymentZaloPay = async (req, res) => {
	try {
		const paymentResult = await apiService.createZaloPayOrder(req.body);
		return res.status(200).json(paymentResult);
	} catch (error) {
		console.error("ZaloPay error:", error);
		return res.status(500).json({
			message: "An error occurred during ZaloPay processing",
			error: error.message,
		});
	}
};

let handleCheckZaloPay = async (req, res) => {
	try {
		const { app_trans_id } = req.body;
		const paymentResult = await apiService.checkZaloPayOrderStatus(
			app_trans_id
		);
		return res.status(200).json(paymentResult);
	} catch (error) {
		console.error("ZaloPay error:", error);
		return res.status(500).json({
			message: "An error occurred during ZaloPay processing",
			error: error.message,
		});
	}
};

let handleCallBackZaloPay = async (req, res) => {
	try {
		const paymentResult = await apiService.callbackZaloPayOrder(req.body);
		return res.status(200).json(paymentResult);
	} catch (error) {
		console.error("ZaloPay error:", error);
		return res.status(500).json({
			message: "An error occurred during ZaloPay processing",
			error: error.message,
		});
	}
};
module.exports = {
	HandleGetAllTable,
	HandleGetAllOrderPending,
	HandleCreateNewCustomer,
	HandleCheckCustomer,
	HandleCreateNewOrder,
	HandleUpdateCustomer,
	HandleGetAllOrder,
	HandleGetAllReservation,
	HandleCreateDish,
	HandleGetAllDish,
	HandleCreateOrderDetail,
	HandleGetAllOrderDetail,
	HandleUpdateOrderDetail,
	HandleUpdateOrder,
	HandleCreateInvoice,
	HandleGetInvoice,
	HandleUpdateDiscount,
	handlePaymentZaloPay,
	handleCheckZaloPay,
	handleCallBackZaloPay,
};
