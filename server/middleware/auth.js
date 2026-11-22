const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { ADMIN_ROLE } = require('../lib/menus');

/**
 * Rejects the request unless it carries a valid "Authorization: Bearer <token>" header. Sets req.auth.
 * A person who still has a temporary password (token claim `mr`) can only change it.
 */
function requireAuth(req, res, next) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Sign in to continue.' });
  let auth;
  try {
    auth = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Session expired. Sign in again.' });
  }
  if (auth.mr && req.originalUrl.split('?')[0] !== '/api/auth/change-password') {
    return res.status(403).json({ error: 'Set a new password to continue.', code: 'PASSWORD_RESET' });
  }
  req.auth = auth;
  next();
}

/**
 * Agency Administrators only. The role is read from the database on every request, so a suspended
 * or demoted administrator loses access at once. Sets req.ctx = { userId, agencyId }.
 */
async function requireAgencyAdmin(req, res, next) {
  const agencyId = req.auth.agency;
  if (!agencyId) return res.status(403).json({ error: 'This is for agency administrators.' });
  const [rows] = await pool.query(
    `SELECT r.name AS role FROM agency_membership m
       JOIN agency_role r ON r.id = m.role_id
       JOIN \`user\` u ON u.id = m.user_id
      WHERE m.user_id = ? AND m.agency_id = ? AND m.status = 'active' AND u.status = 'active'`,
    [req.auth.sub, agencyId],
  );
  if (rows[0]?.role !== ADMIN_ROLE) return res.status(403).json({ error: 'Only an Agency Administrator can do this.' });
  req.ctx = { userId: req.auth.sub, agencyId };
  next();
}

module.exports = { requireAuth, requireAgencyAdmin };
