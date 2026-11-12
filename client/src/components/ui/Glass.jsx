import { Icon } from './Icon';

/**
 * Shared glass building blocks.
 * Look: white frosted cards, 12–13px slate text, light weights, grey section labels,
 * pill controls. One primary focus per screen; everything else stays quiet.
 */

export function Panel({ children, className = '', pad = true }) {
  return (
    <section className={`glass-panel rounded-[18px] ${pad ? 'p-5' : ''} ${className}`}>
      {children}
    </section>
  );
}

export function PanelTitle({ title, subtitle, children }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-sm font-medium text-ink-950">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-ink-500">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-shrink-0 items-center gap-2">{children}</div>}
    </div>
  );
}

/** Summary figure. Quiet: grey label, medium-weight number. */
export function Metric({ label, value, note, tone = 'default', icon }) {
  const tones = { default: 'text-ink-950', brand: 'text-brand-700', warn: 'text-amber-700', bad: 'text-danger' };
  return (
    <div className="glass-panel rounded-[18px] p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-500">{label}</span>
        {icon && <Icon name={icon} size={15} className="text-ink-400" />}
      </div>
      <strong className={`mt-1.5 block text-[24px] font-medium leading-none tracking-[-0.5px] ${tones[tone]}`}>{value}</strong>
      {note && <small className="mt-2 block text-xs text-ink-500">{note}</small>}
    </div>
  );
}

export function Select({ children, className = '', ...props }) {
  return (
    <select {...props} className={`glass-input h-9 rounded-full px-3.5 text-[13px] text-ink-800 ${className}`}>
      {children}
    </select>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <label className={`glass-input flex h-9 items-center gap-2 rounded-full px-3.5 text-ink-500 ${className}`}>
      <Icon name="search" size={14} />
      <span className="sr-only">{placeholder}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[13px] text-ink-950 outline-none placeholder:text-ink-400"
      />
    </label>
  );
}

/** Underline tabs (blue underline on the active one), like the reference header */
export function Tabs({ tabs, value, onChange, className = '' }) {
  return (
    <div role="tablist" className={`no-scrollbar mb-5 flex gap-6 overflow-x-auto border-b border-[var(--glass-divider)] ${className}`}>
      {tabs.map((t) => {
        const id = typeof t === 'string' ? t : t.id;
        const label = typeof t === 'string' ? t : t.label;
        const active = id === value;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(id)}
            className={`relative -mb-px whitespace-nowrap pb-2.5 text-[13px] transition-colors ${
              active ? 'font-medium text-brand-700' : 'text-ink-500 hover:text-ink-950'
            }`}
          >
            {label}
            {active && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand-600" />}
          </button>
        );
      })}
    </div>
  );
}

export function ProgressBar({ value, tone = 'brand', className = '' }) {
  const tones = { brand: 'bg-brand-500', amber: 'bg-amber-400', ok: 'bg-emerald-400', bad: 'bg-red-400' };
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-brand-900/[0.07] ${className}`}>
      <div className={`h-full rounded-full ${tones[tone]}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

/** Table: columns = [{ key, label, className, render }] — calm header, soft row dividers */
export function DataTable({ columns, rows, onRowClick, empty = 'Nothing to show yet.', footer }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] border-collapse text-left">
        <thead>
          <tr className="border-b border-[var(--glass-divider)]">
            {columns.map((c) => (
              <th key={c.key} className={`px-5 py-2.5 text-xs font-normal text-ink-500 ${c.className ?? ''}`}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id ?? row.name ?? i}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`border-b border-[var(--glass-divider)] transition-colors last:border-0 hover:bg-white/50 ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((c) => (
                <td key={c.key} className={`px-5 py-3 align-middle text-[13px] text-ink-800 ${c.className ?? ''}`}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {footer && <tfoot>{footer}</tfoot>}
      </table>
      {!rows.length && (
        <div className="grid place-items-center gap-1 px-6 py-12 text-center">
          <Icon name="search" size={20} className="text-ink-400" />
          <strong className="text-[13px] font-medium text-ink-800">No results</strong>
          <span className="text-xs text-ink-500">{empty}</span>
        </div>
      )}
    </div>
  );
}

/** Two-line cell: title + muted subtitle */
export function Cell({ title, sub }) {
  return (
    <div className="min-w-0">
      <strong className="block truncate text-[13px] font-medium text-ink-950">{title}</strong>
      {sub && <span className="block truncate text-xs text-ink-500">{sub}</span>}
    </div>
  );
}

/** Label + control wrapper for forms */
export function Field({ label, hint, children, className = '' }) {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      <span className="text-xs text-ink-600">{label}</span>
      {children}
      {hint && <small className="block text-[11px] text-ink-400">{hint}</small>}
    </label>
  );
}
export const inputCls = 'glass-input h-10 w-full rounded-xl px-3.5 text-[13px] text-ink-950 placeholder:text-ink-400';
export const textareaCls = 'glass-input w-full rounded-xl px-3.5 py-2.5 text-[13px] text-ink-950 placeholder:text-ink-400';

/** Toggle switch */
export function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-10 flex-shrink-0 rounded-full transition-colors ${checked ? 'bg-brand-600' : 'bg-ink-400/40'}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[18px]' : 'left-0.5'}`} />
    </button>
  );
}

/** Soft info / warning / ok callout */
export function Callout({ tone = 'info', icon = 'alert', children }) {
  const tones = {
    info: 'bg-brand-100/60 text-brand-900',
    warn: 'bg-amber-100/70 text-amber-900',
    ok:   'bg-emerald-100/70 text-emerald-900',
    bad:  'bg-red-100/70 text-red-900',
  };
  return (
    <div className={`flex gap-3 rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${tones[tone]}`}>
      <Icon name={icon} size={16} className="mt-0.5 flex-shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
