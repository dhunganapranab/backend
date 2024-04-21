import express from "express";
const eventrouter = express.Router();
import EventController from "../controllers/eventController.js";

eventrouter.post("/createevent",EventController.createEvent);
eventrouter.get("/availableevents",EventController.getEvent);
eventrouter.post("/eventDetails",EventController.eventDetails);
eventrouter.get("/:eventId/memberdetails",EventController.getMembers);
eventrouter.post("/addRouteDetails/:eventId",EventController.createRoute);
eventrouter.get("/:eventId/routedetails",EventController.getRouteDetails);
eventrouter.delete("/:eventId/kickmembers/:memberId",EventController.kickMember);
eventrouter.get("/emergencies/:eventID",EventController.getEmergency);
eventrouter.get("/emergencyDetail/:emergencyId",EventController.getEmergencyDetails);
eventrouter.get("/:eventId/ratings",EventController.getEventRating);
export default eventrouter;