import { raw } from "mysql2";
import db, { Sequelize } from "../models/index";
import { Op, where } from "sequelize";
import { response } from "express";
import { getAllUser } from "../service/userService";
import { resolve } from "path";
import { rejects } from "assert";
const crypto = require("crypto");
const CryptoJS = require("crypto-js");
const moment = require("moment");
const qs = require("qs");
const axios = require("axios");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

let GetAllTable = (tableid) => {
	return new Promise(async (resolve, reject) => {
		try {
			let tables = "";
			if (tableid === "ALL") {
				tables = await db.Table.findAll({});
			}
			if (tableid && tableid !== "ALL") {
				tables = await db.Table.findAll({
					where: { id: tableid },
				});
			}
			resolve(tables);
		} catch (e) {
			reject(e);
		}
	});
};

let GetAllOrder = (orderid) => {
	return new Promise(async (resolve, reject) => {
		try {
			let orders = "";
			if (orderid === "ALL") {
				orders = await db.Order.findAll({
					include: [
						{
							model: db.User,
							attributes: ["id", "fullName", "email", "role"],
						},
						{
							model: db.Table,
							attributes: ["id", "tableNumber"],
						},
					],
				});
			}
			if (orderid && orderid !== "ALL") {
				orders = await db.Order.findAll({
					where: { id: orderid },
					include: [
						{
							model: db.User,
							attributes: ["id", "fullName", "email", "role"],
						},
						{
							model: db.Table,
							attributes: ["id", "tableNumber"],
						},
					],
				});
			}
			resolve(orders);
		} catch (e) {
			reject(e);
		}
	});
};

let GetAllOrderDetail = (orderId) => {
	return new Promise(async (resolve, reject) => {
		try {
			let orderDetails = "";
			if (orderId === "ALL") {
				orderDetails = await db.OrderDetail.findAll({
					include: [
						{
							model: db.Order,
							attributes: ["id", "tableId"],
						},
						{
							model: db.Dish,
							attributes: ["id", "name", "price", "Category", "pic_link"],
						},
					],
				});
			} else if (orderId && orderId !== "ALL") {
				orderDetails = await db.OrderDetail.findAll({
					where: { orderId: orderId },
					include: [
						{
							model: db.Order,
							attributes: ["id", "tableId"],
						},
						{
							model: db.Dish,
							attributes: ["id", "name", "price", "Category", "pic_link"],
						},
					],
				});
			}
			resolve(orderDetails);
		} catch (e) {
			reject(e);
		}
	});
};

let CreateNewCustomer = (data) => {
	return new Promise(async (resolve, reject) => {
		try {
			let check = await db.Customer.findOne({
				where: { phone: data.phone },
			});
			if (check) {
				resolve({
					errCode: 1,
					errMessage: "The phone number is already registered",
				});
			} else {
				let newCustomer = await db.Customer.create({
					name: data.name,
					phone: data.phone,
				});
				let customer = {
					id: newCustomer.id,
					name: data.name,
					phone: data.phone,
					points: 0,
				};
				resolve({
					errCode: 0,
					errMessage: "Create new customer successfully",
					customer: customer,
				});
			}
		} catch (e) {
			reject(e);
		}
	});
};

let CheckCustomer = (phone) => {
	return new Promise(async (resolve, reject) => {
		try {
			let check = await db.Customer.findOne({
				where: { phone: phone },
			});
			if (check) {
				resolve({
					errCode: 0,
					errMessage: "Customer exists",
					customer: check,
				});
			} else {
				resolve({
					errCode: 1,
					errMessage: "Customer does not exist",
				});
			}
		} catch (e) {
			reject(e);
		}
	});
};

let GetAllReservation = (reservationId) => {
	return new Promise(async (resolve, reject) => {
		try {
			let reservations = "";
			if (reservationId === "ALL") {
				reservations = await db.Reservation.findAll({
					include: [
						{
							model: db.Customer,
							attributes: ["id", "name", "phone", "points"],
						},
						{
							model: db.Table,
							attributes: ["id", "tableNumber"],
						},
					],
				});
			}
			if (reservationId && reservationId !== "ALL") {
				reservations = await db.Reservation.findOne({
					where: { id: reservationId },
					include: [
						{
							model: db.Customer,
							attributes: ["id", "name", "phone", "points"],
						},
						{
							model: db.Table,
							attributes: ["id", "tableNumber"],
						},
					],
				});
			}
			resolve(reservations);
		} catch (e) {
			reject(e);
		}
	});
};

let ReservationTable = (data) => {
	return new Promise(async (resolve, reject) => {
		try {
			let existingReservation = await db.Reservation.findOne({
				where: {
					tableId: data.table.id,
					status: "PENDING",
				},
			});

			await db.Table.update(
				{ status: data.status },
				{ where: { tableNumber: data.table.tableNumber } }
			);

			if (existingReservation) {
				if (existingReservation.customerId) {
					resolve({
						errCode: 0,
						errMessage: "Reservation already exists",
						reservation: existingReservation,
					});
					return;
				}

				await existingReservation.update({
					customerId: data.customer?.id || null,
					reservationTime: new Date(),
				});

				resolve({
					errCode: 0,
					errMessage: "Customer information updated",
					reservation: existingReservation,
				});
				return;
			}

			let newReservation = await db.Reservation.create({
				customerId: data.customer?.id || null,
				tableId: data.table.id,
			});

			resolve({
				errCode: 0,
				errMessage: "Reservation created successfully",
				reservation: newReservation,
			});
		} catch (error) {
			reject({
				errCode: 1,
				errMessage: "Error creating/updating reservation",
			});
		}
	});
};

let CreateOrder = (data) => {
	return new Promise(async (resolve, reject) => {
		try {
			let check = await db.Order.findOne({
				where: { tableId: data.table.id, status: "PENDING" },
			});
			if (check) {
				resolve({
					errCode: 1,
					errMessage: "The table already has an order",
				});
			} else {
				let newOrder = await db.Order.create({
					tableId: data.table.id,
					customerId: data.customer?.id || null,
					userId: data.user.id,
				});

				let findnewOrder = await db.Order.findOne({
					where: { id: newOrder.id },
					include: [
						{
							model: db.User,
							attributes: ["id", "fullName", "email", "role"],
						},
						{
							model: db.Table,
							attributes: ["id", "tableNumber"],
						},
					],
				});

				resolve({
					errCode: 0,
					errMessage: "Create new order successfully",
					order: findnewOrder,
				});
			}
		} catch (e) {
			reject({
				errCode: 1,
				errMessage: "Error creating reservation",
			});
		}
	});
};

let CreateOrderDetail = (orderId, dishList) => {
	return new Promise(async (resolve, reject) => {
		try {
			let latestSession = await db.OrderDetail.max("orderSession", {
				where: { orderId: orderId },
			});

			let newSession = latestSession ? latestSession + 1 : 1;

			let dataToCreate = dishList.map((dish) => ({
				orderId: orderId,
				dishId: dish.id,
				quantity: dish.quantity,
				orderSession: newSession,
			}));

			let createdItems = await db.OrderDetail.bulkCreate(dataToCreate);

			let findNewOrderDetail = await db.OrderDetail.findAll({
				where: { orderSession: newSession },
				include: [
					{
						model: db.Order,
						attributes: ["id", "tableId"],
					},
					{
						model: db.Dish,
						attributes: ["id", "name", "price", "Category", "pic_link"],
					},
				],
			});
			resolve({
				errCode: 0,
				errMessage: "Create new order detail successfully",
				orderDetail: findNewOrderDetail,
			});
		} catch (e) {
			console.log(e);
			reject({
				errCode: 1,
				errMessage: "Error creating/updating order detail",
			});
		}
	});
};

let updateOrderDetail = (dishId, orderSession) => {
	return new Promise(async (resolve, reject) => {
		try {
			let orderDetail = await db.OrderDetail.findOne({
				where: { dishId: dishId, orderSession: orderSession },
			});
			if (orderDetail) {
				await orderDetail.update({
					status: !orderDetail.status,
				});
				resolve({
					errCode: 0,
					errMessage: "Update order detail successfully",
					orderDetail: orderDetail,
				});
			} else {
				resolve({
					errCode: 1,
					errMessage: "Order detail not found",
				});
			}
		} catch (e) {
			console.log(e);
			reject({
				errCode: 1,
				errMessage: "Error creating/updating order detail",
			});
		}
	});
};

let CreateDish = (data, fileImage) => {
	return new Promise(async (resolve, reject) => {
		try {
			let check = await db.Dish.findOne({
				where: { name: data.name },
			});
			if (check) {
				if (fileImage) {
					await cloudinary.uploader.destroy(fileImage.filename);
				}
				resolve({
					errCode: 1,
					errMessage: "The dish already exists",
				});
			} else {
				let imagePath = data.image || (fileImage ? fileImage.path : null);
				let newDish = await db.Dish.create({
					name: data.name,
					price: data.price,
					Category: data.category,
					pic_link: imagePath,
				});
				resolve({
					errCode: 0,
					errMessage: "Create new dish successfully",
					dish: newDish,
				});
			}
		} catch (e) {
			if (fileImage) {
				await cloudinary.uploader.destroy(fileImage.filename);
			}
			reject({
				errCode: 1,
				errMessage: "Error creating dish",
			});
		}
	});
};

let GetAllDish = (dishId) => {
	return new Promise(async (resolve, reject) => {
		try {
			let dishes = "";
			if (dishId === "ALL") {
				dishes = await db.Dish.findAll({
					attributes: ["id", "name", "price", "Category", "pic_link"],
				});
			}
			if (dishId && dishId !== "ALL") {
				dishes = await db.Dish.findAll({
					where: { id: dishId },
					attributes: ["id", "name", "price", "Category", "pic_link"],
				});
			}
			resolve(dishes);
		} catch (e) {
			reject(e);
		}
	});
};

let PaymentMoMo = (amount) => {
	const accessKey = "F8BBA842ECF85";
	const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
	const partnerCode = "MOMO";
	const redirectUrl =
		"https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b";
	const ipnUrl = "https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b";
	const requestType = "payWithMethod";
	return new Promise((resolve, reject) => {
		const orderId = partnerCode + new Date().getTime();
		const requestId = orderId;
		const extraData = "";
		const orderInfo = "pay with MoMo";
		const paymentCode =
			"T8Qii53fAXyUftPV3m9ysyRhEanUs9KlOPfHgpMR0ON50U10Bh+vZdpJU7VY4z+Z2y77fJHkoDc69scwwzLuW5MzeUKTwPo3ZMaB29imm6YulqnWfTkgzqRaion+EuD7FN9wZ4aXE1+mRt0gHsU193y+yxtRgpmY7SDMU9hCKoQtYyHsfFR5FUAOAKMdw2fzQqpToei3rnaYvZuYaxolprm9+/+WIETnPUDlxCYOiw7vPeaaYQQH0BF0TxyU3zu36ODx980rJvPAgtJzH1gUrlxcSS1HQeQ9ZaVM1eOK/jl8KJm6ijOwErHGbgf/hVymUQG65rHU2MWz9U8QUjvDWA==";
		// Tạo raw signature
		const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
		const signature = crypto
			.createHmac("sha256", secretKey)
			.update(rawSignature)
			.digest("hex");

		// Tạo body yêu cầu JSON
		const requestBody = {
			partnerCode,
			partnerName: "Test",
			storeId: "MomoTestStore",
			requestId,
			amount,
			orderId,
			orderInfo,
			redirectUrl,
			ipnUrl,
			lang: "vi",
			requestType,
			autoCapture: true,
			extraData,
			orderGroupId: "",
			signature,
		};

		// Gọi API với axios
		axios
			.post("https://test-payment.momo.vn/v2/gateway/api/create", requestBody, {
				headers: {
					"Content-Type": "application/json",
				},
			})
			.then((response) => {
				resolve(response.data);
			})
			.catch((error) => {
				reject(error);
			});
	});
};

const createZaloPayOrder = async (orderDetails) => {
	const embed_data = {
		redirecturl: `http://localhost:3000/ProcessPayment?id_user=${orderDetails.id_user}`,
	};
	const config = {
		app_id: "2553",
		key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
		key2: "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
		endpoint: "https://sb-openapi.zalopay.vn/v2/create",
	};
	const transID = Math.floor(Math.random() * 1000000);
	const order = {
		app_id: config.app_id,
		app_trans_id: `${moment().format("YYMMDD")}_${transID}`,
		app_user: orderDetails.fullName || "user123",
		app_time: Date.now(),
		item: JSON.stringify(orderDetails.items || []),
		embed_data: JSON.stringify(embed_data),
		amount: orderDetails.price || 50000,
		callback_url:
			"https://e983-2001-ee0-4b74-a210-b3fb-e93b-bd97-6202.ngrok-free.app/callback",
		description: `ZaloPay - Payment for the order #${transID}`,
		bank_code: "",
	};

	const data = `${config.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
	order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

	try {
		const result = await axios.post(config.endpoint, null, { params: order });
		return result.data;
	} catch (error) {
		console.log(error);
		throw error;
	}
};
const callbackZaloPayOrder = async (body) => {
	const config = {
		app_id: "2553",
		key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
		key2: "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
	};
	let result = {};
	let dataStr = body.data;
	let reqMac = body.mac;
	let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
	console.log("mac =", mac);

	if (reqMac !== mac) {
		// Callback không hợp lệ
		result.return_code = -1;
		result.return_message = "mac not equal";
	} else {
		let dataJson = JSON.parse(dataStr);
		console.log(
			"update order's status = success where app_trans_id =",
			dataJson["app_trans_id"]
		);

		result.return_code = 1;
		result.return_message = "success";
	}

	return result;
};
const checkZaloPayOrderStatus = async (app_trans_id) => {
	const config = {
		app_id: "2553",
		key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
		key2: "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
		endpoint: "https://sb-openapi.zalopay.vn/v2/query",
	};

	let postData = {
		app_id: config.app_id,
		app_trans_id: app_trans_id,
	};

	let data = postData.app_id + "|" + postData.app_trans_id + "|" + config.key1; // appid|app_trans_id|key1
	postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();
	let postConfig = {
		method: "post",
		url: config.endpoint,
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		data: qs.stringify(postData),
	};
	try {
		const response = await axios(postConfig);
		return response.data;
	} catch (error) {
		console.error("Error checking order status:", error);
		throw error;
	}
};

module.exports = {
	GetAllTable,
	GetAllOrder,
	GetAllOrderDetail,
	GetAllReservation,
	GetAllDish,
	CreateNewCustomer,
	CheckCustomer,
	ReservationTable,
	CreateOrder,
	CreateOrderDetail,
	updateOrderDetail,
	CreateDish,
	PaymentMoMo,
	createZaloPayOrder,
	checkZaloPayOrderStatus,
	callbackZaloPayOrder,
};
