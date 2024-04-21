import mongoose from "mongoose";

//Defining Schema
const userSchema = new mongoose.Schema({
    
    fullname:{
        type:String, 
        required:true,
    },

    email:{
        type:String,
        required:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
        trim:true
    },

    role:{
        type:String,
        required:true,
        trim:true
    },
    
    dateOfBirth :{
        type:String,
        required:true
    }
})

//Model
const UserModel = mongoose.model("user", userSchema);

export default UserModel;