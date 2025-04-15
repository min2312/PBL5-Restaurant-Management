import jwt from "jsonwebtoken";
require("dotenv").config();

const nonSecurePaths = [
	"/api/login",
	"/api/create-new-user",
	"/api/logout",
	"/api/admin_login",
	"/api/createTime",
	"/payment",
	"/payment/ZaloPay",
	"/payment/CheckZaloPay",
	"/callback",
	"/api/updateSlot",
	"/api/checkTime",
	"/google/redirect",
	"/auth/google",
];

const CreateJWT = (payload) => {
	let key = process.env.JWT_Secrect;
	let token = null;
	try {
		token = jwt.sign(payload, key, { expiresIn: process.env.JWT_Expires_In });
	} catch (e) {
		console.log(e);
	}
	return token;
};

const verifyToken = (token) => {
	let key = process.env.JWT_Secrect;
	let decoded = null;
	try {
		decoded = jwt.verify(token, key);
	} catch (e) {
		if (e.name === "TokenExpiredError") {
			return { error: "TokenExpiredError", message: "Token has expired" };
		}
		console.log(e);
	}
	return decoded;
};

const checkUserJWT = (req, res, next) => {
	const isNgrokRequest =
		req.headers["x-forwarded-host"] &&
		req.headers["x-forwarded-host"].includes("ngrok.io");
	if (nonSecurePaths.includes(req.path) || isNgrokRequest) {
		return next();
	}
	let cookies = req.cookies;
	if (cookies && (cookies.jwt || cookies.jwt2)) {
		if (cookies.jwt) {
			let token = cookies.jwt;
			let decoded = verifyToken(token);
			if (decoded.error === "TokenExpiredError") {
				return res.status(401).json({
					errCode: -2,
					errMessage: "Token has expired. Please log in again.",
				});
			}
			if (decoded) {
				req.user = decoded;
				req.token = token;
			} else {
				return res.status(401).json({
					errCode: -2,
					errMessage: "Not Authenticated the user",
				});
			}
		}
		if (cookies.jwt2) {
			let token = cookies.jwt2;
			let decoded = verifyToken(token);
			if (decoded.error === "TokenExpiredError") {
				return res.status(401).json({
					errCode: -1,
					errMessage: "Token has expired. Please log in again.",
				});
			}
			if (decoded) {
				req.admin = decoded;
				req.adminToken = token;
			} else {
				return res.status(401).json({
					errCode: -1,
					errMessage: "Not Authenticated the user",
				});
			}
		}
		next();
	} else {
		return res.status(401).json({
			errCode: -2,
			errMessage: "Not Authenticated the user",
		});
	}
};

const verifySocketToken = (socket, next) => {
	const token = socket.handshake.headers.authorization?.split(" ")[1];
	if (!token) {
		return next(new Error("Authentication error: Token is missing"));
	}

	const decoded = verifyToken(token);
	if (decoded && decoded.error === "TokenExpiredError") {
		return next(new Error("Authentication error: Token has expired"));
	}
	if (!decoded) {
		return next(new Error("Authentication error: Invalid token"));
	}

	socket.user = decoded;
	next();
};

module.exports = {
	CreateJWT,
	verifyToken,
	checkUserJWT,
	verifySocketToken,
};
