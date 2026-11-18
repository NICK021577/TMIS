import { AGENCY_ROLES } from '../data/workspaceData';

/** Document types an activity needs before it runs. Uploading one of these in the Documents tab counts. */
export const REQUIRED_DOC_TYPES = ['Memo', 'Agreement', 'Signed attendance sheet', 'Certificate'];

const pct = (done, total) => (total ? done / total : 0);

/**
 * computeReadiness — one score from every module of the activity.
 * Each check is worth the same. It updates as sessions, staff, resources, documents,
 * budget lines and feedback forms are added, so it always matches what the tabs show.
 */
export function computeReadiness({ activity, details, sessions, staffDays, resources, documents, items, feedbackForms }) {
  const mine = items.filter((i) => i.activityId === activity.id);

  // objectives written, outcomes written, program flow attached, and this agency implementing
  const planDone = [details.objectives.length > 0, details.outcomes.length > 0, !!details.programFlow, AGENCY_ROLES.some((r) => r.role === 'Implementing')].filter(Boolean).length;

  // A session is ready when it has a resource person, a venue and at least one material.
  const readySessions = sessions.filter((s) => s.speaker?.trim() && s.room?.trim() && s.files > 0).length;

  // A day is staffed when someone is assigned, a facilitator is among them, and nobody is still pending.
  const staffedDays = staffDays.filter((d) => d.staff.length && d.staff.some((s) => s.role === 'Facilitator') && d.staff.every((s) => s.status === 'Assigned')).length;

  const confirmed = resources.filter((r) => r.status === 'Confirmed').length;

  const haveDocs = REQUIRED_DOC_TYPES.filter((t) => documents.some((d) => d.type === t)).length;

  const daysWithForm = staffDays.filter((d) => feedbackForms.some((f) => f.day === d.n && f.questions.length > 0)).length;

  const slots = Math.min(activity.participants, activity.capacity);

  const checks = [
    { id: 'plan',         tab: 'plan',         label: 'Plan and agencies',    done: planDone,      total: 4,                    value: `${planDone} of 4` },
    { id: 'sessions',     tab: 'sessions',     label: 'Sessions ready',       done: readySessions, total: sessions.length,      value: `${readySessions} of ${sessions.length}` },
    { id: 'staffing',     tab: 'staffing',     label: 'Days fully staffed',   done: staffedDays,   total: staffDays.length,     value: `${staffedDays} of ${staffDays.length}` },
    { id: 'participants', tab: 'participants', label: 'Participant slots',    done: slots,         total: activity.capacity,    value: `${slots} of ${activity.capacity}` },
    { id: 'resources',    tab: 'resources',    label: 'Resources confirmed',  done: confirmed,     total: resources.length,     value: `${confirmed} of ${resources.length}` },
    { id: 'budget',       tab: 'budget',       label: 'Budget allocated',     done: mine.length ? 1 : 0, total: 1,              value: mine.length ? `${mine.length} line${mine.length === 1 ? '' : 's'}` : 'None yet' },
    { id: 'documents',    tab: 'documents',    label: 'Required documents',   done: haveDocs,      total: REQUIRED_DOC_TYPES.length, value: `${haveDocs} of ${REQUIRED_DOC_TYPES.length}` },
    { id: 'feedback',     tab: 'feedback',     label: 'Feedback forms',       done: daysWithForm,  total: staffDays.length,     value: `${daysWithForm} of ${staffDays.length} days` },
  ].map((c) => ({ ...c, fraction: pct(c.done, c.total), ok: c.total > 0 && c.done >= c.total }));

  const percent = Math.round((checks.reduce((s, c) => s + c.fraction, 0) / checks.length) * 100);
  return { checks, percent };
}
