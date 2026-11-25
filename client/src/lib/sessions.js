/**
 * Session times. A day can hold several sessions in the same AM or PM block (for example the same topic run in two
 * venues one after the other), so sessions are ordered by day, then AM before PM, then by start time.
 */

const pad = (n) => String(n).padStart(2, '0');

/** "8:30" with the block's AM/PM → "08:30" (24-hour). */
function to24(hm, period) {
  const [h, m] = hm.split(':').map(Number);
  const hour = period === 'PM' && h < 12 ? h + 12 : period === 'AM' && h === 12 ? 0 : h;
  return `${pad(hour)}:${pad(m)}`;
}

/** Start time as "HH:MM". Uses `start` when the session has it, otherwise reads it from the "8:30–10:30 AM" text. */
export function startOf(s) {
  if (s.start) return s.start;
  const m = /(\d{1,2}:\d{2})/.exec(s.time ?? '');
  return m ? to24(m[1], s.period) : '00:00';
}

/** End time as "HH:MM", the same way. The text's AM/PM suffix belongs to the end time. */
export function endOf(s) {
  if (s.end) return s.end;
  const m = /\d{1,2}:\d{2}\s*[–-]\s*(\d{1,2}:\d{2})\s*(AM|PM)?/.exec(s.time ?? '');
  return m ? to24(m[1], m[2] ?? s.period) : startOf(s);
}

export const sessionOrder = (a, b) => a.day - b.day || (a.period === b.period ? startOf(a).localeCompare(startOf(b)) : a.period === 'AM' ? -1 : 1);

/** "13:00" → "1:00 PM" */
export function to12(t) {
  const [h, m] = t.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${pad(m)} ${h >= 12 ? 'PM' : 'AM'}`;
}

/** "08:30", "10:30" → "8:30–10:30 AM" (one suffix when both times share it). */
export function timeText(start, end) {
  const [a, b] = [to12(start), to12(end)];
  return a.slice(-2) === b.slice(-2) ? `${a.replace(/ (AM|PM)$/, '')}–${b}` : `${a}–${b}`;
}
