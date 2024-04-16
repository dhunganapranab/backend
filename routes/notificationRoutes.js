import NotificationController from "../controllers/pushNotificationController.js";
import express from "express";
const notificationRouter = express.Router();

notificationRouter.get('/SendNotification',NotificationController.sendNotification);
notificationRouter.post('/SendNotificationToDevice',NotificationController.sendNotificationToDevice);

export default notificationRouter;