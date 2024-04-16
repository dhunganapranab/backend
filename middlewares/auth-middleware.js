import  jwt  from "jsonwebtoken";
import UserModel from "../models/User.js";

// var checkUserAuth = async(req,res,next)=>{
//     let token;
//     const { authorization } = req.headers
//     if(authorization && authorization.startsWith('Bearer')){
//         try{
//             //Get token from header
//             token = authorization.split(' ')[1]

//             // verifying token
//             const {userID} = jwt.verify(token,process.env.JWT_SECRET_KEY);

//             //Get user from token
//             req.user = await UserModel.findById(userID).select('-password')
//             next()
//         }catch(error){
//             console.log(error);
//             res.status(401).send({"status": "failed", "message":"Unauthorized User"})
//         }
//     }
//     if(!token){
//         res.status(401).send({"status": "failed", "message":"Unauthorized User, Token not found"});
//     }
// }

const auth = async(req, res, next) => {
    try{
        const token = req.header('userToken');
        if(!token)
            return res.status(401).json({msg: "Token not found"});
        const verified = jwt.verify(token,process.env.JWT_SECRET_KEY);
        if(!verified) return res.status(401).json({msg:'Token Verification failed.'});

        req.user = verified.userID;
        req.token = token;
        next();
    } catch(err){
        res.status(500).json({msg: err.message});
    }
};

export {checkUserAuth,auth};