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

export {
	GetAllTable,
	GetAllDish,
	CreateNewCustomer,
	CheckCustomer,
	CreateNewOrder,
	GetAllOrder,
	GetAllReservation,
};
