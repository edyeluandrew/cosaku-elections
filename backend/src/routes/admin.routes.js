import express from "express";
import {
  getDashboard,
  startElection,
  pauseElection,
  closeElection,
  publishResults,
  getVoters,
  getVotes,
  editVote,
  getVoteEditLogs,
} from "../controllers/admin.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";

const router = express.Router();

// All admin routes require auth and admin middleware
router.use(authMiddleware, adminMiddleware);

// Dashboard
router.get("/dashboard", getDashboard);

// Election management
router.patch("/elections/:id/start", startElection);
router.patch("/elections/:id/pause", pauseElection);
router.patch("/elections/:id/close", closeElection);
router.patch("/elections/:id/publish", publishResults);

// Voter management
router.get("/voters", getVoters);

// Vote management
router.get("/votes", getVotes);
router.patch("/votes/:voteId", editVote);
router.get("/vote-edit-logs", getVoteEditLogs);

export default router;
