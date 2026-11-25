import { Fragment, useMemo, useState } from 'react';
import { Button, Icon, MeterRow, Modal, Panel, SearchInput, Select } from '../ui';
import { useStore } from '../../hooks/useStore';
import { useAuth } from '../../context/AuthContext';
import { useAccess } from './editContext';
import { sessionOrder } from '../../lib/sessions';
import { buildResponses } from '../../lib/feedbackResponses';
import { MIN_RESPONSES } from '../../lib/feedbackStats';
import { SESSION_FEEDBACK } from '../../data/workspaceData';
import { AGREE, EMOJI, EMOJI_WORDS, isFivePoint, npsOf } from '../../lib/feedbackTypes';
import { downloadCsv } from '../../lib/download';

/**
 * Responses and ratings — every answer, like the response sheet of a form, but anonymous: a response is only a
 * number. Two ways to read it:
 *   Table        one summary row per session (averages per question); open it to see that session's individual
 *                responses underneath. Scores are tinted from red to green, like conditional formatting.
 *   By question  one card per question; written answers are listed in full, which is easier to read.
 * A Resource person only sees the sessions they lead. The overall numbers and charts live in Summary.
 */

const SHORT = {
  'Overall, how would you rate this session?': 'Overall',
  'The content was relevant to my work.': 'Relevant content',
  'The resource persons explained clearly and answered questions.': 'Resource person',
  'The venue, meals and logistics were well organized.': 'Venue & logistics',
  'How do you feel after this session?': 'Feeling',
  'How was the pace and delivery?': 'Pace & delivery',
  'How likely are you to recommend this activity to others?': 'Recommend (0–10)',
  'What was the most useful part?': 'Most useful',
  'What should we improve next time?': 'Improve next time',
};
const shortOf = (q) => SHORT[q.text] ?? (q.text.length > 26 ? `${q.text.slice(0, 24).trim()}…` : q.text || 'Untitled');

const FIVE_TONE = {
  5: 'bg-emerald-100 text-emerald-800',
  4: 'bg-emerald-50 text-emerald-700',
  3: 'bg-amber-100/70 text-amber-800',
  2: 'bg-orange-100 text-orange-800',
  1: 'bg-rose-100 text-rose-800',
};
const TEN_TONE = (v) => (v >= 9 ? FIVE_TONE[5] : v >= 7 ? FIVE_TONE[3] : FIVE_TONE[1]);
const CHOICE_TONE = { Yes: 'bg-emerald-50 text-emerald-700', Maybe: 'bg-amber-100/70 text-amber-800', No: 'bg-rose-50 text-rose-700' };
const chip = 'inline-flex h-7 min-w-7 items-center justify-center gap-1 rounded-lg px-1.5 text-[13px] font-medium tabular-nums';

const blank = (v) => v === undefined || v === null || v === '';
const f1 = (n) => (n == null ? '—' : n.toFixed(1));
const plain = (q, v) => {
  if (blank(v)) return '';
  if (q.type === 'Thumbs') return `${v.up ? 'Up' : 'Down'}${v.tags?.length ? ` (${v.tags.join(', ')})` : ''}`;
  if (q.type === 'Agree scale') return AGREE[v - 1] ?? v;
  return v;
};

/** One answer of one response. */
function Answer({ q, value, full = false }) {
  if (blank(value)) return <span className="text-ink-300">—</span>;
  switch (q.type) {
    case 'Rating': return <span className={`${chip} ${FIVE_TONE[value]}`}>{value}</span>;
    case 'Stars': return <span className={`${chip} ${FIVE_TONE[value]}`}>{value}<Icon name="star" size={11} className="fill-current" /></span>;
    case 'Emoji': return <span className={`${chip} ${FIVE_TONE[value]} text-base`} title={EMOJI_WORDS[value - 1]}>{EMOJI[value - 1]}{full && <span className="text-xs font-normal">{EMOJI_WORDS[value - 1]}</span>}</span>;
    case 'Agree scale': return <span className={`${chip} ${FIVE_TONE[value]}`} title={AGREE[value - 1]}>{full ? AGREE[value - 1] : value}</span>;
    case '0–10 scale': return <span className={`${chip} ${TEN_TONE(value)}`}>{value}</span>;
    case 'Thumbs': return (
      <span className="inline-flex items-center gap-1.5" title={value.tags?.join(', ')}>
        <span className="text-base">{value.up ? '👍' : '👎'}</span>
        {value.tags?.length > 0 && <span className={full ? 'flex flex-wrap gap-1' : 'max-w-[140px] truncate text-xs text-ink-600'}>{full ? value.tags.map((t) => <span key={t} className="rounded-md bg-ink-100 px-1.5 py-0.5 text-[11px] text-ink-700">{t}</span>) : value.tags.join(', ')}</span>}
      </span>
    );
    case 'Choice': return <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium ${CHOICE_TONE[value] ?? 'bg-ink-100 text-ink-700'}`}>{value}</span>;
    default: return <span className={full ? 'text-ink-800' : 'block min-w-[160px] max-w-[260px] truncate text-ink-700'} title={full ? undefined : value}>{value}</span>;
  }
}

/** The summary of one question over several responses (a session row, or the footer). */
function Aggregate({ q, list }) {
  const vals = list.map((r) => r.answers[q.id]).filter((v) => !blank(v));
  if (!vals.length) return <span className="text-ink-300">—</span>;
  if (isFivePoint(q.type)) {
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return <span className={`${chip} ${FIVE_TONE[Math.round(avg)]}`}>{f1(avg)}</span>;
  }
  if (q.type === '0–10 scale') { const nps = npsOf(vals); return <span className={`${chip} ${nps >= 50 ? FIVE_TONE[5] : nps >= 0 ? FIVE_TONE[3] : FIVE_TONE[1]}`} title="Net Promoter Score: % who gave 9–10 minus % who gave 0–6">NPS {nps}</span>; }
  if (q.type === 'Thumbs') return <span className="text-xs font-medium text-ink-800">👍 {Math.round((vals.filter((v) => v.up).length / vals.length) * 100)}%</span>;
  if (q.type === 'Choice') {
    const first = q.options?.[0] ?? vals[0];
    const pct = Math.round((vals.filter((v) => v === first).length / vals.length) * 100);
    return <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium ${CHOICE_TONE[first] ?? 'bg-ink-100 text-ink-700'}`}>{pct}% {first}</span>;
  }
  return <span className="text-xs text-ink-500">{vals.length} {vals.length === 1 ? 'answer' : 'answers'}</span>;
}

const SessionTag = ({ s }) => (
  <span className="inline-flex min-w-0 items-center gap-2">
    <span className="grid h-7 flex-shrink-0 place-items-center rounded-md bg-brand-100 px-1.5 text-[10px] font-medium leading-none text-brand-700">D{s.day} {s.period}</span>
    <span className="max-w-[220px] truncate font-medium text-ink-950">{s.title}</span>
  </span>
);

export default function FeedbackResponses({ notify }) {
  const { sessions, staffDays, feedbackForms } = useStore();
  const { user } = useAuth();
  const access = useAccess();

  const ordered = useMemo(() => [...sessions].sort(sessionOrder), [sessions]);
  const all = useMemo(() => buildResponses(sessions), [sessions]);
  const byId = (id) => sessions.find((s) => s.id === id);

  const myName = staffDays.flatMap((d) => d.staff).find((x) => x.email && x.email === user?.email)?.name ?? null;
  const mineIds = new Set(ordered.filter((s) => myName && s.speaker === myName).map((s) => s.id));
  const limited = access.label === 'Resource person';
  const allowed = limited ? ordered.filter((s) => mineIds.has(s.id)) : ordered;

  const [day, setDay] = useState('all');
  const [scope, setScope] = useState('all');          // 'all', 'mine' or a session id
  const [rating, setRating] = useState('any');
  const [query, setQuery] = useState('');
  const [view, setView] = useState('table');
  const [open, setOpen] = useState(null);             // response shown in the window
  const [expanded, setExpanded] = useState(() => new Set());

  const formOf = (d) => feedbackForms.find((f) => f.day === d)?.questions ?? [];
  const overallOf = (r) => { const q = formOf(r.day).find((x) => isFivePoint(x.type)); return q ? r.answers[q.id] : undefined; };
  const perSession = (id) => all.filter((r) => r.sessionId === id).length;

  const daySessions = allowed.filter((s) => day === 'all' || s.day === Number(day));
  const inScope = all.filter((r) => daySessions.some((s) => s.id === r.sessionId)
    && (scope === 'all' || (scope === 'mine' ? mineIds.has(r.sessionId) : r.sessionId === Number(scope))));
  const q = query.trim().toLowerCase();
  const rows = inScope.filter((r) => {
    const o = overallOf(r);
    if (rating !== 'any' && (rating === '3' ? !(o <= 3) : o !== Number(rating))) return false;
    if (q && !Object.values(r.answers).some((v) => typeof v === 'string' && v.toLowerCase().includes(q))) return false;
    return true;
  });
  const groups = ordered.map((s) => ({ s, list: rows.filter((r) => r.sessionId === s.id) })).filter((g) => g.list.length);
  const filtered = rating !== 'any' || !!q;

  // Columns: the questions of the forms used by the rows shown, in form order
  const days = [...new Set(rows.map((r) => r.day))].sort((a, b) => a - b);
  const questions = [];
  days.forEach((d) => formOf(d).forEach((x) => { if (!questions.some((y) => y.id === x.id)) questions.push(x); }));
  const hiddenDate = (r) => perSession(r.sessionId) < MIN_RESPONSES;

  const toggle = (id) => setExpanded((cur) => { const n = new Set(cur); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const allOpen = groups.length > 0 && groups.every((g) => expanded.has(g.s.id));
  const pickScope = (v) => { setScope(v); setOpen(null); if (v !== 'all' && v !== 'mine') setExpanded(new Set([Number(v)])); };
  const pickDay = (v) => { setDay(v); setOpen(null); if (scope !== 'all' && scope !== 'mine' && v !== 'all' && byId(Number(scope))?.day !== Number(v)) setScope('all'); };

  const exportCsv = () => {
    downloadCsv('feedback-responses.csv', [
      ['Response', 'Session', 'Day', 'Period', 'Submitted', ...questions.map((x) => x.text)],
      ...rows.map((r) => { const s = byId(r.sessionId); return [r.id, s?.title, s?.day, s?.period, hiddenDate(r) ? '' : r.submitted, ...questions.map((x) => plain(x, r.answers[x.id]))]; }),
    ]);
    notify?.('Responses exported as CSV');
  };

  if (limited && !allowed.length) {
    return (
      <Panel className="grid place-items-center gap-1 py-14 text-center">
        <Icon name="lock" size={22} className="text-ink-400" />
        <strong className="text-sm font-medium text-ink-950">No sessions of yours yet</strong>
        <span className="max-w-sm text-xs text-ink-500">As a Resource person you see the responses for the sessions you teach.</span>
      </Panel>
    );
  }

  const th = 'whitespace-nowrap border-b border-[var(--glass-divider)] bg-white/95 px-3 py-2.5 text-left text-[11px] font-medium text-ink-500 backdrop-blur';
  const td = 'border-b border-[var(--glass-divider)] px-3 py-2.5 align-middle';
  const openIndex = open ? rows.findIndex((r) => r.id === open) : -1;

  return (
    <div className="space-y-4">
      <Panel pad={false} className="overflow-hidden">
        {/* toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 p-4">
          <Select aria-label="Day" value={day} onChange={(e) => pickDay(e.target.value)}>
            <option value="all">All days</option>
            {staffDays.map((d) => <option key={d.n} value={String(d.n)}>Day {d.n} · {d.label.split(',')[0]}</option>)}
          </Select>
          <Select aria-label="Session" className="max-w-full sm:w-72" value={scope} onChange={(e) => pickScope(e.target.value)}>
            <option value="all">{limited ? 'All your sessions' : 'All sessions'}</option>
            {!limited && mineIds.size > 0 && <option value="mine">My sessions</option>}
            {daySessions.map((s) => <option key={s.id} value={String(s.id)}>D{s.day} {s.period} · {s.title}{perSession(s.id) ? '' : ' (no responses yet)'}</option>)}
          </Select>
          <Select aria-label="Overall rating" value={rating} onChange={(e) => setRating(e.target.value)}>
            <option value="any">Any rating</option><option value="5">Rated 5</option><option value="4">Rated 4</option><option value="3">Rated 3 or below</option>
          </Select>
          <SearchInput value={query} onChange={setQuery} placeholder="Search written answers…" className="w-full sm:w-56" />
          <div className="ml-auto flex items-center gap-2">
            <div role="tablist" aria-label="View" className="glass-inset inline-flex rounded-full p-0.5">
              {[['table', 'Table'], ['question', 'By question']].map(([id, label]) => (
                <button key={id} role="tab" aria-selected={view === id} onClick={() => setView(id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs transition-colors ${view === id ? 'bg-white font-medium text-ink-950 shadow-sm' : 'text-ink-500 hover:text-ink-950'}`}>{label}</button>
              ))}
            </div>
            <Button variant="secondary" size="sm" icon="download" disabled={!rows.length} onClick={exportCsv}>Export CSV</Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--glass-divider)] px-4 py-2 text-xs text-ink-500">
          <span className="flex items-center gap-1.5">
            <Icon name="shield" size={13} className="text-ink-400" />
            {rows.length} {rows.length === 1 ? 'response' : 'responses'}{rows.length !== inScope.length ? ` of ${inScope.length}` : ''} in {groups.length} {groups.length === 1 ? 'session' : 'sessions'} · Anonymous: names are never shown{limited ? ' · Only your sessions' : ''}
          </span>
          {view === 'table' && groups.length > 0 && (
            <button type="button" onClick={() => setExpanded(allOpen ? new Set() : new Set(groups.map((g) => g.s.id)))} className="rounded-full px-2 py-1 font-medium text-brand-700 hover:bg-brand-50">
              {allOpen ? 'Collapse all' : 'Show every response'}
            </button>
          )}
        </div>

        {view === 'table' && (rows.length ? (
          <div className="max-h-[640px] overflow-auto border-t border-[var(--glass-divider)]">
            <table className="w-full border-separate border-spacing-0 text-[13px]">
              <thead className="sticky top-0 z-20">
                <tr>
                  <th className={`${th} sticky left-0 z-10 w-12`}><span className="sr-only">Open</span></th>
                  <th className={th}>Session</th>
                  <th className={th}>Responses</th>
                  {questions.map((x) => <th key={x.id} className={th} title={x.text}>{shortOf(x)}</th>)}
                </tr>
              </thead>
              <tbody>
                {groups.map(({ s, list }) => {
                  const isOpen = expanded.has(s.id);
                  const eligible = SESSION_FEEDBACK[s.id]?.eligible;
                  return (
                    <Fragment key={s.id}>
                      {/* the session's summary row */}
                      <tr onClick={() => toggle(s.id)} className="group cursor-pointer">
                        <td className={`${td} sticky left-0 z-10 bg-white/95 group-hover:bg-brand-50`}>
                          <button type="button" aria-expanded={isOpen} aria-label={`${isOpen ? 'Hide' : 'Show'} the responses for ${s.title}`}
                            onClick={(e) => { e.stopPropagation(); toggle(s.id); }}
                            className="grid h-7 w-7 place-items-center rounded-full text-ink-600 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
                            <Icon name="chevron" size={14} className={`transition-transform ${isOpen ? '' : '-rotate-90'}`} />
                          </button>
                        </td>
                        <td className={`${td} bg-white/60 group-hover:bg-brand-50/70`}><SessionTag s={s} /></td>
                        <td className={`${td} whitespace-nowrap bg-white/60 text-xs text-ink-600 group-hover:bg-brand-50/70`}>
                          <strong className="font-medium text-ink-950">{list.length}</strong>{filtered ? ' shown' : eligible ? ` of ${eligible}` : ''}
                        </td>
                        {questions.map((x) => <td key={x.id} className={`${td} bg-white/60 group-hover:bg-brand-50/70`}><Aggregate q={x} list={list} /></td>)}
                      </tr>
                      {/* its individual responses */}
                      {isOpen && list.map((r) => (
                        <tr key={r.id} onClick={() => setOpen(r.id)} className="group/r cursor-pointer">
                          <td className={`${td} sticky left-0 z-10 bg-ink-50/95 text-right group-hover/r:bg-brand-50`}>
                            <button type="button" className="rounded px-1 text-xs tabular-nums text-ink-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400" aria-label={`Open response ${r.id}`}
                              onClick={(e) => { e.stopPropagation(); setOpen(r.id); }}>#{r.id}</button>
                          </td>
                          <td className={`${td} whitespace-nowrap bg-ink-50/60 pl-12 text-xs text-ink-500 group-hover/r:bg-brand-50/60`}>{hiddenDate(r) ? <span title={`Hidden while a session has fewer than ${MIN_RESPONSES} responses`}>Submitted · date hidden</span> : `Submitted ${r.submitted}`}</td>
                          <td className={`${td} bg-ink-50/60 group-hover/r:bg-brand-50/60`} />
                          {questions.map((x) => <td key={x.id} className={`${td} bg-ink-50/60 group-hover/r:bg-brand-50/60`}><Answer q={x} value={r.answers[x.id]} /></td>)}
                        </tr>
                      ))}
                    </Fragment>
                  );
                })}
              </tbody>
              {groups.length > 1 && (
                <tfoot className="sticky bottom-0 z-20">
                  <tr>
                    <td className={`${td} sticky left-0 z-10 border-b-0 border-t bg-white/95`} />
                    <td className={`${td} border-b-0 border-t bg-white/95 text-xs font-medium text-ink-800`}>All sessions shown</td>
                    <td className={`${td} border-b-0 border-t bg-white/95 text-xs text-ink-600`}><strong className="font-medium text-ink-950">{rows.length}</strong></td>
                    {questions.map((x) => <td key={x.id} className={`${td} border-b-0 border-t bg-white/95`}><Aggregate q={x} list={rows} /></td>)}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        ) : <p className="border-t border-[var(--glass-divider)] py-10 text-center text-[13px] text-ink-500">{inScope.length ? 'No responses match these filters.' : 'No responses yet. They appear as participants answer in the mobile app.'}</p>)}
      </Panel>

      {view === 'question' && rows.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {questions.map((x, i) => <QuestionCard key={x.id} n={i + 1} q={x} rows={rows} single={groups.length === 1} byId={byId} />)}
        </div>
      )}

      {open && openIndex >= 0 && (
        <ResponseModal
          r={rows[openIndex]} s={byId(rows[openIndex].sessionId)} questions={formOf(rows[openIndex].day)} hideDate={hiddenDate(rows[openIndex])}
          position={`${openIndex + 1} of ${rows.length}`}
          onPrev={openIndex > 0 ? () => setOpen(rows[openIndex - 1].id) : null}
          onNext={openIndex < rows.length - 1 ? () => setOpen(rows[openIndex + 1].id) : null}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}

function QuestionCard({ n, q, rows, single, byId }) {
  const answered = rows.filter((r) => !blank(r.answers[q.id]));
  const vals = answered.map((r) => r.answers[q.id]);
  const head = (
    <div className="mb-4 flex items-start gap-3">
      <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-brand-100 text-[11px] font-medium text-brand-700">{n}</span>
      <div className="min-w-0">
        <h3 className="text-[13px] font-medium leading-snug text-ink-950">{q.text}</h3>
        <p className="mt-0.5 text-xs text-ink-500">{answered.length} of {rows.length} answered</p>
      </div>
    </div>
  );
  const bars = (items, total, width) => (
    <ul className="flex-1 space-y-2.5">
      {items.map(([label, c, tone]) => <MeterRow key={label} label={label} value={total ? (c / total) * 100 : 0} display={`${c}`} tone={tone} labelWidth={width} />)}
    </ul>
  );

  if (isFivePoint(q.type)) {
    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    const label = (v) => (q.type === 'Emoji' ? EMOJI[v - 1] : q.type === 'Agree scale' ? AGREE[v - 1] : `${v}`);
    const counts = [5, 4, 3, 2, 1].map((v) => [label(v), vals.filter((x) => x === v).length, v >= 4 ? 'ok' : 'amber']);
    return (
      <Panel>
        {head}
        <div className="flex items-center gap-6">
          <div className="text-center"><strong className="block text-[30px] font-medium leading-none tracking-[-1px] text-ink-950">{f1(avg)}</strong><span className="text-[11px] text-ink-400">out of 5</span></div>
          {bars(counts, Math.max(1, ...counts.map((c) => c[1])), q.type === 'Agree scale' ? 110 : 22)}
        </div>
      </Panel>
    );
  }

  if (q.type === '0–10 scale') {
    const nps = npsOf(vals);
    const groups = [['Promoters (9–10)', vals.filter((v) => v >= 9).length, 'ok'], ['Passives (7–8)', vals.filter((v) => v >= 7 && v <= 8).length, 'brand'], ['Detractors (0–6)', vals.filter((v) => v <= 6).length, 'amber']];
    return (
      <Panel>
        {head}
        <div className="flex items-center gap-6">
          <div className="text-center"><strong className="block text-[30px] font-medium leading-none tracking-[-1px] text-ink-950">{nps ?? '—'}</strong><span className="text-[11px] text-ink-400">NPS</span></div>
          {bars(groups, Math.max(1, vals.length), 110)}
        </div>
      </Panel>
    );
  }

  if (q.type === 'Thumbs') {
    const up = vals.filter((v) => v.up).length;
    const tags = (q.options ?? []).map((t) => [t, vals.filter((v) => v.tags?.includes(t)).length, 'brand']).sort((a, b) => b[1] - a[1]);
    return (
      <Panel>
        {head}
        <div className="flex items-start gap-6">
          <div className="space-y-1 text-center"><strong className="block text-[22px] font-medium leading-none text-ink-950">👍 {up}</strong><strong className="block text-[22px] font-medium leading-none text-ink-950">👎 {vals.length - up}</strong></div>
          {bars(tags, Math.max(1, vals.length), 80)}
        </div>
      </Panel>
    );
  }

  if (q.type === 'Choice') {
    const opts = q.options?.length ? q.options : [...new Set(vals)];
    const total = Math.max(1, vals.length);
    return (
      <Panel>
        {head}
        <ul className="space-y-2.5">
          {opts.map((o) => { const c = vals.filter((v) => v === o).length; return <MeterRow key={o} label={o} value={(c / total) * 100} display={`${c} · ${Math.round((c / total) * 100)}%`} tone={o === 'Yes' ? 'ok' : o === 'No' ? 'amber' : 'brand'} labelWidth={60} />; })}
        </ul>
      </Panel>
    );
  }

  return (
    <Panel className="lg:col-span-2">
      {head}
      {answered.length ? (
        <ul className="max-h-[340px] divide-y divide-[var(--glass-divider)] overflow-auto pr-1">
          {answered.map((r) => (
            <li key={r.id} className="flex flex-wrap items-start gap-x-3 gap-y-1 py-2.5 first:pt-0">
              <span className="w-10 flex-shrink-0 pt-0.5 text-xs tabular-nums text-ink-400">#{r.id}</span>
              <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-ink-800">{r.answers[q.id]}</p>
              {!single && byId(r.sessionId) && <span className="text-[11px] text-ink-500">D{byId(r.sessionId).day} {byId(r.sessionId).period} · {byId(r.sessionId).title}</span>}
            </li>
          ))}
        </ul>
      ) : <p className="text-[13px] text-ink-500">No written answers.</p>}
    </Panel>
  );
}

function ResponseModal({ r, s, questions, hideDate, position, onPrev, onNext, onClose }) {
  return (
    <Modal
      title={`Response #${r.id}`}
      subtitle={[s ? `Day ${s.day} ${s.period} · ${s.title}` : null, hideDate ? null : r.submitted].filter(Boolean).join(' · ')}
      onClose={onClose} width={560}
      footer={
        <>
          <span className="text-xs text-ink-500">{position}</span>
          <div className="flex gap-2">
            <Button variant="secondary" icon="back" disabled={!onPrev} onClick={onPrev ?? undefined}>Previous</Button>
            <Button variant="secondary" disabled={!onNext} onClick={onNext ?? undefined}>Next</Button>
          </div>
        </>
      }
    >
      <ol className="space-y-3 pb-2">
        {questions.map((q, i) => (
          <li key={q.id} className="glass-inset rounded-2xl px-4 py-3">
            <p className="text-xs text-ink-500">{i + 1}. {q.text}</p>
            <div className="mt-1.5 text-[13px] leading-relaxed"><Answer q={q} value={r.answers[q.id]} full /></div>
          </li>
        ))}
      </ol>
    </Modal>
  );
}
