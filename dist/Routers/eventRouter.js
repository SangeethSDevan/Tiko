import express from "express";
import { createEvent, deleteEvent, getEventById, getEvents, updateEvent } from "../Controllers/eventController.js";
const eventRouter = express.Router();
eventRouter.post("/", createEvent)
    .get("/", getEvents)
    .get("/:id", getEventById)
    .delete("/:id", deleteEvent)
    .put("/:id", updateEvent);
export default eventRouter;
