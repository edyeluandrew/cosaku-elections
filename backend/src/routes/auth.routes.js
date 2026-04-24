import express from "express";
import {
  register,
  login,
  verifyEmail,
  resendVerification,
  getMe,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.get("/me", authMiddleware, getMe);

export default router;
