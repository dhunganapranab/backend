import EventModel from "../models/Event.js";

class EventController{

    static createEvent = async(req,res)=>{
        const {eventName, eventDescription, allowedParticipants, prerequisites, eventDate, creatorName, creatorID }= req.body;

        const event = await EventModel.findOne({eventName:eventName});

        if (event){
            res.status(400).json({status:"failed", msg:"Event name already exists. Provide new name."});
        } else{
            if(eventName && eventDescription && allowedParticipants &&  prerequisites && eventDate && creatorName && creatorID){
                try {
                    const newEvent = new EventModel({
                        eventName: eventName,
                        eventDescription: eventDescription,
                        allowedParticipants: allowedParticipants,
                        prerequisites: prerequisites,
                        eventDate: eventDate,
                        creatorName: creatorName,
                        creatorID: creatorID
                    });
                    await newEvent.save();
                    res.status(201).json({status:"success", msg:"Event created successfully",...newEvent._doc});

                } catch (error) {
                    console.log(error);
                    res.status(500).send({"status":"failed", "message":"Internal server error"});
                }
            } else{
                res.send({"status":"failed", "message":"problem registering the event"});
            }
        }
    }

    static getEvent =  async (req,res)=> {
          try {
            const events = await EventModel.find({});
            res.status(200).json(events);
          } catch (error) {
            res.status(500).json({ message: error});
          }
        }

    static eventDetails = async (req, res) =>{
        const{eventID} = req.body;
        const event = await EventModel.findOne({_id: eventID});

        if(event){
            res.status(200).json({...event._doc})
        }
    }

    static getMembers  = async(req, res) =>{
        try {
            const {eventId} = req.params;
        
            // Find the event by ID
            const event = await EventModel.findById(eventId);
        
            if (!event) {
              return res.status(404).json({ msg: "Event not found" });
            }
        
            // Extract members' details from the event object
            const members = event.members;
        
            // Return the members' details
            res.status(200).json(members);

          } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ msg: "Internal Server Error" });
          }
    }

    static kickMember = async(req, res) =>{
      try {
        const eventId = req.params.eventId;
        const memberId = req.params.memberId;
    
        console.log('Deleting member', memberId, 'from event', eventId);
    
        const updatedEvent = await EventModel.findByIdAndUpdate(
          eventId,
          { $pull: { members:{ _id: memberId}}},
          { new: true }
        );
    
        if (!updatedEvent) {
          return res.status(404).json({ message: 'Event not found' });
        }

        res.json({msg:"You have kicked the member.",updatedEvent});
      } catch (error) {
        console.error('Error removing member from event:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }

    static createRoute = async (req, res) => {
        try{
            const eventId = req.params.eventId;
            const { routeName, startPointCoordinates, destinationPointCoordinates} = req.body;
        
            // Find the event by eventId
            const event = await EventModel.findById(eventId);
        
            if (!event) {
              return res.status(404).json({ msg: "Event not found" });
            }
            
            if(startPointCoordinates == destinationPointCoordinates){
              return res.status(400).json({ msg: "Start and destination points cannot be the same."});
            }
            // Add route details to the event
            event.routeDetails = { routeName, startPointCoordinates, destinationPointCoordinates };
            await event.save();
        
            res.status(200).json({ msg: "Route details has been added successfully"});
          } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ msg: "Internal Server Error" });
          }
    }

    static getRouteDetails = async(req, res) => {
      const eventId = req.params.eventId;

      try {
        // Find the event by its ID
        const event = await EventModel.findById(eventId);

        if (!event) {
          // If event not found, return 404 Not Found
          return res.status(404).json({ error: 'Event not found' });
        }

        // Extract and return the route details from the event
        const routeDetails = event.routeDetails;
        res.status(200).json(routeDetails);
      } catch (error) {
        console.error('Error fetching route details:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
  }

}

export default EventController;