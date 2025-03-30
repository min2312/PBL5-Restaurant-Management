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
export { GetAllTable, CreateNewCustomer, CheckCustomer };
