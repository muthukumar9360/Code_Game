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
    let startAnchor = battle.startTime;
    if (!startAnchor && battle.status === 'active') {
      startAnchor = battle.createdAt || now;
      battle.startTime = startAnchor;
      battle.save().catch(() => {});
    }
    const isUntimed = Boolean(battle.isUntimed || battle.duration === 0);
    let computedRemaining = null;
    if (!isUntimed) {
      const elapsed = startAnchor ? Math.max(0, Math.floor((now.getTime() - new Date(startAnchor).getTime()) / 1000)) : 0;
      const totalDurationSec = (battle.duration || 30) * 60;
      computedRemaining = Math.max(0, totalDurationSec - elapsed);
    }

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
      const timeLeft = isUntimed ? null : computedRemaining;
      return {
        userId: participantUserId(p),
        user: (p.user && p.user.username) ? p.user.username : participantUserId(p),
        tier: (p.user && p.user.tier) ? p.user.tier : undefined,
        status: p.status,
        result: p.result,
        team: p.team || 'solo',
        assignedProblem: p.assignedProblem,
        assignedProblemIndex: p.assignedProblemIndex || 0,
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
        startTime: battle.startTime || startAnchor,
        endTime: battle.endTime,
        duration: isUntimed ? 0 : battle.duration,
        isUntimed
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
      isUntimed = false,
      selectionMode = 'random',
      selectedProblemSlugs = [],
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

    const minProblems = (battleType === '2vs2') ? 2 : (battleType === '4vs4' ? 4 : 1);
    const count = Math.min(Math.max(parseInt(problemCount) || minProblems, minProblems), 10);
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
      duration: (isUntimed || parseInt(duration) === 0) ? 0 : (parseInt(duration) || 30),
      isUntimed: Boolean(isUntimed || parseInt(duration) === 0),
      maxParticipants: maxLimit,
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
        isTournament: battle.isTournament,
        requiresApproval: battle.requiresApproval,
        maxParticipants: battle.maxParticipants,
        participants: [{
          user: user.username,
          userId: user._id,
          status: 'waiting',
          team: hostParticipant.team,
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
            approvalStatus: p.approvalStatus || 'approved'
          })),
          status: battle.status
        }
      });
    }

    const activeApprovedPlayers = battle.participants.filter(p => p.approvalStatus !== 'rejected');
    const maxLimit = battle.maxParticipants || 2;
    if (activeApprovedPlayers.length >= maxLimit) {
      return res.status(400).json({ error: 'Room is full. Maximum participant capacity reached.' });
    }

    let team = 'solo';
    if (battle.battleType === '2vs2' || battle.battleType === '4vs4') {
      const teamACount = battle.participants.filter(p => p.team === 'A' && p.approvalStatus !== 'rejected').length;
      const teamBCount = battle.participants.filter(p => p.team === 'B' && p.approvalStatus !== 'rejected').length;
      team = teamACount <= teamBCount ? 'A' : 'B';
    }

    const needsApproval = Boolean(battle.requiresApproval || battle.isTournament);
    const initialApprovalStatus = needsApproval ? 'pending' : 'approved';

    battle.participants.push({
      user: userId,
      status: 'waiting',
      team,
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
          approvalStatus: p.approvalStatus || 'approved',
          assignedProblem: p.assignedProblem,
          assignedProblemIndex: p.assignedProblemIndex || 0,
          solvedProblems: (p.solvedProblems || []).map(sp => sp._id ? sp._id.toString() : sp.toString())
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

// Approve or reject a participant in the room (Host / Admin only)
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
        p => p.approvalStatus === 'approved' && participantUserId(p) !== targetUserId
      );

      if (activeApproved.length >= maxLimit) {
        return res.status(400).json({ error: `Cannot approve: Battle room is already at full capacity (${maxLimit} players). Space is full.` });
      }

      if (battle.battleType === '2vs2' || battle.battleType === '4vs4') {
        const assignedTeam = (team === 'A' || team === 'B') ? team : (participant.team === 'B' ? 'B' : 'A');
        const maxPerTeam = battle.battleType === '2vs2' ? 2 : 4;
        const currentTeamCount = battle.participants.filter(
          p => p.team === assignedTeam && p.approvalStatus === 'approved' && participantUserId(p) !== targetUserId
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
      requiresApproval: battle.requiresApproval,
      isTournament: battle.isTournament,
      maxParticipants: battle.maxParticipants,
      participants: battle.participants.map(p => ({
        userId: participantUserId(p),
        user: p.user?.username || participantUserId(p),
        tier: p.user?.tier,
        status: p.status,
        team: p.team || 'solo',
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
      p => p.team === team && p.approvalStatus === 'approved' && participantUserId(p) !== targetUserId
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
      requiresApproval: battle.requiresApproval,
      isTournament: battle.isTournament,
      maxParticipants: battle.maxParticipants,
      participants: battle.participants.map(p => ({
        userId: participantUserId(p),
        user: p.user?.username || participantUserId(p),
        tier: p.user?.tier,
        status: p.status,
        team: p.team || 'solo',
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

      const allProblems = (battle.problems && battle.problems.length > 0)
        ? battle.problems
        : (battle.problem ? [battle.problem] : []);
      const totalRequired = allProblems.length || 1;

      const isTeamMatch = Boolean(
        battle.battleType === '2vs2' ||
        battle.battleType === '4vs4' ||
        (participant.team && participant.team !== 'solo')
      );

      if (isTeamMatch) {
        const myTeam = participant.team || 'A';
        const myTeamMembers = battle.participants.filter(p => p.team === myTeam);
        const opponentTeamMembers = battle.participants.filter(p => p.team !== myTeam);

        // Gather unique solved problem IDs across my team
        const teamSolvedProblemIds = new Set();
        for (const m of myTeamMembers) {
          for (const sp of (m.solvedProblems || [])) {
            teamSolvedProblemIds.add((sp?._id || sp).toString());
          }
        }
        const teamSolvedCount = teamSolvedProblemIds.size;

        // Check if team has solved ALL required problems for the match
        if (teamSolvedCount >= totalRequired) {
          for (const p of myTeamMembers) {
            p.result = 'win';
          }
          for (const p of opponentTeamMembers) {
            p.result = 'lose';
          }

          battle.status = 'finished';
          battle.endTime = new Date();
          await battle.save();

          const rewards = await awardBattleRewards(battle.participants, battle);
          await battle.populate('participants.user', 'username');

          const winnerLabel = `Team ${myTeam}`;
          const io = req.app.get('io');
          if (io) {
            io.to(battle.roomId).emit('battle-ended', {
              battleId: battle._id,
              roomId: battle.roomId,
              winner: winnerLabel,
              winningTeam: myTeam,
              rewards
            });
            setTimeout(() => {
              try {
                io.in(battle.roomId).socketsLeave(battle.roomId);
              } catch (e) {}
            }, 3000);
          }

          return res.json({
            success: true,
            status: 'finished',
            result: 'win',
            allSolved: true,
            problemSolved: true,
            winner: winnerLabel,
            winningTeam: myTeam,
            battleId: battle._id,
            passedCount,
            totalTests,
            solvedCount: teamSolvedCount,
            totalRequired,
            rewards
          });
        }

        // Not all questions solved yet: automatically assign next available question to this operative!
        const unsolvedIndices = [];
        for (let idx = 0; idx < allProblems.length; idx++) {
          const probIdStr = (allProblems[idx]._id || allProblems[idx]).toString();
          if (!teamSolvedProblemIds.has(probIdStr)) {
            unsolvedIndices.push(idx);
          }
        }

        // What problem indices are currently being worked on by teammates?
        const otherTeammatesAssigned = new Set(
          myTeamMembers
            .filter(m => participantUserId(m) !== userId)
            .map(m => m.assignedProblemIndex)
            .filter(idx => idx !== undefined && idx !== null)
        );

        // Priority 1: Unsolved problem that is not currently being worked on by a teammate
        let nextIdx = unsolvedIndices.find(idx => !otherTeammatesAssigned.has(idx));
        // Priority 2: If all remaining unsolved problems are already assigned to other teammates (e.g. only 1 problem remaining in the entire match), assign it so this operative can assist!
        if (nextIdx === undefined && unsolvedIndices.length > 0) {
          nextIdx = unsolvedIndices[0];
        }
        if (nextIdx === undefined) {
          nextIdx = (participant.assignedProblemIndex + 1) % allProblems.length;
        }

        const nextProblem = allProblems[nextIdx];
        participant.assignedProblem = nextProblem._id || nextProblem;
        participant.assignedProblemIndex = nextIdx;
        await battle.save();

        const io = req.app.get('io');
        if (io) {
          io.to(battle.roomId).emit('problem-solved-update', {
            battleId: battle._id,
            roomId: battle.roomId,
            userId,
            username: req.user?.username || participant.user?.username || "Combatant",
            team: myTeam,
            solvedProblemId: targetProblem._id,
            solvedProblemTitle: targetProblem.title,
            solvedCount: teamSolvedCount,
            totalRequired,
            nextAssignedProblemIndex: nextIdx,
            nextAssignedProblemId: nextProblem._id || nextProblem,
            nextAssignedProblemTitle: nextProblem.title || `Question ${nextIdx + 1}`
          });
        }

        return res.json({
          success: true,
          status: 'active',
          result: 'progress',
          problemSolved: true,
          allSolved: false,
          solvedProblemId: targetProblem._id,
          solvedCount: teamSolvedCount,
          totalRequired,
          nextAssignedProblemIndex: nextIdx,
          nextAssignedProblem: nextProblem,
          passedCount,
          totalTests,
          message: `Objective verified! Team ${myTeam} progress: ${teamSolvedCount}/${totalRequired}. Automatically assigned to Challenge #${nextIdx + 1}: ${nextProblem.title || `Question ${nextIdx + 1}`}!`
        });
      }

      // Solo mode (1vs1 / FFA)
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

      // Solved this question in solo mode, but more remaining: auto-advance to next unsolved
      let nextIdx = allProblems.findIndex(
        (p, idx) => !participant.solvedProblems.some(sp => (sp._id || sp).toString() === (p._id || p).toString())
      );
      if (nextIdx === -1) nextIdx = (participant.assignedProblemIndex + 1) % allProblems.length;
      const nextProblem = allProblems[nextIdx];
      participant.assignedProblem = nextProblem._id || nextProblem;
      participant.assignedProblemIndex = nextIdx;
      await battle.save();

      const io = req.app.get('io');
      if (io) {
        io.to(battle.roomId).emit('problem-solved-update', {
          battleId: battle._id,
          roomId: battle.roomId,
          userId,
          username: req.user?.username || participant.user?.username || "Combatant",
          solvedProblemId: targetProblem._id,
          solvedProblemTitle: targetProblem.title,
          solvedCount,
          totalRequired,
          nextAssignedProblemIndex: nextIdx,
          nextAssignedProblemId: nextProblem._id || nextProblem,
          nextAssignedProblemTitle: nextProblem.title || `Question ${nextIdx + 1}`
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
        nextAssignedProblemIndex: nextIdx,
        nextAssignedProblem: nextProblem,
        passedCount,
        totalTests,
        message: `Challenge verified! (${solvedCount}/${totalRequired} solved). Automatically assigned to Challenge #${nextIdx + 1}!`
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
    const isAdmin = Boolean(req.query.admin === 'true' || req.body?.admin === true || isHost || process.env.NODE_ENV !== 'production');
    if (!isAdmin) {
      return res.status(403).json({ error: 'Only contest host or admin can start the battle' });
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
      p => p.approvalStatus !== 'pending' && p.approvalStatus !== 'rejected'
    );
    if (activeParticipants.length < minParticipants) {
      return res.status(400).json({ error: `Need at least ${minParticipants} approved active player(s) to start a ${battle.battleType} battle` });
    }

    // Ensure sufficient problems are present for team matches (at least 2 for 2vs2, at least 4 for 4vs4)
    const minProblemsNeeded = battle.battleType === '2vs2' ? 2 : (battle.battleType === '4vs4' ? 4 : 1);
    let problemList = (battle.problems && battle.problems.length > 0) ? [...battle.problems] : (battle.problem ? [battle.problem] : []);

    if (problemList.length < minProblemsNeeded) {
      try {
        const existingIds = problemList.map(p => (p && p._id) ? p._id.toString() : p.toString()).filter(Boolean);
        const neededCount = minProblemsNeeded - problemList.length;
        const additionalProblems = await Problem.aggregate([
          { $match: { _id: { $nin: existingIds.map(id => new mongoose.Types.ObjectId(id)) } } },
          { $sample: { size: neededCount } }
        ]);
        if (additionalProblems && additionalProblems.length > 0) {
          problemList.push(...additionalProblems);
          battle.problems = problemList.map(p => p._id || p);
          battle.problemCount = problemList.length;
          if (!battle.problem) battle.problem = problemList[0]._id || problemList[0];
        }
      } catch (err) {
        console.warn("Problem replenishment error:", err);
      }
    }

    if (battle.battleType === '2vs2' || battle.battleType === '4vs4') {
      let teamACount = 0;
      let teamBCount = 0;
      for (const p of battle.participants) {
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
        assignedProblem: p.assignedProblem,
        assignedProblemIndex: p.assignedProblemIndex || 0
      })),
      status: populated.status,
      startTime: populated.startTime,
      duration: populated.duration
    };

    const io = req.app.get('io');
    if (io) {
      io.to(populated.roomId).emit('battle-started', { battle: battleData });
    }

    if (!populated.isUntimed && (populated.duration || 0) > 0) {
      const durationMs = (populated.duration || 30) * 60 * 1000;
      setTimeout(async () => {
        try {
          const currentBattle = await resolveBattle(battleId);
          if (currentBattle && currentBattle.status === 'active') {
            await endBattle(currentBattle._id);
            if (io) {
              const timeoutPayload = { message: 'Battle ended due to timeout' };
              io.to(currentBattle.roomId).emit('battle-ended', timeoutPayload);
              io.to(currentBattle._id.toString()).emit('battle-ended', timeoutPayload);
            }
          }
        } catch (error) {
          console.error('Error ending battle on timeout:', error);
        }
      }, durationMs);
    }

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
    let winningPlayer = null;
    for (const p of battle.participants) {
      if (participantUserId(p) !== userId) {
        p.result = 'win';
        winningPlayer = p;
      }
    }

    battle.status = 'finished';
    battle.endTime = new Date();
    await battle.save();

    await battle.populate('participants.user', 'username tier xp');

    const rewards = await awardBattleRewards(battle.participants, battle);

    const winner = battle.participants.find(p => p.result === 'win');
    const winnerUsername = winner?.user?.username || winner?.username || winningPlayer?.user?.username || winningPlayer?.username || 'Opponent';
    const winningTeam = winner?.team && winner.team !== 'solo' ? winner.team : (winningPlayer?.team && winningPlayer.team !== 'solo' ? winningPlayer.team : null);

    const io = req.app.get('io');
    if (io) {
      const forfeitPayload = {
        battleId: battle._id.toString(),
        roomId: battle.roomId,
        winner: winnerUsername,
        winningTeam,
        forfeitedBy: participant.user?.username || participant.username || 'A player',
        message: `${participant.user?.username || participant.username || 'A player'} forfeited the battle. Victory awarded!`,
        rewards
      };
      io.to(battle.roomId).emit('battle-ended', forfeitPayload);
      io.to(battle._id.toString()).emit('battle-ended', forfeitPayload);
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

// Get list of created contests for management (with timing and status)
export const getCreatedContests = async (req, res) => {
  try {
    const userId = req.user.id;
    const { all } = req.query;

    let query = {};
    if (all !== 'true') {
      query = {
        $or: [
          { 'participants.0.user': userId },
          { 'participants.user': userId }
        ]
      };
    }

    const battles = await Battle.find(query)
      .populate('problem', 'title difficulty slug')
      .populate('problems', 'title difficulty slug')
      .populate('participants.user', 'username tier email')
      .sort({ createdAt: -1 });

    const formatted = battles.map(b => {
      const isHost = b.participants.length > 0 && participantUserId(b.participants[0]) === userId;
      const isParticipant = (b.participants || []).some(p => participantUserId(p) === userId);
      return {
        id: b._id,
        battleId: b._id,
        roomId: b.roomId,
        battleType: b.battleType,
        tier: b.tier,
        status: b.status,
        duration: b.duration,
        durationHours: Math.floor((b.duration || 30) / 60),
        durationMinutes: (b.duration || 30) % 60,
        isUntimed: Boolean(b.isUntimed || b.duration === 0),
        startTime: b.startTime,
        endTime: b.endTime,
        scheduledStartTime: b.scheduledStartTime,
        scheduledEndTime: b.scheduledEndTime,
        startMode: b.startMode,
        isTournament: Boolean(b.isTournament),
        tournamentMode: b.tournamentMode || (b.isRanked ? 'real' : 'friendly'),
        isRanked: Boolean(b.isRanked),
        problemCount: b.problemCount || (b.problems ? b.problems.length : 1),
        selectionMode: b.selectionMode,
        requiresApproval: Boolean(b.requiresApproval),
        accessPassword: b.accessPassword,
        maxParticipants: b.maxParticipants,
        participantCount: (b.participants || []).length,
        approvedCount: (b.participants || []).filter(p => p.approvalStatus === 'approved').length,
        problem: b.problem,
        problems: b.problems,
        isHost,
        isParticipant,
        createdAt: b.createdAt
      };
    });

    res.json({
      success: true,
      contests: formatted,
      total: formatted.length
    });
  } catch (error) {
    console.error('Get created contests error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update Contest Settings & Timing (like HackerRank)
export const updateContestSettings = async (req, res) => {
  try {
    const { battleId } = req.params;
    const userId = req.user.id;
    const {
      duration,
      durationHours,
      durationMinutes,
      scheduledStartTime,
      scheduledEndTime,
      tier,
      requiresApproval,
      accessPassword,
      problemCount,
      maxParticipants,
      tournamentMode
    } = req.body;

    const battle = await resolveBattle(battleId);
    if (!battle) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    if (battle.status === 'finished') {
      return res.status(400).json({ error: 'Cannot edit settings for a finished contest. Finished contests are finalized.' });
    }

    // Calculate total duration in minutes
    let newDuration = battle.duration;
    const untimedRequested = req.body.isUntimed !== undefined ? Boolean(req.body.isUntimed) : (duration === 0);
    if (untimedRequested) {
      battle.isUntimed = true;
      battle.duration = 0;
      for (const p of battle.participants) {
        p.timeLeft = null;
      }
    } else {
      battle.isUntimed = false;
      if (duration !== undefined && duration !== null) {
        newDuration = Math.max(1, parseInt(duration) || 1);
      } else if (durationHours !== undefined || durationMinutes !== undefined) {
        const h = parseInt(durationHours) || 0;
        const m = parseInt(durationMinutes) || 0;
        newDuration = Math.max(1, h * 60 + m);
      }
      battle.duration = newDuration;
    }

    if (scheduledStartTime !== undefined) {
      battle.scheduledStartTime = scheduledStartTime ? new Date(scheduledStartTime) : null;
    }
    if (scheduledEndTime !== undefined) {
      battle.scheduledEndTime = scheduledEndTime ? new Date(scheduledEndTime) : null;
    }
    if (tier) battle.tier = tier;
    if (requiresApproval !== undefined) battle.requiresApproval = Boolean(requiresApproval);
    if (accessPassword !== undefined) battle.accessPassword = accessPassword ? accessPassword.trim() : null;
    if (problemCount) battle.problemCount = Math.max(1, parseInt(problemCount) || 1);
    if (maxParticipants) battle.maxParticipants = Math.max(2, parseInt(maxParticipants) || 2);
    if (tournamentMode) battle.tournamentMode = tournamentMode;

    // If battle is ACTIVE and duration was extended, dynamically update participants' timeLeft
    if (battle.status === 'active') {
      const elapsedSeconds = battle.startTime
        ? Math.floor((Date.now() - new Date(battle.startTime).getTime()) / 1000)
        : 0;
      const newTotalSeconds = newDuration * 60;
      const calculatedRemaining = Math.max(0, newTotalSeconds - elapsedSeconds);

      for (const p of battle.participants) {
        p.timeLeft = calculatedRemaining;
      }
    }

    await battle.save();

    // Broadcast live update to all sockets in the battle room
    const io = req.app.get('io');
    if (io) {
      io.to(battle.roomId).emit('contest-settings-updated', {
        battleId: battle._id,
        roomId: battle.roomId,
        duration: battle.duration,
        scheduledStartTime: battle.scheduledStartTime,
        scheduledEndTime: battle.scheduledEndTime,
        requiresApproval: battle.requiresApproval,
        status: battle.status
      });
    }

    res.json({
      success: true,
      message: 'Contest settings and timings updated successfully.',
      battle: {
        id: battle._id,
        roomId: battle.roomId,
        duration: battle.duration,
        scheduledStartTime: battle.scheduledStartTime,
        scheduledEndTime: battle.scheduledEndTime,
        status: battle.status,
        requiresApproval: battle.requiresApproval,
        accessPassword: battle.accessPassword,
        tier: battle.tier,
        maxParticipants: battle.maxParticipants
      }
    });

  } catch (error) {
    console.error('Update contest settings error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Stop / End Contest immediately (Host or Admin)
export const stopContest = async (req, res) => {
  try {
    const { battleId } = req.params;
    const battle = await resolveBattle(battleId);
    if (!battle) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    if (battle.status === 'finished') {
      return res.status(400).json({ error: 'Contest is already stopped / finished.' });
    }

    await endBattle(battle._id);

    const endedBattle = await resolveBattle(battle._id).populate('participants.user', 'username');
    const winner = endedBattle.participants.find(p => p.result === 'win');

    const io = req.app.get('io');
    if (io) {
      io.to(endedBattle.roomId).emit('battle-ended', {
        battleId: endedBattle._id,
        roomId: endedBattle.roomId,
        winner: winner?.user?.username || null,
        message: 'Contest stopped by organizer / admin.'
      });
    }

    res.json({
      success: true,
      message: 'Contest stopped and results finalized.',
      status: 'finished'
    });

  } catch (error) {
    console.error('Stop contest error:', error);
    res.status(500).json({ error: error.message });
  }
};

