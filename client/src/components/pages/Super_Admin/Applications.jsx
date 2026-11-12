import { useState } from 'react';
import { PageWrapper, PageHeader } from '../../layout/PageWrapper';
import { Badge, Button, Cell, DataTable, Drawer, Icon, KeyValue, Metric, Panel, Select } from '../../ui';
import { usePlatform } from '../../../hooks/usePlatform';

function ReviewDrawer({ app, onClose }) {
  const { decideApplication } = usePlatform();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const closed = app.status === 'Approved' || app.status === 'Rejected';

  const decide = (status, why) => { decideApplication(app, status, why); onClose(); };

  const footer = closed ? null : rejecting ? (
    <>
      <Button variant="secondary" onClick={() => setRejecting(false)}>Back</Button>
      <Button variant="danger" disabled={!reason.trim()} onClick={() => decide('Rejected', reason.trim())}>Confirm rejection</Button>
    </>
  ) : (
    <>
      <Button variant="secondary" onClick={() => decide('Needs info')}>Request info</Button>
      <Button variant="secondary" onClick={() => setRejecting(true)}>Reject</Button>
      <Button onClick={() => decide('Approved')}>Approve</Button>
    </>
  );

  return (
    <Drawer title={app.agency} subtitle={`${app.acronym} · ${app.type} · ${app.region}`} onClose={onClose} footer={footer}>
      <KeyValue rows={[
        ['Status', <Badge key="s" value={app.status} />],
        ['Contact person', app.contact],
        ['Email', app.email],
        ['Submitted', app.submitted],
      ]} />

      <div className="glass-inset flex gap-3 rounded-2xl p-4">
        <Icon name="file" size={18} className="mt-0.5 flex-shrink-0 text-brand-600" />
        <div>
          <strong className="block text-[13px] text-ink-950">Verification documents</strong>
          <small className="text-xs text-ink-500">Authorization letter.pdf · MOA.pdf</small>
        </div>
      </div>

      {app.reason && (
        <div className="flex gap-3 rounded-2xl bg-amber-100/70 p-4 ring-1 ring-amber-200">
          <Icon name="alert" size={18} className="mt-0.5 flex-shrink-0 text-amber-700" />
          <div><strong className="block text-[13px] text-ink-950">Reason given</strong><small className="text-xs text-ink-700">{app.reason}</small></div>
        </div>
      )}

      {rejecting && (
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-ink-800">Reason for rejection</span>
          <textarea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="glass-input w-full rounded-xl px-3.5 py-2.5 text-[13px] text-ink-950"
          />
          <small className="text-xs text-ink-500">Required. Included in the email to the applicant.</small>
        </label>
      )}

      {!closed && !rejecting && (
        <p className="text-[13px] leading-relaxed text-ink-600">
          Approving creates the workspace and emails an invitation to the contact person, who becomes the first Agency Administrator.
        </p>
      )}
    </Drawer>
  );
}

export default function Applications() {
  const { applications, openApplications } = usePlatform();
  const [filter, setFilter] = useState('Open');
  const [reviewingId, setReviewingId] = useState(null);

  const rows = applications.filter((a) =>
    filter === 'All' ? true : filter === 'Open' ? openApplications.includes(a) : a.status === filter,
  );
  const reviewing = applications.find((a) => a.id === reviewingId);

  const columns = [
    { key: 'agency', label: 'Agency', render: (a) => <Cell title={a.agency} sub={a.acronym} /> },
    { key: 'type', label: 'Type' },
    { key: 'region', label: 'Region' },
    { key: 'contact', label: 'Contact' },
    { key: 'submitted', label: 'Submitted', render: (a) => <span className="whitespace-nowrap">{a.submitted}</span> },
    { key: 'status', label: 'Status', render: (a) => <Badge value={a.status} /> },
  ];

  return (
    <PageWrapper>
      <PageHeader
        eyebrow="Platform"
        title="Applications queue"
        subtitle="Sign-up creates an application. No workspace or login exists until it is approved."
      />

      <div className="mb-5 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Metric label="Open" value={openApplications.length} tone="warn" note="Awaiting a decision" />
        <Metric label="Approved" value={applications.filter((a) => a.status === 'Approved').length} />
        <Metric label="Rejected" value={applications.filter((a) => a.status === 'Rejected').length} />
        <Metric label="All applications" value={applications.length} />
      </div>

      <Panel pad={false} className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 p-4">
          <span className="text-[13px] text-ink-500">{rows.length} shown</span>
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Status filter">
            <option>Open</option>
            <option>All</option>
            <option>Pending</option>
            <option>Under review</option>
            <option>Needs info</option>
            <option>Approved</option>
            <option>Rejected</option>
          </Select>
        </div>
        <DataTable columns={columns} rows={rows} onRowClick={(a) => setReviewingId(a.id)} empty="No applications in this view." />
      </Panel>

      {reviewing && <ReviewDrawer key={reviewing.id} app={reviewing} onClose={() => setReviewingId(null)} />}
    </PageWrapper>
  );
}
