import { useNavigate } from 'react-router-dom';
import { PageWrapper, PageHeader } from '../../layout/PageWrapper';
import { BarChart, Badge, Button, Donut, HeroScene, Icon, Legend, MeterRow, Metric, Panel, PanelTitle } from '../../ui';
import { useAuth } from '../../../context/AuthContext';
import { useStore } from '../../../hooks/useStore';
import { ACTIVITY_SUMMARY, AGENCY, DASHBOARD_STATS, TREND, peso } from '../../../data/mockData';
import { formatRange, parseRange, useBudgetNumbers } from '../../../lib/budgetModel';
import { downloadCsv } from '../../../lib/download';

/**
 * Dashboard order: KPI cards → performance (bars + pie) → live activities beside budget utilization.
 * Nothing follows, so the page ends on the budget.
 */

const TREND_DATA = TREND.map((t) => ({ label: t.m, v: Math.round(t.v / 8) }));
const TREND_SERIES = [{ key: 'v', label: 'Activities', color: 'var(--color-brand-600)' }];

export default function Dashboard({ notify }) {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { activities, items, annual } = useStore();

  const isAdmin = role === 'Agency Administrator' || role === 'Super Admin';
  const budget = useBudgetNumbers(activities, items, annual);
  const { all, completed, ongoing, upcoming } = ACTIVITY_SUMMARY;
  const live = activities
    .filter((a) => a.status === 'Ongoing' || a.status === 'Upcoming')
    .sort((a, b) => parseRange(a.date).start.localeCompare(parseRange(b.date).start));
  const next = live.find((a) => a.status === 'Ongoing') ?? live[0];

  const allocated = budget.estimated;
  const expenses = budget.actual;
  const utilization = annual ? Math.round((expenses / annual) * 100) : 0;

  const status = [
    { label: 'Completed', value: completed, color: '#34d399' },
    { label: 'Ongoing',   value: ongoing,   color: '#4a82ee' },
    { label: 'Upcoming',  value: upcoming,  color: '#fbbf24' },
  ];

  return (
    <PageWrapper>
      <PageHeader title="Good morning, Alexis" subtitle={`Here’s what’s happening across ${AGENCY.shortName} training and extension activities.`}>
        <Button variant="secondary" icon="download" onClick={() => { downloadCsv('dashboard-summary.csv', [['Measure', 'Value'], ...DASHBOARD_STATS.map((d) => [d.label, d.value]), ['Completed activities', completed], ['Ongoing activities', ongoing], ['Upcoming activities', upcoming], ['Annual budget', annual], ['Allocated budget', allocated], ['Expenses', expenses], [], ['Activity', 'Status', 'Dates', 'Participants'], ...live.map((a) => [a.title, a.status, a.date, `${a.participants}/${a.capacity}`])]); notify?.('Summary exported as CSV'); }}>Export summary</Button>
        <Button icon="plus" onClick={() => navigate('/activities?new=1')}>Create activity</Button>
      </PageHeader>

      {/* Banner with a live 3D scene (drag it) */}
      {next && (
        <section className="banner-pastel relative mb-5 min-h-[240px] overflow-hidden rounded-[20px] ring-1 ring-white/80">
          <HeroScene />
          <div className="relative flex h-full max-w-[540px] flex-col items-start p-6 sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-950 text-[11px] font-medium text-white">{AGENCY.shortName.slice(0, 2)}</span>
              <span className="text-[17px] font-medium text-ink-950">{next.status === 'Ongoing' ? 'Happening now' : 'Next on your schedule'}</span>
            </div>
            <strong className="text-[19px] font-medium leading-snug tracking-[-0.3px] text-ink-950">{next.title}</strong>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-600">
              {next.type} · {formatRange(parseRange(next.date).start, parseRange(next.date).end)} · {next.venue}. {next.participants} of {next.capacity} slots are filled.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={() => navigate(`/activities/${next.id}`)}>Open activity</Button>
              <Button variant="secondary" onClick={() => navigate('/calendar')}>View calendar</Button>
            </div>
          </div>
        </section>
      )}

      {/* 1 · KPI cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {DASHBOARD_STATS.map((s) => <Metric key={s.label} label={s.label} value={s.value} note={s.change} icon={s.icon} />)}
      </div>

      {/* 2 · Performance */}
      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Panel>
          <PanelTitle title="Performance" subtitle="Activities conducted over the last six months" />
          <BarChart data={TREND_DATA} series={TREND_SERIES} height={230} showValues highlightLast />
        </Panel>
        <Panel>
          <PanelTitle title="Implementation status" subtitle={`${all} activities this year`} />
          <div className="flex flex-col items-center gap-5 2xl:flex-row">
            <Donut data={status} size={170} thickness={24} label={`${completed} completed, ${ongoing} ongoing, ${upcoming} upcoming`}>
              <strong className="text-[26px] font-medium leading-none tracking-[-0.8px] text-ink-950">{all}</strong>
              <small className="mt-1 text-[11px] text-ink-500">activities</small>
            </Donut>
            <div className="w-full min-w-0 flex-1"><Legend data={status} /></div>
          </div>
          <div className="mt-5 space-y-3.5 border-t border-[var(--glass-divider)] pt-5">
            <MeterRow label="Feedback completion" value={84} tone="ok" labelWidth={140} />
            <MeterRow label="Reentry plans" value={76} labelWidth={140} />
            <MeterRow label="Average attendance" value={89} tone="ok" labelWidth={140} />
          </div>
        </Panel>
      </div>

      {/* 3 · Ongoing and upcoming + budget */}
      <div className={`mt-4 grid grid-cols-1 gap-4 ${isAdmin ? 'xl:grid-cols-[1.6fr_1fr]' : ''}`}>
        <Panel pad={false} className="overflow-hidden">
          <div className="p-5 pb-2">
            <PanelTitle title="Ongoing and upcoming activities" subtitle={`${live.length} on the schedule`}>
              <button type="button" onClick={() => navigate('/activities')} className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 transition-colors hover:text-brand-900">View all<Icon name="arrow" size={13} /></button>
            </PanelTitle>
          </div>
          <div className="px-2 pb-2">
            {live.map((a) => {
              const [mon, day] = a.dateShort.split(' ');
              return (
                <div key={a.id} className="flex items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-white/50">
                  <span className="glass-inset grid h-11 w-11 flex-shrink-0 place-content-center rounded-xl text-center text-brand-800">
                    <strong className="block text-[15px] font-medium leading-none">{day}</strong>
                    <span className="mt-0.5 block text-[9px] text-ink-500">{mon}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-[13px] font-medium text-ink-950">{a.title}</strong>
                    <span className="block truncate text-xs text-ink-500">{a.type} · {a.venue}</span>
                  </span>
                  <span className="hidden w-28 sm:block"><Badge value={a.status} /></span>
                  <span className="hidden w-14 items-center justify-end gap-1 text-xs text-ink-500 md:flex"><Icon name="users" size={13} />{a.participants}</span>
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/activities/${a.id}`)}>Open</Button>
                </div>
              );
            })}
          </div>
        </Panel>

        {isAdmin && (
          <Panel className="flex flex-col">
            <PanelTitle title="Budget utilization" subtitle={`Annual budget ${peso(annual)}`} />
            <strong className="text-[30px] font-medium leading-none tracking-[-0.8px] text-ink-950">{utilization}%</strong>
            <small className="mt-1 text-xs text-ink-500">of the annual budget spent</small>
            <div className="relative my-4 h-2 rounded-full bg-brand-900/[0.07]">
              <div className="absolute inset-y-0 left-0 rounded-full bg-brand-200" style={{ width: `${Math.min(100, (allocated / annual) * 100)}%` }} />
              <div className="absolute inset-y-0 left-0 rounded-full bg-brand-600" style={{ width: `${Math.min(100, (expenses / annual) * 100)}%` }} />
            </div>
            <dl className="space-y-2 text-xs">
              {[['Allocated budget', peso(allocated)], ['Expenses', peso(expenses)], ['Remaining', peso(allocated - expenses)]].map(([k, v]) => (
                <div key={k} className="flex justify-between"><dt className="text-ink-500">{k}</dt><dd className="font-medium tabular-nums text-ink-950">{v}</dd></div>
              ))}
            </dl>
            <Button variant="secondary" size="sm" className="mt-5 self-start" onClick={() => navigate('/budget')}>Review budget</Button>
          </Panel>
        )}
      </div>
    </PageWrapper>
  );
}
