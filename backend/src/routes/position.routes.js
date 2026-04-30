import express from "express";
import {
  createPosition,
  getPositions,
  updatePosition,
  deletePosition,
} from "../controllers/position.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";

const router = express.Router();

// All position routes require auth and admin middleware
router.use(authMiddleware, adminMiddleware);

// Position management
router.post("/", createPosition);
router.get("/", getPositions);
router.patch("/:id", updatePosition);
router.delete("/:id", deletePosition);

export default router;
