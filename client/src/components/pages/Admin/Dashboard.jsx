import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper, PageHeader } from '../../layout/PageWrapper';
import { BarChart, Badge, Button, Donut, HeroArtAgency, Icon, Legend, MeterRow, Metric, Panel, PanelTitle } from '../../ui';
import { ActivityPicker, PeriodFilter } from '../../shared/Filters';
import { useAuth } from '../../../context/AuthContext';
import { useStore } from '../../../hooks/useStore';
import { ACTIVITY_SUMMARY, AGENCY, DASHBOARD_STATS, TODAY_ISO, TREND, peso } from '../../../data/mockData';
import { activityInRange, formatRange, parseRange, useBudgetNumbers } from '../../../lib/budgetModel';
import { downloadCsv } from '../../../lib/download';

/**
 * Dashboard order: today's activities (a carousel) → filters → KPI cards → performance (bars + pie) →
 * activities beside budget utilization. The From–To and activity filters change everything below them.
 */

const TREND_DATA = TREND.map((t) => ({ label: t.m, v: Math.round(t.v / 8) }));
const TREND_SERIES = [{ key: 'v', label: 'Activities', color: 'var(--color-brand-600)' }];
const SLIDE_MS = 3000;
const EDGE = 'absolute top-1/2 z-10 grid h-16 w-8 -translate-y-1/2 place-items-center bg-white/75 text-ink-800 shadow-[0_4px_14px_rgba(40,70,160,0.12)] backdrop-blur-md transition-opacity duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100';

const runsToday = (a) => activityInRange(a, TODAY_ISO, TODAY_ISO);

/**
 * TodayCarousel — every activity running today, one slide each. With two or more it slides sideways by itself every
 * 3 seconds (paused while the pointer or keyboard focus is on it) and can be moved with the half-circle arrows on the
 * edges, which show on hover. People who ask their system for less motion get a plain switch instead of the slide.
 */
function TodayCarousel({ slides }) {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);
  const count = slides.length;
  const current = count ? index % count : 0;
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const paused = hover;

  useEffect(() => {
    if (count < 2 || paused) return undefined;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), SLIDE_MS);
    return () => clearInterval(t);
  }, [count, paused]);

  const go = (i) => setIndex((i + count) % count);
  if (!count) return null;

  return (
    <section
      aria-roledescription="carousel" aria-label="Today’s activities"
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setHover(false); }}
      className="banner-pastel group relative mb-5 min-h-[220px] overflow-hidden rounded-[20px] ring-1 ring-white/80"
    >
      <HeroArtAgency />
      <div className="relative overflow-hidden">
        <div className={`flex ${reduceMotion ? '' : 'transition-transform duration-500 ease-out'}`} style={{ transform: `translateX(-${current * 100}%)` }}>
          {slides.map((a, i) => {
            const { start, end } = parseRange(a.date);
            const label = runsToday(a) ? 'Happening today' : a.status === 'Ongoing' ? 'Happening now' : 'Next on your schedule';
            return (
              <div key={a.id} className="w-full flex-shrink-0" role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${count}`} aria-hidden={i !== current} inert={i !== current}>
                <div className="flex h-full max-w-[540px] flex-col items-start px-10 py-6 sm:px-12 sm:py-8">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-950 text-[11px] font-medium text-white">{AGENCY.shortName.slice(0, 2)}</span>
                    <span className="text-[17px] font-medium text-ink-950">{label}</span>
                  </div>
                  <strong className="text-[19px] font-medium leading-snug tracking-[-0.3px] text-ink-950">{a.title}</strong>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-600">
                    {a.type} · {formatRange(start, end)} · {a.venue}. {a.participants} of {a.capacity} slots are filled.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <Button onClick={() => navigate(`/activities/${a.id}`)}>Open activity</Button>
                    <Button variant="secondary" onClick={() => navigate('/calendar')}>View calendar</Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {count > 1 && (
        <>
          <span className="sr-only" aria-live="polite">{current + 1} of {count}</span>
          {/* Half-circle tabs hugging the left and right edges; they appear while the pointer or focus is on the banner. */}
          <button type="button" onClick={() => go(current - 1)} aria-label="Previous activity" className={`${EDGE} left-0 rounded-r-full pr-1.5`}>
            <Icon name="chevron" size={16} className="rotate-90" />
          </button>
          <button type="button" onClick={() => go(current + 1)} aria-label="Next activity" className={`${EDGE} right-0 rounded-l-full pl-1.5`}>
            <Icon name="chevron" size={16} className="-rotate-90" />
          </button>
        </>
      )}
    </section>
  );
}

export default function Dashboard({ notify }) {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { activities, items, annual } = useStore();
  const [period, setPeriod] = useState({ from: '', to: '' });
  const [pick, setPick] = useState('all');

  const isAdmin = role === 'Agency Administrator' || role === 'Super Admin';
  const byDate = (a, b) => parseRange(a.date).start.localeCompare(parseRange(b.date).start);

  // Today's activities for the carousel: everything running today, otherwise the next one on the schedule.
  const live = activities.filter((a) => a.status === 'Ongoing' || a.status === 'Upcoming').sort(byDate);
  const today = activities.filter((a) => a.status !== 'Completed' && a.status !== 'Draft' && (runsToday(a) || a.status === 'Ongoing')).sort(byDate);
  const slides = today.length ? today : live.slice(0, 1);

  // From–To and activity filters
  const filtering = !!(period.from || period.to || pick !== 'all');
  const inScope = activities.filter((a) => (pick === 'all' || String(a.id) === pick) && activityInRange(a, period.from, period.to)).sort(byDate);
  const listed = filtering ? inScope : live;

  const budget = useBudgetNumbers(filtering ? inScope : activities, items, annual);
  const allocated = budget.estimated;
  const expenses = budget.actual;
  const utilization = annual ? Math.round((expenses / annual) * 100) : 0;

  const counts = filtering
    ? { all: inScope.length, completed: inScope.filter((a) => a.status === 'Completed').length, ongoing: inScope.filter((a) => a.status === 'Ongoing').length, upcoming: inScope.filter((a) => a.status === 'Upcoming').length }
    : ACTIVITY_SUMMARY;
  const { all, completed, ongoing, upcoming } = counts;
  const stats = filtering
    ? [
        { label: 'Total activities', value: String(inScope.length), change: `${completed + ongoing} conducted or running`, icon: 'clock' },
        { label: 'Total participants', value: String(inScope.reduce((s, a) => s + a.participants, 0)), change: 'Registered in these activities', icon: 'users' },
        DASHBOARD_STATS[2], DASHBOARD_STATS[3],
      ]
    : DASHBOARD_STATS;

  const status = [
    { label: 'Completed', value: completed, color: '#34d399' },
    { label: 'Ongoing',   value: ongoing,   color: '#4a82ee' },
    { label: 'Upcoming',  value: upcoming,  color: '#fbbf24' },
  ];

  const periodText = period.from || period.to
    ? `${period.from ? formatRange(period.from, period.from) : 'the start'} to ${period.to ? formatRange(period.to, period.to) : 'today onward'}`
    : '';

  const exportSummary = () => {
    downloadCsv('dashboard-summary.csv', [
      ['Measure', 'Value'],
      ...(periodText ? [['Period', periodText]] : []),
      ...stats.map((d) => [d.label, d.value]),
      ['Completed activities', completed], ['Ongoing activities', ongoing], ['Upcoming activities', upcoming],
      ['Annual budget', annual], ['Allocated budget', allocated], ['Expenses', expenses], [],
      ['Activity', 'Status', 'Dates', 'Participants'], ...listed.map((a) => [a.title, a.status, a.date, `${a.participants}/${a.capacity}`]),
    ]);
    notify?.('Summary exported as CSV');
  };

  return (
    <PageWrapper>
      <PageHeader title="Good morning, Alexis" subtitle={`Here’s what’s happening across ${AGENCY.shortName} training and extension activities.`}>
        <Button variant="secondary" icon="download" onClick={exportSummary}>Export summary</Button>
        <Button icon="plus" onClick={() => navigate('/activities?new=1')}>Create activity</Button>
      </PageHeader>

      <TodayCarousel slides={slides} />

      {/* Filters: they change the cards, charts and lists below */}
      <Panel className="mb-5 flex flex-wrap items-center gap-3 !px-5 !py-3">
        <PeriodFilter from={period.from} to={period.to} onChange={setPeriod} />
        <ActivityPicker activities={activities} value={pick} onChange={setPick} />
        <span className="text-xs text-ink-500 sm:ml-auto">
          {filtering ? `${inScope.length} ${inScope.length === 1 ? 'activity' : 'activities'} match` : 'Showing the whole year'}
        </span>
        {filtering && <Button variant="ghost" size="sm" onClick={() => { setPeriod({ from: '', to: '' }); setPick('all'); }}>Reset</Button>}
      </Panel>

      {/* 1 · KPI cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s) => <Metric key={s.label} label={s.label} value={s.value} note={s.change} icon={s.icon} />)}
      </div>

      {/* 2 · Performance */}
      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Panel>
          <PanelTitle title="Performance" subtitle="Activities conducted over the last six months" />
          <BarChart data={TREND_DATA} series={TREND_SERIES} height={230} showValues highlightLast />
        </Panel>
        <Panel>
          <PanelTitle title="Implementation status" subtitle={filtering ? `${all} ${all === 1 ? 'activity' : 'activities'} in this selection` : `${all} activities this year`} />
          <div className="flex flex-col items-center gap-5 2xl:flex-row">
            <Donut data={status} size={170} thickness={24} label={`${completed} completed, ${ongoing} ongoing, ${upcoming} upcoming`}>
              <strong className="text-[26px] font-medium leading-none tracking-[-0.8px] text-ink-950">{all}</strong>
              <small className="mt-1 text-[11px] text-ink-500">{all === 1 ? 'activity' : 'activities'}</small>
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

      {/* 3 · Activities + budget */}
      <div className={`mt-4 grid grid-cols-1 gap-4 ${isAdmin ? 'xl:grid-cols-[1.6fr_1fr]' : ''}`}>
        <Panel pad={false} className="overflow-hidden">
          <div className="p-5 pb-2">
            <PanelTitle title={filtering ? 'Activities in this selection' : 'Ongoing and upcoming activities'} subtitle={filtering ? `${listed.length} found` : `${listed.length} on the schedule`}>
              <button type="button" onClick={() => navigate('/activities')} className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 transition-colors hover:text-brand-900">View all<Icon name="arrow" size={13} /></button>
            </PanelTitle>
          </div>
          <div className="px-2 pb-2">
            {listed.length === 0 && <p className="px-3 py-8 text-center text-[13px] text-ink-500">No activities in this selection.</p>}
            {listed.map((a) => {
              const [mon, day] = a.dateShort.split(' ');
              return (
                <div key={a.id} className="flex items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-white/50">
                  <span className="glass-inset grid h-11 w-11 flex-shrink-0 place-content-center rounded-xl text-center text-brand-800">
                    <strong className="block text-[15px] font-medium leading-none">{day}</strong>
                    <span className="mt-0.5 block text-[9px] text-ink-500">{mon}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-[13px] font-medium text-ink-950">{a.title}</strong>
                    <span className="block truncate text-xs text-ink-500">{a.type} · {a.date} · {a.venue}</span>
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
            <PanelTitle title="Budget utilization" subtitle={filtering ? `For this selection · annual budget ${peso(annual)}` : `Annual budget ${peso(annual)}`} />
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
