import express from "express";
import bodyParser from "body-parser";
import initWebRouters from "./routes/web";
import cors from "cors";
import connectDB from "../src/config/connectDB";
import cookieParser from "cookie-parser";
import passport from "passport";
// import configSession from "../src/config/session";
// import LoginWithGoogle from "../src/controllers/social/googleController";
// import LoginWithFacebook from "./controllers/social/facebookController";
require("dotenv").config();

let app = express();
app.use(cors({ credentials: true, origin: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
// configSession(app);
initWebRouters(app);

connectDB();
app.use((req, res) => {
	return res.send("404 Not Found");
});
// app.use(passport.initialize());
// app.use(passport.session());
// LoginWithGoogle();
// LoginWithFacebook();
let port = process.env.PORT || 6969;
app.listen(port, () => {
	console.log("Backend Nodejs is running on the port: " + port);
});
