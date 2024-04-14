import mongoose from "mongoose";

//Defining Schema
const eventSchema = new mongoose.Schema({
    eventName:{
        type:String, 
        required:true,
        trim:true
    },

    eventDescription:{
        type:String,
        required:true,
        trim:true
    },

    allowedParticipants:{
        type:String,
        required:true,
        trim:true
    },

    prerequisites:{
        type: String,
        required: true
    }
})

//Model
const EventModel = mongoose.model("events", eventSchema);

export default EventModel;