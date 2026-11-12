import { useState } from 'react';
import { PageWrapper, PageHeader } from '../../layout/PageWrapper';
import { Avatar, Badge, Button, Cell, DataTable, Drawer, Field, Metric, Panel, PanelTitle, ProgressBar, SearchInput, Select, Tabs, inputCls } from '../../ui';
import { INVITES, PEOPLE } from '../../../data/mockData';
import { useStore } from '../../../hooks/useStore';

function Registry({ notify }) {
  const { categories } = useStore();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('All');
  const [selected, setSelected] = useState(PEOPLE[0]);

  const rows = PEOPLE.filter(
    (p) =>
      (p.name.toLowerCase().includes(query.toLowerCase()) || p.agency.toLowerCase().includes(query.toLowerCase())) &&
      (cat === 'All' || p.category === cat),
  );

  const columns = [
    {
      key: 'name', label: 'Participant',
      render: (p) => (
        <div className="flex items-center gap-3">
          <Avatar name={p.name} size="sm" />
          <Cell title={p.name} sub={p.email} />
        </div>
      ),
    },
    { key: 'agency', label: 'Organization', render: (p) => <span className="text-ink-600">{p.agency}</span> },
    { key: 'category', label: 'Category', render: (p) => <span className="text-xs text-ink-600">{p.category}</span> },
    { key: 'location', label: 'Location', render: (p) => <span className="text-xs text-ink-600">{p.location}</span> },
    { key: 'activities', label: 'Activities', className: 'text-center', render: (p) => <span className="font-medium">{p.activities}</span> },
    { key: 'attendance', label: 'Attendance', render: (p) => <span className="font-medium">{p.attendance}</span> },
    { key: 'status', label: 'Status', render: (p) => <Badge value={p.status} /> },
  ];

  return (
    <>
    <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Metric label="Total participants" value="624" note="Across 24 activities" />
      <Metric label="Active this month" value="186" note="29.8% of registry" tone="brand" />
      <Metric label="Partner organizations" value="38" note="Municipal, cooperatives, schools" />
    </div>
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
      <Panel pad={false} className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-4">
          <SearchInput value={query} onChange={setQuery} placeholder="Search name or organization…" className="w-full sm:w-72" />
          <Select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category" className="sm:ml-auto">
            <option>All</option>
            {categories.filter((c) => !c.archived).map((c) => <option key={c.id}>{c.name}</option>)}
          </Select>
        </div>
        <DataTable columns={columns} rows={rows} onRowClick={setSelected} empty="No participant matches your filters." />
      </Panel>

      {selected && (
        <Panel className="h-fit">
          <div className="flex flex-col items-center text-center">
            <Avatar name={selected.name} size="lg" />
            <strong className="mt-3 text-base font-medium text-ink-950">{selected.name}</strong>
            <span className="text-[13px] text-ink-500">{selected.email}</span>
            <Badge value={selected.status} className="mt-2" />
          </div>
          <dl className="mt-5 space-y-3 border-t border-[var(--glass-divider)] pt-4 text-[13px]">
            {[
              ['Organization', selected.agency],
              ['Category', selected.category],
              ['Location', selected.location],
              ['Activities joined', selected.activities],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <dt className="text-ink-500">{k}</dt>
                <dd className="text-right font-medium text-ink-950">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-[13px]"><span className="text-ink-500">Attendance rate</span><strong>{selected.attendance}</strong></div>
            <ProgressBar value={parseInt(selected.attendance, 10)} />
          </div>
          <Button variant="secondary" className="mt-5 w-full" icon="message" onClick={() => notify?.(`Message sent to ${selected.name}`)}>Message participant</Button>
        </Panel>
      )}
    </div>
    </>
  );
}

function GenerateDrawer({ onClose, notify }) {
  const { categories } = useStore();
  const [cat, setCat] = useState('No preset');
  const [exp, setExp] = useState('2025-12-31');
  const [limit, setLimit] = useState(100);
  const [code] = useState(() => `PRRI-${Math.random().toString(36).slice(2, 6).toUpperCase()}`);
  return (
    <Drawer title="Generate invitation" subtitle="A code participants enter in the mobile app to join PRRI" onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={() => { notify?.(`Invitation ${code} created and link copied`); onClose(); }}>Generate</Button></>}>
      <Field label="Preset category" hint="A preset skips the category choice on mobile.">
        <select className={inputCls} value={cat} onChange={(e) => setCat(e.target.value)}><option>No preset</option>{categories.filter((c) => !c.archived).map((c) => <option key={c.id}>{c.name}</option>)}</select>
      </Field>
      <Field label="Expiry date"><input type="date" className={inputCls} value={exp} onChange={(e) => setExp(e.target.value)} /></Field>
      <Field label="Usage limit"><input type="number" min="1" className={inputCls} value={limit} onChange={(e) => setLimit(e.target.value)} /></Field>
    </Drawer>
  );
}

function Invitations({ notify }) {
  const [generating, setGenerating] = useState(false);
  const columns = [
    { key: 'code', label: 'Invite code', render: (i) => <code className="rounded-md bg-white/70 px-2 py-1 text-xs font-medium text-brand-800">{i.code}</code> },
    { key: 'category', label: 'Category' },
    { key: 'expires', label: 'Expires' },
    {
      key: 'used', label: 'Used',
      render: (i) => (
        <div className="w-32">
          <span className="text-xs font-medium">{i.used} / {i.limit}</span>
          <ProgressBar value={(i.used / i.limit) * 100} tone={i.used >= i.limit ? 'amber' : 'brand'} className="mt-1.5" />
        </div>
      ),
    },
    { key: 'status', label: 'Status', render: (i) => <Badge value={i.used >= i.limit ? 'Used up' : 'Active'} /> },
  ];
  return (
    <Panel pad={false} className="overflow-hidden">
      <div className="p-5">
        <PanelTitle title="Invitation links" subtitle="Share a code so participants can register under your agency.">
          <Button icon="plus" size="sm" onClick={() => notify?.('New invitation created')}>New invite</Button>
        </PanelTitle>
      </div>
      <DataTable columns={columns} rows={INVITES} />
      {generating && <GenerateDrawer onClose={() => setGenerating(false)} notify={notify} />}
    </Panel>
  );
}

export default function Participants({ notify }) {
  const [tab, setTab] = useState('registry');
  return (
    <PageWrapper>
      <PageHeader
        eyebrow="Workspace"
        title="Participant registry"
        subtitle="Manage participant profiles, registrations, and attendance history across activities."
      >
        <Button variant="secondary" icon="download" onClick={() => notify?.('Participant registry exported')}>Export</Button>
        <Button icon="plus" onClick={() => notify?.('Participant invitation form opened')}>Add participant</Button>
      </PageHeader>
      <Tabs tabs={[{ id: 'registry', label: 'Registry' }, { id: 'invites', label: 'Invitations' }]} value={tab} onChange={setTab} />
      {tab === 'registry' ? <Registry notify={notify} /> : <Invitations notify={notify} />}
    </PageWrapper>
  );
}
