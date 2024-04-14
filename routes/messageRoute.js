import express from "express";
import MessageController from "../controllers/MessageController.js";
const chatrouter = express.Router();

chatrouter.get("/:eventId/messagehistory",MessageController.getMessage);

export default chatrouter;