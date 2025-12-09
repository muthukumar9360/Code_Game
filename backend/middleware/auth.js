import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; // Expect: Bearer <token>

        if (!token) {
            return res.status(401).json({ error: "Access denied. No token provided." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // store decoded user data for access in routes

        next();

    } catch (error) {
        res.status(401).json({ error: "Invalid or expired token" });
    }
};
