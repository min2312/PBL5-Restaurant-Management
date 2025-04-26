import axios from "../setup/axios";

const GetAllTable = (InputId) => {
	return axios
		.get(`/api/get-all-table?id=${InputId}`)
		.then((response) => {
			return response;
		})
		.catch((err) => {
			console.log(err);
		});
};

const GetAllOrder = (InputId) => {
	return axios
		.get(`/api/get-all-order?id=${InputId}`)
		.then((response) => {
			return response;
		})
		.catch((err) => {
			console.log(err);
		});
};

const GetAllOrderPeding = () => {
	return axios
		.get("/api/get-all-orderPending")
		.then((response) => {
			return response;
		})
		.catch((err) => {
			console.log(err);
		});
};

const GetAllReservation = (InputId) => {
	return axios
		.get(`/api/get-all-reservation?id=${InputId}`)
		.then((response) => {
			return response;
		})
		.catch((err) => {
			console.log(err);
		});
};

const CreateNewCustomer = (customer) => {
	return axios
		.post("/api/create-new-customer", customer)
		.then((response) => {
			return response;
		})
		.catch((err) => {
			console.log(err);
		});
};

const CheckCustomer = (phoneNumber) => {
	return axios
		.post("/api/check-customer", { phoneNumber })
		.then((response) => {
			return response;
		})
		.catch((err) => {
			console.log(err);
		});
};

const CreateNewOrder = (data) => {
	return axios
		.post("/api/create-new-order", data)
		.then((response) => {
			return response;
		})
		.catch((err) => {
			console.log(err);
		});
};

const CreateNewOrderDetail = (data) => {
	return axios
		.post("/api/create-new-orderDetail", data)
		.then((response) => {
			return response;
		})
		.catch((err) => {
			console.log(err);
		});
};

const GetAllDish = (InputId) => {
	return axios
		.get(`/api/getAllDish?id=${InputId}`)
		.then((response) => {
			return response;
		})
		.catch((err) => {
			console.log(err);
		});
};

const GetAllOrderDetail = (InputId) => {
	return axios
		.get(`/api/get-all-orderDetail?id=${InputId}`)
		.then((response) => {
			return response;
		})
		.catch((err) => {
			console.log(err);
		});
};

const UpdateOrderDetail = (data) => {
	return axios
		.post("/api/update-order-status", data)
		.then((response) => {
			return response;
		})
		.catch((err) => {
			console.log(err);
		});
};

const UpdateOrder = (data) => {
	return axios
		.post("/api/order-status", data)
		.then((response) => {
			return response;
		})
		.catch((err) => {
			console.log(err);
		});
};

const CreateInvoice = (data) => {
	return axios
		.post("/api/create-invoice", data)
		.then((response) => {
			return response;
		})
		.catch((err) => {
			console.log(err);
		});
};

const GetInvoice = (InputId) => {
	return axios
		.get(`/api/get-invoice?id=${InputId}`)
		.then((response) => {
			return response;
		})
		.catch((err) => {
			console.log(err);
		});
};

const UpdateCustomer = (data) => {
	return axios
		.post("/api/update-customer", data)
		.then((response) => {
			return response;
		})
		.catch((err) => {
			console.log(err);
		});
};

const UpdateDiscount = (data) => {
	return axios
		.post("/api/update-discount", data)
		.then((response) => {
			return response;
		})
		.catch((err) => {
			console.log(err);
		});
};

const PaymentZaloPay = async (user) => {
	return axios.post("/payment/ZaloPay", user);
};

const CheckPayment = async (apptransid) => {
	return axios.post("/payment/CheckZaloPay", { app_trans_id: apptransid });
};

export {
	GetAllTable,
	GetAllDish,
	CreateNewCustomer,
	CheckCustomer,
	CreateNewOrder,
	CreateNewOrderDetail,
	GetAllOrder,
	GetAllOrderPeding,
	GetAllReservation,
	GetAllOrderDetail,
	UpdateOrderDetail,
	UpdateOrder,
	CreateInvoice,
	GetInvoice,
	UpdateCustomer,
	UpdateDiscount,
	PaymentZaloPay,
	CheckPayment,
};
