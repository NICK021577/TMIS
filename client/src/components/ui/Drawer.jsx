import { useEffect } from 'react';
import { Icon } from './Icon';

/**
 * Drawer — right-side glass panel for review / detail / create flows.
 * Closes on Esc or backdrop click.
 */
export function Drawer({ title, subtitle, onClose, children, footer }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="glass-backdrop absolute inset-0 animate-fade-in" onClick={onClose} aria-hidden="true" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="glass-strong relative flex h-full w-full max-w-[460px] animate-fade-in flex-col !rounded-none sm:m-3 sm:h-[calc(100%-1.5rem)] sm:!rounded-[22px]"
      >
        <header className="flex items-start justify-between gap-4 border-b border-[var(--glass-divider)] px-6 py-5">
          <div className="min-w-0">
            <h2 className="text-[17px] font-medium leading-tight text-ink-950">{title}</h2>
            {subtitle && <p className="mt-1 text-xs text-ink-500">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full text-ink-500 transition-colors hover:bg-white/70 hover:text-ink-950"
          >
            <Icon name="close" size={18} />
          </button>
        </header>
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <footer className="flex flex-wrap justify-end gap-2 border-t border-[var(--glass-divider)] px-6 py-4">{footer}</footer>
        )}
      </aside>
    </div>
  );
}

/** Label / value list used inside drawers */
export function KeyValue({ rows }) {
  return (
    <dl className="glass-inset divide-y divide-[var(--glass-divider)] rounded-2xl px-4 text-xs">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4 py-3">
          <dt className="text-ink-500">{k}</dt>
          <dd className="text-right text-ink-950">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
