import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../ui/Button';
import { Icon } from '../../ui/Icon';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);

    // ── Simulated auth (replace with real API call) ──
    await new Promise((r) => setTimeout(r, 800));
    login({
      name:   'Alexis Ramos',
      email:  form.email,
      role:   'Agency Administrator',
      agency: 'PRRI',
    });
    setLoading(false);
    navigate('/dashboard');
  }

  return (
    <div className="min-h-screen bg-canvas flex">

      {/* ── Left — decorative hero panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[48%] bg-gradient-to-br from-green-950 via-green-900 to-green-800 relative overflow-hidden p-12">
        {/* Background blobs */}
        <div className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full bg-green-700/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        {/* Brand mark */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-green-950 font-black text-sm grid place-items-center tracking-tight">
            TM
          </div>
          <span className="text-white font-bold text-xl tracking-[0.4px]">TMIS</span>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-5">
          {/* Glass info card */}
          <div className="glass rounded-2xl p-6 max-w-sm">
            <p className="text-[9px] font-black text-amber-400 uppercase tracking-[1.4px] mb-3">
              Training Management
            </p>
            <h2 className="text-white text-2xl font-bold leading-snug tracking-tight">
              One platform for all your training &amp; extension activities
            </h2>
            <p className="mt-3 text-white/60 text-xs leading-relaxed">
              Manage training activities, track attendance, generate reports, and monitor budgets — all in one place.
            </p>
          </div>

          {/* Stats strip */}
          <div className="flex gap-3">
            {[
              { value: '240+', label: 'Activities tracked' },
              { value: '3,800+', label: 'Participants reached' },
              { value: '12', label: 'Partner agencies' },
            ].map((s) => (
              <div key={s.label} className="glass rounded-xl px-4 py-3 flex-1 text-center">
                <strong className="block text-white font-bold text-lg leading-none">{s.value}</strong>
                <span className="block text-white/50 text-[9px] mt-1 leading-tight">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="relative z-10 text-white/30 text-[9px]">
          Philippine Rubber Research Institute · DA-BAR
        </p>
      </div>

      {/* ── Right — login form ── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[400px]">

          {/* Mobile brand (shown only on small screens) */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-green-700 text-white font-black text-sm grid place-items-center">
              TM
            </div>
            <span className="font-bold text-xl text-ink-950 tracking-[0.4px]">TMIS</span>
          </div>

          <p className="text-[9px] font-black text-green-700 uppercase tracking-[1.4px] mb-2">
            Agency Console
          </p>
          <h1 className="text-[28px] font-bold text-ink-950 tracking-[-0.6px] leading-tight mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-ink-500 mb-8">
            Sign in to your agency workspace
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-ink-800">
                Email address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
                  <Icon name="key" size={15} />
                </span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@agency.gov.ph"
                  autoComplete="email"
                  className="w-full h-11 pl-9 pr-4 rounded-lg border border-line bg-white text-sm text-ink-950 outline-none
                             placeholder:text-ink-400
                             focus:border-green-600 focus:ring-2 focus:ring-green-100
                             transition-shadow"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-ink-800">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
                  <Icon name="lock" size={15} />
                </span>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full h-11 pl-9 pr-10 rounded-lg border border-line bg-white text-sm text-ink-950 outline-none
                             placeholder:text-ink-400
                             focus:border-green-600 focus:ring-2 focus:ring-green-100
                             transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 transition-colors"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  <Icon name="eye" size={15} />
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-danger text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <Icon name="alert" size={14} />
                {error}
              </div>
            )}

            {/* Forgot password */}
            <div className="text-right">
              <button
                type="button"
                className="text-xs text-green-700 font-semibold hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Icon name="refresh" size={15} className="animate-spin" />
                  Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          {/* Divider + register link */}
          <div className="mt-8 pt-6 border-t border-line text-center">
            <p className="text-xs text-ink-500">
              New agency?{' '}
              <button
                type="button"
                onClick={() => navigate('/register-agency')}
                className="text-green-700 font-semibold hover:underline"
              >
                Register your agency
              </button>
            </p>
          </div>

          <p className="mt-8 text-center text-[9px] text-ink-400">
            © 2025 TMIS · Philippine Rubber Research Institute
          </p>
        </div>
      </div>
    </div>
  );
}
