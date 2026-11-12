import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Icon, Logo } from '../../ui';

const inputCls = 'glass-input h-11 w-full rounded-xl px-3.5 text-[13px] text-ink-950 placeholder:text-ink-400';

function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-brand-900">{label}</span>
      {children}
    </label>
  );
}

export default function RegisterAgency({ notify }) {
  const navigate = useNavigate();
  const [done, setDone] = useState(false);

  function submit(e) {
    e.preventDefault();
    setDone(true);
    notify?.('Application submitted');
  }

  return (
    <div className="auth-bg flex min-h-screen flex-col items-center px-5 py-8">
      <div className="orb -left-32 -top-32 h-[460px] w-[460px] bg-brand-400/40" />
      <div className="orb -bottom-32 -right-24 h-[420px] w-[420px] bg-orange-300/40" />

      <main className="flex w-full flex-1 flex-col items-center justify-center">
        <Logo size={56} wordmark={false} />
        <h1 className="mt-4 text-[28px] font-medium tracking-[-0.6px] text-ink-950">Register your agency</h1>
        <p className="mb-6 mt-2 max-w-[360px] text-center text-sm text-ink-600">
          Submit an application. A UniFyle administrator will review it before your workspace is created.
        </p>

        <div className="glass-strong w-full max-w-[460px] rounded-[28px] p-7 sm:p-8">
          {done ? (
            <div className="space-y-3 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><Icon name="check" size={26} /></span>
              <h2 className="text-lg font-medium text-ink-950">Application submitted</h2>
              <p className="text-[13px] text-ink-600">Status: Pending. You’ll get an email at each change.</p>
              <Button className="w-full" onClick={() => navigate('/')}>Back to sign in</Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <Field label="Agency name"><input required className={inputCls} placeholder="e.g. Mindanao Abaca Development Office" /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Acronym"><input required className={inputCls} placeholder="MADO" /></Field>
                <Field label="Type">
                  <select className={inputCls}><option>Government</option><option>Academic</option><option>Private</option></select>
                </Field>
              </div>
              <Field label="Region"><input required className={inputCls} placeholder="Region XI" /></Field>
              <Field label="Contact person"><input required className={inputCls} placeholder="Full name" /></Field>
              <Field label="Contact email"><input required type="email" className={inputCls} placeholder="name@agency.gov.ph" /></Field>
              <Button type="submit" size="lg" className="w-full">Submit application</Button>
              <button type="button" onClick={() => navigate('/')} className="w-full text-center text-[13px] font-medium text-brand-700 hover:text-brand-900">
                Back to sign in
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
