import { useMemo, useState } from 'react';
import { PageWrapper, PageHeader } from '../../layout/PageWrapper';
import { Button, Cell, DataTable, Panel, SearchInput, Select } from '../../ui';
import { downloadCsv } from '../../../lib/download';
import { usePlatform } from '../../../hooks/usePlatform';

export default function AuditLog() {
  const { audit, notify } = usePlatform();
  const [query, setQuery] = useState('');
  const [action, setAction] = useState('All actions');

  const actions = useMemo(() => [...new Set(audit.map((e) => e.action))], [audit]);
  const rows = audit.filter(
    (e) => (action === 'All actions' || e.action === action) && `${e.target} ${e.who}`.toLowerCase().includes(query.toLowerCase()),
  );

  const columns = [
    { key: 'at', label: 'When', render: (e) => <span className="whitespace-nowrap tabular-nums text-ink-600">{e.at}</span> },
    { key: 'who', label: 'Who' },
    { key: 'action', label: 'Action', render: (e) => <Cell title={e.action} /> },
    { key: 'target', label: 'Target' },
  ];

  return (
    <PageWrapper>
      <PageHeader
        eyebrow="Governance"
        title="Audit log"
        subtitle="Who did what and when for sensitive actions. Read-only."
      >
        <Button variant="secondary" icon="download" onClick={() => { downloadCsv('audit-log.csv', [['When', 'Who', 'Action', 'Target'], ...rows.map((e) => [e.at, e.who, e.action, e.target])]); notify?.('Audit log exported as CSV'); }}>Export CSV</Button>
      </PageHeader>
      <Panel pad={false} className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-4">
          <SearchInput value={query} onChange={setQuery} placeholder="Search target or person…" className="w-full sm:w-72" />
          <Select value={action} onChange={(e) => setAction(e.target.value)} aria-label="Action" className="sm:ml-auto">
            <option>All actions</option>
            {actions.map((a) => <option key={a}>{a}</option>)}
          </Select>
        </div>
        <DataTable columns={columns} rows={rows} empty="No entries match your filters." />
      </Panel>
    </PageWrapper>
  );
}
