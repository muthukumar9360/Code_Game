import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  createBattle,
  joinBattle,
  getBattleStatus,
  endBattleManually,
  createRoom,
  joinRoom,
  leaveRoom,
  getRoomStatus,
  approveParticipant,
  reassignParticipantTeam,
  startBattle,
  submitSolution,
  abandonBattle,
  getBattleSummary,
  getMyContestHistory,
  getHackathonReport,
  getCreatedContests,
  updateContestSettings,
  stopContest,
  saveBattleDraft
} from '../controllers/battleController.js';

const router = express.Router();

// Battle Room Lifecycle
router.post('/create-room', authMiddleware, createRoom);
router.post('/join-room/:roomId', authMiddleware, joinRoom);
router.post('/leave-room/:roomId', authMiddleware, leaveRoom);
router.get('/room/:roomId', authMiddleware, getRoomStatus);
router.post('/room/:roomId/approve', authMiddleware, approveParticipant);
router.post('/room/:roomId/reassign-team', authMiddleware, reassignParticipantTeam);

// Contest Execution
router.post('/start/:battleId', authMiddleware, startBattle);
router.post('/:battleId/submit', authMiddleware, submitSolution);
router.post('/:battleId/save-draft', authMiddleware, saveBattleDraft);
router.post('/:battleId/abandon', authMiddleware, abandonBattle);
router.get('/:battleId/summary', authMiddleware, getBattleSummary);
router.get('/:battleId/hackathon-report', authMiddleware, getHackathonReport);

// Contest Management & HackerRank-style Controls
router.get('/created-contests', authMiddleware, getCreatedContests);
router.put('/:battleId/settings', authMiddleware, updateContestSettings);
router.post('/:battleId/settings', authMiddleware, updateContestSettings);
router.post('/:battleId/stop', authMiddleware, stopContest);

// Legacy / Direct endpoints
router.post('/create', authMiddleware, createBattle);
router.get('/:battleId/status', authMiddleware, getBattleStatus);
router.post('/:battleId/end', authMiddleware, endBattleManually);

// User contest history
router.get('/my-history', authMiddleware, getMyContestHistory);

export default router;
