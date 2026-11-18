import { useConfirm } from '../../modals/confirmContext';
import { useState } from 'react';
import { PageWrapper, PageHeader } from '../../layout/PageWrapper';
import { Badge, Button, Cell, DataTable, Drawer, KeyValue, Panel, SearchInput } from '../../ui';
import { usePlatform } from '../../../hooks/usePlatform';
import { AGENCY_TYPES } from '../../../data/platformData';

function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-ink-800">{label}</span>
      {children}
    </label>
  );
}
const inputCls = 'glass-input h-11 w-full rounded-xl px-3.5 text-[13px] text-ink-950';

function CreateDrawer({ onClose }) {
  const { createAgency } = usePlatform();
  const [name, setName] = useState('');
  const [acronym, setAcronym] = useState('');
  const [type, setType] = useState(AGENCY_TYPES[0]);

  return (
    <Drawer
      title="Create agency directly"
      subtitle="For pilot agencies such as PRRI. No application needed."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button disabled={!name.trim()} onClick={() => { createAgency(name.trim(), type, acronym.trim()); onClose(); }}>Create</Button>
        </>
      }
    >
      <Field label="Agency name"><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} autoFocus /></Field>
      <Field label="Acronym"><input className={inputCls} maxLength={10} value={acronym} onChange={(e) => setAcronym(e.target.value)} placeholder="e.g. PRRI" /></Field>
      <Field label="Agency type">
        <select className={inputCls} value={type} onChange={(e) => setType(e.target.value)}>
          {AGENCY_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </Field>
    </Drawer>
  );
}

function DetailDrawer({ agency, onClose }) {
  const { toggleSuspend } = usePlatform();
  const confirm = useConfirm();
  const onToggle = async () => {
    const ok = await (agency.suspended
      ? confirm({ tone: 'info', title: `Reactivate ${agency.name}?`, message: 'Everyone in this workspace will be able to sign in again.', confirmLabel: 'Reactivate agency' })
      : confirm({ tone: 'danger', title: `Suspend ${agency.name}?`, message: 'Everyone in this workspace will be blocked from signing in until you reactivate it.', detail: 'Their data is kept and nothing is deleted.', confirmLabel: 'Suspend agency' }));
    if (ok) { toggleSuspend(agency); onClose(); }
  };
  return (
    <Drawer
      title={agency.name}
      subtitle={`${agency.type} · ${agency.region}`}
      onClose={onClose}
      footer={
        <Button variant={agency.suspended ? 'primary' : 'danger'} onClick={onToggle}>
          {agency.suspended ? 'Reactivate agency' : 'Suspend agency'}
        </Button>
      }
    >
      <KeyValue rows={[
        ['Status', <Badge key="s" value={agency.suspended ? 'Suspended' : 'Active'} tone={agency.suspended ? 'bad' : 'ok'} />],
        ['Agency ID', agency.id],
        ['Created', agency.created],
        ['Agency Administrator', agency.admin],
        ['Usage', agency.usage],
      ]} />
      <p className="text-[13px] leading-relaxed text-ink-600">
        Suspending an agency blocks everyone in its workspace from signing in. Their data is kept and nothing is deleted. The Super Administrator can only see usage totals, never an agency’s private records.
      </p>
    </Drawer>
  );
}

export default function Agencies() {
  const { agencies } = usePlatform();
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [detailId, setDetailId] = useState(null);

  const rows = agencies.filter((a) => `${a.name} ${a.id}`.toLowerCase().includes(query.toLowerCase()));
  const detail = agencies.find((a) => a.id === detailId);

  const columns = [
    { key: 'name', label: 'Agency', render: (a) => <Cell title={a.name} sub={a.id} /> },
    { key: 'type', label: 'Type' },
    { key: 'region', label: 'Region' },
    { key: 'created', label: 'Created' },
    { key: 'status', label: 'Status', render: (a) => <Badge value={a.suspended ? 'Suspended' : 'Active'} tone={a.suspended ? 'bad' : 'ok'} /> },
  ];

  return (
    <PageWrapper>
      <PageHeader eyebrow="Platform" title="Agencies" subtitle="Every agency workspace on the platform.">
        <Button icon="plus" onClick={() => setCreating(true)}>Create agency directly</Button>
      </PageHeader>

      <Panel pad={false} className="overflow-hidden">
        <div className="p-4">
          <SearchInput value={query} onChange={setQuery} placeholder="Search agencies…" className="w-full sm:w-72" />
        </div>
        <DataTable columns={columns} rows={rows} onRowClick={(a) => setDetailId(a.id)} empty="No agency matches that search." />
      </Panel>

      {creating && <CreateDrawer onClose={() => setCreating(false)} />}
      {detail && <DetailDrawer key={detail.id} agency={detail} onClose={() => setDetailId(null)} />}
    </PageWrapper>
  );
}
