import { useState } from 'react';
import { Button, Field, Modal, inputCls } from '../ui';

const TYPES = ['People', 'Venue', 'Tools', 'Inputs', 'Other'];
const STATUSES = ['Confirmed', 'Partial', 'Pending'];

/** ResourceModal — add a resource (people, venue, tools, inputs) the activity draws on. */
export default function ResourceModal({ onSave, onClose }) {
  const [f, setF] = useState({ type: TYPES[0], resource: '', allocated: '', status: STATUSES[0] });
  const set = (p) => setF((x) => ({ ...x, ...p }));
  const ok = f.resource.trim() && f.allocated.trim();

  return (
    <Modal
      title="Add resource"
      subtitle="People, venue, tools and inputs the activity draws on"
      onClose={onClose}
      width={500}
      footer={<><span /><div className="flex gap-2"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button disabled={!ok} onClick={() => { onSave({ id: Date.now(), ...f, resource: f.resource.trim(), allocated: f.allocated.trim() }); onClose(); }}>Add resource</Button></div></>}
    >
      <div className="space-y-4 pb-2">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Type"><select className={inputCls} value={f.type} onChange={(e) => set({ type: e.target.value })}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Status"><select className={inputCls} value={f.status} onChange={(e) => set({ status: e.target.value })}>{STATUSES.map((t) => <option key={t}>{t}</option>)}</select></Field>
        </div>
        <Field label="Resource"><input className={inputCls} value={f.resource} onChange={(e) => set({ resource: e.target.value })} autoFocus placeholder="e.g. Projector and screen" /></Field>
        <Field label="Allocated" hint="How much is set aside, for example “2 of 2” or “10 bags”."><input className={inputCls} value={f.allocated} onChange={(e) => set({ allocated: e.target.value })} /></Field>
      </div>
    </Modal>
  );
}
