import { useEffect, useRef, useState } from 'react';
import { Button, Modal } from '../ui';

const W = 560;
const H = 200;

/**
 * SignaturePadModal — draw a signature with a mouse, finger or pen.
 * Saves a transparent PNG, so it sits cleanly on the certificate.
 */
export default function SignaturePadModal({ name, onSave, onClose }) {
  const ref = useRef(null);
  const drawing = useRef(false);
  const last = useRef(null);
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    const c = ref.current;
    const ctx = c.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    c.width = W * dpr; c.height = H * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#1d2433';
  }, []);

  const point = (e) => {
    const r = ref.current.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };
  const down = (e) => {
    e.preventDefault();
    ref.current.setPointerCapture?.(e.pointerId);
    drawing.current = true; last.current = point(e);
    const ctx = ref.current.getContext('2d');
    ctx.beginPath(); ctx.arc(last.current.x, last.current.y, 1.2, 0, Math.PI * 2); ctx.fillStyle = '#1d2433'; ctx.fill();
    setEmpty(false);
  };
  const move = (e) => {
    if (!drawing.current) return;
    const p = point(e);
    const ctx = ref.current.getContext('2d');
    ctx.beginPath(); ctx.moveTo(last.current.x, last.current.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    last.current = p;
  };
  const up = () => { drawing.current = false; };
  const clear = () => {
    const c = ref.current;
    c.getContext('2d').clearRect(0, 0, W, H);
    setEmpty(true);
  };

  return (
    <Modal
      title="Draw signature"
      subtitle={name ? `Signature of ${name}` : 'Sign inside the box'}
      onClose={onClose}
      width={620}
      footer={
        <>
          <Button variant="ghost" onClick={clear} disabled={empty}>Clear</Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button disabled={empty} onClick={() => { onSave(ref.current.toDataURL('image/png')); onClose(); }}>Use signature</Button>
          </div>
        </>
      }
    >
      <div className="space-y-2 pb-2">
        <div className="relative overflow-hidden rounded-2xl border border-ink-200 bg-white">
          <canvas
            ref={ref} aria-label="Signature area" style={{ width: '100%', aspectRatio: `${W} / ${H}`, touchAction: 'none', cursor: 'crosshair', display: 'block' }}
            onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} onPointerCancel={up}
          />
          <span aria-hidden className="pointer-events-none absolute inset-x-8 bottom-9 border-t border-dashed border-ink-200" />
          {empty && <span aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-ink-300">Sign here</span>}
        </div>
        <p className="text-xs text-ink-500">Use your mouse, finger or a pen. The signature is saved as a transparent image.</p>
      </div>
    </Modal>
  );
}
