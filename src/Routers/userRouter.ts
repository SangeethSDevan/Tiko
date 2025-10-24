import express from "express"
import { getGroups, getPersonalEvents, getUserDetails, loginUser, signupUser } from "../Controllers/userController.js"
import { authMiddleware } from "../Middlewares/auth.js"

const userRouter=express.Router()

userRouter.post("/signup",signupUser)
          .post("/login",loginUser)
          .get("/group",authMiddleware,getGroups)
          .get("/personal",authMiddleware,getPersonalEvents)
          .get("/details",authMiddleware,getUserDetails)

export default userRouter