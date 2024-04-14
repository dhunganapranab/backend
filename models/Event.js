import mongoose from "mongoose";

// Defining Schema
const eventSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: true,
        trim: true
    },
    eventDescription: {
        type: String,
        required: true,
        trim: true
    },
    allowedParticipants: {
        type: String,
        required: true,
        trim: true
    },
    prerequisites: {
        type: String,
        required: true
    },
    routeDetails:{
        routeName:{
            type: String,
            trim: true
        },
        startPointCoordinates: {
            type: String,
            trim: true
        },
        destinationPointCoordinates:{
            type: String,
            trim: true
        },
    },
    eventDate: {
        type: Date,
        required: true
    },
    creatorName: {
        type: String,
        required: true,
        trim: true
    },
    creatorID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    members: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true
        },
        userID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    }]
});

// Model
const EventModel = mongoose.model("events", eventSchema);

export default EventModel;
