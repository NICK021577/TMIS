/**
 * Menus of the agency console and who can open them.
 *
 * Three layers, lowest first:
 *   1. role defaults   each role lists the menus it can open (Settings → Roles & permissions)
 *   2. person override the Agency Admin can switch single menus on or off for one person
 *   3. activity role   (staffing) adds menus inside one activity, handled elsewhere
 *
 * Layers 1 and 2 are stored in the database and worked out by the server (server/lib/menus.js); the console
 * receives the final list at sign-in. Agency Administrators and the Super Admin always get every menu, and
 * nobody can lose the Dashboard.
 */

export const MENUS = [
  { key: 'dashboard',    label: 'Dashboard',       icon: 'grid',     to: '/dashboard',    group: 'Workspace',      locked: true },
  { key: 'calendar',     label: 'Calendar',        icon: 'calendar', to: '/calendar',     group: 'Workspace' },
  { key: 'activities',   label: 'Activities',      icon: 'clock',    to: '/activities',   group: 'Workspace' },
  { key: 'participants', label: 'Participants',    icon: 'users',    to: '/participants', group: 'Workspace' },
  { key: 'budget',       label: 'Budget',          icon: 'award',    to: '/budget',       group: 'Workspace' },
  { key: 'reports',      label: 'Reports',         icon: 'chart',    to: '/reports',      group: 'Workspace' },
  { key: 'messaging',    label: 'Messaging',       icon: 'message',  to: '/messaging',    group: 'Administration' },
  { key: 'about',        label: 'About agency',    icon: 'building', to: '/about',        group: 'Administration' },
  { key: 'settings',     label: 'Agency settings', icon: 'settings', to: '/settings',     group: 'Administration' },
];

export const ALL_MENUS = MENUS.map((m) => m.key);
export const ADMIN_ROLE = 'Agency Administrator';
/** Used only when a saved session has no menu list yet (before the server answers). */
export const FALLBACK_MENUS = ['dashboard', 'activities', 'messaging', 'about'];

/** Which menu a pathname belongs to (/activities/3 → activities). Unknown paths return null. */
export const menuForPath = (pathname) => {
  const seg = pathname.split('/')[1];
  return ALL_MENUS.includes(seg) ? seg : null;
};
