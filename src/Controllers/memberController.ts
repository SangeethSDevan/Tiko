import type { Request, Response } from "express";
import prisma from "../constants/prisma.js";
import type { Role } from "@prisma/client";
import { sendEmail } from "../constants/transport.js";
import dotenv from "dotenv"
dotenv.config()

export const joinGroup=async (req:Request<{},{},{},{gid:string}>,res:Response)=>{
    const gid=req.query.gid
    const uid=req.user
    if(!gid){
        return res.status(400).json({
            status:"fail",
            message:"Group id is missing!"
        })
    }
    if(!uid){
        return res.status(400).json({
            status:"fail",
            message:"user id is missing!"
        })
    }
    try{
        await prisma.groupMember.create({
            data:{
                userId:uid,
                groupId:gid
            }
        })
        return res.status(200).json({
            status:"success",
            message:"Successfully joined the group!"
        })
    }catch(e){
        return res.status(500).json({
            status:"fail",
            message:e instanceof Error?e.message:"Something went wrong!"
        })
    }
}
export const updateRole=async(req:Request<{},{},{role:Role},{ gid:string, uid:string }>,res:Response)=>{
    const gid=req.query.gid
    const uid=req.query.uid
    const reqRole=req.role
    if(!gid){
        return res.status(400).json({
            status:"fail",
            message:"Group id not found!"
        })
    }
    if(!uid){
        return res.status(400).json({
            status:"fail",
            message:"user-id not found!"
        })
    }
    const role=req.body.role
    if(!role){
        return res.status(400).json({
            status:"fail",
            message:"user role is missing!"
        })
    }
    try{
        await prisma.$transaction(async(tx)=>{
            const target=await tx.groupMember.findUnique({
                where:{
                    groupId_userId:{
                        groupId:gid,
                        userId:uid
                    }
                }
            })
            if(reqRole=="LEADER" && ( target?.userRole=="ADMIN" || role=="ADMIN")){
                throw new Error("Leader can't do any changes to admin")
            }
            await tx.groupMember.update({
                where: {
                    groupId_userId: {
                        groupId: gid,
                        userId: uid
                    }
                },
                data: {
                    userRole:role
                }
            })
        })
        return res.status(200).json({
            status:"success",
            message:`Role updated to ${role}`
        })
    }catch(e){
        return res.status(500).json({
            status:"fail",
            message:e instanceof Error?e.message:"Something went wrong!"
        })
    }
}

export const exitGroup=async(req:Request<{},{},{},{gid:string}>,res:Response)=>{
    const gid=req.query.gid
    if(!gid){
        return res.status(400).json({
            status:"fail",
            message:"Group id not-found!"
        })
    }
    const uid=req.user
    if(!uid){
        return res.status(400).json({
            status:"fail",
            message:"User id not-found!"
        })
    }
    try{
        await prisma.groupMember.delete({
            where:{
                groupId_userId:{
                    groupId:gid,
                    userId:uid
                }
            }
        })
        return res.status(200).json({
            status:"success",
            message:"You successfully exited the group!"
        })
    }catch(e){
        return res.status(500).json({
            status:"fail",
            message:e instanceof Error?e.message:"Something went wrong!"
        })
    }
}
export const kickOutGroup=async(req:Request<{},{},{},{
    gid:string,
    uid:string
}>,res:Response)=>{
    const details=req.query

    if(!details||!details.gid||!details.uid){
        return res.status(400).json({
            status:"fail",
            message:"Group id and user id are required fields!"
        })
    }
    try{
        await prisma.$transaction(async(tx)=>{
            const reqRole=req.role
            const target=await tx.groupMember.findUnique({
                where:{
                    groupId_userId:{
                        groupId:details.gid,
                        userId:details.uid
                    }
                }
            })

            if(!target){
                throw new Error("User is not part of the group!")
            }

            if(reqRole=="LEADER" && ["ADMIN","LEADER"].includes(target.userRole)){
                throw new Error("Leader can't remove admins and leaders!")
            }
            await tx.groupMember.delete({
                where:{
                    groupId_userId:{
                        groupId:details.gid,
                        userId:details.uid
                    }
                }
            })
            return res.status(200).json({
                status: "success",
                message: "The member was removed from the group!",
            });
        })
    }catch(e){
        return res.status(400).json({
            status:"fail",
            message:e instanceof Error?e.message:"Something went wrong!"
        })
    }
}
export const addMembers = async (
  req: Request<{}, {}, { emails: string[] }, { gid: string }>,
  res: Response
) => {
  const gid = req.query.gid;
  if (!gid) {
    return res.status(400).json({
      status: "fail",
      message: "Group id not found!",
    });
  }

  const { emails } = req.body;
  if (!emails || emails.length === 0) {
    return res.status(400).json({
      status: "fail",
      message: "Emails are required to add members!",
    });
  }
  try{
    const group=await prisma.group.findFirst({
        where:{
            groupId:gid
        }
    })
    const result=await Promise.allSettled(emails.map(email=>sendEmail(email,{
        name:"Sangeetth",
        groupName:group?.groupName||"Anonymous group",
        inviteLink:`${process.env.URL}/api/v1/group/member/join?gid=${gid}`
    })))

    console.log(result)

    const failed = result
      .map((r, i) => (r.status === "rejected" ? emails[i] : null))
      .filter(Boolean);

    return res.status(200).json({
      status: failed.length > 0 ? "partial_success" : "success",
      message:
        failed.length > 0
          ? `Invitation sent, but failed for: ${failed.join(", ")}`
          : "Invitations sent successfully!",
    });
  }catch(e){
    return res.status(500).json({
        status:"fail",
        message:e instanceof Error?e.message:"Something went wrong!"
    })
  }
};
