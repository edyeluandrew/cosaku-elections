import { query } from "../config/db.js";
import { emitResultsUpdate } from "../sockets/socket.js";

/**
 * Computes live results for an election and broadcasts them
 * to all clients in the `election:${electionId}` Socket.IO room.
 * Safe to call from any controller after a vote is created/edited.
 */
export const broadcastResults = async (electionId) => {
  try {
    if (!electionId || !global.io) return;

    const rows = await query(
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

    const totalsRes = await query(
      `SELECT position_id, COUNT(*) as total_votes
       FROM votes
       WHERE election_id = $1
       GROUP BY position_id`,
      [electionId]
    );

    const totals = {};
    totalsRes.rows.forEach((r) => {
      totals[r.position_id] = parseInt(r.total_votes);
    });

    const map = {};
    rows.rows.forEach((row) => {
      const pid = row.position_id;
      if (!map[pid]) {
        map[pid] = {
          id: pid,
          name: row.position_name,
          displayOrder: row.display_order,
          candidates: [],
          totalVotes: totals[pid] || 0,
        };
      }
      if (row.candidate_id) {
        const t = totals[pid] || 0;
        const count = parseInt(row.vote_count);
        map[pid].candidates.push({
          id: row.candidate_id,
          name: row.candidate_name,
          program: row.candidate_program,
          voteCount: count,
          percentage: t > 0 ? parseFloat(((count / t) * 100).toFixed(2)) : 0,
        });
      }
    });

    const results = Object.values(map).sort(
      (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
    );

    emitResultsUpdate(global.io, electionId, results);
  } catch (err) {
    console.error("broadcastResults error:", err);
  }
};

export default broadcastResults;
