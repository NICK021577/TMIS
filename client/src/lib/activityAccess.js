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

/**
 * A colour for each role in an activity, so the role legend, the staff list and the role picker read at a glance.
 * Green and amber are left out on purpose: the staff Status column already uses them (Assigned, Pending).
 */
const ROLE_TONES = {
  Committee:         { dot: 'bg-violet-500', card: 'bg-violet-50/80 ring-violet-200/70', title: 'text-violet-900', pill: 'bg-violet-100 text-violet-800 ring-violet-200', avatar: 'bg-violet-100 text-violet-700' },
  Facilitator:       { dot: 'bg-sky-500',    card: 'bg-sky-50/80 ring-sky-200/70',       title: 'text-sky-900',    pill: 'bg-sky-100 text-sky-800 ring-sky-200',          avatar: 'bg-sky-100 text-sky-700' },
  'Resource person': { dot: 'bg-rose-500',   card: 'bg-rose-50/80 ring-rose-200/70',     title: 'text-rose-900',   pill: 'bg-rose-100 text-rose-800 ring-rose-200',       avatar: 'bg-rose-100 text-rose-700' },
  'Support staff':   { dot: 'bg-teal-500',   card: 'bg-teal-50/80 ring-teal-200/70',     title: 'text-teal-900',   pill: 'bg-teal-100 text-teal-800 ring-teal-200',       avatar: 'bg-teal-100 text-teal-700' },
};
const NEUTRAL = { dot: 'bg-ink-400', card: 'bg-white/60 ring-black/5', title: 'text-ink-950', pill: 'bg-ink-100 text-ink-800 ring-ink-200', avatar: 'bg-ink-100 text-ink-700' };
export const roleTone = (role) => ROLE_TONES[role] ?? NEUTRAL;
