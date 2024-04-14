import express from "express";
const eventrouter = express.Router();
import EventController from "../controllers/eventController.js";

eventrouter.post("/createevent",EventController.createEvent);
eventrouter.get("/availableevents",EventController.getEvent);
eventrouter.post("/eventDetails",EventController.eventDetails);
eventrouter.get("/:eventId/memberdetails",EventController.getMembers);
eventrouter.post("/addRouteDetails/:eventId",EventController.createRoute);
eventrouter.get("/:eventId/routedetails",EventController.getRouteDetails);
eventrouter.delete("/:eventId/members/:memberId",EventController.kickMember);

export default eventrouter;