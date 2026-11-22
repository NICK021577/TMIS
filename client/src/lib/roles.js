/** What a role can see. The values are what the server stores (agency_role.data_access). */
export const ACCESS_OPTIONS = [
  { value: 'all_records',         label: 'All agency records' },
  { value: 'assigned_activities', label: 'Assigned activities' },
  { value: 'assigned_sessions',   label: 'Assigned sessions' },
];
export const accessLabel = (value) => ACCESS_OPTIONS.find((o) => o.value === value)?.label ?? value;

/** "June 12, 2025" from a server timestamp. */
export const niceDate = (iso) => (iso ? new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—');
