import prisma from "../constants/prisma.js";
import { ReccurenceType } from "@prisma/client";
import { format } from "date-fns";
export const createEvent = async (req, res) => {
    const eventData = req.body;
    if (!eventData || !eventData.title || !eventData.description || !eventData.eventDate) {
        return res.status(400).json({
            status: "fail",
            message: "All the fields are required!"
        });
    }
    const userId = req.user;
    const date = new Date(eventData.eventDate);
    if (!userId) {
        return res.status(400).json({
            status: "fail",
            message: "userId is a required field!"
        });
    }
    try {
        const event = await prisma.events.create({
            data: {
                userId: userId,
                title: eventData.title,
                description: eventData.description,
                eventDate: date.toISOString(),
                ddmm: format(date, "dd-MM"),
                reccurence: eventData.reccurence,
                ...(eventData.groupId ? { groupId: eventData.groupId } : {}),
            }
        });
        res.status(201).json({
            status: "success",
            message: "Event addded to your list!",
            event: event
        });
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({
            status: "fail",
            message: e instanceof Error ? e.message : "Something went wrong!"
        });
    }
};
export const getEvents = async (req, res) => {
    const userId = req.user;
    if (!userId) {
        return res.status(401).json({
            status: "fail",
            message: "UserId not found!"
        });
    }
    try {
        const events = await prisma.events.findMany({
            where: {
                AND: {
                    userId: userId,
                    groupId: null
                }
            },
            select: {
                eventId: true,
                title: true,
                description: true,
                reccurence: true,
                eventDate: true
            }
        });
        return res.status(200).json({
            status: "success",
            events: events
        });
    }
    catch (e) {
        return res.status(500).json({
            status: "fail",
            message: e instanceof Error ? e.message : "Something went wrong!"
        });
    }
};
export const getEventById = async (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({
            status: "fail",
            message: "EventId not found!"
        });
    }
    try {
        const event = await prisma.events.findUnique({
            where: {
                eventId: id
            },
            select: {
                eventId: true,
                eventDate: true,
                title: true,
                description: true,
                reccurence: true
            }
        });
        if (!event) {
            return res.status(200).json({
                status: "success",
                message: "Event not found!"
            });
        }
        return res.status(200).json({
            status: "success",
            event: event
        });
    }
    catch (e) {
        return res.status(500).json({
            status: "fail",
            message: e instanceof Error ? e.message : "Something went wrong!"
        });
    }
};
export const deleteEvent = async (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({
            status: "fail",
            message: "EventId not found!"
        });
    }
    try {
        const event = await prisma.events.delete({
            where: {
                eventId: id
            }
        });
        if (!event) {
            return res.status(400).json({
                status: "fail",
                message: "Event not found!"
            });
        }
        return res.status(200).json({
            status: "success",
            message: "Event deleted successfully!"
        });
    }
    catch (e) {
        return res.status(500).json({
            status: "fail",
            message: e instanceof Error ? e.message : "Something went wrong!"
        });
    }
};
export const updateEvent = async (req, res) => {
    const id = req.params.id;
    const eventDetails = req.body;
    if (!id) {
        return res.status(400).json({
            status: "fail",
            message: "Event id can't be empty!"
        });
    }
    if (!eventDetails || !eventDetails.title || !eventDetails.description || !eventDetails.eventDate) {
        return res.status(400).json({
            status: "fail",
            message: "Some event details are missing!"
        });
    }
    try {
        const updatedEvent = await prisma.events.update({
            where: {
                eventId: id
            },
            data: {
                title: eventDetails.title,
                description: eventDetails.description,
                eventDate: eventDetails.eventDate,
                reccurence: eventDetails.reccurence
            },
            select: {
                eventId: true,
                eventDate: true,
                title: true,
                description: true,
                reccurence: true
            }
        });
        return res.status(200).json({
            status: "success",
            message: "The Event was updated!",
            event: updatedEvent
        });
    }
    catch (e) {
        return res.status(500).json({
            status: "fail",
            message: e instanceof Error ? e.message : "Something went wrong!"
        });
    }
};
