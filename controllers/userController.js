import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../models/User.js';
import transporter from '../config/emailConfig.js';

class UserController{

    static userRegistration = async (req,res) =>{

       const {fullname,email,password, dateOfBirth} = req.body;

       const user = await UserModel.findOne({email:email});

       if (user){

        res.status(400).send({"status":"failed", "message":"Email already exists"});

       } else{

            if(fullname && email && password && dateOfBirth){
                try{

                    const salt = await bcrypt.genSalt(10);
                    const hashPassword = await bcrypt.hash(password,salt);


                    const newUser = new UserModel({
                    fullname: fullname,
                    email:email,
                    password:hashPassword,
                    dateOfBirth:dateOfBirth
                })
                await newUser.save();
                const saved_user = await UserModel.findOne({email:email})

                //Generate JWT token
                const token = jwt.sign({userID:saved_user._id},process.env.JWT_SECRET_KEY, {expiresIn: '1d'});


                res.status(201).send({"status":"passed","message":"User registered sucessfully.","token": token});

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

                if(user != null){
                    const checkPassword = await bcrypt.compare(password, user.password);

                    if((user.email === email)  && checkPassword){

                        //Generate JWT Token
                        const token = jwt.sign({userID:user._id},process.env.JWT_SECRET_KEY, {expiresIn: '14d'});
                        res.status(200).send({"status":"success","message":"user has logged in successfully.","token":token})

                    }else{
                        res.send({"status":"failed","message":"Provided credentials are wrong."})
                    }
                }else{
                    res.send({"status":"failed","message":"user not found."})
                }

            }else{
                res.send({"status":"failed","message":"all  fields are required"})
            }

        } catch(error){
            console.log(error);
            res.send({"status":"failed","message":"Login unsucessful."})
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
                const token = jwt.sign({userID:user._id}, secret , {expiresIn:'10m'})
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
}

export default UserController;
