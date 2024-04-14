import EventModel from "../models/Event.js";
import MessageModel from "../models/Message.js";
class MessageController{

  static getMessage = async(req,res)  => {
    const {eventId} = req.params;

    const event = await EventModel.findById(eventId);
    if(!event) {
      res.status(404).json({ msg:"event not found" });
    } else {
      try {
        const messages = await MessageModel.find({ eventId }).sort({ timestamp: 'asc' });
        res.status(200).json(messages);
      } catch (error) {
        console.error('Error retrieving messages:', error);
        res.status(500).json({ msg: 'Internal server error' });
      }
    }
  }
}
export default MessageController;