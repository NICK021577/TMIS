/**
 * Donut — one component for pie and donut charts (pure SVG, no library).
 * data: [{ label, value, color }]. `pie` fills the circle; otherwise a ring with `children` centred inside.
 */
export function Donut({ data, size = 190, thickness = 26, pie = false, children, label = 'Chart' }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const sw = pie ? size / 2 : thickness;
  const r = (size - sw) / 2;
  const C = 2 * Math.PI * r;
  const gap = !pie && data.filter((d) => d.value > 0).length > 1 ? 3 : 0;

  let acc = 0;
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(31,60,128,0.07)" strokeWidth={sw} />
        {total > 0 && data.map((d) => {
          const len = (d.value / total) * C;
          const seg = (
            <circle
              key={d.label}
              cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={d.color} strokeWidth={sw}
              strokeDasharray={`${Math.max(0, len - gap)} ${C - Math.max(0, len - gap)}`}
              strokeDashoffset={-acc}
              strokeLinecap="butt"
            >
              <title>{`${d.label}: ${d.value}`}</title>
            </circle>
          );
          acc += len;
          return seg;
        })}
      </svg>
      {children && <div className="absolute inset-0 grid place-content-center text-center">{children}</div>}
    </div>
  );
}

/** Legend row list that pairs with Donut. `format` renders the right-hand value. */
export function Legend({ data, format }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <ul className="space-y-2.5">
      {data.map((d) => (
        <li key={d.label} className="flex items-center gap-2.5 text-xs">
          <i className="h-2.5 w-2.5 flex-shrink-0 rounded-sm" style={{ background: d.color }} />
          <span className="flex-1 truncate text-ink-600">{d.label}</span>
          <span className="w-9 text-right tabular-nums text-ink-500">{Math.round((d.value / total) * 100)}%</span>
          <strong className="w-[84px] text-right font-medium tabular-nums text-ink-950">{format ? format(d.value) : d.value}</strong>
        </li>
      ))}
    </ul>
  );
}

const niceCeil = (v) => {
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
};

/**
 * BarChart — the one bar chart used everywhere (dashboard performance, budget spending).
 * data: [{ label, <seriesKey>: number }]; series: [{ key, label, color }].
 * Same axis, gridlines and rounded bars on every page. `highlightLast` emphasises the current period.
 */
export function BarChart({ data, series, height = 220, format = (v) => v, showValues = false, highlightLast = false }) {
  const max = Math.max(1, ...data.flatMap((d) => series.map((s) => d[s.key] || 0)));
  const top = niceCeil(max);
  const ticks = [top, top / 2, 0];
  const single = series.length === 1;

  return (
    <div className="flex gap-3" role="img" aria-label="Bar chart">
      <div className="flex flex-col justify-between pb-7 text-right text-[10px] tabular-nums text-ink-400" style={{ height }} aria-hidden="true">
        {ticks.map((t) => <span key={t}>{format(t)}</span>)}
      </div>
      <div className="relative min-w-0 flex-1" style={{ height }}>
        <div className="absolute inset-x-0 top-0 bottom-7" aria-hidden="true">
          <div className="absolute inset-x-0 top-0 border-t border-dashed border-[var(--glass-divider)]" />
          <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-[var(--glass-divider)]" />
          <div className="absolute inset-x-0 bottom-0 border-t border-[var(--glass-divider)]" />
        </div>
        <div className="absolute inset-0 flex">
          {data.map((d, i) => {
            const last = i === data.length - 1;
            return (
              <div key={d.label} className="flex h-full flex-1 flex-col items-center">
                <div className="flex min-h-0 w-full flex-1 items-end justify-center gap-1">
                  {series.map((s) => {
                    const v = d[s.key] || 0;
                    const dim = single && highlightLast && !last;
                    return (
                      <div key={s.key} className="flex h-full flex-col items-center justify-end" style={{ width: single ? '56%' : '30%', maxWidth: single ? 40 : 18 }}>
                        {showValues && <span className="mb-1 text-[11px] tabular-nums text-ink-500">{format(v)}</span>}
                        <div
                          className="w-full rounded-t-lg"
                          style={{ height: `${(v / top) * 100}%`, background: dim ? 'var(--color-brand-200)' : s.color, opacity: dim ? 0.9 : 1 }}
                          title={`${d.label} · ${s.label}: ${format(v)}`}
                        />
                      </div>
                    );
                  })}
                </div>
                <small className="flex h-7 items-center text-[11px] text-ink-500">{d.label}</small>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** MeterRow — label, bar, value on one line. Used for every "share of" / "score of" list. */
export function MeterRow({ label, value, display, tone = 'brand', labelWidth = 150 }) {
  const tones = { brand: 'bg-brand-500', ok: 'bg-emerald-400', amber: 'bg-amber-400' };
  return (
    <li className="grid items-center gap-3 text-[13px]" style={{ gridTemplateColumns: `${labelWidth}px minmax(0,1fr) 52px` }}>
      <span className="truncate text-ink-600">{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-brand-900/[0.07]">
        <div className={`h-full rounded-full ${tones[tone]}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
      <strong className="text-right font-medium tabular-nums text-ink-950">{display ?? `${Math.round(value)}%`}</strong>
    </li>
  );
}
