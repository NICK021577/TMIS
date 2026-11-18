import { useState } from 'react';
import { Button, Icon } from '../ui';

/**
 * Pieces shared by the Agency settings and the Super Admin Global settings pages,
 * so both look and behave the same.
 */

export const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** Keeps a draft of one settings group. Nothing is applied until Save. */
export function useDraft(saved) {
  const [draft, setDraft] = useState(saved);
  return { draft, setDraft, dirty: !same(draft, saved), reset: () => setDraft(saved) };
}

/** Card footer: appears greyed until something changed. */
export function SaveBar({ dirty, onSave, onDiscard, label = 'Save changes', canSave = true }) {
  return (
    <div className="mt-6 flex items-center justify-between gap-3 border-t border-[var(--glass-divider)] pt-4">
      <span className={`flex items-center gap-2 text-xs ${dirty ? 'text-amber-700' : 'text-ink-400'}`}>
        <i className={`h-1.5 w-1.5 rounded-full ${dirty ? 'bg-amber-400' : 'bg-ink-300'}`} />
        {dirty ? 'You have unsaved changes' : 'All changes saved'}
      </span>
      <div className="flex gap-2">
        <Button variant="secondary" disabled={!dirty} onClick={onDiscard}>Discard</Button>
        <Button disabled={!dirty || !canSave} onClick={onSave}>{label}</Button>
      </div>
    </div>
  );
}

/** Label and description on the left, control on the right. */
export function SettingRow({ title, desc, children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-b border-[var(--glass-divider)] py-4 first:pt-0 last:border-0 last:pb-0">
      <div className="min-w-0 max-w-[420px]">
        <strong className="block text-[13px] font-medium text-ink-950">{title}</strong>
        {desc && <p className="mt-0.5 text-xs leading-relaxed text-ink-500">{desc}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

/** Section list on the left, the chosen section on the right. */
export function SettingsLayout({ sections, id, onChange, children }) {
  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[240px_1fr]">
      <nav aria-label="Settings sections" className="no-scrollbar flex gap-1 overflow-x-auto lg:sticky lg:top-2 lg:flex-col">
        {sections.map((s) => {
          const on = s.id === id;
          return (
            <button key={s.id} onClick={() => onChange(s.id)} aria-current={on ? 'page' : undefined}
              className={`flex flex-shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${on ? 'bg-white/85 shadow-[0_4px_14px_rgba(30,70,180,0.10)]' : 'hover:bg-white/55'}`}>
              <span className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg ${on ? 'bg-brand-600 text-white' : 'bg-white/70 text-ink-600'}`}><Icon name={s.icon} size={15} /></span>
              <span className="min-w-0"><strong className={`block text-[13px] ${on ? 'font-medium text-ink-950' : 'font-normal text-ink-700'}`}>{s.label}</strong><small className="hidden text-[11px] text-ink-500 lg:block">{s.desc}</small></span>
            </button>
          );
        })}
      </nav>
      <div key={id} className="min-w-0 animate-fade-in">{children}</div>
    </div>
  );
}
