import { useState } from 'react';
import { PageWrapper, PageHeader } from '../../layout/PageWrapper';
import { Button, Donut, Legend, MeterRow, Metric, Panel, PanelTitle, Select } from '../../ui';
import { useStore } from '../../../hooks/useStore';
import { EVALUATION, PARTICIPATION_BY_TYPE, REPORT_METRICS } from '../../../data/mockData';
import { downloadFile, makePdf } from '../../../lib/download';
import { activityInRange, activityLabel, formatRange } from '../../../lib/budgetModel';
import { ActivityPicker, PeriodFilter } from '../../shared/Filters';

const IMPL = [
  { label: 'Conducted', value: 19, color: 'var(--color-brand-600)' },
  { label: 'Not yet conducted', value: 7, color: 'var(--color-brand-200)' },
];
const TYPE_MAP = { Training: 'Skills Training', Seminar: 'Seminar' };
const DEFAULT = { activity: 'all', from: '', to: '', type: 'All activity types' };

export default function Reports({ notify }) {
  const { activities } = useStore();
  const [draft, setDraft] = useState(DEFAULT);
  const [applied, setApplied] = useState(DEFAULT);
  const filtered = applied.activity !== DEFAULT.activity || applied.type !== DEFAULT.type || !!applied.from || !!applied.to;
  const dirty = JSON.stringify(draft) !== JSON.stringify(applied);

  // With no activity or type filter the agency-wide figures show; otherwise they come from the matching activities.
  const matching = activities.filter((a) => (applied.activity === DEFAULT.activity || String(a.id) === applied.activity)
    && (applied.type === DEFAULT.type || a.type === (TYPE_MAP[applied.type] ?? applied.type))
    && activityInRange(a, applied.from, applied.to));
  const periodText = applied.from || applied.to
    ? `${applied.from ? formatRange(applied.from, applied.from) : 'the start'} to ${applied.to ? formatRange(applied.to, applied.to) : 'today onward'}`
    : 'January – December 2025';
  const chosen = activities.find((a) => String(a.id) === applied.activity);
  const invalid = draft.from && draft.to && draft.to < draft.from;
  const conducted = matching.filter((a) => a.status === 'Completed' || a.status === 'Ongoing');
  const metrics = filtered
    ? [
        { label: 'Activities conducted', value: String(conducted.length), note: `${matching.length} matching the filters` },
        { label: 'Total participants', value: String(matching.reduce((s, a) => s + a.participants, 0)), note: 'Registered in these activities' },
        REPORT_METRICS[2], REPORT_METRICS[3],
      ]
    : REPORT_METRICS;
  const byType = filtered && applied.type !== DEFAULT.type
    ? PARTICIPATION_BY_TYPE.filter((r) => r.label.toLowerCase().startsWith(applied.type.toLowerCase().slice(0, 5)))
    : PARTICIPATION_BY_TYPE;

  const exportReport = () => {
    downloadFile('Activity_Performance_Report.pdf', makePdf('Activity performance report', [
      `Period: ${periodText}`, `Activity: ${chosen ? activityLabel(chosen, activities) : 'All activities'}`, `Type: ${applied.type}`, '',
      ...metrics.map((m) => `${m.label}: ${m.value} (${m.note})`), '',
      'Participation by activity type:', ...byType.map((r) => `  ${r.label}: ${r.count} participants`), '',
      `Evaluation score: ${EVALUATION.score} / 5.0 from ${EVALUATION.responses} responses`,
    ]));
    notify?.('Activity performance report downloaded as PDF');
  };

  return (
    <PageWrapper>
      <PageHeader eyebrow="Workspace" title="Reports & analytics" subtitle="Measure implementation, participation, attendance, and training outcomes.">
        <Button icon="download" onClick={exportReport}>Export report</Button>
      </PageHeader>

      <Panel className="mb-5 flex flex-wrap items-center gap-3 !px-5 !py-3">
        <PeriodFilter from={draft.from} to={draft.to} onChange={(p) => setDraft({ ...draft, ...p })} />
        <ActivityPicker activities={activities} value={draft.activity} onChange={(v) => setDraft({ ...draft, activity: v })} />
        <Select aria-label="Type" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })}><option>All activity types</option><option>Training</option><option>Seminar</option></Select>
        <div className="flex gap-2 sm:ml-auto">
          {(filtered || dirty) && <Button variant="ghost" onClick={() => { setDraft(DEFAULT); setApplied(DEFAULT); }}>Reset</Button>}
          <Button variant="secondary" disabled={!dirty || invalid} onClick={() => { setApplied(draft); notify?.('Filters applied'); }}>Apply filters</Button>
        </div>
      </Panel>

      <div className="mb-5 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {metrics.map((m) => <Metric key={m.label} label={m.label} value={m.value} note={m.note} />)}
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Panel>
          <PanelTitle title="Participation by activity type" subtitle={`Unique participants, ${periodText}`} />
          <ul className="space-y-4">
            {byType.map((r) => <MeterRow key={r.label} label={r.label} value={r.pct} display={r.count} />)}
            {!byType.length && <li className="text-[13px] text-ink-500">No participation recorded for this type.</li>}
          </ul>
        </Panel>

        <Panel>
          <PanelTitle title="Planned vs. conducted" subtitle="Annual implementation progress" />
          <div className="flex flex-col items-center gap-5 2xl:flex-row">
            <Donut data={IMPL} size={170} thickness={24} label="19 of 26 activities conducted">
              <strong className="text-[26px] font-medium leading-none tracking-[-0.8px] text-ink-950">73%</strong>
              <small className="mt-1 text-[11px] text-ink-500">conducted</small>
            </Donut>
            <div className="w-full min-w-0 flex-1"><Legend data={IMPL} /></div>
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
            {EVALUATION.rows.map((r) => <MeterRow key={r.label} label={r.label} value={r.value} labelWidth={200} />)}
          </ul>
        </div>
      </Panel>
    </PageWrapper>
  );
}
