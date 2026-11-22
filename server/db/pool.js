const mysql = require('mysql2/promise');

/** One shared connection pool for the whole server. Settings come from server/.env. */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tmis_db',
  waitForConnections: true,
  connectionLimit: 10,
  timezone: 'Z',          // store and read datetimes as UTC
  charset: 'utf8mb4',
  decimalNumbers: true,
});

module.exports = pool;
