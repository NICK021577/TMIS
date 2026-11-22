import { useEffect, useRef, useState } from 'react';
import { useConfirm } from '../modals/confirmContext';
import { ActionIcon, Badge, Button, Callout, Icon, Panel, PanelTitle } from '../ui';
import { useStore } from '../../hooks/useStore';
import { useAuth } from '../../context/AuthContext';
import { useEditing } from './editContext';
import { copyText, downloadFile } from '../../lib/download';
import { SECTION_DEFS, buildSnapshot, draftSections, readinessNotes, reportHtml, reportText, snapshotFacts } from '../../lib/reportDraft';

const STATUS = {
  generated: { label: 'AI draft', tone: 'info' },
  reviewed: { label: 'Reviewed', tone: 'warn' },
  final: { label: 'Final', tone: 'ok' },
};
const STEPS = [['generated', 'AI draft'], ['reviewed', 'Reviewed'], ['final', 'Final']];
const when = () => new Date().toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

function Stepper({ status }) {
  const at = STEPS.findIndex(([k]) => k === status);
  return (
    <ol className="flex items-center gap-2" aria-label="Report status">
      {STEPS.map(([k, label], i) => {
        const done = at >= i;
        return (
          <li key={k} className="flex items-center gap-2">
            <span className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-medium ${done ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-500'}`}>{at > i || status === 'final' ? <Icon name="check" size={12} /> : i + 1}</span>
            <span className={`text-xs ${done ? 'font-medium text-ink-950' : 'text-ink-500'}`}>{label}</span>
            {i < STEPS.length - 1 && <span className={`h-px w-6 ${at > i ? 'bg-brand-600' : 'bg-ink-200'}`} />}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Report: an after-activity report drafted by AI from the activity's own totals, then edited and
 * approved by a person. Versions are kept, so regenerating never overwrites a human-edited draft.
 * Until the AI service is connected, the draft is written from fixed templates with the real numbers.
 */
export function ReportTab({ activity, notify }) {
  const editing = useEditing();
  const confirm = useConfirm();
  const { user } = useAuth();
  const { sessions, items, getDetails, reports, setReports } = useStore();

  const entry = reports[activity.id] ?? { versions: [], current: null };
  const version = entry.versions.find((v) => v.v === entry.current) ?? null;
  const locked = version?.status === 'final';
  const canEdit = editing && !locked;

  const snapshot = buildSnapshot({ activity, details: getDetails(activity), sessions, items });
  const notes = readinessNotes(snapshot);

  const [busy, setBusy] = useState(null);   // { step } while "generating"
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const patch = (fn) => setReports((r) => {
    const cur = r[activity.id] ?? { versions: [], current: null };
    return { ...r, [activity.id]: fn(cur) };
  });
  const patchVersion = (v, fn) => patch((cur) => ({ ...cur, versions: cur.versions.map((x) => (x.v === v ? fn(x) : x)) }));

  const STEP_TEXT = ['Collecting totals', 'Drafting sections', 'Checking numbers'];
  const generate = async () => {
    if (version && version.status !== 'final' && version.sections.some((s) => s.edited)) {
      const ok = await confirm({ tone: 'warn', title: 'Generate a new version?', message: 'Your edits stay in the current version. The new draft is added as a separate version.', confirmLabel: 'Generate new version' });
      if (!ok) return;
    }
    setBusy({ step: 0 });
    timers.current.push(setTimeout(() => setBusy({ step: 1 }), 600), setTimeout(() => setBusy({ step: 2 }), 1200));
    timers.current.push(setTimeout(() => {
      const next = (entry.versions.at(-1)?.v ?? 0) + 1;
      patch((cur) => ({
        current: next,
        versions: [...cur.versions, { v: next, status: 'generated', sections: draftSections(snapshot), snapshot, createdAt: when(), createdBy: user?.name ?? 'You', reviewedBy: null, finalizedAt: null }],
      }));
      setBusy(null);
      notify?.(`Draft v${next} generated`);
    }, 1800));
  };

  const edit = (id, text) => patchVersion(version.v, (x) => ({ ...x, sections: x.sections.map((s) => (s.id === id ? { ...s, text, edited: true } : s)) }));
  const redo = (id) => {
    const fresh = draftSections(snapshot).find((s) => s.id === id);
    patchVersion(version.v, (x) => ({ ...x, sections: x.sections.map((s) => (s.id === id ? { ...fresh } : s)) }));
    notify?.('Section redrafted');
  };
  const review = () => { patchVersion(version.v, (x) => ({ ...x, status: 'reviewed', reviewedBy: user?.name ?? 'You', reviewedAt: when() })); notify?.('Marked as reviewed'); };
  const finalize = async () => {
    if (!(await confirm({ tone: 'info', title: 'Finalize this report?', message: 'It becomes the official report and can no longer be edited. You can still start a new version.', confirmLabel: 'Finalize' }))) return;
    patchVersion(version.v, (x) => ({ ...x, status: 'final', finalizedAt: when(), finalizedBy: user?.name ?? 'You' }));
    notify?.('Report finalized');
  };

  const title = `${activity.title}: Activity report`;
  const sections = version?.sections ?? [];
  const exportWord = () => { downloadFile(`${activity.title.replace(/\W+/g, '_')}_report_v${version.v}.doc`, reportHtml(title, sections), 'application/msword'); notify?.('Report downloaded'); };
  const copy = () => { copyText(reportText(title, sections)); notify?.('Report copied'); };

  /* ── nothing generated yet ── */
  if (!version) {
    return (
      <div className="space-y-4">
        <Panel>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-xl">
              <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-800"><Icon name="sparkle" size={13} />AI-assisted</span>
              <h2 className="text-[17px] font-medium text-ink-950">Activity report</h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-600">Draft the after-activity report from this activity’s own data: sessions, attendance, feedback, budget and outputs. You review and edit every section before it becomes final.</p>
            </div>
            <Button icon="sparkle" disabled={!editing || !!busy} onClick={generate}>{busy ? STEP_TEXT[busy.step] + '…' : 'Generate draft'}</Button>
          </div>
          {!editing && <p className="mt-3 text-xs text-ink-500">Press <strong className="font-medium">Edit activity</strong> to generate a draft.</p>}
          {busy && <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-brand-900/[0.07]"><div className="h-full rounded-full bg-brand-500 transition-all duration-500" style={{ width: `${((busy.step + 1) / 3) * 100}%` }} /></div>}
        </Panel>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Panel>
            <PanelTitle title="What the draft will use" subtitle="Totals only, taken from this activity" />
            <dl className="divide-y divide-[var(--glass-divider)] text-[13px]">
              {snapshotFacts(snapshot).map(([k, v]) => (
                <div key={k} className="grid grid-cols-[150px_1fr] gap-3 py-2.5"><dt className="text-ink-500">{k}</dt><dd className="text-ink-900">{v}</dd></div>
              ))}
            </dl>
          </Panel>
          <div className="space-y-4">
            <Panel>
              <PanelTitle title="Before you generate" subtitle={notes.length ? 'Missing data makes the draft thinner' : 'Everything the report needs is in'} />
              {notes.length ? (
                <ul className="space-y-2">
                  {notes.map((n) => <li key={n} className="flex items-start gap-2 text-[13px] text-ink-700"><Icon name="alert" size={14} className="mt-0.5 flex-shrink-0 text-amber-600" />{n}</li>)}
                </ul>
              ) : <p className="flex items-center gap-2 text-[13px] text-emerald-800"><Icon name="check" size={14} />Ready to generate.</p>}
            </Panel>
            <Callout tone="info" icon="lock">
              <strong className="font-medium">Privacy.</strong> Only the totals on the left are used. No participant names, contact details or comments are sent to the AI service. A person always reviews the result.
            </Callout>
          </div>
        </div>
      </div>
    );
  }

  /* ── a report exists ── */
  const st = STATUS[version.status];
  return (
    <div className="space-y-4">
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2.5">
              <Badge value={st.label} tone={st.tone} variant="pill" />
              <span className="text-xs text-ink-500">Version {version.v} · created {version.createdAt}</span>
            </div>
            <Stepper status={version.status} />
            {version.reviewedBy && <p className="mt-2 text-xs text-ink-500">Reviewed by {version.reviewedBy}{version.reviewedAt ? `, ${version.reviewedAt}` : ''}{version.finalizedAt ? ` · Finalized ${version.finalizedAt}` : ''}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" icon="download" onClick={exportWord}>Word</Button>
            <Button variant="secondary" size="sm" icon="file" onClick={copy}>Copy</Button>
            <Button variant="secondary" size="sm" icon="refresh" disabled={!editing || !!busy} onClick={generate}>{busy ? `${STEP_TEXT[busy.step]}…` : locked ? 'New version' : 'Regenerate'}</Button>
            {version.status === 'generated' && <Button size="sm" icon="check" disabled={!editing} onClick={review}>Mark as reviewed</Button>}
            {version.status === 'reviewed' && <Button size="sm" icon="shield" disabled={!editing} onClick={finalize}>Finalize</Button>}
          </div>
        </div>
        {busy && <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-brand-900/[0.07]"><div className="h-full rounded-full bg-brand-500 transition-all duration-500" style={{ width: `${((busy.step + 1) / 3) * 100}%` }} /></div>}
        {!editing && !locked && <p className="mt-3 text-xs text-ink-500">Press <strong className="font-medium">Edit activity</strong> to edit sections or change the status.</p>}
      </Panel>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {version.status === 'generated' && (
            <Callout tone="warn" icon="alert">This is an AI draft. Check every number and sentence against the activity records before marking it as reviewed.</Callout>
          )}
          {sections.map((s) => (
            <Panel key={s.id}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm font-medium text-ink-950">{s.title}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${s.edited ? 'bg-brand-100 text-brand-800' : 'bg-ink-100 text-ink-600'}`}>{s.edited ? 'Edited' : 'AI draft'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <small className="hidden text-[11px] text-ink-400 sm:block">From: {s.source}</small>
                  <ActionIcon icon="refresh" label="Redraft this section" disabled={!canEdit} onClick={() => redo(s.id)} />
                </div>
              </div>
              <textarea
                value={s.text} readOnly={!canEdit} onChange={(e) => edit(s.id, e.target.value)}
                aria-label={s.title}
                rows={Math.max(3, Math.ceil(s.text.length / 95) + s.text.split('\n').length - 1)}
                className={`w-full resize-y rounded-xl px-3 py-2.5 text-[13px] leading-relaxed text-ink-800 outline-none ${canEdit ? 'border border-ink-200 bg-white focus:border-brand-400' : 'bg-transparent'}`}
              />
            </Panel>
          ))}
        </div>

        <div className="space-y-4 xl:sticky xl:top-4">
          <Panel>
            <PanelTitle title="Data used" subtitle={`Totals as of ${version.createdAt}`} />
            <dl className="space-y-2.5 text-xs">
              {snapshotFacts(version.snapshot).map(([k, v]) => (
                <div key={k}><dt className="text-ink-500">{k}</dt><dd className="mt-0.5 text-ink-900">{v}</dd></div>
              ))}
            </dl>
            <p className="mt-3 flex items-start gap-1.5 border-t border-[var(--glass-divider)] pt-3 text-[11px] leading-snug text-ink-500"><Icon name="lock" size={12} className="mt-0.5 flex-shrink-0" />No participant names or comments are sent to the AI service.</p>
          </Panel>

          <Panel>
            <PanelTitle title="Versions" subtitle="Older versions are kept" />
            <ul className="space-y-1.5">
              {[...entry.versions].reverse().map((x) => (
                <li key={x.v}>
                  <button type="button" onClick={() => patch((cur) => ({ ...cur, current: x.v }))} aria-pressed={x.v === version.v}
                    className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] transition-colors ${x.v === version.v ? 'bg-brand-50 text-ink-950' : 'text-ink-700 hover:bg-white/60'}`}>
                    <span><strong className="font-medium">v{x.v}</strong> <span className="text-xs text-ink-500">· {x.createdAt}</span></span>
                    <Badge value={STATUS[x.status].label} tone={STATUS[x.status].tone} variant="pill" />
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
          {SECTION_DEFS.length > 0 && null}
        </div>
      </div>
    </div>
  );
}
