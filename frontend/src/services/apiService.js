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

export { GetAllTable };
