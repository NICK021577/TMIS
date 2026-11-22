import { useState } from 'react';
import { useConfirm } from '../modals/confirmContext';
import { Badge, Button, DataTable, Field, Modal, Panel, PanelTitle, inputCls } from '../ui';
import { useStore } from '../../hooks/useStore';
import { AGENCY_TYPES } from '../../data/platformData';

/**
 * Partner agencies: the organizations this agency works with. A partner is only a name and a type,
 * it does not need an account here. Activities and funding sources pick from this list.
 */
export default function PartnersTab({ readOnly, notify }) {
  const { partners, setPartners, addPartner, fundingSources, activities, partnersOf } = useStore();
  const confirm = useConfirm();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState(AGENCY_TYPES[0]);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState('');

  const taken = (n, exceptId) => partners.some((p) => p.id !== exceptId && p.name.toLowerCase() === n.trim().toLowerCase());
  const usedIn = (p) => activities.filter((a) => partnersOf(a.id).some((r) => r.partnerId === p.id)).length;
  const funds = (p) => fundingSources.filter((f) => f.partnerId === p.id).length;

  const close = () => { setAdding(false); setName(''); setType(AGENCY_TYPES[0]); };
  const add = (e) => {
    e?.preventDefault();
    if (!name.trim() || taken(name)) return;
    addPartner(name, type);
    notify?.(`Partner “${name.trim()}” added`);
    close();
  };
  const rename = (p) => {
    if (draft.trim() && !taken(draft, p.id)) setPartners((l) => l.map((x) => (x.id === p.id ? { ...x, name: draft.trim() } : x)));
    setEditing(null);
  };
  const toggle = async (p) => {
    if (!p.archived && !(await confirm({ tone: 'warn', title: `Archive “${p.name}”?`, message: 'It will no longer be offered when adding partners to an activity or a funding source.', detail: 'Activities and funding sources that already use it keep it. You can restore it later.', confirmLabel: 'Archive' }))) return;
    setPartners((l) => l.map((x) => (x.id === p.id ? { ...x, archived: !x.archived } : x)));
    notify?.(p.archived ? `“${p.name}” restored` : `“${p.name}” archived. Existing activities keep it`);
  };

  const columns = [
    {
      key: 'name', label: 'Partner',
      render: (p) => (editing === p.id ? (
        <input autoFocus className={`${inputCls} !h-8`} value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={() => rename(p)} onKeyDown={(e) => e.key === 'Enter' && rename(p)} aria-label="Rename partner" />
      ) : <span className="flex items-center gap-2"><strong className="font-medium text-ink-950">{p.name}</strong>{p.own && <Badge value="Your agency" tone="info" variant="pill" />}</span>),
    },
    {
      key: 'type', label: 'Type',
      render: (p) => (
        <select className={`${inputCls} !h-8 !w-auto min-w-[210px] disabled:opacity-70`} disabled={readOnly} value={p.type} aria-label={`Type of ${p.name}`}
          onChange={(e) => setPartners((l) => l.map((x) => (x.id === p.id ? { ...x, type: e.target.value } : x)))}>
          {AGENCY_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      ),
    },
    { key: 'used', label: 'Used in', render: (p) => <span className="text-ink-600">{usedIn(p)} {usedIn(p) === 1 ? 'activity' : 'activities'}{funds(p) ? ` · ${funds(p)} funding ${funds(p) === 1 ? 'source' : 'sources'}` : ''}</span> },
    { key: 'status', label: 'Status', render: (p) => <Badge value={p.archived ? 'Archived' : 'Active'} tone={p.archived ? 'muted' : 'ok'} /> },
    {
      key: 'act', label: '', className: 'text-right',
      render: (p) => !readOnly && (
        <div className="flex justify-start gap-1">
          <Button variant="ghost" size="sm" onClick={() => { setEditing(p.id); setDraft(p.name); }}>Rename</Button>
          {!p.own && <Button variant="ghost" size="sm" onClick={() => toggle(p)}>{p.archived ? 'Restore' : 'Archive'}</Button>}
        </div>
      ),
    },
  ];

  return (
    <>
      <Panel pad={false} className="overflow-hidden">
        <div className="p-5 pb-3">
          <PanelTitle title="Partner agencies" subtitle="Organizations you work with. They only need a name and a type, no account. Pick them when planning an activity or naming who funds a source.">
            {!readOnly && <Button size="sm" icon="plus" onClick={() => setAdding(true)}>Add partner</Button>}
          </PanelTitle>
        </div>
        <DataTable columns={columns} rows={partners} />
      </Panel>

      {adding && (
        <Modal title="Add a partner" subtitle="Only a name and a type. The partner does not need an account." onClose={close} width={480}
          footer={<><span /><div className="flex gap-2"><Button variant="secondary" onClick={close}>Cancel</Button><Button disabled={!name.trim() || taken(name)} onClick={add}>Add partner</Button></div></>}>
          <form onSubmit={add} className="space-y-4 pb-2">
            <Field label="Name" hint={name.trim() && taken(name) ? 'A partner with this name already exists' : undefined}><input autoFocus className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Department of Agriculture Region IX" /></Field>
            <Field label="Type"><select className={inputCls} value={type} onChange={(e) => setType(e.target.value)}>{AGENCY_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
          </form>
        </Modal>
      )}
    </>
  );
}
