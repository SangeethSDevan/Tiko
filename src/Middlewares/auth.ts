import type {Request, Response, NextFunction} from "express"
import jwt from "jsonwebtoken"

declare global {
  namespace Express {
    interface Request {
      user?:string;
    }
  }
}

export const authMiddleware=(req:Request,res:Response,next:NextFunction)=>{
    const authHeader=req.headers.authorization
    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({
            status:"fail",
            message:"Unauthorized"
        })
    }
    const token=authHeader.split(" ")[1] || " "
    jwt.verify(token,process.env.JWT_SECRET||" ",(err,decoded)=>{
        if(err){
            return res.status(401).json({
                status:"fail",
                message:"Unauthorized"
            })
        }
        req.user=decoded as string
        next()
    })
}
