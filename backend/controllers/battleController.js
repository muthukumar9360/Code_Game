import mongoose from 'mongoose';
import Battle from '../models/Battle.js';
import User from '../models/User.js';
import Problem from '../models/Problem.js';
import Submission from '../models/Submission.js';
import { findOpponent } from '../services/matchmakingService.js';
import { startBattle as startBattleService, endBattle } from '../services/battleService.js';
import { executeCode } from '../services/codeExecutionService.js';
import { awardBattleRewards } from '../services/rewardService.js';

// Helper: accept either Mongo ObjectId or roomId string
const resolveBattle = (idOrRoomId) => {
  if (!idOrRoomId) return null;
  const cleanId = String(idOrRoomId).trim();
  if (mongoose.Types.ObjectId.isValid(cleanId)) {
    return Battle.findById(cleanId);
  }
  return Battle.findOne({ roomId: { $regex: new RegExp(`^${cleanId}$`, 'i') } });
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

    const isHost = participantUserId(battle.participants[0]) === userId;
    if (!isHost) {
      return res.status(403).json({ error: 'Only host can start the battle' });
    }

    if (battle.status !== 'waiting') {
      return res.status(400).json({ error: 'Battle already started' });
    }

    const minMap = { '1vs1': 2, '2vs2': 4, '4vs4': 8 };
    const minParticipants = minMap[battle.battleType] || 2;
    if (battle.participants.length < minParticipants) {
      return res
        .status(400)
        .json({ error: `Need at least ${minParticipants} participants to start a ${battle.battleType} battle` });
    }

    const startedBattle = await startBattleService(battleId);

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
          user: p.user?.username || participantUserId(p),
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
          user: p.user?.username || participantUserId(p),
          tier: p.user?.tier,
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
      .populate('problem')
      .populate('problems')
      .populate('participants.solvedProblems');

    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }

    const isParticipant = battle.participants.some(p => {
      const pUid = participantUserId(p);
      return (pUid && pUid.toString() === (userId || '').toString()) ||
             (p.user?.username && req.user?.username && p.user.username === req.user.username);
    });

    if (!isParticipant && !battle.isRanked) {
      return res.status(403).json({ error: 'Not a participant in this battle' });
    }

    const now = new Date();
    const elapsed = battle.startTime ? Math.floor((now - battle.startTime) / 1000) : 0;

    const formatProblem = (p) => {
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

    let problemsPayload = [];
    if (battle.problems && battle.problems.length > 0) {
      problemsPayload = battle.problems.map(formatProblem).filter(Boolean);
    } else if (battle.problem) {
      problemsPayload = [formatProblem(battle.problem)].filter(Boolean);
    }

    const mappedParticipants = battle.participants.map(p => {
      const base = (p.timeLeft !== null && p.timeLeft !== undefined) ? p.timeLeft : (battle.duration || 30) * 60;
      const timeLeft = Math.max(0, base - elapsed);
      return {
        userId: participantUserId(p),
        user: (p.user && p.user.username) ? p.user.username : participantUserId(p),
        tier: (p.user && p.user.tier) ? p.user.tier : undefined,
        status: p.status,
        result: p.result,
        team: p.team || 'solo',
        isSpectator: Boolean(p.isSpectator),
        bestScore: p.bestScore || 0,
        solvedProblems: (p.solvedProblems || []).map(sp => sp._id ? sp._id.toString() : sp.toString()),
        timeLeft
      };
    });

    res.json({
      success: true,
      battle: {
        id: battle._id,
        roomId: battle.roomId,
        status: battle.status,
        battleType: battle.battleType || '1vs1',
        isRanked: Boolean(battle.isRanked),
        problem: formatProblem(battle.problem) || problemsPayload[0] || null,
        problems: problemsPayload,
        problemCount: problemsPayload.length || battle.problemCount || 1,
        participants: mappedParticipants,
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
    const {
      battleType = '1vs1',
      tier,
      problemCount = 1,
      duration = 30,
      selectionMode = 'random',
      selectedProblemSlugs = [],
      hostRole = 'player',
      startMode = 'immediate',
      scheduledStartTime,
      isTournament = false,
      tournamentMode = 'real',
      requiresApproval = false,
      accessPassword = null,
      isRanked = false,
      maxParticipants
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const count = Math.min(Math.max(parseInt(problemCount) || 1, 1), 10);
    let selectedProblems = [];

    if (selectionMode === 'manual' && Array.isArray(selectedProblemSlugs) && selectedProblemSlugs.length > 0) {
      selectedProblems = await Problem.find({ slug: { $in: selectedProblemSlugs } }).limit(count);
    }

    if (!selectedProblems || selectedProblems.length === 0) {
      const difficultyMap = {
        'Bronze': ['easy'],
        'Silver': ['easy', 'medium'],
        'Gold': ['medium'],
        'Platinum': ['medium', 'hard'],
        'Diamond': ['hard']
      };

      const allowedDifficulties = difficultyMap[tier || user.tier] || ['easy'];
      selectedProblems = await Problem.aggregate([
        { $match: { difficulty: { $in: allowedDifficulties } } },
        { $sample: { size: count } }
      ]);

      if (!selectedProblems || selectedProblems.length < count) {
        const fallbacks = await Problem.aggregate([{ $sample: { size: count } }]);
        selectedProblems = [...(selectedProblems || []), ...fallbacks].slice(0, count);
      }
    }

    if (!selectedProblems || selectedProblems.length === 0) {
      const fallback = await Problem.findOne();
      if (!fallback) {
        return res.status(500).json({ error: 'No problems found in database' });
      }
      selectedProblems = [fallback];
    }

    const defaultMaxMap = {
      '1vs1': 2,
      '3-ffa': 3,
      '2vs2': 4,
      '4-ffa': 4,
      '4vs4': 8,
      'contest': 50,
      'ffa-custom': 10
    };
    const maxLimit = maxParticipants ? parseInt(maxParticipants) : (defaultMaxMap[battleType] || 2);

    const roomId = `BTX${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const shouldRequireApproval = Boolean(requiresApproval || isTournament || battleType === 'contest');

    const hostParticipant = {
      user: userId,
      status: 'waiting',
      isSpectator: hostRole === 'spectator',
      approvalStatus: 'approved',
      team: (battleType === '2vs2' || battleType === '4vs4') ? 'A' : 'solo',
      assignedProblem: selectedProblems[0]._id
    };

    const battle = new Battle({
      participants: [hostParticipant],
      problem: selectedProblems[0]._id,
      problems: selectedProblems.map(p => p._id),
      problemCount: selectedProblems.length,
      selectionMode,
      tier: tier || user.tier,
      battleType,
      duration: parseInt(duration) || 30,
      maxParticipants: maxLimit,
      hostRole,
      startMode,
      scheduledStartTime: scheduledStartTime ? new Date(scheduledStartTime) : null,
      isTournament: Boolean(isTournament || battleType === 'contest'),
      tournamentMode: tournamentMode === 'friendly' ? 'friendly' : 'real',
      requiresApproval: shouldRequireApproval,
      accessPassword: accessPassword ? accessPassword.trim() : null,
      isRanked: false,
      roomId
    });

    await battle.save();

    res.status(201).json({
      success: true,
      battle: {
        id: battle._id,
        roomId: battle.roomId,
        battleType: battle.battleType,
        problem: selectedProblems[0],
        problems: selectedProblems,
        problemCount: selectedProblems.length,
        selectionMode: battle.selectionMode,
        duration: battle.duration,
        host: user.username,
        hostRole: battle.hostRole,
        isTournament: battle.isTournament,
        requiresApproval: battle.requiresApproval,
        maxParticipants: battle.maxParticipants,
        participants: [{
          user: user.username,
          userId: user._id,
          status: 'waiting',
          team: hostParticipant.team,
          isSpectator: hostParticipant.isSpectator,
          approvalStatus: 'approved'
        }],
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
    const isSpectator = req.body?.isSpectator === true;

    const battle = await Battle.findOne({ roomId })
      .populate('participants.user', 'username tier')
      .populate('problem')
      .populate('problems');

    if (!battle) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (battle.status !== 'waiting') {
      return res.status(400).json({ error: 'Battle already started' });
    }

    // Password validation for hackathons / corporate rooms
    if (battle.accessPassword) {
      const provided = (req.body?.password || req.query?.password || '').trim();
      if (!provided || provided !== battle.accessPassword) {
        return res.status(403).json({
          error: 'This tournament room requires a security entrance password.',
          requiresPassword: true
        });
      }
    }

    const isParticipant = battle.participants.some(p => participantUserId(p) === userId);
    if (isParticipant) {
      const existing = battle.participants.find(p => participantUserId(p) === userId);
      if (existing?.approvalStatus === 'rejected') {
        return res.status(403).json({ error: 'Your clearance request was declined by the tournament admin.' });
      }

      return res.json({
        success: true,
        battle: {
          id: battle._id,
          roomId: battle.roomId,
          battleType: battle.battleType,
          problem: battle.problem,
          problems: battle.problems,
          problemCount: battle.problemCount || 1,
          duration: battle.duration,
          isTournament: battle.isTournament,
          requiresApproval: battle.requiresApproval,
          myApprovalStatus: existing?.approvalStatus || 'approved',
          participants: battle.participants.map(p => ({
            userId: participantUserId(p),
            user: p.user?.username || participantUserId(p),
            tier: p.user?.tier,
            status: p.status,
            team: p.team || 'solo',
            isSpectator: p.isSpectator || false,
            approvalStatus: p.approvalStatus || 'approved'
          })),
          status: battle.status
        }
      });
    }

    const activeApprovedPlayers = battle.participants.filter(p => !p.isSpectator && p.approvalStatus !== 'rejected');
    const maxLimit = battle.maxParticipants || 2;
    if (!isSpectator && activeApprovedPlayers.length >= maxLimit) {
      return res.status(400).json({ error: 'Room is full for active players. You may join as a spectator.' });
    }

    let team = 'solo';
    if (battle.battleType === '2vs2' || battle.battleType === '4vs4') {
      const teamACount = battle.participants.filter(p => p.team === 'A' && !p.isSpectator && p.approvalStatus !== 'rejected').length;
      const teamBCount = battle.participants.filter(p => p.team === 'B' && !p.isSpectator && p.approvalStatus !== 'rejected').length;
      team = teamACount <= teamBCount ? 'A' : 'B';
    }

    const needsApproval = Boolean(battle.requiresApproval || battle.isTournament);
    const initialApprovalStatus = needsApproval ? 'pending' : 'approved';

    battle.participants.push({
      user: userId,
      status: 'waiting',
      team,
      isSpectator,
      approvalStatus: initialApprovalStatus
    });
    await battle.save();
    await battle.populate('participants.user', 'username tier');

    const battleData = {
      id: battle._id,
      roomId: battle.roomId,
      battleType: battle.battleType,
      problem: battle.problem,
      problems: battle.problems,
      problemCount: battle.problemCount || 1,
      duration: battle.duration,
      isTournament: battle.isTournament,
      requiresApproval: battle.requiresApproval,
      myApprovalStatus: initialApprovalStatus,
      participants: battle.participants.map(p => ({
        userId: participantUserId(p),
        user: p.user?.username || participantUserId(p),
        tier: p.user?.tier,
        status: p.status,
        team: p.team || 'solo',
        isSpectator: p.isSpectator || false,
        approvalStatus: p.approvalStatus || 'approved'
      })),
      status: battle.status
    };

    const io = req.app.get('io');
    if (io) {
      io.to(battle.roomId).emit('player-joined', { battle: battleData });
      if (initialApprovalStatus === 'pending') {
        const joinedUser = battle.participants.find(p => participantUserId(p) === userId);
        io.to(battle.roomId).emit('player-join-requested', {
          roomId: battle.roomId,
          userId,
          user: joinedUser?.user?.username || 'Competitor',
          tier: joinedUser?.user?.tier,
          isSpectator,
          approvalStatus: 'pending'
        });
      }
    }

    res.json({
      success: true,
      battle: battleData
    });

  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Leave a battle room before contest starts
export const leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const battle = await Battle.findOne({ roomId });
    if (!battle) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (battle.status !== 'waiting') {
      return res.status(400).json({ error: 'Battle has already started' });
    }

    battle.participants = battle.participants.filter(p => participantUserId(p) !== userId);

    if (battle.participants.length === 0) {
      await Battle.deleteOne({ _id: battle._id });
      return res.json({ success: true, message: 'Room removed' });
    }

    await battle.save();
    await battle.populate('participants.user', 'username');

    const battleData = {
      id: battle._id,
      roomId: battle.roomId,
      battleType: battle.battleType,
      participants: battle.participants.map(p => ({
        user: p.user?.username || participantUserId(p),
        status: p.status
      })),
      status: battle.status
    };

    const io = req.app.get('io');
    if (io) {
      io.to(battle.roomId).emit('player-left', { battle: battleData });
    }

    res.json({ success: true, message: 'Left room successfully' });
  } catch (error) {
    console.error('Leave room error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get room status for lobby
export const getRoomStatus = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const battle = await Battle.findOne({ roomId })
      .populate('participants.user', 'username tier')
      .populate('problem')
      .populate('problems')
      .populate('participants.assignedProblem');

    if (!battle) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const isParticipant = battle.participants.some(p => participantUserId(p) === userId);
    if (!isParticipant) {
      return res.status(403).json({ error: 'Not a participant in this room' });
    }

    const isHost = participantUserId(battle.participants[0]) === userId;
    const currentParticipant = battle.participants.find(p => participantUserId(p) === userId);

    res.json({
      success: true,
      battle: {
        id: battle._id,
        roomId: battle.roomId,
        battleType: battle.battleType,
        problem: currentParticipant?.assignedProblem || battle.problem,
        problems: battle.problems,
        problemCount: battle.problemCount || 1,
        selectionMode: battle.selectionMode,
        duration: battle.duration,
        tier: battle.tier,
        hostRole: battle.hostRole,
        startMode: battle.startMode,
        scheduledStartTime: battle.scheduledStartTime,
        maxParticipants: battle.maxParticipants,
        isTournament: battle.isTournament,
        requiresApproval: battle.requiresApproval,
        myApprovalStatus: currentParticipant?.approvalStatus || 'approved',
        participants: battle.participants.map(p => ({
          userId: participantUserId(p),
          user: p.user?.username || participantUserId(p),
          tier: p.user?.tier,
          status: p.status,
          team: p.team || 'solo',
          isSpectator: p.isSpectator || false,
          approvalStatus: p.approvalStatus || 'approved',
          assignedProblem: p.assignedProblem
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

// Approve or reject a participant or spectator in the room (Host / Admin only)
export const approveParticipant = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;
    const { targetUserId, action, team } = req.body; // 'approve' or 'reject', optional 'team': 'A' | 'B'

    const battle = await Battle.findOne({ roomId })
      .populate('participants.user', 'username tier')
      .populate('problem')
      .populate('problems');

    if (!battle) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const isHost = participantUserId(battle.participants[0]) === userId;
    if (!isHost) {
      return res.status(403).json({ error: 'Only the room admin/host can approve participants' });
    }

    const participant = battle.participants.find(p => participantUserId(p) === targetUserId);
    if (!participant) {
      return res.status(404).json({ error: 'Target user not found in this battle room' });
    }

    if (action === 'approve') {
      const maxLimit = battle.maxParticipants || (battle.battleType === '2vs2' ? 4 : (battle.battleType === '4vs4' ? 8 : (battle.battleType === '3-ffa' ? 3 : 2)));
      const activeApproved = battle.participants.filter(
        p => !p.isSpectator && p.approvalStatus === 'approved' && participantUserId(p) !== targetUserId
      );

      if (!participant.isSpectator && activeApproved.length >= maxLimit) {
        return res.status(400).json({ error: `Cannot approve: Battle room is already at full capacity (${maxLimit} players). Space is full.` });
      }

      if (battle.battleType === '2vs2' || battle.battleType === '4vs4') {
        const assignedTeam = (team === 'A' || team === 'B') ? team : (participant.team === 'B' ? 'B' : 'A');
        const maxPerTeam = battle.battleType === '2vs2' ? 2 : 4;
        const currentTeamCount = battle.participants.filter(
          p => p.team === assignedTeam && !p.isSpectator && p.approvalStatus === 'approved' && participantUserId(p) !== targetUserId
        ).length;

        if (currentTeamCount >= maxPerTeam) {
          return res.status(400).json({
            error: `Cannot approve into Team ${assignedTeam}: Team ${assignedTeam} has reached maximum capacity (${maxPerTeam}/${maxPerTeam} players). Space does not fit.`
          });
        }
        participant.team = assignedTeam;
      }

      participant.approvalStatus = 'approved';
    } else if (action === 'reject') {
      participant.approvalStatus = 'rejected';
    } else {
      return res.status(400).json({ error: 'Invalid action: must be approve or reject' });
    }

    await battle.save();

    const battleData = {
      id: battle._id,
      roomId: battle.roomId,
      battleType: battle.battleType,
      problem: battle.problem,
      problems: battle.problems,
      problemCount: battle.problemCount || 1,
      duration: battle.duration,
      tier: battle.tier,
      hostRole: battle.hostRole,
      requiresApproval: battle.requiresApproval,
      isTournament: battle.isTournament,
      maxParticipants: battle.maxParticipants,
      participants: battle.participants.map(p => ({
        userId: participantUserId(p),
        user: p.user?.username || participantUserId(p),
        tier: p.user?.tier,
        status: p.status,
        team: p.team || 'solo',
        isSpectator: p.isSpectator || false,
        approvalStatus: p.approvalStatus || 'approved'
      })),
      status: battle.status
    };

    const io = req.app.get('io');
    if (io) {
      io.to(battle.roomId).emit('participant-approved', {
        battle: battleData,
        targetUserId,
        action,
        approvalStatus: participant.approvalStatus,
        team: participant.team
      });
      io.to(battle.roomId).emit('player-joined', { battle: battleData });
    }

    res.json({
      success: true,
      battle: battleData,
      targetUserId,
      action,
      approvalStatus: participant.approvalStatus,
      team: participant.team
    });
  } catch (error) {
    console.error('Approve participant error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Reassign participant team in Duo / Squad room (Host / Admin only)
export const reassignParticipantTeam = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;
    const { targetUserId, team } = req.body; // team: 'A' | 'B'

    if (!team || (team !== 'A' && team !== 'B')) {
      return res.status(400).json({ error: 'Team must be designated as A or B' });
    }

    const battle = await Battle.findOne({ roomId })
      .populate('participants.user', 'username tier')
      .populate('problem')
      .populate('problems');

    if (!battle) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const isHost = participantUserId(battle.participants[0]) === userId;
    if (!isHost) {
      return res.status(403).json({ error: 'Only the room host can rearrange team rosters' });
    }

    if (battle.status !== 'waiting') {
      return res.status(400).json({ error: 'Cannot rearrange teams once battle has started' });
    }

    const participant = battle.participants.find(p => participantUserId(p) === targetUserId);
    if (!participant) {
      return res.status(404).json({ error: 'Target user not found in this battle room' });
    }

    // Verify team capacity for squad/duo
    const maxPerTeam = battle.battleType === '2vs2' ? 2 : (battle.battleType === '4vs4' ? 4 : 10);
    const targetTeamCount = battle.participants.filter(
      p => p.team === team && !p.isSpectator && p.approvalStatus === 'approved' && participantUserId(p) !== targetUserId
    ).length;

    if (targetTeamCount >= maxPerTeam) {
      return res.status(400).json({ error: `Cannot switch: Team ${team} is already full (maximum ${maxPerTeam} players). Space is full.` });
    }

    participant.team = team;
    await battle.save();

    const battleData = {
      id: battle._id,
      roomId: battle.roomId,
      battleType: battle.battleType,
      problem: battle.problem,
      problems: battle.problems,
      problemCount: battle.problemCount || 1,
      duration: battle.duration,
      tier: battle.tier,
      hostRole: battle.hostRole,
      requiresApproval: battle.requiresApproval,
      isTournament: battle.isTournament,
      maxParticipants: battle.maxParticipants,
      participants: battle.participants.map(p => ({
        userId: participantUserId(p),
        user: p.user?.username || participantUserId(p),
        tier: p.user?.tier,
        status: p.status,
        team: p.team || 'solo',
        isSpectator: p.isSpectator || false,
        approvalStatus: p.approvalStatus || 'approved'
      })),
      status: battle.status
    };

    const io = req.app.get('io');
    if (io) {
      io.to(battle.roomId).emit('team-reassigned', {
        battle: battleData,
        targetUserId,
        newTeam: team
      });
      io.to(battle.roomId).emit('player-joined', { battle: battleData });
    }

    res.json({
      success: true,
      battle: battleData,
      targetUserId,
      newTeam: team
    });
  } catch (error) {
    console.error('Reassign team error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Submit solution during battle
export const submitSolution = async (req, res) => {
  try {
    const { battleId } = req.params;
    const { code, language, problemId, problemSlug } = req.body;
    const userId = req.user.id;

    const battle = await resolveBattle(battleId)
      .populate('problem')
      .populate('problems')
      .populate('participants.assignedProblem');
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

    // Identify target problem from request body or fall back to assigned/first
    let targetProblem = null;
    if (problemId) {
      targetProblem = battle.problems?.find(p => p._id.toString() === problemId.toString());
      if (!targetProblem && battle.problem?._id?.toString() === problemId.toString()) {
        targetProblem = battle.problem;
      }
    } else if (problemSlug) {
      targetProblem = battle.problems?.find(p => p.slug === problemSlug);
      if (!targetProblem && battle.problem?.slug === problemSlug) {
        targetProblem = battle.problem;
      }
    }

    if (!targetProblem) {
      targetProblem = participant.assignedProblem || (battle.problems && battle.problems[0]) || battle.problem;
    }

    if (!targetProblem) {
      return res.status(404).json({ error: 'Problem not found for this participant' });
    }

    const rawTestcases = (targetProblem && Array.isArray(targetProblem.testcases)) ? targetProblem.testcases : [];
    if (!rawTestcases.length) {
      return res.status(400).json({ error: 'No testcases available for this problem' });
    }

    // Evaluate against ALL testcases
    const testCases = rawTestcases.map(tc => ({
      input: tc.input,
      expectedOutput: tc.output
    }));

    const executionResult = await executeCode(code, language, testCases);

    const today = new Date().toISOString().slice(0, 10);
    await User.findByIdAndUpdate(userId, {
      $addToSet: { activeDays: today },
      $set: { lastActive: new Date() }
    });

    const submission = new Submission({
      user: userId,
      battle: battle._id,
      problem: targetProblem._id,
      code,
      language,
      results: executionResult.results,
      overallResult: executionResult.overallResult
    });
    await submission.save();

    participant.submissionTime = new Date();
    const passedCount = Array.isArray(executionResult.results) ? executionResult.results.filter(r => r.testcase && r.testcase.passed).length : 0;
    const totalTests = executionResult.results.length;

    if (!participant.bestScore || passedCount > participant.bestScore) {
      participant.bestScore = passedCount;
      participant.bestSubmission = submission._id;
    }

    if (!participant.solvedProblems) {
      participant.solvedProblems = [];
    }

    const isProblemAlreadySolved = participant.solvedProblems.some(
      sp => sp.toString() === targetProblem._id.toString()
    );

    // If user passed all private tests for this problem
    if (passedCount === totalTests && totalTests > 0) {
      if (!isProblemAlreadySolved) {
        participant.solvedProblems.push(targetProblem._id);
      }

      const totalRequired = (battle.problems && battle.problems.length > 0) ? battle.problems.length : 1;
      const solvedCount = participant.solvedProblems.length;

      // FIRST TO SOLVE ALL ASSIGNED PROBLEMS WINS!
      if (solvedCount >= totalRequired) {
        participant.result = 'win';

        for (const p of battle.participants) {
          if (participantUserId(p) !== userId) {
            p.result = 'lose';
          }
        }

        battle.status = 'finished';
        battle.endTime = new Date();
        await battle.save();

        // Award rewards
        const rewards = await awardBattleRewards(battle.participants, battle);

        await battle.populate('participants.user', 'username');
        const winner = battle.participants.find(p => p.result === 'win');

        const io = req.app.get('io');
        if (io) {
          io.to(battle.roomId).emit('battle-ended', {
            battleId: battle._id,
            roomId: battle.roomId,
            winner: winner?.user?.username || null,
            rewards
          });
          // Remove all sockets from finished room to prevent reuse
          setTimeout(() => {
            try {
              io.in(battle.roomId).socketsLeave(battle.roomId);
            } catch (e) {
              // ignore
            }
          }, 3000);
        }

        return res.json({
          success: true,
          status: 'finished',
          result: 'win',
          allSolved: true,
          problemSolved: true,
          winner: winner?.user?.username || null,
          battleId: battle._id,
          passedCount,
          totalTests,
          solvedCount,
          totalRequired,
          rewards
        });
      }

      // Solved this question, but more remaining
      await battle.save();

      const io = req.app.get('io');
      if (io) {
        io.to(battle.roomId).emit('problem-solved-update', {
          battleId: battle._id,
          roomId: battle.roomId,
          userId,
          username: req.user?.username || participant.user?.username || "Combatant",
          solvedProblemId: targetProblem._id,
          solvedCount,
          totalRequired
        });
      }

      return res.json({
        success: true,
        status: 'active',
        result: 'progress',
        problemSolved: true,
        allSolved: false,
        solvedProblemId: targetProblem._id,
        solvedCount,
        totalRequired,
        passedCount,
        totalTests,
        message: `Challenge verified! (${solvedCount}/${totalRequired} solved). Switch to remaining challenge(s) to win!`
      });
    }

    await battle.save();

    return res.json({
      success: true,
      status: 'active',
      problemSolved: false,
      allSolved: false,
      message: `Passed ${passedCount}/${totalTests} testcases.`,
      passedCount,
      totalTests,
      solvedCount: participant.solvedProblems.length,
      totalRequired: (battle.problems && battle.problems.length > 0) ? battle.problems.length : 1,
      bestScore: participant.bestScore
    });

  } catch (error) {
    console.error('Submit solution error:', error);
    res.status(500).json({ error: error.message });
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

    const isHost = participantUserId(battle.participants[0]) === userId;
    if (!isHost) {
      return res.status(403).json({ error: 'Only host can start the battle' });
    }

    if (battle.status !== 'waiting') {
      return res.status(400).json({ error: 'Battle already started' });
    }

    const minMap = { '1vs1': 2, '2vs2': 4, '3-ffa': 3, '4-ffa': 4, '4vs4': 8, 'contest': 1, 'ffa-custom': 1 };
    let minParticipants = minMap[battle.battleType] || 2;
    if (req.query.force || process.env.NODE_ENV !== 'production' || req.body?.force) {
      minParticipants = 1;
    }

    const activeParticipants = battle.participants.filter(
      p => !p.isSpectator && p.approvalStatus !== 'pending' && p.approvalStatus !== 'rejected'
    );
    if (activeParticipants.length < minParticipants) {
      return res.status(400).json({ error: `Need at least ${minParticipants} approved active player(s) to start a ${battle.battleType} battle` });
    }

    // Assign problems to participants
    const problemList = (battle.problems && battle.problems.length > 0) ? battle.problems : [battle.problem];
    if (battle.battleType === '2vs2' || battle.battleType === '4vs4') {
      let teamACount = 0;
      let teamBCount = 0;
      for (const p of battle.participants) {
        if (p.isSpectator) continue;
        if (p.team === 'A') {
          p.assignedProblem = problemList[teamACount % problemList.length];
          p.assignedProblemIndex = teamACount % problemList.length;
          teamACount++;
        } else {
          p.assignedProblem = problemList[teamBCount % problemList.length];
          p.assignedProblemIndex = teamBCount % problemList.length;
          teamBCount++;
        }
      }
    } else {
      for (const p of battle.participants) {
        p.assignedProblem = problemList[0];
        p.assignedProblemIndex = 0;
      }
    }
    await battle.save();

    await startBattleService(battle._id);

    const populated = await Battle.findById(battle._id)
      .populate('participants.user', 'username tier')
      .populate('problem')
      .populate('problems')
      .populate('participants.assignedProblem');

    const battleData = {
      id: populated._id,
      roomId: populated.roomId,
      battleType: populated.battleType,
      problem: populated.problem,
      problems: populated.problems,
      problemCount: populated.problemCount || 1,
      participants: populated.participants.map(p => ({
        userId: participantUserId(p),
        user: p.user?.username || participantUserId(p),
        status: p.status,
        team: p.team || 'solo',
        isSpectator: p.isSpectator || false,
        assignedProblem: p.assignedProblem
      })),
      status: populated.status,
      startTime: populated.startTime,
      duration: populated.duration
    };

    const io = req.app.get('io');
    if (io) {
      io.to(populated.roomId).emit('battle-started', { battle: battleData });
    }

    const durationMs = (populated.duration || 30) * 60 * 1000;
    setTimeout(async () => {
      try {
        const currentBattle = await resolveBattle(battleId);
        if (currentBattle && currentBattle.status === 'active') {
          await endBattle(currentBattle._id);
          if (io) {
            io.to(currentBattle.roomId).emit('battle-ended', { message: 'Battle ended due to timeout' });
          }
        }
      } catch (error) {
        console.error('Error ending battle on timeout:', error);
      }
    }, durationMs);

    res.json({
      success: true,
      message: 'Battle started successfully',
      battle: battleData
    });

  } catch (error) {
    console.error('Start battle error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Abandon battle mid-contest
export const abandonBattle = async (req, res) => {
  try {
    const { battleId } = req.params;
    const userId = req.user.id;
    const { code, language, problemId } = req.body || {};

    const battle = await resolveBattle(battleId).populate('participants.user', 'username');
    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }

    // If battle is already finished, treat as successful exit
    if (battle.status === 'finished') {
      return res.json({
        success: true,
        status: 'finished',
        message: 'Battle is already finished.'
      });
    }

    const participant = battle.participants.find(p => participantUserId(p) === userId);
    if (!participant) {
      return res.status(403).json({ error: 'Not a participant in this battle' });
    }

    // Save exiting user's code if provided so post-match inspector can display it
    if (code && typeof code === 'string' && code.trim()) {
      participant.lastCode = code;
      if (language) participant.lastLanguage = language;
      try {
        const probId = problemId || battle.problem || (battle.problems && battle.problems[0]);
        if (probId) {
          await Submission.create({
            user: userId,
            problem: probId,
            battle: battle._id,
            code,
            language: language || 'python',
            overallResult: 'abandoned',
            status: 'completed',
            results: []
          });
        }
      } catch (subErr) {
        console.error('Failed to create snapshot submission on abandon:', subErr);
      }
    }

    participant.result = 'lose';
    for (const p of battle.participants) {
      if (participantUserId(p) !== userId) {
        p.result = 'win';
      }
    }

    battle.status = 'finished';
    battle.endTime = new Date();
    await battle.save();

    const rewards = await awardBattleRewards(battle.participants, battle);

    const winner = battle.participants.find(p => p.result === 'win');
    const io = req.app.get('io');
    if (io) {
      io.to(battle.roomId).emit('battle-ended', {
        battleId: battle._id,
        roomId: battle.roomId,
        winner: winner?.user?.username || winner?.username || null,
        message: `${participant.user?.username || participant.username || 'A player'} forfeited the battle.`,
        rewards
      });
    }

    res.json({
      success: true,
      status: 'finished',
      message: 'Battle abandoned.'
    });

  } catch (error) {
    console.error('Abandon battle error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get battle summary for post-match results page
export const getBattleSummary = async (req, res) => {
  try {
    const { battleId } = req.params;
    const battle = await resolveBattle(battleId)
      .populate('participants.user', 'username tier xp')
      .populate('problem', 'title difficulty description topics examples constraints testcases')
      .populate('problems', 'title difficulty description topics examples constraints testcases')
      .populate('participants.bestSubmission');

    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }

    const problemList = (battle.problems && battle.problems.length > 0)
      ? battle.problems
      : (battle.problem ? [battle.problem] : []);

    const allBattleSubmissions = await Submission.find({ battle: battle._id }).sort({ createdAt: -1 });

    const participants = await Promise.all(battle.participants.map(async p => {
      const pUserId = p.user?._id ? p.user._id.toString() : p.user?.toString();
      const userSubs = allBattleSubmissions.filter(s => s.user && s.user.toString() === pUserId);

      // Latest submission overall
      let bestSub = p.bestSubmission || userSubs[0] || null;

      // Map submissions per problem in this contest
      const submissionsByProblem = problemList.map((prob, idx) => {
        const probIdStr = prob._id ? prob._id.toString() : prob.toString();
        let sub = userSubs.find(s => s.problem && s.problem.toString() === probIdStr);
        if (!sub && problemList.length === 1 && userSubs.length > 0) {
          sub = userSubs[0];
        }

        const passed = Array.isArray(sub?.results) ? sub.results.filter(r => r.testcase && r.testcase.passed).length : 0;
        const total = Array.isArray(sub?.results) && sub.results.length > 0 ? sub.results.length : (prob.testcases?.length || 0);

        const resolvedCode = sub?.code || (idx === 0 ? p.lastCode : "") || p.lastCode || "";
        const resolvedLang = sub?.language || p.lastLanguage || "python";

        return {
          problemId: prob._id,
          problemTitle: prob.title || `Question ${idx + 1}`,
          difficulty: prob.difficulty || "medium",
          code: resolvedCode,
          language: resolvedLang,
          passedCount: passed,
          totalTests: total,
          isSolved: passed === total && total > 0,
          submittedAt: sub?.createdAt || null
        };
      });

      const fallbackCode = bestSub?.code || p.lastCode || (submissionsByProblem[0]?.code || "");
      const fallbackLang = bestSub?.language || p.lastLanguage || (submissionsByProblem[0]?.language || "python");

      return {
        userId: p.user?._id || p.user,
        username: p.user?.username || p.username || (typeof p.user === 'string' ? p.user : 'Combatant'),
        tier: p.user?.tier,
        xp: p.user?.xp,
        result: p.result,
        bestScore: p.bestScore || 0,
        submissionTime: p.submissionTime,
        team: p.team || 'solo',
        isSpectator: p.isSpectator || false,
        code: fallbackCode,
        language: fallbackLang,
        lastCode: p.lastCode || "",
        lastLanguage: p.lastLanguage || "python",
        executionResults: bestSub?.results || [],
        submissions: submissionsByProblem
      };
    }));

    res.json({
      success: true,
      battle: {
        id: battle._id,
        roomId: battle.roomId,
        status: battle.status,
        battleType: battle.battleType,
        tier: battle.tier,
        problem: battle.problem,
        problems: problemList.map(p => ({
          _id: p._id,
          title: p.title,
          difficulty: p.difficulty,
          description: p.description
        })),
        problemCount: problemList.length,
        startTime: battle.startTime,
        endTime: battle.endTime,
        duration: battle.duration,
        participants
      }
    });

  } catch (error) {
    console.error('Get battle summary error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get user contest history
export const getMyContestHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const battles = await Battle.find({
      "participants.user": userId
    })
      .populate("problem", "title difficulty")
      .populate("participants.user", "username")
      .sort({ createdAt: -1 });

    const history = battles.map(battle => {
      const me = battle.participants.find(
        p => participantUserId(p) === userId
      );

      const opponents = battle.participants
        .filter(p => participantUserId(p) !== userId)
        .map(p => p.user?.username || 'Opponent');

      return {
        battleId: battle._id,
        roomId: battle.roomId,
        battleType: battle.battleType,
        tier: battle.tier,
        isRanked: Boolean(battle.isRanked),
        isTournament: Boolean(battle.isTournament),
        tournamentMode: battle.tournamentMode || 'real',
        problemTitle: battle.problem?.title || 'Unknown Problem',
        difficulty: battle.problem?.difficulty,
        status: battle.status,
        result: me?.result || "pending",
        bestScore: me?.bestScore || 0,
        opponents,
        startTime: battle.startTime,
        endTime: battle.endTime,
        duration: battle.duration,
        createdAt: battle.createdAt
      };
    });

    res.json({
      success: true,
      totalBattles: history.length,
      history
    });
  } catch (error) {
    console.error("Contest history error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Corporate & University Hackathon Hosting Mode: Plagiarism Detection & CSV Export
export const getHackathonReport = async (req, res) => {
  try {
    const { battleId } = req.params;
    const battle = await resolveBattle(battleId)
      .populate('participants.user', 'username email tier xp eloRating')
      .populate('problem', 'title difficulty')
      .populate('participants.bestSubmission');

    if (!battle) {
      return res.status(404).json({ error: 'Tournament room not found' });
    }

    const participantsData = await Promise.all(battle.participants.map(async (p, idx) => {
      let sub = p.bestSubmission;
      if (!sub && p.user?._id) {
        sub = await Submission.findOne({ battle: battle._id, user: p.user._id }).sort({ createdAt: -1 });
      }

      return {
        userId: p.user?._id,
        username: p.user?.username || `Combatant_${idx + 1}`,
        email: p.user?.email || 'N/A',
        tier: p.user?.tier || 'Bronze',
        eloRating: p.user?.eloRating || 1200,
        result: p.result || 'pending',
        bestScore: p.bestScore || 0,
        submissionTime: p.submissionTime || null,
        code: sub?.code || '',
        language: sub?.language || 'javascript'
      };
    }));

    // Tokenize and calculate pairwise Jaccard similarity
    const tokenize = (str) => {
      return new Set(
        str
          .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '')
          .replace(/[^a-zA-Z0-9_]/g, ' ')
          .toLowerCase()
          .split(/\s+/)
          .filter(t => t.length > 1)
      );
    };

    const similarityMatrix = [];
    const flaggedPairs = [];

    for (let i = 0; i < participantsData.length; i++) {
      for (let j = i + 1; j < participantsData.length; j++) {
        const p1 = participantsData[i];
        const p2 = participantsData[j];

        if (!p1.code || !p2.code) continue;

        const tokens1 = tokenize(p1.code);
        const tokens2 = tokenize(p2.code);

        const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
        const union = new Set([...tokens1, ...tokens2]);

        const similarityPct = union.size > 0 ? Math.round((intersection.size / union.size) * 100) : 0;

        similarityMatrix.push({
          user1: p1.username,
          user2: p2.username,
          similarity: similarityPct
        });

        if (similarityPct >= 75) {
          flaggedPairs.push({
            user1: p1.username,
            user2: p2.username,
            similarity: similarityPct,
            riskLevel: similarityPct >= 90 ? 'High' : 'Moderate'
          });
        }
      }
    }

    const csvHeader = 'Rank,Username,Email,Tier,EloRating,Score,Result,PlagiarismRisk,SubmissionTimestamp\n';
    const csvRows = participantsData
      .sort((a, b) => (b.bestScore || 0) - (a.bestScore || 0))
      .map((p, idx) => {
        const isFlagged = flaggedPairs.some(f => f.user1 === p.username || f.user2 === p.username);
        const risk = isFlagged ? 'FLAGGED_SUSPICIOUS' : 'CLEAN';
        const timestamp = p.submissionTime ? new Date(p.submissionTime).toISOString() : 'None';
        return `${idx + 1},"${p.username}","${p.email}","${p.tier}",${p.eloRating},${p.bestScore},"${p.result}","${risk}","${timestamp}"`;
      })
      .join('\n');

    res.json({
      success: true,
      report: {
        roomId: battle.roomId,
        battleType: battle.battleType,
        problemTitle: battle.problem?.title,
        totalParticipants: participantsData.length,
        participants: participantsData.map(p => ({
          username: p.username,
          tier: p.tier,
          eloRating: p.eloRating,
          bestScore: p.bestScore,
          result: p.result,
          submissionTime: p.submissionTime,
          codeLength: p.code?.length || 0,
          isFlagged: flaggedPairs.some(f => f.user1 === p.username || f.user2 === p.username)
        })),
        flaggedPairs,
        similarityMatrix,
        csvData: csvHeader + csvRows
      }
    });
  } catch (error) {
    console.error('Hackathon report generation error:', error);
    res.status(500).json({ error: error.message });
  }
};
