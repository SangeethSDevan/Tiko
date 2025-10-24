import type { Request, Response } from "express";
import jwt from "jsonwebtoken"
import prisma from "../constants/prisma.js";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { emailRegex, passwordRegex, usernameRegex } from "../constants/regex.js";

interface userLoginData{
    credential?:string,
    password:string
}
interface userSignupData extends userLoginData{
    name:string,
    username:string
    email:string
}

export const signupUser=async(req:Request,res:Response)=>{
    const userValues:userSignupData=req.body;
    if(!userValues ||!userValues.username || !userValues.email || !userValues.name || !userValues.password){
        return res.status(400).json({
            status:"fail",
            message:"All the fields are required"
        })
    }
    if(!emailRegex.test(userValues.email)){
        return res.status(401).json({
            status:"fail",
            message:"Enter a valid email!"
        })
    }
    if(!passwordRegex.test(userValues.password)){
        return res.status(401).json({
            status:"fail",
            message:"Enter a valid password!"
        })
    }
    if(!usernameRegex.test(userValues.username)){
        return res.status(401).json({
            status:"fail",
            message:"Enter a valid username!"
        })
    }
    try{
        const hash=await bcrypt.hash(userValues.password,10)
        const user=await prisma.user.create({
            data:{
                username:userValues.username,
                name:userValues.name,
                password:hash,
                email:userValues.email
            }
        })
        const token=jwt.sign(user.userId,process.env.JWT_SECRET||" ")
        return res.status(201).json({
            status:"success",
            message:`Welcome ${user.name}`,
            token:token
        })
    }catch(e){
        if (e instanceof Prisma.PrismaClientKnownRequestError){
            if(e.code==='P2002'){
                return res.status(400).json({
                    status:"fail",
                    message:`${(e.meta as { target?: string[] })?.target?.[0]} is already taken!`
                })
            }
        }
        return res.status(500).json({
            status:"fail",
            message:e instanceof Error?e.message:"Something went wrong!"
        })
    }
}
export const loginUser=async(req:Request<{},{},userLoginData>,res:Response)=>{
    const loginBody=req.body;
    if(!loginBody.credential || !loginBody.password){
        return res.status(400).json({
            status:"fail",
            message:"All the fields are required"
        })
    }
    try{
        const user=await prisma.user.findFirst({
            where:{
                OR:[{email:loginBody.credential},{username:loginBody.credential}],
            },
            include:{
                events:{
                    where:{
                        groupId:null
                    },
                    select:{
                        eventId:true,
                        eventDate:true,
                        title:true,
                        description:true,
                        reccurence:true
                    }
                },
                groups:{
                    select:{
                        group:{
                            select:{
                                groupName:true,
                                description:true,
                                members:{
                                    select:{
                                        userId:true,
                                        userRole:true,
                                        user:{
                                            select:{
                                                username:true,
                                                name:true,
                                                email:true,
                                            }
                                        }
                                    }
                                },
                                events:{
                                    select:{
                                        eventId:true,
                                        title:true,
                                        description:true,
                                        eventDate:true,
                                        reccurence:true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })
        if(!user){
            return res.status(401).json({
                status:"fail",
                message:"username/email and password is not matching!"
            })
        }
        const isMatch=await bcrypt.compare(loginBody.password,user.password)
        if(!isMatch){
            return res.status(401).json({
                status:"fail",
                message:"Invalid username or password"
            })
        }
        const token=jwt.sign(user.userId,process.env.JWT_SECRET||" ")
        return res.status(200).json({
            status:"success",
            message:`Welcome back ${user.name}`,
            token:token,
            user:{
                username:user.username,
                name:user.name,
                email:user.email
            },
            events:user.events,
            group:user.groups
        })
    }catch(e){
        return res.status(500).json({
            status:"fail",
            message:e instanceof Error?e.message:"Something went wrong!"
        })
    }
}
export const getGroups=async(req:Request,res:Response)=>{
    const userId=req.user
    if(!userId){
        return res.status(400).json({
            status:"fail",
            message:"user-id not found!"
        })
    }
    try{
        const groups=await prisma.groupMember.findMany({
            where:{
                userId:userId
            },
            select:{
                groupId:true,
                group:{
                    select:{
                        groupName:true,
                        description:true,
                        members:{
                            select:{
                                userId:true,
                                userRole:true,
                                user:{
                                    select:{
                                        username:true,
                                        name:true,
                                        email:true
                                    }
                                }
                            }
                        },
                        events:{
                            select:{
                                eventId:true,
                                title:true,
                                description:true,
                                eventDate:true,
                                reccurence:true
                            }
                        }
                    }
                },
                
            }
        })
        return res.status(200).json({
            status:"success",
            groups:groups
        })
    }catch(e){
        return res.status(500).json({
            status:"fail",
            message:e instanceof Error?e.message:"Something went wrong!"
        })
    }
}
export const getPersonalEvents=async(req:Request,res:Response)=>{
    const userId=req.user
    if(!userId){
        return res.status(400).json({
            status:"fail",
            message:"user-id not found!"
        })
    }
    try{
        const events=await prisma.events.findMany({
            where:{
                AND:[{ userId:userId },{ groupId:null }]
            },
            select:{
                eventId:true,
                title:true,
                description:true,
                eventDate:true,
                reccurence:true
            }
        })
        return res.status(200).json({
            status:"success",
            events:events
        })
    }catch(e){
        return res.status(400).json({
            status:"fail",
            message:e instanceof Error?e.message:"Something went wrong!"
        })
    }
}
export const getUserDetails=async(req:Request,res:Response)=>{
    const userId=req.user
    if(!userId){
        return res.status(400).json({
            status:"fail",
            message:"user-id not found!"
        })
    }
    try{
        const details=await prisma.user.findUnique({
            where:{
                userId:userId
            },
            select:{
                username:true,
                email:true,
                name:true,
                events:{
                    where:{
                        groupId:null
                    },
                    select:{
                        eventId:true,
                        eventDate:true,
                        title:true,
                        description:true,
                        reccurence:true
                    }
                },
                groups:{
                    select:{
                        group:{
                            select:{
                                groupName:true,
                                description:true,
                                members:{
                                    select:{
                                        userId:true,
                                        userRole:true,
                                        user:{
                                            select:{
                                                username:true,
                                                name:true,
                                                email:true,
                                            }
                                        }
                                    }
                                },
                                events:{
                                    select:{
                                        eventId:true,
                                        title:true,
                                        description:true,
                                        eventDate:true,
                                        reccurence:true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })
        return res.status(200).json({
            status:"success",
            details:details
        })

    }catch(e){
        return res.status(400).json({
            status:"fail",
            message:e instanceof Error?e.message:"Something went wrong!"
        })
    }
}