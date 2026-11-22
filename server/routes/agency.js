/**
 * Agency settings API: users and roles of the signed-in administrator's agency.
 * Everything here is limited to that agency and to Agency Administrators.
 */
const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const { requireAuth, requireAgencyAdmin } = require('../middleware/auth');
const { ALL_MENUS, LOCKED, ADMIN_ROLE, NEW_ROLE_MENUS, effectiveMenus } = require('../lib/menus');

const router = express.Router();
router.use(requireAuth, requireAgencyAdmin);

const ACCESS = ['all_records', 'assigned_activities', 'assigned_sessions'];
const uuid = () => crypto.randomUUID();
const bad = (res, error, status = 400) => res.status(status).json({ error });

/** Temporary password: 12 characters without look-alikes (no 0/O, 1/l/I). */
function tempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  return Array.from({ length: 12 }, () => chars[crypto.randomInt(chars.length)]).join('');
}

async function audit(db, ctx, action, targetType, targetLabel, detail) {
  await db.query(
    'INSERT INTO audit_log (id, agency_id, action, target_type, target_label, detail, created_by) VALUES (?,?,?,?,?,?,?)',
    [uuid(), ctx.agencyId, action, targetType, targetLabel, detail ?? null, ctx.userId],
  );
}

/* ── roles ───────────────────────────────────────────────────────────── */

/** Roles people can hold in the console (the Participant role belongs to the mobile app). */
async function loadRoles(agencyId) {
  const [roles] = await pool.query(
    `SELECT r.id, r.name, r.data_access, r.is_system, r.updated_at, r.created_at,
            (SELECT COUNT(*) FROM agency_membership m WHERE m.role_id = r.id) AS users
       FROM agency_role r WHERE r.agency_id = ? AND r.name <> 'Participant' ORDER BY r.is_system DESC, r.created_at, r.name`,
    [agencyId],
  );
  const [menus] = await pool.query('SELECT role_id, menu_key FROM role_menu WHERE agency_id = ?', [agencyId]);
  return roles.map((r) => ({
    id: r.id, name: r.name, access: r.data_access, isSystem: !!r.is_system, users: r.users,
    updated: r.updated_at ?? r.created_at,
    menus: r.name === ADMIN_ROLE ? ALL_MENUS : [...new Set([...LOCKED, ...menus.filter((m) => m.role_id === r.id).map((m) => m.menu_key)])],
  }));
}

router.get('/roles', async (req, res) => {
  res.json({ roles: await loadRoles(req.ctx.agencyId) });
});

router.post('/roles', async (req, res) => {
  const name = String(req.body?.name ?? '').trim();
  const access = String(req.body?.access ?? '');
  if (!name || name.length > 100) return bad(res, 'Give the role a name (up to 100 characters).');
  if (!ACCESS.includes(access)) return bad(res, 'Choose what data this role can see.');
  if (name.toLowerCase() === 'participant') return bad(res, '“Participant” is reserved for the mobile app.');
  const [dup] = await pool.query('SELECT 1 FROM agency_role WHERE agency_id = ? AND name = ?', [req.ctx.agencyId, name]);
  if (dup.length) return bad(res, 'A role with this name already exists.', 409);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const id = uuid();
    await conn.query('INSERT INTO agency_role (id, agency_id, name, data_access, is_system, created_by) VALUES (?,?,?,?,0,?)', [id, req.ctx.agencyId, name, access, req.ctx.userId]);
    for (const m of NEW_ROLE_MENUS) await conn.query('INSERT INTO role_menu (id, agency_id, role_id, menu_key, created_by) VALUES (?,?,?,?,?)', [uuid(), req.ctx.agencyId, id, m, req.ctx.userId]);
    await audit(conn, req.ctx, 'role.created', 'role', name, `Data access: ${access}`);
    await conn.commit();
    res.status(201).json({ roles: await loadRoles(req.ctx.agencyId) });
  } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
});

/** The Administrator role is fixed; a role can only be edited inside the agency. */
async function editableRole(req, res) {
  const [rows] = await pool.query('SELECT id, name FROM agency_role WHERE id = ? AND agency_id = ?', [req.params.id, req.ctx.agencyId]);
  const role = rows[0];
  if (!role || role.name === 'Participant') { bad(res, 'Role not found.', 404); return null; }
  if (role.name === ADMIN_ROLE) { bad(res, 'The Agency Administrator role cannot be changed.', 403); return null; }
  return role;
}

router.patch('/roles/:id', async (req, res) => {
  const role = await editableRole(req, res); if (!role) return;
  const access = String(req.body?.access ?? '');
  if (!ACCESS.includes(access)) return bad(res, 'Choose what data this role can see.');
  await pool.query('UPDATE agency_role SET data_access = ?, updated_by = ? WHERE id = ?', [access, req.ctx.userId, role.id]);
  await audit(pool, req.ctx, 'role.access_changed', 'role', role.name, `Data access: ${access}`);
  res.json({ roles: await loadRoles(req.ctx.agencyId) });
});

/** PUT /roles/:id/menus  { menus: ['calendar', …] }  Replaces the role's default menus. */
router.put('/roles/:id/menus', async (req, res) => {
  const role = await editableRole(req, res); if (!role) return;
  const wanted = req.body?.menus;
  if (!Array.isArray(wanted) || wanted.some((k) => !ALL_MENUS.includes(k))) return bad(res, 'Unknown menu.');
  const keys = [...new Set([...LOCKED, ...wanted])];
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM role_menu WHERE role_id = ?', [role.id]);
    for (const k of keys) await conn.query('INSERT INTO role_menu (id, agency_id, role_id, menu_key, created_by) VALUES (?,?,?,?,?)', [uuid(), req.ctx.agencyId, role.id, k, req.ctx.userId]);
    await conn.query('UPDATE agency_role SET updated_by = ? WHERE id = ?', [req.ctx.userId, role.id]);
    await audit(conn, req.ctx, 'role.menus_changed', 'role', role.name, `Default menus: ${keys.join(', ')}`);
    await conn.commit();
    res.json({ roles: await loadRoles(req.ctx.agencyId) });
  } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
});

/* ── users ───────────────────────────────────────────────────────────── */

async function loadUsers(agencyId) {
  const [rows] = await pool.query(
    `SELECT m.id, m.status, m.role_id, m.updated_at, m.created_at, u.email, u.first_name, u.last_name, u.last_sign_in_at, r.name AS role
       FROM agency_membership m
       JOIN \`user\` u ON u.id = m.user_id
       JOIN agency_role r ON r.id = m.role_id
      WHERE m.agency_id = ? AND r.name <> 'Participant'
      ORDER BY m.created_at, u.email`,
    [agencyId],
  );
  const [roleMenus] = await pool.query('SELECT role_id, menu_key FROM role_menu WHERE agency_id = ?', [agencyId]);
  const [overrides] = await pool.query('SELECT membership_id, menu_key, is_enabled FROM membership_menu WHERE agency_id = ?', [agencyId]);
  return rows.map((r) => {
    const menuOverride = Object.fromEntries(overrides.filter((o) => o.membership_id === r.id).map((o) => [o.menu_key, !!o.is_enabled]));
    return {
      id: r.id,
      name: [r.first_name, r.last_name].filter(Boolean).join(' '),
      email: r.email,
      role: r.role,
      roleId: r.role_id,
      status: r.status === 'suspended' ? 'Suspended' : r.last_sign_in_at ? 'Active' : 'Invited',
      updated: r.updated_at ?? r.created_at,
      menuOverride,
      menus: effectiveMenus(r.role, roleMenus.filter((m) => m.role_id === r.role_id).map((m) => m.menu_key), menuOverride),
    };
  });
}

router.get('/users', async (req, res) => {
  res.json({ users: await loadUsers(req.ctx.agencyId) });
});

/**
 * POST /users  { firstName, lastName, email, roleId }
 * A new person gets a temporary password (shown once) and must choose their own at first sign-in.
 * Someone who already has an account (for example in another agency) is just added and keeps their password.
 */
router.post('/users', async (req, res) => {
  const firstName = String(req.body?.firstName ?? '').trim();
  const lastName = String(req.body?.lastName ?? '').trim();
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  if (!firstName || !lastName) return bad(res, 'Enter their first and last name.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad(res, 'Enter a valid email address.');

  const [roleRows] = await pool.query("SELECT id, name FROM agency_role WHERE id = ? AND agency_id = ? AND name <> 'Participant'", [req.body?.roleId, req.ctx.agencyId]);
  const role = roleRows[0];
  if (!role) return bad(res, 'Choose a role.');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [found] = await conn.query('SELECT id, is_super_admin, status FROM `user` WHERE email = ?', [email]);
    let userId = found[0]?.id;
    let password = null;
    if (found[0]) {
      if (found[0].is_super_admin) { await conn.rollback(); return bad(res, 'This email belongs to a platform account.', 409); }
      const [already] = await conn.query('SELECT 1 FROM agency_membership WHERE agency_id = ? AND user_id = ?', [req.ctx.agencyId, userId]);
      if (already.length) { await conn.rollback(); return bad(res, 'This person already has an account in your agency.', 409); }
    } else {
      userId = uuid();
      password = tempPassword();
      await conn.query(
        'INSERT INTO `user` (id, email, password_hash, first_name, last_name, status, is_super_admin, must_reset_password) VALUES (?,?,?,?,?,?,0,1)',
        [userId, email, await bcrypt.hash(password, 10), firstName, lastName, 'active'],
      );
    }
    const membershipId = uuid();
    await conn.query(
      'INSERT INTO agency_membership (id, agency_id, user_id, role_id, status, joined_at, created_by) VALUES (?,?,?,?,?,UTC_TIMESTAMP(),?)',
      [membershipId, req.ctx.agencyId, userId, role.id, 'active', req.ctx.userId],
    );
    await audit(conn, req.ctx, 'user.added', 'user', email, `Role: ${role.name}${password ? '' : ' (existing account)'}`);
    await conn.commit();
    const users = await loadUsers(req.ctx.agencyId);
    res.status(201).json({ user: users.find((u) => u.id === membershipId), users, tempPassword: password });
  } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
});

/** A member of this agency (never the signed-in administrator, and never a participant). */
async function member(req, res, { notSelf } = {}) {
  const [rows] = await pool.query(
    `SELECT m.id, m.user_id, m.status, m.role_id, r.name AS role, u.email
       FROM agency_membership m JOIN agency_role r ON r.id = m.role_id JOIN \`user\` u ON u.id = m.user_id
      WHERE m.id = ? AND m.agency_id = ? AND r.name <> 'Participant'`,
    [req.params.id, req.ctx.agencyId],
  );
  const m = rows[0];
  if (!m) { bad(res, 'User not found.', 404); return null; }
  if (notSelf && m.user_id === req.ctx.userId) { bad(res, notSelf, 403); return null; }
  return m;
}

/** True when this membership is the only active administrator left. */
async function isLastAdmin(m, agencyId) {
  if (m.role !== ADMIN_ROLE) return false;
  const [[{ n }]] = await pool.query(
    `SELECT COUNT(*) AS n FROM agency_membership x JOIN agency_role r ON r.id = x.role_id
      WHERE x.agency_id = ? AND r.name = ? AND x.status = 'active' AND x.id <> ?`, [agencyId, ADMIN_ROLE, m.id]);
  return n === 0;
}

/** PATCH /users/:id  { roleId } or { status: 'active' | 'suspended' } */
router.patch('/users/:id', async (req, res) => {
  const m = await member(req, res, { notSelf: 'You cannot change your own role or access here.' });
  if (!m) return;

  if (req.body?.roleId !== undefined) {
    const [r] = await pool.query("SELECT id, name FROM agency_role WHERE id = ? AND agency_id = ? AND name <> 'Participant'", [req.body.roleId, req.ctx.agencyId]);
    if (!r[0]) return bad(res, 'Choose a role.');
    if (r[0].id !== m.role_id) {
      if (await isLastAdmin(m, req.ctx.agencyId)) return bad(res, 'Your agency needs at least one Agency Administrator.', 409);
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        await conn.query('UPDATE agency_membership SET role_id = ?, updated_by = ? WHERE id = ?', [r[0].id, req.ctx.userId, m.id]);
        await conn.query('DELETE FROM membership_menu WHERE membership_id = ?', [m.id]);   // a new role starts from its own defaults
        await audit(conn, req.ctx, 'user.role_changed', 'user', m.email, `${m.role} to ${r[0].name}`);
        await conn.commit();
      } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
    }
  } else if (req.body?.status !== undefined) {
    const status = req.body.status;
    if (!['active', 'suspended'].includes(status)) return bad(res, 'Unknown status.');
    if (status === 'suspended' && (await isLastAdmin(m, req.ctx.agencyId))) return bad(res, 'Your agency needs at least one active Agency Administrator.', 409);
    await pool.query('UPDATE agency_membership SET status = ?, updated_by = ? WHERE id = ?', [status, req.ctx.userId, m.id]);
    await audit(pool, req.ctx, status === 'suspended' ? 'user.suspended' : 'user.reactivated', 'user', m.email, null);
  } else {
    return bad(res, 'Nothing to change.');
  }
  res.json({ users: await loadUsers(req.ctx.agencyId) });
});

/** PUT /users/:id/menus  { override: { calendar: true, budget: false } }  Only differences from the role defaults are kept. */
router.put('/users/:id/menus', async (req, res) => {
  const m = await member(req, res);
  if (!m) return;
  if (m.role === ADMIN_ROLE) return bad(res, 'Agency Administrators always see every menu.', 400);
  const override = req.body?.override;
  if (!override || typeof override !== 'object' || Array.isArray(override)) return bad(res, 'Send the menu changes.');
  if (Object.keys(override).some((k) => !ALL_MENUS.includes(k) || typeof override[k] !== 'boolean')) return bad(res, 'Unknown menu.');

  const [rm] = await pool.query('SELECT menu_key FROM role_menu WHERE role_id = ?', [m.role_id]);
  const base = new Set([...LOCKED, ...rm.map((x) => x.menu_key)]);
  const changes = Object.entries(override).filter(([k, on]) => !LOCKED.includes(k) && on !== base.has(k));

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM membership_menu WHERE membership_id = ?', [m.id]);
    for (const [k, on] of changes) await conn.query('INSERT INTO membership_menu (id, agency_id, membership_id, menu_key, is_enabled, created_by) VALUES (?,?,?,?,?,?)', [uuid(), req.ctx.agencyId, m.id, k, on ? 1 : 0, req.ctx.userId]);
    await conn.query('UPDATE agency_membership SET updated_by = ? WHERE id = ?', [req.ctx.userId, m.id]);
    await audit(conn, req.ctx, 'user.menus_changed', 'user', m.email, changes.length ? changes.map(([k, on]) => `${on ? '+' : '-'}${k}`).join(' ') : 'Reset to role defaults');
    await conn.commit();
  } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
  res.json({ users: await loadUsers(req.ctx.agencyId) });
});

module.exports = router;
