require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db/pool');

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing. Copy server/.env.example to server/.env and fill it in.');
  process.exit(1);
}

const app = express();

// The web console runs on a different port in development (Vite), so allow localhost origins
app.use(cors({ origin: (origin, cb) => cb(null, !origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) }));
app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => res.json({ message: 'UniFyle API is running.' }));

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, database: process.env.DB_NAME || 'tmis_db' });
  } catch (e) {
    res.status(503).json({ ok: false, error: 'Database is not reachable.' });
  }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/agency', require('./routes/agency'));

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));

// last stop: never leak internals to the browser
app.use((err, req, res, next) => {   // eslint-disable-line no-unused-vars
  console.error(err);
  res.status(500).json({ error: 'Something went wrong. Try again.' });
});

const port = Number(process.env.PORT || 5000);
app.listen(port, () => console.log(`UniFyle API running at http://localhost:${port}`));
