import express from "express";
import userController from "../controllers/userController";
import adminController from "../controllers/adminController";
import { checkUserJWT, CreateJWT } from "../middleware/JWT_Action";
import passport from "passport";
import apiController from "../controllers/apiController";
import uploadCloud from "../middleware/Cloudinary_Multer";
import {
	sendResetOTP,
	verifyResetOTP,
	resetPassword,
} from "../controllers/otpController.js";
let router = express.Router();

let initWebRoutes = (app) => {
	router.all("*", checkUserJWT);
	router.post("/api/login", userController.HandleLogin);
	router.post("/api/admin_login", adminController.HandleLoginAdmin);
	router.post("/api/logout", userController.HandleLogOut);
	router.post("/api/logoutAdmin", adminController.HandleLogOut);
	router.get("/api/get-all-table", apiController.HandleGetAllTable);
	router.get("/api/get-all-order", apiController.HandleGetAllOrder);
	router.get("/api/get-invoice", apiController.HandleGetInvoice);
	router.get("/api/get-all-invoice", apiController.HandleGetAllInvoice);
	router.get("/api/get-all-orderDetail", apiController.HandleGetAllOrderDetail);
	router.get("/api/get-all-reservation", apiController.HandleGetAllReservation);
	router.get(
		"/api/get-all-orderPending",
		apiController.HandleGetAllOrderPending
	);
	router.get("/api/getAllDiscounts", apiController.HandleGetAllDiscount);
	router.post("/api/update-discounts", apiController.HandleUpdateDiscounts);
	router.post("/api/create-discount", apiController.HandleCreateDiscount);
	router.post("/api/delete-discount", apiController.HandleDeleteDiscount);
	router.get("/api/getAllDish", apiController.HandleGetAllDish);
	router.get("/api/getAllCategory", apiController.HandleGetAllCategory);
	router.get("/api/account", userController.getUserAccount);
	router.get("/api/accountAdmin", adminController.getAdminAccount);
	router.get("/api/get-all-user", userController.HandleGetAllUser);
	router.put("/api/edit-user", userController.HandleEditUser);
	router.post("/api/create-new-user", userController.HandleCreateNewUser);
	router.post("/api/create-new-order", apiController.HandleCreateNewOrder);
	router.post("/api/order-status", apiController.HandleUpdateOrder);
	router.post("/api/create-invoice", apiController.HandleCreateInvoice);
	router.post(
		"/api/update-order-status",
		apiController.HandleUpdateOrderDetail
	);
	router.post(
		"/api/create-new-orderDetail",
		apiController.HandleCreateOrderDetail
	);
	router.post(
		"/api/create-new-dish",
		uploadCloud.single("image"),
		apiController.HandleCreateDish
	);
	router.post(
		"/api/update-dish",
		uploadCloud.single("image"),
		apiController.HandleEditDish
	);
	router.post("/api/delete-dish", apiController.HandleDeleteDish);
	router.post(
		"/api/create-new-customer",
		apiController.HandleCreateNewCustomer
	);
	router.post("/api/delete-customer", apiController.HandleDeleteCustomer);
	router.get("/api/get-all-customer", apiController.HandleGetAllCustomer);
	router.post("/api/edit-customer", apiController.HandleEditCustomer);
	router.post("/api/check-customer", apiController.HandleCheckCustomer);
	router.post("/api/update-customer", apiController.HandleUpdateCustomer);
	router.post("/api/update-discount", apiController.HandleUpdateDiscount);
	router.post("/api/create-new-table", apiController.HandleCreateTable);
	router.post("/api/update-table", apiController.HandleUpdateTable);
	router.post("/api/delete-table", apiController.HandleDeleteTable);
	router.delete("/api/delete-user", userController.HandleDeleteUser);
	// router.post("/payment", apiController.HandlePaymentMoMo);
	router.post("/payment/ZaloPay", apiController.handlePaymentZaloPay);
	router.post("/payment/CheckZaloPay", apiController.handleCheckZaloPay);
	router.post("/callback", apiController.handleCallBackZaloPay);
	// router.get(
	// 	"/auth/google",
	// 	passport.authenticate("google", { scope: ["profile", "email"] })
	// );

	// router.get(
	// 	"/google/redirect",
	// 	passport.authenticate("google", {
	// 		failureRedirect: "http://localhost:3000/login",
	// 	}),
	// 	function (req, res) {
	// 		const { user } = req;
	// 		if (user) {
	// 			let payload = {
	// 				id: user.id,
	// 				email: user.email,
	// 				fullName: user.fullName,
	// 			};
	// 			let token = CreateJWT(payload);

	// 			res.cookie("jwt", token, { httpOnly: true, secure: false });
	// 			res.cookie("loginSuccess", true, { httpOnly: false, secure: false });
	// 			res.redirect("http://localhost:3000/users");
	// 		} else {
	// 			res.redirect("http://localhost:3000/login");
	// 		}
	// 	}
	// );
	// app.get(
	// 	"/auth/facebook",
	// 	passport.authenticate("facebook", {
	// 		scope: "public_profile,email,user_friends",
	// 	})
	// );

	// app.get(
	// 	"/facebook/redirect",
	// 	passport.authenticate("facebook", {
	// 		failureRedirect: "http://localhost:3000/login",
	// 	}),
	// 	function (req, res) {
	// 		const { user } = req;
	// 		if (user) {
	// 			let payload = {
	// 				id: user.id,
	// 				email: user.email,
	// 				fullName: user.fullName,
	// 			};
	// 			let token = CreateJWT(payload);

	// 			res.cookie("jwt", token, { httpOnly: true, secure: false });
	// 			res.cookie("loginSuccess", true, { httpOnly: false, secure: false });
	// 			res.redirect("http://localhost:3000/users");
	// 		} else {
	// 			res.redirect("http://localhost:3000/login");
	// 		}
	// 	}
	// );

	router.post("/api/reset-otp/send", sendResetOTP);
	router.post("/api/reset-otp/verify", verifyResetOTP);
	router.post("/api/reset-password", resetPassword);

	return app.use("/", router);
};

module.exports = initWebRoutes;
