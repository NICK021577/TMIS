import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../ui';
import { useStore } from '../../hooks/useStore';

const PAGES = [
  { label: 'Dashboard', to: '/dashboard', icon: 'grid' },
  { label: 'Calendar', to: '/calendar', icon: 'calendar' },
  { label: 'Activities', to: '/activities', icon: 'clock' },
  { label: 'Participants', to: '/participants', icon: 'users' },
  { label: 'Budget', to: '/budget', icon: 'award' },
  { label: 'Reports', to: '/reports', icon: 'chart' },
  { label: 'Messaging', to: '/messaging', icon: 'message' },
  { label: 'About agency', to: '/about', icon: 'building' },
  { label: 'Agency settings', to: '/settings', icon: 'settings' },
];

/** SearchModal — search pages, activities and participants. Opens from the header or Ctrl/⌘ + K. */
export default function SearchModal({ onClose }) {
  const navigate = useNavigate();
  const { activities, people } = useStore();
  const [q, setQ] = useState('');
  const [i, setI] = useState(0);
  const list = useRef(null);

  const groups = useMemo(() => {
    const t = q.trim().toLowerCase();
    const has = (s) => s.toLowerCase().includes(t);
    return [
      { name: 'Pages', rows: PAGES.filter((p) => !t || has(p.label)).map((p) => ({ ...p, sub: 'Page' })) },
      { name: 'Activities', rows: t ? activities.filter((a) => has(a.title) || has(a.type)).map((a) => ({ label: a.title, sub: `${a.type} · ${a.status}`, to: `/activities/${a.id}`, icon: 'clock' })) : [] },
      { name: 'Participants', rows: t ? people.filter((p) => has(p.name || '') || has(p.email) || has(p.agency)).map((p) => ({ label: p.name || p.email, sub: p.agency || p.category, to: '/participants', icon: 'users' })) : [] },
    ].filter((g) => g.rows.length);
  }, [q, activities, people]);
  const flat = groups.flatMap((g) => g.rows);

  const go = (row) => { onClose(); navigate(row.to); };

  useEffect(() => {
    const onEsc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);
  useEffect(() => { setI(0); }, [q]);
  useEffect(() => {
    list.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [i]);

  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setI((n) => Math.min(flat.length - 1, n + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setI((n) => Math.max(0, n - 1)); }
    else if (e.key === 'Enter' && flat[i]) go(flat[i]);
  };

  let index = -1;
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]" onKeyDown={onKey}>
      <div className="glass-backdrop absolute inset-0 animate-fade-in" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label="Search" className="glass-strong relative w-full max-w-[560px] animate-rise overflow-hidden rounded-[22px]">
        <label className="flex items-center gap-3 border-b border-[var(--glass-divider)] px-5 py-4 text-ink-500">
          <Icon name="search" size={18} />
          <span className="sr-only">Search</span>
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search pages, activities and participants…" className="min-w-0 flex-1 bg-transparent text-[14px] text-ink-950 outline-none placeholder:text-ink-400" />
          <kbd className="rounded-md bg-white/80 px-1.5 py-0.5 text-[10px] text-ink-500 ring-1 ring-black/5">Esc</kbd>
        </label>
        <div ref={list} className="max-h-[360px] overflow-y-auto p-2">
          {groups.length ? groups.map((g) => (
            <div key={g.name} className="mb-1">
              <p className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-ink-500">{g.name}</p>
              {g.rows.map((r) => {
                index += 1;
                const active = index === i;
                const mine = index;
                return (
                  <button key={`${g.name}-${r.label}-${r.to}`} data-active={active} onMouseEnter={() => setI(mine)} onClick={() => go(r)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${active ? 'bg-white/85 shadow-sm' : ''}`}>
                    <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-brand-100/70 text-brand-700"><Icon name={r.icon} size={15} /></span>
                    <span className="min-w-0 flex-1"><strong className="block truncate text-[13px] font-medium text-ink-950">{r.label}</strong><small className="block truncate text-xs text-ink-500">{r.sub}</small></span>
                    {active && <Icon name="arrow" size={14} className="text-ink-400" />}
                  </button>
                );
              })}
            </div>
          )) : <p className="px-4 py-10 text-center text-[13px] text-ink-500">No results for “{q}”.</p>}
        </div>
      </div>
    </div>
  );
}
