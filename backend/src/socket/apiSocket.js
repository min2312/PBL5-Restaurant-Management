import { getIO } from "./socket";
import db from "../models/index";

const handleUpdateTable = async (data) => {
	const io = getIO();

	if (data && data.table && data.status) {
		try {
			await db.Table.update(
				{ status: data.status },
				{ where: { tableNumber: data.table.tableNumber } }
			);
			if (data.customer) {
				let newReservation = await db.Reservation.create({
					customerId: data.customer.id,
					tableId: data.table.id,
				});
			}
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
