import { query } from "../config/db.js";

/**
 * Safely log an audit entry
 * Handles cases where the user might not exist in the users table
 * @param {string} actorId - The user ID performing the action (can be null)
 * @param {string} action - The action being performed
 * @param {object} details - Additional details about the action
 * @returns {Promise<boolean>} - Returns true if logged successfully, false otherwise
 */
export const logAudit = async (actorId, action, details) => {
  try {
    // If actor_id is provided, verify the user exists
    if (actorId) {
      const userCheck = await query(
        "SELECT id FROM users WHERE id = $1 LIMIT 1",
        [actorId]
      );

      if (userCheck.rows.length === 0) {
        console.warn(`⚠️ Audit: User ${actorId} not found in database. Logging with NULL actor_id`);
        actorId = null; // Set to null if user doesn't exist
      }
    }

    // Insert audit log with proper error handling
    await query(
      `INSERT INTO audit_logs (actor_id, action, details, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [actorId || null, action, JSON.stringify(details)]
    );

    console.log(`✓ Audit logged: ${action}`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to log audit (${action}):`, error.message);
    return false;
  }
};
