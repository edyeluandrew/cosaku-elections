// Comprehensive smoke test for COSAKU backend
// Run: node smoke-test.js

const BASE = "http://localhost:5000/api";
const ADMIN_EMAIL = "edyeluandrew@outlook.com";
const ADMIN_PASS = "stellar.onchain";

// random-ish kab-format voter email
const rand4 = () => String(Math.floor(1000 + Math.random() * 8999));
const VOTER_EMAIL = `2024akcs${rand4()}gf@kab.ac.ug`;
const VOTER_NAME = "Test Voter";
const VOTER_PASS = "TestPass123";

let pass = 0,
  fail = 0;
const log = (ok, label, extra = "") => {
  if (ok) {
    pass++;
    console.log(`  ✅ ${label}`);
  } else {
    fail++;
    console.log(`  ❌ ${label}  ${extra}`);
  }
};

const req = async (method, path, body, token) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* ignore */
  }
  return { status: res.status, data };
};

const run = async () => {
  console.log("\n=== COSAKU Backend Smoke Test ===\n");

  // 1. Health
  console.log("[1] Health check");
  const h = await req("GET", "/health");
  log(h.status === 200, "GET /api/health", h.status);

  // 2. Election routes
  console.log("\n[2] Elections");
  const el = await req("GET", "/elections/active");
  log(el.status === 200 && el.data?.election?.id, "GET /elections/active", JSON.stringify(el.data));
  const electionId = el.data?.election?.id;
  const list = await req("GET", "/elections");
  log(Array.isArray(list.data?.elections), "GET /elections list");

  // 3. Auth - admin login
  console.log("\n[3] Admin login");
  const adminLogin = await req("POST", "/auth/login", {
    email: ADMIN_EMAIL,
    password: ADMIN_PASS,
  });
  log(adminLogin.status === 200 && adminLogin.data?.token, "Admin login", JSON.stringify(adminLogin.data));
  const adminToken = adminLogin.data?.token;
  log(adminLogin.data?.user?.role === "admin", "Admin role correct");

  // 4. Auth - validation rejects bad email
  console.log("\n[4] Email validation");
  const badEmail = await req("POST", "/auth/register", {
    fullName: "Bad",
    email: "not-a-kab-email@gmail.com",
    password: "Whatever123",
    confirmPassword: "Whatever123",
  });
  log(badEmail.status === 400, "Reject non-Kab email", JSON.stringify(badEmail.data));

  const weakPass = await req("POST", "/auth/register", {
    fullName: "Weak",
    email: VOTER_EMAIL,
    password: "weak",
    confirmPassword: "weak",
  });
  log(weakPass.status === 400, "Reject weak password");

  // 5. Voter registration
  console.log("\n[5] Voter registration");
  const reg = await req("POST", "/auth/register", {
    fullName: VOTER_NAME,
    email: VOTER_EMAIL,
    password: VOTER_PASS,
    confirmPassword: VOTER_PASS,
  });
  log(reg.status === 201, `Register voter ${VOTER_EMAIL}`, JSON.stringify(reg.data));

  // Try login before verification
  const earlyLogin = await req("POST", "/auth/login", {
    email: VOTER_EMAIL,
    password: VOTER_PASS,
  });
  log(earlyLogin.status === 403, "Block login before email verified");

  // 6. Manually verify (bypass email) by using token from DB via admin SQL endpoint... we don't have one
  // Instead use direct DB access through check-db pattern? We'll mark verified via a quick node-pg call.
  console.log("\n[6] Mark voter verified directly in DB");
  const { Pool } = await import("pg");
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await pool.query(
    `UPDATE users SET is_email_verified=true, email_verification_token=NULL, email_verification_expires=NULL WHERE email=$1`,
    [VOTER_EMAIL]
  );
  log(true, "Voter marked verified");

  // 7. Voter login
  console.log("\n[7] Voter login");
  const voterLogin = await req("POST", "/auth/login", {
    email: VOTER_EMAIL,
    password: VOTER_PASS,
  });
  log(voterLogin.status === 200 && voterLogin.data?.token, "Voter login", JSON.stringify(voterLogin.data));
  const voterToken = voterLogin.data?.token;
  log(voterLogin.data?.user?.role === "voter", "Voter role correct");

  // 8. /auth/me
  console.log("\n[8] /auth/me");
  const me = await req("GET", "/auth/me", null, voterToken);
  log(me.status === 200 && me.data?.email === VOTER_EMAIL, "GET /auth/me");

  const meNoToken = await req("GET", "/auth/me");
  log(meNoToken.status === 401, "Reject /auth/me without token");

  // 9. Candidates
  console.log("\n[9] Candidates");
  const cands = await fetch(`${BASE}/candidates/by-position?electionId=${electionId}`).then(r => r.json()).catch(() => null);
  const positions = cands?.positions || [];
  log(positions.length > 0, `Got ${positions.length} positions`);
  log(positions.every(p => Array.isArray(p.candidates) && p.candidates.length > 0), "All positions have candidates");

  // 10. Submit vote
  console.log("\n[10] Submit vote (one-per-position enforcement)");
  const pos1 = positions[0];
  const cand1 = pos1?.candidates?.[0];
  const vote1 = await req(
    "POST",
    "/vote/submit",
    { electionId, positionId: pos1.id, candidateId: cand1.id },
    voterToken
  );
  log(vote1.status === 201, `Submit vote for ${pos1.name}`, JSON.stringify(vote1.data));

  // duplicate
  const vote2 = await req(
    "POST",
    "/vote/submit",
    { electionId, positionId: pos1.id, candidateId: cand1.id },
    voterToken
  );
  log(vote2.status === 400, "Reject duplicate vote for same position", JSON.stringify(vote2.data));

  // submit for all remaining positions
  for (let i = 1; i < positions.length; i++) {
    const p = positions[i];
    const c = p.candidates[0];
    const v = await req(
      "POST",
      "/vote/submit",
      { electionId, positionId: p.id, candidateId: c.id },
      voterToken
    );
    log(v.status === 201, `Submit vote for ${p.name}`);
  }

  // 11. My votes
  console.log("\n[11] My votes");
  const my = await req("GET", `/vote/my-votes?electionId=${electionId}`, null, voterToken);
  log(my.status === 200 && my.data?.votes?.length === positions.length, `Voter has ${my.data?.votes?.length} votes`);

  // 12. Live results
  console.log("\n[12] Live results & percentages");
  const live = await req("GET", `/results/live?electionId=${electionId}`);
  log(live.status === 200, "GET /results/live");
  const sumOk = live.data?.results?.every(p => {
    if (!p.candidates.length) return true;
    const sum = p.candidates.reduce((s, c) => s + c.percentage, 0);
    return p.totalVotes === 0 || Math.abs(sum - 100) < 0.5;
  });
  log(sumOk, "Percentages sum to ~100% per position");

  // 13. Admin dashboard
  console.log("\n[13] Admin dashboard");
  const dash = await req("GET", `/admin/dashboard?electionId=${electionId}`, null, adminToken);
  log(dash.status === 200 && dash.data?.stats, "Admin dashboard", JSON.stringify(dash.data?.stats));

  // 14. Admin auth wall
  console.log("\n[14] Admin auth wall");
  const noAdmin = await req("GET", `/admin/dashboard?electionId=${electionId}`);
  log(noAdmin.status === 401, "Reject /admin/* without token");
  const wrongRole = await req("GET", `/admin/dashboard?electionId=${electionId}`, null, voterToken);
  log(wrongRole.status === 403, "Reject /admin/* with voter token");

  // 15. Admin edit vote + log
  console.log("\n[15] Admin vote edit");
  const allVotes = await req("GET", `/admin/votes?electionId=${electionId}`, null, adminToken);
  const targetVote = allVotes.data?.votes?.find(v => v.voter_email === VOTER_EMAIL);
  log(!!targetVote, "Find voter's vote in admin list");
  // pick a different candidate in same position
  const samePos = positions.find(p => p.id === targetVote.position_id);
  const newCand = samePos.candidates.find(c => c.id !== targetVote.candidate_id);
  const edit = await req(
    "PATCH",
    `/admin/votes/${targetVote.id}`,
    { newCandidateId: newCand.id, reason: "Smoke test edit" },
    adminToken
  );
  log(edit.status === 200, "Edit vote", JSON.stringify(edit.data));

  const logs = await req("GET", `/admin/vote-edit-logs?electionId=${electionId}`, null, adminToken);
  const found = logs.data?.editLogs?.find(l => l.vote_id === targetVote.id);
  log(!!found && found.reason === "Smoke test edit", "vote_edit_logs entry created");
  log(found?.old_candidate_id === targetVote.candidate_id, "Old candidate preserved in log");
  log(found?.new_candidate_id === newCand.id, "New candidate logged");

  // 16. Voters list
  console.log("\n[16] Voters list");
  const voters = await req("GET", "/admin/voters", null, adminToken);
  log(voters.status === 200 && voters.data?.voters?.some(v => v.email === VOTER_EMAIL), "Voter present in admin list");

  // 17. Cleanup test voter & their votes
  console.log("\n[17] Cleanup");
  await pool.query(`DELETE FROM vote_edit_logs WHERE vote_id IN (SELECT id FROM votes WHERE voter_id = (SELECT id FROM users WHERE email=$1))`, [VOTER_EMAIL]);
  await pool.query(`DELETE FROM votes WHERE voter_id = (SELECT id FROM users WHERE email=$1)`, [VOTER_EMAIL]);
  await pool.query(`DELETE FROM audit_logs WHERE actor_id = (SELECT id FROM users WHERE email=$1)`, [VOTER_EMAIL]);
  await pool.query(`DELETE FROM users WHERE email=$1`, [VOTER_EMAIL]);
  log(true, "Test voter removed");
  await pool.end();

  console.log(`\n=== Result: ${pass} passed, ${fail} failed ===\n`);
  process.exit(fail > 0 ? 1 : 0);
};

run().catch(e => {
  console.error("FATAL:", e);
  process.exit(2);
});
