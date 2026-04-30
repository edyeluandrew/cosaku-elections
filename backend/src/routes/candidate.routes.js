import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✓ Created uploads directory:", uploadsDir);
} else {
  console.log("✓ Uploads directory exists:", uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("📁 Saving file to:", uploadsDir);
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.originalname}`;
    console.log("📸 Filename generated:", filename);
    cb(null, filename);
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
