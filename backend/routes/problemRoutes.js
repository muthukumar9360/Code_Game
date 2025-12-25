import express from "express";
import adminAuth from "../middleware/Adminauth.js";
import { createProblem,getAllProblemsForAdmin, getAllProblemsForUser, getProblemBySlug } from "../controllers/problemController.js";

const router = express.Router();

router.post("/createProblem", adminAuth, createProblem);
router.get("/admin/allproblems", adminAuth, getAllProblemsForAdmin);

router.get("/",getAllProblemsForUser);
router.get("/:slug",getProblemBySlug);

export default router;
