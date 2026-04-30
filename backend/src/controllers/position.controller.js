import { query } from "../config/db.js";

export const createPosition = async (req, res) => {
  try {
    const { electionId, name, description, displayOrder } = req.body;

    // Validate required fields
    if (!electionId || !name) {
      return res
        .status(400)
        .json({ error: "Election ID and position name are required" });
    }

    // Verify election exists
    const electionCheck = await query(
      "SELECT id FROM elections WHERE id = $1",
      [electionId]
    );

    if (electionCheck.rows.length === 0) {
      return res.status(400).json({ error: "Election not found" });
    }

    // Insert position
    const result = await query(
      `INSERT INTO positions (election_id, name, description, display_order)
       VALUES ($1, $2, $3, $4)
       RETURNING id, election_id, name, description, display_order, created_at`,
      [electionId, name, description || null, displayOrder || null]
    );

    const position = result.rows[0];

    // Log audit
    await query(
      `INSERT INTO audit_logs (actor_id, action, details)
       VALUES ($1, $2, $3)`,
      [
        req.user.id,
        "position_created",
        JSON.stringify({
          positionId: position.id,
          positionName: name,
          electionId,
        }),
      ]
    );

    res.status(201).json({
      message: "Position created successfully",
      position,
    });
  } catch (error) {
    console.error("Create position error:", error);
    if (error.code === "23505") {
      // Unique constraint violation
      return res
        .status(400)
        .json({ error: "Position name already exists for this election" });
    }
    res.status(500).json({ error: "Failed to create position" });
  }
};

export const getPositions = async (req, res) => {
  try {
    const { electionId } = req.query;

    if (!electionId) {
      return res.status(400).json({ error: "Election ID required" });
    }

    const result = await query(
      `SELECT id, election_id, name, description, display_order, created_at
       FROM positions
       WHERE election_id = $1
       ORDER BY display_order ASC, name ASC`,
      [electionId]
    );

    res.json({
      positions: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error("Get positions error:", error);
    res.status(500).json({ error: "Failed to fetch positions" });
  }
};

export const updatePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, displayOrder } = req.body;

    const result = await query(
      `UPDATE positions 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description),
           display_order = COALESCE($3, display_order)
       WHERE id = $4
       RETURNING id, election_id, name, description, display_order, created_at`,
      [name || null, description || null, displayOrder || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Position not found" });
    }

    // Log audit
    await query(
      `INSERT INTO audit_logs (actor_id, action, details)
       VALUES ($1, $2, $3)`,
      [
        req.user.id,
        "position_updated",
        JSON.stringify({
          positionId: id,
          updates: { name, description, displayOrder },
        }),
      ]
    );

    res.json({
      message: "Position updated successfully",
      position: result.rows[0],
    });
  } catch (error) {
    console.error("Update position error:", error);
    res.status(500).json({ error: "Failed to update position" });
  }
};

export const deletePosition = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if position has candidates
    const candidatesCheck = await query(
      "SELECT COUNT(*) as count FROM candidates WHERE position_id = $1",
      [id]
    );

    if (parseInt(candidatesCheck.rows[0].count) > 0) {
      return res.status(400).json({
        error: "Cannot delete position with candidates. Remove candidates first.",
      });
    }

    const result = await query(
      `DELETE FROM positions WHERE id = $1 RETURNING id, name`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Position not found" });
    }

    // Log audit
    await query(
      `INSERT INTO audit_logs (actor_id, action, details)
       VALUES ($1, $2, $3)`,
      [
        req.user.id,
        "position_deleted",
        JSON.stringify({
          positionId: id,
          positionName: result.rows[0].name,
        }),
      ]
    );

    res.json({
      message: "Position deleted successfully",
      position: result.rows[0],
    });
  } catch (error) {
    console.error("Delete position error:", error);
    res.status(500).json({ error: "Failed to delete position" });
  }
};
