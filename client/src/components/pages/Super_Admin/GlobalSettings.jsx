import { useConfirm } from '../../modals/confirmContext';
import { useRef, useState } from 'react';
import { PageWrapper, PageHeader } from '../../layout/PageWrapper';
import { ActionIcon, Button, Icon, Modal, Panel, PanelTitle, Switch, inputCls, textareaCls } from '../../ui';
import { usePlatform } from '../../../hooks/usePlatform';
import { SEED_SETTINGS } from '../../../data/platformData';
import { ORG_TYPES } from '../../../lib/verification';
import { SaveBar, SettingRow, SettingsLayout, same, useDraft } from '../../settings/SettingsKit';

/* ───────────── shared pieces ───────────── */

const selectCls = 'glass-input h-10 min-w-[160px] rounded-xl px-3.5 text-[13px] text-ink-950';

function ChipEditor({ items, onChange, placeholder }) {
  const [draft, setDraft] = useState('');
  const add = (e) => {
    e.preventDefault();
    const v = draft.trim();
    if (!v || items.some((i) => i.toLowerCase() === v.toLowerCase())) return;
    onChange([...items, v]);
    setDraft('');
  };
  return (
    <div>
      <ul className="mb-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item} className="glass-inset inline-flex items-center gap-1.5 rounded-full py-1.5 pl-3.5 pr-1.5 text-[13px] font-medium text-ink-800">
            {item}
            <button type="button" onClick={() => onChange(items.filter((i) => i !== item))} aria-label={`Remove ${item}`}
              className="grid h-5 w-5 place-items-center rounded-full text-ink-500 transition-colors hover:bg-red-100 hover:text-danger"><Icon name="close" size={12} /></button>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="flex gap-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={placeholder} aria-label={placeholder} className={`${inputCls} min-w-0 flex-1`} />
        <Button type="submit" size="sm" icon="plus" disabled={!draft.trim()}>Add</Button>
      </form>
    </div>
  );
}

/* ───────────── 1 · Registration requirements ───────────── */

function RegistrationSection() {
  const { settings, updateSettings, notify } = usePlatform();
  const { draft, setDraft, dirty, reset } = useDraft(settings.registration);
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const types = [['pdf', 'PDF'], ['jpg', 'JPG'], ['png', 'PNG']];
  const noType = !Object.values(draft.fileTypes).some(Boolean);
  const save = () => { updateSettings({ registration: draft }, 'Registration requirements'); notify?.('Registration requirements saved'); };

  return (
    <div className="space-y-4">
      <Panel>
        <PanelTitle title="Verification documents by organization type" subtitle="The Documents step of Register your agency adapts to the type an applicant picks. These rules are fixed by the verification policy." />
        <div className="space-y-3">
          {ORG_TYPES.map((t) => (
            <div key={t.value} className="glass-inset rounded-2xl p-4">
              <div className="mb-2 flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-brand-600"><Icon name={t.icon} size={15} /></span>
                <div><strong className="block text-[13px] font-medium text-ink-950">{t.value}</strong><small className="text-xs text-ink-500">{t.desc}</small></div>
              </div>
              <dl className="grid gap-x-6 gap-y-2 text-[13px] sm:grid-cols-2">
                <div><dt className="text-[11px] text-ink-500">1 · Authority to represent (required)</dt><dd className="text-ink-900">{t.authority.options.join(' or ')}</dd></div>
                <div><dt className="text-[11px] text-ink-500">2 · Proof of entity (required)</dt>
                  <dd className="text-ink-900">{t.entity.options.join(', ')}{t.entity.autoDomain && <span className="mt-0.5 block text-xs text-emerald-700">Auto-verified for {t.entity.autoLabel} emails</span>}</dd></div>
                <div><dt className="text-[11px] text-ink-500">3 · Valid ID of contact person (required)</dt><dd className="text-ink-900">Agency / employee ID or government-issued ID</dd></div>
                <div><dt className="text-[11px] text-ink-500">4 · MOA or partnership document</dt><dd className="text-ink-900">Optional, so legal sign-off never blocks onboarding</dd></div>
              </dl>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ink-500">Verification gives UniFyle an audit trail under the Data Privacy Act of 2012 before an Agency Administrator can manage trainee personal data. Until approval an agency can explore and draft; live enrollment and certificates stay locked.</p>
      </Panel>

      <Panel>
        <PanelTitle title="Uploads" subtitle="Rules applied to every attached file" />
        <SettingRow title="Accepted file types" desc="Applicants can only attach these formats.">
          <div className="flex gap-2">
            {types.map(([k, label]) => (
              <button key={k} type="button" aria-pressed={draft.fileTypes[k]} onClick={() => set({ fileTypes: { ...draft.fileTypes, [k]: !draft.fileTypes[k] } })}
                className={`rounded-full border px-4 py-1.5 text-[13px] transition-colors ${draft.fileTypes[k] ? 'border-brand-600 bg-brand-50 font-medium text-brand-800' : 'border-ink-200 bg-white text-ink-500 hover:border-ink-300'}`}>{label}</button>
            ))}
          </div>
        </SettingRow>
        {noType && <p className="-mt-1 mb-2 flex items-center gap-1.5 text-xs text-danger"><Icon name="alert" size={13} />Pick at least one file type.</p>}
        <SettingRow title="Maximum file size" desc="Per file. Larger files are rejected with a message.">
          <select className={selectCls} value={draft.maxMb} onChange={(e) => set({ maxMb: Number(e.target.value) })} aria-label="Maximum file size">
            {[2, 5, 10, 20].map((n) => <option key={n} value={n}>{n} MB</option>)}
          </select>
        </SettingRow>
        <SaveBar dirty={dirty && !noType} onSave={save} onDiscard={reset} />
      </Panel>
    </div>
  );
}

/* ───────────── 2 · Email templates ───────────── */

const TEMPLATES = [
  { id: 'approved',   label: 'Application approved', when: 'Sent when you approve an application', vars: ['agency_name', 'contact_name', 'sign_in_link'] },
  { id: 'rejected',   label: 'Application rejected', when: 'Sent when you reject an application',  vars: ['agency_name', 'contact_name', 'reason'] },
  { id: 'needsInfo',  label: 'More information needed', when: 'Sent when you request info',       vars: ['agency_name', 'contact_name', 'reason'] },
  { id: 'invitation', label: 'Invitation to join',   when: 'Sent when someone is invited to an agency', vars: ['agency_name', 'contact_name', 'sign_in_link'] },
];
const SAMPLE = { agency_name: 'Mindanao Abaca Development Office', contact_name: 'Ramon Iligan', reason: 'The authorization letter is unsigned.', sign_in_link: 'https://unifyle.app/sign-in' };
const fill = (text) => text.replace(/\{\{(\w+)\}\}/g, (_, k) => SAMPLE[k] ?? `{{${k}}}`);

function EmailSection() {
  const { settings, updateSettings, notify } = usePlatform();
  const { draft, setDraft, dirty, reset } = useDraft(settings.emails);
  const [id, setId] = useState('approved');
  const bodyRef = useRef(null);
  const tpl = TEMPLATES.find((t) => t.id === id);
  const cur = draft[id];
  const patch = (p) => setDraft((d) => ({ ...d, [id]: { ...d[id], ...p } }));

  const insert = (v) => {
    const el = bodyRef.current;
    const token = `{{${v}}}`;
    const at = el ? el.selectionStart : cur.body.length;
    patch({ body: cur.body.slice(0, at) + token + cur.body.slice(el ? el.selectionEnd : at) });
    requestAnimationFrame(() => { el?.focus(); el?.setSelectionRange(at + token.length, at + token.length); });
  };

  return (
    <Panel>
      <PanelTitle title="Email templates" subtitle="The messages UniFyle sends on your behalf. Placeholders are filled in automatically." />
      <div className="glass-inset mb-5 inline-flex flex-wrap rounded-full p-0.5" role="tablist">
        {TEMPLATES.map((t) => (
          <button key={t.id} role="tab" aria-selected={id === t.id} onClick={() => setId(t.id)}
            className={`rounded-full px-4 py-1.5 text-xs transition-colors ${id === t.id ? 'bg-white font-medium text-ink-950 shadow-sm' : 'text-ink-500 hover:text-ink-950'}`}>{t.label}{!same(draft[t.id], settings.emails[t.id]) && <i className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />}</button>
        ))}
      </div>
      <p className="mb-4 text-xs text-ink-500">{tpl.when}.</p>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="space-y-4">
          <label className="block space-y-1.5"><span className="text-xs text-ink-600">Subject</span>
            <input className={inputCls} value={cur.subject} onChange={(e) => patch({ subject: e.target.value })} /></label>
          <label className="block space-y-1.5"><span className="text-xs text-ink-600">Message</span>
            <textarea ref={bodyRef} rows={11} className={`${textareaCls} leading-relaxed`} value={cur.body} onChange={(e) => patch({ body: e.target.value })} /></label>
          <div>
            <span className="text-xs text-ink-600">Insert a placeholder</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {tpl.vars.map((v) => (
                <button key={v} type="button" onClick={() => insert(v)} className="rounded-full bg-brand-100/70 px-3 py-1 font-mono text-[11px] text-brand-800 transition-colors hover:bg-brand-100">{`{{${v}}}`}</button>
              ))}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => patch(SEED_SETTINGS.emails[id])}>Reset to default</Button>
        </div>

        <div>
          <span className="text-xs text-ink-600">Preview with sample data</span>
          <div className="mt-2 overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm">
            <div className="border-b border-ink-100 bg-ink-100/50 px-5 py-3">
              <small className="block text-[11px] text-ink-500">Subject</small>
              <strong className="text-[13px] font-medium text-ink-950">{fill(cur.subject)}</strong>
            </div>
            <p className="whitespace-pre-wrap px-5 py-4 text-[13px] leading-relaxed text-ink-800">{fill(cur.body)}</p>
          </div>
        </div>
      </div>
      <SaveBar dirty={dirty} onDiscard={reset} onSave={() => { updateSettings({ emails: draft }, 'Email templates'); notify?.('Email templates saved'); }} />
    </Panel>
  );
}

/* ───────────── 3 · Security ───────────── */

function SecuritySection() {
  const { settings, updateSettings, notify } = usePlatform();
  const { draft, setDraft, dirty, reset } = useDraft(settings.security);
  const [confirming, setConfirming] = useState(false);
  const set = (p) => setDraft((d) => ({ ...d, ...p }));
  const num = (k) => (e) => set({ [k]: Number(e.target.value) });

  return (
    <Panel>
      <PanelTitle title="Security" subtitle="Applies to every agency and every account on the platform" />
      <SettingRow title="Minimum password length" desc="Shorter passwords are refused when an account is created or changed.">
        <select className={selectCls} value={draft.minLength} onChange={num('minLength')} aria-label="Minimum password length">{[8, 10, 12, 14].map((n) => <option key={n} value={n}>{n} characters</option>)}</select>
      </SettingRow>
      <SettingRow title="Require a number"><Switch checked={draft.requireNumber} onChange={(v) => set({ requireNumber: v })} label="Require a number" /></SettingRow>
      <SettingRow title="Require a symbol" desc="For example ! ? # %"><Switch checked={draft.requireSymbol} onChange={(v) => set({ requireSymbol: v })} label="Require a symbol" /></SettingRow>
      <SettingRow title="Two-factor sign-in for administrators" desc="Agency Administrators and Super Administrators confirm each sign-in with a code.">
        <Switch checked={draft.require2fa} onChange={(v) => set({ require2fa: v })} label="Two-factor sign-in" />
      </SettingRow>
      <SettingRow title="Session timeout" desc="People are signed out after this long without activity.">
        <select className={selectCls} value={draft.sessionMinutes} onChange={num('sessionMinutes')} aria-label="Session timeout">{[15, 30, 60, 120].map((n) => <option key={n} value={n}>{n} minutes</option>)}</select>
      </SettingRow>
      <SettingRow title="Lock after failed sign-ins" desc="Protects accounts from password guessing.">
        <select className={selectCls} value={draft.maxAttempts} onChange={num('maxAttempts')} aria-label="Failed attempts before lockout">{[3, 5, 10].map((n) => <option key={n} value={n}>{n} attempts</option>)}</select>
      </SettingRow>
      <SettingRow title="Lockout length">
        <select className={selectCls} value={draft.lockoutMinutes} onChange={num('lockoutMinutes')} aria-label="Lockout length">{[5, 15, 30, 60].map((n) => <option key={n} value={n}>{n} minutes</option>)}</select>
      </SettingRow>
      <SaveBar dirty={dirty} onDiscard={reset} onSave={() => setConfirming(true)} />

      {confirming && (
        <Modal title="Apply security changes?" subtitle="These rules affect everyone on the platform." onClose={() => setConfirming(false)} width={460}
          footer={<><span /><div className="flex gap-2"><Button variant="secondary" onClick={() => setConfirming(false)}>Cancel</Button><Button onClick={() => { updateSettings({ security: draft }, 'Security'); notify?.('Security settings applied'); setConfirming(false); }}>Apply</Button></div></>}>
          <p className="pb-2 text-[13px] leading-relaxed text-ink-600">People may be asked to sign in again or change their password the next time they use UniFyle. The change is recorded in the audit log.</p>
        </Modal>
      )}
    </Panel>
  );
}

/* ───────────── 4 · New-agency defaults ───────────── */

function ChipCard({ title, subtitle, field }) {
  const { settings, updateSettings } = usePlatform();
  const confirm = useConfirm();
  return (
    <Panel>
      <PanelTitle title={title} subtitle={subtitle} />
      <ChipEditor items={settings[field]} placeholder={`Add to ${title.toLowerCase()}`}
        onChange={async (items) => {
          const removed = settings[field].find((i) => !items.includes(i));
          if (removed && !(await confirm({ tone: 'danger', title: `Remove “${removed}”?`, message: `New agencies will no longer start with it in ${title.toLowerCase()}.`, detail: 'Agencies that already have it keep their copy.', confirmLabel: 'Remove' }))) return;
          updateSettings({ [field]: items }, `${title} updated`);
        }} />
    </Panel>
  );
}

function DefaultsSection() {
  const { settings, updateSettings, notify } = usePlatform();
  const { draft, setDraft, dirty, reset } = useDraft(settings.certificate);
  return (
    <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
      <ChipCard title="Activity types" subtitle="Shown when creating an activity" field="activityTypes" />
      <ChipCard title="Document types" subtitle="Agencies pick which ones are required" field="documentTypes" />
      <ChipCard title="Budget categories" subtitle="Used by every activity budget" field="budgetCategories" />
      <Panel>
        <PanelTitle title="Certificate defaults" subtitle="Starting rules for new activities" />
        <SettingRow title="Minimum attendance" desc={`${draft.minAttendance}% of sessions`}>
          <input type="range" min="50" max="100" step="5" value={draft.minAttendance} onChange={(e) => setDraft({ ...draft, minAttendance: Number(e.target.value) })} aria-label="Minimum attendance" className="w-40 accent-brand-600" />
        </SettingRow>
        <SettingRow title="Require session feedback"><Switch checked={draft.requireFeedback} onChange={(v) => setDraft({ ...draft, requireFeedback: v })} label="Require session feedback" /></SettingRow>
        <SettingRow title="Require a reentry plan"><Switch checked={draft.requireReentryPlan} onChange={(v) => setDraft({ ...draft, requireReentryPlan: v })} label="Require a reentry plan" /></SettingRow>
        <SaveBar dirty={dirty} onDiscard={reset} onSave={() => { updateSettings({ certificate: draft }, 'Certificate defaults'); notify?.('Certificate defaults saved'); }} />
      </Panel>
    </div>
  );
}

/* ───────────── page ───────────── */

const SECTIONS = [
  { id: 'registration', label: 'Registration', icon: 'file',     desc: 'Documents and uploads', Body: RegistrationSection },
  { id: 'emails',       label: 'Email templates', icon: 'mail',  desc: 'Messages we send',      Body: EmailSection },
  { id: 'security',     label: 'Security',     icon: 'shield',   desc: 'Passwords and sessions', Body: SecuritySection },
  { id: 'defaults',     label: 'New-agency defaults', icon: 'sparkle', desc: 'Starting lists',   Body: DefaultsSection },
];

export default function GlobalSettings() {
  const [id, setId] = useState('registration');
  const current = SECTIONS.find((s) => s.id === id);
  const Body = current.Body;

  return (
    <PageWrapper>
      <PageHeader eyebrow="Management" title="Global settings" subtitle="Rules and defaults for the whole platform. Agencies manage their own data; these settings never touch it." />

      <SettingsLayout sections={SECTIONS} id={id} onChange={setId}><Body /></SettingsLayout>
    </PageWrapper>
  );
}
