import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper, PageHeader } from '../../layout/PageWrapper';
import { ActionIcon, Avatar, Badge, Button, Cell, DataTable, Drawer, Field, KeyValue, Metric, Panel, PanelTitle, ProgressBar, SearchInput, Select, Tabs, inputCls } from '../../ui';
import AddParticipantModal from '../../modals/AddParticipantModal';
import GenerateInviteModal from '../../modals/GenerateInviteModal';
import { useConfirm } from '../../modals/confirmContext';
import { copyText, downloadCsv } from '../../../lib/download';
import { useStore } from '../../../hooks/useStore';

function ProfileDrawer({ person, onClose, onMessage, notify }) {
  const invited = person.status === 'Invited';
  return (
    <Drawer title="Participant profile" subtitle={invited ? 'Waiting for the participant to complete their profile' : `${person.agency || 'No organization'}`} onClose={onClose}
      footer={invited
        ? <Button icon="send" onClick={() => { notify?.(`Invitation resent to ${person.email}`); onClose(); }}>Resend invitation</Button>
        : <Button icon="message" onClick={() => onMessage(person)}>Message participant</Button>}>
      <div className="flex flex-col items-center text-center">
        <Avatar name={person.name || person.email} size="lg" />
        <strong className="mt-3 text-base font-medium text-ink-950">{person.name || 'Awaiting profile'}</strong>
        <span className="text-[13px] text-ink-500">{person.email}</span>
        <Badge value={person.status} className="mt-2" />
      </div>
      <KeyValue rows={[
        ['Organization', person.agency || '—'],
        ['Category', person.category],
        ['Location', person.location || '—'],
        ['Activities joined', person.activities],
        ['Registered', person.registered ?? '—'],
      ]} />
      {!invited && (
        <div>
          <div className="mb-1.5 flex justify-between text-[13px]"><span className="text-ink-500">Attendance rate</span><strong>{person.attendance}</strong></div>
          <ProgressBar value={parseInt(person.attendance, 10) || 0} />
        </div>
      )}
    </Drawer>
  );
}

function Registry({ notify }) {
  const navigate = useNavigate();
  const { categories, people } = useStore();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('All');
  const [viewing, setViewing] = useState(null);

  const rows = people.filter(
    (p) =>
      ((p.name || p.email).toLowerCase().includes(query.toLowerCase()) || p.agency.toLowerCase().includes(query.toLowerCase())) &&
      (cat === 'All' || p.category === cat),
  );

  const message = (p) => navigate('/messaging', { state: { to: p.name } });

  const columns = [
    {
      key: 'name', label: 'Participant',
      render: (p) => (
        <div className="flex items-center gap-3">
          <Avatar name={p.name || p.email} size="sm" />
          {p.name ? <Cell title={p.name} sub={p.email} /> : <Cell title={<span className="font-normal italic text-ink-500">Awaiting profile</span>} sub={p.email} />}
        </div>
      ),
    },
    { key: 'agency', label: 'Organization', render: (p) => <span className="text-ink-600">{p.agency || '—'}</span> },
    { key: 'category', label: 'Category', render: (p) => <span className="text-xs text-ink-600">{p.category}</span> },
    { key: 'location', label: 'Location', render: (p) => <span className="text-xs text-ink-600">{p.location || '—'}</span> },
    { key: 'activities', label: 'Activities', className: 'text-center', render: (p) => <span className="font-medium">{p.activities}</span> },
    { key: 'attendance', label: 'Attendance', render: (p) => <span className="font-medium">{p.attendance}</span> },
    { key: 'status', label: 'Status', render: (p) => <Badge value={p.status} /> },
    {
      key: 'actions', label: 'Actions', className: 'text-right',
      render: (p) => (
        <div className="flex justify-start gap-0.5">
          <ActionIcon icon="eye" label="View profile" onClick={() => setViewing(p)} />
          {p.status === 'Invited'
            ? <ActionIcon icon="send" label="Resend invitation" onClick={() => notify?.(`Invitation resent to ${p.email}`)} />
            : <ActionIcon icon="message" label="Message participant" tone="brand" onClick={() => message(p)} />}
        </div>
      ),
    },
  ];

  const active = people.filter((p) => p.status !== 'Invited').length;
  const invited = people.length - active;

  return (
    <>
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Metric label="Total participants" value={624 + (people.length - 8)} note="Across 24 activities" />
        <Metric label="Active this month" value="186" note="29.8% of registry" tone="brand" />
        <Metric label="Awaiting profile" value={invited} note="Invited, not yet completed" />
      </div>
      <Panel pad={false} className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-4">
          <SearchInput value={query} onChange={setQuery} placeholder="Search name or organization…" className="w-full sm:w-72" />
          <Select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category" className="sm:ml-auto">
            <option>All</option>
            {categories.filter((c) => !c.archived).map((c) => <option key={c.id}>{c.name}</option>)}
          </Select>
        </div>
        <DataTable columns={columns} rows={rows} onRowClick={setViewing} empty="No participant matches your filters." />
      </Panel>
      {viewing && <ProfileDrawer person={viewing} onClose={() => setViewing(null)} onMessage={message} notify={notify} />}
    </>
  );
}

function Invitations({ notify }) {
  const { invites, setInvites } = useStore();
  const confirm = useConfirm();
  const [generating, setGenerating] = useState(false);

  const copy = async (i) => notify?.((await copyText(`https://unifyle.app/join/${i.code}`)) ? `Link for ${i.code} copied` : 'Could not copy the link');
  const revoke = async (i) => {
    if (await confirm({ tone: 'danger', title: `Revoke ${i.code}?`, message: 'The code stops working right away. People who already joined keep their account.', confirmLabel: 'Revoke invitation' })) {
      setInvites((l) => l.filter((x) => x.id !== i.id));
      notify?.(`Invitation ${i.code} revoked`);
    }
  };

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
    {
      key: 'actions', label: 'Actions', className: 'text-right',
      render: (i) => (
        <div className="flex justify-start gap-0.5">
          <ActionIcon icon="link" tone="brand" label="Copy invite link" onClick={() => copy(i)} />
          <ActionIcon icon="trash" tone="danger" label="Revoke invitation" onClick={() => revoke(i)} />
        </div>
      ),
    },
  ];
  return (
    <Panel pad={false} className="overflow-hidden">
      <div className="p-5">
        <PanelTitle title="Invitation links" subtitle="Share a code so participants can register under your agency.">
          <Button icon="plus" size="sm" onClick={() => setGenerating(true)}>New invite</Button>
        </PanelTitle>
      </div>
      <DataTable columns={columns} rows={invites} empty="No invitations yet." />
      {generating && <GenerateInviteModal onClose={() => setGenerating(false)} notify={notify} />}
    </Panel>
  );
}

export default function Participants({ notify }) {
  const [tab, setTab] = useState('registry');
  const [adding, setAdding] = useState(false);
  const { people } = useStore();
  return (
    <PageWrapper>
      <PageHeader
        eyebrow="Workspace"
        title="Participant registry"
        subtitle="Manage participant profiles, registrations, and attendance history across activities."
      >
        <Button variant="secondary" icon="download" onClick={() => { downloadCsv('participants.csv', [['Name', 'Email', 'Organization', 'Category', 'Location', 'Activities', 'Attendance', 'Status'], ...people.map((p) => [p.name || '(awaiting profile)', p.email, p.agency, p.category, p.location, p.activities, p.attendance, p.status])]); notify?.('Participant registry exported as CSV'); }}>Export</Button>
        <Button icon="plus" onClick={() => setAdding(true)}>Add participant</Button>
      </PageHeader>
      <Tabs tabs={[{ id: 'registry', label: 'Registry' }, { id: 'invites', label: 'Invitations' }]} value={tab} onChange={setTab} />
      {tab === 'registry' ? <Registry notify={notify} /> : <Invitations notify={notify} />}
      {adding && <AddParticipantModal onClose={() => setAdding(false)} />}
    </PageWrapper>
  );
}
