import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper, PageHeader, SectionLabel } from '../../layout/PageWrapper';
import { Badge, Button, Icon, Metric, Panel, PanelTitle, ProgressBar } from '../../ui';
import { useAuth } from '../../../context/AuthContext';
import { useStore } from '../../../hooks/useStore';
import { ACTIVITY_SUMMARY, AGENCY, DASHBOARD_STATS, TREND, peso } from '../../../data/mockData';
import { buildEvents, useBudgetNumbers } from '../../../lib/budgetModel';

/**
 * Layout follows the reference UI: pastel hero banner → quiet metrics →
 * a titled list card → cards in a row. One focal point (the hero).
 */

/** Decorative 3D-ish shapes for the hero, drawn with CSS only */
function HeroArt() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 hidden h-full w-[42%] sm:block">
      <span className="absolute right-[12%] top-[14%] h-[132px] w-[132px] rounded-full bg-[radial-gradient(circle_at_30%_25%,#c9b6ff,#8a63f0_55%,#6a43d8)] shadow-[0_18px_30px_rgba(106,67,216,0.35)]">
        <span className="absolute left-1/2 top-1/2 h-[54px] w-[54px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_70%_70%,#d9e6fb,#cfdcf7)] shadow-[inset_0_6px_12px_rgba(106,67,216,0.35)]" />
      </span>
      <span className="absolute right-[44%] top-[22%] h-[44px] w-[44px] rotate-12 rounded-xl bg-gradient-to-br from-[#ff8a6b] to-[#e84a4a] shadow-[0_10px_18px_rgba(232,74,74,0.35)]" />
      <span className="absolute right-[40%] top-[58%] h-0 w-0 -rotate-12 border-x-[22px] border-b-[40px] border-x-transparent border-b-[#f25f7a] drop-shadow-[0_8px_10px_rgba(242,95,122,0.4)]" />
      <span className="absolute right-[36%] top-[6%] h-[22px] w-[22px] rounded-full bg-[radial-gradient(circle_at_30%_30%,#d9c8ff,#8a63f0)]" />
    </div>
  );
}

function Hero({ onClose }) {
  return (
    <section className="banner-pastel relative mb-2 overflow-hidden rounded-[20px] p-6 ring-1 ring-white/80 sm:p-7">
      <HeroArt />
      <button onClick={onClose} aria-label="Dismiss" className="absolute left-auto right-3 top-3 z-10 grid h-7 w-7 place-items-center rounded-full text-ink-500 hover:bg-white/60 sm:hidden">
        <Icon name="close" size={14} />
      </button>
      <div className="relative max-w-[460px]">
        <div className="mb-3 flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-950 text-[11px] font-medium text-white">{AGENCY.shortName.slice(0, 2)}</span>
          <h2 className="text-[17px] font-medium text-ink-950">Welcome to {AGENCY.shortName}</h2>
        </div>
        <p className="text-[13px] leading-relaxed text-ink-600">{AGENCY.name}. {AGENCY.mission}</p>
        <div className="mt-5 flex gap-2">
          <Button onClick={onClose}>Got it</Button>
        </div>
      </div>
    </section>
  );
}

function TrendChart() {
  return (
    <div className="flex h-[190px] items-end gap-3 border-b border-[var(--glass-divider)] px-1 pt-2">
      {TREND.map((bar, i) => {
        const current = i === TREND.length - 1;
        return (
          <div key={bar.m} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <span className="text-[11px] text-ink-500">{Math.round(bar.v / 8)}</span>
            <div
              className={`w-full max-w-[40px] rounded-t-xl ${current ? 'bg-gradient-to-t from-brand-600 to-brand-400' : 'bg-gradient-to-t from-brand-200 to-brand-100'}`}
              style={{ height: `${bar.v}%` }}
            />
            <small className="pb-2 text-[11px] text-ink-500">{bar.m}</small>
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard({ notify }) {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { activities, items, plans, published, annual } = useStore();
  const [showHero, setShowHero] = useState(true);

  const isAdmin = role === 'Agency Administrator' || role === 'Super Admin';
  const budget = useBudgetNumbers(activities, items, annual);
  const events = buildEvents(activities, plans, items, published).filter((e) => e.end >= '2025-06-18').slice(0, 3);
  const { all, completed, ongoing, upcoming } = ACTIVITY_SUMMARY;
  const utilization = Math.round((budget.actual / annual) * 100);
  const live = activities.filter((a) => a.status === 'Ongoing' || a.status === 'Upcoming');

  return (
    <PageWrapper>
      <PageHeader title="Good morning, Alexis" subtitle={`Here’s what’s happening across ${AGENCY.shortName} training and extension activities.`}>
        <Button variant="secondary" icon="download" onClick={() => notify?.('Summary exported')}>Export summary</Button>
        <Button icon="plus" onClick={() => navigate('/activities?new=1')}>Create activity</Button>
      </PageHeader>

      {showHero && <Hero onClose={() => setShowHero(false)} />}

      <SectionLabel>Overview</SectionLabel>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {DASHBOARD_STATS.map((s) => <Metric key={s.label} label={s.label} value={s.value} note={s.change} icon={s.icon} />)}
      </div>

      <SectionLabel action={<Button variant="ghost" size="sm" iconRight="arrow" onClick={() => navigate('/activities')}>View all activities</Button>}>
        Ongoing and upcoming
      </SectionLabel>
      <Panel pad={false} className="overflow-hidden p-1.5">
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
              <span className="hidden w-32 sm:block"><Badge value={a.status} /></span>
              <span className="hidden w-14 items-center justify-end gap-1 text-xs text-ink-500 md:flex"><Icon name="users" size={13} />{a.participants}</span>
              <Button variant="secondary" size="sm" onClick={() => navigate(`/activities/${a.id}`)}>Open</Button>
            </div>
          );
        })}
      </Panel>

      <SectionLabel>Performance</SectionLabel>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Panel>
          <PanelTitle title="Activity trends" subtitle="Activities conducted over the last six months" />
          <TrendChart />
        </Panel>
        <Panel>
          <PanelTitle title="Implementation status" subtitle="Current activity portfolio" />
          <div className="flex items-end justify-between">
            <strong className="text-[30px] font-medium leading-none tracking-[-0.8px] text-ink-950">{all}</strong>
            <span className="pb-1 text-xs text-ink-500">activities this year</span>
          </div>
          <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-brand-900/[0.07]" role="img" aria-label={`${completed} completed, ${ongoing} ongoing, ${upcoming} upcoming`}>
            <div className="bg-emerald-400" style={{ width: `${(completed / all) * 100}%` }} />
            <div className="bg-brand-500" style={{ width: `${(ongoing / all) * 100}%` }} />
            <div className="bg-amber-400" style={{ width: `${(upcoming / all) * 100}%` }} />
          </div>
          <ul className="mt-4 space-y-2">
            {[['Completed', completed, 'bg-emerald-400'], ['Ongoing', ongoing, 'bg-brand-500'], ['Upcoming', upcoming, 'bg-amber-400']].map(([l, n, c]) => (
              <li key={l} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-ink-600"><i className={`h-1.5 w-1.5 rounded-full ${c}`} />{l}</span>
                <strong className="font-medium text-ink-950">{n}</strong>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-[var(--glass-divider)] pt-4">
            <div className="mb-2 flex justify-between text-xs"><span className="text-ink-600">Feedback completion</span><strong className="font-medium text-ink-950">84%</strong></div>
            <ProgressBar value={84} />
          </div>
        </Panel>
      </div>

      <SectionLabel>{isAdmin ? 'Budget and upcoming events' : 'Upcoming events'}</SectionLabel>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isAdmin && (
          <Panel className="flex flex-col">
            <PanelTitle title="Budget utilization" subtitle={`Annual budget ${peso(annual)}`} />
            <strong className="text-[28px] font-medium leading-none tracking-[-0.6px] text-ink-950">{utilization}%</strong>
            <div className="relative my-3 h-2 rounded-full bg-brand-900/[0.07]">
              <div className="absolute inset-y-0 left-0 rounded-full bg-brand-200" style={{ width: `${Math.min(100, (budget.estimated / annual) * 100)}%` }} />
              <div className="absolute inset-y-0 left-0 rounded-full bg-brand-600" style={{ width: `${Math.min(100, (budget.actual / annual) * 100)}%` }} />
            </div>
            <dl className="space-y-1.5 text-xs">
              {[['Actual', peso(budget.actual)], ['Estimated', peso(budget.estimated)], ['Remaining', peso(budget.remaining)]].map(([k, v]) => (
                <div key={k} className="flex justify-between"><dt className="text-ink-500">{k}</dt><dd className="text-ink-950">{v}</dd></div>
              ))}
            </dl>
            <Button variant="secondary" size="sm" className="mt-auto self-start" onClick={() => navigate('/budget')}>Review budget</Button>
          </Panel>
        )}
        {events.map((e) => (
          <Panel key={e.key} className="flex flex-col">
            <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-brand-100 text-brand-700"><Icon name="calendar" size={18} /></span>
            <strong className="text-[13px] font-medium leading-snug text-ink-950">{e.title}</strong>
            <p className="mt-1 text-xs text-ink-500">{e.type} · {e.venue}</p>
            <div className="mt-3 flex items-center justify-between">
              <Badge value={e.status} />
              <Button variant="secondary" size="sm" onClick={() => navigate(e.activityId ? `/activities/${e.activityId}` : '/calendar')}>Open</Button>
            </div>
          </Panel>
        ))}
      </div>
    </PageWrapper>
  );
}
