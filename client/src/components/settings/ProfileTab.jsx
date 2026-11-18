import { useState } from 'react';
import { AgencyMark, Callout, Field, Panel, PanelTitle, inputCls, textareaCls } from '../ui';
import { useStore } from '../../hooks/useStore';
import { SaveBar } from './SettingsKit';

const MAX_SHORT = 10;

/** Agency profile: one record, two views (staff About page + participant About tab). */
export default function ProfileTab({ readOnly, notify }) {
  const { profile, setProfile } = useStore();
  const [f, setF] = useState(profile);
  const set = (patch) => setF((p) => ({ ...p, ...patch }));
  const dirty = JSON.stringify(f) !== JSON.stringify(profile);

  const values = f.values.split(';').map((v) => v.trim()).filter(Boolean);

  return (
    <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[1fr_380px]">
    <Panel>
      <PanelTitle title="Agency profile" subtitle="One record, two views. Staff read it on the About page and participants read it on the mobile About tab." />
      {readOnly && <div className="mb-4"><Callout tone="info" icon="lock">Only Agency Administrators can edit the agency profile. You can read it here.</Callout></div>}

      <fieldset disabled={readOnly} className="space-y-4 disabled:opacity-70">
        <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
          <Field label="Display name (full)"><input className={inputCls} value={f.name} onChange={(e) => set({ name: e.target.value })} /></Field>
          <Field label="Short name / acronym" hint={`${f.shortName.length}/${MAX_SHORT} characters. Shown in the sidebar.`}>
            <input className={inputCls} maxLength={MAX_SHORT} value={f.shortName} onChange={(e) => set({ shortName: e.target.value })} />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Field label="Mission"><textarea rows={4} className={textareaCls} value={f.mission} onChange={(e) => set({ mission: e.target.value })} /></Field>
          <Field label="Vision"><textarea rows={4} className={textareaCls} value={f.vision} onChange={(e) => set({ vision: e.target.value })} /></Field>
        </div>
        <Field label="Core values" hint="Separate with semicolons"><input className={inputCls} value={f.values} onChange={(e) => set({ values: e.target.value })} /></Field>
        <Field label="Mandate / About"><textarea rows={3} className={textareaCls} value={f.mandate} onChange={(e) => set({ mandate: e.target.value })} /></Field>
      </fieldset>

      {!readOnly && (
        <SaveBar dirty={dirty} canSave={!!f.name.trim() && !!f.shortName.trim()} label="Save profile" onDiscard={() => setF(profile)}
          onSave={() => { setProfile(f); notify?.('Profile saved. The About page and the participant About tab are updated'); }} />
      )}
    </Panel>

    <Panel className="xl:sticky xl:top-0">
      <PanelTitle title="How it appears" subtitle="Live preview of the About page and the participant About tab" />
      <div className="glass-inset rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <AgencyMark size={44} />
          <div className="min-w-0 leading-tight">
            <strong className="block truncate text-[13px] font-medium text-ink-950">{f.name || 'Agency name'}</strong>
            <small className="text-xs text-ink-500">{f.shortName || '—'} · Government agency</small>
          </div>
        </div>
        <h3 className="mb-1 mt-4 text-xs text-ink-400">Mission</h3>
        <p className="text-[13px] leading-relaxed text-ink-700">{f.mission || '—'}</p>
        <h3 className="mb-1 mt-4 text-xs text-ink-400">Vision</h3>
        <p className="text-[13px] leading-relaxed text-ink-700">{f.vision || '—'}</p>
        {values.length > 0 && (
          <>
            <h3 className="mb-2 mt-4 text-xs text-ink-400">Core values</h3>
            <div className="flex flex-wrap gap-1.5">
              {values.map((v) => <span key={v} className="rounded-full bg-white/80 px-2.5 py-1 text-xs text-brand-800 ring-1 ring-black/5">{v}</span>)}
            </div>
          </>
        )}
      </div>
    </Panel>
    </div>
  );
}
