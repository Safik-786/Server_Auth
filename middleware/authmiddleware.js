import jwt from 'jsonwebtoken'
import UserModel from '../models/User.js'


let checkUserAuth= async (request, response, next)=>{
    let token;
    // this will ued to get authorization token from the header from the frontend
    const {authorization}= request.headers
    // console.log(authorization)
    if(authorization && authorization.startsWith("Bearer")){ // startWith("Bearer") hai ya nahi
        try{
            // get token from header
            token= authorization.split(" ")[1]
            // console.log("Authorization====", authorization)
            // console.log("Token====", token) 
            // verify token and get user id that is stored in the token
            const { userID }= jwt.verify(token, process.env.JWT_SECRET_KEY)
            // get user from token
            request.user= await UserModel.findById(userID).select("-password") // -password means not show password(password ke alawa sabi show/get karega)
            next()
        }
        catch(err){
            response.status(401).send({status:"failed", message: "Unauthorized User"})
        }
    }
    if(!token){
        response.status(401).send({status:"failed", message: "Unauthorized User, No Token"})
    }
}

export default checkUserAuth;