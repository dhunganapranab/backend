import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import connectDB from './config/connectDB.js';
import userrouter from "./routes/userRoutes.js";
import eventrouter from './routes/eventRoutes.js'; 


const app = express();
const port = process.env.PORT;
const DB_URL = process.env.DB_URL;

//cors policy
app.use(cors());

//Database Connection
connectDB(DB_URL);

//JSON
app.use(express.json());

//load routes
app.use("/api/user",userrouter);
app.use("/api/events",eventrouter);

app.listen(port,()=> {
    console.log(`Server is listening at ${port}`);
})


