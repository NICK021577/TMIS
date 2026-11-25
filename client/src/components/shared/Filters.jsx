import { Icon, Select } from '../ui';
import { activityLabel } from '../../lib/budgetModel';

/**
 * Filters shared by the Dashboard, Reports and Budget pages.
 *
 * PeriodFilter  "From [date] To [date]". Either side can be left empty. An activity counts when any of its days
 *               falls inside the period (see activityInRange in lib/budgetModel).
 * ActivityPicker one activity, or all. Activities that share a title (an agency often runs the same training
 *               again) show their dates beside the title so they can be told apart.
 */

const dateCls = 'glass-input h-9 rounded-full px-3 text-[13px] text-ink-800';

export function PeriodFilter({ from, to, onChange, className = '' }) {
  const bad = from && to && to < from;
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`} role="group" aria-label="Period">
      <label className="flex items-center gap-2 text-xs text-ink-500">
        From
        <input type="date" className={dateCls} value={from} max={to || undefined} onChange={(e) => onChange({ from: e.target.value, to })} aria-label="From date" />
      </label>
      <label className="flex items-center gap-2 text-xs text-ink-500">
        To
        <input type="date" className={dateCls} value={to} min={from || undefined} onChange={(e) => onChange({ from, to: e.target.value })} aria-label="To date" />
      </label>
      {(from || to) && (
        <button type="button" onClick={() => onChange({ from: '', to: '' })} className="inline-flex h-9 items-center gap-1 rounded-full px-2.5 text-xs text-ink-500 transition-colors hover:bg-white/60 hover:text-ink-950" aria-label="Clear the period">
          <Icon name="close" size={12} />Clear
        </button>
      )}
      {bad && <span className="text-xs text-danger">“To” is before “From”.</span>}
    </div>
  );
}

/** `value` is an activity id as a string, or 'all'. */
export function ActivityPicker({ activities, value, onChange, allLabel = 'All activities', className = '' }) {
  const sorted = [...activities].sort((a, b) => a.title.localeCompare(b.title) || a.date.localeCompare(b.date));
  return (
    <Select aria-label="Activity" className={`max-w-full sm:w-72 ${className}`} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="all">{allLabel}</option>
      {sorted.map((a) => <option key={a.id} value={String(a.id)}>{activityLabel(a, activities)}</option>)}
    </Select>
  );
}
