import { Icon } from './Icon';

/** Toast — bottom-centre notification. Renders nothing when message is empty. */
export function Toast({ message }) {
  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="glass-strong fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 animate-fade-in items-center gap-3 rounded-full py-2.5 pl-3 pr-5 text-[13px] text-ink-950"
    >
      <span className="grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-brand-600 text-white">
        <Icon name="check" size={12} />
      </span>
      {message}
    </div>
  );
}
