import mongoose from "mongoose";

// // Defining the schema

// const studentSchema= new mongoose.Schema({
//     name:{type:String, required:true, trim:true},
//     email:{type:String, required:true, trim:true,match: [ /^[\w.]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/, 'Please fill a valid email address'] 
//     },
//     age:{type:Number, required:true, min:10},
//     fees:{type:mongoose.Decimal128, required:true, min:10, validate:(value)=> value >= 5000.0},
// })

// // Built the Model/^[\w.]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/


// const StudentModel= mongoose.model("student", studentSchema)

// export {StudentModel}