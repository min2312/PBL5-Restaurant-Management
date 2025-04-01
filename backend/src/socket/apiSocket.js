import { getIO } from "./socket";
import db from "../models/index";
import { ReservationTable } from "../service/apiService";
const handleUpdateTable = async (data, user) => {
	const io = getIO();

	if (data && data.table && data.status) {
		try {
			await ReservationTable(data);
			if (user.role === "waiter") {
				io.emit("tableUpdated", data, user);
			} else {
				io.emit("tableUpdated", data);
			}
			console.log("Table updated successfully:", data);
		} catch (error) {
			console.error("Failed to update table in the database:", error);
		}
	} else {
		console.warn("Invalid table update data received:", data);
	}
};

export { handleUpdateTable };
