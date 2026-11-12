import { useState } from 'react';
import { Avatar, Badge, Button, Cell, DataTable, Icon, Panel, PanelTitle, ProgressBar, Select } from '../ui';
import { ATTENDANCE } from '../../data/mockData';
import {
  AGENCY_ROLES, DAYS, OBJECTIVES, OUTCOMES, RESOURCES, ROLE_OPTIONS, SESSIONS, STAFF, WS,
} from '../../data/workspaceData';

const Detail = ({ label, value }) => (
  <div>
    <dt className="text-xs text-ink-500">{label}</dt>
    <dd className="mt-0.5 text-[13px] text-ink-950">{value}</dd>
  </div>
);

/* ── Overview ─────────────────────────────────────────────────────── */
export function OverviewTab({ activity, goTab, notify }) {
  const done = SESSIONS.filter((s) => s.status === 'Completed').length;
  const checks = [
    { icon: 'check', label: 'Program and sessions', value: `${done} of ${SESSIONS.length} done`, ok: done === SESSIONS.length },
    { icon: 'check', label: 'Resource persons',     value: '5 of 5', ok: true },
    { icon: 'clock', label: 'Participant slots',    value: `${activity.participants} of ${activity.capacity}`, ok: false },
    { icon: 'clock', label: 'Documents',            value: '6 of 9', ok: false },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.7fr_0.72fr]">
      <div className="space-y-4">
        <Panel>
          <PanelTitle title="Activity overview" />
          <p className="text-[13px] leading-relaxed text-ink-600">{WS.description}</p>
          <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            <Detail label="Funding source" value={WS.funding} />
            <Detail label="Activity lead" value={WS.lead} />
            <Detail label="Participating agencies" value={WS.agencies} />
            <Detail label="Target participants" value={`${activity.capacity} ${WS.audience}`} />
          </dl>
        </Panel>

        <Panel>
          <PanelTitle title="Program schedule" subtitle={`${DAYS.length} days, ${SESSIONS.length} learning sessions`}>
            <Button variant="ghost" size="sm" onClick={() => goTab('sessions')}>Manage sessions</Button>
          </PanelTitle>
          <div className="space-y-5">
            {DAYS.map((d) => (
              <div key={d.n}>
                <p className="mb-2 text-xs"><span className="font-medium text-brand-700">DAY {d.n}</span> <span className="text-ink-500">· {d.label}</span></p>
                <ul className="space-y-1">
                  {SESSIONS.filter((s) => s.day === d.n).map((s) => (
                    <li key={s.id} className="flex items-center gap-4 rounded-xl px-3 py-2.5 hover:bg-white/50">
                      <i className={`h-2 w-2 flex-shrink-0 rounded-full ${s.status === 'Completed' ? 'bg-emerald-400' : s.status === 'Ongoing' ? 'bg-brand-500' : 'bg-ink-400/60'}`} />
                      <span className="w-[92px] flex-shrink-0 text-xs tabular-nums text-ink-500">{s.time.split('–')[0]}</span>
                      <Cell title={s.title} sub={`${s.speaker}, ${s.room}`} />
                      <span className="ml-auto"><Badge value={s.status} /></span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="space-y-4">
        <Panel>
          <PanelTitle title="Activity readiness" />
          <strong className="block text-[28px] font-medium leading-none tracking-[-0.5px] text-ink-950">78%</strong>
          <ProgressBar value={78} className="my-3" />
          <ul className="space-y-2.5">
            {checks.map((c) => (
              <li key={c.label} className="flex items-center gap-2.5 text-xs">
                <Icon name={c.icon} size={14} className={c.ok ? 'text-emerald-500' : 'text-ink-400'} />
                <span className="flex-1 text-ink-600">{c.label}</span>
                <span className="text-ink-950">{c.value}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <PanelTitle title="Quick actions" />
          <ul className="space-y-1">
            {[
              { icon: 'scan', label: 'Open attendance', run: () => goTab('attendance') },
              { icon: 'link', label: 'Invite participants', run: () => notify?.('Invitation link copied') },
              { icon: 'file', label: 'Generate report', run: () => notify?.('Activity report generated') },
            ].map((q) => (
              <li key={q.label}>
                <button onClick={q.run} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] text-ink-800 transition-colors hover:bg-white/60">
                  <Icon name={q.icon} size={15} className="text-ink-500" />
                  <span className="flex-1">{q.label}</span>
                  <Icon name="arrow" size={14} className="text-ink-400" />
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

/* ── Plan & Agencies ──────────────────────────────────────────────── */
function EditableList({ title, subtitle, initial, placeholder, notify }) {
  const [rows, setRows] = useState(initial);
  const set = (i, v) => setRows((r) => r.map((x, j) => (j === i ? v : x)));
  return (
    <Panel>
      <PanelTitle title={title} subtitle={subtitle}>
        <Button variant="secondary" size="sm" onClick={() => notify?.(`${title} saved and published to the mobile app`)}>Save</Button>
      </PanelTitle>
      <ul className="space-y-2">
        {rows.map((r, i) => (
          <li key={i} className="flex items-center gap-2">
            <input value={r} onChange={(e) => set(i, e.target.value)} placeholder={placeholder} aria-label={`${title} ${i + 1}`}
              className="glass-input h-10 min-w-0 flex-1 rounded-xl px-3.5 text-[13px] text-ink-950 placeholder:text-ink-400" />
            <button onClick={() => setRows((l) => l.filter((_, j) => j !== i))} aria-label="Remove"
              className="grid h-8 w-8 place-items-center rounded-full text-ink-400 hover:bg-white/70 hover:text-danger">
              <Icon name="close" size={14} />
            </button>
          </li>
        ))}
      </ul>
      <Button variant="ghost" size="sm" icon="plus" className="mt-3" onClick={() => setRows((l) => [...l, ''])}>Add</Button>
    </Panel>
  );
}

export function PlanTab({ notify }) {
  const [roles, setRoles] = useState(AGENCY_ROLES);
  const columns = [
    { key: 'agency', label: 'Agency', render: (r) => <strong className="font-medium text-ink-950">{r.agency}</strong> },
    {
      key: 'role', label: 'Role in this activity',
      render: (r) => (
        <Select value={r.role} aria-label={`Role of ${r.agency}`}
          onChange={(e) => { setRoles((l) => l.map((x) => (x.id === r.id ? { ...x, role: e.target.value } : x))); notify?.(`${r.agency} is now ${e.target.value}`); }}>
          {ROLE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
        </Select>
      ),
    },
    { key: 'notes', label: 'Notes', render: (r) => <span className="text-ink-600">{r.notes}</span> },
  ];
  return (
    <div className="space-y-4">
      <Panel>
        <PanelTitle title="Training plan" subtitle="Prepared before the activity">
          <Button variant="secondary" size="sm" icon="file" onClick={() => notify?.('Program flow opened')}>Open program flow</Button>
        </PanelTitle>
        <dl className="grid gap-4 sm:grid-cols-3">
          <Detail label="Topics" value={WS.topics} />
          <Detail label="Program flow" value={WS.programFlow} />
          <Detail label="Documentation" value={WS.documentation} />
        </dl>
      </Panel>
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
        <EditableList title="Objectives" subtitle="What participants should be able to do. Shown in the mobile Overview." initial={OBJECTIVES} placeholder="Perform correct tapping on a mature tree" notify={notify} />
        <EditableList title="Expected outcomes" subtitle="Results the agency expects after the activity. Shown in the mobile Overview." initial={OUTCOMES} placeholder="Participants adopt improved tapping" notify={notify} />
      </div>
      <Panel pad={false} className="overflow-hidden">
        <div className="p-5 pb-3"><PanelTitle title="Agency roles" subtitle="An agency can hold a different role in each activity, and one activity can involve several agencies" /></div>
        <DataTable columns={columns} rows={roles} />
      </Panel>
    </div>
  );
}

/* ── Sessions ─────────────────────────────────────────────────────── */
export function SessionsTab({ notify }) {
  const columns = [
    { key: 'day', label: 'Day', render: (s) => <span className="whitespace-nowrap">Day {s.day} · {s.date}</span> },
    { key: 'period', label: 'Period', render: (s) => <Badge value={s.period} tone="info" variant="pill" /> },
    { key: 'time', label: 'Time', render: (s) => <span className="whitespace-nowrap text-ink-600">{s.time}</span> },
    { key: 'title', label: 'Session', render: (s) => <strong className="font-medium text-ink-950">{s.title}</strong> },
    { key: 'speaker', label: 'Resource person' },
    { key: 'room', label: 'Venue' },
    { key: 'files', label: 'Materials', render: (s) => <span className="text-ink-600">{s.files} {s.files === 1 ? 'file' : 'files'}</span> },
    { key: 'm', label: '', render: (s) => <Button variant="ghost" size="sm" onClick={() => notify?.(`Materials for “${s.title}” opened`)}>Manage</Button> },
  ];
  return (
    <Panel pad={false} className="overflow-hidden">
      <div className="p-5 pb-3">
        <PanelTitle title="Sessions" subtitle="Each session has an AM and PM period with its own QR attendance, materials and feedback">
          <Button size="sm" icon="plus" onClick={() => notify?.('Add session form opened')}>Add session</Button>
        </PanelTitle>
      </div>
      <DataTable columns={columns} rows={SESSIONS} />
    </Panel>
  );
}

/* ── Staffing ─────────────────────────────────────────────────────── */
export function StaffingTab({ notify }) {
  const columns = [
    { key: 'name', label: 'Name', render: (s) => <div className="flex items-center gap-3"><Avatar name={s.name.replace(/^(Ms|Mr|Dr)\.\s*/, '')} size="sm" /><strong className="font-medium text-ink-950">{s.name}</strong></div> },
    { key: 'role', label: 'Role' },
    { key: 'duty', label: 'Responsibility', render: (s) => <span className="text-ink-600">{s.duty}</span> },
    { key: 'status', label: 'Status', render: (s) => <Badge value={s.status} /> },
  ];
  return (
    <Panel pad={false} className="overflow-hidden">
      <div className="p-5 pb-3">
        <PanelTitle title="Staffing" subtitle="Facilitators run the activity day to day; committee members hold organizing roles">
          <Button size="sm" icon="plus" onClick={() => notify?.('Assign staff form opened')}>Assign staff</Button>
        </PanelTitle>
      </div>
      <DataTable columns={columns} rows={STAFF} />
    </Panel>
  );
}

/* ── Participants ─────────────────────────────────────────────────── */
export function ParticipantsTab({ activity, goTab, notify }) {
  const columns = [
    { key: 'name', label: 'Participant', render: (p) => <div className="flex items-center gap-3"><Avatar name={p.name} size="sm" /><Cell title={p.name} sub={p.agency} /></div> },
    { key: 'am', label: 'AM check-in', render: (p) => <Badge value={p.am} /> },
    { key: 'pm', label: 'PM check-in', render: (p) => <Badge value={p.pm} /> },
    { key: 'time', label: 'Timestamp', render: (p) => <span className="text-ink-600">{p.time}</span> },
  ];
  return (
    <Panel pad={false} className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-3">
        <div>
          <h2 className="text-sm font-medium text-ink-950">{activity.participants} registered</h2>
          <p className="text-xs text-ink-500">Attendance for this activity</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon="plus" onClick={() => notify?.('Add participant form opened')}>Add participant</Button>
          <Button size="sm" icon="scan" onClick={() => goTab('attendance')}>Open attendance</Button>
        </div>
      </div>
      <DataTable columns={columns} rows={ATTENDANCE} />
    </Panel>
  );
}

/* ── Resources ────────────────────────────────────────────────────── */
export function ResourcesTab({ notify }) {
  const columns = [
    { key: 'type', label: 'Type', render: (r) => <Badge value={r.type} tone="muted" variant="pill" /> },
    { key: 'resource', label: 'Resource', render: (r) => <strong className="font-medium text-ink-950">{r.resource}</strong> },
    { key: 'allocated', label: 'Allocated' },
    { key: 'status', label: 'Status', render: (r) => <Badge value={r.status} /> },
  ];
  return (
    <Panel pad={false} className="overflow-hidden">
      <div className="p-5 pb-3">
        <PanelTitle title="Resources" subtitle="People, venue, tools and inputs the activity draws on">
          <Button size="sm" icon="plus" onClick={() => notify?.('Add resource form opened')}>Add resource</Button>
        </PanelTitle>
      </div>
      <DataTable columns={columns} rows={RESOURCES} />
      <p className="border-t border-[var(--glass-divider)] px-5 py-3 text-xs text-ink-500">Resources can be linked to budget items from the Budget tab. TMIS does not manage inventory.</p>
    </Panel>
  );
}
