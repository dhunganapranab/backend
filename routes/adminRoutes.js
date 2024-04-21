import express from "express";
import AdminController from "../controllers/adminController.js";
const adminrouter = express.Router();

adminrouter.get("/getallusers",AdminController.getAllUsers);
adminrouter.get("/getallemergencies",AdminController.getAllEmergencies);
adminrouter.delete("/deleteuser/:userId",AdminController.deleteUser);
adminrouter.delete("/deleteevent/:eventId",AdminController.deleteEvent);

export default adminrouter;