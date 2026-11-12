import { PageWrapper, PageHeader } from '../../layout/PageWrapper';
import { Button, Metric, Panel, PanelTitle, ProgressBar, Select } from '../../ui';
import { ACTIVITIES, EVALUATION, PARTICIPATION_BY_TYPE, REPORT_METRICS } from '../../../data/mockData';

function Donut({ value }) {
  const deg = (value / 100) * 360;
  return (
    <div
      className="relative mx-auto grid h-40 w-40 place-items-center rounded-full"
      style={{ background: `conic-gradient(#2563d9 0deg ${deg}deg, rgba(29,79,192,0.12) ${deg}deg 360deg)` }}
      role="img"
      aria-label={`${value}% completed`}
    >
      <div className="grid h-[118px] w-[118px] place-items-center rounded-full bg-white/90 text-center shadow-[inset_0_1px_0_#fff]">
        <div>
          <strong className="block text-3xl font-medium leading-none tracking-[-1px] text-ink-950">{value}%</strong>
          <span className="text-xs text-ink-500">completed</span>
        </div>
      </div>
    </div>
  );
}

export default function Reports({ notify }) {
  return (
    <PageWrapper>
      <PageHeader
        eyebrow="Workspace"
        title="Reports & analytics"
        subtitle="Measure implementation, participation, attendance, and training outcomes."
      >
        <Button icon="download" onClick={() => notify?.('Activity performance report exported as PDF')}>Export report</Button>
      </PageHeader>

      <Panel className="mb-5 flex flex-wrap items-center gap-3">
        <Select aria-label="Activity" className="w-full sm:w-64">
          <option>All activities</option>
          {ACTIVITIES.map((a) => <option key={a.id}>{a.title}</option>)}
        </Select>
        <Select aria-label="Period"><option>January – June 2025</option><option>Full year 2025</option></Select>
        <Select aria-label="Type"><option>All activity types</option><option>Training</option><option>Seminar</option></Select>
        <Button variant="secondary" className="sm:ml-auto">Apply filters</Button>
      </Panel>

      <div className="mb-5 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {REPORT_METRICS.map((m) => <Metric key={m.label} label={m.label} value={m.value} note={m.note} />)}
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Panel>
          <PanelTitle title="Participation by activity type" subtitle="Unique participants, January–June 2025" />
          <ul className="space-y-4">
            {PARTICIPATION_BY_TYPE.map((r) => (
              <li key={r.label} className="grid grid-cols-[130px_1fr_44px] items-center gap-3 text-[13px]">
                <span className="text-ink-600">{r.label}</span>
                <ProgressBar value={r.pct} className="!h-2.5" />
                <strong className="text-right text-ink-950">{r.count}</strong>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <PanelTitle title="Planned vs. conducted" subtitle="Annual implementation progress" />
          <Donut value={73} />
          <div className="mt-5 flex justify-center gap-6 text-[13px]">
            <span className="flex items-center gap-2 text-ink-600"><i className="h-2 w-2 rounded-full bg-brand-900/20" />Planned <strong className="text-ink-950">26</strong></span>
            <span className="flex items-center gap-2 text-ink-600"><i className="h-2 w-2 rounded-full bg-brand-600" />Conducted <strong className="text-ink-950">19</strong></span>
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelTitle title="Evaluation overview" subtitle="Participant feedback from completed activities" />
        <div className="grid items-center gap-8 lg:grid-cols-[220px_1fr]">
          <div className="glass-inset rounded-2xl p-5 text-center">
            <strong className="block text-5xl font-medium leading-none tracking-[-2px] text-brand-700">{EVALUATION.score}</strong>
            <span className="mt-1 block text-[13px] text-ink-600">out of 5.0</span>
            <small className="mt-1 block text-xs text-ink-500">Based on {EVALUATION.responses} responses</small>
          </div>
          <ul className="space-y-4">
            {EVALUATION.rows.map((r) => (
              <li key={r.label} className="grid grid-cols-[minmax(130px,220px)_1fr_44px] items-center gap-3 text-[13px]">
                <span className="text-ink-600">{r.label}</span>
                <ProgressBar value={r.value} className="!h-2.5" />
                <strong className="text-right text-ink-950">{r.value}%</strong>
              </li>
            ))}
          </ul>
        </div>
      </Panel>
    </PageWrapper>
  );
}
