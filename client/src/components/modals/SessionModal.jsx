import { useState } from 'react';
import { Button, Field, Modal, inputCls } from '../ui';
import { DAYS } from '../../data/workspaceData';

const fmt = (t) => {
  const [h, m] = t.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

/** SessionModal — add a learning session to a day of the activity. */
export default function SessionModal({ days = DAYS, onSave, onClose }) {
  const [f, setF] = useState({ day: days[0].n, period: 'AM', start: '08:30', end: '11:30', title: '', speaker: '', room: '' });
  const ok = f.title.trim() && f.speaker.trim() && f.room.trim() && f.start && f.end && f.end > f.start;
  const set = (patch) => setF((p) => ({ ...p, ...patch }));

  const submit = () => {
    const d = days.find((x) => x.n === Number(f.day));
    const [a, b] = [fmt(f.start), fmt(f.end)];
    onSave({
      id: Date.now(), day: Number(f.day), period: f.period, date: d.label.split(',')[0].replace('June', 'Jun'),
      time: `${a.replace(/ (AM|PM)$/, '')}–${b}`, title: f.title.trim(), speaker: f.speaker.trim(), room: f.room.trim(), files: 0, status: 'Upcoming',
    });
    onClose();
  };

  return (
    <Modal
      title="Add session"
      subtitle="Each session has its own QR attendance, materials and feedback"
      onClose={onClose}
      width={560}
      footer={<><span /><div className="flex gap-2"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button disabled={!ok} onClick={submit}>Add session</Button></div></>}
    >
      <div className="space-y-4 pb-2">
        <Field label="Session title"><input className={inputCls} value={f.title} onChange={(e) => set({ title: e.target.value })} autoFocus placeholder="e.g. Latex Handling and Quality Control" /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Day"><select className={inputCls} value={f.day} onChange={(e) => set({ day: e.target.value })}>{days.map((d) => <option key={d.n} value={d.n}>Day {d.n} · {d.label.split(',')[0]}</option>)}</select></Field>
          <Field label="Period"><select className={inputCls} value={f.period} onChange={(e) => set({ period: e.target.value })}><option>AM</option><option>PM</option></select></Field>
          <Field label="Starts"><input type="time" className={inputCls} value={f.start} onChange={(e) => set({ start: e.target.value })} /></Field>
          <Field label="Ends" hint={f.end && f.end <= f.start ? 'Must be after the start time.' : undefined}><input type="time" className={inputCls} value={f.end} onChange={(e) => set({ end: e.target.value })} /></Field>
        </div>
        <Field label="Resource person"><input className={inputCls} value={f.speaker} onChange={(e) => set({ speaker: e.target.value })} placeholder="e.g. Engr. Ana Lucero" /></Field>
        <Field label="Venue"><input className={inputCls} value={f.room} onChange={(e) => set({ room: e.target.value })} placeholder="e.g. Training Hall A" /></Field>
      </div>
    </Modal>
  );
}
