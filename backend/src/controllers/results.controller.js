import { query } from "../config/db.js";

export const getLiveResults = async (req, res) => {
  try {
    const { electionId } = req.query;

    if (!electionId) {
      return res.status(400).json({ error: "Election ID required" });
    }

    // Get all positions with candidates and vote counts
    const result = await query(
      `SELECT 
        p.id as position_id,
        p.name as position_name,
        p.display_order,
        c.id as candidate_id,
        c.full_name as candidate_name,
        c.program as candidate_program,
        c.profile_picture_url,
        COUNT(v.id) as vote_count
       FROM positions p
       LEFT JOIN candidates c ON p.id = c.position_id
       LEFT JOIN votes v ON c.id = v.candidate_id AND v.election_id = $1
       WHERE p.election_id = $1
       GROUP BY p.id, p.name, p.display_order, c.id, c.full_name, c.program, c.profile_picture_url
       ORDER BY p.display_order ASC, vote_count DESC`,
      [electionId]
    );

    // Get total votes per position
    const totalVotesResult = await query(
      `SELECT position_id, COUNT(*) as total_votes
       FROM votes
       WHERE election_id = $1
       GROUP BY position_id`,
      [electionId]
    );

    const totalVotesByPosition = {};
    totalVotesResult.rows.forEach((row) => {
      totalVotesByPosition[row.position_id] = parseInt(row.total_votes);
    });

    // Group and calculate percentages
    const resultsMap = {};

    result.rows.forEach((row) => {
      const positionId = row.position_id;

      if (!resultsMap[positionId]) {
        resultsMap[positionId] = {
          id: positionId,
          name: row.position_name,
          displayOrder: row.display_order,
          candidates: [],
          totalVotes: totalVotesByPosition[positionId] || 0,
        };
      }

      if (row.candidate_id) {
        const totalVotes = totalVotesByPosition[positionId] || 0;
        const percentage =
          totalVotes > 0
            ? ((parseInt(row.vote_count) / totalVotes) * 100).toFixed(2)
            : 0;

        resultsMap[positionId].candidates.push({
          id: row.candidate_id,
          name: row.candidate_name,
          program: row.candidate_program,
          profilePictureUrl: row.profile_picture_url,
          voteCount: parseInt(row.vote_count),
          percentage: parseFloat(percentage),
        });
      }
    });

    // Sort positions by display order
    const positions = Object.values(resultsMap).sort(
      (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
    );

    res.json({
      results: positions,
    });
  } catch (error) {
    console.error("Get live results error:", error);
    res.status(500).json({ error: "Failed to fetch live results" });
  }
};

export const getResultsByPosition = async (req, res) => {
  try {
    const { positionId, electionId } = req.params;

    if (!positionId || !electionId) {
      return res
        .status(400)
        .json({ error: "Position ID and Election ID required" });
    }

    // Verify position belongs to election
    const positionCheck = await query(
      `SELECT id FROM positions WHERE id = $1 AND election_id = $2`,
      [positionId, electionId]
    );

    if (positionCheck.rows.length === 0) {
      return res
        .status(400)
        .json({ error: "Invalid position for this election" });
    }

    // Get results for position
    const result = await query(
      `SELECT 
        c.id as candidate_id,
        c.full_name as candidate_name,
        c.program as candidate_program,
        c.profile_picture_url,
        COUNT(v.id) as vote_count
       FROM candidates c
       LEFT JOIN votes v ON c.id = v.candidate_id AND v.election_id = $1
       WHERE c.position_id = $2
       GROUP BY c.id, c.full_name, c.program, c.profile_picture_url
       ORDER BY vote_count DESC`,
      [electionId, positionId]
    );

    // Get total votes
    const totalResult = await query(
      `SELECT COUNT(*) as total_votes FROM votes 
       WHERE election_id = $1 AND position_id = $2`,
      [electionId, positionId]
    );

    const totalVotes = parseInt(totalResult.rows[0].total_votes);

    // Calculate percentages
    const candidates = result.rows.map((row) => ({
      id: row.candidate_id,
      name: row.candidate_name,
      program: row.candidate_program,
      profilePictureUrl: row.profile_picture_url,
      voteCount: parseInt(row.vote_count),
      percentage:
        totalVotes > 0
          ? ((parseInt(row.vote_count) / totalVotes) * 100).toFixed(2)
          : 0,
    }));

    res.json({
      positionId,
      candidates,
      totalVotes,
    });
  } catch (error) {
    console.error("Get position results error:", error);
    res.status(500).json({ error: "Failed to fetch position results" });
  }
};

export const getPublishedResults = async (req, res) => {
  try {
    const { electionId } = req.query;

    if (!electionId) {
      return res.status(400).json({ error: "Election ID required" });
    }

    // Verify results are published
    const electionCheck = await query(
      `SELECT results_published FROM elections WHERE id = $1`,
      [electionId]
    );

    if (electionCheck.rows.length === 0) {
      return res.status(404).json({ error: "Election not found" });
    }

    if (!electionCheck.rows[0].results_published) {
      return res
        .status(403)
        .json({ error: "Results have not been published yet" });
    }

    // Get results (same as live results for published elections)
    const result = await query(
      `SELECT 
        p.id as position_id,
        p.name as position_name,
        p.display_order,
        c.id as candidate_id,
        c.full_name as candidate_name,
        c.program as candidate_program,
        c.profile_picture_url,
        COUNT(v.id) as vote_count
       FROM positions p
       LEFT JOIN candidates c ON p.id = c.position_id
       LEFT JOIN votes v ON c.id = v.candidate_id AND v.election_id = $1
       WHERE p.election_id = $1
       GROUP BY p.id, p.name, p.display_order, c.id, c.full_name, c.program, c.profile_picture_url
       ORDER BY p.display_order ASC, vote_count DESC`,
      [electionId]
    );

    // Get total votes per position
    const totalVotesResult = await query(
      `SELECT position_id, COUNT(*) as total_votes
       FROM votes
       WHERE election_id = $1
       GROUP BY position_id`,
      [electionId]
    );

    const totalVotesByPosition = {};
    totalVotesResult.rows.forEach((row) => {
      totalVotesByPosition[row.position_id] = parseInt(row.total_votes);
    });

    // Group and calculate percentages
    const resultsMap = {};

    result.rows.forEach((row) => {
      const positionId = row.position_id;

      if (!resultsMap[positionId]) {
        resultsMap[positionId] = {
          id: positionId,
          name: row.position_name,
          displayOrder: row.display_order,
          candidates: [],
          totalVotes: totalVotesByPosition[positionId] || 0,
        };
      }

      if (row.candidate_id) {
        const totalVotes = totalVotesByPosition[positionId] || 0;
        const percentage =
          totalVotes > 0
            ? ((parseInt(row.vote_count) / totalVotes) * 100).toFixed(2)
            : 0;

        resultsMap[positionId].candidates.push({
          id: row.candidate_id,
          name: row.candidate_name,
          program: row.candidate_program,
          profilePictureUrl: row.profile_picture_url,
          voteCount: parseInt(row.vote_count),
          percentage: parseFloat(percentage),
        });
      }
    });

    // Sort positions by display order
    const positions = Object.values(resultsMap).sort(
      (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
    );

    res.json({
      results: positions,
    });
  } catch (error) {
    console.error("Get published results error:", error);
    res.status(500).json({ error: "Failed to fetch published results" });
  }
};
