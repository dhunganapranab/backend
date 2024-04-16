import mongoose from 'mongoose';

const emergencySchema = new mongoose.Schema({
  eventID: { 
    type: String, 
    required: true },

  userName: {
     type: String,
      required: true },

  userID: {
      type: String,
      required: true,
  },

  userLocation:{
    type: String,
    required: true
  },
  
  message: { 
    type: String,
     required: true },
     
  time: { 
    type: String,
  required: true}
});

const EmergencyModel = mongoose.model('Emergency', emergencySchema);

export default EmergencyModel;