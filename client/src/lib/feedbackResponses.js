import { FEEDBACK_COMMENTS, SESSION_FEEDBACK } from '../data/workspaceData';
import { sessionOrder } from './sessions';

/**
 * Sample anonymous feedback responses, one per participant per session, built from SESSION_FEEDBACK so the
 * Responses table agrees with the Summary numbers. Answers are keyed by question id of the day's feedback form
 * (the standard form uses ids 1–9). No participant names are kept: a response is only a number.
 *
 * When the server is connected this is replaced by the real answers from the mobile app.
 */

const USEFUL = [
  'The hands-on demonstration', 'Seeing the actual tools used', 'The Q&A with the resource person',
  'Clone selection guide', 'Computing the cost and income per hectare', 'Group activity with other farmers',
  'Latex grading samples', 'The handouts', 'Field visit', 'Tips on keeping records',
];
const IMPROVE = [
  'More time for practice', 'Bigger screen for the slides', 'Start on time', 'Printed copies of the slides',
  'Add a session on marketing', 'Microphone for the speaker', 'More water during the field visit', 'Shorter lunch break',
];

const TAGS_UP = ['Clear', 'Engaging', 'Practical'];
const TAGS_DOWN = ['Too fast', 'Too long'];

function rng(seed) {
  let h = (seed * 2654435761) >>> 0 || 1;
  return () => { h = (h * 1103515245 + 12345) >>> 0; return (h >>> 8) / 16777216; };
}

const clamp = (v) => Math.min(5, Math.max(1, v));

export function buildResponses(sessions) {
  const out = [];
  [...sessions].sort(sessionOrder).forEach((s) => {
    const fb = SESSION_FEEDBACK[s.id];
    if (!fb) return;
    const r = rng(s.id);
    const pick = (list) => list[Math.floor(r() * list.length)];
    const overalls = fb.dist.flatMap((c, i) => Array(c).fill(5 - i));        // already highest first
    const avg = overalls.reduce((a, b) => a + b, 0) / overalls.length;
    const yes = Math.round((overalls.length * fb.recommend) / 100);
    const comments = FEEDBACK_COMMENTS.filter((c) => c.session === s.title);
    const used = new Set();

    const rows = overalls.map((o, k) => {
      const near = (v) => clamp(Math.round(v + (o - avg) * 0.6 + (r() - 0.5) * 1.1));
      // would recommend → 9 or 10, unsure → 7 or 8, otherwise 4 to 6 (0–10 scale)
      const promoter = k < yes;
      const recommend = promoter ? 9 + (r() < 0.6 ? 1 : 0) : r() < 0.7 ? 7 + Math.floor(r() * 2) : 4 + Math.floor(r() * 3);
      const up = o >= 4 || r() < 0.3;
      const tags = (up ? TAGS_UP : TAGS_DOWN).filter(() => r() < 0.35);
      const answers = {
        1: o, 2: near(fb.criteria.content), 3: near(fb.criteria.speaker), 4: near(fb.criteria.venue),
        8: r() < 0.85 ? near(avg) : '',
        9: r() < 0.9 ? { up, tags } : '',
        5: recommend,
        6: r() < 0.5 ? pick(USEFUL) : '',
        7: r() < 0.4 ? pick(IMPROVE) : '',
      };
      const c = comments.find((x) => x.rating === o && !used.has(x.id));
      if (c) { used.add(c.id); answers[o >= 5 ? 6 : 7] = c.comment; }
      const minute = 5 + Math.floor(r() * 50);
      return { sessionId: s.id, day: s.day, submitted: `${s.date}, ${s.period === 'AM' ? '11' : '4'}:${String(minute).padStart(2, '0')} ${s.period}`, answers };
    });
    // shuffle so the table is not sorted by rating
    for (let i = rows.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [rows[i], rows[j]] = [rows[j], rows[i]]; }
    rows.sort((a, b) => a.submitted.localeCompare(b.submitted));
    out.push(...rows);
  });
  return out.map((x, i) => ({ ...x, id: i + 1 }));
}
