import { useEffect } from 'react';
import { Icon } from './Icon';

/** Modal — centered glass card with a soft blurred backdrop. Closes on Esc. */
export function Modal({ title, subtitle, onClose, children, footer, width = 560 }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="glass-backdrop absolute inset-0 animate-fade-in" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ maxWidth: width }}
        className="glass-strong relative flex max-h-[calc(100vh-2rem)] w-full animate-rise flex-col rounded-[24px]"
      >
        <header className="flex items-start justify-between gap-4 px-6 pb-3 pt-5">
          <div>
            <h2 className="text-[17px] font-medium text-ink-950">{title}</h2>
            {subtitle && <p className="mt-1 text-xs text-ink-500">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-full text-ink-500 hover:bg-white/70 hover:text-ink-950">
            <Icon name="close" size={16} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-3">{children}</div>
        {footer && <footer className="flex flex-wrap items-center justify-between gap-2 px-6 pb-5 pt-3">{footer}</footer>}
      </div>
    </div>
  );
}
