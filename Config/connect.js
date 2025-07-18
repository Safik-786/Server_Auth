import mongoose from 'mongoose';

const connectDB= async (DatabaseURL)=>{
    try{
        const DB_OPTIONS= {
            // dbName: "school"
            dbName: process.env.DB_NAME
        }
        await mongoose.connect(DatabaseURL, DB_OPTIONS)
        console.log("Databse Connected Successfully")
    }catch(err){
        console.log("Something Went Wrong...", err)
    }
}

export {connectDB}

