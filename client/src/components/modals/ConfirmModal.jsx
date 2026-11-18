import { useEffect, useId } from 'react';
import { LogoMood } from '../ui/LogoMood';

/**
 * ConfirmModal — the one "Are you sure?" popup used across UniFyle.
 * Open it with useConfirm() instead of rendering it by hand.
 *   tone: danger (destructive, sad logo) · warn · info · signout (questioning logo)
 * Look: a soft gradient header with the logo, then centered text and two pill buttons.
 */

// Same sky-blue and lavender wash for every tone; only the warm glow at the bottom changes.
const GLOW = {
  danger:  '#ffd5da',
  warn:    '#ffe6bf',
  info:    '#d3f2e4',
  signout: '#e0e5f3',
};

export default function ConfirmModal({ title, message, detail, confirmLabel = 'Confirm', cancelLabel = 'Cancel', tone = 'danger', onConfirm, onCancel }) {
  const id = useId();
  const sad = tone === 'danger';
  const glow = GLOW[tone] ?? GLOW.danger;

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4">
      <div className="glass-backdrop absolute inset-0 animate-fade-in" onClick={onCancel} aria-hidden="true" />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`${id}-t`}
        aria-describedby={`${id}-d`}
        className="relative w-full max-w-[400px] animate-rise overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_rgba(40,60,140,0.28)] ring-1 ring-white"
      >
        {/* gradient header */}
        <div
          className="relative grid h-[148px] place-items-center"
          style={{ background: `radial-gradient(110% 90% at 12% 0%, #c6dcff 0%, transparent 62%), radial-gradient(90% 80% at 96% 18%, #e4d8ff 0%, transparent 60%), radial-gradient(100% 70% at 50% 108%, ${glow} 0%, transparent 72%), #eef3ff` }}
        >
          <span className="relative mt-1 animate-bob drop-shadow-[0_14px_16px_rgba(30,80,200,0.28)]">
            <LogoMood mood={sad ? 'sad' : 'ask'} size={92} />
            {!sad && (
              <span className="absolute -right-5 -top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-[17px] font-semibold text-brand-700 shadow-[0_6px_14px_rgba(40,70,160,0.25)]" aria-hidden="true">?</span>
            )}
          </span>
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-white" aria-hidden="true" />
        </div>

        {/* content */}
        <div className="px-7 pb-7 text-center">
          <h2 id={`${id}-t`} className="text-[20px] font-semibold leading-snug tracking-[-0.4px] text-ink-950">{title}</h2>
          <p id={`${id}-d`} className="mx-auto mt-2 max-w-[320px] text-[13px] leading-relaxed text-ink-600">
            {message}
            {detail && <span className="mt-1.5 block text-xs text-ink-500">{detail}</span>}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button" autoFocus onClick={onCancel}
              className="h-11 rounded-full border border-ink-200 bg-white text-sm font-medium text-ink-800 transition-colors hover:bg-ink-100"
            >
              {cancelLabel}
            </button>
            <button
              type="button" onClick={onConfirm}
              className={`h-11 rounded-full text-sm font-medium text-white transition-all active:translate-y-px ${
                sad
                  ? 'bg-danger shadow-[0_10px_22px_rgba(220,60,60,0.32)] hover:bg-red-700'
                  : 'bg-brand-600 shadow-[0_10px_22px_rgba(59,114,230,0.35)] hover:bg-brand-700'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
