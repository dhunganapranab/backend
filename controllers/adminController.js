import mongoose from "mongoose";
import UserModel from '../models/User.js';
import EventModel from '../models/Event.js';
import MessageModel from '../models/Message.js';
import EmergencyModel from "../models/Emergency.js";

class AdminController{
    static getAllUsers = async(req,res)  => {
        try {
            // Query the database to get all users except for admin
            const users = await UserModel.find({ role: { $ne: '_admin' } });
            res.status(200).json(users);
          } catch (error) {
            res.status(500).json({ status: 'error', msg: error.message });
          }
    }

    static deleteUser = async(req,res) => {
      const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const userId = req.params.userId;

        // Check if the user exists
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete user-related data from all schemas
        await Promise.all([
            EventModel.deleteMany({ "creatorID": userId }),
            EventModel.updateMany({}, { $pull: { "members": { "userID": userId } } }),
            EventModel.updateMany({}, { $pull: { "ratings": { "userID": userId } } }),
        ]);

        // Delete the user
        await UserModel.findByIdAndDelete(userId);

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ msg: "User and associated data deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ msg: "Internal server error" });
    }
    }

    static deleteEvent = async(req, res) =>{
        const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const eventId = req.params.eventId;

        // Check if the event exists
        const event = await EventModel.findById(eventId);
        if (!event) {
            return res.status(404).json({ msg: "Event not found" });
        }

        // Delete event-related data from all schemas
        await Promise.all([
            EventModel.findByIdAndDelete(eventId),
            EmergencyModel.deleteMany({ "eventID": eventId }),
            MessageModel.deleteMany({ "eventId": eventId })
        ]);

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ msg: "Event and associated data deleted successfully" });
    } catch (error) {
        console.error("Error deleting event:", error);
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ msg: "Internal server error" });
    }
    }

    static getAllEmergencies = async(req,res) =>{
        try {
            // Query the database to retrieve all emergency details
            const emergencies = await EmergencyModel.find();
        
            // Send the retrieved emergency details as a response
            res.json(emergencies);
          } catch (error) {
            // If an error occurs, send an error response
            console.error('Error fetching emergency details:', error);
            res.status(500).json({ error: 'Internal server error' });
          }
    }
}

export default AdminController;