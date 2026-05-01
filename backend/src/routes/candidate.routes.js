import express from "express";
import {
  addCandidate,
  getCandidates,
  getCandidatesByPosition,
  updateCandidate,
  deleteCandidate,
} from "../controllers/candidate.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getCandidates);
router.get("/by-position", getCandidatesByPosition);

// Admin routes
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  addCandidate
);
router.patch(
  "/:id",
  authMiddleware,
  adminMiddleware,
  updateCandidate
);
router.delete("/:id", authMiddleware, adminMiddleware, deleteCandidate);

export default router;
