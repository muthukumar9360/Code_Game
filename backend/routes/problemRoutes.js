import express from "express";
import adminAuth from "../middleware/Adminauth.js";
import { authMiddleware } from "../middleware/auth.js";
import {
  createProblem,
  getAllProblemsForAdmin,
  getAllProblemsForUser,
  getProblemCategories,
  getProblemBySlug,
  deleteProblem,
  runPublicTestcases,
  submitPracticeSolution,
  getProblemHint,
  getCodeExplanation,
  getDailyProblem,
  completeDailyProblem
} from "../controllers/problemController.js";

const router = express.Router();

// Public / User routes
router.get("/", getAllProblemsForUser);
router.get("/categories", getProblemCategories);
router.get("/daily", getDailyProblem);
router.post("/daily/complete", authMiddleware, completeDailyProblem);
router.get("/:slug", getProblemBySlug);
router.post("/:slug/run", runPublicTestcases);
router.post("/:slug/submit", authMiddleware, submitPracticeSolution);
router.post("/:slug/hint", authMiddleware, getProblemHint);
router.post("/:slug/explain", authMiddleware, getCodeExplanation);

// Admin routes
router.post("/createProblem", adminAuth, createProblem);
router.get("/admin/allproblems", adminAuth, getAllProblemsForAdmin);
router.delete("/admin/:id", adminAuth, deleteProblem);

export default router;
