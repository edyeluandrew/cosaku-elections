import { query } from "../config/db.js";
import { logAudit } from "../utils/auditLog.js";

export const addCandidate = async (req, res) => {
  try {
    console.log("addCandidate request body:", req.body);
    
    const {
      electionId,
      positionId,
      fullName,
      program,
      slogan,
      manifesto,
      yearOfStudy,
    } = req.body;

    // Validate required fields
    if (!electionId || !positionId || !fullName) {
      console.warn("Missing required fields:", { electionId, positionId, fullName });
      return res
        .status(400)
        .json({ error: "Election ID, Position ID, and Full Name are required" });
    }

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      console.error("User not authenticated in addCandidate");
      return res.status(401).json({ error: "User not authenticated" });
    }

    console.log("Adding candidate for election:", electionId, "position:", positionId);

    // Verify position belongs to election - accept both UUID and position name
    const positionCheck = await query(
      "SELECT id FROM positions WHERE (id::text = $1 OR name = $1) AND election_id = $2",
      [positionId, electionId]
    );

    console.log("Position check result:", positionCheck.rows);

    if (positionCheck.rows.length === 0) {
      console.warn("Position not found for this election:", { positionId, electionId });
      return res
        .status(400)
        .json({ error: "Invalid position for this election" });
    }

    // Get the actual position ID (in case it was looked up by name)
    const actualPositionId = positionCheck.rows[0].id;

    // Insert candidate
    const result = await query(
      `INSERT INTO candidates 
       (election_id, position_id, full_name, program, slogan, manifesto, year_of_study)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, election_id, position_id, full_name, program, slogan, manifesto, year_of_study, created_at`,
      [
        electionId,
        actualPositionId,
        fullName,
        program,
        slogan || null,
        manifesto || null,
        yearOfStudy || null,
      ]
    );

    const candidate = result.rows[0];

    // Log audit (non-blocking - don't fail if user doesn't exist)
    await logAudit(
      req.user?.id,
      "candidate_added",
      {
        candidateId: candidate.id,
        candidateName: fullName,
      }
    );

    res.status(201).json({
      message: "Candidate added successfully",
      candidate,
    });
  } catch (error) {
    console.error("Add candidate error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      error: "Failed to add candidate", 
      details: error.message,
      code: error.code 
    });
  }
};

export const getCandidates = async (req, res) => {
  try {
    const { electionId, positionId } = req.query;

    let whereClause = "WHERE 1=1";
    const params = [];

    if (electionId) {
      params.push(electionId);
      whereClause += ` AND candidates.election_id = $${params.length}`;
    }

    if (positionId) {
      params.push(positionId);
      whereClause += ` AND candidates.position_id = $${params.length}`;
    }

    const result = await query(
      `SELECT 
        c.id, c.election_id, c.position_id, c.full_name, c.program, 
        c.slogan, c.manifesto, c.year_of_study, 
        c.created_at, p.name as position_name
       FROM candidates c
       LEFT JOIN positions p ON c.position_id = p.id
       ${whereClause}
       ORDER BY c.created_at DESC`,
      params
    );

    res.json({
      candidates: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error("Get candidates error:", error);
    res.status(500).json({ error: "Failed to fetch candidates" });
  }
};

export const getCandidatesByPosition = async (req, res) => {
  try {
    const { electionId } = req.query;

    if (!electionId) {
      return res.status(400).json({ error: "Election ID required" });
    }

    const result = await query(
      `SELECT 
        c.id, c.election_id, c.position_id, c.full_name, c.program,
        c.slogan, c.manifesto, c.year_of_study,
        p.id as position_id, p.name as position_name, p.display_order
       FROM candidates c
       JOIN positions p ON c.position_id = p.id
       WHERE c.election_id = $1
       ORDER BY p.display_order ASC, c.full_name ASC`,
      [electionId]
    );

    // Group candidates by position
    const candidatesByPosition = {};

    result.rows.forEach((candidate) => {
      const positionId = candidate.position_id;

      if (!candidatesByPosition[positionId]) {
        candidatesByPosition[positionId] = {
          id: positionId,
          name: candidate.position_name,
          displayOrder: candidate.display_order,
          candidates: [],
        };
      }

      candidatesByPosition[positionId].candidates.push({
        id: candidate.id,
        fullName: candidate.full_name,
        program: candidate.program,
        slogan: candidate.slogan,
        manifesto: candidate.manifesto,
        yearOfStudy: candidate.year_of_study,
      });
    });

    // Sort positions by display order
    const positionsArray = Object.values(candidatesByPosition).sort(
      (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
    );

    res.json({
      positions: positionsArray,
      total: result.rows.length,
    });
  } catch (error) {
    console.error("Get candidates by position error:", error);
    res.status(500).json({ error: "Failed to fetch candidates" });
  }
};

export const updateCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      program,
      slogan,
      manifesto,
      yearOfStudy,
      positionId,
    } = req.body;

    // Get current candidate
    const currentResult = await query(
      "SELECT * FROM candidates WHERE id = $1",
      [id]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    // Update candidate
    const result = await query(
      `UPDATE candidates 
       SET full_name = COALESCE($1, full_name),
           program = COALESCE($2, program),
           slogan = COALESCE($3, slogan),
           manifesto = COALESCE($4, manifesto),
           year_of_study = COALESCE($5, year_of_study),
           position_id = COALESCE($6, position_id),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING id, election_id, position_id, full_name, program, slogan, manifesto, year_of_study, updated_at`,
      [
        fullName,
        program,
        slogan,
        manifesto,
        yearOfStudy,
        positionId,
        id,
      ]
    );

    const updatedCandidate = result.rows[0];

    // Log audit (non-blocking - don't fail if user doesn't exist)
    await logAudit(
      req.user?.id,
      "candidate_updated",
      {
        candidateId: id,
        changes: {
          fullName,
          program,
          slogan,
          manifesto,
          yearOfStudy,
        },
      }
    );

    res.json({
      message: "Candidate updated successfully",
      candidate: updatedCandidate,
    });
  } catch (error) {
    console.error("Update candidate error:", error);
    res.status(500).json({ error: "Failed to update candidate" });
  }
};

export const deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if candidate exists
    const checkResult = await query(
      "SELECT full_name FROM candidates WHERE id = $1",
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    const candidateName = checkResult.rows[0].full_name;

    // Delete candidate
    await query("DELETE FROM candidates WHERE id = $1", [id]);

    // Log audit (non-blocking - don't fail if user doesn't exist)
    await logAudit(
      req.user?.id,
      "candidate_deleted",
      {
        candidateId: id,
        candidateName: candidateName,
      }
    );

    res.json({
      message: "Candidate deleted successfully",
    });
  } catch (error) {
    console.error("Delete candidate error:", error);
    res.status(500).json({ error: "Failed to delete candidate" });
  }
};
