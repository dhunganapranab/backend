import mongoose from "mongoose";

const connectDB = async(DB_URL) =>{
    try{
        const DB_OPTIONS = {
            dbName: "fyp"
        }
        await mongoose.connect(DB_URL,DB_OPTIONS)
        console.log("connected successfully....");
    } catch(error){
        console.log(error);
    }
}

export default connectDB;