import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper, PageHeader } from '../../layout/PageWrapper';
import { Badge, Button, Callout, DataTable, Drawer, Field, IconButton, KeyValue, Modal, Panel, Select, Switch, inputCls } from '../../ui';
import { useAuth } from '../../../context/AuthContext';
import { useStore } from '../../../hooks/useStore';
import CreateWizard from '../../activity/CreateWizard';
import { ACTIVITY_TYPES, FUNDING, TODAY_ISO, peso } from '../../../data/mockData';
import { MONTH_NAMES, buildEvents, formatRange, overlapsFor } from '../../../lib/budgetModel';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const YEAR = 2025;
const iso = (m, d) => `${YEAR}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const TYPE_COLOR = {
  'Skills Training':    { chip: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-400' },
  'Extension Activity': { chip: 'bg-sky-100 text-sky-800',         dot: 'bg-sky-400' },
  Seminar:              { chip: 'bg-amber-100 text-amber-800',     dot: 'bg-amber-400' },
  Workshop:             { chip: 'bg-violet-100 text-violet-800',   dot: 'bg-violet-400' },
};
const colorOf = (t) => TYPE_COLOR[t] ?? { chip: 'bg-white text-ink-700', dot: 'bg-ink-400' };

function PlanModal({ onClose }) {
  const { addPlan, notify } = useStore();
  const [f, setF] = useState({ title: '', type: ACTIVITY_TYPES[0], funding: FUNDING[0], start: '', end: '', venue: '' });
  const ok = f.title.trim() && f.start && f.end && f.end >= f.start;
  return (
    <Modal title="Plan event" subtitle="Reserve dates on the annual calendar. Turn it into a full activity later." onClose={onClose} width={520}
      footer={<><span /><div className="flex gap-2"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button disabled={!ok} onClick={() => { addPlan({ ...f, title: f.title.trim() }); notify?.('Event added to the calendar'); onClose(); }}>Add to calendar</Button></div></>}>
      <div className="space-y-4 pb-2">
        <Field label="Title"><input className={inputCls} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} autoFocus /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Type"><select className={inputCls} value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>{ACTIVITY_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Funding source"><select className={inputCls} value={f.funding} onChange={(e) => setF({ ...f, funding: e.target.value })}>{FUNDING.map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Start"><input type="date" className={inputCls} value={f.start} onChange={(e) => setF({ ...f, start: e.target.value, end: f.end && f.end < e.target.value ? e.target.value : f.end })} /></Field>
          <Field label="End"><input type="date" min={f.start} className={inputCls} value={f.end} onChange={(e) => setF({ ...f, end: e.target.value })} /></Field>
        </div>
        <Field label="Venue"><input className={inputCls} value={f.venue} onChange={(e) => setF({ ...f, venue: e.target.value })} /></Field>
      </div>
    </Modal>
  );
}

function EventDrawer({ event, events, isAdmin, onClose, onTurnInto }) {
  const navigate = useNavigate();
  const { removePlan, setEventPublished, notify } = useStore();
  const over = overlapsFor(event, events);
  const real = !!event.activityId;
  const isDraft = event.status === 'Planned' && real;

  return (
    <Drawer
      title={event.title}
      subtitle={`${event.type} · ${formatRange(event.start, event.end)}`}
      onClose={onClose}
      footer={real ? (
        <Button onClick={() => navigate(`/activities/${event.activityId}`)}>Open activity</Button>
      ) : isAdmin ? (
        <>
          <Button variant="secondary" onClick={() => { removePlan(event.planId); notify?.('Planned event removed'); onClose(); }}>Remove</Button>
          <Button onClick={() => onTurnInto(event)}>Turn into activity</Button>
        </>
      ) : null}
    >
      <KeyValue rows={[
        ['Status', <Badge key="s" value={event.status} />],
        ['Venue', event.venue],
        ['Funding source', event.funding],
        ['Estimated budget', event.estimated ? peso(event.estimated) : '—'],
      ]} />
      {over.length > 0 && (
        <Callout tone="warn" icon="alert">
          <strong className="block">Overlaps with</strong>
          {over.map((o) => o.title).join(', ')}
          <span className="mt-1 block text-xs">Overlap is a warning, not a block.</span>
        </Callout>
      )}
      <div className="glass-inset flex items-center justify-between gap-4 rounded-2xl p-4">
        <div>
          <strong className="block text-[13px] font-medium text-ink-950">Publish to participants</strong>
          <small className="text-xs text-ink-500">Budget figures are never shown to participants.</small>
        </div>
        <Switch checked={event.published} onChange={(v) => setEventPublished(event.key, v)} label="Publish to participants" />
      </div>
      {isDraft && <p className="text-xs text-ink-500">Draft activities show as Planned and are never published.</p>}
    </Drawer>
  );
}

export default function Calendar() {
  const { role } = useAuth();
  const { activities, items, plans, published, removePlan } = useStore();
  const isAdmin = role === 'Agency Administrator' || role === 'Super Admin';

  const [month, setMonth] = useState(5);
  const [view, setView] = useState('month');
  const [type, setType] = useState('All types');
  const [status, setStatus] = useState('All statuses');
  const [funding, setFunding] = useState('All funding');
  const [openKey, setOpenKey] = useState(null);
  const [planning, setPlanning] = useState(false);
  const [wizard, setWizard] = useState(null);

  const all = useMemo(() => buildEvents(activities, plans, items, published), [activities, plans, items, published]);
  const events = all.filter((e) => (type === 'All types' || e.type === type) && (status === 'All statuses' || e.status === status) && (funding === 'All funding' || e.funding === funding));
  const countFor = (m) => events.filter((e) => Number(e.start.slice(5, 7)) - 1 === m).length;
  const open = all.find((e) => e.key === openKey);

  const first = new Date(YEAR, month, 1).getDay();
  const days = new Date(YEAR, month + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const eventsOn = (d) => events.filter((e) => iso(month, d) >= e.start && iso(month, d) <= e.end);
  const committed = events.filter((e) => Number(e.start.slice(5, 7)) - 1 === month).reduce((s, e) => s + e.estimated, 0);
  const overlapDays = cells.filter((d) => d && eventsOn(d).length > 1).length;

  const listColumns = [
    { key: 'title', label: 'Event', render: (e) => <div className="flex items-center gap-3"><i className={`h-8 w-1 rounded-full ${colorOf(e.type).dot}`} /><div><strong className="block font-medium text-ink-950">{e.title}</strong><span className="text-xs text-ink-500">{e.type} · {e.venue}</span></div></div> },
    { key: 'dates', label: 'Dates', render: (e) => <span className="whitespace-nowrap">{formatRange(e.start, e.end)}</span> },
    { key: 'status', label: 'Status', render: (e) => <Badge value={e.status} /> },
    { key: 'funding', label: 'Funding' },
    { key: 'est', label: 'Estimated', className: 'text-right', render: (e) => (e.estimated ? peso(e.estimated) : '—') },
    { key: 'pub', label: 'Published', render: (e) => <Badge value={e.published ? 'Published' : 'Unpublished'} /> },
  ];

  return (
    <PageWrapper>
      <PageHeader title="Annual calendar" subtitle="PRRI’s year at a glance. Planned entries become full activities through the creation wizard.">
        <div className="glass-inset inline-flex rounded-full p-0.5">
          {['month', 'list'].map((v) => (
            <button key={v} onClick={() => setView(v)} aria-pressed={view === v}
              className={`rounded-full px-4 py-1.5 text-xs capitalize transition-colors ${view === v ? 'bg-white text-ink-950 shadow-sm' : 'text-ink-500 hover:text-ink-950'}`}>{v}</button>
          ))}
        </div>
        {isAdmin && <Button icon="plus" onClick={() => setPlanning(true)}>Plan event</Button>}
      </PageHeader>

      <Panel className="mb-4 flex flex-wrap items-center gap-3 !p-3">
        <Select value={type} onChange={(e) => setType(e.target.value)} aria-label="Type"><option>All types</option>{ACTIVITY_TYPES.map((t) => <option key={t}>{t}</option>)}</Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status"><option>All statuses</option>{['Planned', 'Upcoming', 'Ongoing', 'Completed'].map((t) => <option key={t}>{t}</option>)}</Select>
        <Select value={funding} onChange={(e) => setFunding(e.target.value)} aria-label="Funding"><option>All funding</option>{FUNDING.map((t) => <option key={t}>{t}</option>)}</Select>
        <ul className="ml-auto hidden flex-wrap gap-x-4 gap-y-1 text-xs text-ink-600 lg:flex">
          {ACTIVITY_TYPES.map((t) => <li key={t} className="flex items-center gap-1.5"><i className={`h-2 w-2 rounded-sm ${colorOf(t).dot}`} />{t}</li>)}
        </ul>
      </Panel>

      {/* Year strip */}
      <div className="mb-4 grid grid-cols-4 gap-2 sm:grid-cols-6 xl:grid-cols-12">
        {MONTH_NAMES.map((m, i) => {
          const n = countFor(i);
          return (
            <button key={m} onClick={() => setMonth(i)} aria-pressed={month === i}
              className={`rounded-2xl px-3 py-2.5 text-left transition-all ${month === i ? 'bg-white shadow-[0_4px_14px_rgba(70,100,200,0.15)] ring-1 ring-white' : 'glass-inset hover:bg-white/70'}`}>
              <strong className="block text-xs font-medium text-ink-950">{m.slice(0, 3)}</strong>
              <span className={`text-[11px] ${n ? 'text-ink-500' : 'text-amber-600'}`}>{n ? `${n} event${n > 1 ? 's' : ''}` : 'Nothing scheduled'}</span>
            </button>
          );
        })}
      </div>

      {view === 'month' ? (
        <Panel>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <IconButton icon="back" label="Previous month" size={32} onClick={() => setMonth((m) => (m + 11) % 12)} />
              <h2 className="text-[15px] font-medium text-ink-950">{MONTH_NAMES[month]} {YEAR}</h2>
              <IconButton icon="arrow" label="Next month" size={32} onClick={() => setMonth((m) => (m + 1) % 12)} />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-ink-500">
              <span>Budget committed this month: <strong className="font-medium text-ink-950">{peso(committed)}</strong></span>
              {overlapDays > 0 && <Badge value={`${overlapDays} day${overlapDays > 1 ? 's' : ''} with overlapping events`} tone="warn" variant="pill" />}
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] text-ink-500">{DOW.map((d) => <span key={d} className="py-1">{d}</span>)}</div>
          <div className="mt-1 grid grid-cols-7 gap-1.5">
            {cells.map((d, i) => {
              if (!d) return <span key={`b${i}`} />;
              const ev = eventsOn(d);
              const today = iso(month, d) === TODAY_ISO;
              const overlap = ev.length > 1;
              return (
                <div key={d} title={overlap ? `Overlap: ${ev.map((e) => e.title).join(', ')}` : undefined}
                  className={`min-h-[84px] rounded-2xl p-1.5 text-left ${overlap ? 'bg-amber-100/60 ring-1 ring-amber-200' : 'glass-inset'} ${today ? '!ring-2 !ring-brand-500' : ''}`}>
                  <div className="flex items-center justify-between">
                    <span className={`grid h-6 w-6 place-items-center rounded-full text-xs ${today ? 'bg-brand-600 text-white' : 'text-ink-800'}`}>{d}</span>
                    {overlap && <span className="text-[10px] text-amber-700">Overlap</span>}
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {ev.slice(0, 2).map((e) => (
                      <button key={e.key} onClick={() => setOpenKey(e.key)} className={`block w-full truncate rounded-md px-1.5 py-0.5 text-left text-[10px] ${colorOf(e.type).chip}`}>{e.title}</button>
                    ))}
                    {ev.length > 2 && <span className="text-[10px] text-ink-500">+{ev.length - 2} more</span>}
                  </div>
                </div>
              );
            })}
          </div>
          {countFor(month) === 0 && (
            <div className="mt-4"><Callout tone="warn">Nothing is scheduled in {MONTH_NAMES[month]}.{isAdmin && ' Use Plan event to reserve dates.'}</Callout></div>
          )}
        </Panel>
      ) : (
        <Panel pad={false} className="overflow-hidden">
          <DataTable columns={listColumns} rows={events.map((e) => ({ ...e, id: e.key }))} onRowClick={(e) => setOpenKey(e.key)} empty="No events match these filters." />
        </Panel>
      )}

      {open && <EventDrawer key={open.key} event={open} events={all} isAdmin={isAdmin} onClose={() => setOpenKey(null)}
        onTurnInto={(e) => { setWizard({ planId: e.planId, title: e.title, type: e.type, start: e.start, end: e.end, venue: e.venue, funding: e.funding }); setOpenKey(null); }} />}
      {planning && <PlanModal onClose={() => setPlanning(false)} />}
      {wizard && <CreateWizard prefill={wizard} onCreated={() => removePlan(wizard.planId)} onClose={() => setWizard(null)} />}
    </PageWrapper>
  );
}
