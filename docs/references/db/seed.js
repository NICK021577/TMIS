/**
 * Starter data so the console can be signed in to right away. Safe to run again: anything that
 * already exists (found by email, short name or role name) is left as it is.
 *   npm run db:seed
 *
 * Development accounts only. Change these passwords, or delete the accounts, before real use.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const pool = require('./pool');

/* ── accounts (change here, then run the seed again on a fresh database) ── */
const SUPER_ADMIN = { email: 'superadmin@gmail.com', password: '12345678', first: 'Elena', last: 'Cruz' };
const SAMPLE_ADMIN = { email: 'alexis.ramos@prri.gov.ph', password: 'Prri-Admin-2026', first: 'Alexis', last: 'Ramos' };

const SAMPLE_COMMITTEE = { email: 'm.flores@prri.gov.ph', password: 'Prri-Committee-2026', first: 'Marissa', last: 'Flores' };

const AGENCY = {
  name: 'Philippine Rubber Research Institute',
  shortName: 'PRRI',
  type: 'government',
  region: 'Region IX',
  brandColor: '#2f5fcc',
  mission: 'To generate and promote rubber technologies that raise farmer incomes and build a competitive, sustainable rubber industry.',
  vision: 'A globally competitive Philippine rubber industry with empowered, prosperous rubber farming communities.',
  mandate: 'Research, development and extension of rubber technologies in the Philippines.',
  values: ['Excellence', 'Integrity', 'Service to farmers', 'Innovation', 'Sustainability'],
  contactEmail: 'info@prri.gov.ph',
};

/* Built-in roles of every agency and the menus each opens by default (same lists as client/src/lib/menus.js) */
const ALL = ['dashboard', 'calendar', 'activities', 'participants', 'budget', 'reports', 'messaging', 'about', 'settings'];
const ROLES = [
  { name: 'Agency Administrator', access: 'all_records', menus: ALL },
  { name: 'Committee Member', access: 'assigned_activities', menus: ['dashboard', 'calendar', 'activities', 'participants', 'reports', 'messaging', 'about'] },
  { name: 'Resource Person', access: 'assigned_sessions', menus: ['dashboard', 'activities', 'participants', 'reports', 'messaging', 'about'] },
  { name: 'Participant', access: 'assigned_activities', menus: [] },
];

const id = () => crypto.randomUUID();
const hash = (pw) => bcrypt.hashSync(pw, 10);

async function main() {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    /* Super admin */
    const [saRows] = await conn.query('SELECT id FROM `user` WHERE email = ?', [SUPER_ADMIN.email]);
    let superId = saRows[0]?.id;
    if (!superId) {
      superId = id();
      await conn.query(
        'INSERT INTO `user` (id, email, password_hash, first_name, last_name, status, is_super_admin, must_reset_password) VALUES (?,?,?,?,?,?,?,?)',
        [superId, SUPER_ADMIN.email, hash(SUPER_ADMIN.password), SUPER_ADMIN.first, SUPER_ADMIN.last, 'active', 1, 0],
      );
      console.log('Created super admin', SUPER_ADMIN.email);
    }

    /* Agency */
    const [ag] = await conn.query('SELECT id FROM agency WHERE short_name = ?', [AGENCY.shortName]);
    let agencyId = ag[0]?.id;
    if (!agencyId) {
      agencyId = id();
      await conn.query(
        'INSERT INTO agency (id, name, short_name, type, region, status, mission, vision, mandate, `values`, contact_email, brand_color, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [agencyId, AGENCY.name, AGENCY.shortName, AGENCY.type, AGENCY.region, 'active', AGENCY.mission, AGENCY.vision, AGENCY.mandate, JSON.stringify(AGENCY.values), AGENCY.contactEmail, AGENCY.brandColor, superId],
      );
      console.log('Created agency', AGENCY.shortName);
    }

    /* Roles and their default menus */
    const roleIds = {};
    for (const r of ROLES) {
      const [found] = await conn.query('SELECT id FROM agency_role WHERE agency_id = ? AND name = ?', [agencyId, r.name]);
      if (found[0]) { roleIds[r.name] = found[0].id; continue; }
      const rid = id();
      roleIds[r.name] = rid;
      await conn.query('INSERT INTO agency_role (id, agency_id, name, data_access, is_system, created_by) VALUES (?,?,?,?,?,?)', [rid, agencyId, r.name, r.access, 1, superId]);
      for (const m of r.menus) {
        await conn.query('INSERT INTO role_menu (id, agency_id, role_id, menu_key, created_by) VALUES (?,?,?,?,?)', [id(), agencyId, rid, m, superId]);
      }
    }

    /* Sample Agency Administrator */
    const [ad] = await conn.query('SELECT id FROM `user` WHERE email = ?', [SAMPLE_ADMIN.email]);
    let adminId = ad[0]?.id;
    if (!adminId) {
      adminId = id();
      await conn.query(
        'INSERT INTO `user` (id, email, password_hash, first_name, last_name, status, is_super_admin, must_reset_password) VALUES (?,?,?,?,?,?,?,?)',
        [adminId, SAMPLE_ADMIN.email, hash(SAMPLE_ADMIN.password), SAMPLE_ADMIN.first, SAMPLE_ADMIN.last, 'active', 0, 0],
      );
      console.log('Created sample agency administrator', SAMPLE_ADMIN.email);
    }
    const [mem] = await conn.query('SELECT id FROM agency_membership WHERE agency_id = ? AND user_id = ?', [agencyId, adminId]);
    if (!mem[0]) {
      await conn.query(
        'INSERT INTO agency_membership (id, agency_id, user_id, role_id, status, joined_at, created_by) VALUES (?,?,?,?,?,UTC_TIMESTAMP(),?)',
        [id(), agencyId, adminId, roleIds['Agency Administrator'], 'active', superId],
      );
    }

    /* Sample Committee Member */
    const [cm] = await conn.query('SELECT id FROM `user` WHERE email = ?', [SAMPLE_COMMITTEE.email]);
    let committeeId = cm[0]?.id;
    if (!committeeId) {
      committeeId = id();
      await conn.query(
        'INSERT INTO `user` (id, email, password_hash, first_name, last_name, status, is_super_admin, must_reset_password) VALUES (?,?,?,?,?,?,?,?)',
        [committeeId, SAMPLE_COMMITTEE.email, hash(SAMPLE_COMMITTEE.password), SAMPLE_COMMITTEE.first, SAMPLE_COMMITTEE.last, 'active', 0, 0],
      );
      console.log('Created sample committee member', SAMPLE_COMMITTEE.email);
    }
    const [cmem] = await conn.query('SELECT id FROM agency_membership WHERE agency_id = ? AND user_id = ?', [agencyId, committeeId]);
    if (!cmem[0]) {
      await conn.query(
        'INSERT INTO agency_membership (id, agency_id, user_id, role_id, status, joined_at, created_by) VALUES (?,?,?,?,?,UTC_TIMESTAMP(),?)',
        [id(), agencyId, committeeId, roleIds['Committee Member'], 'active', adminId],
      );
    }

    await conn.commit();
    console.log('Seed finished.');
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
    await pool.end();
  }
}

main().catch((e) => { console.error('Seed failed:', e.message); process.exit(1); });
