import { useState } from 'react';
import { Avatar, Badge, Button, DataTable, Icon, Panel, PanelTitle, Select, Switch } from '../ui';
import { CERT_ROWS, DOCUMENTS, FEEDBACK, OUTPUTS, OUTPUT_PHOTOS, REENTRY } from '../../data/workspaceData';

/* ── Documents ────────────────────────────────────────────────────── */
export function DocumentsTab({ notify }) {
  const columns = [
    { key: 'file', label: 'File', render: (d) => <span className="flex items-center gap-2.5"><Icon name="file" size={15} className="text-brand-600" /><strong className="font-medium text-ink-950">{d.file}</strong></span> },
    { key: 'type', label: 'Type', render: (d) => <Badge value={d.type} tone="muted" variant="pill" /> },
    { key: 'uploaded', label: 'Uploaded' },
    { key: 'size', label: 'Size' },
    { key: 'dl', label: '', render: (d) => <Button variant="ghost" size="sm" onClick={() => notify?.(`Downloading ${d.file}`)}>Download</Button> },
  ];
  return (
    <Panel pad={false} className="overflow-hidden">
      <div className="p-5 pb-3">
        <PanelTitle title="Documents" subtitle="Scanned copies of paper documents related to the activity">
          <Button size="sm" icon="upload" onClick={() => notify?.('Upload scan dialog opened')}>Upload scan</Button>
        </PanelTitle>
      </div>
      <DataTable columns={columns} rows={DOCUMENTS} />
      <p className="border-t border-[var(--glass-divider)] px-5 py-3 text-xs text-ink-500">Receipts attached in the Budget tab also appear here with type Receipt.</p>
    </Panel>
  );
}

/* ── Outputs ──────────────────────────────────────────────────────── */
export function OutputsTab({ notify }) {
  const columns = [
    { key: 'output', label: 'Output', render: (o) => <strong className="font-medium text-ink-950">{o.output}</strong> },
    { key: 'planned', label: 'Planned' },
    { key: 'conducted', label: 'Conducted' },
    { key: 'status', label: 'Status', render: (o) => <Badge value={o.status} /> },
  ];
  return (
    <div className="space-y-4">
      <Panel pad={false} className="overflow-hidden">
        <div className="p-5 pb-3">
          <PanelTitle title="Planned vs. conducted" subtitle="Outputs compared against the training plan">
            <Button variant="secondary" size="sm" onClick={() => notify?.('Report generated')}>Generate report</Button>
          </PanelTitle>
        </div>
        <DataTable columns={columns} rows={OUTPUTS} />
      </Panel>
      <Panel>
        <PanelTitle title="Participant output photos" subtitle="Photos contributed from the mobile app" />
        <ul className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}>
          {OUTPUT_PHOTOS.map((p) => (
            <li key={p.caption} className="text-center">
              <span className="mx-auto mb-2 grid h-24 w-full place-items-center rounded-2xl bg-gradient-to-br from-brand-100 to-[#ddd6fa] text-brand-600"><Icon name="image" size={26} /></span>
              <strong className="block text-xs font-medium text-ink-950">{p.caption}</strong>
              <small className="text-[11px] text-ink-500">{p.by}</small>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

/* ── Feedback ─────────────────────────────────────────────────────── */
export function FeedbackTab({ notify }) {
  const columns = [
    { key: 'session', label: 'Session', render: (f) => <strong className="font-medium text-ink-950">{f.session}</strong> },
    { key: 'rating', label: 'Average rating', render: (f) => <span className="flex items-center gap-1.5"><Icon name="star" size={14} className="text-amber-400" />{f.rating} <span className="text-ink-400">/ 5</span></span> },
    { key: 'responses', label: 'Responses' },
  ];
  return (
    <Panel pad={false} className="overflow-hidden">
      <div className="p-5 pb-3">
        <PanelTitle title="Feedback" subtitle="Ratings are collected per session from the mobile app">
          <Button variant="secondary" size="sm" icon="download" onClick={() => notify?.('Feedback exported')}>Export</Button>
        </PanelTitle>
      </div>
      <DataTable columns={columns} rows={FEEDBACK} />
    </Panel>
  );
}

/* ── Reentry Plans ────────────────────────────────────────────────── */
export function ReentryTab({ notify }) {
  const columns = [
    { key: 'name', label: 'Participant', render: (r) => <div className="flex items-center gap-3"><Avatar name={r.name} size="sm" /><strong className="font-medium text-ink-950">{r.name}</strong></div> },
    { key: 'plan', label: 'Planned application', render: (r) => <span className="text-ink-600">{r.plan}</span> },
    { key: 'target', label: 'Target date' },
    { key: 'status', label: 'Status', render: (r) => <Badge value={r.status} /> },
  ];
  return (
    <Panel pad={false} className="overflow-hidden">
      <div className="p-5 pb-3">
        <PanelTitle title="Reentry plans" subtitle="Each participant’s commitment to apply what they learned, including training they will conduct themselves">
          <Button variant="secondary" size="sm" onClick={() => notify?.('Reminder sent to 1 participant with a pending plan')}>Remind pending</Button>
        </PanelTitle>
      </div>
      <DataTable columns={columns} rows={REENTRY} />
    </Panel>
  );
}

/* ── Certificates ─────────────────────────────────────────────────── */
export function CertificatesTab({ notify }) {
  const [minAtt, setMinAtt] = useState('80');
  const [rules, setRules] = useState({ feedback: true, reentry: true, auto: true });
  const [rows, setRows] = useState(CERT_ROWS);
  const eligible = rows.filter((r) => r.cert === 'Eligible').length;

  const release = () => {
    setRows((l) => l.map((r) => (r.cert === 'Eligible' ? { ...r, cert: 'Released' } : r)));
    notify?.(`${eligible} certificate${eligible === 1 ? '' : 's'} released`);
  };

  const columns = [
    { key: 'name', label: 'Participant', render: (r) => <div className="flex items-center gap-3"><Avatar name={r.name} size="sm" /><strong className="font-medium text-ink-950">{r.name}</strong></div> },
    { key: 'attended', label: 'Sessions attended' },
    { key: 'feedback', label: 'Feedback', render: (r) => <Badge value={r.feedback} tone={r.feedback === 'Done' ? 'ok' : 'warn'} /> },
    { key: 'reentry', label: 'Reentry plan', render: (r) => <Badge value={r.reentry} /> },
    { key: 'cert', label: 'Certificate', render: (r) => <Badge value={r.cert} /> },
  ];

  return (
    <div className="space-y-4">
      <Panel>
        <PanelTitle title="Certificate rules" subtitle="Set once per activity. Participants see their progress in Plans & certs on the mobile app." />
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <label className="flex items-center gap-3 text-[13px] text-ink-600">
            Minimum attendance
            <Select value={minAtt} onChange={(e) => setMinAtt(e.target.value)} aria-label="Minimum attendance">
              <option value="100">100% of sessions</option>
              <option value="80">80% of sessions</option>
              <option value="60">60% of sessions</option>
            </Select>
          </label>
          {[['feedback', 'Require session feedback'], ['reentry', 'Require reentry plan'], ['auto', 'Release automatically when eligible']].map(([k, label]) => (
            <label key={k} className="flex items-center gap-2.5 text-[13px] text-ink-600">
              <Switch checked={rules[k]} onChange={(v) => setRules((r) => ({ ...r, [k]: v }))} label={label} />
              {label}
            </label>
          ))}
        </div>
      </Panel>
      <Panel pad={false} className="overflow-hidden">
        <div className="p-5 pb-3">
          <PanelTitle title="Participant eligibility" subtitle="Computed from attendance, feedback and reentry plan records">
            <Button size="sm" icon="award" disabled={!eligible} onClick={release}>Release certificates{eligible ? ` (${eligible})` : ''}</Button>
          </PanelTitle>
        </div>
        <DataTable columns={columns} rows={rows} />
      </Panel>
    </div>
  );
}
