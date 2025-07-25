import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,           //
    port: (process.env.EMAIL_PORT),
    secure: false,      // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USERNAME,       //Admin Gmail ID
        pass: process.env.EMAIL_PASSWORD        //Admin Gmail password
    },
})

export default transporter