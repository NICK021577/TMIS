import { useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { AgencyMark } from '../ui/AgencyMark';
import RotatingText from '../ui/RotatingText';

/** How long the welcome plays before it hands over to the page. */
export const WELCOME_MS = 7400;
const FEATURES = ['plan activities', 'track attendance', 'manage budgets', 'collect feedback', 'issue certificates'];

/** Splits a word into letters that rise in one after another. */
function Letters({ text, delay, className = '' }) {
  return (
    <span className={`inline-flex ${className}`} aria-label={text}>
      {[...text].map((ch, i) => (
        <motion.span
          key={i} aria-hidden="true" className="inline-block whitespace-pre"
          initial={{ y: 36, opacity: 0, rotate: 6 }} animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: delay + i * 0.035 }}
        >{ch}</motion.span>
      ))}
    </span>
  );
}

/**
 * WelcomeIntro — the full-screen hello a new agency sees once, before its public page appears.
 * Plays for WELCOME_MS, then calls onDone. Clicking anywhere (or Skip) ends it early.
 */
export default function WelcomeIntro({ agency, shortName, onDone }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    const t = setTimeout(onDone, reduce ? 1400 : WELCOME_MS);
    return () => clearTimeout(t);
  }, [onDone, reduce]);

  return (
    <motion.div
      role="dialog" aria-label={`Welcome to UniFyle, ${agency}`}
      onClick={onDone}
      className="auth-bg fixed inset-0 z-[100] grid cursor-pointer place-items-center px-6"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: 'blur(14px)', transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } }}
    >
      <div className="orb -left-40 top-1/4 h-[520px] w-[520px] bg-[#9cc2ff]/50" />
      <div className="orb -right-32 -top-24 h-[420px] w-[420px] bg-[#cdbcff]/55 [animation-delay:-6s]" />
      <div className="orb -bottom-40 left-1/3 h-[420px] w-[620px] bg-white/70 [animation-delay:-11s]" />

      <button type="button" onClick={(e) => { e.stopPropagation(); onDone(); }}
        className="absolute right-6 top-6 rounded-full bg-white/60 px-4 py-1.5 text-xs font-medium text-ink-600 transition-colors hover:bg-white hover:text-ink-950">Skip</button>

      <div className="relative flex max-w-[760px] flex-col items-center text-center">
        {/* logo with pulses */}
        <div className="relative mb-9 grid h-28 w-28 place-items-center">
          {!reduce && [0, 1].map((i) => (
            <motion.span key={i} className="absolute inset-0 rounded-[32%] border-2 border-brand-400"
              initial={{ scale: 1, opacity: 0.55 }} animate={{ scale: 2.1, opacity: 0 }}
              transition={{ duration: 2.2, repeat: Infinity, delay: 0.8 + i * 0.9, ease: 'easeOut' }} />
          ))}
          <motion.div initial={{ scale: 0.2, opacity: 0, rotate: -18 }} animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 170, damping: 14 }}
            className="rounded-[28%] shadow-[0_18px_44px_rgba(47,95,204,0.3)]">
            <AgencyMark size={112} />
          </motion.div>
        </div>

        <h1 className="text-[34px] font-medium leading-tight tracking-[-1px] text-ink-700 sm:text-[44px]">
          <Letters text="Welcome to UniFyle," delay={0.55} />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: 1.5, ease: 'easeOut' }}
          className="mt-2 bg-gradient-to-r from-brand-800 via-brand-600 to-[#7b61e8] bg-clip-text pb-2 text-[40px] font-semibold leading-tight tracking-[-1.5px] text-transparent sm:text-[58px]">
          {agency}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 2.3 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[20px] text-ink-600 sm:text-[24px]">
          <span>{shortName} can now</span>
          <RotatingText
            texts={FEATURES} effect="slide" direction="up" highlight highlightColor="#2f5fcc" staggerFrom="last" staggerDuration={0.02}
            splitLevelClassName="overflow-hidden pb-0.5" rotationInterval={2000}
            mainClassName="flex-shrink-0 !flex-nowrap !pl-[0.4em] !pr-[0.6em] font-medium italic leading-tight shadow-[0_8px_22px_rgba(47,95,204,0.26)]" />
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 4.2, duration: 0.6 }} className="mt-9 text-[13px] text-ink-500">
          Setting up your public agency page…
        </motion.p>
      </div>

      {/* progress */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-brand-900/5">
        <motion.div className="h-full origin-left bg-gradient-to-r from-brand-500 to-[#7b61e8]"
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: (reduce ? 1.4 : WELCOME_MS) / 1000, ease: 'linear' }} />
      </div>
    </motion.div>
  );
}
