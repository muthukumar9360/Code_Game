import mongoose from 'mongoose';
import Battle from '../models/Battle.js';
import User from '../models/User.js';
import Problem from '../models/Problem.js';
import Submission from '../models/Submission.js';
import { findOpponent } from '../services/matchmakingService.js';
import { startBattle as startBattleService, endBattle } from '../services/battleService.js';
import { executeCode } from '../services/codeExecutionService.js';

// Helper: accept either Mongo ObjectId or roomId string
const resolveBattle = (idOrRoomId) => {
  if (!idOrRoomId) return null;
  if (mongoose.Types.ObjectId.isValid(idOrRoomId)) {
    return Battle.findById(idOrRoomId);
  }
  return Battle.findOne({ roomId: idOrRoomId });
};

const participantUserId = (p) => {
  if (!p || !p.user) return null;
  if (typeof p.user === 'string') return p.user;
  if (p.user._id) return p.user._id.toString();
  return p.user.toString();
};

// Start the battle (host only)
export const createBattle = async (req, res) => {
  try {
    const { battleId } = req.params;
    const userId = req.user.id;

    let battle = await resolveBattle(battleId);
    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }

    // Check host
      const isHost = participantUserId(battle.participants[0]) === userId;
    if (!isHost) {
      return res.status(403).json({ error: 'Only host can start the battle' });
    }

    if (battle.status !== 'waiting') {
      return res.status(400).json({ error: 'Battle already started' });
    }

    const minParticipants = parseInt(battle.battleType.split('vs')[0]);
    if (battle.participants.length < minParticipants) {
      return res
        .status(400)
        .json({ error: `Need at least ${minParticipants} participants to start` });
    }

    // ✅ Start via service
    const startedBattle = await startBattleService(battleId);

    // ✅ Populate for frontend
    const populatedBattle = await Battle.findById(startedBattle._id)
      .populate('participants.user', 'username')
      .populate('problem');

    return res.json({
      success: true,
      battle: {
        id: populatedBattle._id,
        roomId: populatedBattle.roomId,
        battleType: populatedBattle.battleType,
        problem: populatedBattle.problem,
        participants: populatedBattle.participants.map(p => ({
          user: p.user.username,
          status: p.status
        })),
        status: populatedBattle.status,
        startTime: populatedBattle.startTime,
        duration: populatedBattle.duration
      }
    });

  } catch (error) {
    console.error('Start battle error:', error);
    res.status(500).json({ error: error.message });
  }
};


export const joinBattle = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const battle = await Battle.findOne({ roomId })
      .populate('participants.user', 'username tier')
      .populate('problem');

    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }

    if (battle.status !== 'waiting') {
      return res.status(400).json({ error: 'Battle already started' });
    }

      const isParticipant = battle.participants.some(p => participantUserId(p) === userId);
    if (!isParticipant) {
      return res.status(403).json({ error: 'Not invited to this battle' });
    }

    res.json({
      success: true,
      battle: {
        id: battle._id,
        roomId: battle.roomId,
        problem: battle.problem,
        participants: battle.participants.map(p => ({
          user: p.user.username,
          tier: p.user.tier,
          status: p.status
        })),
        startTime: battle.startTime,
        duration: battle.duration
      }
    });

  } catch (error) {
    console.error('Join battle error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getBattleStatus = async (req, res) => {
  try {
    const { battleId } = req.params;
    const userId = req.user.id;

    const battle = await resolveBattle(battleId)
      .populate('participants.user', 'username tier')
      .populate('problem');

    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }

      const isParticipant = battle.participants.some(p => participantUserId(p) === userId);
    if (!isParticipant) {
      return res.status(403).json({ error: 'Not a participant in this battle' });
    }

    const now = new Date();
    const elapsed = battle.startTime ? Math.floor((now - battle.startTime) / 1000) : 0;

    // Build problem payload: include visible testcases only
    let problemPayload = null;
    if (battle.problem) {
      problemPayload = {
        id: battle.problem._id,
        title: battle.problem.title,
        description: battle.problem.description,
        examples: battle.problem.examples || [],
        testcases: (battle.problem.testcases || []).filter(tc => !tc.hidden).map(tc => ({ input: tc.input, output: tc.output }))
      };
    }

    res.json({
      success: true,
      battle: {
        id: battle._id,
        status: battle.status,
        problem: problemPayload,
        participants: battle.participants.map(p => {
          const base = (p.timeLeft !== null && p.timeLeft !== undefined) ? p.timeLeft : (battle.duration || 30) * 60;
          const timeLeft = Math.max(0, base - elapsed);
          return {
            user: (p.user && p.user.username) ? p.user.username : participantUserId(p),
            tier: (p.user && p.user.tier) ? p.user.tier : undefined,
            status: p.status,
            result: p.result,
            bestScore: p.bestScore || 0,
            timeLeft
          };
        }),
        startTime: battle.startTime,
        endTime: battle.endTime,
        duration: battle.duration
      }
    });

  } catch (error) {
    console.error('Get battle status error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const endBattleManually = async (req, res) => {
  try {
    const { battleId } = req.params;
    const userId = req.user.id;

    const battle = await resolveBattle(battleId);
    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }

      const isParticipant = battle.participants.some(p => participantUserId(p) === userId);
    if (!isParticipant) {
      return res.status(403).json({ error: 'Not a participant in this battle' });
    }

    if (battle.status === 'finished') {
      return res.status(400).json({ error: 'Battle already finished' });
    }

    await endBattle(battleId);

    res.json({
      success: true,
      message: 'Battle ended successfully'
    });

  } catch (error) {
    console.error('End battle error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new battle room (host)
export const createRoom = async (req, res) => {
  try {
    const userId = req.user.id;
    const { battleType, tier } = req.body;

    // Validate battleType
    if (!['1vs1', '2vs2', '4vs4'].includes(battleType)) {
      return res.status(400).json({ error: 'Invalid battle type' });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Select random problem based on tier
    const difficultyMap = {
      'Bronze': ['easy'],
      'Silver': ['easy', 'medium'],
      'Gold': ['medium'],
      'Platinum': ['medium', 'hard'],
      'Diamond': ['hard']
    };

    const allowedDifficulties = difficultyMap[tier || user.tier];
    const problem = await Problem.aggregate([
      { $match: { difficulty: { $in: allowedDifficulties } } },
      { $sample: { size: 1 } }
    ]);

    if (!problem.length) {
      return res.status(500).json({ error: 'No suitable problem found' });
    }

    // Generate unique room ID
    const roomId = `BTX${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create battle room
    const battle = new Battle({
      participants: [{ user: userId }],
      problem: problem[0]._id,
      tier: tier || user.tier,
      battleType,
      roomId
    });

    await battle.save();

    res.status(201).json({
      success: true,
      battle: {
        id: battle._id,
        roomId: battle.roomId,
        battleType: battle.battleType,
        problem: problem[0],
        host: user.username,
        participants: [{ user: user.username, status: 'waiting' }],
        status: battle.status
      }
    });

  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Join an existing battle room
export const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const battle = await Battle.findOne({ roomId })
      .populate('participants.user', 'username')
      .populate('problem');

    if (!battle) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (battle.status !== 'waiting') {
      return res.status(400).json({ error: 'Battle already started' });
    }

    // Check if user is already in the room
    const isParticipant = battle.participants.some(p => p.user._id.toString() === userId);
    if (isParticipant) {
      return res.status(400).json({ error: 'Already joined this room' });
    }

    // Check room capacity based on battle type
    const maxParticipants = parseInt(battle.battleType.split('vs')[0]) * 2;
    if (battle.participants.length >= maxParticipants) {
      return res.status(400).json({ error: 'Room is full' });
    }

    // Add user to participants
    battle.participants.push({ user: userId });
    await battle.save();

    // Populate updated participants
    await battle.populate('participants.user', 'username');

    res.json({
      success: true,
      battle: {
        id: battle._id,
        roomId: battle.roomId,
        battleType: battle.battleType,
        problem: battle.problem,
        participants: battle.participants.map(p => ({
          user: p.user.username,
          status: p.status
        })),
        status: battle.status
      }
    });

  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get room status for lobby
export const getRoomStatus = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const battle = await Battle.findOne({ roomId })
      .populate('participants.user', 'username')
      .populate('problem');

    if (!battle) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const isParticipant = battle.participants.some(p => p.user._id.toString() === userId);
    if (!isParticipant) {
      return res.status(403).json({ error: 'Not a participant in this room' });
    }

    const isHost = battle.participants[0].user._id.toString() === userId;

    res.json({
      success: true,
      battle: {
        id: battle._id,
        roomId: battle.roomId,
        battleType: battle.battleType,
        problem: battle.problem,
        participants: battle.participants.map(p => ({
          user: p.user.username,
          status: p.status
        })),
        status: battle.status,
        isHost
      }
    });

  } catch (error) {
    console.error('Get room status error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Submit solution during battle
export const submitSolution = async (req, res) => {
  try {
    const { battleId } = req.params;
    const { code, language } = req.body;
    const userId = req.user.id;

    const battle = await resolveBattle(battleId).populate('problem');
    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }

    if (battle.status !== 'active') {
      return res.status(400).json({ error: 'Battle is not active' });
    }

    const participant = battle.participants.find(p => participantUserId(p) === userId);
    if (!participant) {
      return res.status(403).json({ error: 'Not a participant in this battle' });
    }

    // allow multiple submissions during the battle; we'll track bestScore

    // Execute code against test cases (ensure problem and testcases exist)
    const rawTestcases = (battle.problem && Array.isArray(battle.problem.testcases)) ? battle.problem.testcases : [];
    if (!rawTestcases.length) {
      return res.status(400).json({ error: 'No testcases available for this problem' });
    }

    const testCases = rawTestcases.filter(tc => !tc.hidden).map(tc => ({
      input: tc.input,
      expectedOutput: tc.output
    }));

    if (!testCases.length) {
      return res.status(400).json({ error: 'No visible testcases available for this problem' });
    }

    const executionResult = await executeCode(code, language, testCases);

    // Create submission record (use model fields)
    const submission = new Submission({
      user: userId,
      battle: battle._id,
      code,
      language,
      results: executionResult.results,
      overallResult: executionResult.overallResult
    });
    await submission.save();

    // update participant last submission time
    participant.submissionTime = new Date();

    // Calculate passed tests for this submission
    const passedCount = Array.isArray(executionResult.results) ? executionResult.results.filter(r => r.testcase && r.testcase.passed).length : 0;
    const totalTests = Array.isArray(executionResult.results) ? executionResult.results.length : 0;

    // If this submission is the user's best, store it
    if (!participant.bestScore || passedCount > participant.bestScore) {
      participant.bestScore = passedCount;
      participant.bestSubmission = submission._id;
    }

    // If user passed all tests -> immediate win
    if (passedCount === totalTests && totalTests > 0) {
      participant.result = 'win';

      for (const p of battle.participants) {
        if (participantUserId(p) !== userId) {
          p.result = 'lose';
        }
      }

      battle.status = 'finished';
      battle.endTime = new Date();
      await battle.save();

      const io = req.app.get('io');
      // 🔥 Find winner username

      await battle.populate('participants.user', 'username');
const winner = battle.participants.find(
  (p) => p.result === 'win'
);

io.to(battle.roomId).emit('battle-ended', {
  battleId: battle._id,
  winner: winner?.user?.username || null
});


return res.json({
  success: true,
  status: 'finished',
  result: 'win',                  // 🔥 IMPORTANT
  winner: winner?.user?.username || null,
  battleId: battle._id
});

    }

    // Save battle state with updated bestScore
    await battle.save();

    return res.json({
      success: true,
      message: 'Solution submitted.',
      passedCount,
      totalTests,
      bestScore: participant.bestScore
    });

  } catch (error) {
    console.error('Submit solution error:', error);
    const payload = { error: error.message };
    if (process.env.NODE_ENV !== 'production' && error && error.stack) payload.stack = error.stack;
    res.status(500).json(payload);
  }
};

// Start the battle (host only)
export const startBattle = async (req, res) => {
  try {
    const { battleId } = req.params;
    const userId = req.user.id;

    const battle = await resolveBattle(battleId);
    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }

    // Check if user is the host
      const isHost =
       participantUserId(battle.participants[0]) === userId;
    if (!isHost) {
      return res.status(403).json({ error: 'Only host can start the battle' });
    }

    if (battle.status !== 'waiting') {
      return res.status(400).json({ error: 'Battle already started' });
    }

    // Check minimum participants
    const minParticipants = parseInt(battle.battleType.split('vs')[0]);
    if (battle.participants.length < minParticipants) {
      return res.status(400).json({ error: `Need at least ${minParticipants} participants to start` });
    }

    await startBattleService(battleId);

    // Set a timer to end the battle after the duration
    const durationMs = battle.duration * 60 * 1000; // Convert minutes to milliseconds
    setTimeout(async () => {
      try {
        const currentBattle = await resolveBattle(battleId);
        if (currentBattle && currentBattle.status === 'active') {
          await endBattle(currentBattle._id);
          // Emit to all participants via Socket.IO
          const io = req.app.get('io');
          io.to(currentBattle.roomId).emit('battle-ended', { message: 'Battle ended due to timeout' });
        }
      } catch (error) {
        console.error('Error ending battle on timeout:', error);
      }
    }, durationMs);

    res.json({
      success: true,
      message: 'Battle started successfully'
    });

  } catch (error) {
    console.error('Start battle error:', error);
    res.status(500).json({ error: error.message });
  }
};
