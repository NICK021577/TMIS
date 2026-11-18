/**
 * Badge — status shown as a small coloured dot + quiet text (like the reference UI).
 * Use variant="pill" for tags/chips that are not statuses.
 */
const DOT = {
  info:  'bg-brand-500',
  warn:  'bg-amber-400',
  ok:    'bg-emerald-400',
  muted: 'bg-ink-400',
  bad:   'bg-red-400',
};
const PILL = {
  info:  'bg-brand-100/80 text-brand-700',
  warn:  'bg-amber-100/80 text-amber-800',
  ok:    'bg-emerald-100/80 text-emerald-800',
  muted: 'bg-white/70 text-ink-600 ring-1 ring-black/5',
  bad:   'bg-red-100/80 text-danger',
};

const STATUS_TONE = {
  Ongoing: 'info', Upcoming: 'warn', Completed: 'ok', Draft: 'muted', Planned: 'muted',
  Present: 'ok', 'Not Yet Checked In': 'muted', 'Pending Sync': 'warn', 'Pending sync': 'warn', 'Checked in': 'ok', 'Checked out': 'info', 'Not yet': 'muted',
  Active: 'ok', Invited: 'info', Pending: 'warn', 'Under review': 'info', 'Needs info': 'warn',
  Approved: 'ok', Rejected: 'bad', Revoked: 'bad', 'Used up': 'muted', Expired: 'muted', Suspended: 'bad',
  Assigned: 'ok', Confirmed: 'ok', Partial: 'warn', Submitted: 'ok', Released: 'ok', Eligible: 'info',
  'Not eligible': 'muted', 'On track': 'ok', 'Within budget': 'ok', 'Over budget': 'bad', 'No budget': 'muted',
  Done: 'ok', Published: 'ok', Unpublished: 'muted',
};

export function Badge({ value, tone, variant = 'dot', className = '' }) {
  const t = tone ?? STATUS_TONE[value] ?? 'muted';
  if (variant === 'pill') {
    return (
      <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium leading-none ${PILL[t]} ${className}`}>
        {value}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-2 whitespace-nowrap text-xs text-ink-600 ${className}`}>
      <i className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${DOT[t]}`} />
      {value}
    </span>
  );
}
