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
import Battle from "./models/Battle.js";
import Problem from "./models/Problem.js";
import User from "./models/User.js";
import mongoose from "mongoose";
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

// In-memory Ranked Matchmaking Queue
const rankedQueue = [];

// Socket.IO handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-battle', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined battle ${roomId}`);
  });

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('leave-battle', (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left battle ${roomId}`);
  });

  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room ${roomId}`);
  });

  socket.on('battle-update', (data) => {
    io.to(data.roomId).emit('battle-updated', data);
  });

  // WebRTC Audio Comms for Squad Teams (2v2 / 4v4)
  socket.on('join-team-voice', ({ roomId, team, username }) => {
    const teamChannel = `${roomId}-team-${team}`;
    socket.join(teamChannel);

    if (!global.teamVoiceMembers) {
      global.teamVoiceMembers = new Map();
    }
    if (!global.teamVoiceMembers.has(teamChannel)) {
      global.teamVoiceMembers.set(teamChannel, []);
    }
    const currentList = global.teamVoiceMembers.get(teamChannel);
    const existingPeers = currentList.filter(m => m.socketId !== socket.id);
    const updated = [...existingPeers, { socketId: socket.id, username }];
    global.teamVoiceMembers.set(teamChannel, updated);

    // Send existing peers list to the newly connected peer
    socket.emit('team-voice-peers', { peers: existingPeers });

    // Notify other peers in this squad that a new peer joined
    socket.to(teamChannel).emit('peer-voice-joined', {
      peerSocketId: socket.id,
      username
    });
  });

  socket.on('voice-signal', ({ targetSocketId, signal, senderName }) => {
    io.to(targetSocketId).emit('peer-voice-signal', {
      senderSocketId: socket.id,
      signal,
      senderName
    });
  });

  socket.on('leave-team-voice', ({ roomId, team }) => {
    const teamChannel = `${roomId}-team-${team}`;
    socket.leave(teamChannel);
    if (global.teamVoiceMembers && global.teamVoiceMembers.has(teamChannel)) {
      const remaining = global.teamVoiceMembers.get(teamChannel).filter(m => m.socketId !== socket.id);
      global.teamVoiceMembers.set(teamChannel, remaining);
    }
    socket.to(teamChannel).emit('peer-voice-left', { peerSocketId: socket.id });
  });

  // Team Problem Claiming / Coordination (Divide and conquer)
  socket.on('team-claim-problem', ({ roomId, team, username, problemIndex, problemTitle }) => {
    const teamChannel = `${roomId}-team-${team}`;
    io.to(teamChannel).emit('team-problem-claimed', {
      username,
      problemIndex,
      problemTitle,
      claimedAt: Date.now()
    });
  });

  // Team Tactical Chat (Invisible to opposing squad)
  socket.on('team-chat-message', ({ roomId, team, sender, text }) => {
    const teamChannel = `${roomId}-team-${team}`;
    io.to(teamChannel).emit('team-chat-received', {
      sender,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
  });

  // Spectator Live Cast Telemetry Broadcast
  socket.on('spectator-stream-update', ({ roomId, username, code, cursor, testsPassed, totalTests }) => {
    io.to(roomId).emit('spectator-stream-received', {
      username,
      code,
      cursor,
      testsPassed,
      totalTests,
      updatedAt: Date.now()
    });
  });

  // Helper to safely resolve a valid MongoDB ObjectId for a user
  const resolveUserId = async (rawUserId, rawUsername) => {
    if (rawUserId && mongoose.Types.ObjectId.isValid(rawUserId)) {
      return rawUserId;
    }
    if (rawUsername) {
      try {
        const found = await User.findOne({ username: rawUsername }).select('_id');
        if (found) return found._id;
      } catch (e) {
        // fallback
      }
    }
    return new mongoose.Types.ObjectId();
  };

  // 1v1 Live Ranked Battle Matchmaking Queue (Matched by Nearby Ranked Battle XP & Problem Quota)
  socket.on('join-ranked-queue', async ({ userId, username, rankedBattleXp = 0, problemCount = 1 }) => {
    const playerXp = Number(rankedBattleXp) || 0;
    const qCount = Math.min(Math.max(Number(problemCount) || 1, 1), 5);
    const validUserId = await resolveUserId(userId, username);

    const existingIdx = rankedQueue.findIndex(q => (q.userId && q.userId === userId) || q.socketId === socket.id);
    if (existingIdx !== -1) rankedQueue.splice(existingIdx, 1);

    // STRICT RULE: Only match when both players chose the EXACT same problem count!
    // Try to find closest Ranked XP within ±150 with same problemCount first, otherwise any live opponent with same problemCount
    let matchIdx = rankedQueue.findIndex(q => q.problemCount === qCount && Math.abs((Number(q.rankedBattleXp) || 0) - playerXp) <= 150);
    if (matchIdx === -1) {
      matchIdx = rankedQueue.findIndex(q => q.problemCount === qCount);
    }

    const formatRankedProblem = (p) => {
      if (!p) return null;
      return {
        id: p._id,
        _id: p._id,
        slug: p.slug,
        title: p.title,
        difficulty: p.difficulty || 'Medium',
        description: p.description,
        topics: p.topics || [],
        examples: p.examples || [],
        constraints: p.constraints || [],
        hints: p.hints || {},
        testcases: (p.testcases || []).filter(tc => !tc.hidden).map(tc => ({ input: tc.input, output: tc.output }))
      };
    };

    if (matchIdx !== -1) {
      const opponent = rankedQueue.splice(matchIdx, 1)[0];
      const validOpponentUserId = await resolveUserId(opponent.userId, opponent.username);
      const roomId = `RNK${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      // Sample random problems for this battle (guaranteed exact match for both players)
      const assignedCount = qCount;
      let randomProblems = await Problem.aggregate([{ $sample: { size: assignedCount } }]);
      if (!randomProblems || randomProblems.length === 0) {
        randomProblems = await Problem.find().limit(assignedCount);
      }
      const problemIds = randomProblems.map(p => p._id);
      const formattedProblems = randomProblems.map(formatRankedProblem);

      let battlePayload = null;
      try {
        const battle = new Battle({
          roomId,
          battleType: '1vs1',
          tier: 'Bronze',
          problemCount: assignedCount,
          duration: 30,
          isRanked: true,
          isTournament: false,
          problem: problemIds[0] || null,
          problems: problemIds,
          startTime: new Date(),
          status: 'active',
          participants: [
            { user: validUserId, status: 'playing', hostRole: 'player', timeLeft: 30 * 60, assignedProblem: problemIds[0] },
            { user: validOpponentUserId, status: 'playing', hostRole: 'player', timeLeft: 30 * 60, assignedProblem: problemIds[0] }
          ]
        });
        await battle.save();

        battlePayload = {
          id: battle._id,
          roomId: battle.roomId,
          battleType: '1vs1',
          problem: formattedProblems[0] || null,
          problems: formattedProblems,
          problemCount: assignedCount,
          duration: 30,
          status: 'active',
          startTime: battle.startTime,
          isRanked: true,
          participants: [
            { userId: validUserId, user: username || 'Combatant', status: 'playing', timeLeft: 30 * 60 },
            { userId: validOpponentUserId, user: opponent.username || 'Rival', status: 'playing', timeLeft: 30 * 60 }
          ]
        };
      } catch (err) {
        console.error('Error creating ranked battle document:', err);
        battlePayload = {
          id: `temp_${roomId}`,
          roomId,
          battleType: '1vs1',
          problem: formattedProblems[0] || null,
          problems: formattedProblems,
          problemCount: assignedCount,
          duration: 30,
          status: 'active',
          startTime: new Date(),
          isRanked: true,
          participants: [
            { userId: validUserId, user: username || 'Combatant', status: 'playing', timeLeft: 30 * 60 },
            { userId: validOpponentUserId, user: opponent.username || 'Rival', status: 'playing', timeLeft: 30 * 60 }
          ]
        };
      }

      socket.emit('ranked-match-found', {
        roomId,
        battle: battlePayload,
        opponent: { username: opponent.username, rankedBattleXp: opponent.rankedBattleXp || 0 },
        problemCount: assignedCount
      });

      io.to(opponent.socketId).emit('ranked-match-found', {
        roomId,
        battle: battlePayload,
        opponent: { username, rankedBattleXp: playerXp },
        problemCount: assignedCount
      });
    } else {
      rankedQueue.push({ socketId: socket.id, userId: validUserId, username, rankedBattleXp: playerXp, problemCount: qCount, queuedAt: Date.now() });

      // Live challenger check: periodically look for any other live player joining the queue with the EXACT same question count
      const checkInterval = setInterval(async () => {
        const stillInQueue = rankedQueue.findIndex(q => q.socketId === socket.id);
        if (stillInQueue === -1) {
          clearInterval(checkInterval);
          return;
        }

        const waitingOther = rankedQueue.find(q => q.socketId !== socket.id && q.problemCount === qCount);
        if (waitingOther) {
          clearInterval(checkInterval);
          rankedQueue.splice(stillInQueue, 1);
          const otherIdx = rankedQueue.findIndex(q => q.socketId === waitingOther.socketId);
          if (otherIdx !== -1) rankedQueue.splice(otherIdx, 1);

          const validWaitingUserId = await resolveUserId(waitingOther.userId, waitingOther.username);
          const roomId = `RNK${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
          const assignedCount = qCount;
          let randomProblems = await Problem.aggregate([{ $sample: { size: assignedCount } }]);
          if (!randomProblems || randomProblems.length === 0) {
            randomProblems = await Problem.find().limit(assignedCount);
          }
          const problemIds = randomProblems.map(p => p._id);
          const formattedProblems = randomProblems.map(formatRankedProblem);

          let fallbackBattlePayload = null;
          try {
            const battle = new Battle({
              roomId,
              battleType: '1vs1',
              tier: 'Bronze',
              problemCount: assignedCount,
              duration: 30,
              isRanked: true,
              isTournament: false,
              problem: problemIds[0] || null,
              problems: problemIds,
              startTime: new Date(),
              status: 'active',
              participants: [
                { user: validUserId, status: 'playing', hostRole: 'player', timeLeft: 30 * 60, assignedProblem: problemIds[0] },
                { user: validWaitingUserId, status: 'playing', hostRole: 'player', timeLeft: 30 * 60, assignedProblem: problemIds[0] }
              ]
            });
            await battle.save();

            fallbackBattlePayload = {
              id: battle._id,
              roomId: battle.roomId,
              battleType: '1vs1',
              problem: formattedProblems[0] || null,
              problems: formattedProblems,
              problemCount: assignedCount,
              duration: 30,
              status: 'active',
              startTime: battle.startTime,
              isRanked: true,
              participants: [
                { userId: validUserId, user: username || 'Combatant', status: 'playing', timeLeft: 30 * 60 },
                { userId: validWaitingUserId, user: waitingOther.username || 'Rival', status: 'playing', timeLeft: 30 * 60 }
              ]
            };
          } catch (err) {
            console.error('Error creating fallback ranked battle document:', err);
            fallbackBattlePayload = {
              id: `temp_${roomId}`,
              roomId,
              battleType: '1vs1',
              problem: formattedProblems[0] || null,
              problems: formattedProblems,
              problemCount: assignedCount,
              duration: 30,
              status: 'active',
              startTime: new Date(),
              isRanked: true,
              participants: [
                { userId: validUserId, user: username || 'Combatant', status: 'playing', timeLeft: 30 * 60 },
                { userId: validWaitingUserId, user: waitingOther.username || 'Rival', status: 'playing', timeLeft: 30 * 60 }
              ]
            };
          }

          socket.emit('ranked-match-found', {
            roomId,
            battle: fallbackBattlePayload,
            opponent: { username: waitingOther.username, rankedBattleXp: waitingOther.rankedBattleXp || 0 },
            problemCount: assignedCount
          });
          io.to(waitingOther.socketId).emit('ranked-match-found', {
            roomId,
            battle: fallbackBattlePayload,
            opponent: { username, rankedBattleXp: playerXp },
            problemCount: assignedCount
          });
        }
      }, 2000);
    }
  });

  socket.on('leave-ranked-queue', () => {
    const idx = rankedQueue.findIndex(q => q.socketId === socket.id);
    if (idx !== -1) rankedQueue.splice(idx, 1);
    socket.emit('ranked-queue-left');
  });

  socket.on('disconnecting', () => {
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        if (global.teamVoiceMembers && global.teamVoiceMembers.has(room)) {
          const remaining = global.teamVoiceMembers.get(room).filter(m => m.socketId !== socket.id);
          global.teamVoiceMembers.set(room, remaining);
        }
        socket.to(room).emit('peer-voice-left', { peerSocketId: socket.id });
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const idx = rankedQueue.findIndex(q => q.socketId === socket.id);
    if (idx !== -1) rankedQueue.splice(idx, 1);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/health`);
  console.log(`User API: http://localhost:${PORT}/api/users`);
  console.log(`Socket.IO enabled`);
});
