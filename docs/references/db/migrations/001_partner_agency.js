/**
 * Upgrades an existing tmis_db to the partner model:
 *   - new table partner_agency (created by `npm run db:schema`, run that first)
 *   - funding_source gets partner_id and archived
 *   - activity_partner swaps partner_agency_id / partner_name for partner_id
 * Safe to run again. Refuses to change activity_partner if it already holds rows.
 *
 *   node db/migrations/001_partner_agency.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const pool = require('../pool');

async function hasColumn(conn, table, column) {
  const [r] = await conn.query(
    'SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?', [table, column]);
  return r.length > 0;
}
async function foreignKeysOn(conn, table, column) {
  const [r] = await conn.query(
    `SELECT CONSTRAINT_NAME AS name FROM information_schema.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL`, [table, column]);
  return r.map((x) => x.name);
}

(async () => {
  const conn = await pool.getConnection();
  try {
    const [[{ n: hasPartnerTable }]] = await conn.query(
      "SELECT COUNT(*) AS n FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'partner_agency'");
    if (!hasPartnerTable) throw new Error('partner_agency does not exist yet. Run `npm run db:schema` first.');

    // funding_source
    if (!(await hasColumn(conn, 'funding_source', 'partner_id'))) {
      await conn.query('ALTER TABLE funding_source ADD COLUMN partner_id char(36) NULL AFTER agency_id');
      await conn.query('ALTER TABLE funding_source ADD CONSTRAINT fk_funding_source_partner_id FOREIGN KEY (partner_id) REFERENCES partner_agency (id) ON DELETE RESTRICT');
      console.log('funding_source.partner_id added');
    }
    if (!(await hasColumn(conn, 'funding_source', 'archived'))) {
      await conn.query('ALTER TABLE funding_source ADD COLUMN archived tinyint(1) NOT NULL DEFAULT 0 AFTER name');
      await conn.query('ALTER TABLE funding_source ALTER COLUMN archived DROP DEFAULT');
      console.log('funding_source.archived added');
    }
    const [uq] = await conn.query("SELECT 1 FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'funding_source' AND INDEX_NAME = 'uq_funding_source_1'");
    if (!uq.length) {
      await conn.query('ALTER TABLE funding_source ADD UNIQUE KEY uq_funding_source_1 (agency_id, name)');
      console.log('funding_source unique (agency_id, name) added');
    }

    // activity_partner
    if (!(await hasColumn(conn, 'activity_partner', 'partner_id'))) {
      const [[{ n }]] = await conn.query('SELECT COUNT(*) AS n FROM activity_partner');
      if (n > 0) throw new Error('activity_partner already has rows. Move them into partner_agency by hand before running this.');
      for (const fk of await foreignKeysOn(conn, 'activity_partner', 'partner_agency_id')) await conn.query(`ALTER TABLE activity_partner DROP FOREIGN KEY \`${fk}\``);
      if (await hasColumn(conn, 'activity_partner', 'partner_agency_id')) await conn.query('ALTER TABLE activity_partner DROP COLUMN partner_agency_id');
      if (await hasColumn(conn, 'activity_partner', 'partner_name')) await conn.query('ALTER TABLE activity_partner DROP COLUMN partner_name');
      await conn.query('ALTER TABLE activity_partner ADD COLUMN partner_id char(36) NOT NULL AFTER activity_id');
      await conn.query('ALTER TABLE activity_partner ADD CONSTRAINT fk_activity_partner_partner_id FOREIGN KEY (partner_id) REFERENCES partner_agency (id) ON DELETE RESTRICT');
      await conn.query('ALTER TABLE activity_partner ADD UNIQUE KEY uq_activity_partner_1 (activity_id, partner_id)');
      console.log('activity_partner now points to partner_agency');
    }
    console.log('Partner migration done.');
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  } finally {
    conn.release();
    await pool.end();
  }
})();
