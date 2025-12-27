import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  createBattle,
  joinBattle,
  getBattleStatus,
  endBattleManually,
  createRoom,
  joinRoom,
  getRoomStatus,
  startBattle,
  submitSolution
} from '../controllers/battleController.js';

const router = express.Router();

// Create a new battle room (host)
router.post('/create-room', authMiddleware, createRoom);

// Join an existing battle room
router.post('/join-room/:roomId', authMiddleware, joinRoom);

// Get room status (for lobby)
router.get('/room/:roomId', authMiddleware, getRoomStatus);

// Start the battle (host only)
router.post('/start/:battleId', authMiddleware, startBattle);

// Submit solution during battle
router.post('/:battleId/submit', authMiddleware, submitSolution);

// Existing battle routes
router.post('/create', authMiddleware, createBattle);
router.get('/:battleId/status', authMiddleware, getBattleStatus);
router.post('/:battleId/end', authMiddleware, endBattleManually);

export default router;
