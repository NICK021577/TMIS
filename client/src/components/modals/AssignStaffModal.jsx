import { useState } from 'react';
import { Button, Field, Modal, inputCls } from '../ui';
import { STAFF, STAFF_ROLES } from '../../data/workspaceData';

const PEOPLE = [...new Set(STAFF.map((s) => s.name))];

/** AssignStaffModal — assign one person to a specific day of the activity. */
export default function AssignStaffModal({ day, onAssign, onClose }) {
  const [f, setF] = useState({ name: PEOPLE[0], role: STAFF_ROLES[0], duty: '' });
  const ok = f.name && f.duty.trim();

  return (
    <Modal
      title="Assign staff"
      subtitle={`Day ${day.n} · ${day.label}`}
      onClose={onClose}
      width={480}
      footer={
        <>
          <span />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button disabled={!ok} onClick={() => { onAssign(day.n, { name: f.name, role: f.role, duty: f.duty.trim(), status: 'Pending' }); onClose(); }}>Assign</Button>
          </div>
        </>
      }
    >
      <div className="space-y-4 pb-2">
        <Field label="Staff member">
          <select className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })}>
            {PEOPLE.map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Role">
          <select className={inputCls} value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>
            {STAFF_ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
        </Field>
        <Field label="Responsibility on this day" hint="For example: registration desk, demo farm sessions, logistics.">
          <input className={inputCls} value={f.duty} onChange={(e) => setF({ ...f, duty: e.target.value })} autoFocus />
        </Field>
      </div>
    </Modal>
  );
}
