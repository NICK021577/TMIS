import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';

const TONES = {
  default: 'text-ink-500 hover:bg-white/80 hover:text-ink-950',
  brand:   'text-brand-700 hover:bg-brand-100/70',
  danger:  'text-ink-500 hover:bg-red-50 hover:text-danger',
  ok:      'text-emerald-600 hover:bg-emerald-50',
};

/**
 * ActionIcon — icon-only table action. The label (name / description) shows in a tooltip on hover or focus.
 * Rendered through a portal so scrolling tables never clip it. A disabled icon still shows its label.
 */
export function ActionIcon({ icon, label, onClick, disabled = false, tone = 'default', size = 15, className = '' }) {
  const wrap = useRef(null);
  const [tip, setTip] = useState(null);

  const show = () => {
    const r = wrap.current?.getBoundingClientRect();
    if (r) setTip({ x: r.left + r.width / 2, y: r.top });
  };
  const hide = () => setTip(null);

  return (
    <span ref={wrap} className="inline-flex" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      <button
        type="button"
        aria-label={label}
        disabled={disabled}
        onClick={(e) => { e.stopPropagation(); hide(); onClick?.(e); }}
        className={`grid h-8 w-8 place-items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent ${TONES[tone]} ${className}`}
      >
        <Icon name={icon} size={size} />
      </button>
      {tip && createPortal(
        <span
          role="tooltip"
          style={{ left: tip.x, top: tip.y - 8 }}
          className="pointer-events-none fixed z-[70] -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-ink-950 px-2.5 py-1.5 text-[11px] font-medium text-white shadow-lg"
        >
          {label}
        </span>,
        document.body,
      )}
    </span>
  );
}
