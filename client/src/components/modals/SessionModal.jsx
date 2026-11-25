import { useState } from 'react';
import { Button, Field, Modal, inputCls } from '../ui';
import { DAYS } from '../../data/workspaceData';
import { endOf, startOf, timeText } from '../../lib/sessions';

/**
 * SessionModal — add or edit a learning session.
 * A day can have several sessions in the same AM or PM block, each with its own venue (for example the same topic
 * in the training hall and then at the demo farm). Sessions at the same venue whose times overlap get a warning.
 *
 *   initial  the session being edited (leave out to add one)
 *   preset   { day, period } to start a new session in a given block
 *   sessions every session of the activity, for the overlap warning
 */
export default function SessionModal({ days = DAYS, initial, preset, sessions = [], onSave, onClose }) {
  const editing = !!initial;
  const [f, setF] = useState(() => (initial
    ? { day: initial.day, period: initial.period, start: startOf(initial), end: endOf(initial), title: initial.title, speaker: initial.speaker, room: initial.room }
    : { day: preset?.day ?? days[0].n, period: preset?.period ?? 'AM', start: preset?.period === 'PM' ? '13:00' : '08:30', end: preset?.period === 'PM' ? '16:00' : '11:30', title: '', speaker: '', room: '' }));
  const set = (patch) => setF((p) => ({ ...p, ...patch }));

  const ok = f.title.trim() && f.speaker.trim() && f.room.trim() && f.start && f.end && f.end > f.start;
  const wrongBlock = f.start && ((f.period === 'AM' && f.start >= '12:00') || (f.period === 'PM' && f.start < '12:00'));
  const clash = sessions.find((s) => s.id !== initial?.id && s.day === Number(f.day) && s.room.trim().toLowerCase() === f.room.trim().toLowerCase()
    && f.room.trim() && startOf(s) < f.end && f.start < endOf(s));
  const sameBlock = sessions.filter((s) => s.id !== initial?.id && s.day === Number(f.day) && s.period === f.period);

  const submit = () => {
    const d = days.find((x) => x.n === Number(f.day)) ?? days[0];
    onSave({
      ...(initial ?? { files: 0, status: 'Upcoming' }),
      id: initial?.id ?? Date.now(), day: Number(f.day), period: f.period,
      date: d.label.split(',')[0].replace('June', 'Jun'), start: f.start, end: f.end, time: timeText(f.start, f.end),
      title: f.title.trim(), speaker: f.speaker.trim(), room: f.room.trim(),
    });
    onClose();
  };

  return (
    <Modal
      title={editing ? 'Edit session' : 'Add session'}
      subtitle="A morning or afternoon can hold several sessions, each with its own venue, QR attendance, materials and feedback"
      onClose={onClose}
      width={560}
      footer={<><span /><div className="flex gap-2"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button disabled={!ok} onClick={submit}>{editing ? 'Save session' : 'Add session'}</Button></div></>}
    >
      <div className="space-y-4 pb-2">
        <Field label="Session title"><input className={inputCls} value={f.title} onChange={(e) => set({ title: e.target.value })} autoFocus placeholder="e.g. Latex Handling and Quality Control" /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Day"><select className={inputCls} value={f.day} onChange={(e) => set({ day: e.target.value })}>{days.map((d) => <option key={d.n} value={d.n}>Day {d.n} · {d.label.split(',')[0]}</option>)}</select></Field>
          <Field label="Period"><select className={inputCls} value={f.period} onChange={(e) => set({ period: e.target.value })}><option value="AM">AM (morning)</option><option value="PM">PM (afternoon)</option></select></Field>
          <Field label="Starts" hint={wrongBlock ? `This time is outside the ${f.period === 'AM' ? 'morning' : 'afternoon'}. Check the period.` : undefined}><input type="time" className={inputCls} value={f.start} onChange={(e) => set({ start: e.target.value })} /></Field>
          <Field label="Ends" hint={f.end && f.end <= f.start ? 'Must be after the start time.' : undefined}><input type="time" className={inputCls} value={f.end} onChange={(e) => set({ end: e.target.value })} /></Field>
        </div>
        <Field label="Resource person"><input className={inputCls} value={f.speaker} onChange={(e) => set({ speaker: e.target.value })} placeholder="e.g. Engr. Ana Lucero" /></Field>
        <Field label="Venue" hint={clash ? `“${clash.title}” uses this venue at the same time (${clash.time}).` : 'Sessions in the same morning or afternoon can use different venues.'}>
          <input className={inputCls} value={f.room} onChange={(e) => set({ room: e.target.value })} placeholder="e.g. Training Hall A" />
        </Field>
        {sameBlock.length > 0 && (
          <p className="rounded-xl bg-brand-100/60 px-3.5 py-2.5 text-xs leading-relaxed text-brand-900">
            Day {f.day} {f.period} already has {sameBlock.length} {sameBlock.length === 1 ? 'session' : 'sessions'}: {sameBlock.map((s) => `${s.title} (${s.time}, ${s.room})`).join('; ')}. This one is added alongside {sameBlock.length === 1 ? 'it' : 'them'}.
          </p>
        )}
      </div>
    </Modal>
  );
}
