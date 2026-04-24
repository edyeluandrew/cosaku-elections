import bcryptjs from "bcryptjs";
import { query } from "../config/db.js";
import { config } from "../config/env.js";

export const seedAdmin = async () => {
  try {
    const { defaultAdminEmail, defaultAdminName, defaultAdminPassword } =
      config;

    if (!defaultAdminEmail || !defaultAdminPassword) {
      console.warn("Admin credentials not configured in .env");
      return;
    }

    // Check if admin already exists
    const existingAdmin = await query(
      "SELECT id FROM users WHERE email = $1",
      [defaultAdminEmail.toLowerCase()]
    );

    if (existingAdmin.rows.length > 0) {
      console.log(`Admin account already exists: ${defaultAdminEmail}`);
      return;
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcryptjs.hash(defaultAdminPassword, saltRounds);

    // Create admin user
    const result = await query(
      `INSERT INTO users (full_name, email, password_hash, role, is_email_verified)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, role`,
      [
        defaultAdminName || "Administrator",
        defaultAdminEmail.toLowerCase(),
        passwordHash,
        "admin",
        true,
      ]
    );

    const admin = result.rows[0];
    console.log(`✓ Admin account created successfully`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  Name: ${admin.full_name}`);
    console.log(`  ID: ${admin.id}`);
  } catch (error) {
    console.error("Error seeding admin:", error);
    throw error;
  }
};

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAdmin()
    .then(() => {
      console.log("Admin seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Admin seeding failed:", error);
      process.exit(1);
    });
}

export default seedAdmin;
