import { useState } from 'react';
import { Button, Field, Modal, inputCls } from '../ui';
import { useStore } from '../../hooks/useStore';
import { copyText } from '../../lib/download';

/** GenerateInviteModal — create an invitation code participants enter in the mobile app. */
export default function GenerateInviteModal({ onClose, notify }) {
  const { categories, invites, setInvites } = useStore();
  const [cat, setCat] = useState('No preset');
  const [exp, setExp] = useState('2025-12-31');
  const [limit, setLimit] = useState(100);
  const [code] = useState(() => `PRRI-${Math.random().toString(36).slice(2, 6).toUpperCase()}`);
  const ok = exp && Number(limit) >= 1;

  const create = async () => {
    setInvites([{ id: Date.now(), code, category: cat, expires: exp, limit: Number(limit), used: 0 }, ...invites]);
    const copied = await copyText(`https://unifyle.app/join/${code}`);
    notify?.(copied ? `Invitation ${code} created and link copied` : `Invitation ${code} created`);
    onClose();
  };

  return (
    <Modal
      title="Generate invitation"
      subtitle="A code participants enter in the mobile app to join PRRI"
      onClose={onClose}
      width={480}
      footer={<><span /><div className="flex gap-2"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button disabled={!ok} onClick={create}>Generate and copy link</Button></div></>}
    >
      <div className="space-y-4 pb-2">
        <div className="glass-inset flex items-center justify-between rounded-2xl px-4 py-3">
          <span className="text-xs text-ink-500">Invite code</span>
          <code className="rounded-md bg-white px-2.5 py-1 text-[13px] font-medium text-brand-800">{code}</code>
        </div>
        <Field label="Preset category" hint="A preset skips the category choice on mobile.">
          <select className={inputCls} value={cat} onChange={(e) => setCat(e.target.value)}><option>No preset</option>{categories.filter((c) => !c.archived).map((c) => <option key={c.id}>{c.name}</option>)}</select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Expiry date"><input type="date" className={inputCls} value={exp} onChange={(e) => setExp(e.target.value)} /></Field>
          <Field label="Usage limit"><input type="number" min="1" className={inputCls} value={limit} onChange={(e) => setLimit(e.target.value)} /></Field>
        </div>
      </div>
    </Modal>
  );
}
