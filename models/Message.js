import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  eventId: { 
    type: String, 
    required: true },

  senderName: {
     type: String,
      required: true },

  senderID: {
      type: String,
      required: true,
  },

  message: { 
    type: String,
     required: true },

  type: { type: String, 
    enum: ['ownMsg', 'otherMsg'],
     required: true },
     
  time: { 
    type: String,
  required: true}
});

const MessageModel = mongoose.model('Message', messageSchema);

export default MessageModel;