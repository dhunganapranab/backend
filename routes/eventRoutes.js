import express from "express";
const eventrouter = express.Router();
import EventController from "../controllers/eventController.js";

eventrouter.post("/createevent",EventController.createEvent);
eventrouter.post("/availableevents",EventController.getEvent);

export default eventrouter;