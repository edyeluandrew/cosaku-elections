import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    console.log('\n🔍 DATABASE CHECK\n');

    // Get users
    const users = await pool.query('SELECT id, email, role, is_email_verified FROM users');
    console.log(`👥 USERS (${users.rows.length}):`);
    users.rows.forEach(u => console.log(`  - ${u.email} (${u.role}) - verified: ${u.is_email_verified}`));

    // Get elections
    const elections = await pool.query('SELECT * FROM elections');
    console.log(`\n📋 ELECTIONS (${elections.rows.length}):`);
    elections.rows.forEach(e => console.log(`  - ${e.title} (${e.status})`));

    // Get positions
    const positions = await pool.query('SELECT * FROM positions');
    console.log(`\n📍 POSITIONS (${positions.rows.length}):`);
    positions.rows.forEach(p => console.log(`  - ${p.name}`));

    // Get candidates
    const candidates = await pool.query('SELECT c.id, c.full_name, p.name as position FROM candidates c JOIN positions p ON c.position_id = p.id');
    console.log(`\n🎯 CANDIDATES (${candidates.rows.length}):`);
    candidates.rows.forEach(c => console.log(`  - ${c.full_name} (${c.position})`));

    // Get votes
    const votes = await pool.query('SELECT COUNT(*) FROM votes');
    console.log(`\n🗳️  VOTES: ${votes.rows[0].count}\n`);

    await pool.end();
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
})();
