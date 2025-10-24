import express from "express"
import { addMembers, exitGroup, joinGroup, kickOutGroup, updateRole } from "../Controllers/memberController.js"
import { checkRoleAcess } from "../Middlewares/roleAuth.js"

const memberRouter=express.Router()

memberRouter.post("/join",joinGroup)
            .post("/role",checkRoleAcess("ADMIN","LEADER"),updateRole)
            .post("/exit",exitGroup)
            .post("/kick",checkRoleAcess("ADMIN","LEADER"),kickOutGroup)
            .post("/add",checkRoleAcess("ADMIN"),addMembers)

export default memberRouter