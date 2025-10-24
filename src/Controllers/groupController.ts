import type { Request, Response } from "express";
import prisma from "../constants/prisma.js";

interface group{
    groupName:string,
    description:string
}

export const createGroup=async(req:Request<{},{},group>,res:Response)=>{
    const groupDetails=req.body
    const userId=req.user
    if(!groupDetails || !groupDetails.groupName){
        return res.status(400).json({
            status:"fail",
            message:"All groups must have a group name!"
        })
    }
    if(!userId){
        return res.status(401).json({
            status:"fail",
            message:"UserId not found!"
        })
    }
    try{
        await prisma.$transaction(async(cx)=>{
            const group=await prisma.group.create({
                data:{
                    groupName:groupDetails.groupName,
                    createdBy:userId,
                    ...( groupDetails.description ? { description:groupDetails.description } : {} )
                }
            })
            await prisma.groupMember.create({
                data:{
                    groupId:group.groupId,
                    userId:userId,
                    userRole:"ADMIN"
                }
            })
            
            return res.status(201).json({
                status:"success",
                message:"Group was created",
                group:group
            })
        })
    }catch(e){
        return res.status(500).json({
            status:"fail",
            message:e instanceof Error?e.message:"Something went wrong!"
        })
    }
}

export const updateGroup=async(req:Request<{id:string},{},group>,res:Response)=>{
    const groupId=req.params.id
    const groupDetails=req.body

    if(!groupDetails){
        return res.status(400).json({
            status:"fail",
            message:"Group details are required for updation"
        })
    }
    if(!groupId){
        return res.status(400).json({
            status:"fail",
            message:"user-id is a required field"
        })
    }
    try{
        const group=await prisma.group.update({
            where:{
                groupId:groupId
            },
            data:groupDetails,
            select:{
                groupId:true,
                groupName:true,
                description:true,
                createdBy:true
            }
        })
        return res.status(200).json({
            status:"success",
            group:group
        })
    }catch(e){
        return res.status(500).json({
            status:"fail",
            message:e instanceof Error?e.message:"Something went wrong!"
        })
    }
}
export const deleteGroup=async(req:Request<{id:string}>,res:Response)=>{
    const id=req.params.id
    if(!id){
        return res.status(400).json({
            status:"fail",
            message:"Group id not found!"
        })
    }
    try{
        await prisma.group.delete({
            where:{
                groupId:id
            }
        })
        return res.status(200).json({
            status:"success",
            message:"The Group was deleted!"
        })
    }catch(e){
        return res.status(500).json({
            status:"fail",
            message:e instanceof Error?e.message:"Something went wrong!"
        })
    }
}