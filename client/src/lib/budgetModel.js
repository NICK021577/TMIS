import { TODAY_ISO } from '../data/mockData';

export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_INDEX = Object.fromEntries(MONTH_NAMES.map((m, i) => [m.toLowerCase(), i]));
const pad = (n) => String(n).padStart(2, '0');

/** "June 17–19, 2025" → { start: "2025-06-17", end: "2025-06-19" } */
export function parseRange(text) {
  const m = /([A-Za-z]+)\s+(\d{1,2})(?:\s*[–-]\s*(?:([A-Za-z]+)\s+)?(\d{1,2}))?,\s*(\d{4})/.exec(text);
  if (!m) return { start: TODAY_ISO, end: TODAY_ISO };
  const [, mon, d1, mon2, d2, year] = m;
  const a = MONTH_INDEX[mon.toLowerCase()] ?? 0;
  const b = mon2 ? MONTH_INDEX[mon2.toLowerCase()] ?? a : a;
  return { start: `${year}-${pad(a + 1)}-${pad(d1)}`, end: `${year}-${pad(b + 1)}-${pad(d2 ?? d1)}` };
}

export function formatRange(start, end) {
  const s = new Date(`${start}T12:00:00`);
  const e = new Date(`${end}T12:00:00`);
  const sm = MONTH_NAMES[s.getMonth()];
  if (start === end) return `${sm} ${s.getDate()}, ${s.getFullYear()}`;
  if (s.getMonth() === e.getMonth()) return `${sm} ${s.getDate()}–${e.getDate()}, ${s.getFullYear()}`;
  return `${sm} ${s.getDate()} – ${MONTH_NAMES[e.getMonth()]} ${e.getDate()}, ${s.getFullYear()}`;
}

export const rangesOverlap = (a, b) => a.start <= b.end && b.start <= a.end;
export const estOf = (i) => i.qty * i.unit;

/** Calendar events = real activities + planned entries */
export function buildEvents(activities, plans, items, published) {
  const real = activities.map((a) => {
    const { start, end } = parseRange(a.date);
    const mine = items.filter((i) => i.activityId === a.id);
    return {
      key: `a${a.id}`, activityId: a.id, title: a.title, type: a.type, start, end, venue: a.venue,
      funding: mine[0]?.funding ?? 'GAA 2025',
      status: a.status === 'Draft' ? 'Planned' : a.status,
      published: a.status === 'Draft' ? false : !!published[`a${a.id}`],
      estimated: mine.reduce((s, i) => s + estOf(i), 0),
    };
  });
  const planned = plans.map((p) => ({
    key: `p${p.id}`, planId: p.id, title: p.title, type: p.type, start: p.start, end: p.end, venue: p.venue,
    funding: p.funding, status: 'Planned', published: !!published[`p${p.id}`], estimated: 0,
  }));
  return [...real, ...planned].sort((a, b) => a.start.localeCompare(b.start));
}

export function overlapsFor(event, events) {
  return events.filter((o) => o.key !== event.key && rangesOverlap(event, o));
}

/** Everything the annual budget, dashboard and cost report need, computed once */
export function useBudgetNumbers(activities, items, annual) {
  const rows = activities.map((a) => {
    const mine = items.filter((i) => i.activityId === a.id);
    const est = mine.reduce((s, i) => s + estOf(i), 0);
    const withActual = mine.filter((i) => i.actual != null);
    const act = withActual.reduce((s, i) => s + i.actual, 0);
    const { start } = parseRange(a.date);
    return { a, est, act, hasActual: withActual.length > 0, hasItems: mine.length > 0, month: Number(start.slice(5, 7)) - 1, funding: mine[0]?.funding ?? '—' };
  });
  const estimated = rows.reduce((s, r) => s + r.est, 0);
  const actual = rows.reduce((s, r) => s + r.act, 0);
  return { rows, estimated, actual, annual, remaining: annual - estimated };
}
