import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../ui';
import { useStore } from '../../hooks/useStore';
import { useMenus } from '../../hooks/useMenus';
import { MENUS } from '../../lib/menus';

/**
 * SearchBox — the header search. Results drop down right under the field (no dimmed or blurred page),
 * like most web apps. Searches pages, activities and participants. Ctrl/⌘ + K focuses it.
 * On small screens the magnifier opens the field across the top of the page.
 */
export default function SearchBox() {
  const navigate = useNavigate();
  const { activities, people } = useStore();
  const allowed = useMenus();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);   // small-screen field is showing
  const [i, setI] = useState(0);
  const wrap = useRef(null);
  const input = useRef(null);
  const list = useRef(null);

  // Only pages this person can open
  const pages = useMemo(() => MENUS.filter((m) => allowed.includes(m.key)).map((m) => ({ label: m.label, to: m.to, icon: m.icon, sub: 'Page' })), [allowed]);

  const groups = useMemo(() => {
    const t = q.trim().toLowerCase();
    const has = (s) => (s || '').toLowerCase().includes(t);
    return [
      { name: t ? 'Pages' : 'Go to', rows: pages.filter((p) => !t || has(p.label)) },
      { name: 'Activities', rows: t && allowed.includes('activities') ? activities.filter((a) => has(a.title) || has(a.type)).slice(0, 6).map((a) => ({ label: a.title, sub: `${a.type} · ${a.status}`, to: `/activities/${a.id}`, icon: 'clock' })) : [] },
      { name: 'Participants', rows: t && allowed.includes('participants') ? people.filter((p) => has(p.name) || has(p.email) || has(p.agency)).slice(0, 6).map((p) => ({ label: p.name || p.email, sub: p.agency || p.category, to: '/participants', icon: 'users' })) : [] },
    ].filter((g) => g.rows.length);
  }, [q, pages, activities, people, allowed]);
  const flat = groups.flatMap((g) => g.rows);

  const close = () => { setOpen(false); setCompact(false); };
  const go = (row) => { close(); setQ(''); input.current?.blur(); navigate(row.to); };

  // Ctrl/⌘ + K focuses the field
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCompact(true);
        setOpen(true);
        setTimeout(() => input.current?.focus(), 0);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Click anywhere else closes the results
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (!wrap.current?.contains(e.target)) close(); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  useEffect(() => { setI(0); }, [q]);
  useEffect(() => { list.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' }); }, [i]);

  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setI((n) => Math.min(flat.length - 1, n + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setI((n) => Math.max(0, n - 1)); }
    else if (e.key === 'Enter' && flat[i]) go(flat[i]);
    else if (e.key === 'Escape') { close(); input.current?.blur(); }
  };

  let index = -1;
  return (
    <>
      {!compact && (
        <button type="button" aria-label="Search" onClick={() => { setCompact(true); setOpen(true); setTimeout(() => input.current?.focus(), 0); }}
          className="grid h-10 w-10 place-items-center rounded-full text-ink-600 transition-colors hover:bg-white/60 md:hidden"><Icon name="search" size={18} /></button>
      )}

      <div ref={wrap} className={compact ? 'fixed inset-x-3 top-3 z-50 md:static md:inset-auto md:block' : 'relative hidden md:block'}>
        <label className={`glass-input flex h-10 items-center gap-2.5 rounded-full px-4 text-ink-500 transition-[width] duration-200 ${open ? 'md:w-[340px]' : 'md:w-[260px]'} w-full`}>
          <Icon name="search" size={15} />
          <span className="sr-only">Search</span>
          <input
            ref={input} value={q} role="combobox" aria-expanded={open} aria-controls="search-results" autoComplete="off"
            onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onKeyDown={onKey}
            placeholder="Search…" className="min-w-0 flex-1 bg-transparent text-[13px] text-ink-950 outline-none placeholder:text-ink-400"
          />
          {q
            ? <button type="button" aria-label="Clear search" onClick={() => { setQ(''); input.current?.focus(); }} className="grid h-5 w-5 place-items-center rounded-full text-ink-400 hover:text-ink-800"><Icon name="close" size={12} /></button>
            : <kbd className="hidden rounded-md bg-white/80 px-1.5 py-0.5 text-[10px] text-ink-500 ring-1 ring-black/5 md:block">Ctrl K</kbd>}
        </label>

        {open && (
          <div id="search-results" role="listbox" className="glass-strong absolute left-0 right-0 top-full z-50 mt-2 animate-fade-in overflow-hidden rounded-[18px] md:left-auto md:right-0 md:w-[420px]">
            <div ref={list} className="max-h-[360px] overflow-y-auto p-2">
              {groups.length ? groups.map((g) => (
                <div key={g.name} className="mb-1">
                  <p className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-ink-500">{g.name}</p>
                  {g.rows.map((r) => {
                    index += 1;
                    const mine = index;
                    const active = mine === i;
                    return (
                      <button key={`${g.name}-${r.label}-${r.to}`} role="option" aria-selected={active} data-active={active} onMouseEnter={() => setI(mine)} onClick={() => go(r)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${active ? 'bg-white/85 shadow-sm' : ''}`}>
                        <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-brand-100/70 text-brand-700"><Icon name={r.icon} size={15} /></span>
                        <span className="min-w-0 flex-1"><strong className="block truncate text-[13px] font-medium text-ink-950">{r.label}</strong><small className="block truncate text-xs text-ink-500">{r.sub}</small></span>
                      </button>
                    );
                  })}
                </div>
              )) : <p className="px-4 py-8 text-center text-[13px] text-ink-500">No results for “{q}”.</p>}
            </div>
            <p className="hidden border-t border-[var(--glass-divider)] px-4 py-2 text-[11px] text-ink-400 md:block">↑ ↓ to move · Enter to open · Esc to close</p>
          </div>
        )}
      </div>
    </>
  );
}
