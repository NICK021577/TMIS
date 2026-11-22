/**
 * What a person can do inside ONE activity.
 *
 * The role they hold in that activity (set in its Staffing tab) decides it. Every module stays visible
 * to everyone who can open the activity; a role that cannot edit a module simply sees it read-only.
 *
 *   Agency Administrator / Super Admin   edit everything, in every activity
 *   Committee                             edit everything in this activity
 *   Facilitator                           run the activity: sessions, attendance, documents, outputs, feedback
 *   Resource person                       upload and remove materials on sessions; the rest read-only
 *   Support staff                         record attendance; the rest read-only
 *   not assigned                          read-only
 *
 * Levels per module: 'edit' (full), 'materials' (sessions tab, materials only), 'view' (read-only).
 */

export const TAB_IDS = ['overview', 'plan', 'sessions', 'staffing', 'participants', 'attendance', 'resources', 'budget', 'documents', 'outputs', 'feedback', 'reentry', 'certificates', 'report'];

const RANK = { Committee: 4, Facilitator: 3, 'Resource person': 2, 'Support staff': 1 };

const EDIT = {
  Committee: TAB_IDS,
  Facilitator: ['sessions', 'attendance', 'documents', 'outputs', 'feedback'],
  'Resource person': [],
  'Support staff': ['attendance'],
};
const MATERIALS = { 'Resource person': ['sessions'] };

const isFullAccess = (role) => role === 'Agency Administrator' || role === 'Super Admin';

/** The person's highest role among their assignments in this activity, or null when not assigned. */
export function activityRole(staffDays, email) {
  if (!email) return null;
  let best = null;
  staffDays.forEach((d) => d.staff.forEach((s) => {
    if (s.email === email && s.status !== 'Declined' && (RANK[s.role] ?? 0) > (RANK[best] ?? 0)) best = s.role;
  }));
  return best;
}

/** 'edit' | 'materials' | 'view' for one module. */
export function tabLevel(appRole, aRole, tab) {
  if (isFullAccess(appRole)) return 'edit';
  if (aRole && EDIT[aRole]?.includes(tab)) return 'edit';
  if (aRole && MATERIALS[aRole]?.includes(tab)) return 'materials';
  return 'view';
}

/** Plain-language summary of what a person can edit here, e.g. for the editing banner. */
export function editSummary(appRole, aRole) {
  if (isFullAccess(appRole) || aRole === 'Committee') return 'everything in this activity';
  const labels = { sessions: 'sessions', attendance: 'attendance', documents: 'documents', outputs: 'outputs', feedback: 'feedback' };
  const edit = (EDIT[aRole] ?? []).map((t) => labels[t]);
  const mat = MATERIALS[aRole] ? ['session materials'] : [];
  const all = [...mat, ...edit];
  return all.length ? all.join(', ') : 'nothing';
}

export const canEditAnything = (appRole, aRole) => TAB_IDS.some((t) => tabLevel(appRole, aRole, t) !== 'view');

export const ACTIVITY_ROLE_HELP = [
  ['Committee', 'Edits everything in this activity.'],
  ['Facilitator', 'Runs it: sessions, attendance, documents, outputs and feedback.'],
  ['Resource person', 'Uploads and removes materials on sessions. Everything else is read-only.'],
  ['Support staff', 'Records attendance. Everything else is read-only.'],
];
