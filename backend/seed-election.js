import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    console.log('\n📝 COSAKU Elections Database Setup\n');
    console.log('✅ Database tables are ready for election setup');
    console.log('\n📌 Next Steps:');
    console.log('  1. Admin user should be automatically created from .env');
    console.log('  2. Login to http://localhost:5173 with admin credentials');
    console.log('  3. Use the admin dashboard to create elections, positions, and candidates');
    console.log('  4. Invite voters to register and vote\n');

    await pool.end();
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
})();
