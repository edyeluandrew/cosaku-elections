import express from "express";
import {
  submitVote,
  getMyVotes,
  getVotesByPosition,
} from "../controllers/vote.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/submit", authMiddleware, submitVote);
router.get("/my-votes", authMiddleware, getMyVotes);
router.get("/by-position", getVotesByPosition);

export default router;
