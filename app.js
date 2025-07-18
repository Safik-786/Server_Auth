import express from 'express'
import {join} from "path"
import { userRoutes } from './routes/userRoutes.js'
import dotenv from 'dotenv'
import cors from "cors"
import {connectDB} from './Config/connect.js'

const app= express()

// it it necessary for the using of the data in json format
app.use(express.json());

// confin dotenv
dotenv.config()

// Json configuration due to we are creatijng the API

// config cors
app.use(cors())

// confin port
const PORT= process.env.SERVER_PORT || 8000;

// connect to database
const DatabaseURL= process.env.DATABASE_URL || "mongodb://localhost:27017"
connectDB(DatabaseURL)

// For encoding post data from the url
app.use(express.urlencoded({extended:true}))

// use statics files
app.use(express.static(join(process.cwd(), "public")))


// Loading router module
app.use('/api/user', userRoutes)

//  set template engine
// app.set("view engine", "ejs")





app.listen(PORT, ()=>{
    console.log("Connected successfully at port",PORT)
})