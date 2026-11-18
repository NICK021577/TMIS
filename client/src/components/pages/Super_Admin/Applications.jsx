import { useConfirm } from '../../modals/confirmContext';
import { useState } from 'react';
import { PageWrapper, PageHeader } from '../../layout/PageWrapper';
import { ActionIcon, Badge, Button, Cell, DataTable, Drawer, Icon, KeyValue, Metric, Panel, Select } from '../../ui';
import { contactName } from '../../../data/platformData';
import { usePlatform } from '../../../hooks/usePlatform';

const REQUIRED = [
  { id: 'authLetter', label: 'Authorization letter' },
  { id: 'moa', label: 'Memorandum of Agreement (MOA)' },
  { id: 'validId', label: 'Valid ID of the contact person' },
];

function ReviewDrawer({ app, onClose }) {
  const { decideApplication, notify } = usePlatform();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const closed = app.status === 'Approved' || app.status === 'Rejected';
  const missing = REQUIRED.some((r) => !app.docs.find((d) => d.id === r.id));

  const confirm = useConfirm();
  const decide = async (status, why) => {
    const who = contactName(app);
    const ask = {
      Approved:     { tone: 'info',   title: `Approve ${app.agency}?`, message: `This creates the workspace and emails an invitation to ${who}, who becomes the first Agency Administrator.`, confirmLabel: 'Approve application' },
      Rejected:     { tone: 'danger', title: `Reject ${app.agency}?`, message: `${who} will be told the application was rejected, along with the reason you gave.`, detail: 'This cannot be undone. They can apply again.', confirmLabel: 'Reject application' },
      'Needs info': { tone: 'warn',   title: 'Request more information?', message: `${who} will receive an email asking for more information.`, confirmLabel: 'Send request' },
    }[status];
    if (!(await confirm(ask))) return;
    decideApplication(app, status, why);
    onClose();
  };

  const footer = closed ? null : rejecting ? (
    <>
      <Button variant="secondary" onClick={() => setRejecting(false)}>Back</Button>
      <Button variant="danger" disabled={!reason.trim()} onClick={() => decide('Rejected', reason.trim())}>Confirm rejection</Button>
    </>
  ) : (
    <>
      <Button variant="secondary" onClick={() => decide('Needs info')}>Request info</Button>
      <Button variant="secondary" onClick={() => setRejecting(true)}>Reject</Button>
      <Button disabled={missing} title={missing ? 'A required document is missing' : undefined} onClick={() => decide('Approved')}>Approve</Button>
    </>
  );

  return (
    <Drawer title={app.agency} subtitle={`${app.acronym} · ${app.type} · ${app.region}`} onClose={onClose} footer={footer} width={540}>
      <KeyValue rows={[
        ['Status', <Badge key="s" value={app.status} />],
        ['Submitted', app.submitted],
      ]} />

      <section className="space-y-2">
        <h3 className="text-[11px] font-medium uppercase tracking-wide text-ink-500">Agency</h3>
        <KeyValue rows={[
          ['Agency name', app.agency],
          ['Acronym', app.acronym],
          ['Type', app.type],
          ['Region', app.region],
        ]} />
      </section>

      <section className="space-y-2">
        <h3 className="text-[11px] font-medium uppercase tracking-wide text-ink-500">Contact person</h3>
        <KeyValue rows={[
          ['First name', app.firstName],
          ['Middle name', app.middleName || '—'],
          ['Last name', app.lastName],
          ['Email', app.email],
          ['Contact number', app.phone],
        ]} />
      </section>

      <section className="space-y-2">
        <h3 className="text-[11px] font-medium uppercase tracking-wide text-ink-500">Supporting documents</h3>
        <ul className="space-y-2">
          {REQUIRED.map((r) => {
            const doc = app.docs.find((d) => d.id === r.id);
            return (
              <li key={r.id} className={`flex items-center gap-3 rounded-2xl p-3 ${doc ? 'glass-inset' : 'bg-red-50/70 ring-1 ring-red-200'}`}>
                <span className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg ${doc ? 'bg-white text-brand-600' : 'bg-white text-danger'}`}><Icon name={doc ? 'file' : 'alert'} size={16} /></span>
                <span className="min-w-0 flex-1">
                  <small className="block text-[11px] text-ink-500">{r.label}</small>
                  {doc
                    ? <strong className="block truncate text-[13px] font-medium text-ink-950">{doc.file} <span className="font-normal text-ink-500">· {doc.size}</span></strong>
                    : <strong className="block text-[13px] font-medium text-danger">Not submitted</strong>}
                </span>
                {doc && (
                  <>
                    <ActionIcon icon="eye" label="View document" onClick={() => notify?.(`Opening ${doc.file}`)} />
                    <ActionIcon icon="download" label="Download" tone="brand" onClick={() => notify?.(`Downloading ${doc.file}`)} />
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </section>

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
    { key: 'contact', label: 'Contact person', render: (a) => <Cell title={contactName(a)} sub={a.email} /> },
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
