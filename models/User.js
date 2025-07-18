import mongoose from 'mongoose';          

const userSchema= new mongoose.Schema({
    name:{type:String, required:true, trim:true},
    email:{type:String, required:true, trim:true,match: [ /^[\w.]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/, 'Please fill a valid email address'] },
    password:{type:String, required:true, trim:true},
    terms_condition:{type:Boolean, required:true}
})


const UserModel= mongoose.model("user", userSchema)

export default UserModel