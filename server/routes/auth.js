const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');
const { ALL_MENUS, menusForMembership } = require('../lib/menus');

const router = express.Router();

/* Too many wrong passwords for one email from one address pauses sign-in for a while. */
const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;
const fails = new Map();   // key -> { n, until }
const keyOf = (email, ip) => `${email}|${ip}`;
const locked = (key) => { const f = fails.get(key); return f && f.until > Date.now() && f.n >= MAX_FAILS; };
const fail = (key) => { const f = fails.get(key); const n = (f && f.until > Date.now() ? f.n : 0) + 1; fails.set(key, { n, until: Date.now() + LOCK_MS }); };

// compared against when the email is unknown, so a missing account takes as long as a wrong password
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

const fullName = (u) => [u.first_name, u.last_name].filter(Boolean).join(' ');

/** The role and agency a person works in. Super admins have none; participants use the mobile app. */
async function workspaceOf(userId) {
  const [rows] = await pool.query(
    `SELECT m.id AS membership_id, r.id AS role_id, r.name AS role, a.id AS agency_id, a.short_name AS agency, a.name AS agency_name
       FROM agency_membership m
       JOIN agency_role r ON r.id = m.role_id
       JOIN agency a ON a.id = m.agency_id
      WHERE m.user_id = ? AND m.status = 'active' AND a.status = 'active' AND r.name <> 'Participant'
      ORDER BY m.joined_at ASC`,
    [userId],
  );
  return rows;
}

/** What the console needs to know about the signed-in person, including the menus they may open. */
async function sessionUser(u, ws) {
  return {
    name: fullName(u),
    email: u.email,
    role: u.is_super_admin ? 'Super Admin' : ws[0].role,
    agency: u.is_super_admin ? null : ws[0].agency,
    agencyName: u.is_super_admin ? null : ws[0].agency_name,
    menus: u.is_super_admin ? ALL_MENUS : await menusForMembership(pool, ws[0]),
  };
}

/** Signs a session token. `mr` marks a temporary password that must be changed before anything else. */
function signToken(u, user, ws, mustReset) {
  return jwt.sign(
    { sub: u.id, role: user.role, agency: ws[0]?.agency_id ?? null, ...(mustReset ? { mr: true } : {}) },
    process.env.JWT_SECRET,
    { expiresIn: '8h' },
  );
}

/** POST /api/auth/login  { email, password } */
router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');
    if (!email || !password) return res.status(400).json({ error: 'Enter your email and password.' });

    const key = keyOf(email, req.ip);
    if (locked(key)) return res.status(429).json({ error: 'Too many attempts. Try again in a few minutes.' });

    const [rows] = await pool.query(
      'SELECT id, email, password_hash, first_name, last_name, status, is_super_admin, must_reset_password FROM `user` WHERE email = ?',
      [email],
    );
    const u = rows[0];
    const ok = await bcrypt.compare(password, u?.password_hash ?? DUMMY_HASH);
    if (!u || !ok) { fail(key); return res.status(401).json({ error: 'Email or password is incorrect.' }); }
    if (u.status !== 'active') return res.status(403).json({ error: 'This account is suspended. Contact your administrator.' });

    const ws = u.is_super_admin ? [] : await workspaceOf(u.id);
    if (!u.is_super_admin && !ws.length) {
      const [held] = await pool.query(
        "SELECT 1 FROM agency_membership m JOIN agency_role r ON r.id = m.role_id WHERE m.user_id = ? AND m.status = 'suspended' AND r.name <> 'Participant'", [u.id]);
      return res.status(403).json({ error: held.length ? 'Your access to this agency is suspended. Contact your administrator.' : 'No agency access yet. Participants sign in on the mobile app.' });
    }

    fails.delete(key);
    await pool.query('UPDATE `user` SET last_sign_in_at = UTC_TIMESTAMP() WHERE id = ?', [u.id]);

    const user = await sessionUser(u, ws);
    const token = signToken(u, user, ws, !!u.must_reset_password);
    res.json({ token, user, mustResetPassword: !!u.must_reset_password, workspaces: ws.map((w) => ({ agency: w.agency, agencyName: w.agency_name, role: w.role })) });
  } catch (e) { next(e); }
});

/** GET /api/auth/me  (Authorization: Bearer <token>) */
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, email, first_name, last_name, status, is_super_admin FROM `user` WHERE id = ?', [req.auth.sub]);
    const u = rows[0];
    if (!u || u.status !== 'active') return res.status(401).json({ error: 'Session expired. Sign in again.' });
    const ws = u.is_super_admin ? [] : await workspaceOf(u.id);
    if (!u.is_super_admin && !ws.length) return res.status(403).json({ error: 'No agency access.' });
    res.json({ user: await sessionUser(u, ws) });
  } catch (e) { next(e); }
});

/** POST /api/auth/change-password  { current, next }  Also clears a temporary password. Returns a fresh token. */
router.post('/change-password', requireAuth, async (req, res, next) => {
  try {
    const current = String(req.body?.current ?? '');
    const next_ = String(req.body?.next ?? '');
    if (next_.length < 8) return res.status(400).json({ error: 'The new password needs at least 8 characters.' });
    if (next_ === current) return res.status(400).json({ error: 'Choose a password different from the current one.' });

    const [rows] = await pool.query('SELECT id, email, password_hash, first_name, last_name, status, is_super_admin FROM `user` WHERE id = ?', [req.auth.sub]);
    const u = rows[0];
    if (!u || u.status !== 'active') return res.status(401).json({ error: 'Session expired. Sign in again.' });
    if (!(await bcrypt.compare(current, u.password_hash))) return res.status(400).json({ error: 'The current password is incorrect.' });

    await pool.query('UPDATE `user` SET password_hash = ?, must_reset_password = 0 WHERE id = ?', [await bcrypt.hash(next_, 10), u.id]);
    const ws = u.is_super_admin ? [] : await workspaceOf(u.id);
    const user = await sessionUser(u, ws);
    res.json({ token: signToken(u, user, ws, false), user });
  } catch (e) { next(e); }
});

module.exports = router;
