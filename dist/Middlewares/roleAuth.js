import prisma from "../constants/prisma.js";
export const checkRoleAcess = (...allowedRoles) => {
    return async (req, res, next) => {
        const userId = req.user;
        const groupId = req.params.id;
        if (!userId) {
            return res.status(403).json({
                status: "un-authorized",
                message: "You are not allowed to enter!"
            });
        }
        try {
            const details = await prisma.groupMember.findFirst({
                where: {
                    AND: [{ groupId: groupId, userId: userId }]
                }
            });
            if (allowedRoles.includes(details?.userRole || "USER")) {
                req.role = details?.userRole || "USER";
                return next();
            }
            return res.status(403).json({
                status: "un-authorized",
                message: "You don't have permission to do the operation!"
            });
        }
        catch (e) {
            return res.status(500).json({
                status: "fail",
                message: e instanceof Error ? e.message : "Something went wrong!"
            });
        }
    };
};
