import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import connectDB from './config/connectDB.js';
import userrouter from "./routes/userRoutes.js";
import eventrouter from './routes/eventRoutes.js'; 
import {createServer} from 'http';
import {Server} from 'socket.io';
import chatrouter from './routes/messageRoute.js';
import notificationRouter from './routes/notificationRoutes.js';
import MessageModel from './models/Message.js';


const app = express();
const port = process.env.PORT;
const DB_URL = process.env.DB_URL;
const httpServer = createServer(app);
const io = new Server(httpServer);

//cors policy
app.use(cors());
app.use(express.urlencoded({ extended: false }));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get
//Database Connection
connectDB(DB_URL);

//JSON
app.use(express.json());

//load routes
app.use("/api/user",userrouter);
app.use("/api/events",eventrouter);
app.use("/api/chat",chatrouter);
app.use("/api/notification",notificationRouter);

//socket io
io.on('connection', (socket) => {
    console.log('Backend connection established');

    socket.on('joinEventRoom', (eventId) => {
        socket.join(eventId); // Join the room corresponding to the event ID
        console.log(`Socket ${socket.id} joined room ${eventId}`);
    });

    socket.on('leaveEventRoom', (eventId) => {
        socket.leave(eventId);
        console.log(`Socket ${socket.id} left room ${eventId}`);
    });

    socket.on('sendMsg', (msg) => {
        console.log('Message:', msg);
         const newMessage= new MessageModel({
            eventId: msg.eventId,
            senderName: msg.senderName,
            senderID: msg.userID,
            message: msg.msg,
            time: msg.time
          });
        newMessage.save();
        io.to(msg.eventId).emit('serverMsg', {...msg, type: 'otherMsg'});
        console.log({...msg, type: 'otherMsg'});
    });
});

httpServer.listen(port,()=> {
    console.log(`Server is listening at ${port}`);
})


