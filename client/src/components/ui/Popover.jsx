import { useEffect, useRef, useState } from 'react';

/**
 * Popover — a small panel anchored under a trigger. Closes on outside click and Esc.
 *   <Popover trigger={({ open, toggle }) => <button onClick={toggle}>…</button>}>{({ close }) => …}</Popover>
 */
export function Popover({ trigger, children, align = 'right', width = 340, className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const api = { open, toggle: () => setOpen((o) => !o), close: () => setOpen(false) };
  return (
    <div ref={ref} className="relative">
      {trigger(api)}
      {open && (
        <div
          style={{ width, maxWidth: 'calc(100vw - 24px)' }}
          className={`glass-strong absolute top-full z-50 mt-2 animate-fade-in rounded-[18px] ${align === 'right' ? 'right-0' : 'left-0'} ${className}`}
        >
          {children(api)}
        </div>
      )}
    </div>
  );
}
