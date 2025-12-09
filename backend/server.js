import dotenv from "dotenv";
dotenv.config();
import connectDB from "./db.js";
import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";

const app = express();

app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB().catch((err) => console.error("MongoDB connection failed:", err.message));

// Test endpoint to verify MongoDB is working
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "Server is running",
    mongodb: "connected"
  });
});

// User routes
app.use("/api/users", userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/health`);
  console.log(`User API: http://localhost:${PORT}/api/users`);
});