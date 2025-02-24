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
	if (cookies && cookies.jwt) {
		let token = cookies.jwt;
		let decoded = verifyToken(token);
		if (decoded) {
			req.user = decoded;
			req.token = token;
			next();
		} else {
			return res.status(401).json({
				errCode: -1,
				errMessage: "Not Authencated the user",
			});
		}
	} else {
		return res.status(401).json({
			errCode: -1,
			errMessage: "Not Authencated the user",
		});
	}
};

module.exports = {
	CreateJWT,
	verifyToken,
	checkUserJWT,
};
