import express from "express"
import userRouter from "./Routers/userRouter.js"
import { authMiddleware } from "./Middlewares/auth.js"
import eventRouter from "./Routers/eventRouter.js"
import groupRouter from "./Routers/groupRouter.js"
import cors from 'cors'
import { sendNotifications } from "./Controllers/pushController.js"

const app=express()

app.use(express.json())
app.use(cors({
    origin:"*"
}))
app.use("/",express.static("public"))

app.use("/api/v1/user",userRouter)
app.use("/api/v1/events",authMiddleware,eventRouter)
app.use("/api/v1/group",authMiddleware,groupRouter)
app.get("/events",sendNotifications)

export default app