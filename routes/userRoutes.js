import UserController from '../Controllers/userController.js'
import express from 'express';
import checkUserAuth from '../middleware/authmiddleware.js';                   
const userRoutes= express.Router();

// Route Level middleware to protect route(chaeck user is login or not)
userRoutes.use("/changepassword", checkUserAuth)
userRoutes.use("/getuser", checkUserAuth)


userRoutes.get("/", UserController.indexPage)

// Public Route
userRoutes.post("/registration", UserController.userRegistration)
userRoutes.post("/login", UserController.userLogin)
userRoutes.post("/changepassword", UserController.changeUserPasswword)
userRoutes.get("/getuser", UserController.loggedUser)
userRoutes.post("/forgetpassword", UserController.forgetPassword)
userRoutes.post("/forgetpassword/:id/:token", UserController.updatePasswordEmailLink)

// Private Route, authenticated user

export { userRoutes };

