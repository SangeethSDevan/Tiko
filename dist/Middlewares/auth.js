import jwt from "jsonwebtoken";
export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            status: "fail",
            message: "Unauthorized"
        });
    }
    const token = authHeader.split(" ")[1] || " ";
    jwt.verify(token, process.env.JWT_SECRET || " ", (err, decoded) => {
        if (err) {
            return res.status(401).json({
                status: "fail",
                message: "Unauthorized"
            });
        }
        req.user = decoded;
        next();
    });
};
