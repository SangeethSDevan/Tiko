import express from "express";
import { createGroup, deleteGroup, updateGroup } from "../Controllers/groupController.js";
import { checkRoleAcess } from "../Middlewares/roleAuth.js";
import memberRouter from "./memberRouter.js";
const groupRouter = express.Router();
groupRouter.use("/member", memberRouter);
groupRouter.post("/", createGroup)
    .put("/:id", checkRoleAcess("ADMIN"), updateGroup)
    .delete("/:id", checkRoleAcess("ADMIN"), deleteGroup);
export default groupRouter;
