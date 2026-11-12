import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper, PageHeader, SectionLabel } from '../../layout/PageWrapper';
import { Badge, Button, DataTable, Field, Icon, Metric, Modal, Panel, PanelTitle, Select, inputCls } from '../../ui';
import { useAuth } from '../../../context/AuthContext';
import { useStore } from '../../../hooks/useStore';
import { ACTIVITY_TYPES, FUNDING, peso } from '../../../data/mockData';
import { MONTH_NAMES, estOf, parseRange } from '../../../lib/budgetModel';

const TODAY = '2025-06-18';

function csv(rows, name) {
  const body = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([body], { type: 'text/csv' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  a.click();
  URL.revokeObjectURL(url);
}

function AnnualModal({ onClose }) {
  const { annual, setAnnual, notify } = useStore();
  const [v, setV] = useState(annual);
  return (
    <Modal title="Set annual budget" subtitle="Total budget for the year, in PHP" onClose={onClose} width={440}
      footer={<><span /><div className="flex gap-2"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button disabled={!(Number(v) > 0)} onClick={() => { setAnnual(Number(v)); notify?.('Annual budget updated'); onClose(); }}>Save</Button></div></>}>
      <div className="pb-2"><Field label="Annual total (₱)"><input type="number" min="0" className={inputCls} value={v} onChange={(e) => setV(e.target.value)} autoFocus /></Field></div>
    </Modal>
  );
}

function Flag({ title, subtitle, rows, empty, onOpen }) {
  return (
    <Panel>
      <PanelTitle title={title} subtitle={subtitle}>
        <Badge value={String(rows.length)} tone={rows.length ? 'warn' : 'ok'} variant="pill" />
      </PanelTitle>
      {rows.length === 0 ? (
        <p className="flex items-center gap-2 text-xs text-emerald-700"><Icon name="check" size={14} />{empty}</p>
      ) : (
        <ul className="space-y-1">
          {rows.map((r) => (
            <li key={r.key}>
              <button onClick={() => r.id && onOpen(r.id)} className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-[13px] hover:bg-white/50">
                <span className="truncate text-ink-950">{r.title}</span>
                <span className="flex-shrink-0 text-xs text-ink-500">{r.note}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export default function Budget() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { activities, items, plans, annual } = useStore();
  const [month, setMonth] = useState('all');
  const [type, setType] = useState('all');
  const [funding, setFunding] = useState('all');
  const [setting, setSetting] = useState(false);

  const isAdmin = role === 'Agency Administrator' || role === 'Super Admin';

  const rows = useMemo(() => activities.map((a) => {
    const mine = items.filter((i) => i.activityId === a.id);
    const rec = mine.filter((i) => i.actual != null);
    return {
      a, est: mine.reduce((s, i) => s + estOf(i), 0), act: rec.reduce((s, i) => s + i.actual, 0),
      hasActual: rec.length > 0, hasItems: mine.length > 0,
      month: Number(parseRange(a.date).start.slice(5, 7)) - 1, funding: mine[0]?.funding ?? '—',
    };
  }), [activities, items]);

  const f = rows.filter((r) => (month === 'all' || r.month === Number(month)) && (type === 'all' || r.a.type === type) && (funding === 'all' || r.funding === funding));
  const estimated = f.reduce((s, r) => s + r.est, 0);
  const actual = f.reduce((s, r) => s + r.act, 0);
  const remaining = annual - estimated;
  const conducted = f.filter((r) => r.a.status === 'Completed' || r.a.status === 'Ongoing');
  const reached = conducted.reduce((s, r) => s + r.a.participants, 0);

  if (!isAdmin) {
    return (
      <PageWrapper>
        <PageHeader title="Annual budget" />
        <Panel className="grid place-items-center gap-1 py-16 text-center">
          <Icon name="lock" size={22} className="text-ink-400" />
          <strong className="text-sm font-medium text-ink-950">Agency Administrators only</strong>
          <span className="text-xs text-ink-500">The annual budget review is restricted to Agency Administrators.</span>
        </Panel>
      </PageWrapper>
    );
  }

  const byMonth = MONTH_NAMES.map((m, i) => ({ m: m.slice(0, 3), est: f.filter((r) => r.month === i).reduce((s, r) => s + r.est, 0), act: f.filter((r) => r.month === i).reduce((s, r) => s + r.act, 0) }));
  const maxBar = Math.max(1, ...byMonth.map((b) => Math.max(b.est, b.act)));

  const group = (keyFn, keys) => keys.map((k) => ({ id: k, name: k, est: f.filter((r) => keyFn(r) === k).reduce((s, r) => s + r.est, 0), act: f.filter((r) => keyFn(r) === k).reduce((s, r) => s + r.act, 0), n: f.filter((r) => keyFn(r) === k).length }));
  const byType = group((r) => r.a.type, ACTIVITY_TYPES);
  const byFunding = group((r) => r.funding, FUNDING);

  const over = f.filter((r) => r.hasActual && r.act > r.est).map((r) => ({ key: r.a.id, id: r.a.id, title: r.a.title, note: `${peso(r.act - r.est)} over` }));
  const noBudget = f.filter((r) => (r.a.status === 'Completed' || r.a.status === 'Ongoing') && !r.hasItems).map((r) => ({ key: r.a.id, id: r.a.id, title: r.a.title, note: 'No budget' }));
  const notConducted = plans.filter((p) => p.end < TODAY).map((p) => ({ key: p.id, title: p.title, note: p.end }));

  const summaryCols = (label) => [
    { key: 'name', label, render: (r) => <span className="text-ink-950">{r.name}</span> },
    { key: 'n', label: 'Activities', className: 'text-center' },
    { key: 'est', label: 'Estimated', className: 'text-right', render: (r) => <span className="tabular-nums">{peso(r.est)}</span> },
    { key: 'act', label: 'Actual', className: 'text-right', render: (r) => <span className="tabular-nums">{peso(r.act)}</span> },
  ];
  const totalRow = (list) => (
    <tr className="border-t border-[var(--glass-divider)] bg-white/30 text-[13px] font-medium text-ink-950">
      <td className="px-5 py-3">Total</td><td className="px-5 py-3 text-center">{list.reduce((s, r) => s + r.n, 0)}</td>
      <td className="px-5 py-3 text-right tabular-nums">{peso(list.reduce((s, r) => s + r.est, 0))}</td>
      <td className="px-5 py-3 text-right tabular-nums">{peso(list.reduce((s, r) => s + r.act, 0))}</td>
    </tr>
  );

  const exportView = () => csv([['Activity', 'Type', 'Estimated', 'Actual'], ...f.map((r) => [r.a.title, r.a.type, r.est, r.act])], 'annual-budget.csv');

  return (
    <PageWrapper>
      <PageHeader eyebrow="Workspace" title="Annual budget" subtitle="Figures are computed from activity budgets. Change an activity’s budget and this review updates.">
        <Button variant="secondary" icon="download" onClick={exportView}>Export view</Button>
        <Button onClick={() => setSetting(true)}>Set annual budget</Button>
      </PageHeader>

      <Panel className="mb-5 flex flex-wrap gap-3 !p-3">
        <Select value={month} onChange={(e) => setMonth(e.target.value)} aria-label="Month"><option value="all">Whole year</option>{MONTH_NAMES.map((m, i) => <option key={m} value={i}>{m}</option>)}</Select>
        <Select value={type} onChange={(e) => setType(e.target.value)} aria-label="Type"><option value="all">All activity types</option>{ACTIVITY_TYPES.map((t) => <option key={t}>{t}</option>)}</Select>
        <Select value={funding} onChange={(e) => setFunding(e.target.value)} aria-label="Funding"><option value="all">All funding sources</option>{FUNDING.map((t) => <option key={t}>{t}</option>)}</Select>
      </Panel>

      <div className="mb-2 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Metric label="Budgeted" value={peso(annual)} note="Annual total for PRRI" />
        <Metric label="Estimated" value={peso(estimated)} note={`${f.filter((r) => r.hasItems).length} activities with a budget`} />
        <Metric label="Actual" value={peso(actual)} note={`${estimated ? Math.round((actual / estimated) * 100) : 0}% of estimate recorded`} tone="brand" />
        <div className="rounded-[18px] bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white shadow-[0_10px_26px_rgba(59,114,230,0.3)]">
          <span className="text-xs text-white/75">Remaining</span>
          <strong className="mt-1.5 block text-[24px] font-medium leading-none tracking-[-0.5px]">{peso(remaining)}</strong>
          <small className="mt-2 block text-xs text-white/75">Budgeted minus estimated</small>
        </div>
      </div>

      <SectionLabel>Trend and statistics</SectionLabel>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Panel>
          <PanelTitle title="Budget by month" subtitle="Estimated vs actual">
            <span className="flex gap-3 text-[11px] text-ink-500"><i className="mr-1 inline-block h-2 w-2 rounded-sm bg-brand-200" />Estimated<i className="ml-1 mr-1 inline-block h-2 w-2 rounded-sm bg-brand-600" />Actual</span>
          </PanelTitle>
          <div className="flex h-[170px] items-end gap-2 border-b border-[var(--glass-divider)]">
            {byMonth.map((b) => (
              <div key={b.m} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <div className="flex h-full w-full items-end justify-center gap-0.5">
                  <div className="w-2.5 rounded-t bg-brand-200" style={{ height: `${(b.est / maxBar) * 100}%` }} title={`Estimated ${peso(b.est)}`} />
                  <div className="w-2.5 rounded-t bg-brand-600" style={{ height: `${(b.act / maxBar) * 100}%` }} title={`Actual ${peso(b.act)}`} />
                </div>
                <small className="pb-1.5 text-[10px] text-ink-500">{b.m}</small>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <PanelTitle title="Year-end statistics" />
          <dl className="space-y-3 text-[13px]">
            {[['Activities conducted', conducted.length], ['Participants reached', reached], ['Average attendance', '89.4%'], ['Budget committed', `${Math.round((estimated / annual) * 100)}%`]].map(([k, v]) => (
              <div key={k} className="flex justify-between"><dt className="text-ink-500">{k}</dt><dd className="font-medium text-ink-950">{v}</dd></div>
            ))}
          </dl>
        </Panel>
      </div>

      <SectionLabel>Breakdown</SectionLabel>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel pad={false} className="overflow-hidden"><div className="p-5 pb-2"><PanelTitle title="By activity type" /></div><DataTable columns={summaryCols('Type')} rows={byType} footer={totalRow(byType)} /></Panel>
        <Panel pad={false} className="overflow-hidden"><div className="p-5 pb-2"><PanelTitle title="By funding source" /></div><DataTable columns={summaryCols('Funding')} rows={byFunding} footer={totalRow(byFunding)} /></Panel>
      </div>

      <SectionLabel>Needs attention</SectionLabel>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Flag title="Over budget" subtitle="Actual above estimate" rows={over} empty="No activity is over budget." onOpen={(id) => navigate(`/activities/${id}`)} />
        <Flag title="Conducted without a budget" subtitle="Ongoing or completed, no line items" rows={noBudget} empty="Every conducted activity has a budget." onOpen={(id) => navigate(`/activities/${id}`)} />
        <Flag title="Planned but not conducted" subtitle="Planned events whose dates have passed" rows={notConducted} empty="Nothing was missed." onOpen={() => {}} />
      </div>

      {setting && <AnnualModal onClose={() => setSetting(false)} />}
    </PageWrapper>
  );
}
