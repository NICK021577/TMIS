import { useMemo, useState } from 'react';
import { Badge, Icon, MeterRow, Metric, Panel, PanelTitle } from '../ui';
import { useStore } from '../../hooks/useStore';
import { useAuth } from '../../context/AuthContext';
import { useAccess } from './editContext';
import { FEEDBACK_COMMENTS, SESSION_FEEDBACK } from '../../data/workspaceData';
import {
  CRITERIA_LABELS, MIN_RESPONSES, averageOf, criteriaOf, distributionOf, overallOf, rateOf, recommendOf, responsesOf, standouts,
} from '../../lib/feedbackStats';

const f1 = (n) => (n == null ? '—' : n.toFixed(1));
const pct = (n) => (n == null ? '—' : `${Math.round(n * 100)}%`);

function Stars({ value, size = 14 }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${f1(value)} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => <Icon key={n} name="star" size={size} className={n <= Math.round(value ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-ink-300'} />)}
    </span>
  );
}

const tone = (v) => (v >= 4.5 ? 'ok' : 'brand');
const delta = (v, base) => (v == null || base == null ? null : v - base);

function Delta({ value }) {
  if (value == null) return null;
  const same = Math.abs(value) < 0.05;
  const up = value > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${same ? 'bg-ink-100 text-ink-600' : up ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
      {same ? 'About the same as the activity' : `${up ? '+' : '−'}${Math.abs(value).toFixed(1)} vs activity`}
    </span>
  );
}

/**
 * Feedback summary: overall satisfaction of the activity, then each session on its own.
 * A Resource person sees only the sessions they teach; everyone else sees all sessions.
 */
export default function FeedbackSummary() {
  const { sessions, staffDays } = useStore();
  const { user } = useAuth();
  const access = useAccess();

  const ordered = useMemo(() => [...sessions].sort((a, b) => a.day - b.day || (a.period === b.period ? 0 : a.period === 'AM' ? -1 : 1)), [sessions]);
  const rows = ordered.map((s) => ({ s, fb: SESSION_FEEDBACK[s.id] ?? null }));

  // The signed-in person's name as it appears on sessions, found through their staff entry
  const myName = staffDays.flatMap((d) => d.staff).find((x) => x.email && x.email === user?.email)?.name ?? null;
  const limited = access.label === 'Resource person';
  const mine = rows.filter((r) => myName && r.s.speaker === myName);
  const [scope, setScope] = useState('all');
  const mode = limited ? 'mine' : scope;
  const visible = mode === 'mine' ? mine : rows;

  const allFb = rows.map((r) => r.fb);
  const activityAvg = overallOf(allFb);
  const visibleRated = visible.filter((r) => r.fb);
  const shownAvg = overallOf(visible.map((r) => r.fb));
  const shownResponses = visibleRated.reduce((s, r) => s + responsesOf(r.fb), 0);
  const shownEligible = visibleRated.reduce((s, r) => s + r.fb.eligible, 0);

  const [picked, setPicked] = useState(null);
  const current = visible.find((r) => r.s.id === picked) ?? visibleRated[0] ?? visible[0] ?? null;
  const fb = current?.fb ?? null;
  const n = responsesOf(fb);
  const comments = current ? FEEDBACK_COMMENTS.filter((c) => c.session === current.s.title) : [];
  const small = fb && n < MIN_RESPONSES;
  const dist = fb ? fb.dist : [0, 0, 0, 0, 0];
  const maxD = Math.max(1, ...dist);

  if (limited && !mine.length) {
    return (
      <Panel className="grid place-items-center gap-1 py-14 text-center">
        <Icon name="lock" size={22} className="text-ink-400" />
        <strong className="text-sm font-medium text-ink-950">No sessions of yours yet</strong>
        <span className="max-w-sm text-xs text-ink-500">As a Resource person you see the feedback for the sessions you teach. It appears here once you are named on a session.</span>
      </Panel>
    );
  }

  const st = fb && !small ? standouts(fb) : null;

  return (
    <div className="space-y-4">
      {limited && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-brand-100/70 px-4 py-2.5 text-[13px] text-brand-900">
          <Icon name="users" size={15} />
          <span>Showing feedback for <strong className="font-medium">your {mine.length} session{mine.length === 1 ? '' : 's'}</strong>. Participant names are hidden.</span>
        </div>
      )}

      {/* overall satisfaction */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <div className="glass-panel col-span-2 rounded-[18px] p-5 xl:col-span-1">
          <span className="text-xs text-ink-500">{mode === 'mine' ? 'Satisfaction with your sessions' : 'Overall satisfaction'}</span>
          <div className="mt-2 flex items-end gap-2"><strong className="text-[34px] font-medium leading-none tracking-[-1px] text-ink-950">{f1(shownAvg)}</strong><span className="pb-1 text-xs text-ink-400">/ 5</span></div>
          <div className="mt-2"><Stars value={shownAvg} size={16} /></div>
          <p className="mt-2 text-[11px] leading-snug text-ink-500">
            {mode === 'mine' ? `Activity average ${f1(activityAvg)}` : 'Average of all session ratings, weighted by how many answered'}
          </p>
        </div>
        <Metric label="Response rate" value={pct(shownEligible ? shownResponses / shownEligible : null)} note={`${shownResponses} of ${shownEligible} answers`} tone="brand" />
        <Metric label="Would recommend" value={recommendOf(visible.map((r) => r.fb)) == null ? '—' : `${Math.round(recommendOf(visible.map((r) => r.fb)))}%`} note="Answered Yes" />
        <Metric label="Sessions rated" value={`${visibleRated.length} of ${visible.length}`} note={visible.length > visibleRated.length ? 'The rest have not happened yet' : 'All sessions rated'} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.35fr]">
        {/* sessions list */}
        <Panel pad={false} className="overflow-hidden">
          <div className="p-5 pb-3">
            <PanelTitle title="Session by session" subtitle="Pick a session to see its results">
              {!limited && mine.length > 0 && (
                <div role="tablist" className="glass-inset inline-flex rounded-full p-0.5">
                  {[['all', 'All sessions'], ['mine', 'My sessions']].map(([id, label]) => (
                    <button key={id} role="tab" aria-selected={mode === id} onClick={() => { setScope(id); setPicked(null); }}
                      className={`rounded-full px-3 py-1 text-xs transition-colors ${mode === id ? 'bg-white font-medium text-ink-950 shadow-sm' : 'text-ink-500 hover:text-ink-950'}`}>{label}</button>
                  ))}
                </div>
              )}
            </PanelTitle>
          </div>
          <ul className="divide-y divide-[var(--glass-divider)]">
            {visible.map(({ s, fb: f }) => {
              const avg = averageOf(f);
              const on = current?.s.id === s.id;
              return (
                <li key={s.id}>
                  <button type="button" onClick={() => setPicked(s.id)} aria-pressed={on}
                    className={`flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors ${on ? 'bg-brand-50/80' : 'hover:bg-white/50'}`}>
                    <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-brand-100 text-[11px] font-medium leading-tight text-brand-700">D{s.day}<br />{s.period}</span>
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-[13px] font-medium text-ink-950">{s.title}</strong>
                      <small className="block truncate text-xs text-ink-500">{s.speaker}{f ? ` · ${responsesOf(f)} of ${f.eligible} answered` : ''}</small>
                      {f && (
                        <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-brand-900/[0.07]">
                          <span className={`block h-full rounded-full ${avg >= 4.5 ? 'bg-emerald-400' : 'bg-brand-500'}`} style={{ width: `${(avg / 5) * 100}%` }} />
                        </span>
                      )}
                    </span>
                    {f ? <strong className="w-9 text-right text-[15px] font-medium tabular-nums text-ink-950">{f1(avg)}</strong> : <Badge value="Not yet" tone="muted" variant="pill" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>

        {/* selected session */}
        {current && (
          <Panel>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-[15px] font-medium leading-snug text-ink-950">{current.s.title}</h2>
                <p className="mt-1 text-xs text-ink-500">Day {current.s.day} · {current.s.date} · {current.s.time} · {current.s.speaker} · {current.s.room}</p>
              </div>
              <Badge value={current.s.status} />
            </div>

            {!fb ? (
              <div className="grid place-items-center gap-1 rounded-2xl bg-ink-100/50 py-10 text-center">
                <Icon name="clock" size={20} className="text-ink-400" />
                <strong className="text-[13px] font-medium text-ink-950">No feedback yet</strong>
                <span className="max-w-xs text-xs text-ink-500">The feedback form opens after the session. Results show here as participants answer in the mobile app.</span>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  <div>
                    <div className="flex items-end gap-2"><strong className="text-[34px] font-medium leading-none tracking-[-1px] text-ink-950">{f1(averageOf(fb))}</strong><span className="pb-1 text-xs text-ink-400">/ 5</span></div>
                    <div className="mt-1.5"><Stars value={averageOf(fb)} size={15} /></div>
                  </div>
                  <div className="space-y-1.5 text-xs text-ink-600">
                    <p><strong className="font-medium text-ink-950">{n}</strong> of {fb.eligible} answered ({pct(rateOf(fb))})</p>
                    <p><strong className="font-medium text-ink-950">{fb.recommend}%</strong> would recommend</p>
                    <Delta value={delta(averageOf(fb), activityAvg)} />
                  </div>
                </div>

                {small ? (
                  <p className="mt-4 flex items-start gap-2 rounded-2xl bg-amber-100/70 px-4 py-3 text-[13px] text-amber-900">
                    <Icon name="alert" size={15} className="mt-0.5 flex-shrink-0" />Only {n} answered. Breakdowns and comments stay hidden until at least {MIN_RESPONSES} do, so no one can be identified.
                  </p>
                ) : (
                  <>
                    <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div>
                        <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-500">Ratings</h3>
                        <ul className="space-y-3">
                          {dist.map((c, i) => <MeterRow key={i} label={`${5 - i} ${5 - i === 1 ? 'star' : 'stars'}`} value={(c / maxD) * 100} display={c} tone="amber" labelWidth={54} />)}
                        </ul>
                      </div>
                      <div>
                        <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-500">By criteria</h3>
                        <ul className="space-y-3">
                          {Object.entries(fb.criteria).map(([k, v]) => <MeterRow key={k} label={CRITERIA_LABELS[k]} value={(v / 5) * 100} display={f1(v)} tone={tone(v)} labelWidth={132} />)}
                        </ul>
                      </div>
                    </div>

                    {st && (
                      <div className="mt-5 rounded-2xl bg-brand-50/70 p-4 text-[13px] leading-relaxed text-ink-800">
                        <strong className="mb-1 flex items-center gap-1.5 font-medium text-brand-900"><Icon name="sparkle" size={14} />What stands out</strong>
                        <ul className="list-disc space-y-1 pl-5">
                          <li>Strongest: <strong className="font-medium">{CRITERIA_LABELS[st.best[0]]}</strong> ({f1(st.best[1])}).</li>
                          <li>To work on: <strong className="font-medium">{CRITERIA_LABELS[st.worst[0]]}</strong> ({f1(st.worst[1])}).</li>
                          {rateOf(fb) < 0.5 && <li>Only {pct(rateOf(fb))} answered. Ask participants to complete the form before they leave, so the result is more reliable.</li>}
                          {(() => { const d = delta(averageOf(fb), activityAvg); return d != null && d <= -0.2 ? <li>This session rates below the activity average. Compare with the highest-rated session for ideas.</li> : null; })()}
                        </ul>
                      </div>
                    )}

                    <h3 className="mb-2 mt-5 text-xs font-medium uppercase tracking-wide text-ink-500">What participants said</h3>
                    {comments.length ? (
                      <ul className="divide-y divide-[var(--glass-divider)]">
                        {comments.map((c) => (
                          <li key={c.id} className="py-3 first:pt-0 last:pb-0">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                              <strong className="text-[13px] font-medium text-ink-950">{limited || c.name === 'Anonymous' ? 'Participant' : c.name}</strong>
                              <Stars value={c.rating} size={12} />
                              <span className="text-xs text-ink-400">{c.date}</span>
                            </div>
                            <p className="mt-1 text-[13px] leading-relaxed text-ink-700">{c.comment}</p>
                          </li>
                        ))}
                      </ul>
                    ) : <p className="text-[13px] text-ink-500">No written comments for this session.</p>}
                  </>
                )}
              </>
            )}
          </Panel>
        )}
      </div>
    </div>
  );
}

export { criteriaOf, distributionOf };
