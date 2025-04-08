import express from "express";
import userController from "../controllers/userController";
import adminController from "../controllers/adminController";
import { checkUserJWT, CreateJWT } from "../middleware/JWT_Action";
import passport from "passport";
import apiController from "../controllers/apiController";
import uploadCloud from "../middleware/Cloudinary_Multer";
let router = express.Router();

let initWebRoutes = (app) => {
	router.all("*", checkUserJWT);
	router.post("/api/login", userController.HandleLogin);
	router.post("/api/admin_login", adminController.HandleLoginAdmin);
	router.post("/api/logout", userController.HandleLogOut);
	router.post("/api/logoutAdmin", adminController.HandleLogOut);
	router.get("/api/get-all-table", apiController.HandleGetAllTable);
	router.get("/api/get-all-order", apiController.HandleGetAllOrder);
	router.get("/api/get-all-reservation", apiController.HandleGetAllReservation);
	// router.get("/api/get-all-slot", apiController.HandleGetAllSlot);
	// router.get("/api/get-info-car", userController.HandleGetInfoCar);
	router.get("/api/getAllDish", apiController.HandleGetAllDish);
	// router.get("/api/getAllCar_Ticket", apiController.HandleGetAllCar_Ticket);
	router.get("/api/account", userController.getUserAccount);
	router.get("/api/accountAdmin", adminController.getAdminAccount);
	// router.get("/api/getTypeTicket", apiController.HandleGetTypeTicket);
	// router.put("/api/edit-user", userController.HandleEditUser);
	router.post("/api/create-new-user", userController.HandleCreateNewUser);
	router.post("/api/create-new-order", apiController.HandleCreateNewOrder);
	router.post(
		"/api/create-new-dish",
		uploadCloud.single("image"),
		apiController.HandleCreateDish
	);
	router.post(
		"/api/create-new-customer",
		apiController.HandleCreateNewCustomer
	);
	router.post("/api/check-customer", apiController.HandleCheckCustomer);
	// router.post("/api/create-ticket", apiController.HandleCreatePayment);
	// router.post("/api/cancel-deposit", apiController.CancelDepositMoney);
	// router.post("/api/deposit-money", apiController.HandleDepositMoney);
	// router.post("/api/delete-ticket", apiController.HandleDeleteTicket);
	// router.post("/api/createTime", apiController.HandleCreateTime);
	// router.post("/api/checkTime", apiController.HandleCheckTime);
	// router.post("/api/updateSlot", apiController.UpdateSlot);
	// router.delete("/api/delete-user", userController.HandleDeleteUser);
	// router.post("/payment", apiController.HandlePaymentMoMo);
	// router.post("/payment/ZaloPay", apiController.handlePaymentZaloPay);
	// router.post("/payment/CheckZaloPay", apiController.handleCheckZaloPay);
	// router.post("/callback", apiController.handleCallBackZaloPay);
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

	return app.use("/", router);
};

module.exports = initWebRoutes;
