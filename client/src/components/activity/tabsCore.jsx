import { useConfirm } from '../modals/confirmContext';
import { useRef, useState } from 'react';
import { ActionIcon, Avatar, Badge, Button, Cell, DataTable, Icon, Panel, PanelTitle, ProgressBar, Select } from '../ui';
import { useStore } from '../../hooks/useStore';
import { useEditing } from './editContext';
import AddDayModal from '../modals/AddDayModal';
import DocumentPreviewModal, { downloadDoc } from '../modals/DocumentPreviewModal';
import ResourceModal from '../modals/ResourceModal';
import SessionMaterialsModal from '../modals/SessionMaterialsModal';
import SessionModal from '../modals/SessionModal';
import { copyText, downloadFile, makePdf } from '../../lib/download';
import { estOf } from '../../lib/budgetModel';
import { computeReadiness } from '../../lib/readiness';
import AddParticipantModal from '../modals/AddParticipantModal';
import AssignStaffModal from '../modals/AssignStaffModal';
import {
  AGENCY_ROLES, OBJECTIVES, OUTCOMES, ROLE_OPTIONS, WS,
} from '../../data/workspaceData';

const Detail = ({ label, value }) => (
  <div>
    <dt className="text-xs text-ink-500">{label}</dt>
    <dd className="mt-0.5 text-[13px] text-ink-950">{value}</dd>
  </div>
);

/* ── Overview ─────────────────────────────────────────────────────── */
const lineInput = 'glass-input h-10 w-full rounded-xl px-3.5 text-[13px] text-ink-950 placeholder:text-ink-400';

function BulletList({ title, items }) {
  return (
    <div>
      <h3 className="text-xs font-medium text-ink-500">{title}</h3>
      {items.length ? (
        <ul className="mt-2 space-y-1.5">
          {items.map((t) => (
            <li key={t} className="flex gap-2.5 text-[13px] leading-snug text-ink-800"><i className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />{t}</li>
          ))}
        </ul>
      ) : <p className="mt-2 text-[13px] text-ink-400">Not written yet. Add them in Plan &amp; Agencies.</p>}
    </div>
  );
}

export function OverviewTab({ activity, goTab, notify }) {
  const editing = useEditing();
  const { sessions, items, profile, staffDays, resources, documents, feedbackForms, getDetails, setDetails, updateActivity } = useStore();
  const d = getDetails(activity);
  const { checks, percent } = computeReadiness({ activity, details: d, sessions, staffDays, resources, documents, items, feedbackForms });
  const upNext = sessions.find((s) => s.status === 'Ongoing') ?? sessions.find((s) => s.status === 'Upcoming');
  const ordered = [...sessions].sort((a, b) => a.day - b.day || (a.period === b.period ? 0 : a.period === 'AM' ? -1 : 1));
  const set = (patch) => setDetails(activity.id, patch);
  const dash = (v) => v || <span className="text-ink-400">Not set</span>;

  const report = () => {
    const mine = items.filter((i) => i.activityId === activity.id);
    const allocated = mine.reduce((t, i) => t + estOf(i), 0);
    const expenses = mine.reduce((t, i) => t + (i.actual ?? 0), 0);
    downloadFile(`Activity_Report_${activity.id}.pdf`, makePdf(`Activity report: ${activity.title}`, [
      `Agency: ${profile.name}`, `Type: ${activity.type}`, `Dates: ${activity.date}`, `Venue: ${activity.venue}`, `Status: ${activity.status}`, `Readiness: ${percent}%`, '',
      `Participants: ${activity.participants} of ${activity.capacity}`, `Sessions: ${sessions.length}`, '',
      `Allocated budget: PHP ${allocated.toLocaleString('en-PH')}`, `Expenses: PHP ${expenses.toLocaleString('en-PH')}`, `Remaining: PHP ${(allocated - expenses).toLocaleString('en-PH')}`,
    ]));
    notify?.('Activity report downloaded');
  };
  const actions = [
    { icon: 'scan', label: 'Open attendance', run: () => goTab('attendance') },
    { icon: 'link', label: 'Invite participants', run: async () => notify?.((await copyText(`https://unifyle.app/join/${profile.shortName}-${activity.id}`)) ? 'Invitation link copied' : 'Could not copy the link') },
    { icon: 'file', label: 'Generate report', run: report },
  ];

  return (
    <div className="space-y-4">
      {/* Row 1: both cards share one height */}
      <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-[1.7fr_1fr]">
        <Panel>
          <PanelTitle title="Activity overview" subtitle={editing ? 'Editing. Changes show immediately; Cancel puts them back.' : undefined} />

          {editing ? (
            <div className="space-y-4">
              <label className="block space-y-1.5"><span className="text-xs text-ink-600">Description</span>
                <textarea rows={3} value={d.description} onChange={(e) => set({ description: e.target.value })} className="glass-input w-full rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed text-ink-950" /></label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5"><span className="text-xs text-ink-600">Funding source</span><input className={lineInput} value={d.funding} onChange={(e) => set({ funding: e.target.value })} /></label>
                <label className="block space-y-1.5"><span className="text-xs text-ink-600">Activity lead</span><input className={lineInput} value={d.lead} onChange={(e) => set({ lead: e.target.value })} /></label>
                <label className="block space-y-1.5"><span className="text-xs text-ink-600">Participating agencies</span><input className={lineInput} value={d.agencies} onChange={(e) => set({ agencies: e.target.value })} placeholder="e.g. 6 partner organizations" /></label>
                <div className="grid grid-cols-[96px_1fr] gap-3">
                  <label className="block space-y-1.5"><span className="text-xs text-ink-600">Target</span><input type="number" min="1" className={lineInput} value={activity.capacity} onChange={(e) => updateActivity(activity.id, { capacity: Math.max(1, Number(e.target.value) || 1) })} /></label>
                  <label className="block space-y-1.5"><span className="text-xs text-ink-600">Who</span><input className={lineInput} value={d.audience} onChange={(e) => set({ audience: e.target.value })} placeholder="e.g. rubber farmers" /></label>
                </div>
                <label className="block space-y-1.5"><span className="text-xs text-ink-600">Topics</span><input className={lineInput} value={d.topics} onChange={(e) => set({ topics: e.target.value })} /></label>
                <label className="block space-y-1.5"><span className="text-xs text-ink-600">Documentation</span><input className={lineInput} value={d.documentation} onChange={(e) => set({ documentation: e.target.value })} placeholder="e.g. Photo, attendance and report" /></label>
              </div>
            </div>
          ) : (
            <>
              <p className="text-[13px] leading-relaxed text-ink-600">{d.description || <span className="text-ink-400">No description yet. Press Edit activity to write one.</span>}</p>
              <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                <Detail label="Funding source" value={dash(d.funding)} />
                <Detail label="Activity lead" value={dash(d.lead)} />
                <Detail label="Participating agencies" value={dash(d.agencies)} />
                <Detail label="Target participants" value={`${activity.capacity} ${d.audience}`} />
                <Detail label="Topics" value={dash(d.topics)} />
                <Detail label="Documentation" value={dash(d.documentation)} />
              </dl>
            </>
          )}

          <div className="mt-6 grid gap-6 border-t border-[var(--glass-divider)] pt-5 sm:grid-cols-2">
            <BulletList title="Objectives" items={d.objectives} />
            <BulletList title="Expected outcomes" items={d.outcomes} />
          </div>
        </Panel>

        <Panel className="flex flex-col">
          <PanelTitle title="Activity readiness" subtitle="Across every tab of this activity" />
          <div className="flex items-end justify-between">
            <strong className="block text-[28px] font-medium leading-none tracking-[-0.5px] text-ink-950">{percent}%</strong>
            <span className="text-xs text-ink-500">{checks.filter((c) => c.ok).length} of {checks.length} ready</span>
          </div>
          <ProgressBar value={percent} tone={percent >= 80 ? 'ok' : 'brand'} className="my-3" />
          <ul className="space-y-0.5">
            {checks.map((c) => (
              <li key={c.id}>
                <button onClick={() => goTab(c.tab)} className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-left text-xs transition-colors hover:bg-white/60">
                  <Icon name={c.ok ? 'check' : 'clock'} size={14} className={c.ok ? 'text-emerald-500' : 'text-ink-500'} />
                  <span className="flex-1 text-ink-700">{c.label}</span>
                  <span className={c.ok ? 'text-ink-950' : 'font-medium text-amber-700'}>{c.value}</span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Row 2: the schedule beside two stacked cards that end at the same line */}
      <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-[1.7fr_1fr]">
        <Panel>
          <PanelTitle title="Program schedule" subtitle={`${staffDays.length} days, ${sessions.length} learning sessions`}>
            <Button variant="ghost" size="sm" onClick={() => goTab('sessions')}>Manage sessions</Button>
          </PanelTitle>
          <div className="space-y-5">
            {staffDays.map((day) => (
              <div key={day.n}>
                <p className="mb-2 text-xs"><span className="font-medium text-brand-700">DAY {day.n}</span> <span className="text-ink-500">· {day.label}</span></p>
                <ul className="space-y-1">
                  {ordered.filter((s) => s.day === day.n).map((s) => (
                    <li key={s.id} className="flex items-center gap-4 rounded-xl px-3 py-2.5 hover:bg-white/50">
                      <i className={`h-2 w-2 flex-shrink-0 rounded-full ${s.status === 'Completed' ? 'bg-emerald-400' : s.status === 'Ongoing' ? 'bg-brand-500' : 'bg-ink-400/60'}`} />
                      <span className="w-[92px] flex-shrink-0 text-xs tabular-nums text-ink-500">{s.time.split('–')[0]}</span>
                      <Cell title={s.title} sub={`${s.speaker}, ${s.room}`} />
                      <span className="ml-auto"><Badge value={s.status} /></span>
                    </li>
                  ))}
                  {!ordered.some((s) => s.day === day.n) && <li className="px-3 py-2 text-xs text-ink-500">No sessions on this day yet.</li>}
                </ul>
              </div>
            ))}
          </div>
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel>
            <PanelTitle title="Quick actions" />
            <ul className="space-y-1">
              {actions.map((q) => (
                <li key={q.label}>
                  <button onClick={q.run} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] text-ink-800 transition-colors hover:bg-white/60">
                    <Icon name={q.icon} size={15} className="text-ink-600" />
                    <span className="flex-1">{q.label}</span>
                    <Icon name="arrow" size={14} className="text-ink-400" />
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel className="flex flex-1 flex-col">
            <PanelTitle title={upNext?.status === 'Ongoing' ? 'Happening now' : 'Up next'} />
            {upNext ? (
              <>
                <strong className="text-[15px] font-medium leading-snug text-ink-950">{upNext.title}</strong>
                <dl className="mt-3 space-y-2 text-xs">
                  {[['When', `Day ${upNext.day}, ${upNext.date} · ${upNext.time}`], ['Resource person', upNext.speaker], ['Venue', upNext.room]].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4"><dt className="text-ink-500">{k}</dt><dd className="text-right text-ink-950">{v}</dd></div>
                  ))}
                </dl>
                <Button variant="secondary" size="sm" icon="scan" className="mt-auto self-start" onClick={() => goTab('attendance')}>Open attendance</Button>
              </>
            ) : <p className="text-[13px] text-ink-500">Every session is complete.</p>}
          </Panel>
        </div>
      </div>
    </div>
  );
}

/* ── Plan & Agencies ──────────────────────────────────────────────── */
function EditableList({ title, subtitle, items, onChange, placeholder }) {
  const editing = useEditing();
  const set = (i, v) => onChange(items.map((x, j) => (j === i ? v : x)));
  return (
    <Panel>
      <PanelTitle title={title} subtitle={subtitle} />
      <ul className="space-y-2">
        {items.map((r, i) => (
          <li key={i} className="flex items-center gap-2">
            <input value={r} onChange={(e) => set(i, e.target.value)} placeholder={placeholder} aria-label={`${title} ${i + 1}`} disabled={!editing}
              className="glass-input h-10 min-w-0 flex-1 rounded-xl px-3.5 text-[13px] text-ink-950 placeholder:text-ink-400 disabled:cursor-not-allowed disabled:bg-white/30 disabled:text-ink-600" />
            <ActionIcon icon="close" tone="danger" label="Remove" disabled={!editing} onClick={() => onChange(items.filter((_, j) => j !== i))} />
          </li>
        ))}
        {!items.length && <li className="text-[13px] text-ink-500">Nothing written yet.{editing ? '' : ' Press Edit activity to add some.'}</li>}
      </ul>
      <Button variant="ghost" size="sm" icon="plus" className="mt-3" disabled={!editing} onClick={() => onChange([...items, ''])}>Add</Button>
    </Panel>
  );
}

export function PlanTab({ activity, notify }) {
  const editing = useEditing();
  const confirm = useConfirm();
  const { getDetails, setDetails } = useStore();
  const d = getDetails(activity);
  const set = (patch) => setDetails(activity.id, patch);
  const [flow, setFlow] = useState(false);
  const [roles, setRoles] = useState(AGENCY_ROLES);
  const fileRef = useRef(null);

  const size = (b) => (b < 1048576 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1048576).toFixed(1)} MB`);
  const attach = (f) => {
    if (!f) return;
    set({ programFlow: { file: f.name, type: 'Program flow', size: size(f.size), uploaded: 'Jun 18, 2025', mime: f.type, url: URL.createObjectURL(f) } });
    notify?.(`${f.name} attached as the program flow`);
  };
  const detach = async () => {
    if (await confirm({ tone: 'danger', title: 'Remove the program flow?', message: `“${d.programFlow.file}” will no longer be attached to this activity.`, confirmLabel: 'Remove file' })) set({ programFlow: null });
  };

  const columns = [
    { key: 'agency', label: 'Agency', render: (r) => <strong className="font-medium text-ink-950">{r.agency}</strong> },
    {
      key: 'role', label: 'Role in this activity',
      render: (r) => (
        <Select value={r.role} aria-label={`Role of ${r.agency}`} disabled={!editing} className="disabled:cursor-not-allowed disabled:opacity-60"
          onChange={(e) => { setRoles((l) => l.map((x) => (x.id === r.id ? { ...x, role: e.target.value } : x))); notify?.(`${r.agency} is now ${e.target.value}`); }}>
          {ROLE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
        </Select>
      ),
    },
    { key: 'notes', label: 'Notes', render: (r) => <span className="text-ink-600">{r.notes}</span> },
  ];
  const field = 'glass-input h-10 w-full rounded-xl px-3.5 text-[13px] text-ink-950 placeholder:text-ink-400';

  return (
    <div className="space-y-4">
      {flow && d.programFlow && <DocumentPreviewModal doc={d.programFlow} onClose={() => setFlow(false)} notify={notify} />}
      <Panel>
        <PanelTitle title="Training plan" subtitle="Prepared before the activity" />
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <label className="block space-y-1.5"><span className="text-xs text-ink-500">Topics</span>
              {editing ? <input className={field} value={d.topics} onChange={(e) => set({ topics: e.target.value })} /> : <p className="text-[13px] text-ink-950">{d.topics || <span className="text-ink-400">Not set</span>}</p>}</label>
            <label className="block space-y-1.5"><span className="text-xs text-ink-500">Documentation</span>
              {editing ? <input className={field} value={d.documentation} onChange={(e) => set({ documentation: e.target.value })} placeholder="e.g. Photo, attendance and report" /> : <p className="text-[13px] text-ink-950">{d.documentation || <span className="text-ink-400">Not set</span>}</p>}</label>
          </div>

          <div>
            <span className="text-xs text-ink-500">Program flow</span>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="sr-only" id="flow-file" onChange={(e) => { attach(e.target.files?.[0]); e.target.value = ''; }} />
            {d.programFlow ? (
              <div className="glass-inset mt-1.5 flex items-center gap-3 rounded-2xl p-3">
                <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-white text-brand-600"><Icon name="file" size={17} /></span>
                <span className="min-w-0 flex-1"><strong className="block truncate text-[13px] font-medium text-ink-950">{d.programFlow.file}</strong><small className="text-xs text-ink-500">{d.programFlow.size}</small></span>
                <ActionIcon icon="eye" label="View program flow" onClick={() => setFlow(true)} />
                <ActionIcon icon="download" label="Download" tone="brand" onClick={() => { downloadDoc(d.programFlow); notify?.(`Downloading ${d.programFlow.file}`); }} />
                <ActionIcon icon="upload" label="Replace file" disabled={!editing} onClick={() => fileRef.current?.click()} />
                <ActionIcon icon="trash" tone="danger" label="Remove file" disabled={!editing} onClick={detach} />
              </div>
            ) : (
              <button type="button" disabled={!editing} onClick={() => fileRef.current?.click()}
                className="mt-1.5 flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-ink-200 bg-white/50 p-3 text-left transition-colors enabled:hover:border-brand-400 enabled:hover:bg-brand-50/50 disabled:cursor-not-allowed disabled:opacity-60">
                <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-ink-100 text-ink-600"><Icon name="upload" size={17} /></span>
                <span><strong className="block text-[13px] font-medium text-ink-800">{editing ? 'Attach the program flow' : 'No program flow attached'}</strong><small className="text-xs text-ink-500">{editing ? 'PDF, Word or an image' : 'Press Edit activity to attach one.'}</small></span>
              </button>
            )}
          </div>
        </div>
      </Panel>
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
        <EditableList title="Objectives" subtitle="What participants should be able to do. Shown in the mobile Overview." items={d.objectives} onChange={(objectives) => set({ objectives })} placeholder="Perform correct tapping on a mature tree" />
        <EditableList title="Expected outcomes" subtitle="Results the agency expects after the activity. Shown in the mobile Overview." items={d.outcomes} onChange={(outcomes) => set({ outcomes })} placeholder="Participants adopt improved tapping" />
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
  const editing = useEditing();
  const confirm = useConfirm();
  const { sessions, setSessions, staffDays } = useStore();
  const [adding, setAdding] = useState(false);
  const [managing, setManaging] = useState(null);

  const update = (next) => setSessions((l) => l.map((x) => (x.id === next.id ? next : x)));
  const remove = async (s) => {
    if (await confirm({ tone: 'danger', title: 'Delete this session?', message: `“${s.title}” and its materials will be removed from the program.`, confirmLabel: 'Delete session' })) {
      setSessions((l) => l.filter((x) => x.id !== s.id));
      notify?.('Session deleted');
    }
  };

  const columns = [
    { key: 'day', label: 'Day', render: (s) => <span className="whitespace-nowrap">Day {s.day} · {s.date}</span> },
    { key: 'period', label: 'Period', render: (s) => <Badge value={s.period} tone="info" variant="pill" /> },
    { key: 'time', label: 'Time', render: (s) => <span className="whitespace-nowrap text-ink-600">{s.time}</span> },
    { key: 'title', label: 'Session', render: (s) => <strong className="font-medium text-ink-950">{s.title}</strong> },
    { key: 'speaker', label: 'Resource person' },
    { key: 'room', label: 'Venue' },
    { key: 'files', label: 'Materials', render: (s) => <span className="text-ink-600">{s.files} {s.files === 1 ? 'file' : 'files'}</span> },
    {
      key: 'm', label: 'Actions', className: 'text-right',
      render: (s) => (
        <div className="flex justify-start gap-0.5">
          <ActionIcon icon="file" tone="brand" label="Session materials" onClick={() => setManaging(s)} />
          <ActionIcon icon="trash" tone="danger" label="Delete session" disabled={!editing} onClick={() => remove(s)} />
        </div>
      ),
    },
  ];
  const ordered = [...sessions].sort((a, b) => a.day - b.day || (a.period === b.period ? 0 : a.period === 'AM' ? -1 : 1));

  return (
    <Panel pad={false} className="overflow-hidden">
      <div className="p-5 pb-3">
        <PanelTitle title="Sessions" subtitle="Each session has an AM and PM period with its own QR attendance, materials and feedback">
          <Button size="sm" icon="plus" disabled={!editing} onClick={() => setAdding(true)}>Add session</Button>
        </PanelTitle>
      </div>
      <DataTable columns={columns} rows={ordered} empty="No sessions yet." />
      {adding && <SessionModal days={staffDays} onSave={(s) => { setSessions((l) => [...l, s]); notify?.('Session added'); }} onClose={() => setAdding(false)} />}
      {managing && <SessionMaterialsModal session={sessions.find((x) => x.id === managing.id) ?? managing} editing={editing} onChange={update} onClose={() => setManaging(null)} notify={notify} />}
    </Panel>
  );
}

/* ── Staffing (one container per day) ─────────────────────────────── */
export function StaffingTab({ notify }) {
  const editing = useEditing();
  const confirm = useConfirm();
  const { staffDays: days, setStaffDays: setDays, setFeedbackForms } = useStore();
  const [assigning, setAssigning] = useState(null);
  const [addingDay, setAddingDay] = useState(false);

  const assign = (n, person) => {
    setDays((l) => l.map((d) => (d.n === n ? { ...d, staff: [...d.staff, { ...person, id: Date.now() }] } : d)));
    notify?.(`${person.name} assigned to Day ${n}`);
  };
  const unassign = (n, id) => setDays((l) => l.map((d) => (d.n === n ? { ...d, staff: d.staff.filter((s) => s.id !== id) } : d)));
  const removeDay = (n) => {
    setDays((l) => l.filter((d) => d.n !== n).map((d, i) => ({ ...d, n: i + 1 })));
    // a removed day takes its feedback form with it, and later days keep their forms
    setFeedbackForms((l) => l.filter((f) => f.day !== n).map((f) => (f.day > n ? { ...f, day: f.day - 1 } : f)));
    notify?.(`Day ${n} removed`);
  };
  const addDay = (label) => setDays((l) => [...l, { n: l.length + 1, label, staff: [] }]);

  const columns = (n) => [
    { key: 'name', label: 'Name', render: (s) => <div className="flex items-center gap-3"><Avatar name={s.name.replace(/^(Ms|Mr|Dr)\.\s*/, '')} size="sm" /><strong className="font-medium text-ink-950">{s.name}</strong></div> },
    { key: 'role', label: 'Role' },
    { key: 'duty', label: 'Responsibility', render: (s) => <span className="text-ink-600">{s.duty}</span> },
    { key: 'status', label: 'Status', render: (s) => <Badge value={s.status} /> },
    { key: 'a', label: 'Actions', className: 'text-right', render: (s) => <div className="flex justify-start"><ActionIcon icon="trash" tone="danger" label="Remove from this day" disabled={!editing} onClick={async () => { if (await confirm({ tone: 'danger', title: `Remove ${s.name} from Day ${n}?`, message: 'They will no longer be assigned to this day.', confirmLabel: 'Remove' })) unassign(n, s.id); }} /></div> },
  ];

  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-500">Staff are assigned per day. Facilitators run the activity; committee members hold organizing roles. The same person can be assigned on several days.</p>

      {days.map((d) => (
        <Panel key={d.n} pad={false} className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 p-5 pb-3">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-100 text-[13px] font-medium text-brand-700">{d.n}</span>
              <div>
                <h2 className="text-sm font-medium text-ink-950">Day {d.n}</h2>
                <p className="text-xs text-ink-500">{d.label} · {d.staff.length} {d.staff.length === 1 ? 'person' : 'people'} assigned</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Button size="sm" icon="plus" disabled={!editing} onClick={() => setAssigning(d)}>Assign staff</Button>
              {days.length > 1 && <ActionIcon icon="trash" tone="danger" label="Remove this day" disabled={!editing} onClick={async () => { if (await confirm({ tone: 'danger', title: `Remove Day ${d.n}?`, message: `${d.staff.length ? `All ${d.staff.length} staff assignments on this day` : 'This day'} will be removed, and later days are renumbered.`, confirmLabel: 'Remove day' })) removeDay(d.n); }} />}
            </div>
          </div>
          {d.staff.length
            ? <DataTable columns={columns(d.n)} rows={d.staff} />
            : <p className="border-t border-[var(--glass-divider)] px-5 py-8 text-center text-[13px] text-ink-500">No one is assigned to this day yet.</p>}
        </Panel>
      ))}

      <button
        type="button"
        disabled={!editing}
        onClick={() => setAddingDay(true)}
        className="flex w-full items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-ink-300 bg-white/30 py-6 text-[13px] font-medium text-ink-600 transition-colors enabled:hover:border-brand-400 enabled:hover:bg-brand-50/50 enabled:hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-white shadow-sm"><Icon name="plus" size={15} /></span>
        Add another day
      </button>

      {assigning && <AssignStaffModal day={assigning} onAssign={assign} onClose={() => setAssigning(null)} />}
      {addingDay && <AddDayModal nextNumber={days.length + 1} onAdd={addDay} onClose={() => setAddingDay(false)} />}
    </div>
  );
}

/* ── Participants (registered only) ───────────────────────────────── */
export function ParticipantsTab({ activity }) {
  const editing = useEditing();
  const { people } = useStore();
  const [adding, setAdding] = useState(false);
  const rows = people.filter((p) => p.activityIds?.includes(activity.id));

  const columns = [
    { key: 'name', label: 'Participant', render: (p) => (
      <div className="flex items-center gap-3">
        <Avatar name={p.name || p.email} size="sm" />
        {p.name ? <Cell title={p.name} sub={p.email} /> : <Cell title={<span className="font-normal italic text-ink-500">Awaiting profile</span>} sub={p.email} />}
      </div>
    ) },
    { key: 'agency', label: 'Organization', render: (p) => <span className="text-ink-600">{p.agency || '—'}</span> },
    { key: 'category', label: 'Category', render: (p) => <span className="text-xs text-ink-600">{p.category}</span> },
    { key: 'registered', label: 'Registered on', render: (p) => <span className="whitespace-nowrap text-ink-600">{p.registered ?? '—'}</span> },
    { key: 'source', label: 'Source', render: (p) => <span className="text-xs text-ink-600">{p.source}</span> },
    { key: 'status', label: 'Status', render: (p) => <Badge value={p.status === 'Invited' ? 'Invited' : 'Registered'} tone={p.status === 'Invited' ? 'info' : 'ok'} /> },
  ];
  return (
    <Panel pad={false} className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-3">
        <div>
          <h2 className="text-sm font-medium text-ink-950">Registered participants</h2>
          <p className="text-xs text-ink-500">{rows.length} of {activity.capacity} slots · people who registered for this activity</p>
        </div>
        <Button variant="secondary" size="sm" icon="plus" disabled={!editing} onClick={() => setAdding(true)}>Add participant</Button>
      </div>
      <DataTable columns={columns} rows={rows} empty="No one has registered yet." />
      {adding && <AddParticipantModal activity={activity} onClose={() => setAdding(false)} />}
    </Panel>
  );
}

/* ── Resources ────────────────────────────────────────────────────── */
export function ResourcesTab({ notify }) {
  const editing = useEditing();
  const confirm = useConfirm();
  const { resources, setResources } = useStore();
  const [adding, setAdding] = useState(false);

  const remove = async (r) => {
    if (await confirm({ tone: 'danger', title: 'Remove this resource?', message: `“${r.resource}” will no longer be listed for this activity.`, confirmLabel: 'Remove resource' })) {
      setResources((l) => l.filter((x) => x.id !== r.id));
      notify?.('Resource removed');
    }
  };

  const columns = [
    { key: 'type', label: 'Type', render: (r) => <Badge value={r.type} tone="muted" variant="pill" /> },
    { key: 'resource', label: 'Resource', render: (r) => <strong className="font-medium text-ink-950">{r.resource}</strong> },
    { key: 'allocated', label: 'Allocated' },
    { key: 'status', label: 'Status', render: (r) => <Badge value={r.status} /> },
    { key: 'a', label: 'Actions', className: 'text-right', render: (r) => <div className="flex justify-start"><ActionIcon icon="trash" tone="danger" label="Remove resource" disabled={!editing} onClick={() => remove(r)} /></div> },
  ];
  return (
    <Panel pad={false} className="overflow-hidden">
      <div className="p-5 pb-3">
        <PanelTitle title="Resources" subtitle="People, venue, tools and inputs the activity draws on">
          <Button size="sm" icon="plus" disabled={!editing} onClick={() => setAdding(true)}>Add resource</Button>
        </PanelTitle>
      </div>
      <DataTable columns={columns} rows={resources} empty="No resources yet." />
      <p className="border-t border-[var(--glass-divider)] px-5 py-3 text-xs text-ink-500">Resources can be linked to budget items from the Budget tab. TMIS does not manage inventory.</p>
      {adding && <ResourceModal onSave={(r) => { setResources((l) => [...l, r]); notify?.('Resource added'); }} onClose={() => setAdding(false)} />}
    </Panel>
  );
}
