import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Logo } from '../../ui';
import { FILE_RULES, ORG_TYPES, docSlots } from '../../../lib/verification';

/* ───────────── constants ───────────── */

const inputCls =
  'h-12 w-full rounded-xl border border-ink-200 bg-white px-4 text-sm text-ink-950 shadow-[0_1px_2px_rgba(16,24,40,0.04)] outline-none transition placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/10';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^(09|\+639)\d{9}$/;
const NAME_PATTERN = /^[\p{L}][\p{L}\s.'-]*$/u;

const { maxMb: MAX_MB, accept: ACCEPT, ext: ACCEPT_EXT } = FILE_RULES;

const STEPS = [
  { id: 'agency',    label: 'Agency' },
  { id: 'contact',   label: 'Contact person' },
  { id: 'documents', label: 'Documents' },
  { id: 'review',    label: 'Review' },
];

const REGIONS = {
  Luzon:    ['NCR', 'CAR', 'Region I', 'Region II', 'Region III', 'Region IV-A', 'MIMAROPA', 'Region V'],
  Visayas:  ['Region VI', 'Region VII', 'Region VIII'],
  Mindanao: ['Region IX', 'Region X', 'Region XI', 'Region XII', 'Region XIII', 'BARMM'],
};

const EMPTY = {
  agency: '', acronym: '', type: '', region: '',
  firstName: '', middleName: '', lastName: '',
  email: '', phone: '', confirm: false,
};

const fullName = (f) => [f.firstName, f.middleName, f.lastName].map((s) => s.trim()).filter(Boolean).join(' ');
const formatSize = (b) => (b < 1048576 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1048576).toFixed(1)} MB`);

/* ───────────── small pieces ───────────── */

function Field({ id, label, optional, error, hint, children }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="flex items-baseline justify-between text-[13px] font-medium text-ink-800">
        {label}
        {optional && <span className="text-xs font-normal text-ink-400">Optional</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-ink-500">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-xs text-danger">
          <Icon name="alert" size={13} />{error}
        </p>
      )}
    </div>
  );
}

/** Vertical step list: check when done, ring when current, number when upcoming. */
function Stepper({ current, onJump }) {
  return (
    <nav aria-label="Application steps" className="space-y-1">
      <p className="mb-5 text-sm text-ink-500">Agency application</p>
      <ol>
        {STEPS.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={s.id} className="relative">
              {i < STEPS.length - 1 && (
                <span aria-hidden className={`absolute left-[11px] top-7 h-6 w-px ${done ? 'bg-emerald-300' : 'bg-ink-200'}`} />
              )}
              <button
                type="button"
                disabled={!done}
                onClick={() => onJump(i)}
                aria-current={active ? 'step' : undefined}
                className="flex items-center gap-4 py-1.5 text-left disabled:cursor-default"
              >
                <span
                  className={`grid h-6 w-6 flex-shrink-0 place-items-center rounded-full text-[11px] font-medium transition-colors ${
                    done ? 'bg-emerald-500 text-white'
                    : active ? 'border-2 border-brand-600 bg-white text-brand-700 shadow-[0_0_0_4px_rgba(59,114,230,0.14)]'
                    : 'border border-ink-300 bg-white text-ink-500'
                  }`}
                >
                  {done ? <Icon name="check" size={13} /> : i + 1}
                </span>
                <span className={`text-[15px] ${active ? 'font-medium text-brand-700' : done ? 'text-ink-700' : 'text-ink-500'}`}>{s.label}</span>
              </button>
              {i < STEPS.length - 1 && <span className="block h-6" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Selectable card — radio behaviour, used for agency type. */
function ChoiceCard({ checked, icon, title, desc, onSelect }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={`group flex items-start gap-3.5 rounded-2xl border bg-white p-4 text-left transition-all ${
        checked ? 'border-brand-500 ring-2 ring-brand-500/25 shadow-[0_6px_18px_rgba(59,114,230,0.12)]' : 'border-ink-200 hover:border-ink-300 hover:shadow-sm'
      }`}
    >
      <span className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl transition-colors ${checked ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-600 group-hover:bg-brand-50'}`}>
        <Icon name={icon} size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block text-sm font-medium text-ink-950">{title}</strong>
        <small className="mt-0.5 block text-xs leading-snug text-ink-500">{desc}</small>
      </span>
      <span className={`mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full border transition-colors ${checked ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink-300'}`}>
        {checked && <Icon name="check" size={12} />}
      </span>
    </button>
  );
}

/** One supporting-document slot: pick which document it is, then click or drag a file onto the card. */
function DocUpload({ doc, file, kind, onKind, error, onPick, onClear }) {
  const ref = useRef(null);
  const [over, setOver] = useState(false);
  const optional = !doc.required && !doc.auto;

  const header = (
    <div className="flex items-center gap-2">
      <span className="grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-ink-100 text-[11px] font-medium text-ink-600">{doc.n}</span>
      <strong className="text-[13px] font-medium text-ink-950">{doc.short}</strong>
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${optional ? 'bg-ink-100 text-ink-500' : 'bg-brand-50 text-brand-700'}`}>{optional ? 'Optional' : 'Required'}</span>
    </div>
  );

  if (doc.auto) {
    return (
      <section className="space-y-2">
        {header}
        <div className="flex items-center gap-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
          <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-white text-emerald-600 shadow-sm"><Icon name="check" size={19} /></span>
          <span className="min-w-0 flex-1">
            <strong className="block text-sm font-medium text-ink-950">Verified by your official email</strong>
            <small className="text-xs text-ink-600">Your {doc.autoLabel} address stands in for the {doc.label.toLowerCase()}. We’ll confirm it when you verify your email.</small>
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-2.5">
      {header}
      {doc.options && doc.options.length > 1 && (
        <div role="radiogroup" aria-label={`Which document for ${doc.short}`} className="flex flex-wrap gap-1.5">
          {doc.options.map((o) => (
            <button key={o} type="button" role="radio" aria-checked={kind === o} onClick={() => onKind(doc.id, o)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${kind === o ? 'border-brand-500 bg-brand-50 font-medium text-brand-800' : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300'}`}>{o}</button>
          ))}
        </div>
      )}
      <input
        ref={ref} id={doc.id} type="file" accept={ACCEPT} className="sr-only"
        onChange={(e) => { onPick(doc.id, e.target.files?.[0]); e.target.value = ''; }}
        aria-invalid={!!error} aria-describedby={error ? `${doc.id}-error` : undefined}
      />
      {file ? (
        <div className="flex items-center gap-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
          <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-white text-emerald-600 shadow-sm"><Icon name="file" size={19} /></span>
          <span className="min-w-0 flex-1">
            <small className="block text-[11px] font-medium text-emerald-700">{kind || doc.label}</small>
            <strong className="block truncate text-sm font-medium text-ink-950">{file.name}</strong>
            <small className="text-xs text-ink-500">{formatSize(file.size)}</small>
          </span>
          <button type="button" onClick={() => ref.current?.click()} className="text-xs font-medium text-brand-700 hover:text-brand-900">Replace</button>
          <button type="button" onClick={() => onClear(doc.id)} aria-label={`Remove ${doc.short}`} className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-white hover:text-ink-950">
            <Icon name="close" size={15} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); onPick(doc.id, e.dataTransfer.files?.[0]); }}
          aria-invalid={!!error}
          className={`flex w-full items-center gap-3.5 rounded-2xl border-2 border-dashed p-4 text-left transition-colors ${
            over ? 'border-brand-500 bg-brand-50' : error ? 'border-danger/60 bg-red-50/40' : 'border-ink-200 bg-white hover:border-brand-400 hover:bg-brand-50/40'
          }`}
        >
          <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-ink-100 text-ink-600"><Icon name="upload" size={19} /></span>
          <span className="min-w-0 flex-1">
            <strong className="block text-sm font-medium text-ink-950">{doc.label}</strong>
            <small className="mt-0.5 block text-xs text-ink-500">{doc.hint}</small>
          </span>
          <span className="hidden rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 sm:block">Choose file</span>
        </button>
      )}
      {error && (
        <p id={`${doc.id}-error`} className="flex items-center gap-1.5 text-xs text-danger">
          <Icon name="alert" size={13} />{error}
        </p>
      )}
    </section>
  );
}

function ReviewCard({ title, onEdit, children }) {
  return (
    <section className="rounded-2xl border border-ink-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[13px] font-medium text-ink-950">{title}</h3>
        <button type="button" onClick={onEdit} className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-900"><Icon name="edit" size={13} />Edit</button>
      </div>
      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">{children}</dl>
    </section>
  );
}
const Row = ({ k, v }) => (
  <div className="min-w-0">
    <dt className="text-[11px] text-ink-500">{k}</dt>
    <dd className="truncate text-sm text-ink-950">{v || '—'}</dd>
  </div>
);

/* ───────────── page ───────────── */

export default function RegisterAgency({ notify }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [files, setFiles] = useState({});
  const [kinds, setKinds] = useState({});   // which document was uploaded per slot
  const [errors, setErrors] = useState({});
  const [ref, setRef] = useState(null);

  const set = (name, value) => {
    if (name === 'type') { setKinds({}); setFiles({}); }   // the documents depend on the organization type
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: undefined }));
  };
  const onInput = (e) => set(e.target.name, e.target.value);

  function pickFile(id, file) {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    let err;
    if (!ACCEPT_EXT.includes(ext)) err = 'Use a PDF, JPG or PNG file.';
    else if (file.size > MAX_MB * 1048576) err = `File is larger than ${MAX_MB} MB.`;
    if (err) { setErrors((p) => ({ ...p, [id]: err })); return; }
    setFiles((p) => ({ ...p, [id]: file }));
    setErrors((p) => ({ ...p, [id]: undefined }));
  }
  const slots = docSlots(form.type, form.email);
  const kindOf = (slot) => kinds[slot.id] ?? slot.options?.[0];
  const clearFile = (id) => setFiles((p) => { const n = { ...p }; delete n[id]; return n; });

  function validate(i) {
    const e = {};
    if (i === 0) {
      if (!form.agency.trim()) e.agency = 'Enter the agency name.';
      if (!form.acronym.trim()) e.acronym = 'Enter the acronym.';
      if (!form.type) e.type = 'Choose the type of organization.';
      if (!form.region) e.region = 'Choose your region.';
    }
    if (i === 1) {
      if (!form.firstName.trim()) e.firstName = 'Enter a first name.';
      else if (!NAME_PATTERN.test(form.firstName.trim())) e.firstName = 'Letters only.';
      if (form.middleName.trim() && !NAME_PATTERN.test(form.middleName.trim())) e.middleName = 'Letters only.';
      if (!form.lastName.trim()) e.lastName = 'Enter a last name.';
      else if (!NAME_PATTERN.test(form.lastName.trim())) e.lastName = 'Letters only.';
      if (!form.email.trim()) e.email = 'Enter an email address.';
      else if (!EMAIL_PATTERN.test(form.email.trim())) e.email = 'That email doesn’t look right.';
      const phone = form.phone.replace(/[\s-]/g, '');
      if (!phone) e.phone = 'Enter a contact number.';
      else if (!PHONE_PATTERN.test(phone)) e.phone = 'Use 09XX XXX XXXX or +63 9XX XXX XXXX.';
    }
    if (i === 2) slots.forEach((d) => { if (d.required && !d.auto && !files[d.id]) e[d.id] = `${d.short} is required. Attach a file.`; });
    if (i === 3 && !form.confirm) e.confirm = 'Please confirm before submitting.';
    return e;
  }

  function next() {
    const e = validate(step);
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) { document.getElementById(first)?.focus?.(); return; }
    if (step < STEPS.length - 1) { setStep(step + 1); window.scrollTo({ top: 0 }); return; }
    // TODO: send as multipart/form-data to POST /api/applications
    setRef(`APP-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`);
    notify?.('Application submitted');
  }
  const back = () => { setErrors({}); setStep((s) => Math.max(0, s - 1)); };
  const jump = (i) => { setErrors({}); setStep(i); };

  const p = (name) => ({
    id: name, name, value: form[name], onChange: onInput, className: inputCls,
    'aria-invalid': !!errors[name], 'aria-describedby': errors[name] ? `${name}-error` : undefined,
  });

  /* ── submitted ── */
  if (ref) {
    return (
      <Shell onSignIn={() => navigate('/')}>
        <div className="mx-auto w-full max-w-[600px] animate-rise px-5 py-24 text-center sm:px-8 lg:px-10">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600"><Icon name="check" size={30} /></span>
          <h1 className="mt-6 text-[32px] font-semibold leading-tight tracking-[-0.8px] text-ink-950">Application submitted</h1>
          <p className="mx-auto mt-3 max-w-[440px] text-[15px] text-ink-600">
            We’ll email <strong className="font-medium text-ink-900">{form.email.trim()}</strong> as soon as a UniFyle administrator reviews it.
          </p>
          <div className="mx-auto mt-8 inline-flex items-center gap-3 rounded-full border border-ink-200 bg-white px-5 py-2.5 text-sm">
            <span className="text-ink-500">Reference</span><strong className="font-medium tabular-nums text-ink-950">{ref}</strong>
          </div>
          <ol className="mx-auto mt-10 grid max-w-[460px] gap-4 text-left">
            {[['Pending verification', 'We received your application. You can explore your workspace and draft activities while we review.', true], ['Under review', 'An administrator checks your documents.', false], ['Approved', 'Live trainee enrollment and certificate issuance unlock, and you become the Agency Administrator.', false]].map(([t, d, on]) => (
              <li key={t} className="flex items-start gap-3.5">
                <span className={`mt-0.5 grid h-6 w-6 flex-shrink-0 place-items-center rounded-full text-[11px] ${on ? 'bg-emerald-500 text-white' : 'border border-ink-300 bg-white text-ink-400'}`}>{on ? <Icon name="check" size={13} /> : ''}</span>
                <span><strong className="block text-sm font-medium text-ink-950">{t}</strong><small className="text-[13px] text-ink-500">{d}</small></span>
              </li>
            ))}
          </ol>
          <button onClick={() => navigate('/')} className="mt-10 h-12 rounded-xl bg-brand-700 px-8 text-sm font-medium text-white shadow-[0_10px_24px_rgba(47,95,204,0.3)] transition hover:bg-brand-800">Back to sign in</button>
        </div>
      </Shell>
    );
  }

  const titles = [
    ['Tell us about your agency', 'This is how your agency will appear to its staff and participants.'],
    ['Who should we contact?', 'This person becomes the first Agency Administrator once you’re approved.'],
    ['Upload your supporting documents', `What we ask for depends on your organization type. PDF, JPG or PNG, up to ${MAX_MB} MB each.`],
    ['Review your application', 'Check everything below. You can still change any section.'],
  ][step];

  return (
    <Shell onSignIn={() => navigate('/')} stepper={<Stepper current={step} onJump={jump} />}>
      <div className="mx-auto w-full max-w-[600px] px-5 py-24 sm:px-8 lg:px-10 xl:py-16">
        {/* mobile progress */}
        <div className="mb-8 xl:hidden">
          <div className="mb-2 flex items-center justify-between text-xs text-ink-500">
            <span>Step {step + 1} of {STEPS.length}</span><span className="font-medium text-brand-700">{STEPS[step].label}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-ink-200"><div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>
        </div>

        <div key={step} className="animate-rise">
          <h1 className="text-[32px] font-semibold leading-[1.15] tracking-[-0.9px] text-ink-950">{titles[0]}</h1>
          <p className="mb-9 mt-3 text-[15px] leading-relaxed text-ink-600">{titles[1]}</p>

          <form onSubmit={(e) => { e.preventDefault(); next(); }} noValidate className="space-y-6">
            {step === 0 && (
              <>
                <Field id="agency" label="Agency name" error={errors.agency}>
                  <input {...p('agency')} placeholder="e.g. Philippine Rubber Research Institute" autoFocus />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="acronym" label="Acronym" error={errors.acronym}>
                    <input {...p('acronym')} placeholder="PRRI" className={`${inputCls} uppercase`} />
                  </Field>
                  <Field id="region" label="Region" error={errors.region}>
                    <select {...p('region')} className={`${inputCls} select-arrow ${form.region ? '' : 'text-ink-400'}`}>
                      <option value="" disabled>Select a region</option>
                      {Object.entries(REGIONS).map(([group, list]) => (
                        <optgroup key={group} label={group}>
                          {list.map((r) => <option key={r} value={r}>{r}</option>)}
                        </optgroup>
                      ))}
                    </select>
                  </Field>
                </div>

                <div className="space-y-2" id="type">
                  <span className="block text-[13px] font-medium text-ink-800">What type of organization is it?</span>
                  <div role="radiogroup" aria-label="Organization type" className="grid gap-3 sm:grid-cols-2">
                    {ORG_TYPES.map((t) => (
                      <ChoiceCard key={t.value} checked={form.type === t.value} icon={t.icon} title={t.value} desc={t.desc} onSelect={() => set('type', t.value)} />
                    ))}
                  </div>
                  {errors.type && <p className="flex items-center gap-1.5 text-xs text-danger"><Icon name="alert" size={13} />{errors.type}</p>}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="firstName" label="First name" error={errors.firstName}><input {...p('firstName')} autoComplete="given-name" placeholder="Juan" autoFocus /></Field>
                  <Field id="middleName" label="Middle name" optional error={errors.middleName}><input {...p('middleName')} autoComplete="additional-name" placeholder="Santos" /></Field>
                </div>
                <Field id="lastName" label="Last name" error={errors.lastName}><input {...p('lastName')} autoComplete="family-name" placeholder="Dela Cruz" /></Field>
                <Field id="email" label="Email" error={errors.email} hint="We’ll send status updates here.">
                  <div className="relative">
                    <Icon name="mail" size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input {...p('email')} type="email" inputMode="email" autoComplete="email" placeholder="name@agency.gov.ph" className={`${inputCls} pl-11`} />
                  </div>
                </Field>
                <Field id="phone" label="Contact number" error={errors.phone}>
                  <div className="relative">
                    <Icon name="phone" size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input {...p('phone')} type="tel" inputMode="tel" autoComplete="tel" placeholder="09XX XXX XXXX" className={`${inputCls} pl-11`} />
                  </div>
                </Field>
              </>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-start gap-3 rounded-2xl bg-brand-50/70 p-4 ring-1 ring-brand-100">
                  <Icon name="lock" size={17} className="mt-0.5 flex-shrink-0 text-brand-700" />
                  <p className="text-[13px] leading-relaxed text-ink-700">
                    <strong className="font-medium text-ink-950">{form.type}: </strong>
                    we verify every organization to keep an audit trail under the Data Privacy Act of 2012, before an administrator can manage trainee personal data.
                  </p>
                </div>
                {slots.map((d) => <DocUpload key={d.id} doc={d} file={files[d.id]} kind={kindOf(d)} onKind={(id, v) => setKinds((k) => ({ ...k, [id]: v }))} error={errors[d.id]} onPick={pickFile} onClear={clearFile} />)}
              </div>
            )}

            {step === 3 && (
              <>
                <ReviewCard title="Agency" onEdit={() => jump(0)}>
                  <Row k="Name" v={form.agency} /><Row k="Acronym" v={form.acronym.toUpperCase()} />
                  <Row k="Type" v={form.type} /><Row k="Region" v={form.region} />
                </ReviewCard>
                <ReviewCard title="Contact person" onEdit={() => jump(1)}>
                  <Row k="Name" v={fullName(form)} /><Row k="Contact number" v={form.phone} />
                  <Row k="Email" v={form.email} />
                </ReviewCard>
                <ReviewCard title="Documents" onEdit={() => jump(2)}>
                  {slots.map((d) => <Row key={d.id} k={d.short} v={d.auto ? `Verified by ${d.autoLabel} email` : files[d.id] ? `${kindOf(d)}: ${files[d.id].name}` : d.required ? '' : 'Not provided (optional)'} />)}
                </ReviewCard>
                <div>
                  <label className="flex cursor-pointer items-start gap-3 text-sm text-ink-700">
                    <input id="confirm" type="checkbox" checked={form.confirm} onChange={(e) => set('confirm', e.target.checked)} className="mt-0.5 h-4 w-4 rounded accent-brand-600" />
                    I confirm the information and documents are accurate, and I’m authorized to register this agency.
                  </label>
                  {errors.confirm && <p className="mt-2 flex items-center gap-1.5 text-xs text-danger"><Icon name="alert" size={13} />{errors.confirm}</p>}
                </div>
              </>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              {step > 0 ? (
                <button type="button" onClick={back} className="inline-flex h-12 items-center gap-1.5 rounded-xl px-4 text-sm font-medium text-ink-600 transition hover:bg-white hover:text-ink-950">
                  <Icon name="back" size={15} />Back
                </button>
              ) : <span />}
              <button type="submit" className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand-700 px-7 text-sm font-medium text-white shadow-[0_10px_24px_rgba(47,95,204,0.28)] transition hover:bg-brand-800 active:translate-y-px">
                {step === STEPS.length - 1 ? 'Submit application' : 'Continue'}
                <Icon name="arrow" size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </Shell>
  );
}

/** Page frame: soft light background, logo top-left, stepper on the left, content centred. */
function Shell({ children, stepper, onSignIn }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fafbff]">
      <div aria-hidden className="pointer-events-none absolute -left-40 top-0 h-[640px] w-[560px] rounded-full bg-[#bcd6ff]/45 blur-[110px]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-20 h-[420px] w-[520px] rounded-full bg-[#e3d6ff]/50 blur-[110px]" />
      <div aria-hidden className="pointer-events-none absolute -right-40 top-1/3 h-[420px] w-[420px] rounded-full bg-[#d6e8ff]/40 blur-[110px]" />

      <header className="absolute inset-x-0 top-0 z-10 flex h-20 items-center justify-between px-5 sm:px-8 lg:px-10">
        <Logo size={34} tagline={undefined} />
        <button type="button" onClick={onSignIn} className="text-[13px] text-ink-600 hover:text-ink-950">
          Already registered? <span className="font-medium text-brand-700">Sign in</span>
        </button>
      </header>

      {/* The form is centred on the page; the stepper sits in the left margin on wide screens. */}
      <div className="relative flex min-h-screen items-center justify-center">
        <aside className="absolute left-8 top-1/2 hidden -translate-y-1/2 xl:block 2xl:left-10">{stepper}</aside>
        <main className="flex w-full items-center justify-center">{children}</main>
      </div>
    </div>
  );
}
