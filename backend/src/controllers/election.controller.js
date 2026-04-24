import { query } from "../config/db.js";

// Public: get the current active (or most recent) election
export const getActiveElection = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, title, status, start_time, end_time, results_published
       FROM elections
       ORDER BY 
         CASE status
           WHEN 'active' THEN 1
           WHEN 'paused' THEN 2
           WHEN 'closed' THEN 3
           WHEN 'published' THEN 4
           ELSE 5
         END,
         created_at DESC
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No election found" });
    }

    res.json({ election: result.rows[0] });
  } catch (error) {
    console.error("Get active election error:", error);
    res.status(500).json({ error: "Failed to fetch election" });
  }
};

// Public: list all elections
export const listElections = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, title, status, start_time, end_time, results_published, created_at
       FROM elections
       ORDER BY created_at DESC`
    );
    res.json({ elections: result.rows, total: result.rows.length });
  } catch (error) {
    console.error("List elections error:", error);
    res.status(500).json({ error: "Failed to list elections" });
  }
};
