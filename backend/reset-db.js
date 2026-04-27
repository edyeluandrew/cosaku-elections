import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    console.log('\n🗑️  Database Reset - Cleaning all test data...\n');

    // 1. Delete all votes (depends on positions and candidates)
    console.log('  Deleting votes...');
    await pool.query('DELETE FROM votes');
    const votesResult = await pool.query('SELECT COUNT(*) as count FROM votes');
    console.log(`  ✓ Votes removed (${votesResult.rows[0].count} remaining)`);

    // 2. Delete all vote edit logs
    console.log('  Deleting vote edit logs...');
    await pool.query('DELETE FROM vote_edit_logs');
    const editLogsResult = await pool.query('SELECT COUNT(*) as count FROM vote_edit_logs');
    console.log(`  ✓ Vote edit logs removed (${editLogsResult.rows[0].count} remaining)`);

    // 3. Delete all audit logs
    console.log('  Deleting audit logs...');
    await pool.query('DELETE FROM audit_logs');
    const auditResult = await pool.query('SELECT COUNT(*) as count FROM audit_logs');
    console.log(`  ✓ Audit logs removed (${auditResult.rows[0].count} remaining)`);

    // 4. Delete all elections (cascades to positions, candidates)
    console.log('  Deleting elections...');
    await pool.query('DELETE FROM elections');
    const electionsResult = await pool.query('SELECT COUNT(*) as count FROM elections');
    console.log(`  ✓ Elections removed (${electionsResult.rows[0].count} remaining)`);

    // 5. Delete all non-admin users (voters)
    console.log('  Deleting voter accounts...');
    await pool.query(`DELETE FROM users WHERE role = 'voter'`);
    const usersResult = await pool.query(`SELECT COUNT(*) as count FROM users WHERE role = 'voter'`);
    console.log(`  ✓ Voter accounts removed (${usersResult.rows[0].count} remaining)`);

    // 6. Show admin accounts that remain
    console.log('\n  Admin accounts (preserved):');
    const admins = await pool.query(`SELECT email, full_name FROM users WHERE role = 'admin'`);
    admins.rows.forEach(admin => {
      console.log(`    - ${admin.email} (${admin.full_name})`);
    });

    console.log('\n✅ Database reset complete!\n');
    console.log('📊 Current database state:');
    
    const stats = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'admin') as admins,
        (SELECT COUNT(*) FROM users WHERE role = 'voter') as voters,
        (SELECT COUNT(*) FROM elections) as elections,
        (SELECT COUNT(*) FROM positions) as positions,
        (SELECT COUNT(*) FROM candidates) as candidates,
        (SELECT COUNT(*) FROM votes) as votes
    `);
    
    const stat = stats.rows[0];
    console.log(`  Users: ${stat.total_users} (${stat.admins} admin, ${stat.voters} voters)`);
    console.log(`  Elections: ${stat.elections}`);
    console.log(`  Positions: ${stat.positions}`);
    console.log(`  Candidates: ${stat.candidates}`);
    console.log(`  Votes: ${stat.votes}`);
    
    console.log('\n🌐 Ready for real voters! Start at http://localhost:5173\n');

    await pool.end();
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
})();
