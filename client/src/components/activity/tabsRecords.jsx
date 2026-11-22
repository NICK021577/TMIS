import { useConfirm } from '../modals/confirmContext';
import { useRef, useState } from 'react';
import { ActionIcon, Avatar, Badge, Button, DataTable, Icon, MeterRow, Metric, Panel, PanelTitle, ProgressBar, Select, Switch } from '../ui';
import { useEditing } from './editContext';
import FeedbackSummary from './FeedbackSummary';
import { useStore } from '../../hooks/useStore';
import CertificateCanvas, { CERT_COLORS, CERT_STYLES, DEFAULT_TEMPLATE, certificateDocument } from '../modals/CertificateCanvas';
import CertificatePreviewModal from '../modals/CertificatePreviewModal';
import DocumentPreviewModal, { downloadDoc } from '../modals/DocumentPreviewModal';
import UploadDocumentModal from '../modals/UploadDocumentModal';
import SignaturePadModal from '../modals/SignaturePadModal';
import { certificateHtml, downloadCsv, downloadFile } from '../../lib/download';
import {
  CERT_ROWS, FEEDBACK, FEEDBACK_COMMENTS, FEEDBACK_FORM, FEEDBACK_SUMMARY, OUTPUT_SUBMISSIONS, REENTRY,
} from '../../data/workspaceData';

/* ── shared bits ──────────────────────────────────────────────────── */

/** Pill switcher, used where a tab has two sections. */
function Pills({ options, value, onChange }) {
  return (
    <div role="tablist" className="glass-inset inline-flex rounded-full p-0.5">
      {options.map((o) => {
        const id = typeof o === 'string' ? o : o.id;
        const label = typeof o === 'string' ? o : o.label;
        const on = value === id;
        return (
          <button key={id} role="tab" aria-selected={on} onClick={() => onChange(id)}
            className={`rounded-full px-4 py-1.5 text-xs transition-colors ${on ? 'bg-white font-medium text-ink-950 shadow-sm' : 'text-ink-500 hover:text-ink-950'}`}>
            {label}
          </button>
        );
      })}
    </div>
  );
}

function Stars({ value, size = 14 }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon key={n} name="star" size={size} className={n <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-ink-300'} />
      ))}
    </span>
  );
}

const personCell = (name) => (
  <div className="flex items-center gap-3"><Avatar name={name} size="sm" /><strong className="font-medium text-ink-950">{name}</strong></div>
);

/* ── Documents ────────────────────────────────────────────────────── */
export function DocumentsTab({ notify }) {
  const editing = useEditing();
  const confirm = useConfirm();
  const { documents, setDocuments } = useStore();
  const [viewing, setViewing] = useState(null);
  const [uploading, setUploading] = useState(false);

  const remove = async (d) => {
    if (await confirm({ tone: 'danger', title: 'Delete this document?', message: `“${d.file}” will be removed from this activity.`, confirmLabel: 'Delete document' })) {
      setDocuments((l) => l.filter((x) => x.id !== d.id));
      notify?.('Document deleted');
    }
  };

  const columns = [
    { key: 'file', label: 'File', render: (d) => <span className="flex items-center gap-2.5"><Icon name="file" size={15} className="text-brand-600" /><strong className="font-medium text-ink-950">{d.file}</strong></span> },
    { key: 'type', label: 'Type', render: (d) => <Badge value={d.type} tone="muted" variant="pill" /> },
    { key: 'uploaded', label: 'Uploaded' },
    { key: 'size', label: 'Size' },
    {
      key: 'actions', label: 'Actions', className: 'text-right',
      render: (d) => (
        <div className="flex justify-start gap-0.5">
          <ActionIcon icon="eye" label="View document" onClick={() => setViewing(d)} />
          <ActionIcon icon="download" label="Download" tone="brand" onClick={() => { downloadDoc(d); notify?.(`Downloading ${d.file}`); }} />
          <ActionIcon icon="trash" label="Delete document" tone="danger" disabled={!editing} onClick={() => remove(d)} />
        </div>
      ),
    },
  ];
  return (
    <Panel pad={false} className="overflow-hidden">
      <div className="p-5 pb-3">
        <PanelTitle title="Documents" subtitle="Scanned copies of paper documents related to the activity">
          <Button size="sm" icon="upload" disabled={!editing} onClick={() => setUploading(true)}>Upload scan</Button>
        </PanelTitle>
      </div>
      <DataTable columns={columns} rows={documents} empty="No documents uploaded yet." />
      <p className="border-t border-[var(--glass-divider)] px-5 py-3 text-xs text-ink-500">Receipts attached in the Budget tab also appear here with type Receipt.</p>
      {viewing && <DocumentPreviewModal doc={viewing} onClose={() => setViewing(null)} notify={notify} />}
      {uploading && <UploadDocumentModal onSave={(d) => { setDocuments((l) => [d, ...l]); notify?.(`${d.file} uploaded`); }} onClose={() => setUploading(false)} />}
    </Panel>
  );
}

/* ── Outputs ──────────────────────────────────────────────────────── */
const TYPE_ICON = { Photo: 'image', File: 'file', Video: 'camera' };

export function OutputsTab({ notify }) {
  const editing = useEditing();
  const [viewing, setViewing] = useState(null);
  const [filter, setFilter] = useState('All');


  const subs = OUTPUT_SUBMISSIONS.filter((s) => filter === 'All' || s.type === filter);
  const counts = (t) => OUTPUT_SUBMISSIONS.filter((s) => s.type === t).length;

  const columns = [
    {
      key: 'title', label: 'Output',
      render: (s) => (
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-100 to-[#ddd6fa] text-brand-600"><Icon name={TYPE_ICON[s.type]} size={17} /></span>
          <div className="min-w-0">
            <strong className="block truncate text-[13px] font-medium text-ink-950">{s.title}</strong>
            <span className="block truncate text-xs text-ink-500">{s.file}</span>
          </div>
        </div>
      ),
    },
    { key: 'type', label: 'Type', render: (s) => <Badge value={s.type} tone="muted" variant="pill" /> },
    { key: 'participant', label: 'Participant', render: (s) => personCell(s.participant) },
    { key: 'session', label: 'Session', render: (s) => <span className="text-ink-600">{s.session}</span> },
    { key: 'submitted', label: 'Submitted', render: (s) => <span className="whitespace-nowrap text-ink-600">{s.submitted}</span> },
    { key: 'size', label: 'Size' },
    {
      key: 'actions', label: 'Actions', className: 'text-right',
      render: (s) => (
        <div className="flex justify-start gap-0.5">
          <ActionIcon icon="eye" label={`View ${s.type.toLowerCase()}`} onClick={() => setViewing({ file: s.file, type: `${s.type} output`, size: s.size, uploaded: s.submitted })} />
          <ActionIcon icon="download" label="Download" tone="brand" onClick={() => { downloadDoc({ file: s.file, type: `${s.type} output`, size: s.size, uploaded: s.submitted }); notify?.(`Downloading ${s.file}`); }} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {viewing && <DocumentPreviewModal doc={viewing} onClose={() => setViewing(null)} notify={notify} />}
      {/* Part 2: what participants submitted */}
      <Panel pad={false} className="overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 p-5 pb-3">
          <div>
            <h2 className="text-sm font-medium text-ink-950">Participant outputs</h2>
            <p className="mt-0.5 text-xs text-ink-500">Photos, files and videos participants attach from the mobile app</p>
          </div>
          <Pills value={filter} onChange={setFilter}
            options={[{ id: 'All', label: `All (${OUTPUT_SUBMISSIONS.length})` }, { id: 'Photo', label: `Photos (${counts('Photo')})` }, { id: 'File', label: `Files (${counts('File')})` }, { id: 'Video', label: `Videos (${counts('Video')})` }]} />
        </div>
        <DataTable columns={columns} rows={subs} empty="No outputs of this type yet." />
      </Panel>
    </div>
  );
}

/* ── Feedback ─────────────────────────────────────────────────────── */
function QuestionPreview({ q }) {
  if (q.type === 'Rating') return <div className="mt-2 flex gap-1.5">{[1, 2, 3, 4, 5].map((n) => <span key={n} className="grid h-8 w-8 place-items-center rounded-full border border-ink-200 bg-white text-xs text-ink-500">{n}</span>)}<span className="ml-2 self-center text-[11px] text-ink-400">1 = Poor, 5 = Excellent</span></div>;
  if (q.type === 'Choice') return <div className="mt-2 flex flex-wrap gap-2">{(q.options ?? []).map((o) => <span key={o} className="rounded-full border border-ink-200 bg-white px-3.5 py-1.5 text-xs text-ink-700">{o}</span>)}</div>;
  return <div className="mt-2 h-14 rounded-xl border border-dashed border-ink-300 bg-white/60 px-3 py-2 text-xs text-ink-400">Participant types their answer here</div>;
}

/** FeedbackForm — participants answer after each day, so there is one form per day of the activity. */
function FeedbackForm({ notify }) {
  const editing = useEditing();
  const confirm = useConfirm();
  const { staffDays, feedbackForms: forms, setFeedbackForms: setForms } = useStore();

  const ordered = [...forms].sort((a, b) => a.day - b.day);
  const usedDays = new Set(forms.map((f) => f.day));
  const freeDay = staffDays.find((d) => !usedDays.has(d.n));
  const dayLabel = (d) => `Day ${d.n} · ${d.label.split(',')[0]}`;

  const addForm = () => {
    if (!freeDay) return;
    // a new day starts from the questions of the first form, so nothing is retyped
    const base = ordered[0]?.questions ?? FEEDBACK_FORM;
    setForms((l) => [...l, { id: Date.now(), day: freeDay.n, questions: base.map((q) => ({ ...q, id: Date.now() + q.id })) }]);
    notify?.(`Feedback form added for Day ${freeDay.n}`);
  };
  const patchForm = (id, patch) => setForms((l) => l.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  const setQuestions = (id, fn) => setForms((l) => l.map((f) => (f.id === id ? { ...f, questions: fn(f.questions) } : f)));
  const removeForm = async (f) => {
    if (await confirm({ tone: 'danger', title: `Remove the Day ${f.day} form?`, message: 'Participants will no longer be asked for feedback for that day. Answers already collected are kept.', confirmLabel: 'Remove form' })) {
      setForms((l) => l.filter((x) => x.id !== f.id));
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-500">Feedback is collected after each day. Each form below is sent to participants at the end of its day.</p>

      {ordered.map((f) => {
        const options = staffDays.filter((d) => d.n === f.day || !usedDays.has(d.n));
        return (
          <Panel key={f.id} pad={false} className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-100 text-[13px] font-medium text-brand-700">{f.day}</span>
                <div>
                  <label htmlFor={`day-${f.id}`} className="sr-only">Day for this form</label>
                  <select id={`day-${f.id}`} value={f.day} disabled={!editing} onChange={(e) => patchForm(f.id, { day: Number(e.target.value) })}
                    className="glass-input h-9 rounded-full px-3.5 text-[13px] font-medium text-ink-950 disabled:cursor-not-allowed disabled:opacity-70">
                    {options.map((d) => <option key={d.n} value={d.n}>{dayLabel(d)}</option>)}
                  </select>
                  <p className="mt-1 pl-1 text-xs text-ink-500">{f.questions.length} question{f.questions.length === 1 ? '' : 's'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Button size="sm" icon="plus" disabled={!editing} onClick={() => setQuestions(f.id, (q) => [...q, { id: Date.now(), text: 'New question', type: 'Rating', required: false }])}>Add question</Button>
                <ActionIcon icon="trash" tone="danger" label="Remove this form" disabled={!editing} onClick={() => removeForm(f)} />
              </div>
            </div>
            <ol className="space-y-3 px-5 pb-5">
              {f.questions.map((q, i) => (
                <li key={q.id} className="glass-inset rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-brand-100 text-[11px] font-medium text-brand-700">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <input
                        value={q.text} disabled={!editing} aria-label={`Day ${f.day} question ${i + 1}`}
                        onChange={(e) => setQuestions(f.id, (l) => l.map((x) => (x.id === q.id ? { ...x, text: e.target.value } : x)))}
                        className="w-full rounded-lg bg-transparent text-[13px] font-medium text-ink-950 outline-none enabled:border enabled:border-ink-200 enabled:bg-white enabled:px-2.5 enabled:py-1.5 disabled:cursor-default"
                      />
                      <QuestionPreview q={q} />
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <Badge value={q.type} tone="muted" variant="pill" />
                      <label className="flex items-center gap-1.5 text-[11px] text-ink-500">
                        <Switch checked={q.required} onChange={(v) => editing && setQuestions(f.id, (l) => l.map((x) => (x.id === q.id ? { ...x, required: v } : x)))} label={`Question ${i + 1} required`} />
                        <span className="hidden sm:inline">Required</span>
                      </label>
                      <ActionIcon icon="trash" tone="danger" label="Remove question" disabled={!editing} onClick={async () => { if (await confirm({ tone: 'danger', title: 'Remove this question?', message: 'It will no longer appear on this day’s form. Answers already collected are kept.', confirmLabel: 'Remove question' })) setQuestions(f.id, (l) => l.filter((x) => x.id !== q.id)); }} />
                    </div>
                  </div>
                </li>
              ))}
              {!f.questions.length && <li className="py-4 text-center text-[13px] text-ink-500">No questions yet.</li>}
            </ol>
          </Panel>
        );
      })}

      {/* Outside the forms: add one for another day */}
      <button
        type="button" disabled={!editing || !freeDay} onClick={addForm}
        className="flex w-full items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-ink-300 bg-white/30 py-5 text-[13px] font-medium text-ink-600 transition-colors enabled:hover:border-brand-400 enabled:hover:bg-brand-50/50 enabled:hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-white shadow-sm"><Icon name="plus" size={15} /></span>
        {freeDay ? `Add a feedback form for ${dayLabel(freeDay)}` : `Every day already has a form (${staffDays.length} of ${staffDays.length})`}
      </button>
    </div>
  );
}

function FeedbackResponses({ notify }) {
  const [rating, setRating] = useState('All');
  const S = FEEDBACK_SUMMARY;
  const maxN = Math.max(...S.distribution.map((d) => d.n));
  const comments = FEEDBACK_COMMENTS.filter((c) => rating === 'All' || (rating === '3' ? c.rating <= 3 : c.rating === Number(rating)));

  const sessionCols = [
    { key: 'session', label: 'Session', render: (f) => <strong className="font-medium text-ink-950">{f.session}</strong> },
    { key: 'rating', label: 'Average rating', render: (f) => <span className="flex items-center gap-2"><Stars value={f.rating} size={13} /><span className="tabular-nums">{f.rating}</span></span> },
    { key: 'responses', label: 'Responses' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <div className="glass-panel rounded-[18px] p-4">
          <span className="text-xs text-ink-500">Overall rating</span>
          <div className="mt-1.5 flex items-end gap-2"><strong className="text-[24px] font-medium leading-none tracking-[-0.5px] text-ink-950">{S.overall}</strong><span className="pb-0.5 text-xs text-ink-400">/ 5</span></div>
          <div className="mt-2"><Stars value={S.overall} /></div>
        </div>
        <Metric label="Response rate" value={`${Math.round((S.responses / S.invited) * 100)}%`} note={`${S.responses} of ${S.invited} participants`} tone="brand" />
        <Metric label="Would recommend" value={`${S.recommend}%`} note="Answered Yes" />
        <Metric label="Comments" value={FEEDBACK_COMMENTS.length} note="Written feedback" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Panel>
          <PanelTitle title="Average by criteria" subtitle="Out of 5, from rating questions" />
          <ul className="space-y-4">
            {S.criteria.map((c) => <MeterRow key={c.label} label={c.label} value={(c.value / 5) * 100} display={c.value.toFixed(1)} tone={c.value >= 4.5 ? 'ok' : 'brand'} labelWidth={170} />)}
          </ul>
        </Panel>
        <Panel>
          <PanelTitle title="Rating distribution" subtitle={`${S.responses} responses`} />
          <ul className="space-y-4">
            {S.distribution.map((d) => (
              <MeterRow key={d.stars} label={`${d.stars} ${d.stars === 1 ? 'star' : 'stars'}`} value={maxN ? (d.n / maxN) * 100 : 0} display={d.n} tone="amber" labelWidth={60} />
            ))}
          </ul>
        </Panel>
      </div>

      <Panel pad={false} className="overflow-hidden">
        <div className="p-5 pb-3"><PanelTitle title="Ratings by session" subtitle="Collected per session from the mobile app" /></div>
        <DataTable columns={sessionCols} rows={FEEDBACK} />
      </Panel>

      <Panel>
        <PanelTitle title="What participants said" subtitle="Anonymous responses hide the participant’s name">
          <Select value={rating} onChange={(e) => setRating(e.target.value)} aria-label="Filter by rating">
            <option value="All">All ratings</option><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars or below</option>
          </Select>
          <Button variant="secondary" size="sm" icon="download" onClick={() => { downloadCsv('feedback.csv', [['Participant', 'Session', 'Rating', 'Date', 'Comment'], ...FEEDBACK_COMMENTS.map((c) => [c.name, c.session, c.rating, c.date, c.comment])]); notify?.('Feedback exported as CSV'); }}>Export</Button>
        </PanelTitle>
        {comments.length ? (
          <ul className="divide-y divide-[var(--glass-divider)]">
            {comments.map((c) => (
              <li key={c.id} className="flex gap-3.5 py-4 first:pt-0 last:pb-0">
                <Avatar name={c.name === 'Anonymous' ? '?' : c.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <strong className="text-[13px] font-medium text-ink-950">{c.name}</strong>
                    <Stars value={c.rating} size={12} />
                    <span className="text-xs text-ink-400">{c.date}</span>
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-700">{c.comment}</p>
                  <small className="mt-1 block text-[11px] text-ink-500">{c.session}</small>
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="py-6 text-center text-[13px] text-ink-500">No comments with this rating.</p>}
      </Panel>
    </div>
  );
}

export function FeedbackTab({ notify }) {
  const [view, setView] = useState('summary');
  return (
    <div className="space-y-4">
      <Pills value={view} onChange={setView} options={[{ id: 'summary', label: 'Summary' }, { id: 'responses', label: 'Responses and ratings' }, { id: 'form', label: 'Feedback form' }]} />
      {view === 'summary' && <FeedbackSummary />}
      {view === 'responses' && <FeedbackResponses notify={notify} />}
      {view === 'form' && <FeedbackForm notify={notify} />}
    </div>
  );
}

/* ── Reentry Plans ────────────────────────────────────────────────── */
export function ReentryTab({ notify }) {
  const editing = useEditing();
  const [open, setOpen] = useState(null);
  const [viewing, setViewing] = useState(null);
  const pending = REENTRY.filter((r) => r.status === 'Pending').length;
  const grid = 'grid-cols-[1.1fr_1.4fr_1fr_1fr_110px_40px]';

  return (
    <Panel pad={false} className="overflow-hidden">
      <div className="p-5 pb-3">
        <PanelTitle title="Reentry plans" subtitle="How each participant will apply what they learned. A plan does not have to start right away, and a supporting document can be attached.">
          <Button variant="secondary" size="sm" disabled={!editing || !pending} onClick={() => notify?.(`Reminder sent to ${pending} participant${pending === 1 ? '' : 's'} with a pending plan`)}>Remind pending</Button>
        </PanelTitle>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[780px]">
          <div className={`grid ${grid} items-center gap-4 border-y border-[var(--glass-divider)] px-5 py-2.5 text-xs text-ink-500`}>
            <span>Participant</span><span>Planned application</span><span>Timeline</span><span>Supporting document</span><span>Status</span><span />
          </div>

          {REENTRY.map((r) => {
            const has = r.status !== 'Pending';
            const isOpen = open === r.id;
            return (
              <div key={r.id} className="border-b border-[var(--glass-divider)] last:border-0">
                <button
                  type="button" disabled={!has} aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : r.id)}
                  className={`grid ${grid} w-full items-center gap-4 px-5 py-3 text-left text-[13px] transition-colors ${has ? 'hover:bg-white/50' : 'cursor-default'} ${isOpen ? 'bg-white/40' : ''}`}
                >
                  {personCell(r.name)}
                  <span className="truncate text-ink-600">{r.summary}</span>
                  <span className="text-ink-700">{r.timeline}</span>
                  <span className="min-w-0">
                    {r.doc
                      ? <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-brand-100/70 px-2.5 py-1 text-[11px] text-brand-800"><Icon name="file" size={12} /><span className="truncate">{r.doc.file}</span></span>
                      : <span className="text-ink-400">{has ? 'None attached' : '—'}</span>}
                  </span>
                  <Badge value={r.status} />
                  <Icon name="chevron" size={16} className={`justify-self-end text-ink-400 transition-transform ${isOpen ? 'rotate-180' : ''} ${has ? '' : 'opacity-30'}`} />
                </button>

                {isOpen && (
                  <div className="grid gap-6 bg-white/30 px-5 pb-5 pt-1 lg:grid-cols-[1.5fr_1fr]">
                    <div className="space-y-4">
                      <section>
                        <h3 className="text-xs font-medium text-ink-500">Planned application</h3>
                        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-800">{r.details}</p>
                      </section>
                      <section>
                        <h3 className="text-xs font-medium text-ink-500">Expected result</h3>
                        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-800">{r.result}</p>
                      </section>
                    </div>
                    <div className="space-y-4">
                      <section>
                        <h3 className="text-xs font-medium text-ink-500">Support needed from the agency</h3>
                        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-800">{r.support}</p>
                      </section>
                      <section>
                        <h3 className="text-xs font-medium text-ink-500">Supporting document</h3>
                        {r.doc ? (
                          <div className="glass-inset mt-1.5 flex items-center gap-3 rounded-xl p-3">
                            <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-white text-brand-600"><Icon name="file" size={16} /></span>
                            <span className="min-w-0 flex-1"><strong className="block truncate text-[13px] font-medium text-ink-950">{r.doc.file}</strong><small className="text-[11px] text-ink-500">{r.doc.size}</small></span>
                            <ActionIcon icon="eye" label="View document" onClick={() => setViewing({ ...r.doc, type: 'Reentry plan document', uploaded: r.timeline })} />
                            <ActionIcon icon="download" label="Download" tone="brand" onClick={() => { downloadDoc({ ...r.doc, type: 'Reentry plan document' }); notify?.(`Downloading ${r.doc.file}`); }} />
                          </div>
                        ) : <p className="mt-1.5 text-[13px] text-ink-500">No document attached. Documents are optional.</p>}
                      </section>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {viewing && <DocumentPreviewModal doc={viewing} onClose={() => setViewing(null)} notify={notify} />}
    </Panel>
  );
}

/* ── Certificates ─────────────────────────────────────────────────── */
const sizeOf = (b) => (b < 1048576 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1048576).toFixed(1)} MB`);
const tplField = 'glass-input h-9 w-full rounded-lg px-3 text-[13px] text-ink-950 placeholder:text-ink-400 disabled:cursor-not-allowed disabled:opacity-60';

const METHODS = [
  { id: 'auto',   icon: 'sparkle', title: 'Automatic',       desc: 'UniFyle fills a template with each participant’s name and gives every certificate its own number.' },
  { id: 'manual', icon: 'upload',  title: 'Manual upload',   desc: 'Upload each participant’s own certificate file, for example one signed or printed by another office.' },
];

export function CertificatesTab({ activity, notify }) {
  const editing = useEditing();
  const confirm = useConfirm();
  const { profile, logo } = useStore();
  const [mode, setMode] = useState('auto');
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [minAtt, setMinAtt] = useState('80');
  const [rules, setRules] = useState({ feedback: true, reentry: true, output: true, auto: true });
  const [rows, setRows] = useState(CERT_ROWS);
  const [preview, setPreview] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [signing, setSigning] = useState(null);   // index of the signatory being drawn
  const [sigError, setSigError] = useState('');
  const sigFile = useRef(null);
  const sigFor = useRef(0);
  const pickRow = useRef(null);
  const single = useRef(null);
  const bulk = useRef(null);

  const manual = mode === 'manual';
  const eligible = rows.filter((r) => r.cert === 'Eligible');
  const releasable = manual ? eligible.filter((r) => r.file) : eligible;
  const attached = eligible.filter((r) => r.file).length;
  const setT = (patch) => setTemplate((t) => ({ ...t, ...patch }));
  const onSigFile = (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(f.type)) { setSigError('Use a PNG, JPG or WebP image.'); return; }
    if (f.size > 2 * 1048576) { setSigError('The image is larger than 2 MB.'); return; }
    setSigError('');
    const reader = new FileReader();
    reader.onload = () => setSigner(sigFor.current, { signature: reader.result });
    reader.readAsDataURL(f);
  };
  const setSigner = (i, patch) => setTemplate((t) => ({ ...t, signers: t.signers.map((s, j) => (j === i ? { ...s, ...patch } : s)) }));

  const propsFor = (r, t = template) => ({
    name: r.name, activity: activity.title, agency: profile.name, date: activity.date, template: t, logo,
    initials: profile.shortName.slice(0, 2).toUpperCase(), number: `${profile.shortName}-${activity.id}-${String(r.id).padStart(4, '0')}`,
  });
  const toFile = (f) => ({ file: f.name, type: 'Certificate', size: sizeOf(f.size), uploaded: 'Jun 18, 2025', mime: f.type, url: URL.createObjectURL(f) });

  const attach = (id, f) => {
    if (!f) return;
    setRows((l) => l.map((r) => (r.id === id ? { ...r, file: toFile(f) } : r)));
    notify?.(`${f.name} attached`);
  };
  // Several files at once: a file goes to the participant whose first and last name appear in its file name.
  const attachMany = (files) => {
    const norm = (s) => s.toLowerCase().replace(/[^a-z]/g, '');
    let matched = 0;
    setRows((l) => l.map((r) => {
      const hit = files.find((f) => { const n = norm(f.name); return r.name.toLowerCase().split(/\s+/).every((part) => n.includes(norm(part))); });
      if (!hit) return r;
      matched += 1;
      return { ...r, file: toFile(hit) };
    }));
    setTimeout(() => notify?.(matched ? `${matched} of ${files.length} files matched to participants by name` : 'No file name matched a participant. Include the participant’s name in the file name.'), 0);
  };

  const finish = (ids) => setRows((l) => l.map((r) => (ids.includes(r.id) ? { ...r, cert: 'Released' } : r)));
  const releaseAll = async () => {
    if (!(await confirm({ tone: 'warn', title: `Release ${releasable.length} certificate${releasable.length === 1 ? '' : 's'}?`, message: 'These participants will receive their certificates right away.', detail: manual && attached < eligible.length ? `${eligible.length - attached} eligible participant${eligible.length - attached === 1 ? ' has' : 's have'} no file yet and will be skipped.` : 'A released certificate cannot be taken back.', confirmLabel: 'Release all' }))) return;
    finish(releasable.map((r) => r.id));
    notify?.(`${releasable.length} certificate${releasable.length === 1 ? '' : 's'} released`);
  };
  const releaseOne = async (r) => {
    if (!(await confirm({ tone: 'warn', title: `Release certificate to ${r.name}?`, message: 'They will receive it right away.', detail: 'A released certificate cannot be taken back.', confirmLabel: 'Release certificate' }))) return;
    finish([r.id]);
    notify?.(`Certificate released to ${r.name}`);
  };
  const download = (r) => {
    if (r.file) { downloadDoc(r.file); notify?.(`Downloading ${r.file.file}`); return; }
    downloadFile(`Certificate_${r.name.replace(/\s+/g, '_')}.html`, certificateDocument(propsFor(r)), 'text/html');
    notify?.(`Downloading certificate for ${r.name}`);
  };

  const columns = [
    { key: 'name', label: 'Participant', render: (r) => personCell(r.name) },
    { key: 'attended', label: 'Sessions attended' },
    { key: 'feedback', label: 'Feedback', render: (r) => <Badge value={r.feedback} tone={r.feedback === 'Done' ? 'ok' : 'warn'} /> },
    { key: 'reentry', label: 'Reentry plan', render: (r) => <Badge value={r.reentry} /> },
    { key: 'output', label: 'Output', render: (r) => <Badge value={r.output} /> },
    manual && { key: 'file', label: 'Certificate file', render: (r) => (r.file ? <span className="inline-flex max-w-[180px] items-center gap-1.5 rounded-full bg-brand-100/70 px-2.5 py-1 text-[11px] text-brand-800"><Icon name="file" size={12} /><span className="truncate">{r.file.file}</span></span> : <span className="text-ink-400">None</span>) },
    { key: 'cert', label: 'Certificate', render: (r) => <Badge value={r.cert} /> },
    {
      key: 'actions', label: 'Actions',
      render: (r) => (
        <div className="flex justify-start gap-0.5">
          {r.cert === 'Released' ? (
            <>
              <ActionIcon icon="eye" label="Preview certificate" onClick={() => (r.file ? setViewing(r.file) : setPreview(r))} />
              <ActionIcon icon="download" label="Download certificate" tone="brand" onClick={() => download(r)} />
            </>
          ) : (
            <>
              {manual && r.cert === 'Eligible' && (
                <ActionIcon icon="upload" label={r.file ? 'Replace certificate file' : 'Upload certificate file'} disabled={!editing} onClick={() => { pickRow.current = r.id; single.current?.click(); }} />
              )}
              {manual && r.file && <ActionIcon icon="eye" label="View uploaded file" onClick={() => setViewing(r.file)} />}
              <ActionIcon icon="award" tone="ok"
                label={r.cert !== 'Eligible' ? 'Not eligible yet' : manual && !r.file ? 'Upload a file to release' : 'Release certificate'}
                disabled={r.cert !== 'Eligible' || (manual && !r.file) || !editing} onClick={() => releaseOne(r)} />
            </>
          )}
        </div>
      ),
    },
  ].filter(Boolean);

  const ruleList = [['feedback', 'Require session feedback'], ['reentry', 'Require reentry plan'], ['output', 'Require participant output'], !manual && ['auto', 'Release automatically when eligible']].filter(Boolean);
  const sample = { id: 0, name: 'Maria Santos' };

  return (
    <div className="space-y-4">
      <input ref={single} type="file" accept=".pdf,.jpg,.jpeg,.png" className="sr-only" id="cert-file" onChange={(e) => { attach(pickRow.current, e.target.files?.[0]); e.target.value = ''; }} />
      <input ref={bulk} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="sr-only" id="cert-files" onChange={(e) => { attachMany([...e.target.files]); e.target.value = ''; }} />

      <Panel>
        <PanelTitle title="How certificates are released" subtitle="Pick one way for this activity" />
        <div role="radiogroup" aria-label="Release method" className="grid gap-3 md:grid-cols-2">
          {METHODS.map((m) => {
            const on = mode === m.id;
            return (
              <button key={m.id} type="button" role="radio" aria-checked={on} disabled={!editing && !on} onClick={() => setMode(m.id)}
                className={`flex items-start gap-3.5 rounded-2xl border bg-white p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${on ? 'border-brand-500 ring-2 ring-brand-500/25' : 'border-ink-200 enabled:hover:border-ink-300'}`}>
                <span className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl ${on ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-600'}`}><Icon name={m.icon} size={18} /></span>
                <span className="min-w-0 flex-1"><strong className="block text-sm font-medium text-ink-950">{m.title}</strong><small className="mt-0.5 block text-xs leading-snug text-ink-500">{m.desc}</small></span>
                <span className={`mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full border ${on ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink-300'}`}>{on && <Icon name="check" size={12} />}</span>
              </button>
            );
          })}
        </div>
        {!editing && <p className="mt-3 text-xs text-ink-500">Press Edit activity to change the release method or the template.</p>}
      </Panel>

      {manual ? (
        <Panel>
          <PanelTitle title="Upload certificates" subtitle="One PDF or image per participant. Add several at once, or upload them one by one in the table.">
            <Button size="sm" icon="upload" disabled={!editing} onClick={() => bulk.current?.click()}>Upload files</Button>
          </PanelTitle>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <div><strong className="text-[22px] font-medium tracking-[-0.4px] text-ink-950">{attached} of {eligible.length}</strong><small className="ml-2 text-xs text-ink-500">eligible participants have a file</small></div>
            <div className="min-w-[240px] flex-1"><ProgressBar value={eligible.length ? (attached / eligible.length) * 100 : 0} tone={attached === eligible.length && eligible.length ? 'ok' : 'brand'} /></div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-ink-500">Tip: name each file after the participant, for example <code className="rounded bg-white/70 px-1.5 py-0.5 text-ink-700">Maria_Santos.pdf</code>. When you upload several files, each goes to the participant whose name appears in the file name.</p>
        </Panel>
      ) : (
        <Panel>
          <PanelTitle title="Certificate template" subtitle="Every certificate uses this design. The name, activity, dates and certificate number fill in by themselves." />
          <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
            <div className="space-y-4">
              <div>
                <span className="mb-1.5 block text-xs text-ink-500">Style</span>
                <div role="tablist" aria-label="Style" className="glass-inset inline-flex rounded-full p-0.5">
                  {CERT_STYLES.map((s) => (
                    <button key={s.id} role="tab" aria-selected={template.style === s.id} disabled={!editing} onClick={() => setT({ style: s.id })}
                      className={`rounded-full px-3.5 py-1.5 text-xs transition-colors disabled:cursor-not-allowed ${template.style === s.id ? 'bg-white font-medium text-ink-950 shadow-sm' : 'text-ink-500 enabled:hover:text-ink-950'}`}>{s.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <span className="mb-1.5 block text-xs text-ink-500">Accent color</span>
                <div className="flex flex-wrap items-center gap-2">
                  {CERT_COLORS.map((c) => (
                    <button key={c} type="button" aria-label={`Use ${c}`} aria-pressed={template.accent === c} disabled={!editing} onClick={() => setT({ accent: c })}
                      className={`h-7 w-7 rounded-full ring-offset-2 transition disabled:cursor-not-allowed disabled:opacity-60 ${template.accent === c ? 'ring-2 ring-ink-950' : 'ring-1 ring-black/10'}`} style={{ background: c }} />
                  ))}
                  <input type="color" aria-label="Custom color" disabled={!editing} value={template.accent} onChange={(e) => setT({ accent: e.target.value })} className="h-7 w-9 cursor-pointer rounded-md border border-ink-200 bg-white p-0.5 disabled:cursor-not-allowed disabled:opacity-60" />
                </div>
              </div>
              <label className="block space-y-1.5"><span className="text-xs text-ink-500">Title</span><input className={tplField} disabled={!editing} value={template.title} onChange={(e) => setT({ title: e.target.value })} /></label>
              <label className="block space-y-1.5"><span className="text-xs text-ink-500">Wording before the activity name</span><input className={tplField} disabled={!editing} value={template.message} onChange={(e) => setT({ message: e.target.value })} /></label>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {template.signers.map((s, i) => (
                  <fieldset key={i} className="space-y-1.5">
                    <legend className="mb-1 text-xs text-ink-500">Signatory {i + 1}</legend>
                    <input className={tplField} disabled={!editing} value={s.name} onChange={(e) => setSigner(i, { name: e.target.value })} placeholder="Name" aria-label={`Signatory ${i + 1} name`} />
                    <input className={tplField} disabled={!editing} value={s.role} onChange={(e) => setSigner(i, { role: e.target.value })} placeholder="Role" aria-label={`Signatory ${i + 1} role`} />
                    <div className="glass-inset flex items-center gap-2 rounded-lg p-2">
                      <span className="grid h-10 w-16 flex-shrink-0 place-items-center overflow-hidden rounded-md bg-white ring-1 ring-black/5">
                        {s.signature ? <img src={s.signature} alt={`Signature of signatory ${i + 1}`} className="max-h-full max-w-full object-contain" /> : <span className="text-[10px] text-ink-400">No signature</span>}
                      </span>
                      <div className="flex min-w-0 flex-1 flex-wrap gap-1">
                        <Button variant="secondary" size="sm" icon="upload" disabled={!editing} onClick={() => { sigFor.current = i; sigFile.current?.click(); }}>Upload</Button>
                        <Button variant="secondary" size="sm" icon="edit" disabled={!editing} onClick={() => setSigning(i)}>Draw</Button>
                        {s.signature && <Button variant="ghost" size="sm" disabled={!editing} onClick={() => setSigner(i, { signature: null })}>Remove</Button>}
                      </div>
                    </div>
                  </fieldset>
                ))}
              </div>
              <input ref={sigFile} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" aria-label="Upload signature image" onChange={onSigFile} />
              {sigError && <p className="flex items-center gap-1.5 text-xs text-danger"><Icon name="alert" size={13} />{sigError}</p>}
              <p className="-mt-2 text-[11px] text-ink-400">A signature image or drawing replaces the typed name above the line. Transparent PNGs look best.</p>
              <label className="flex items-center gap-2.5 text-[13px] text-ink-700">
                <span className={editing ? '' : 'pointer-events-none opacity-60'}><Switch checked={template.showLogo} onChange={(v) => setT({ showLogo: v })} label="Show the agency logo" /></span>
                Show the agency logo
              </label>
            </div>
            <div>
              <span className="mb-1.5 block text-xs text-ink-500">Live preview (sample participant)</span>
              <div className="overflow-hidden rounded-xl shadow-[0_14px_36px_rgba(40,70,160,0.16)] ring-1 ring-black/5"><CertificateCanvas {...propsFor(sample)} /></div>
            </div>
          </div>
        </Panel>
      )}

      <Panel>
        <PanelTitle title="Certificate rules" subtitle="Set once per activity. Participants see their progress in Plans & certs on the mobile app." />
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <label className="flex items-center gap-3 text-[13px] text-ink-600">
            Minimum attendance
            <Select value={minAtt} onChange={(e) => setMinAtt(e.target.value)} aria-label="Minimum attendance" disabled={!editing} className="disabled:cursor-not-allowed disabled:opacity-60">
              <option value="100">100% of sessions</option>
              <option value="80">80% of sessions</option>
              <option value="60">60% of sessions</option>
            </Select>
          </label>
          {ruleList.map(([k, label]) => (
            <label key={k} className="flex items-center gap-2.5 text-[13px] text-ink-600">
              <span className={editing ? '' : 'pointer-events-none opacity-60'}><Switch checked={rules[k]} onChange={(v) => setRules((x) => ({ ...x, [k]: v }))} label={label} /></span>
              {label}
            </label>
          ))}
        </div>
      </Panel>

      <Panel pad={false} className="overflow-hidden">
        <div className="p-5 pb-3">
          <PanelTitle title="Participant eligibility" subtitle="Computed from attendance, feedback, reentry plan and output records">
            <Button size="sm" icon="award" disabled={!editing || !releasable.length} onClick={releaseAll}>Release all{releasable.length ? ` (${releasable.length})` : ''}</Button>
          </PanelTitle>
        </div>
        <DataTable columns={columns} rows={rows} />
      </Panel>

      {preview && <CertificatePreviewModal row={preview} activity={activity} template={template} onClose={() => setPreview(null)} notify={notify} />}
      {viewing && <DocumentPreviewModal doc={viewing} onClose={() => setViewing(null)} notify={notify} />}
      {signing !== null && <SignaturePadModal name={template.signers[signing]?.name} onSave={(data) => setSigner(signing, { signature: data })} onClose={() => setSigning(null)} />}
    </div>
  );
}
