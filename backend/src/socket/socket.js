import { Server } from "socket.io";
import { handleUpdateTable } from "./apiSocket.js";
import { verifySocketToken } from "../middleware/JWT_Action.js";
let io;

const initSocket = (server) => {
	io = new Server(server, {
		cors: {
			origin: "*",
			methods: ["GET", "POST"],
		},
	});

	console.log("Socket server initialized and listening for connections");

	io.use(verifySocketToken);

	io.on("connection", (socket) => {
		console.log("Client connected:", socket.id, "User:", socket.user);

		socket.on("updateTable", async (data) => {
			await handleUpdateTable(data);
		});
	});
};

const getIO = () => {
	if (!io) throw new Error("Socket has not been initialized!");
	return io;
};

export { initSocket, getIO };
