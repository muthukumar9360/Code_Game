import dotenv from "dotenv";
dotenv.config();
import connectDB from "./db.js";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import userRoutes from "./routes/userRoutes.js";
import problemRoutes from "./routes/problemRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import battleRoutes from "./routes/battleRoutes.js";
const app = express();

app.use(express.json());
app.use(cors());

// Create HTTP server and Socket.IO instance
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// make io available in request handlers via req.app.get('io')
app.set('io', io);

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
app.use("/api/problems",problemRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/battles", battleRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ error: err.message });
});

// Socket.IO handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-battle', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined battle ${roomId}`);
  });

  socket.on('leave-battle', (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left battle ${roomId}`);
  });

  socket.on('battle-update', (data) => {
    io.to(data.roomId).emit('battle-updated', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/health`);
  console.log(`User API: http://localhost:${PORT}/api/users`);
  console.log(`Socket.IO enabled`);
});
