import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../models/User.js';
import EventModel from '../models/Event.js';
import transporter from '../config/emailConfig.js';

class UserController{

    static userRegistration = async (req,res) =>{

       const {fullname,email,password, role, dateOfBirth} = req.body;

       const user = await UserModel.findOne({email:email});

       if (user){

        return res.status(400).json({status:"failed", msg:"Email already exists"});

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

                //Generate JWT token

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
                        return res.status(401).json({status:"failed",msg:"Provided credentials are wrong."});
                    }
                }else{
                    return res.status(404).json({status:"failed",msg:"user not found."});
                }

            }else{
                return res.json({status:"failed",msg:"all  fields are required"});
            }

        } catch(error){
            console.log(error);
            return res.status(500).json({error: e.message});
        }
    }

    static changeUserPassword = async(req,res) =>{

        const{password} =req.body;

        if(password){
            const salt = await bcrypt.genSalt(10);
            const newhashPassword = await bcrypt.hash(password,salt);

            await UserModel.findByIdAndUpdate(req.user._id,{$set:{password: newhashPassword}});
            
            res.send({"status":"success","message":"password changed.."})
        }else{
            res.send({"status":"failed","message":"password shouldn't be empty"})
        }
    }
    

    static sendResetPassEmail = async(req,res) =>{
        const {email} = req.body;
        if(email){
            const user = await UserModel.findOne({email:email})
            if(user) {
                const secret = user._id + process.env.JWT_SECRET_KEY;
                const token = jwt.sign({userID:user._id}, secret , {expiresIn:'1m'})
                const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`
                
                //send email
                let info = await transporter.sendMail({
                    from: process.env.EMAIL_FROM,
                    to: user.email,
                    subject:`Biker's Junction- Password Reset Link`,
                    html:`<a href=${link} >Click here</a> to reset your password.`
                })


                res.send({"status":"success","message":"Email for resetting password has been sent."});

            }else{
                res.send({"status":"failed","message":"Email don't exist"});

            }
        }else{
            res.send({"status":"failed","message":"email is required."});
        }
    }

    static userPasswordReset = async(req,res) => {
        const{password} = req.body
        const {id, token} =req.params
        const user = await UserModel.findById(id)
        const new_secret = user._id + process.env.JWT_SECRET_KEY
        try{
            const a =jwt.verify(token, new_secret)
            if(password){
                const salt = await bcrypt.genSalt(10);
                const newhashPassword = await bcrypt.hash(password,salt);
    
                await UserModel.findByIdAndUpdate(user._id,{$set:{password: newhashPassword}});
                res.send({"status":"success","message":"password changed successfully"});

            }else{
                res.send({"status":"failed","message":"password required"});
            }

           
        }catch(error){
            console.log(error);
            res.send({"status":"failed","message":"Invalid token"})
        }

    }

    static joinEvent = async(req,res) => {
        const { eventId, name, email, userID } = req.body;
    
        try {
            const event = await EventModel.findOne({_id: eventId});
            if (!event) {
                return res.status(404).json({ msg: 'Event not found' });
            }

            const isJoined = event.members.some(member => member.userID == userID);
            if (isJoined) {
                return res.status(400).json({ msg: 'You are already in the event. See your events in my evnts section.' });
            }
            else{if(eventId && name && email && userID){
                event.members.push({ name, email, userID });
                await event.save(); 
                res.status(200).json(event.members);
            } else {
                return res.status(400).json({ msg: "All fields are required" });
            }}
            
            
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error" });
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

}

export default UserController;
