import { Icon } from './Icon';

/**
 * Toast — fixed bottom-right notification
 * Renders nothing when message is empty.
 */
export function Toast({ message }) {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 bg-ink-950 text-white rounded-xl px-4 py-3 shadow-panel text-xs font-medium animate-fade-in"
    >
      <span className="w-5 h-5 rounded-full bg-green-400 text-ink-950 inline-grid place-items-center flex-shrink-0">
        <Icon name="check" size={12} />
      </span>
      {message}
    </div>
  );
}
