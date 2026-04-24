import { query } from "../config/db.js";
import { broadcastResults } from "../utils/broadcastResults.js";

export const submitVote = async (req, res) => {
  try {
    const { electionId, positionId, candidateId } = req.body;
    const voterId = req.user.id;

    if (!electionId || !positionId || !candidateId) {
      return res
        .status(400)
        .json({
          error: "Election ID, Position ID, and Candidate ID are required",
        });
    }

    const electionCheck = await query(
      `SELECT id, status FROM elections WHERE id = $1 AND status = 'active'`,
      [electionId]
    );

    if (electionCheck.rows.length === 0) {
      return res
        .status(400)
        .json({ error: "Election is not active for voting" });
    }

    const userCheck = await query(
      `SELECT is_email_verified FROM users WHERE id = $1`,
      [voterId]
    );

    if (!userCheck.rows[0]?.is_email_verified) {
      return res
        .status(403)
        .json({ error: "Please verify your email before voting" });
    }

    const candidateCheck = await query(
      `SELECT id FROM candidates 
       WHERE id = $1 AND position_id = $2 AND election_id = $3`,
      [candidateId, positionId, electionId]
    );

    if (candidateCheck.rows.length === 0) {
      return res
        .status(400)
        .json({ error: "Invalid candidate for this position" });
    }

    const existingVote = await query(
      `SELECT id FROM votes 
       WHERE voter_id = $1 AND position_id = $2 AND election_id = $3`,
      [voterId, positionId, electionId]
    );

    if (existingVote.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "You have already voted for this position" });
    }

    const result = await query(
      `INSERT INTO votes (election_id, position_id, candidate_id, voter_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, election_id, position_id, candidate_id, voter_id, created_at`,
      [electionId, positionId, candidateId, voterId]
    );

    const vote = result.rows[0];

    await query(
      `INSERT INTO audit_logs (actor_id, action, details)
       VALUES ($1, $2, $3)`,
      [
        voterId,
        "vote_submitted",
        JSON.stringify({
          voteId: vote.id,
          positionId: positionId,
          candidateId: candidateId,
        }),
      ]
    );

    // Broadcast updated results to everyone watching this election
    broadcastResults(electionId).catch((e) =>
      console.error("Broadcast after submitVote failed:", e)
    );

    res.status(201).json({
      message: "Vote submitted successfully",
      vote,
    });
  } catch (error) {
    console.error("Submit vote error:", error);
    res.status(500).json({ error: "Failed to submit vote" });
  }
};

export const getMyVotes = async (req, res) => {
  try {
    const voterId = req.user.id;
    const { electionId } = req.query;

    let query_string = `
      SELECT 
        v.id, v.election_id, v.position_id, v.candidate_id,
        p.name as position_name,
        c.full_name as candidate_name, c.program as candidate_program
      FROM votes v
      JOIN positions p ON v.position_id = p.id
      JOIN candidates c ON v.candidate_id = c.id
      WHERE v.voter_id = $1
    `;

    const params = [voterId];

    if (electionId) {
      query_string += ` AND v.election_id = $2`;
      params.push(electionId);
    }

    query_string += ` ORDER BY p.display_order ASC`;

    const result = await query(query_string, params);

    res.json({
      votes: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error("Get my votes error:", error);
    res.status(500).json({ error: "Failed to fetch your votes" });
  }
};

export const getVotesByPosition = async (req, res) => {
  try {
    const { electionId, positionId } = req.query;

    if (!electionId || !positionId) {
      return res
        .status(400)
        .json({ error: "Election ID and Position ID are required" });
    }

    const result = await query(
      `SELECT COUNT(*) as vote_count, candidate_id
       FROM votes
       WHERE election_id = $1 AND position_id = $2
       GROUP BY candidate_id`,
      [electionId, positionId]
    );

    res.json({
      positionResults: result.rows,
    });
  } catch (error) {
    console.error("Get votes by position error:", error);
    res.status(500).json({ error: "Failed to fetch position results" });
  }
};
