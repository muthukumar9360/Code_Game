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
  startBattle,
  submitSolution,
  abandonBattle,
  getBattleSummary,
  getMyContestHistory,
  getHackathonReport
} from '../controllers/battleController.js';

const router = express.Router();

// Battle Room Lifecycle
router.post('/create-room', authMiddleware, createRoom);
router.post('/join-room/:roomId', authMiddleware, joinRoom);
router.post('/leave-room/:roomId', authMiddleware, leaveRoom);
router.get('/room/:roomId', authMiddleware, getRoomStatus);
router.post('/room/:roomId/approve', authMiddleware, approveParticipant);

// Contest Execution
router.post('/start/:battleId', authMiddleware, startBattle);
router.post('/:battleId/submit', authMiddleware, submitSolution);
router.post('/:battleId/abandon', authMiddleware, abandonBattle);
router.get('/:battleId/summary', authMiddleware, getBattleSummary);
router.get('/:battleId/hackathon-report', authMiddleware, getHackathonReport);

// Legacy / Direct endpoints
router.post('/create', authMiddleware, createBattle);
router.get('/:battleId/status', authMiddleware, getBattleStatus);
router.post('/:battleId/end', authMiddleware, endBattleManually);

// User contest history
router.get('/my-history', authMiddleware, getMyContestHistory);

export default router;
