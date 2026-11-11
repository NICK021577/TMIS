/**
 * Badge — colored pill for activity/attendance statuses
 */

const statusMap = {
  // Activity statuses
  'Upcoming':  'bg-amber-100  text-yellow-800',
  'Ongoing':   'bg-blue-100   text-blue-600',
  'Completed': 'bg-green-100  text-green-700',
  'Draft':     'bg-[#edf0ee]  text-ink-600',
  'Planned':   'bg-violet-100 text-violet-700',

  // Attendance statuses
  'Present':              'bg-green-100 text-green-700',
  'Not Yet Checked In':   'bg-[#edf0ee] text-ink-600',
  'Pending Sync':         'bg-amber-100 text-yellow-800',

  // Invitation statuses
  'Active':   'bg-green-100 text-green-700',
  'Revoked':  'bg-red-100   text-danger',
  'Used up':  'bg-[#edf0ee] text-ink-500',
  'Expired':  'bg-[#edf0ee] text-ink-500',

  // Generic
  'default':  'bg-[#edf0ee] text-ink-600',
};

export function Badge({ value, className = '' }) {
  const style = statusMap[value] ?? statusMap['default'];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold leading-none ${style} ${className}`}
    >
      {value}
    </span>
  );
}
