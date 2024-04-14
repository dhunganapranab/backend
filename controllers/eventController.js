import partyModel from "../models/Event.js";
import EventModel from "../models/Event.js";

class EventController{

    static createEvent = async(req,res)=>{
        const {eventName, eventDescription, allowedParticipants, prerequisites}= req.body;

        const event = await EventModel.findOne({eventName:eventName});

        if (event){
            res.status(400).send({"status":"failed", "message":"Event name already exists"});
        } else{
            if(eventName || eventDescription || allowedParticipants || prerequisites){
                console.log("block 1");
                try {
                    const newEvent = new EventModel({
                        eventName: eventName,
                        eventDescription: eventDescription,
                        allowedParticipants: allowedParticipants,
                        prerequisites: prerequisites
                    });
                    await newEvent.save();
                    res.status(201).send({"status":"success", "message":"Event created successfully"});

                } catch (error) {
                    console.log(error);
                    res.status(500).send({"status":"failed", "message":"Internal server error"});
                }
            } else{
                res.send({"status":"failed", "message":"problem registering the event"});
            }
        }
    }

    static getEvent =  async (req, res)=> {
          try {
            const events = await EventModel.find();
            res.status(200).json(events);
          } catch (error) {
            console.error('Error fetching events:', error);
            res.status(500).json({ message: 'Internal server error' });
          }
        }
}

export default EventController;