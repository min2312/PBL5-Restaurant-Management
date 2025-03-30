import { getIO } from "./socket";
import db from "../models/index";

const handleUpdateTable = async (data) => {
	const io = getIO();

	if (data && data.tableNumber && data.status) {
		try {
			await db.Table.update(
				{ status: data.status },
				{ where: { tableNumber: data.tableNumber } }
			);

			io.emit("tableUpdated", data);
			console.log("Table updated successfully:", data);
		} catch (error) {
			console.error("Failed to update table in the database:", error);
		}
	} else {
		console.warn("Invalid table update data received:", data);
	}
};

export { handleUpdateTable };
