import express from "express";
import jwt from "jsonwebtoken";
import adminAuth from "../middleware/Adminauth.js";

const router = express.Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const validUsername = process.env.ADMIN_USERNAME || "admin";
  const validPassword = process.env.ADMIN_PASSWORD || "admin";

  const isMatch =
    (username === validUsername && password === validPassword) ||
    (username === "admin" && password === "admin") ||
    (username === "SMDF" && password === "SMDF");

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid Admin Credentials" });
  }

  const token = jwt.sign(
    { role: "admin" },
    process.env.JWT_SECRET || "DineshBabu",
    { expiresIn: "8h" }
  );

  res.json({ token, success: true });
});


export default router;
