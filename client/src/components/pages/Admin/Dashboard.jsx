import { PageWrapper, PageHeader } from '../../layout/PageWrapper';
import { Button, Icon } from '../../ui';

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, delta, icon, color }) {
  const colors = {
    green:  { icon: 'bg-green-100 text-green-700',  delta: 'text-green-600'  },
    blue:   { icon: 'bg-blue-100  text-blue-600',   delta: 'text-blue-600'   },
    amber:  { icon: 'bg-amber-100 text-amber-700',  delta: 'text-amber-600'  },
    violet: { icon: 'bg-violet-100 text-violet-700', delta: 'text-violet-600' },
  };
  const c = colors[color] ?? colors.green;

  return (
    <div className="bg-white border border-line rounded-xl p-[18px] grid grid-cols-[42px_1fr_auto] gap-3 items-center shadow-card hover:-translate-y-px hover:shadow-panel transition-all duration-200">
      <span className={`w-[42px] h-[42px] grid place-items-center rounded-[10px] ${c.icon}`}>
        <Icon name={icon} size={20} />
      </span>
      <div>
        <span className="block text-xs text-ink-600">{label}</span>
        <strong className="block text-2xl font-bold text-ink-950 mt-0.5 leading-none">{value}</strong>
        {delta && <small className={`block text-[9px] mt-1 font-medium ${c.delta}`}>{delta}</small>}
      </div>
    </div>
  );
}

// ─── Recent Activity Row ──────────────────────────────────────────────────────
function ActivityRow({ title, type, date, status, participants }) {
  const statusColors = {
    Upcoming:  'bg-amber-100 text-yellow-800',
    Ongoing:   'bg-blue-100  text-blue-600',
    Completed: 'bg-green-100 text-green-700',
    Draft:     'bg-[#edf0ee] text-ink-600',
  };
  const [mon, day] = date.toUpperCase().split(' ');

  return (
    <div className="flex items-center gap-4 px-5 py-3 border-b border-line last:border-0 hover:bg-green-50 transition-colors cursor-pointer">
      <div className="w-11 h-11 rounded-lg bg-green-50 text-green-800 grid place-content-center text-center flex-shrink-0">
        <strong className="block text-base font-bold leading-none">{day}</strong>
        <span className="block text-[8px] font-bold mt-0.5">{mon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <strong className="block text-xs font-semibold text-ink-950 truncate">{title}</strong>
        <span className="block text-[9px] text-ink-500 mt-0.5">{type}</span>
      </div>
      <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${statusColors[status] ?? statusColors.Draft}`}>
        {status}
      </span>
      <span className="text-[9px] text-ink-400 flex items-center gap-1 flex-shrink-0">
        <Icon name="users" size={12} />
        {participants}
      </span>
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────
const STATS = [
  { label: 'Total Activities',    value: '24',    delta: '+2 this month',     icon: 'clock',    color: 'green'  },
  { label: 'Total Participants',  value: '1,284', delta: '+68 this quarter',  icon: 'users',    color: 'blue'   },
  { label: 'Upcoming Activities', value: '7',     delta: 'Next: Jun 17',      icon: 'calendar', color: 'amber'  },
  { label: 'Budget Utilized',     value: '73%',   delta: '₱1.4M remaining',   icon: 'award',    color: 'violet' },
];

const RECENT = [
  { title: 'Rubber Production and Tapping Technology', type: 'Skills Training',   date: 'JUN 17', status: 'Upcoming',  participants: 42 },
  { title: 'Community-Based Rubber Nursery Mgmt',      type: 'Extension Activity',date: 'JUN 10', status: 'Ongoing',   participants: 36 },
  { title: 'Pest and Disease Management for Rubber',   type: 'Seminar',           date: 'MAY 22', status: 'Completed', participants: 68 },
  { title: 'Results-Based Monitoring Workshop',        type: 'Workshop',          date: 'JUL 08', status: 'Upcoming',  participants: 28 },
  { title: 'Agricultural Innovation Systems Forum',    type: 'Forum',             date: 'AUG 14', status: 'Draft',     participants: 12 },
];

export default function Dashboard({ notify }) {
  return (
    <PageWrapper>
      <PageHeader
        eyebrow="PRRI — Pilot Agency"
        title="Dashboard"
        subtitle="Here's what's happening across your agency's activities."
      >
        <Button variant="secondary" icon="download">Export</Button>
        <Button variant="primary"   icon="plus" onClick={() => notify?.('Create activity coming soon')}>
          New Activity
        </Button>
      </PageHeader>

      {/* ── Stat grid ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3.5 mb-5">
        {STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.65fr_1fr] gap-4">

        {/* Recent activities panel */}
        <div className="bg-white border border-line rounded-xl overflow-hidden shadow-card">
          <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3">
            <div>
              <h2 className="text-base font-bold text-ink-950 tracking-[-0.2px]">Recent Activities</h2>
              <p className="text-xs text-ink-500 mt-1">Latest training and extension activities</p>
            </div>
            <Button variant="ghost" size="sm" iconRight="arrow">View all</Button>
          </div>
          <div>
            {RECENT.map((a) => <ActivityRow key={a.title} {...a} />)}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Quick stats / completion card */}
          <div className="bg-white border border-line rounded-xl p-5 shadow-card">
            <h2 className="text-base font-bold text-ink-950 mb-1">Activity Completion</h2>
            <p className="text-xs text-ink-500 mb-4">Year-to-date progress</p>
            <div className="h-1.5 w-full rounded-full bg-green-100 overflow-hidden mb-3">
              <div className="h-full w-[73%] rounded-full bg-green-600" />
            </div>
            <ul className="space-y-2">
              {[
                { label: 'Completed',  count: 14, pct: '58%',  color: 'bg-green-600' },
                { label: 'Upcoming',   count: 7,  pct: '29%',  color: 'bg-amber-500' },
                { label: 'Draft',      count: 3,  pct: '13%',  color: 'bg-[#dde5e0]' },
              ].map((r) => (
                <li key={r.label} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-ink-600">
                    <i className={`w-2 h-2 rounded-full inline-block ${r.color}`} />
                    {r.label}
                  </span>
                  <span className="font-semibold text-ink-950">{r.count} <span className="text-ink-400 font-normal">({r.pct})</span></span>
                </li>
              ))}
            </ul>
          </div>

          {/* Live / upcoming highlight */}
          <div className="rounded-xl bg-gradient-to-br from-green-900 to-green-700 text-white p-5 relative overflow-hidden shadow-panel">
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
            <div className="relative z-10">
              <span className="flex items-center gap-1.5 text-green-200 text-[9px] font-bold uppercase tracking-widest mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Ongoing Now
              </span>
              <strong className="block text-sm font-bold leading-snug">
                Community-Based Rubber Nursery Management
              </strong>
              <small className="block text-white/60 text-[9px] mt-1">
                Ipil, Zamboanga Sibugay · Jun 10–12, 2025
              </small>
              <div className="mt-4 pt-3 border-t border-white/15 flex justify-between items-center text-xs font-semibold">
                <span className="text-white/70">36 / 40 participants checked in</span>
                <button className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1">
                  View <Icon name="arrow" size={13} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </PageWrapper>
  );
}
