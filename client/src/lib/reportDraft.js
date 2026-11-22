/**
 * After-activity report: the facts a draft is built from, and the draft itself.
 *
 *   buildSnapshot()  collects totals only (no participant names or contact details). This is exactly
 *                    what is sent to the AI service, and it is stored with the version for the audit trail.
 *   draftSections()  turns a snapshot into the report sections. TODAY it fills fixed templates with the
 *                    real numbers; the AI service replaces this one function later and returns the same shape.
 */
import { estOf } from './budgetModel';
import {
  CRITERIA_LABELS, averageOf, criteriaOf, overallOf, rateOf, recommendOf, responsesOf,
} from './feedbackStats';
import { CERT_ROWS, OUTPUTS, OUTPUT_SUBMISSIONS, REENTRY, SESSION_FEEDBACK } from '../data/workspaceData';

export const SECTION_DEFS = [
  { id: 'summary',         title: 'Executive summary',            source: 'All data below' },
  { id: 'objectives',      title: 'Objectives and outcomes',      source: 'Plan: objectives, expected outcomes' },
  { id: 'delivery',        title: 'Delivery and attendance',      source: 'Sessions, attendance' },
  { id: 'feedback',        title: 'Participant feedback',         source: 'Feedback: session ratings' },
  { id: 'budget',          title: 'Budget and expenses',          source: 'Budget: estimates, actual costs' },
  { id: 'outputs',         title: 'Outputs and follow-up',        source: 'Outputs, reentry plans' },
  { id: 'recommendations', title: 'Challenges and recommendations', source: 'Feedback, budget, delivery' },
];

const peso = (n) => `₱${Math.round(n).toLocaleString('en-PH')}`;
const f1 = (n) => (n == null ? '—' : n.toFixed(1));
const num = (v) => Number.parseInt(String(v), 10) || 0;
const list = (xs) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

/** Totals for one activity. Nothing here identifies a participant. */
export function buildSnapshot({ activity, details, sessions, items }) {
  const rated = sessions.map((s) => ({ s, fb: SESSION_FEEDBACK[s.id] ?? null })).filter((r) => r.fb);
  const fbs = rated.map((r) => r.fb);
  const ranked = [...rated].sort((a, b) => averageOf(b.fb) - averageOf(a.fb));

  const mine = items.filter((i) => i.activityId === activity.id);
  const estimated = mine.reduce((s, i) => s + estOf(i), 0);
  const withActual = mine.filter((i) => i.actual != null);
  const actual = withActual.reduce((s, i) => s + i.actual, 0);
  const comparable = withActual.reduce((s, i) => s + estOf(i), 0);

  const attended = CERT_ROWS.reduce((s, r) => s + num(r.attended.split(' of ')[0]), 0);
  const possible = CERT_ROWS.reduce((s, r) => s + num(r.attended.split(' of ')[1]), 0);
  const trained = OUTPUTS.find((o) => o.output === 'Participants trained');

  const byType = OUTPUT_SUBMISSIONS.reduce((m, o) => ({ ...m, [o.type]: (m[o.type] ?? 0) + 1 }), {});

  return {
    activity: { title: activity.title, type: activity.type, dates: activity.date, venue: activity.venue, status: activity.status },
    objectives: details.objectives ?? [],
    outcomes: details.outcomes ?? [],
    sessions: {
      total: sessions.length,
      held: sessions.filter((s) => s.status === 'Completed').length,
      ongoing: sessions.filter((s) => s.status === 'Ongoing').length,
      days: new Set(sessions.map((s) => s.day)).size,
    },
    participants: {
      planned: num(trained?.planned), trained: num(trained?.conducted),
      attendanceRate: possible ? attended / possible : null,
    },
    feedback: {
      sessionsRated: rated.length,
      overall: overallOf(fbs),
      responses: fbs.reduce((s, f) => s + responsesOf(f), 0),
      eligible: fbs.reduce((s, f) => s + f.eligible, 0),
      recommend: recommendOf(fbs),
      criteria: criteriaOf(fbs),
      best: ranked[0] ? { title: ranked[0].s.title, rating: averageOf(ranked[0].fb) } : null,
      lowest: ranked.length > 1 ? { title: ranked[ranked.length - 1].s.title, rating: averageOf(ranked[ranked.length - 1].fb) } : null,
    },
    budget: {
      lines: mine.length, recordedLines: withActual.length, estimated, actual,
      difference: actual - comparable,
    },
    outputs: {
      submissions: OUTPUT_SUBMISSIONS.length, byType,
      reentrySubmitted: REENTRY.filter((r) => r.status === 'Submitted').length,
      reentryPending: REENTRY.filter((r) => r.status === 'Pending').length,
    },
  };
}

/** What the draft will be based on, as short readable rows (also shown to the person before generating). */
export function snapshotFacts(sn) {
  return [
    ['Activity', `${sn.activity.title}, ${sn.activity.dates}`],
    ['Objectives and outcomes', `${sn.objectives.length} objectives, ${sn.outcomes.length} expected outcomes`],
    ['Sessions', `${sn.sessions.held} held${sn.sessions.ongoing ? `, ${sn.sessions.ongoing} ongoing` : ''}, of ${sn.sessions.total} over ${sn.sessions.days} days`],
    ['Participants', `${sn.participants.trained} trained of ${sn.participants.planned} planned, attendance ${sn.participants.attendanceRate == null ? '—' : `${Math.round(sn.participants.attendanceRate * 100)}%`}`],
    ['Feedback', sn.feedback.overall == null ? 'No feedback yet' : `${f1(sn.feedback.overall)} / 5 from ${sn.feedback.responses} answers across ${sn.feedback.sessionsRated} sessions`],
    ['Budget', sn.budget.lines ? `${peso(sn.budget.estimated)} planned, ${sn.budget.recordedLines ? `${peso(sn.budget.actual)} spent on ${sn.budget.recordedLines} of ${sn.budget.lines} lines` : 'no actual costs recorded'}` : 'No budget lines'],
    ['Outputs', `${sn.outputs.submissions} uploads, ${sn.outputs.reentrySubmitted} reentry plans submitted, ${sn.outputs.reentryPending} pending`],
  ];
}

/** Things worth fixing before generating, so the draft is not built on empty data. */
export function readinessNotes(sn) {
  const notes = [];
  if (sn.activity.status !== 'Completed') notes.push(`The activity is still “${sn.activity.status}”. The draft will describe it as in progress.`);
  if (sn.sessions.held < sn.sessions.total) notes.push(`${sn.sessions.total - sn.sessions.held} of ${sn.sessions.total} sessions have not finished.`);
  if (sn.feedback.sessionsRated < sn.sessions.total) notes.push(`Feedback exists for ${sn.feedback.sessionsRated} of ${sn.sessions.total} sessions.`);
  if (sn.budget.lines && sn.budget.recordedLines < sn.budget.lines) notes.push(`Actual costs are recorded for ${sn.budget.recordedLines} of ${sn.budget.lines} budget lines.`);
  if (sn.outputs.reentryPending) notes.push(`${sn.outputs.reentryPending} reentry plan${sn.outputs.reentryPending === 1 ? ' is' : 's are'} still pending.`);
  return notes;
}

/** Draft text for every section. */
export function draftSections(sn) {
  const a = sn.activity;
  const fb = sn.feedback;
  const b = sn.budget;
  const att = sn.participants.attendanceRate;
  const done = a.status === 'Completed';

  const text = {
    summary:
      `${a.title} is a ${String(a.type).toLowerCase()} held ${a.dates} at ${a.venue}. ` +
      `${sn.participants.trained} of ${sn.participants.planned} planned participants were trained over ${sn.sessions.days} days` +
      `${att == null ? '' : `, with an average attendance of ${Math.round(att * 100)}%`}. ` +
      (fb.overall == null ? 'Participant feedback has not been collected yet.' : `Participants rated the activity ${f1(fb.overall)} out of 5 overall, and ${Math.round(fb.recommend)}% would recommend it. `) +
      (b.recordedLines ? `Actual expenses came to ${peso(b.actual)} against a plan of ${peso(b.estimated)}.` : ''),
    objectives:
      `The activity set out to: ${list(sn.objectives.map((o) => o.replace(/\.$/, '').replace(/^./, (c) => c.toLowerCase())))}. ` +
      `It expected the following outcomes: ${list(sn.outcomes.map((o) => o.replace(/\.$/, '').replace(/^./, (c) => c.toLowerCase())))}. ` +
      `${done ? 'Progress against these is described in the sections that follow.' : 'Results against these will be confirmed once the activity ends.'}`,
    delivery:
      `${sn.sessions.held} of ${sn.sessions.total} sessions were held${sn.sessions.ongoing ? `, with ${sn.sessions.ongoing} under way` : ''}. ` +
      `${sn.participants.trained} participants attended${att == null ? '' : `, attending ${Math.round(att * 100)}% of the days on average`}.`,
    feedback: fb.overall == null
      ? 'No participant feedback has been recorded yet.'
      : `${fb.responses} answers were collected across ${fb.sessionsRated} sessions (${Math.round((fb.responses / fb.eligible) * 100)}% response rate). ` +
        `The overall satisfaction was ${f1(fb.overall)} out of 5. ` +
        `By criteria, ${CRITERIA_LABELS.content.toLowerCase()} scored ${f1(fb.criteria.content)}, ${CRITERIA_LABELS.speaker.toLowerCase()} ${f1(fb.criteria.speaker)} and ${CRITERIA_LABELS.venue.toLowerCase()} ${f1(fb.criteria.venue)}. ` +
        (fb.best ? `The highest-rated session was “${fb.best.title}” (${f1(fb.best.rating)})` : '') +
        (fb.lowest ? ` and the lowest was “${fb.lowest.title}” (${f1(fb.lowest.rating)}).` : '.'),
    budget: b.lines
      ? `The approved plan was ${peso(b.estimated)} across ${b.lines} budget lines. ` +
        (b.recordedLines
          ? `Actual expenses of ${peso(b.actual)} were recorded for ${b.recordedLines} lines, ${b.difference === 0 ? 'matching the estimate for those lines' : `${peso(Math.abs(b.difference))} ${b.difference > 0 ? 'over' : 'under'} the estimate for those lines`}.`
          : 'No actual expenses have been recorded yet.')
      : 'No budget lines have been entered for this activity.',
    outputs:
      `Participants submitted ${sn.outputs.submissions} outputs (${Object.entries(sn.outputs.byType).map(([k, v]) => `${v} ${k.toLowerCase()}${v === 1 ? '' : 's'}`).join(', ')}). ` +
      `${sn.outputs.reentrySubmitted} reentry plan${sn.outputs.reentrySubmitted === 1 ? ' was' : 's were'} submitted and ${sn.outputs.reentryPending} ${sn.outputs.reentryPending === 1 ? 'is' : 'are'} still pending.`,
    recommendations: [
      fb.criteria && fb.criteria.venue < fb.criteria.content ? `Improve venue and logistics, which scored lowest (${f1(fb.criteria.venue)}). Check room comfort and sound before each session.` : null,
      fb.lowest && fb.best && fb.best.rating - fb.lowest.rating >= 0.3 ? `Share what worked in “${fb.best.title}” with the facilitators of “${fb.lowest.title}”.` : null,
      sn.outputs.reentryPending ? `Follow up the ${sn.outputs.reentryPending} pending reentry plan${sn.outputs.reentryPending === 1 ? '' : 's'} before certificates are released.` : null,
      b.lines && b.recordedLines < b.lines ? 'Record the remaining actual costs so the final expense report is complete.' : null,
      'Provide printed handouts of the session materials for participants to take home.',
    ].filter(Boolean).map((t, i) => `${i + 1}. ${t}`).join('\n'),
  };
  return SECTION_DEFS.map((d) => ({ id: d.id, title: d.title, source: d.source, text: text[d.id], edited: false }));
}

/** The whole report as plain text or Word-readable HTML. */
export const reportText = (title, sections) =>
  [title, '', ...sections.flatMap((s) => [s.title.toUpperCase(), s.text, ''])].join('\n');

export const reportHtml = (title, sections) =>
  `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${title}</title></head><body style="font-family:Calibri,Arial,sans-serif;font-size:11pt">` +
  `<h1 style="font-size:18pt">${title}</h1>` +
  sections.map((s) => `<h2 style="font-size:13pt;margin-top:16pt">${s.title}</h2>${s.text.split('\n').map((p) => `<p>${p.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</p>`).join('')}`).join('') +
  '</body></html>';
