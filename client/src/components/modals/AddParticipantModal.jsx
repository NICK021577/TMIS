import { useState } from 'react';
import { Button, Field, Icon, Modal, inputCls } from '../ui';
import { useStore } from '../../hooks/useStore';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FLOW = [
  { icon: 'mail',  title: 'You add',        text: 'Their email and category.' },
  { icon: 'send',  title: 'They get a link', text: 'An invitation by email.' },
  { icon: 'users', title: 'They complete',   text: 'Name, affiliation and category questions.' },
  { icon: 'check', title: 'They appear',     text: 'In the registry as Active.' },
];

/**
 * AddParticipantModal — the agency only knows an email and a category.
 * The participant fills in the rest (name, affiliation, location, category questions) on their own app,
 * so the data comes from the person themselves and the agency never types it in wrongly.
 */
export default function AddParticipantModal({ activity, onClose }) {
  const { categories, invitePerson, notify } = useStore();
  const options = categories.filter((c) => !c.archived);
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState(options[0]?.name ?? '');
  const [touched, setTouched] = useState(false);

  const valid = EMAIL_PATTERN.test(email.trim());
  const questions = options.find((c) => c.name === category)?.questions?.split(';').map((q) => q.trim()).filter(Boolean) ?? [];

  function submit(e) {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    const result = invitePerson({ email, category, activityId: activity?.id });
    notify?.(result === 'exists'
      ? `${email.trim()} is already in the registry${activity ? ' and was added to this activity' : ''}`
      : `Invitation sent to ${email.trim()}`);
    onClose();
  }

  return (
    <Modal
      title="Add participant"
      subtitle={activity ? `Invite someone to “${activity.title}”` : 'Invite someone to your agency’s participant registry'}
      onClose={onClose}
      width={560}
      footer={
        <>
          <span className="flex items-center gap-1.5 text-[11px] text-ink-500"><Icon name="lock" size={12} />The invite link expires in 7 days.</span>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" form="add-participant" icon="send">Send invitation</Button>
          </div>
        </>
      }
    >
      <form id="add-participant" onSubmit={submit} noValidate className="space-y-5 pb-2">
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {FLOW.map((s, i) => (
            <li key={s.title} className="glass-inset rounded-2xl p-3">
              <span className="mb-2 grid h-7 w-7 place-items-center rounded-lg bg-brand-100 text-brand-700"><Icon name={s.icon} size={14} /></span>
              <strong className="block text-[12px] font-medium text-ink-950">{i + 1}. {s.title}</strong>
              <small className="mt-0.5 block text-[11px] leading-snug text-ink-500">{s.text}</small>
            </li>
          ))}
        </ol>

        <Field label="Email address">
          <input
            type="email" inputMode="email" autoFocus value={email} placeholder="name@email.com"
            onChange={(e) => setEmail(e.target.value)} onBlur={() => setTouched(true)}
            aria-invalid={touched && !valid}
            className={`${inputCls} aria-[invalid=true]:border-danger`}
          />
          {touched && !valid && <small className="flex items-center gap-1 text-[11px] text-danger"><Icon name="alert" size={12} />Enter a valid email address.</small>}
        </Field>

        <Field label="Category" hint="Decides which extra questions the participant answers.">
          <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>
            {options.map((c) => <option key={c.id}>{c.name}</option>)}
          </select>
        </Field>

        <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50/60 p-4">
          <strong className="flex items-center gap-2 text-[12px] font-medium text-brand-900"><Icon name="sparkle" size={14} />The participant will fill in</strong>
          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            {['Full name', 'Organization / affiliation', 'Location', ...questions].map((q) => (
              <li key={q} className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] text-ink-700 ring-1 ring-black/5">{q}</li>
            ))}
          </ul>
          <p className="mt-2.5 text-[11px] leading-relaxed text-ink-500">Until they finish, the registry shows them as <strong className="font-medium text-ink-700">Invited</strong> with only their email.</p>
        </div>
      </form>
    </Modal>
  );
}
