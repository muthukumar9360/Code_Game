import Battle from '../models/Battle.js';
import User from '../models/User.js';
import Problem from '../models/Problem.js';
import { findOpponent } from '../services/matchmakingService.js';
import { startBattle as startBattleService, endBattle } from '../services/battleService.js';

export const createBattle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tier } = req.body;

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find opponent
    const opponent = await findOpponent(userId, tier || user.tier);
    if (!opponent) {
      return res.status(200).json({
        message: 'No opponent found. Try again later.',
        waiting: true
      });
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

    // Create battle
    const battle = new Battle({
      participants: [
        { user: userId },
        { user: opponent._id }
      ],
      problem: problem[0]._id,
      tier: tier || user.tier,
      roomId: `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    await battle.save();

    // Start battle
    await startBattle(battle._id);

    res.status(201).json({
      success: true,
      battle: {
        id: battle._id,
        roomId: battle.roomId,
        problem: problem[0],
        participants: [
          { user: user.username, tier: user.tier },
          { user: opponent.username, tier: opponent.tier }
        ],
        startTime: battle.startTime,
        duration: battle.duration
      }
    });

  } catch (error) {
    console.error('Create battle error:', error);
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

    const isParticipant = battle.participants.some(p => p.user._id.toString() === userId);
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

    const battle = await Battle.findById(battleId)
      .populate('participants.user', 'username tier')
      .populate('problem');

    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }

    const isParticipant = battle.participants.some(p => p.user._id.toString() === userId);
    if (!isParticipant) {
      return res.status(403).json({ error: 'Not a participant in this battle' });
    }

    res.json({
      success: true,
      battle: {
        id: battle._id,
        status: battle.status,
        participants: battle.participants.map(p => ({
          user: p.user.username,
          tier: p.user.tier,
          status: p.status,
          result: p.result
        })),
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

    const battle = await Battle.findById(battleId);
    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }

    const isParticipant = battle.participants.some(p => p.user._id.toString() === userId);
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

// Start the battle (host only)
export const startBattle = async (req, res) => {
  try {
    const { battleId } = req.params;
    const userId = req.user.id;

    const battle = await Battle.findById(battleId);
    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }

    // Check if user is the host
    const isHost = battle.participants[0].user._id.toString() === userId;
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

    res.json({
      success: true,
      message: 'Battle started successfully'
    });

  } catch (error) {
    console.error('Start battle error:', error);
    res.status(500).json({ error: error.message });
  }
};
