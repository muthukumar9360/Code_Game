import express from "express";
import { createProblem } from "../controllers/problemController.js";

const router = express.Router();

router.post("/createProblem", createProblem);

export default router;