import axios from "../setup/axios";
const LoginUser = (data) => {
	return axios
		.post("/api/login", data)
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.error(error);
		});
};

const CreateNewUser = (data) => {
	return axios
		.post("/api/create-new-user", data)
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.error(error);
		});
};
const GetAllUser = (InputId) => {
	return axios
		.get(`/api/get-all-user?id=${InputId}`)
		.then((response) => {
			return response;
		})
		.catch((err) => {
			console.log(err);
		});
};
const getUserAccount = () => {
	return axios.get("/api/account");
};
const LogOutUser = () => {
	return axios.post("/api/logout");
};
const EditUserService = (user_edit) => {
	return axios.put("/api/edit-user", user_edit);
};
const DeleteUser = (idUser) => {
	return axios.delete("/api/delete-user", { data: { id: idUser } });
};
export {
	LoginUser,
	CreateNewUser,
	GetAllUser,
	getUserAccount,
	LogOutUser,
	EditUserService,
	DeleteUser,
};
