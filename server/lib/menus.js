/**
 * Menus of the agency console (same keys as client/src/lib/menus.js).
 *   role defaults (role_menu) -> per-person changes (membership_menu)
 * Agency Administrators always get every menu, and nobody can lose the Dashboard.
 */
const ALL_MENUS = ['dashboard', 'calendar', 'activities', 'participants', 'budget', 'reports', 'messaging', 'about', 'settings'];
const LOCKED = ['dashboard'];
const ADMIN_ROLE = 'Agency Administrator';
const NEW_ROLE_MENUS = ['dashboard', 'activities', 'messaging', 'about'];

/** Menus after the role defaults and the person's own changes ({ key: true|false }) are applied. */
function effectiveMenus(roleName, roleKeys, override = {}) {
  if (roleName === ADMIN_ROLE) return ALL_MENUS;
  const set = new Set([...LOCKED, ...roleKeys]);
  for (const [key, on] of Object.entries(override)) {
    if (LOCKED.includes(key) || !ALL_MENUS.includes(key)) continue;
    if (on) set.add(key); else set.delete(key);
  }
  return ALL_MENUS.filter((k) => set.has(k));
}

/** Effective menus of one membership, read from the database. */
async function menusForMembership(db, { membership_id: membershipId, role_id: roleId, role }) {
  const [rm] = await db.query('SELECT menu_key FROM role_menu WHERE role_id = ?', [roleId]);
  const [mm] = await db.query('SELECT menu_key, is_enabled FROM membership_menu WHERE membership_id = ?', [membershipId]);
  const override = Object.fromEntries(mm.map((x) => [x.menu_key, !!x.is_enabled]));
  return effectiveMenus(role, rm.map((x) => x.menu_key), override);
}

module.exports = { ALL_MENUS, LOCKED, ADMIN_ROLE, NEW_ROLE_MENUS, effectiveMenus, menusForMembership };
