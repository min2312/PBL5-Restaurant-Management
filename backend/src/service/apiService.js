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
require("dotenv").config();

let CreateNewCar = (data, user) => {
	return new Promise(async (resolve, reject) => {
		try {
			let cars = Array.isArray(data) ? data : [data];
			for (let i = 0; i < cars.length; i++) {
				let car = cars[i];
				let check = await CheckLicensePlate(car.license_plate);
				if (check === true) {
					resolve({
						errCode: 1,
						errMessage: "Your License Plate has exist",
					});
				} else {
					let User = await getAllUser(user.id);
					await db.Car.create({
						//(value my sql): (value name-html)
						name: car.name,
						license_plate: car.license_plate,
						type: car.type,
						id_user: User.id,
					});
				}
			}
			resolve({
				errCode: 0,
				message: "Create success",
			});
		} catch (e) {
			reject(e);
		}
	});
};

let GetAllCar = (Idcar) => {
	return new Promise(async (resolve, reject) => {
		try {
			let iduser = Array.isArray(Idcar) ? Idcar : Idcar.split(",");
			let allCar = [];
			for (let i = 0; i < iduser.length; i++) {
				let data = await db.Car.findAll({
					attributes: [
						"id_car",
						"name",
						"license_plate",
						"type",
						"inTime",
						"outTime",
						"id_user",
						"id_reservation",
						"createdAt",
						"updatedAt",
					],
					where: { id_user: iduser[i] },
					include: [
						{
							model: db.Reservation,
							attributes: ["type", "price"],
						},
					],
				});
				let data_noReservation = await db.Car.findAll({
					where: { id_user: iduser[i], id_reservation: null },
				});
				for (let car of data) {
					let payment = await db.Payment.findAll({
						where: { id_car: car.id_car },
						attributes: ["paymentDate"],
					});
					if (payment.length > 0) {
						allCar.push({
							...car.toJSON(),
							paymentDate: payment[0].paymentDate,
						});
					}
				}
				allCar = allCar.concat(data_noReservation);
			}
			resolve(allCar);
		} catch (e) {
			reject(e);
		}
	});
};
let GetCar_Ticket = (id_user) => {
	return new Promise(async (resolve, reject) => {
		try {
			let iduser = Array.isArray(id_user) ? id_user : id_user.split(",");
			let allCar = [];
			for (let i = 0; i < iduser.length; i++) {
				let data = await db.Car.findAll({
					attributes: [
						"id_car",
						"name",
						"license_plate",
						"type",
						"inTime",
						"outTime",
						"id_user",
						"id_reservation",
						"createdAt",
						"updatedAt",
					],
					where: {
						id_user: iduser[i],
						id_reservation: { [db.Sequelize.Op.ne]: null },
					},
					include: [
						{
							model: db.Reservation,
							attributes: ["type", "price"],
						},
					],
				});
				for (let car of data) {
					let payment = await db.Payment.findAll({
						where: { id_car: car.id_car },
						attributes: ["paymentDate"],
					});
					if (payment.length > 0) {
						allCar.push({
							...car.toJSON(),
							paymentDate: payment[0].paymentDate,
						});
					}
				}
			}
			resolve(allCar);
		} catch (e) {
			reject(e);
		}
	});
};
let DeleteTicket = (id_car) => {
	return new Promise(async (resolve, reject) => {
		try {
			let carId = typeof id_car === "object" ? Object.keys(id_car)[0] : id_car;
			let payment = await db.Payment.findOne({
				where: { id_car: carId },
			});
			if (payment) {
				await db.Payment.destroy({
					where: { id_car: carId },
				});
				await db.Car.update(
					{ id_reservation: null, inTime: null, outTime: null },
					{ where: { id_car: carId } }
				);
				resolve({
					errCode: 0,
					message: `The Ticket is deleted`,
				});
			} else {
				resolve({
					errCode: 2,
					errMessage: `The Ticket isn't exist`,
				});
			}
		} catch (e) {
			reject(e);
		}
	});
};
let CancelDeposit = (data) => {
	return new Promise(async (resolve, reject) => {
		try {
			let user = await db.User.findOne({
				where: { id: data.id_user },
			});
			let money = parseFloat(user.price) - parseFloat(data.amount);
			if (user.price) {
				await db.User.update({ price: money }, { where: { id: data.id_user } });
			}
			resolve({
				errCode: 0,
				errMessage: `Cancel Deposit Money`,
			});
		} catch (e) {
			reject(e);
		}
	});
};
let DeleteCar = (User_id) => {
	return new Promise(async (resolve, reject) => {
		try {
			let car = await db.Car.findOne({
				where: { id_user: User_id },
			});
			if (car) {
				await db.Car.destroy({
					where: { id_user: User_id },
				});
				resolve({
					errCode: 0,
					message: `The User is deleted`,
				});
			} else {
				resolve({
					errCode: 2,
					errMessage: `The car isn't exist`,
				});
			}
		} catch (e) {
			reject(e);
		}
	});
};
let GetTicketType = (typeTicket) => {
	return new Promise(async (resolve, reject) => {
		try {
			let ticket = await db.Reservation.findOne({
				where: { type: typeTicket },
			});
			resolve(ticket);
		} catch (e) {
			reject(e);
		}
	});
};
const formatDateForDatabase = (dateString) => {
	const [day, month, year] = dateString.split("/");
	return `${year}-${month}-${day}`;
};
let CreatePayment = (data) => {
	return new Promise(async (resolve, reject) => {
		try {
			let date = formatDateForDatabase(data.paymentDate);
			let currentDate = new Date();
			let car_account = await db.Car.findOne({
				where: { license_plate: data.licenseplate },
			});
			let reservation = await db.Reservation.findOne({
				where: { type: data.type },
			});
			if (!car_account) {
				return resolve({
					errCode: 1,
					errMessage: "Car not found.",
				});
			}
			let payment = await db.Payment.findOne({
				where: { id_car: car_account.id_car },
			});
			if (payment) {
				let paymentDate = new Date(payment.paymentDate);
				if (paymentDate >= currentDate) {
					return resolve({
						errCode: 2,
						errMessage: "Payment is still valid, cannot create a new ticket.",
					});
				} else {
					await db.Payment.update(
						{
							amount: data.price,
							paymentDate: date,
							id_car: car_account.id_car,
						},
						{ where: { id_payment: payment.id_payment } }
					);
					resolve({
						errCode: 0,
						errMessage: "Ticket updated successfully.",
					});
				}
			} else {
				if (reservation) {
					await db.Payment.create({
						amount: data.price,
						paymentDate: date,
						id_car: car_account.id_car,
					});
					await db.Car.update(
						{ id_reservation: reservation.id_reservation },
						{ where: { id_car: car_account.id_car } }
					);
					resolve({
						errCode: 0,
						errMessage: "Ticket created successfully.",
					});
				} else {
					resolve({
						errCode: 1,
						errMessage: "Missing required reservation information!",
					});
				}
			}
		} catch (e) {
			reject(e);
		}
	});
};
let CreateTimeCar = (LicensePlate) => {
	return new Promise(async (resolve, reject) => {
		try {
			let check = await CheckLicensePlate(LicensePlate);
			let checkslot = await db.ParkingSpot.findAll({
				where: { status: "INACTIVE" },
			});
			if (check) {
				let car = await db.Car.findOne({
					where: { license_plate: LicensePlate },
				});

				if (!car.id_reservation) {
					resolve({
						errCode: -1,
						errMessage: "Not Have Ticket",
					});
				} else {
					const recentCheck = new Date();
					recentCheck.setHours(recentCheck.getHours() + 7);
					let carTicket = await GetCar_Ticket(`${car.id_user}`);
					if (carTicket.length > 0) {
						let expiredCar = carTicket.find(
							(ticket) => ticket.license_plate === car.license_plate
						);
						if (expiredCar.paymentDate < recentCheck) {
							resolve({
								errCode: 2,
								errMessage: "Expired Ticket",
							});
						} else {
							if (!car.inTime) {
								if (checkslot.length === 0) {
									resolve({
										errCode: 3,
										errMessage: "FULL SLOT. WAIT",
									});
								} else {
									await db.Car.update(
										{
											inTime: recentCheck,
										},
										{ where: { id_car: car.id_car } }
									);
									resolve({
										errCode: 0,
										errMessage: car.license_plate,
									});
								}
							} else if (!car.outTime) {
								await db.Car.update(
									{
										outTime: recentCheck,
									},
									{ where: { id_car: car.id_car } }
								);
								resolve({
									errCode: 0,
									errMessage: `Good Bye-${car.license_plate}`,
								});
							} else {
								if (car.inTime > car.outTime) {
									await db.Car.update(
										{
											outTime: recentCheck,
										},
										{ where: { id_car: car.id_car } }
									);
									resolve({
										errCode: 0,
										errMessage: `Good Bye-${car.license_plate}`,
									});
								} else {
									if (checkslot.length === 0) {
										resolve({
											errCode: 3,
											errMessage: "FULL SLOT. WAIT",
										});
									} else {
										await db.Car.update(
											{
												inTime: recentCheck,
											},
											{ where: { id_car: car.id_car } }
										);
										resolve({
											errCode: 0,
											errMessage: car.license_plate,
										});
									}
								}
							}
						}
					}
				}
			} else {
				resolve({
					errCode: 1,
					errMessage: "Car Not Exist",
				});
			}
		} catch (error) {
			reject(error);
		}
	});
};
let CheckTimeCar = (LicensePlate) => {
	return new Promise(async (resolve, reject) => {
		try {
			let check = await db.Car.findOne({
				where: { license_plate: LicensePlate },
			});
			let checkslot = await db.ParkingSpot.findAll({
				where: { status: "INACTIVE" },
			});
			if (!check) {
				resolve({
					errCode: 1,
					errMessage: "Car Not Exist",
				});
				return;
			}
			const recentCheck = new Date();
			recentCheck.setHours(recentCheck.getHours() + 7);
			if (!check.inTime) {
				if (checkslot.length === 0) {
					resolve({
						errCode: 3,
						errMessage: "FULL SLOT. WAIT",
					});
				} else {
					await db.Car.update(
						{ inTime: recentCheck },
						{ where: { id_car: check.id_car } }
					);
					resolve({
						errCode: 0,
						errMessage: check.license_plate,
					});
				}
			} else if (!check.outTime) {
				// Tính thời gian đỗ xe
				let inTime = new Date(check.inTime);
				let duration = (recentCheck - inTime) / (1000 * 60 * 60); // Thời gian đỗ xe tính bằng giờ
				// Tính phí đỗ xe
				let price = 5000;
				if (duration > 1) {
					price += Math.ceil(duration - 1) * 5000;
				}
				let user = await db.User.findOne({ where: { id: check.id_user } });
				if (user && user.price >= price) {
					let money = parseFloat(user.price) - parseFloat(price);
					await db.Car.update(
						{ outTime: recentCheck },
						{ where: { id_car: check.id_car } }
					);
					await db.User.update(
						{ price: money },
						{ where: { id: check.id_user } }
					);
					resolve({
						errCode: 0,
						errMessage: `Good Bye-${check.license_plate}\nFee: ${price} VND`,
					});
				} else {
					resolve({
						errCode: 4,
						errMessage: "Not Enough Money",
					});
				}
			} else {
				if (check.inTime > check.outTime) {
					// Tính thời gian đỗ xe
					let inTime = new Date(check.inTime);
					let duration = (recentCheck - inTime) / (1000 * 60 * 60); // Thời gian đỗ xe tính bằng giờ
					// Tính phí đỗ xe
					let price = 5000;
					if (duration > 1) {
						price += Math.ceil(duration - 1) * 5000;
					}
					let user = await db.User.findOne({ where: { id: check.id_user } });
					if (user && user.price >= price) {
						let money = parseFloat(user.price) - parseFloat(price);
						await db.Car.update(
							{ outTime: recentCheck },
							{ where: { id_car: check.id_car } }
						);
						await db.User.update(
							{ price: money },
							{ where: { id: check.id_user } }
						);
						resolve({
							errCode: 0,
							errMessage: `Good Bye-${check.license_plate}\nFee: ${price} VND`,
						});
					} else {
						resolve({
							errCode: 4,
							errMessage: `Not Enough Money\nFee: ${price} VND`,
						});
					}
				} else {
					if (checkslot.length === 0) {
						resolve({
							errCode: 3,
							errMessage: "FULL SLOT. WAIT",
						});
					} else {
						await db.Car.update(
							{
								inTime: recentCheck,
							},
							{ where: { id_car: check.id_car } }
						);
						resolve({
							errCode: 0,
							errMessage: check.license_plate,
						});
					}
				}
			}
		} catch (error) {
			reject(error);
		}
	});
};

let CheckLicensePlate = (LicensePlate) => {
	return new Promise(async (resolve, reject) => {
		try {
			let data = await db.Car.findOne({
				attributes: [
					"id_car",
					"name",
					"license_plate",
					"type",
					"inTime",
					"outTime",
					"id_user",
					"id_reservation",
					"createdAt",
					"updatedAt",
				],
				where: { license_plate: LicensePlate },
			});
			if (data) {
				resolve(true);
			} else {
				resolve(false);
			}
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
let getSlotCar = () => {
	return new Promise(async (resolve, reject) => {
		try {
			let slots = await db.ParkingSpot.findAll();
			resolve(slots);
		} catch (e) {
			reject(e);
		}
	});
};
let updateSlot = (data) => {
	return new Promise(async (resolve, reject) => {
		try {
			let match = data.match(/([A-Z]+)(\d+)/);
			if (match) {
				let status = match[1]; // Chữ
				let number = match[2]; // Số
				let slots = await db.ParkingSpot.update(
					{
						status: status,
					},
					{ where: { id_parkingspot: number }, silent: false }
				);
				resolve({
					errCode: 0,
					errMessage: "OK",
				});
			}
		} catch (e) {
			reject(e);
		}
	});
};

let DepositMoney = (data) => {
	return new Promise(async (resolve, reject) => {
		try {
			let user = await db.User.findOne({
				where: { id: data.id_user },
			});
			let money = parseFloat(user.price) + parseFloat(data.price);
			if (user.price) {
				await db.User.update(
					{
						price: money,
					},
					{
						where: { id: data.id_user },
					}
				);
			} else {
				await db.User.update(
					{ price: data.price },
					{
						where: { id: data.id_user },
					}
				);
			}
			resolve({
				errCode: 0,
				errMessage: "Deposit Money successfully.",
			});
		} catch (e) {
			reject(e);
		}
	});
};
module.exports = {
	CreateNewCar,
	GetAllCar,
	DeleteCar,
	DeleteTicket,
	GetTicketType,
	CreatePayment,
	GetCar_Ticket,
	CreateTimeCar,
	PaymentMoMo,
	createZaloPayOrder,
	checkZaloPayOrderStatus,
	callbackZaloPayOrder,
	getSlotCar,
	updateSlot,
	DepositMoney,
	CancelDeposit,
	CheckTimeCar,
};
