import express from "express";
import  jwt  from "jsonwebtoken";
const userrouter = express.Router();
import UserController from "../controllers/userController.js";
import {checkUserAuth,auth} from "../middlewares/auth-middleware.js"; 
import UserModel from "../models/User.js";

// Route Level Middleware - To Protect Route
userrouter.use("/changepassword",checkUserAuth);

//public routes
userrouter.post("/register",UserController.userRegistration);
userrouter.post("/login",UserController.userLogin);
userrouter.post("/send-reset-pass-email",UserController.sendResetPassEmail);
userrouter.post("/reset-password/:id/:token",UserController.userPasswordReset);

//protected routes
userrouter.post("/changepassword",UserController.changeUserPassword);
userrouter.post("/joinevent",UserController.joinEvent);
userrouter.get("/:userId/myevent",UserController.getMyEvent);
userrouter.get("/createdEvent/:userId",UserController.createdEventDetails);
userrouter.post("/tokenIsValid",async(req,res) => {
try {
    const token = req.header('userToken');
    if(!token) return res.json(false);
    const verified = jwt.verify(token,process.env.JWT_SECRET_KEY);
    if(!verified) return res.json(false);

    const user = await UserModel.findById(verified.userID);
    if(!user) return res.json(false);
    res.json(true);

} catch (e) {
    res.status(500).json({error:e.message});
}
});

userrouter.get("/",auth,async(req,res) => {
    const user = await UserModel.findById(req.user);
    res.json({...user._doc, token: req.token});
})




export default userrouter;