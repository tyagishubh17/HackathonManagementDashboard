#!/usr/bin/env node
/**
 * End-to-end API smoke test for FairJudge backend
 */
const BASE = process.env.API_URL || "http://localhost:5000";

async function request(path, options = {}, session = {}) {
  const url = `${BASE}${path}`;
  const headers = { ...(options.headers || {}) };
  if (session.csrf && options.method && options.method !== "GET") {
    headers["X-CSRF-Token"] = session.csrf;
  }
  if (session.token) headers.Authorization = `Bearer ${session.token}`;

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  let body;
  const text = await res.text();
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: res.status, body, headers: res.headers };
}

async function getSession() {
  const session = { cookies: "" };
  const csrfRes = await fetch(`${BASE}/api/csrf-token`, { credentials: "include" });
  const csrfBody = await csrfRes.json();
  session.csrf = csrfBody.csrfToken;
  session.cookies = csrfRes.headers.get("set-cookie") || "";
  return session;
}

function assert(name, condition, detail = "") {
  if (condition) {
    console.log(`  ✓ ${name}`);
    return true;
  }
  console.log(`  ✗ ${name}${detail ? `: ${detail}` : ""}`);
  return false;
}

async function loginAs(email, password) {
  const session = await getSession();
  const res = await request(
    "/api/auth/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: session.cookies },
      body: JSON.stringify({ email, password }),
    },
    session
  );
  if (res.status !== 200) throw new Error(`Login failed for ${email}: ${JSON.stringify(res.body)}`);
  session.token = res.body.accessToken;
  session.role = res.body.role;
  session.user = res.body.user;
  return session;
}

async function run() {
  console.log("\n=== FairJudge API E2E Smoke Test ===\n");
  let passed = 0;
  let failed = 0;
  const check = (name, ok, detail) => (ok ? passed++ : failed++, assert(name, ok, detail));

  // Health
  const health = await request("/health");
  check("Health endpoint", health.status === 200 && health.body?.status === "ok");

  // Login all roles
  const admin = await loginAs("admin@fairjudge.com", "Admin@123");
  check("Super admin login", admin.role === "super_admin");

  const organizer = await loginAs("organizer1@fairjudge.com", "Admin@123");
  check("Organizer login", organizer.role === "organizer");

  const judge = await loginAs("judge1@fairjudge.com", "Admin@123");
  check("Judge login", judge.role === "judge");

  const participant = await loginAs("participant1@fairjudge.com", "Admin@123");
  check("Participant login", participant.role === "participant");

  // Register new user
  const regSession = await getSession();
  const uniqueEmail = `testuser_${Date.now()}@fairjudge.com`;
  const regRes = await request(
    "/api/auth/register",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: uniqueEmail,
        password: "Test@1234",
        fullName: "Test User",
        role: "participant",
        participantDetails: { skills: ["React"], experience: "beginner" },
      }),
    },
    regSession
  );
  check("User registration", regRes.status === 200 && regRes.body?.accessToken);

  // Admin analytics
  const analytics = await request("/api/admin/analytics/overview", {}, admin);
  check("Admin analytics", analytics.status === 200 && typeof analytics.body?.data?.totalUsers === "number");

  // Admin users
  const users = await request("/api/admin/users", {}, admin);
  check("Admin users list", users.status === 200 && Array.isArray(users.body?.data));

  // Pending hackathons
  const pending = await request("/api/admin/hackathons/pending", {}, admin);
  check("Pending hackathons", pending.status === 200 && Array.isArray(pending.body?.data));

  // Organizer hackathons
  const myHacks = await request("/api/hackathons/my-hackathons", {}, organizer);
  check("Organizer my-hackathons", myHacks.status === 200 && Array.isArray(myHacks.body?.data));

  // Public hackathons
  const publicHacks = await request("/api/hackathons");
  check("Public hackathons list", publicHacks.status === 200 && Array.isArray(publicHacks.body?.data));

  const hackId = publicHacks.body?.data?.[0]?._id || myHacks.body?.data?.[0]?._id;
  if (hackId) {
    const pubDetail = await request(`/api/hackathons/${hackId}/public`);
    check("Public hackathon detail", pubDetail.status === 200 && pubDetail.body?.data?.title);

    const myReg = await request(`/api/hackathons/${hackId}/my-registration`, {}, participant);
    check("Participant my-registration", myReg.status === 200 || myReg.status === 404);
  } else {
    check("Public hackathon detail", false, "no hackathon id");
    check("Participant my-registration", false, "no hackathon id");
  }

  // Teams
  const teams = await request("/api/teams/my-teams", {}, participant);
  check("Participant my-teams", teams.status === 200 && Array.isArray(teams.body?.data));

  // Judge assignments
  const assignments = await request("/api/evaluations/my-assignments", {}, judge);
  check("Judge assignments", assignments.status === 200 && Array.isArray(assignments.body?.data));

  // Auth me
  const me = await request("/api/auth/me", {}, admin);
  check("Auth /me", me.status === 200 && me.body?.data?.email);

  // Logout + blacklist
  const logout = await request(
    "/api/auth/logout",
    { method: "POST" },
    admin
  );
  check("Logout", logout.status === 200);

  const revoked = await request("/api/auth/me", {}, admin);
  check("Token revoked after logout", revoked.status === 401);

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error("Test runner error:", err.message);
  process.exit(1);
});
