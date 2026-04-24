import express from "express";
import {
  getLiveResults,
  getResultsByPosition,
  getPublishedResults,
} from "../controllers/results.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/live", optionalAuth, getLiveResults);
router.get("/position/:positionId/:electionId", optionalAuth, getResultsByPosition);
router.get("/published", optionalAuth, getPublishedResults);

export default router;
