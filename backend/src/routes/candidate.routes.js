import express from "express";
import multer from "multer";
import path from "path";
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

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/uploads");
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Public routes
router.get("/", getCandidates);
router.get("/by-position", getCandidatesByPosition);

// Admin routes
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  upload.single("profilePicture"),
  addCandidate
);
router.patch(
  "/:id",
  authMiddleware,
  adminMiddleware,
  upload.single("profilePicture"),
  updateCandidate
);
router.delete("/:id", authMiddleware, adminMiddleware, deleteCandidate);

export default router;
