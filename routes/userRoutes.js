import express from "express";
const userrouter = express.Router();
import UserController from "../controllers/userController.js";
import checkUserAuth from "../middlewares/auth-middleware.js";

// Route Level Middleware - To Protect Route
userrouter.use("/changepassword",checkUserAuth);

//public routes
userrouter.post("/register",UserController.userRegistration);
userrouter.post("/login",UserController.userLogin);
userrouter.post("/send-reset-pass-email",UserController.sendResetPassEmail);
userrouter.post("/reset-password/:id/:token",UserController.userPasswordReset);

//protected routes
userrouter.post("/changepassword",UserController.changeUserPassword);



export default userrouter;