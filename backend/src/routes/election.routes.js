import express from "express";
import {
  getActiveElection,
  listElections,
} from "../controllers/election.controller.js";

const router = express.Router();

router.get("/active", getActiveElection);
router.get("/", listElections);

export default router;
