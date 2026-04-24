import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const positions = [
  { name: 'President', description: 'Lead the association and represent members' },
  { name: 'Vice President', description: 'Support president and handle operations' },
  { name: 'Secretary General', description: 'Manage communications and records' },
  { name: 'Treasurer', description: 'Handle finances and budgeting' },
  { name: 'Public Relations Officer', description: 'Manage external communications' },
  { name: 'Welfare Officer', description: 'Care for member well-being' },
  { name: 'Academic Officer', description: 'Oversee academic activities' },
  { name: 'Sports Officer', description: 'Manage sports and recreation' },
  { name: 'ICT Officer', description: 'Handle technology and IT' }
];

const candidates = [
  { position: 'President', names: ['John Kato', 'Sarah Muwanga', 'David Okello'] },
  { position: 'Vice President', names: ['Alice Kisaka', 'Peter Kabiru', 'Grace Nakisozi'] },
  { position: 'Secretary General', names: ['Robert Kasozi', 'Michelle Bwire', 'James Ouma'] },
  { position: 'Treasurer', names: ['Steven Kyamukama', 'Beatrice Namakula', 'Patrick Mugisha'] },
  { position: 'Public Relations Officer', names: ['Rebecca Nyakarundo', 'Mark Kiplagat', 'Faith Mwebaze'] },
  { position: 'Welfare Officer', names: ['Sonia Kawowa', 'Gerald Matovu', 'Pamela Nakabugo'] },
  { position: 'Academic Officer', names: ['Ivan Byekwaso', 'Constance Kabagambe', 'Julius Mugyenyi'] },
  { position: 'Sports Officer', names: ['Marcus Muwonge', 'Diana Katongole', 'Ronald Akampurira'] },
  { position: 'ICT Officer', names: ['Timothy Mukama', 'Sylvia Namusoke', 'Kevin Kyambadde'] }
];

(async () => {
  try {
    console.log('\n📝 Creating test election data...\n');

    // Create election
    const electionRes = await pool.query(
      'INSERT INTO elections (title, status, results_published) VALUES ($1, $2, $3) RETURNING id',
      ['COSAKU Elections 2026', 'active', false]
    );
    const electionId = electionRes.rows[0].id;
    console.log(`✅ Election created (ID: ${electionId})`);

    // Create positions
    const positionIds = {};
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      const res = await pool.query(
        'INSERT INTO positions (election_id, name, description) VALUES ($1, $2, $3) RETURNING id',
        [electionId, pos.name, pos.description]
      );
      positionIds[pos.name] = res.rows[0].id;
      console.log(`  ✓ ${pos.name}`);
    }
    console.log(`✅ ${positions.length} positions created\n`);

    // Create candidates
    let totalCandidates = 0;
    for (const candidateGroup of candidates) {
      const positionId = positionIds[candidateGroup.position];
      for (let i = 0; i < candidateGroup.names.length; i++) {
        await pool.query(
          'INSERT INTO candidates (election_id, position_id, full_name, program, year_of_study, slogan) VALUES ($1, $2, $3, $4, $5, $6)',
          [
            electionId,
            positionId,
            candidateGroup.names[i],
            'Computer Science',
            2024,
            `Vote for positive change`
          ]
        );
        totalCandidates++;
      }
    }
    console.log(`✅ ${totalCandidates} candidates created\n`);

    // Show summary
    console.log('📊 ELECTION SETUP COMPLETE:\n');
    console.log(`   Election: COSAKU Elections 2026`);
    console.log(`   Status: ACTIVE (Ready for voting)`);
    console.log(`   Positions: ${positions.length}`);
    console.log(`   Candidates: ${totalCandidates}\n`);
    console.log('🌐 Access the app at: http://localhost:5173\n');

    await pool.end();
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
})();
