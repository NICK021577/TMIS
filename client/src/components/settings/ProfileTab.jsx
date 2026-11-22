import { useState } from 'react';
import { AgencyMark, Button, Callout, Field, Panel, PanelTitle, inputCls, textareaCls } from '../ui';
import { useStore } from '../../hooks/useStore';
import { SaveBar } from './SettingsKit';

const MAX_SHORT = 10;

/** How the profile reads on the About page and the participant About tab. */
function ProfilePreview({ profile }) {
  const values = profile.values.split(';').map((v) => v.trim()).filter(Boolean);
  return (
    <div className="glass-inset rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <AgencyMark size={48} />
        <div className="min-w-0 leading-tight">
          <strong className="block truncate text-[14px] font-medium text-ink-950">{profile.name || 'Agency name'}</strong>
          <small className="text-xs text-ink-500">{profile.shortName || '—'} · Government agency</small>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div>
          <h3 className="mb-1 text-xs text-ink-400">Mission</h3>
          <p className="text-[13px] leading-relaxed text-ink-700">{profile.mission || '—'}</p>
        </div>
        <div>
          <h3 className="mb-1 text-xs text-ink-400">Vision</h3>
          <p className="text-[13px] leading-relaxed text-ink-700">{profile.vision || '—'}</p>
        </div>
      </div>
      {values.length > 0 && (
        <>
          <h3 className="mb-2 mt-5 text-xs text-ink-400">Core values</h3>
          <div className="flex flex-wrap gap-1.5">
            {values.map((v) => <span key={v} className="rounded-full bg-white/80 px-2.5 py-1 text-xs text-brand-800 ring-1 ring-black/5">{v}</span>)}
          </div>
        </>
      )}
      <h3 className="mb-1 mt-5 text-xs text-ink-400">Mandate / About</h3>
      <p className="text-[13px] leading-relaxed text-ink-700">{profile.mandate || '—'}</p>
    </div>
  );
}

/**
 * Agency profile: one record, two views (staff About page + participant About tab).
 * Opens on the preview; Edit swaps it for the form until the changes are saved or cancelled.
 */
export default function ProfileTab({ readOnly, notify }) {
  const { profile, setProfile } = useStore();
  const [editing, setEditing] = useState(false);
  const [f, setF] = useState(profile);
  const set = (patch) => setF((p) => ({ ...p, ...patch }));
  const dirty = JSON.stringify(f) !== JSON.stringify(profile);

  const startEdit = () => { setF(profile); setEditing(true); };
  const cancel = () => { setF(profile); setEditing(false); };
  const save = () => {
    setProfile(f);
    setEditing(false);
    notify?.('Profile saved. The About page and the participant About tab are updated');
  };

  if (!editing) {
    return (
      <Panel>
        <PanelTitle title="Agency profile" subtitle="How it appears on the About page and the participant About tab">
          {!readOnly && <Button size="sm" icon="edit" onClick={startEdit}>Edit profile</Button>}
        </PanelTitle>
        {readOnly && <div className="mb-4"><Callout tone="info" icon="lock">Only Agency Administrators can edit the agency profile.</Callout></div>}
        <ProfilePreview profile={profile} />
      </Panel>
    );
  }

  return (
    <Panel>
      <PanelTitle title="Edit agency profile" subtitle="One record, two views. Staff read it on the About page and participants read it on the mobile About tab.">
        <Button size="sm" variant="secondary" icon="eye" onClick={cancel}>Back to preview</Button>
      </PanelTitle>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
          <Field label="Display name (full)"><input className={inputCls} value={f.name} onChange={(e) => set({ name: e.target.value })} autoFocus /></Field>
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
      </div>

      <SaveBar dirty={dirty} canSave={!!f.name.trim() && !!f.shortName.trim()} label="Save profile" onDiscard={cancel} onSave={save} />
    </Panel>
  );
}
