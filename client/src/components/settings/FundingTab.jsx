import { useState } from 'react';
import { useConfirm } from '../modals/confirmContext';
import { ActionIcon, Badge, Button, DataTable, Field, Modal, Panel, PanelTitle, inputCls } from '../ui';
import { useStore } from '../../hooks/useStore';
import PartnerSelect from '../shared/PartnerSelect';

/**
 * Funding sources: where an activity's money comes from. A source can name the partner that pays
 * (optional): the agency's own money, such as GAA, has no partner.
 */
export default function FundingTab({ readOnly, notify }) {
  const { fundingSources, setFundingSources, renameFunding, items, plans } = useStore();
  const confirm = useConfirm();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [partnerId, setPartnerId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState('');

  const taken = (n, exceptId) => fundingSources.some((f) => f.id !== exceptId && f.name.toLowerCase() === n.trim().toLowerCase());
  const usedIn = (f) => items.filter((i) => i.funding === f.name).length + plans.filter((p) => p.funding === f.name).length;

  const close = () => { setAdding(false); setName(''); setPartnerId(null); };
  const add = (e) => {
    e?.preventDefault();
    if (!name.trim() || taken(name)) return;
    setFundingSources((l) => [...l, { id: Date.now(), name: name.trim(), partnerId, archived: false }]);
    notify?.(`Funding source “${name.trim()}” added`);
    close();
  };
  const rename = (f) => {
    if (draft.trim() && !taken(draft, f.id)) renameFunding(f.id, draft.trim());
    setEditing(null);
  };
  const toggle = async (f) => {
    if (!f.archived && !(await confirm({ tone: 'warn', title: `Archive “${f.name}”?`, message: 'It will no longer be offered on new activities and budget items.', detail: 'Activities and budget items that already use it keep it. You can restore it later.', confirmLabel: 'Archive' }))) return;
    setFundingSources((l) => l.map((x) => (x.id === f.id ? { ...x, archived: !x.archived } : x)));
    notify?.(f.archived ? `“${f.name}” restored` : `“${f.name}” archived. Existing records keep it`);
  };

  const columns = [
    {
      key: 'name', label: 'Funding source',
      render: (f) => (editing === f.id ? (
        <input autoFocus className={`${inputCls} !h-8`} value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={() => rename(f)} onKeyDown={(e) => e.key === 'Enter' && rename(f)} aria-label="Rename funding source" />
      ) : <strong className="whitespace-nowrap font-medium text-ink-950">{f.name}</strong>),
    },
    {
      key: 'partner', label: 'Funded by',
      render: (f) => (
        <PartnerSelect value={f.partnerId} noneLabel="Own funds (no partner)" disabled={readOnly} ariaLabel={`Funded by, ${f.name}`} className="min-w-[230px] [&_select]:!h-8"
          onChange={(id) => setFundingSources((l) => l.map((x) => (x.id === f.id ? { ...x, partnerId: id } : x)))} />
      ),
    },
    { key: 'used', label: 'Used in', render: (f) => <span className="whitespace-nowrap text-ink-600">{usedIn(f)} {usedIn(f) === 1 ? 'record' : 'records'}</span> },
    { key: 'status', label: 'Status', render: (f) => <span className="whitespace-nowrap"><Badge value={f.archived ? 'Archived' : 'Active'} tone={f.archived ? 'muted' : 'ok'} /></span> },
    ...(readOnly ? [] : [{
      key: 'act', label: 'Actions', className: 'text-right',
      render: (f) => (
        <div className="flex justify-start gap-1">
          <ActionIcon icon="edit" tone="brand" label={`Rename ${f.name}`} onClick={() => { setEditing(f.id); setDraft(f.name); }} />
          {f.archived
            ? <ActionIcon icon="restore" tone="ok" label={`Restore ${f.name}`} onClick={() => toggle(f)} />
            : <ActionIcon icon="archive" tone="danger" label={`Archive ${f.name}`} onClick={() => toggle(f)} />}
        </div>
      ),
    }]),
  ];

  return (
    <>
      <Panel pad={false} className="overflow-hidden">
        <div className="p-5 pb-3">
          <PanelTitle title="Funding sources" subtitle="Where activity money comes from. Renaming one updates every budget item and activity that uses it.">
            {!readOnly && <Button size="sm" icon="plus" onClick={() => setAdding(true)}>Add funding source</Button>}
          </PanelTitle>
        </div>
        <DataTable columns={columns} rows={fundingSources} />
      </Panel>

      {adding && (
        <Modal title="Add a funding source" subtitle="Where an activity's money comes from" onClose={close} width={480}
          footer={<><span /><div className="flex gap-2"><Button variant="secondary" onClick={close}>Cancel</Button><Button disabled={!name.trim() || taken(name)} onClick={add}>Add funding source</Button></div></>}>
          <form onSubmit={add} className="space-y-4 pb-2">
            <Field label="Name" hint={name.trim() && taken(name) ? 'A funding source with this name already exists' : undefined}><input autoFocus className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. DA Region IX co-funding" /></Field>
            <Field label="Funded by (optional)" hint="Pick a partner, or add a new one. Leave empty for your own funds."><PartnerSelect value={partnerId} onChange={setPartnerId} noneLabel="Own funds (no partner)" /></Field>
          </form>
        </Modal>
      )}
    </>
  );
}
