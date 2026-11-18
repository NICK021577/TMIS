import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, animate, motion, useReducedMotion } from 'motion/react';
import { useAuth } from '../../../context/AuthContext';
import { useStore } from '../../../hooks/useStore';
import { AGENCY } from '../../../data/mockData';
import { brandVars } from '../../../lib/brand';
import { copyText } from '../../../lib/download';
import { Badge, Button, Icon } from '../../ui';
import { AgencyMark } from '../../ui/AgencyMark';
import { Logo } from '../../ui/Logo';
import WelcomeIntro from '../../modals/WelcomeIntro';
import NotFound from '../NotFound/NotFound';

export const welcomedKey = (shortName) => `unifyle:welcomed:${String(shortName).toLowerCase()}`;
const TABS = [{ id: 'activities', label: 'Activities', icon: 'calendar' }, { id: 'about', label: 'About', icon: 'building' }, { id: 'contact', label: 'Contact', icon: 'mail' }];
const FILTERS = ['Upcoming', 'Past', 'All'];

const compact = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K` : String(n));
const parseCount = (s) => { const n = parseFloat(s); return /k$/i.test(s) ? Math.round(n * 1000) : Math.round(n) || 0; };

/** A number that counts up when it appears. */
function CountUp({ to }) {
  const [v, setV] = useState(0);
  useEffect(() => { const c = animate(0, to, { duration: 1.4, ease: 'easeOut', onUpdate: (x) => setV(Math.round(x)) }); return () => c.stop(); }, [to]);
  return <>{compact(v)}</>;
}

const rise = (i = 0) => ({ initial: { opacity: 0, y: 22 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.55, delay: i * 0.09, ease: [0.2, 0.7, 0.2, 1] } });

function ActivityCard({ a, i, onRegister }) {
  const left = Math.max(0, a.capacity - a.participants);
  const done = a.status === 'Completed';
  const [mon, day] = (a.dateShort ?? '').split(' ');
  return (
    <motion.li layout initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.4, delay: i * 0.07 }}
      whileHover={{ y: -4 }} className="glass flex flex-col rounded-2xl p-5">
      <div className="flex items-start gap-4">
        <span className="grid h-14 w-14 flex-shrink-0 place-content-center rounded-2xl bg-gradient-to-br from-brand-100 to-[#ddd6fa] text-center text-brand-800">
          <strong className="block text-lg font-semibold leading-none">{day}</strong><small className="text-[10px] font-medium tracking-wider">{mon}</small>
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><Badge value={a.status} /><span className="text-xs text-ink-500">{a.type}</span></div>
          <h3 className="mt-1.5 text-[15px] font-medium leading-snug text-ink-950">{a.title}</h3>
        </div>
      </div>
      <p className="mt-3 flex items-start gap-1.5 text-[13px] text-ink-600"><Icon name="location" size={14} className="mt-0.5 flex-shrink-0 text-ink-400" />{a.venue}</p>
      <p className="mt-1 flex items-center gap-1.5 text-[13px] text-ink-600"><Icon name="clock" size={14} className="flex-shrink-0 text-ink-400" />{a.date}</p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <span className="text-xs text-ink-500">{done ? `${a.participants} participants` : left > 0 ? <><strong className="font-medium text-ink-950">{left}</strong> slots left</> : 'Fully booked'}</span>
        {done ? <Button variant="secondary" size="sm" onClick={() => onRegister(a, true)}>View outcome</Button> : <Button size="sm" disabled={left === 0} onClick={() => onRegister(a)}>Register</Button>}
      </div>
    </motion.li>
  );
}

export default function AgencyPage({ notify }) {
  const { slug } = useParams();
  const { state } = useLocation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, brand, activities } = useStore();
  const reduce = useReducedMotion();

  const valid = slug?.toLowerCase() === profile.shortName.toLowerCase();
  const wantsWelcome = !!state?.welcome || params.get('welcome') === '1';
  const [intro, setIntro] = useState(wantsWelcome);
  const [welcomed, setWelcomed] = useState(wantsWelcome);   // true once the welcome has been shown on this visit
  const [tab, setTab] = useState('activities');
  const [filter, setFilter] = useState('Upcoming');
  const [subscribed, setSubscribed] = useState(false);

  // The welcome is shown once per agency on this device.
  useEffect(() => { if (wantsWelcome) { try { localStorage.setItem(welcomedKey(profile.shortName), '1'); } catch { /* storage unavailable */ } } }, [wantsWelcome, profile.shortName]);
  const finishIntro = useCallback(() => setIntro(false), []);

  const publicActs = useMemo(() => activities.filter((a) => a.status !== 'Draft' && (!a.tenant || a.tenant === profile.shortName)), [activities, profile.shortName]);
  const shown = publicActs.filter((a) => (filter === 'All' ? true : filter === 'Past' ? a.status === 'Completed' : a.status !== 'Completed'));
  const reached = publicActs.reduce((n, a) => n + a.participants, 0);
  const values = profile.values.split(';').map((v) => v.trim()).filter(Boolean);
  const link = `${window.location.origin}/a/${profile.shortName.toLowerCase()}`;
  const isStaff = user?.role === 'Agency Administrator' || user?.role === 'Super Admin';

  if (!valid) return <NotFound />;

  const subs = parseCount(AGENCY.subscribers) + (subscribed ? 1 : 0);
  const register = (a, done) => notify?.(done ? `Outcome reports for “${a.title}” are shared in the UniFyle app` : `Participants register for “${a.title}” in the UniFyle app`);
  const proceed = () => navigate(user ? '/dashboard' : '/');

  return (
    <div className="app-bg min-h-screen" style={brandVars(brand)} data-tint={brand.tint ? 'on' : undefined}>
      <AnimatePresence>{intro && <WelcomeIntro key="intro" agency={profile.name} shortName={profile.shortName} onDone={finishIntro} />}</AnimatePresence>

      {!intro && (
        <>
          {/* top bar */}
          <header className="sticky top-0 z-30 border-b border-white/50 bg-white/55 backdrop-blur-xl">
            <div className="mx-auto flex h-14 max-w-[1080px] items-center justify-between px-5">
              <Logo size={30} />
              {user ? <Button variant="secondary" size="sm" icon="grid" onClick={() => navigate('/dashboard')}>Open console</Button> : <Button size="sm" onClick={() => navigate('/')}>Sign in</Button>}
            </div>
            {isStaff && !welcomed && (
              <div className="border-t border-white/50 bg-brand-50/80 px-5 py-1.5 text-center text-xs text-brand-900">
                Previewing your public page. Everything here comes from your <button className="font-medium underline underline-offset-2" onClick={() => navigate('/settings')}>agency settings</button> and activities.
              </div>
            )}
          </header>

          <main className="mx-auto max-w-[1080px] px-5 pb-32 pt-6">
            {/* hero */}
            <motion.section {...rise(0)} className="glass overflow-hidden rounded-3xl">
              <div className="relative h-44 overflow-hidden bg-gradient-to-br from-brand-900 via-brand-700 to-brand-400 sm:h-52">
                {!reduce && (
                  <>
                    <motion.span className="absolute -left-10 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" animate={{ x: [0, 40, 0], y: [0, 20, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />
                    <motion.span className="absolute -bottom-20 right-10 h-64 w-64 rounded-full bg-[#b9a5ff]/25 blur-2xl" animate={{ x: [0, -50, 0], y: [0, -16, 0] }} transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut' }} />
                  </>
                )}
                <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '22px 22px' }} />
              </div>
              <div className="flex flex-wrap items-end gap-x-6 gap-y-4 px-6 pb-6 sm:px-8">
                <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 0.25 }} className="relative z-10 -mt-14 rounded-[28%] shadow-[0_12px_30px_rgba(30,60,140,0.22)] ring-4 ring-white">
                  <AgencyMark size={112} />
                </motion.div>
                <div className="min-w-0 flex-1 pt-3">
                  <h1 className="text-2xl font-medium leading-tight tracking-[-0.6px] text-ink-950 sm:text-[28px]">{profile.name}</h1>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[13px] text-ink-500">
                    <span>@{profile.shortName.toLowerCase()}</span><i className="h-1 w-1 rounded-full bg-ink-300" /><span>Government agency</span><i className="h-1 w-1 rounded-full bg-ink-300" /><span>{AGENCY.region}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-3">
                  <Button variant={subscribed ? 'secondary' : 'primary'} icon={subscribed ? 'check' : 'bell'} onClick={() => { setSubscribed((v) => !v); notify?.(subscribed ? `Unsubscribed from ${profile.shortName}` : `Subscribed. You will hear about new ${profile.shortName} activities`); }}>{subscribed ? 'Subscribed' : 'Subscribe'}</Button>
                  <Button variant="secondary" icon="link" onClick={async () => notify?.((await copyText(link)) ? 'Page link copied' : 'Could not copy the link')}>Share</Button>
                </div>
              </div>
              <dl className="grid grid-cols-3 divide-x divide-[var(--glass-divider)] border-t border-[var(--glass-divider)]">
                {[['Subscribers', <CountUp key="s" to={subs} />], ['Activities', <CountUp key="a" to={publicActs.length} />], ['Participants reached', <CountUp key="p" to={reached} />]].map(([label, val]) => (
                  <div key={label} className="px-4 py-4 text-center"><dd className="text-xl font-medium tabular-nums text-ink-950">{val}</dd><dt className="text-xs text-ink-500">{label}</dt></div>
                ))}
              </dl>
            </motion.section>

            {/* tabs */}
            <motion.div {...rise(1)} role="tablist" aria-label="Agency page sections" className="mt-6 flex gap-1 border-b border-[var(--glass-divider)]">
              {TABS.map((t) => (
                <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
                  className={`relative flex items-center gap-2 px-4 py-3 text-[14px] transition-colors ${tab === t.id ? 'font-medium text-brand-800' : 'text-ink-500 hover:text-ink-950'}`}>
                  <Icon name={t.icon} size={15} />{t.label}
                  {tab === t.id && <motion.span layoutId="agency-tab" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-600" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                </button>
              ))}
            </motion.div>

            <div className="mt-6">
              <AnimatePresence mode="wait">
                {tab === 'activities' && (
                  <motion.div key="activities" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div role="tablist" className="glass-inset inline-flex rounded-full p-0.5">
                        {FILTERS.map((f) => (
                          <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)}
                            className={`rounded-full px-4 py-1.5 text-xs transition-colors ${filter === f ? 'bg-white font-medium text-ink-950 shadow-sm' : 'text-ink-500 hover:text-ink-950'}`}>{f}</button>
                        ))}
                      </div>
                      <span className="text-xs text-ink-500">{shown.length} {shown.length === 1 ? 'activity' : 'activities'}</span>
                    </div>
                    {shown.length === 0 ? (
                      <div className="glass rounded-2xl px-6 py-14 text-center"><Icon name="calendar" size={28} className="mx-auto text-ink-300" /><p className="mt-3 text-sm text-ink-600">Nothing here yet.</p></div>
                    ) : (
                      <motion.ul layout className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <AnimatePresence mode="popLayout">{shown.map((a, i) => <ActivityCard key={a.id} a={a} i={i} onRegister={register} />)}</AnimatePresence>
                      </motion.ul>
                    )}
                  </motion.div>
                )}

                {tab === 'about' && (
                  <motion.div key="about" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="grid gap-4 md:grid-cols-2">
                    {[['Mission', profile.mission], ['Vision', profile.vision]].map(([t, body], i) => (
                      <motion.div key={t} {...rise(i)} className="glass rounded-2xl p-6"><h2 className="text-xs font-medium uppercase tracking-wider text-brand-700">{t}</h2><p className="mt-2 text-[15px] leading-relaxed text-ink-800">{body}</p></motion.div>
                    ))}
                    <motion.div {...rise(2)} className="glass rounded-2xl p-6 md:col-span-2"><h2 className="text-xs font-medium uppercase tracking-wider text-brand-700">Mandate</h2><p className="mt-2 text-[15px] leading-relaxed text-ink-800">{profile.mandate}</p></motion.div>
                    <motion.div {...rise(3)} className="glass rounded-2xl p-6 md:col-span-2">
                      <h2 className="text-xs font-medium uppercase tracking-wider text-brand-700">Core values</h2>
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {values.map((v, i) => (
                          <motion.li key={v} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.3 + i * 0.07 }} className="rounded-full bg-white/80 px-4 py-2 text-[13px] font-medium text-brand-800 ring-1 ring-black/5">{v}</motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  </motion.div>
                )}

                {tab === 'contact' && (
                  <motion.div key="contact" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="glass max-w-[620px] divide-y divide-[var(--glass-divider)] rounded-2xl">
                    {[['mail', 'Email', AGENCY.contact, `mailto:${AGENCY.contact}`], ['location', 'Region', AGENCY.region, null], ['link', 'Page link', link, link]].map(([icon, label, val, href]) => (
                      <div key={label} className="flex items-center gap-4 px-6 py-4">
                        <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-700"><Icon name={icon} size={17} /></span>
                        <div className="min-w-0"><small className="block text-xs text-ink-500">{label}</small>{href ? <a href={href} className="block truncate text-[14px] font-medium text-ink-950 hover:text-brand-700">{val}</a> : <strong className="block text-[14px] font-medium text-ink-950">{val}</strong>}</div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <footer className="mt-14 flex items-center justify-center gap-2 text-xs text-ink-400">Powered by <Logo size={16} className="!gap-1.5" /></footer>
          </main>

          {/* after the welcome: continue into the console */}
          {welcomed && (
            <motion.div initial={{ y: 90, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 18, delay: 1.1 }}
              className="fixed inset-x-0 bottom-5 z-40 flex justify-center px-4">
              <div className="glass-strong flex max-w-full flex-wrap items-center justify-center gap-x-5 gap-y-3 rounded-[28px] py-3 pl-6 pr-3 shadow-[0_18px_50px_rgba(40,70,160,0.25)]">
                <p className="text-[13px] text-ink-700"><strong className="font-medium text-ink-950">This is your public page.</strong> It follows your profile, branding and activities.</p>
                <motion.span animate={reduce ? undefined : { x: [0, 4, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}>
                  <Button iconRight="arrow" onClick={proceed}>{user ? 'Proceed to dashboard' : 'Sign in to continue'}</Button>
                </motion.span>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
