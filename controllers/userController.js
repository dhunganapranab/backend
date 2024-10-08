import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../models/User.js';
import EventModel from '../models/Event.js';
import EmergencyModel from '../models/Emergency.js';
import transporter from '../config/emailConfig.js';

class UserController{

    static userRegistration = async (req,res) =>{

       const {fullname,email,password, role, dateOfBirth} = req.body;

       const user = await UserModel.findOne({email:email});

       if (user){

        return res.status(400).json({status:"failed", msg:"Registeration failed!!\nEmail already taken.\nPlease enter another email"});

       } else{

            if(fullname && email && password && dateOfBirth && role){
                try{

                    const salt = await bcrypt.genSalt(10);
                    const hashPassword = await bcrypt.hash(password,salt);


                    const newUser = new UserModel({
                    fullname: fullname,
                    email:email,
                    password:hashPassword,
                    role:role,
                    dateOfBirth:dateOfBirth
                })
                await newUser.save();


                return res.status(201).json({status:"passed",msg :"User registered sucessfully."});

                } catch(error){

                    console.log(error);
                    res.send({"status": "failed","message":"Error occured while registering the user.."});
                }
            }else{
                res.send({"status":"failed", "message":"All fields are required."})
            }
       }    
    }

    static userLogin = async(req,res) =>{
        try{
            const {email, password} = req.body;

            if(email && password) {
                const user = await UserModel.findOne({email:email});

                if(user!= null){
                    const checkPassword = await bcrypt.compare(password, user.password);

                    if((user.email === email)  && checkPassword){

                        //Generate JWT Token
                        const token = jwt.sign({userID:user._id},process.env.JWT_SECRET_KEY, {expiresIn: '14d'});
                        res.status(200).json({status:"success",msg:"user has logged in successfully.",token:token, ...user._doc})
                        console.log("user has logged in successfully",token, user.fullname);

                    }else{
                        return res.status(401).json({status:"failed",msg:"Provided credentials are wrong!!"});
                    }
                }else{
                    return res.status(404).json({status:"failed",msg:"Provided credentials are wrong!!"});
                }

            }else{
                return res.json({status:"failed",msg:"all  fields are required"});
            }

        } catch(error){
            console.log(error);
            return res.status(500).json({error: e.message});
        }
    }

    static updateUserDetails = async (req, res) => {
        const userId = req.params.userId;
        const { name, email, dob } = req.body;
        try {
            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({ msg: "User not found!!" });
            }
            const token = jwt.sign({userID:user._id},process.env.JWT_SECRET_KEY, {expiresIn: '14d'});
            // Update user details
            user.fullname = name;
            user.email = email;
            user.dateOfBirth = dob;
            await user.save();
    
            res.status(200).json({token:token, ...user._doc});
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: "Error occured while loggin in try again later." });
        }
    };
    

    static changeUserPassword = async (req, res) => {
        const userId = req.params.userId;
        const { oldPassword, newPassword } = req.body;
    
        try {
            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({ msg: "User not found!!" });
            } 
    
            // Check if oldPassword is provided
            if (!oldPassword) {
                return res.status(400).json({ status: "failed", msg: "Old password is required" });
            }
    
            // Compare the old password hash with the provided old password
            const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
            if (!isOldPasswordValid) {
                return res.status(400).json({ status: "failed", msg: "Old password is incorrect!!" });
            }
    
            // Hash the new password
            const salt = await bcrypt.genSalt(10);
            const newHashPassword = await bcrypt.hash(newPassword, salt);
    
            // Update the password in the database
            await UserModel.findByIdAndUpdate(userId, { $set: { password: newHashPassword } });
    
            res.status(200).json({ status: "success", msg: "Your password has been changed successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server Error" });
        }
    }
    
    

    static sendResetPassEmail = async(req,res) =>{
        const {email} = req.body;
        try{
            if(email){
                const user = await UserModel.findOne({email:email})
                if(user) {
                    const secret = user._id + process.env.JWT_SECRET_KEY;
                    const token = jwt.sign({userID:user._id}, secret , {expiresIn:'5m'})
                    const link = `http://localhost:3000/api/user/reset-password/${user._id}/${token}`
                    
                    //send email
                    await transporter.sendMail({
                        from: process.env.EMAIL_FROM,
                        to: user.email,
                        subject:`Biker's Junction- Password Reset Link`,
                        html:`<a href=${link} >Click here</a> to reset your password.`
                    })
    
    
                    res.status(200).json({status:"success",msg:`Email for resetting password has been sent to ${email}.`});
    
                }else{
                    res.status(400).json({status:"failed",msg:"Email is not registered in the system!!\nEnter valid email."});
    
                }
            }else{
               res.status(401).json({status:"failed",msg:"email is required"});
            }
        }catch(error){
            console.log(error);
            res.status(500).json({msg:"Server error"});
        }
        
    }

    static userPasswordReset = async(req,res) => {
        const{password} = req.body
        const {id, token} = req.params
        const user = await UserModel.findById(id)
        const new_secret = user._id + process.env.JWT_SECRET_KEY
        try{
            const verifyToken =jwt.verify(token, new_secret)
            if(password){
                const salt = await bcrypt.genSalt(10);
                const newhashPassword = await bcrypt.hash(password,salt);
    
                await UserModel.findByIdAndUpdate(user._id,{$set:{password: newhashPassword}});
                res.render('passwordSucessMsg');
                console.log("password changed successfully");

            }else{
                res.send({"status":"failed","message":"password required"});
            }

           
        }catch(error){
            console.log(error);
            res.render('passwordResetErrorMsg');
        }

    }

    static joinEvent = async (req, res) => {
        const { eventId, name, email, userID } = req.body;
    
        try {
            const event = await EventModel.findOne({ _id: eventId });
            if (!event) {
                return res.status(404).json({ msg: 'Event not found' });
            }
    
            const isJoined = event.members.some(member => member.userID == userID);
            if (isJoined) {
                return res.status(400).json({ msg: 'You are already in the event. See your events in my events section.' });
            }
    
            if (event.members.length >= event.allowedParticipants) {
                return res.status(400).json({ msg: 'Event is full. Cannot join.' });
            }
    
            if (eventId && name && email && userID) {
                event.members.push({ name, email, userID });
                await event.save();
                res.status(200).json(event.members);
            } else {
                return res.status(400).json({ msg: "All fields are required" });
            }
    
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error" });
        }
    }
    
    static leaveEvent = async(req, res) => {
        const { userID } = req.body;
        const { eventId } = req.params;
    
        try {
            const event = await EventModel.findOne({ _id: eventId });
            const user = await UserModel.findOne({_id: userID});
            if (!event) {
                return res.status(404).json({ msg: 'Event not found' });
            }

            if(!user) {
                return res.status(404).json({ msg: 'User not found' });
            }
    
            const memberIndex = event.members.findIndex(member => member.userID == userID);
            if (memberIndex === -1) {
                return res.status(400).json({ msg: 'You are not a member of this event' });
            }
    
            event.members.splice(memberIndex, 1); // Remove the member from the event
            await event.save();
    
            res.status(200).json({ msg: 'Successfully left the event' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    static getMyEvent = async(req, res) => {
        try {
            const userId = req.params.userId;
        
            // Check if the user exists
            const user = await UserModel.findById(userId);
            if (!user) {
              return res.status(404).json({ message: "User not found" });
            }
        
            // Find events where the user's ID exists in the members array
            const events = await EventModel.find({ "members.userID": userId });
        
            // Return the details of the events
            res.status(200).json(events);
          } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ message: "Internal Server Error" });
          }
    }

    static createdEventDetails = async(req, res) => {
        try {
            const userId = req.params.userId;

            const user = await UserModel.findById(userId);

            if(!user){
                res.json({msg: "User not found"});
            }
            // Fetch events where the creatorID matches the provided userId
            const events = await EventModel.find({ creatorID: userId });
        
            res.status(200).json(events);
          } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ message: "Internal Server Error" });
          }
    }

    static initiateEmergency = async (req, res) => {
        const { eventID, userName, userID, userLocation, message, time } = req.body;
    
        try {
            const event = await EventModel.findById(eventID);
    
            if (!event) {
                return res.status(404).json({ msg: "Event not found" });
            }
    
            const isJoined = event.members.some(member => member.userID === userID);
            const isCreator = event.creatorID == userID; // Check if the user is the creator of the event
    
            if (!isJoined && !isCreator) { // Check if the user is neither joined nor the creator
                return res.status(400).json({ msg: 'User not authorized.' });
            }
    
            if (eventID && userName && userID && userLocation && message && time) {
                const newEmergency = new EmergencyModel({
                    eventID: eventID,
                    userName: userName,
                    userID: userID,
                    userLocation: userLocation,
                    message: message,
                    time: time
                });
    
                await newEmergency.save();
                res.status(201).json({ status: "success", msg: "Emergency initiated successfully", ...newEmergency._doc });
            } else {
                res.status(400).send({ status: "failed", message: "All fields are required" });
            }
        } catch (error) {
            console.log(error);
            res.status(500).send({ status: "failed", message: "Internal server error" });
        }
    }

    static dismissEmergency = async (req,res) =>{
        const { emergencyId } = req.params;

        try {
            // Find the emergency by emergencyId
            const emergency = await EmergencyModel.findById(emergencyId);

            if (!emergency) {
                return res.status(404).json({ msg: 'Emergency detail not found' });
            }

            // Delete the emergency detail
            await EmergencyModel.findByIdAndDelete(emergencyId);

            res.status(200).json({ msg: 'Emergency detail successfully dismissed' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Server error' });
        }
    }

    static rateEvent = async(req, res) =>{
        const { eventId } = req.params;
        const { rating, reviewMessage, userName, userID } = req.body;
      
        try {
          // Find the event by eventId
          const event = await EventModel.findById(eventId);
      
          if (!event) {
            return res.status(404).json({ msg: "Event not found" });
          }
      
          // Check if the user has already given a rating
          const existingRating = event.ratings.find(
            (r) => r.userID.toString() === userID
          );
          if (existingRating) {
            return res
              .status(400)
              .json({ msg: "You have already rated and submitted review for this event. You can do it only one time!!" });
          }
      
          // Add the rating and review to the event
          event.ratings.push({ rating, reviewMessage, userName, userID });
      
          // Save the updated event
          await event.save();
      
          res.status(200).json({
            msg: "Rating and review added successfully",
          });
        } catch (error) {
          console.error(error);
          res.status(500).json({ msg: "Server error" });
        }
    }
}   

export default UserController;
