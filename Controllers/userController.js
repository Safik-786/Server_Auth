import UserModel from '../models/User.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import transporter from '../Config/emailConfig.js'
import nodemailer from 'nodemailer'

class UserController {
    static indexPage = (request, response) => {
        response.send('Hello')
    }
    static userRegistration = async (request, response) => {
        console.log("request.body....", request.body)
        const { name, email, password, confirm_password, terms_condition } = request.body
        const userExist = await UserModel.findOne({ email: email })
        // handle email exist or not
        if (userExist) {
            response.status(201).send({ "status": "failed", "message": "User Email already exist" })
        } else {
            console.log("Request Data.....", request.body)
            // vallid Data in all field
            if (name && email && password && confirm_password && terms_condition) {
                // vallidate password and confirm password
                if (password === confirm_password) {
                    try {
                        // hash password
                        const salt = await bcrypt.genSalt(10)
                        const hashPassword = await bcrypt.hash(password, salt)
                        // create user
                        const newUser = new UserModel({
                            name,
                            email,
                            password: hashPassword,
                            terms_condition
                        })
                        console.log("newUser Data", newUser);
                        // save newUser
                        const result = await newUser.save()
                        if (result) {
                            //=====================================Generate Token======================================
                            const savedUser = await UserModel.findOne({ email: email })
                            const token = jwt.sign(
                                { userID: savedUser._id },
                                process.env.JWT_SECRET_KEY,
                                { expiresIn: "3d" }  // 1h means 1 hour it csn be "5d" means 5 days
                            )
                            //================================================================================================== 
                            response.send({ "status": "success", "message": "User Registration Successfully", "token": token })


                        } else {
                            response.send({ "status": "failed", "message": "User Registration Failed" })
                        }
                    }
                    catch (error) {
                        console.log("Something went wrong in the Registration section(try catch)...", error)
                    }

                } else {
                    response.send({ "status": "failed", "message": "Password and Confirm Password does not match" })
                }
            } else {
                response.send({ "status": "failed", "message": "All Fields are required" })
            }
        }

    }

    static userLogin = async (request, response) => {
        try {
            const { email, password } = request.body;
            if (email && password) {
                const userExist = await UserModel.findOne({ email: email })
                if (userExist) {
                    const matchPassword = await bcrypt.compare(password, userExist.password)
                    if (userExist.email === email && matchPassword) {
                        //======================================Generate Token for Login====================================
                        const savedUser = await UserModel.findOne({ email: email })
                        const token = jwt.sign(
                            { userID: savedUser._id },
                            process.env.JWT_SECRET_KEY,
                            { expiresIn: "5d" }  // 1h means 1 hour it can be "5d" means 5 days
                        )
                        //==================================================================================================
                        response.status(200).send({ "status": "success", "message": "User Login Successfully", "token": token })
                    } else {
                        response.send({ "status": "failed", "message": "User Email or password does not match" })
                    }
                } else {
                    response.send({ "status": "failed", "message": "User Email does not exist, Do Registration😎" })
                }
            } else {
                response.send({ "status": "failed", "message": "All Fields are required..." })
            }
        } catch (error) {
            console.log("Something went wrong in the Login section(try catch)...", error)
        }
    }
    // when user know his previous password
    static changeUserPasswword = async (request, response) => {
        const { oldPassword, password, confirm_password } = request.body

        if (oldPassword && password && confirm_password) {
            if (password !== confirm_password) {
                response.send({ "status": "failed", "message": "Password and Confirm Password does not match" })
            }
            else {
                // console.log("request.user._id===", request.user._id)
                const userOldPassword = await UserModel.findById(request.user._id).select("password")
                const matchPassword = await bcrypt.compare(oldPassword, userOldPassword.password)
                if (!matchPassword) {
                    return response.send({ "status": "failed", "message": "Old Password does not match" })
                } else if (await bcrypt.compare(password, userOldPassword.password)) {
                    return response.send({ "status": "failed", "message": "New Password can not be same as Old Password" })
                }
                const salt = await bcrypt.genSalt(10)
                const newHashPassword = await bcrypt.hash(password, salt)
                await UserModel.findByIdAndUpdate(request.user._id, { password: newHashPassword })
                response.send({ "status": "success", "message": "Password changed successfully" })
            }
        } else {
            response.send({ "status": "failed", "message": "All fields .. are required" })
        }
    }
    static loggedUser = async (request, response) => {
        response.send({ "user": request.user })
    }
    // forget  password(not protected)
    static forgetPassword = async (request, response) => {
        const { email } = request.body
        if (email) {
            const userExist = await UserModel.findOne({ email: email })
            if (userExist) {
                // create a token with 15 minute validation
                const secretKey = userExist._id + process.env.JWT_SECRET_KEY;
                const token = jwt.sign(
                    { userID: userExist._id },
                    secretKey,
                    { expiresIn: "15m" }
                )
                const resetPasswordLink = `http://localhost:5173/reset-password/${userExist._id}/${token}`
                console.log(resetPasswordLink)
                try {
                    const mailInfo = {
                        from: process.env.EMAIL_FROM,
                        to: userExist.email,
                        subject: "Safik Project Reset Password",
                        html: `
                        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px; background: #f9f9f9; border: 1px solid #e0e0e0;">
                            <h2 style="color: #2c3e50; font-size: 24px; text-align: center; margin-bottom: 20px;">
                            Reset Your Password
                            </h2>
                            <p style="color: #34495e; font-size: 16px; line-height: 1.5;">
                            You’ve requested to reset your password. Click the button below to proceed:
                            </p>
                            <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetPasswordLink}" style="display: inline-block; padding: 12px 24px; background: #3498db; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">
                                Reset Password
                            </a>
                            </div>
                            <p style="color: #7f8c8d; font-size: 14px; line-height: 1.5;">
                            If you didn’t request this, please ignore this email. The link expires in 1 hour.
                            </p>
                            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                            <p style="color: #95a5a6; font-size: 12px; text-align: center;">
                            © ${new Date().getFullYear()} Saffix Tech. All rights reserved.
                            </p>
                        </div>
                        `
                    }
                    await transporter.sendMail(mailInfo)
                    response.send({ "status": "success", "message": "Password reset link has been sent to your email", "info": mailInfo })
                }
                catch (error) {
                    console.log("Error in Nodemailer....", error)
                    response.send({ "status": "failed", "message": "Something went wrong in Nodemailer for Developer  " })
                }
            }
            else {
                response.send({ "status": "failed", "message": "User does not exist, Do Registration😎" })
            }
        }
        else {
            response.send({ "status": "failed", "message": "Email fields are required" })
        }
    }
    
    static updatePasswordEmailLink = async (request, response) => {
        const { password, confirm_password } = request.body
        const { id, token } = request.params
        if (!password || !confirm_password) {
            return response.send({ status: "failed", message: "All fields are required" });
        }
        const userExist = await UserModel.findById(id)
        if (userExist) {
            const secretKey = userExist._id + process.env.JWT_SECRET_KEY;
            try {
                const verifyUser = jwt.verify(token, secretKey)
                if (verifyUser) {
                    if (password !== confirm_password) {
                        response.send({ "status": "failed", "message": "Password and Confirm Password does not match" })
                    }
                    else {
                        const salt = await bcrypt.genSalt(10)
                        const newHashPassword = await bcrypt.hash(password, salt)
                        await UserModel.findByIdAndUpdate(userExist._id, { password: newHashPassword })
                        response.send({ "status": "success", "message": "Password changed successfully" })
                    }
                } else {
                    response.send({ "status": "failed", "message": "Token is not valid, Try Again" })
                }
            } catch (error) {
                console.log("Something went wrong in the updatePasswordEmailLink section(try catch)...", error)
            }
        }
        else {
            response.send({ "status": "failed", "message": "User does not exist" })
        }

    }

}

export default UserController







