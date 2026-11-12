import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Icon } from '../../ui/Icon';
import { Logo } from '../../ui/Logo';

const YEAR = new Date().getFullYear();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Field({ id, label, icon, error, children, trailing, aside }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-medium text-brand-900">{label}</label>
        {aside}
      </div>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500">
          <Icon name={icon} size={17} />
        </span>
        {children}
        {trailing}
      </div>
      {error && (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-xs text-danger">
          <Icon name="alert" size={13} />
          {error}
        </p>
      )}
    </div>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '', remember: true });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function validate() {
    const next = {};
    if (!form.email.trim()) next.email = 'Enter your email address.';
    else if (!EMAIL_PATTERN.test(form.email.trim())) next.email = 'That email doesn’t look right.';
    if (!form.password) next.password = 'Enter your password.';
    return next;
  }

  // TEMPORARY: skips sign-in and opens the Super Admin console. Remove before release.
  function enterSuperAdmin() {
    login({
      name:  'Dr. Elena Cruz',
      email: 'superadmin@unifyle.gov.ph',
      role:  'Super Admin',
    });
    navigate('/platform');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) {
      setShake(true);
      document.getElementById(next.email ? 'email' : 'password')?.focus();
      return;
    }
    setLoading(true);
    // ── Simulated auth (replace with real API call) ──
    await new Promise((r) => setTimeout(r, 800));
    login({
      name:   'Alexis Ramos',
      email:  form.email.trim(),
      role:   'Agency Administrator',
      agency: 'PRRI',
    });
    setLoading(false);
    navigate('/dashboard');
  }

  const inputCls =
    'glass-input h-12 w-full rounded-xl pl-11 text-sm text-ink-950 placeholder:text-ink-400 aria-[invalid=true]:border-danger';

  return (
    <div className="auth-bg flex min-h-screen flex-col items-center px-5 py-8">
      {/* Decorative light */}
      <div className="orb -left-32 -top-32 h-[460px] w-[460px] bg-brand-400/40" />
      <div className="orb -bottom-32 -right-24 h-[420px] w-[420px] bg-orange-300/40 [animation-delay:-9s]" />
      <div className="orb left-[55%] top-1/4 h-[260px] w-[260px] bg-indigo-300/30 [animation-delay:-4s]" />

      <main className="flex w-full flex-1 flex-col items-center justify-center">
        {/* Brand + heading */}
        <div className="mb-7 flex animate-rise flex-col items-center text-center">
          <Logo size={72} wordmark={false} />
          <span className="mt-3 text-[26px] font-medium tracking-[-0.5px] text-brand-950">UniFyle</span>
          <h1 className="mt-6 text-[30px] font-medium leading-tight tracking-[-0.7px] text-ink-950">
            Welcome back
          </h1>
          <p className="mt-2 max-w-[330px] text-sm leading-relaxed text-ink-600">
            Sign in to access your dashboard and continue where you left off.
          </p>
        </div>

        {/* Form card */}
        <div
          onAnimationEnd={(e) => e.target === e.currentTarget && setShake(false)}
          className={`glass-strong w-full max-w-[420px] animate-rise rounded-[28px] p-7 [animation-delay:80ms] sm:p-8 ${shake ? 'animate-shake' : ''}`}
        >
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Field id="email" label="Email address" icon="mail" error={errors.email}>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@agency.gov.ph"
                autoComplete="email"
                inputMode="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={`${inputCls} pr-4`}
              />
            </Field>

            <Field
              id="password"
              label="Password"
              icon="lock"
              error={errors.password}
              aside={
                <button type="button" className="text-xs font-medium text-brand-700 transition-colors hover:text-brand-900">
                  Forgot?
                </button>
              }
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-white/70 hover:text-ink-950"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  aria-pressed={showPass}
                >
                  <Icon name={showPass ? 'eyeOff' : 'eye'} size={17} />
                </button>
              }
            >
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                className={`${inputCls} pr-12`}
              />
            </Field>

            <label className="flex cursor-pointer select-none items-center gap-2.5 text-[13px] text-ink-600">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
                className="h-4 w-4 rounded accent-brand-600"
              />
              Keep me signed in
            </label>

            <button
              type="submit"
              disabled={loading}
              className="btn-sheen flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-900 via-brand-800 to-orange-600 text-sm font-medium text-white shadow-[0_12px_28px_rgba(26,63,152,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] transition-all hover:-translate-y-px hover:shadow-[0_16px_34px_rgba(26,63,152,0.45),inset_0_1px_0_rgba(255,255,255,0.25)] active:translate-y-0 disabled:cursor-wait disabled:opacity-80"
            >
              {loading ? (
                <>
                  <Icon name="refresh" size={17} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <Icon name="arrow" size={17} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3 text-[11px] font-medium  text-ink-400">
            <span className="h-px flex-1 bg-brand-900/10" />
            New to UniFyle?
            <span className="h-px flex-1 bg-brand-900/10" />
          </div>

          <button
            type="button"
            onClick={() => navigate('/register-agency')}
            className="glass-inset mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[13px] font-medium text-brand-900 transition-colors hover:bg-white/80"
          >
            <Icon name="building" size={16} />
            Register your agency
          </button>

          {/* TEMP — remove before release */}
          <button
            type="button"
            onClick={enterSuperAdmin}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-orange-400/70 bg-orange-50/60 text-[13px] font-medium text-orange-800 transition-colors hover:bg-orange-100/80"
          >
            <span className="rounded bg-orange-500 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">Temp</span>
            <Icon name="shield" size={16} />
            Enter Super Admin console
          </button>
        </div>

        <p className="mt-5 flex items-center gap-1.5 text-xs text-ink-500">
          <Icon name="shield" size={14} />
          Your session is encrypted and private to your agency.
        </p>
      </main>

      <footer className="mt-6 text-center text-xs text-ink-400">
        © {YEAR} UniFyle · Training Management Information System
      </footer>
    </div>
  );
}
