/**
 * Feedback numbers for sessions and the whole activity.
 * `fb` is one entry of SESSION_FEEDBACK: { eligible, dist: [5★, 4★, 3★, 2★, 1★], criteria, recommend }.
 */

/** Below this many responses a breakdown could point at one person, so it is not shown. */
export const MIN_RESPONSES = 5;

export const responsesOf = (fb) => (fb ? fb.dist.reduce((s, n) => s + n, 0) : 0);

export function averageOf(fb) {
  const n = responsesOf(fb);
  if (!n) return null;
  const total = fb.dist.reduce((s, c, i) => s + c * (5 - i), 0);
  return total / n;
}

export const rateOf = (fb) => (fb && fb.eligible ? responsesOf(fb) / fb.eligible : null);

/** Overall satisfaction of an activity: the average of all session ratings, weighted by how many responded. */
export function overallOf(fbs) {
  const list = fbs.filter(Boolean);
  const n = list.reduce((s, f) => s + responsesOf(f), 0);
  if (!n) return null;
  const total = list.reduce((s, f) => s + f.dist.reduce((t, c, i) => t + c * (5 - i), 0), 0);
  return total / n;
}

export function distributionOf(fbs) {
  const out = [0, 0, 0, 0, 0];
  fbs.filter(Boolean).forEach((f) => f.dist.forEach((c, i) => { out[i] += c; }));
  return out;
}

export function criteriaOf(fbs) {
  const list = fbs.filter(Boolean);
  const n = list.reduce((s, f) => s + responsesOf(f), 0);
  if (!n) return null;
  const avg = (k) => list.reduce((s, f) => s + f.criteria[k] * responsesOf(f), 0) / n;
  return { content: avg('content'), speaker: avg('speaker'), venue: avg('venue') };
}

export function recommendOf(fbs) {
  const list = fbs.filter(Boolean);
  const n = list.reduce((s, f) => s + responsesOf(f), 0);
  return n ? list.reduce((s, f) => s + f.recommend * responsesOf(f), 0) / n : null;
}

export const CRITERIA_LABELS = { content: 'Relevance of content', speaker: 'Speaker clarity', venue: 'Venue and logistics' };

/** The strongest and weakest criterion of a session, for the "what stands out" notes. */
export function standouts(fb) {
  const entries = Object.entries(fb.criteria).sort((a, b) => b[1] - a[1]);
  return { best: entries[0], worst: entries[entries.length - 1] };
}
