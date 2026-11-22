import { useState } from 'react';
import { Badge, Button, Callout, Field, Icon, Modal, inputCls, textareaCls } from '../ui';
import { useStore } from '../../hooks/useStore';
import { ACTIVITY_TYPES, BUDGET_CATEGORIES, peso } from '../../data/mockData';
import { ROLE_OPTIONS } from '../../data/workspaceData';
import { estOf, formatRange } from '../../lib/budgetModel';
import PartnerSelect from '../shared/PartnerSelect';

const STEPS = ['Basics', 'Plan & agencies', 'Allocated budget', 'Required documents', 'Review'];
const REQUIRED_DOCS = ['Proposal', 'Approval memo', 'Program of activities', 'Budget breakdown'];

const empty = {
  title: '', type: ACTIVITY_TYPES[0], funding: '', start: '', end: '', venue: '', lead: 'Alexis Ramos',
  target: 40, description: '', openToAll: true, audience: [], location: '',
  topics: '', objectives: '', outcomes: '',
  agencies: [],
  budget: [], docs: {},
};

export default function CreateWizard({ onClose, prefill, onCreated }) {
  const { items, annual, createActivity, notify, categories, fundingNames, partners } = useStore();
  const [step, setStep] = useState(0);
  // The agency itself is the default Implementing partner, and the first funding source is preselected
  const ownId = partners.find((p) => p.own)?.id ?? null;
  const [f, setF] = useState({ ...empty, funding: fundingNames[0] ?? '', agencies: [{ partnerId: ownId, role: 'Implementing' }], ...prefill });
  const [line, setLine] = useState({ category: BUDGET_CATEGORIES[0], item: '', qty: 1, unit: '' });
  const set = (patch) => setF((p) => ({ ...p, ...patch }));

  const total = f.budget.reduce((s, b) => s + estOf(b), 0);
  const committed = items.reduce((s, i) => s + estOf(i), 0);
  const remaining = annual - committed;
  const short = total - remaining;

  const valid = [
    f.title.trim() && f.venue.trim() && f.start && f.end && f.end >= f.start,
    true,
    f.budget.length > 0,
    REQUIRED_DOCS.every((d) => f.docs[d]),
    true,
  ][step];

  const build = (status) => ({
    title: f.title.trim(), type: f.type, venue: f.venue.trim(), status,
    date: f.start && f.end ? formatRange(f.start, f.end) : 'Dates to be set',
    dateShort: f.start ? `${['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][Number(f.start.slice(5, 7)) - 1]} ${f.start.slice(8)}` : 'TBD',
    participants: 0, capacity: Number(f.target) || 0, tenant: 'PRRI',
  });

  const partnerRows = () => f.agencies.filter((a) => a.partnerId != null).map((a) => ({ partnerId: a.partnerId, role: a.role }));
  const partnerName = (id) => partners.find((p) => p.id === id)?.name ?? '';
  const lines = (t) => t.split(/\n|;/).map((x) => x.trim()).filter(Boolean);
  const detailsOf = () => ({
    description: f.description.trim(), funding: f.funding, lead: f.lead, topics: f.topics.trim(), documentation: '', programFlow: null,
    audience: f.openToAll || !f.audience.length ? 'participants' : f.audience.join(', '),
    objectives: lines(f.objectives), outcomes: lines(f.outcomes),
  });

  const saveDraft = () => {
    if (!f.title.trim()) return;
    createActivity(build('Draft'), f.budget.map((b) => ({ ...b, funding: f.funding })), detailsOf(), partnerRows());
    notify?.('Draft saved');
    onCreated?.();
    onClose();
  };
  const create = () => {
    createActivity(build('Upcoming'), f.budget.map((b) => ({ ...b, funding: f.funding })), detailsOf(), partnerRows());
    notify?.(`“${f.title.trim()}” created and added to the calendar`);
    onCreated?.();
    onClose();
  };

  const addLine = () => {
    if (!line.item.trim() || !(Number(line.unit) > 0)) return;
    set({ budget: [...f.budget, { category: line.category, item: line.item.trim(), qty: Number(line.qty) || 1, unit: Number(line.unit) }] });
    setLine({ ...line, item: '', unit: '', qty: 1 });
  };

  return (
    <Modal
      title="Create activity"
      subtitle={`Step ${step + 1} of ${STEPS.length} · ${STEPS[step]}`}
      onClose={onClose}
      width={780}
      footer={
        <>
          <Button variant="ghost" disabled={!f.title.trim()} onClick={saveDraft}>Save draft</Button>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
            {step < STEPS.length - 1
              ? <Button disabled={!valid} onClick={() => setStep(step + 1)}>Next</Button>
              : <Button icon="check" onClick={create}>Create activity</Button>}
          </div>
        </>
      }
    >
      {/* Step header */}
      <ol className="mb-5 flex items-center gap-2 overflow-x-auto pb-1">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-shrink-0 items-center gap-2">
            <button
              disabled={i > step}
              onClick={() => setStep(i)}
              className={`flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-xs transition-colors ${i === step ? 'bg-white/80 text-ink-950' : 'text-ink-500'} disabled:cursor-default`}
            >
              <b className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-medium ${i < step ? 'bg-emerald-400 text-white' : i === step ? 'bg-brand-600 text-white' : 'bg-ink-400/30 text-ink-600'}`}>
                {i < step ? <Icon name="check" size={11} /> : i + 1}
              </b>
              {s}
            </button>
            {i < STEPS.length - 1 && <span className="h-px w-4 bg-[var(--glass-divider)]" />}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="space-y-4">
          <Field label="Title"><input className={inputCls} value={f.title} onChange={(e) => set({ title: e.target.value })} autoFocus /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type"><select className={inputCls} value={f.type} onChange={(e) => set({ type: e.target.value })}>{ACTIVITY_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
            <Field label="Funding source"><select className={inputCls} value={f.funding} onChange={(e) => set({ funding: e.target.value })}>{fundingNames.map((t) => <option key={t}>{t}</option>)}</select></Field>
            <Field label="Start date"><input type="date" className={inputCls} value={f.start} onChange={(e) => set({ start: e.target.value, end: f.end && f.end < e.target.value ? e.target.value : f.end })} /></Field>
            <Field label="End date" hint={f.end && f.start && f.end < f.start ? 'End must not be before the start date' : undefined}><input type="date" min={f.start} className={inputCls} value={f.end} onChange={(e) => set({ end: e.target.value })} /></Field>
          </div>
          <Field label="Venue"><input className={inputCls} value={f.venue} onChange={(e) => set({ venue: e.target.value })} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Activity lead"><input className={inputCls} value={f.lead} onChange={(e) => set({ lead: e.target.value })} /></Field>
            <Field label="Target participants"><input type="number" min="1" className={inputCls} value={f.target} onChange={(e) => set({ target: e.target.value })} /></Field>
          </div>
          <Field label="Description"><textarea rows={3} className={textareaCls} value={f.description} onChange={(e) => set({ description: e.target.value })} /></Field>

          <div className="glass-inset rounded-2xl p-4">
            <strong className="mb-1 block text-[13px] font-medium text-ink-950">Target audience</strong>
            <label className="mb-3 flex items-center gap-2.5 text-[13px] text-ink-600">
              <input type="checkbox" className="h-4 w-4 accent-brand-600" checked={f.openToAll} onChange={(e) => set({ openToAll: e.target.checked })} /> Open to all participants
            </label>
            {!f.openToAll && (
              <div className="flex flex-wrap gap-2">
                {categories.filter((c) => !c.archived).map((c) => {
                  const on = f.audience.includes(c.name);
                  return (
                    <button key={c.id} type="button" aria-pressed={on} onClick={() => set({ audience: on ? f.audience.filter((x) => x !== c.name) : [...f.audience, c.name] })}
                      className={`rounded-full px-3 py-1.5 text-xs transition-colors ${on ? 'bg-brand-600 text-white' : 'bg-white/70 text-ink-600 ring-1 ring-black/5 hover:bg-white'}`}>
                      {c.name}
                    </button>
                  );
                })}
              </div>
            )}
            <Field label="Location (optional)" className="mt-3"><input className={inputCls} value={f.location} onChange={(e) => set({ location: e.target.value })} placeholder="e.g. Zamboanga Sibugay" /></Field>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <Field label="Topics"><input className={inputCls} value={f.topics} onChange={(e) => set({ topics: e.target.value })} /></Field>
          <Field label="Objectives"><textarea rows={3} className={textareaCls} value={f.objectives} onChange={(e) => set({ objectives: e.target.value })} /></Field>
          <Field label="Expected outcomes"><textarea rows={3} className={textareaCls} value={f.outcomes} onChange={(e) => set({ outcomes: e.target.value })} /></Field>
          <div>
            <span className="mb-1.5 block text-xs text-ink-600">Agency roles</span>
            <ul className="space-y-2">
              {f.agencies.map((a, i) => (
                <li key={i} className="grid grid-cols-[1fr_170px_32px] items-start gap-2">
                  <PartnerSelect value={a.partnerId} ariaLabel="Partner agency" exclude={f.agencies.filter((_, j) => j !== i).map((x) => x.partnerId)}
                    onChange={(id) => set({ agencies: f.agencies.map((x, j) => (j === i ? { ...x, partnerId: id } : x)) })} />
                  <select className={inputCls} value={a.role} aria-label="Role" onChange={(e) => set({ agencies: f.agencies.map((x, j) => (j === i ? { ...x, role: e.target.value } : x)) })}>{ROLE_OPTIONS.map((o) => <option key={o}>{o}</option>)}</select>
                  <button type="button" aria-label="Remove" onClick={() => set({ agencies: f.agencies.filter((_, j) => j !== i) })} className="grid place-items-center rounded-full text-ink-400 hover:text-danger"><Icon name="close" size={14} /></button>
                </li>
              ))}
            </ul>
            <Button variant="ghost" size="sm" icon="plus" className="mt-2" onClick={() => set({ agencies: [...f.agencies, { partnerId: null, role: 'Collaborating' }] })}>Add agency</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Callout tone="info" icon="award">Remaining annual budget: <strong>{peso(remaining)}</strong>. An allocated budget is required to continue.</Callout>
          <div className="grid grid-cols-[130px_1fr_70px_110px_auto] gap-2">
            <select className={inputCls} value={line.category} aria-label="Category" onChange={(e) => setLine({ ...line, category: e.target.value })}>{BUDGET_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
            <input className={inputCls} placeholder="Item" aria-label="Item" value={line.item} onChange={(e) => setLine({ ...line, item: e.target.value })} />
            <input type="number" min="1" className={inputCls} aria-label="Quantity" value={line.qty} onChange={(e) => setLine({ ...line, qty: e.target.value })} />
            <input type="number" min="0" className={inputCls} placeholder="Unit ₱" aria-label="Unit cost" value={line.unit} onChange={(e) => setLine({ ...line, unit: e.target.value })} />
            <Button variant="secondary" onClick={addLine} disabled={!line.item.trim() || !(Number(line.unit) > 0)}>Add</Button>
          </div>
          {f.budget.length === 0 ? (
            <Callout tone="warn">Add at least one budget line. <strong>Next is disabled</strong> until you do.</Callout>
          ) : (
            <div className="glass-inset overflow-hidden rounded-2xl">
              <table className="w-full text-left text-[13px]">
                <tbody>
                  {f.budget.map((b, i) => (
                    <tr key={i} className="border-b border-[var(--glass-divider)] last:border-0">
                      <td className="px-4 py-2.5"><Badge value={b.category} tone="muted" variant="pill" /></td>
                      <td className="px-2 py-2.5 text-ink-950">{b.item}</td>
                      <td className="px-2 py-2.5 text-ink-500">{b.qty} × {peso(b.unit)}</td>
                      <td className="px-2 py-2.5 tabular-nums">{peso(estOf(b))}</td>
                      <td className="px-3 py-2.5"><button type="button" aria-label="Remove" onClick={() => set({ budget: f.budget.filter((_, j) => j !== i) })} className="text-ink-400 hover:text-danger"><Icon name="trash" size={14} /></button></td>
                    </tr>
                  ))}
                  <tr className="bg-white/40 font-medium text-ink-950"><td className="px-4 py-2.5" colSpan={3}>Allocated total</td><td className="px-2 py-2.5 tabular-nums">{peso(total)}</td><td /></tr>
                </tbody>
              </table>
            </div>
          )}
          {short > 0 && <Callout tone="warn">This allocation is <strong>{peso(short)}</strong> above the remaining annual budget. This is a warning only; you can still continue.</Callout>}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <p className="text-[13px] text-ink-500">All four documents must be attached before the activity can be created.</p>
          {REQUIRED_DOCS.map((d) => (
            <div key={d} className="glass-inset flex items-center gap-3 rounded-2xl px-4 py-3">
              <Icon name="file" size={16} className="text-brand-600" />
              <span className="flex-1 text-[13px] text-ink-950">{d}</span>
              <Badge value={f.docs[d] ? 'Attached' : 'Missing'} tone={f.docs[d] ? 'ok' : 'warn'} />
              <label className="cursor-pointer rounded-full bg-white/80 px-3.5 py-1.5 text-xs text-ink-800 ring-1 ring-black/5 hover:bg-white">
                {f.docs[d] ? 'Replace' : 'Upload'}
                <input type="file" hidden onChange={(e) => e.target.files?.[0] && set({ docs: { ...f.docs, [d]: e.target.files[0].name } })} />
              </label>
            </div>
          ))}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <dl className="glass-inset divide-y divide-[var(--glass-divider)] rounded-2xl px-4 text-[13px]">
            {[
              ['Title', f.title],
              ['Type and dates', `${f.type} · ${formatRange(f.start, f.end)}`],
              ['Venue and lead', `${f.venue} · ${f.lead}`],
              ['Audience', f.openToAll ? 'Open to all participants' : f.audience.join(', ') || '—'],
              ['Agencies', f.agencies.filter((a) => a.partnerId != null).map((a) => `${partnerName(a.partnerId)} (${a.role})`).join('; ') || '—'],
              ['Budget', `${peso(total)} · ${f.budget.length} line${f.budget.length === 1 ? '' : 's'}`],
              ['Documents', `${REQUIRED_DOCS.filter((d) => f.docs[d]).length} of ${REQUIRED_DOCS.length} attached`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 py-2.5"><dt className="text-ink-500">{k}</dt><dd className="text-right text-ink-950">{v}</dd></div>
            ))}
          </dl>
          {short > 0
            ? <Callout tone="warn">The allocated budget is over the remaining annual budget by <strong>{peso(short)}</strong>.</Callout>
            : <Callout tone="ok" icon="check">This activity is within the remaining annual budget.</Callout>}
          <p className="text-xs text-ink-500">Creating the activity adds exactly one event to the annual calendar. It is unpublished by default.</p>
        </div>
      )}
    </Modal>
  );
}
