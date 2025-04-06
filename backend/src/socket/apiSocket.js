import { getIO } from "./socket";
import db from "../models/index";
import { ReservationTable } from "../service/apiService";
const handleUpdateTable = async (data) => {
	const io = getIO();

	if (data && data.table && data.status) {
		try {
			await ReservationTable(data);
			io.emit("tableUpdated", {
				table: data.table,
				status: data.status,
				customer: data.customer || null,
			});
			console.log("Table updated successfully:", data);
		} catch (error) {
			console.error("Failed to update table in the database:", error);
		}
	} else {
		console.warn("Invalid table update data received:", data);
	}
};

export { handleUpdateTable };
