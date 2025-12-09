import dotenv from "dotenv";
dotenv.config();
import connectDB from "./db.js";
import express from "express";
import cors from "cors";
connectDB().catch((err) => console.error("MongoDB connection failed:", err.message));

const app=express();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));