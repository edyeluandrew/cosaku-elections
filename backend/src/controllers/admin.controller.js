import { query } from "../config/db.js";
import { broadcastResults } from "../utils/broadcastResults.js";

// Admin Dashboard
export const getDashboard = async (req, res) => {
  try {
    const { electionId } = req.query;

    if (!electionId) {
      return res.status(400).json({ error: "Election ID required" });
    }

    // Get election info
    const electionResult = await query(
      `SELECT id, title, status, start_time, end_time, results_published 
       FROM elections WHERE id = $1`,
      [electionId]
    );

    if (electionResult.rows.length === 0) {
      return res.status(404).json({ error: "Election not found" });
    }

    const election = electionResult.rows[0];

    // Get total voters
    const votersResult = await query(`SELECT COUNT(*) as total FROM users WHERE role = 'voter'`);
    const totalVoters = parseInt(votersResult.rows[0].total);

    // Get total votes cast
    const votesResult = await query(
      `SELECT COUNT(DISTINCT voter_id) as total FROM votes WHERE election_id = $1`,
      [electionId]
    );
    const totalVotesCast = parseInt(votesResult.rows[0].total);

    // Get positions count
    const positionsResult = await query(
      `SELECT COUNT(*) as total FROM positions WHERE election_id = $1`,
      [electionId]
    );
    const totalPositions = parseInt(positionsResult.rows[0].total);

    // Get candidates count
    const candidatesResult = await query(
      `SELECT COUNT(*) as total FROM candidates WHERE election_id = $1`,
      [electionId]
    );
    const totalCandidates = parseInt(candidatesResult.rows[0].total);

    res.json({
      election,
      stats: {
        totalVoters,
        totalVotesCast,
        participationRate: totalVoters > 0 ? ((totalVotesCast / totalVoters) * 100).toFixed(2) : 0,
        totalPositions,
        totalCandidates,
      },
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    res.status(500).json({ error: "Failed to get dashboard data" });
  }
};

// Election Management
export const startElection = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE elections SET status = 'active', start_time = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, title, status, start_time`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Election not found" });
    }

    // Log audit (non-blocking - don't fail if user doesn't exist)
    try {
      await query(
        `INSERT INTO audit_logs (actor_id, action, details) VALUES ($1, $2, $3)`,
        [req.user.id, "election_started", JSON.stringify({ electionId: id })]
      );
    } catch (auditError) {
      console.warn("Failed to log audit:", auditError.message);
    }

    res.json({
      message: "Election started",
      election: result.rows[0],
    });
  } catch (error) {
    console.error("Start election error:", error);
    res.status(500).json({ error: "Failed to start election" });
  }
};

export const pauseElection = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE elections SET status = 'paused', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, title, status`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Election not found" });
    }

    // Log audit (non-blocking - don't fail if user doesn't exist)
    try {
      await query(
        `INSERT INTO audit_logs (actor_id, action, details) VALUES ($1, $2, $3)`,
        [req.user.id, "election_paused", JSON.stringify({ electionId: id })]
      );
    } catch (auditError) {
      console.warn("Failed to log audit:", auditError.message);
    }

    res.json({
      message: "Election paused",
      election: result.rows[0],
    });
  } catch (error) {
    console.error("Pause election error:", error);
    res.status(500).json({ error: "Failed to pause election" });
  }
};

export const closeElection = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE elections SET status = 'closed', end_time = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, title, status, end_time`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Election not found" });
    }

    // Log audit (non-blocking - don't fail if user doesn't exist)
    try {
      await query(
        `INSERT INTO audit_logs (actor_id, action, details) VALUES ($1, $2, $3)`,
        [req.user.id, "election_closed", JSON.stringify({ electionId: id })]
      );
    } catch (auditError) {
      console.warn("Failed to log audit:", auditError.message);
    }

    res.json({
      message: "Election closed",
      election: result.rows[0],
    });
  } catch (error) {
    console.error("Close election error:", error);
    res.status(500).json({ error: "Failed to close election" });
  }
};

export const publishResults = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE elections SET status = 'published', results_published = true, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, title, status, results_published`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Election not found" });
    }

    // Log audit (non-blocking - don't fail if user doesn't exist)
    try {
      await query(
        `INSERT INTO audit_logs (actor_id, action, details) VALUES ($1, $2, $3)`,
        [req.user.id, "results_published", JSON.stringify({ electionId: id })]
      );
    } catch (auditError) {
      console.warn("Failed to log audit:", auditError.message);
    }

    res.json({
      message: "Results published",
      election: result.rows[0],
    });
  } catch (error) {
    console.error("Publish results error:", error);
    res.status(500).json({ error: "Failed to publish results" });
  }
};

// Create Election
export const createElection = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "Election title is required" });
    }

    const result = await query(
      `INSERT INTO elections (title, status, created_at, updated_at)
       VALUES ($1, 'draft', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, title, status, start_time, end_time, results_published`,
      [title.trim()]
    );

    // Log audit (non-blocking - don't fail if user doesn't exist)
    try {
      await query(
        `INSERT INTO audit_logs (actor_id, action, details) VALUES ($1, $2, $3)`,
        [req.user.id, "election_created", JSON.stringify({ electionId: result.rows[0].id, title })]
      );
    } catch (auditError) {
      console.warn("Failed to log audit:", auditError.message);
    }

    res.json({
      message: "Election created successfully",
      election: result.rows[0],
    });
  } catch (error) {
    console.error("Create election error:", error);
    res.status(500).json({ error: "Failed to create election" });
  }
};

// Voter Management
export const getVoters = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, full_name, email, is_email_verified, created_at 
       FROM users WHERE role = 'voter'
       ORDER BY created_at DESC`
    );

    res.json({
      voters: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error("Get voters error:", error);
    res.status(500).json({ error: "Failed to fetch voters" });
  }
};

// Vote Management
export const getVotes = async (req, res) => {
  try {
    const { electionId, positionId } = req.query;

    let query_string = `
      SELECT 
        v.id, v.election_id, v.position_id, v.candidate_id, v.voter_id,
        v.last_edited_by, v.created_at, v.updated_at,
        u.email as voter_email, u.full_name as voter_name,
        c.full_name as candidate_name,
        p.name as position_name
      FROM votes v
      JOIN users u ON v.voter_id = u.id
      JOIN candidates c ON v.candidate_id = c.id
      JOIN positions p ON v.position_id = p.id
      WHERE 1=1
    `;

    const params = [];

    if (electionId) {
      params.push(electionId);
      query_string += ` AND v.election_id = $${params.length}`;
    }

    if (positionId) {
      params.push(positionId);
      query_string += ` AND v.position_id = $${params.length}`;
    }

    query_string += ` ORDER BY v.created_at DESC`;

    const result = await query(query_string, params);

    res.json({
      votes: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error("Get votes error:", error);
    res.status(500).json({ error: "Failed to fetch votes" });
  }
};

// Edit Vote
export const editVote = async (req, res) => {
  try {
    const { voteId } = req.params;
    const { newCandidateId, reason } = req.body;

    if (!newCandidateId || !reason) {
      return res
        .status(400)
        .json({ error: "New candidate ID and reason are required" });
    }

    // Get current vote
    const voteResult = await query(
      `SELECT id, election_id, position_id, candidate_id, voter_id 
       FROM votes WHERE id = $1`,
      [voteId]
    );

    if (voteResult.rows.length === 0) {
      return res.status(404).json({ error: "Vote not found" });
    }

    const vote = voteResult.rows[0];
    const oldCandidateId = vote.candidate_id;

    // Verify new candidate belongs to same position
    const candidateCheck = await query(
      `SELECT id FROM candidates 
       WHERE id = $1 AND position_id = $2`,
      [newCandidateId, vote.position_id]
    );

    if (candidateCheck.rows.length === 0) {
      return res
        .status(400)
        .json({ error: "New candidate must be for the same position" });
    }

    // Update vote
    await query(
      `UPDATE votes 
       SET candidate_id = $1, last_edited_by = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [newCandidateId, req.user.id, voteId]
    );

    // Log edit
    await query(
      `INSERT INTO vote_edit_logs 
       (vote_id, edited_by_admin_id, election_id, position_id, old_candidate_id, new_candidate_id, reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        voteId,
        req.user.id,
        vote.election_id,
        vote.position_id,
        oldCandidateId,
        newCandidateId,
        reason,
      ]
    );

    // Log audit (non-blocking - don't fail if user doesn't exist)
    try {
      await query(
        `INSERT INTO audit_logs (actor_id, action, details) VALUES ($1, $2, $3)`,
        [
          req.user.id,
          "vote_edited",
          JSON.stringify({
            voteId: voteId,
            oldCandidateId: oldCandidateId,
            newCandidateId: newCandidateId,
            reason: reason,
          }),
        ]
      );
    } catch (auditError) {
      console.warn("Failed to log audit:", auditError.message);
    }

    // Broadcast updated results in real-time
    broadcastResults(vote.election_id).catch((e) =>
      console.error("Broadcast after editVote failed:", e)
    );

    res.json({
      message: "Vote edited successfully",
      voteId: voteId,
      oldCandidateId: oldCandidateId,
      newCandidateId: newCandidateId,
    });
  } catch (error) {
    console.error("Edit vote error:", error);
    res.status(500).json({ error: "Failed to edit vote" });
  }
};

// Get Vote Edit Logs
export const getVoteEditLogs = async (req, res) => {
  try {
    const { electionId } = req.query;

    let query_string = `
      SELECT 
        el.id, el.vote_id, el.edited_by_admin_id, el.election_id, el.position_id,
        el.old_candidate_id, el.new_candidate_id, el.reason, el.created_at,
        u.full_name as admin_name,
        oc.full_name as old_candidate_name,
        nc.full_name as new_candidate_name,
        p.name as position_name
      FROM vote_edit_logs el
      JOIN users u ON el.edited_by_admin_id = u.id
      JOIN candidates oc ON el.old_candidate_id = oc.id
      JOIN candidates nc ON el.new_candidate_id = nc.id
      JOIN positions p ON el.position_id = p.id
      WHERE 1=1
    `;

    const params = [];

    if (electionId) {
      params.push(electionId);
      query_string += ` AND el.election_id = $${params.length}`;
    }

    query_string += ` ORDER BY el.created_at DESC`;

    const result = await query(query_string, params);

    res.json({
      editLogs: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error("Get vote edit logs error:", error);
    res.status(500).json({ error: "Failed to fetch vote edit logs" });
  }
};
