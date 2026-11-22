import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper, PageHeader, SectionLabel } from '../../layout/PageWrapper';
import { BarChart, Badge, Button, DataTable, Donut, Field, Icon, Legend, Metric, Modal, Panel, PanelTitle, Select, inputCls } from '../../ui';
import { useAuth } from '../../../context/AuthContext';
import { useStore } from '../../../hooks/useStore';
import { ACTIVITY_TYPES, BUDGET_CATEGORIES, peso } from '../../../data/mockData';
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

const SPEND_SERIES = [
  { key: 'est', label: 'Allocated', color: 'var(--color-brand-200)' },
  { key: 'act', label: 'Expenses', color: 'var(--color-brand-600)' },
];
const CATEGORY_COLORS = ['#6a43d8', '#4a82ee', '#34d399', '#fbbf24', '#f472b6', '#fb923c', '#94a3b8'];

export default function Budget() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { activities, items, plans, annual, allFundingNames } = useStore();
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
      estRecorded: rec.reduce((s, i) => s + estOf(i), 0),
      hasActual: rec.length > 0, hasItems: mine.length > 0,
      month: Number(parseRange(a.date).start.slice(5, 7)) - 1, funding: mine[0]?.funding ?? '—',
    };
  }), [activities, items]);

  const f = rows.filter((r) => (month === 'all' || r.month === Number(month)) && (type === 'all' || r.a.type === type) && (funding === 'all' || r.funding === funding));

  // Allocated Budget, Expenses, Difference (recorded items only) and Remaining (allocation not yet spent)
  const allocated = f.reduce((s, r) => s + r.est, 0);
  const expenses = f.reduce((s, r) => s + r.act, 0);
  const difference = expenses - f.reduce((s, r) => s + r.estRecorded, 0);
  const remaining = allocated - expenses;
  const hasExpenses = f.some((r) => r.hasActual);
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

  const byMonth = MONTH_NAMES.map((m, i) => ({ label: m.slice(0, 3), est: f.filter((r) => r.month === i).reduce((s, r) => s + r.est, 0), act: f.filter((r) => r.month === i).reduce((s, r) => s + r.act, 0) }));

  const ids = new Set(f.map((r) => r.a.id));
  const byCategory = BUDGET_CATEGORIES
    .map((c, i) => ({ label: c, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length], value: items.filter((it) => ids.has(it.activityId) && it.category === c && it.actual != null).reduce((s, it) => s + it.actual, 0) }))
    .filter((c) => c.value > 0);

  const group = (keyFn, keys) => keys.map((k) => ({ id: k, name: k, est: f.filter((r) => keyFn(r) === k).reduce((s, r) => s + r.est, 0), act: f.filter((r) => keyFn(r) === k).reduce((s, r) => s + r.act, 0), n: f.filter((r) => keyFn(r) === k).length }));
  const byType = group((r) => r.a.type, ACTIVITY_TYPES);
  const byFunding = group((r) => r.funding, allFundingNames);

  const over = f.filter((r) => r.hasActual && r.act > r.estRecorded).map((r) => ({ key: r.a.id, id: r.a.id, title: r.a.title, note: `${peso(r.act - r.estRecorded)} over` }));
  const noBudget = f.filter((r) => (r.a.status === 'Completed' || r.a.status === 'Ongoing') && !r.hasItems).map((r) => ({ key: r.a.id, id: r.a.id, title: r.a.title, note: 'No budget' }));
  const notConducted = plans.filter((p) => p.end < TODAY).map((p) => ({ key: p.id, title: p.title, note: p.end }));

  const summaryCols = (label) => [
    { key: 'name', label, render: (r) => <span className="text-ink-950">{r.name}</span> },
    { key: 'n', label: 'Activities', className: 'text-center' },
    { key: 'est', label: 'Allocated Budget', className: 'text-right', render: (r) => <span className="tabular-nums">{peso(r.est)}</span> },
    { key: 'act', label: 'Expenses', className: 'text-right', render: (r) => <span className="tabular-nums">{peso(r.act)}</span> },
  ];
  const totalRow = (list) => (
    <tr className="border-t border-[var(--glass-divider)] bg-white/30 text-[13px] font-medium text-ink-950">
      <td className="px-5 py-3">Total</td><td className="px-5 py-3">{list.reduce((s, r) => s + r.n, 0)}</td>
      <td className="px-5 py-3 tabular-nums">{peso(list.reduce((s, r) => s + r.est, 0))}</td>
      <td className="px-5 py-3 tabular-nums">{peso(list.reduce((s, r) => s + r.act, 0))}</td>
    </tr>
  );

  const exportView = () => csv([['Activity', 'Type', 'Allocated Budget', 'Expenses'], ...f.map((r) => [r.a.title, r.a.type, r.est, r.act])], 'annual-budget.csv');

  return (
    <PageWrapper>
      <PageHeader eyebrow="Workspace" title="Annual budget" subtitle="Figures are computed from activity budgets. Change an activity’s budget and this review updates.">
        <Button variant="secondary" icon="download" onClick={exportView}>Export view</Button>
        <Button onClick={() => setSetting(true)}>Set annual budget</Button>
      </PageHeader>

      <Panel className="mb-5 flex flex-wrap gap-3 !px-5 !py-3">
        <Select value={month} onChange={(e) => setMonth(e.target.value)} aria-label="Month"><option value="all">Whole year</option>{MONTH_NAMES.map((m, i) => <option key={m} value={i}>{m}</option>)}</Select>
        <Select value={type} onChange={(e) => setType(e.target.value)} aria-label="Type"><option value="all">All activity types</option>{ACTIVITY_TYPES.map((t) => <option key={t}>{t}</option>)}</Select>
        <Select value={funding} onChange={(e) => setFunding(e.target.value)} aria-label="Funding"><option value="all">All funding sources</option>{allFundingNames.map((t) => <option key={t}>{t}</option>)}</Select>
      </Panel>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Metric label="Allocated Budget" value={peso(allocated)} icon="file" note={`of ${peso(annual)} annual budget`} />
        <Metric label="Expenses" value={hasExpenses ? peso(expenses) : '—'} icon="chart" tone="brand" note={`${allocated ? Math.round((expenses / allocated) * 100) : 0}% of allocated budget`} />
        <Metric label="Difference" value={hasExpenses ? peso(difference) : '—'} icon="scan" tone={difference > 0 ? 'bad' : 'default'} note="Expenses vs allocation, recorded items" />
        <div className="rounded-[18px] bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white shadow-[0_10px_26px_rgba(59,114,230,0.3)]">
          <span className="flex items-center justify-between text-xs text-white/75">Remaining<Icon name="award" size={15} /></span>
          <strong className="mt-1.5 block text-[24px] font-medium leading-none tracking-[-0.5px]">{peso(remaining)}</strong>
          <small className="mt-2 block text-xs text-white/75">Allocated minus expenses</small>
        </div>
      </div>

      {/* Spending overview + expense by category */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Panel>
          <PanelTitle title="Spending overview" subtitle="Allocated budget vs expenses by month">
            <span className="flex gap-3 text-[11px] text-ink-500"><i className="mr-1 inline-block h-2 w-2 rounded-sm bg-brand-200" />Allocated<i className="ml-1 mr-1 inline-block h-2 w-2 rounded-sm bg-brand-600" />Expenses</span>
          </PanelTitle>
          <BarChart data={byMonth} series={SPEND_SERIES} height={230} format={(v) => `₱${Math.round(v / 1000)}k`} />
        </Panel>

        <Panel>
          <PanelTitle title="Expense by category" subtitle="Recorded expenses only" />
          {byCategory.length ? (
            <div className="flex flex-col items-center gap-5 2xl:flex-row">
              <Donut data={byCategory} size={180} thickness={26} label="Expenses by category">
                <strong className="text-lg font-medium leading-none tracking-[-0.4px] text-ink-950">{peso(expenses)}</strong>
                <small className="mt-1 text-[11px] text-ink-500">Total spent</small>
              </Donut>
              <div className="w-full min-w-0 flex-1"><Legend data={byCategory} format={peso} /></div>
            </div>
          ) : <p className="py-10 text-center text-[13px] text-ink-500">No expenses recorded for this selection.</p>}
        </Panel>
      </div>

      {/* Year-end statistics */}
      <Panel className="mt-4">
        <PanelTitle title="Year-end statistics" />
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-4">
          {[['Activities conducted', conducted.length], ['Participants reached', reached], ['Average attendance', '89.4%'], ['Budget committed', `${Math.round((allocated / annual) * 100)}%`]].map(([k, v]) => (
            <div key={k}><dt className="text-xs text-ink-500">{k}</dt><dd className="mt-1 text-[22px] font-medium leading-none tracking-[-0.4px] text-ink-950">{v}</dd></div>
          ))}
        </dl>
      </Panel>

      <SectionLabel>Breakdown</SectionLabel>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel pad={false} className="overflow-hidden"><div className="p-5 pb-2"><PanelTitle title="By activity type" /></div><DataTable columns={summaryCols('Type')} rows={byType} footer={totalRow(byType)} /></Panel>
        <Panel pad={false} className="overflow-hidden"><div className="p-5 pb-2"><PanelTitle title="By funding source" /></div><DataTable columns={summaryCols('Funding')} rows={byFunding} footer={totalRow(byFunding)} /></Panel>
      </div>

      <SectionLabel>Needs attention</SectionLabel>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Flag title="Over budget" subtitle="Expenses above allocation" rows={over} empty="No activity is over budget." onOpen={(id) => navigate(`/activities/${id}`)} />
        <Flag title="Conducted without a budget" subtitle="Ongoing or completed, no line items" rows={noBudget} empty="Every conducted activity has a budget." onOpen={(id) => navigate(`/activities/${id}`)} />
        <Flag title="Planned but not conducted" subtitle="Planned events whose dates have passed" rows={notConducted} empty="Nothing was missed." onOpen={() => {}} />
      </div>

      {setting && <AnnualModal onClose={() => setSetting(false)} />}
    </PageWrapper>
  );
}
