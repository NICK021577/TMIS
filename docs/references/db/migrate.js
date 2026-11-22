/**
 * Creates every table in the database named in .env (DB_NAME) from db/schema.sql.
 * Safe to run again: the script only creates tables that do not exist yet.
 *   npm run db:schema
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tmis_db',
    multipleStatements: true,
    charset: 'utf8mb4',
  });
  await conn.query(sql);
  const [rows] = await conn.query('SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema = DATABASE()');
  console.log(`Schema applied. ${rows[0].n} tables in ${process.env.DB_NAME || 'tmis_db'}.`);
  await conn.end();
}

main().catch((e) => { console.error('Schema failed:', e.message); process.exit(1); });
