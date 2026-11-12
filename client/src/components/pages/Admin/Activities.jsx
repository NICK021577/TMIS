import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageWrapper, PageHeader } from '../../layout/PageWrapper';
import { Badge, Button, Cell, DataTable, Icon, Metric, Modal, Panel, ProgressBar, SearchInput, Select, Tabs } from '../../ui';
import CreateWizard from '../../activity/CreateWizard';
import { useAuth } from '../../../context/AuthContext';
import { useStore } from '../../../hooks/useStore';
import { ACTIVITY_SUMMARY } from '../../../data/mockData';

export default function Activities() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { role } = useAuth();
  const { activities } = useStore();
  const isAdmin = role === 'Agency Administrator' || role === 'Super Admin';

  const [query, setQuery] = useState('');
  const [type, setType] = useState('All categories');
  const [tab, setTab] = useState('All');
  const [creating, setCreating] = useState(params.get('new') === '1');
  const [locked, setLocked] = useState(false);

  const openCreate = () => (isAdmin ? setCreating(true) : setLocked(true));
  const closeCreate = () => { setCreating(false); if (params.get('new')) setParams({}); };

  const rows = activities.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) &&
      (type === 'All categories' || a.type === type) &&
      (tab === 'All' || a.status === tab),
  );

  const columns = [
    { key: 'title', label: 'Activity', render: (a) => <Cell title={a.title} sub={a.type} /> },
    { key: 'date', label: 'Schedule', render: (a) => <span className="whitespace-nowrap text-ink-600">{a.date}</span> },
    { key: 'status', label: 'Status', render: (a) => <Badge value={a.status} /> },
    {
      key: 'participants', label: 'Participants',
      render: (a) => (
        <div className="w-28">
          <span className="text-xs text-ink-800">{a.participants} / {a.capacity}</span>
          <ProgressBar value={a.capacity ? (a.participants / a.capacity) * 100 : 0} className="mt-1.5" />
        </div>
      ),
    },
    { key: 'venue', label: 'Venue', render: (a) => <span className="text-ink-600">{a.venue}</span> },
    { key: 'more', label: '', render: (a) => <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/activities/${a.id}`); }}>Open</Button> },
  ];

  return (
    <PageWrapper>
      <PageHeader title="Activity management" subtitle="Plan, coordinate, and monitor your agency’s complete activity lifecycle.">
        <Button icon="plus" onClick={openCreate}>Create activity</Button>
      </PageHeader>

      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Metric label="All activities" value={ACTIVITY_SUMMARY.all + (activities.length - 3)} />
        <Metric label="Upcoming" value={ACTIVITY_SUMMARY.upcoming + activities.filter((a, i) => i < activities.length - 3 && a.status === 'Upcoming').length} />
        <Metric label="Ongoing" value={ACTIVITY_SUMMARY.ongoing} tone="brand" />
        <Metric label="Completed" value={ACTIVITY_SUMMARY.completed} />
      </div>

      <Tabs tabs={['All', 'Upcoming', 'Ongoing', 'Completed', 'Draft']} value={tab} onChange={setTab} />

      <Panel pad={false} className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-4">
          <SearchInput value={query} onChange={setQuery} placeholder="Search activities…" className="w-full sm:w-72" />
          <Select value={type} onChange={(e) => setType(e.target.value)} aria-label="Category" className="sm:ml-auto">
            <option>All categories</option>
            <option>Skills Training</option>
            <option>Extension Activity</option>
            <option>Seminar</option>
            <option>Workshop</option>
          </Select>
        </div>
        <DataTable columns={columns} rows={rows} onRowClick={(a) => navigate(`/activities/${a.id}`)} empty="Try a different search term or status." />
      </Panel>

      {creating && <CreateWizard onClose={closeCreate} />}
      {locked && (
        <Modal title="Only Agency Administrators can create activities" onClose={() => setLocked(false)} width={440}
          footer={<Button onClick={() => setLocked(false)}>OK</Button>}>
          <div className="flex items-center gap-3 text-[13px] text-ink-600"><Icon name="lock" size={18} className="text-ink-400" />Ask your Agency Administrator to create or approve this activity.</div>
        </Modal>
      )}
    </PageWrapper>
  );
}
