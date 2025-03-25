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
module.exports = { HandleGetAllTable };
