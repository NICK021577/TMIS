import { NavLink } from 'react-router-dom';
import { Icon } from '../ui';
import mark from '../../assets/unifyle/unifyle-mark.svg';

export const HEADER_H = 'h-20';

/**
 * Sidebar shell (full height, like Slack / Linear / Notion):
 *   brand block  →  navigation  →  footer actions  →  "Powered by"
 * Static column on desktop, slide-in drawer on small screens.
 */
export function SidebarFrame({ open, onClose, label, brand, children, footer }) {
  return (
    <>
      {open && <div className="glass-backdrop fixed inset-0 z-30 animate-fade-in lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        aria-label={label}
        className={`flex-col ${
          open
            ? 'glass-strong fixed inset-y-3 left-3 z-40 flex w-[264px] animate-fade-in rounded-[22px] !bg-white/95'
            : 'hidden'
        } lg:static lg:z-auto lg:flex lg:w-[256px] lg:flex-shrink-0 lg:animate-none lg:rounded-none lg:border-0 lg:bg-transparent lg:shadow-none lg:backdrop-blur-none`}
      >
        <div className={`flex ${HEADER_H} flex-shrink-0 items-center px-5`}>{brand}</div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4 pt-2" onClick={(e) => e.target.closest('a') && onClose?.()}>
          {children}
        </nav>

        <div className="flex-shrink-0 space-y-3 px-3 pb-4">
          {footer}
          <PoweredBy />
        </div>
      </aside>
    </>
  );
}

/** "Powered by UniFyle" — quiet attribution at the foot of the sidebar */
export function PoweredBy() {
  return (
    <div className="flex items-center gap-2 border-t border-[var(--glass-divider)] px-3 pt-3 text-[11px] text-ink-400">
      Powered by
      <img src={mark} alt="" width={14} height={14} className="h-3.5 w-3.5 select-none" draggable={false} />
      <span className="font-medium text-ink-500">UniFyle</span>
    </div>
  );
}

export function NavLabel({ children }) {
  return <p className="px-3 pb-2 text-xs text-ink-400">{children}</p>;
}

export function NavItem({ icon, label, to, end, count }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] transition-colors ${
          isActive
            ? 'bg-white/85 font-medium text-ink-950 shadow-[0_2px_10px_rgba(70,100,200,0.10)] ring-1 ring-white'
            : 'text-ink-600 hover:bg-white/50 hover:text-ink-950'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon name={icon} size={16} className={isActive ? 'text-brand-600' : 'text-ink-500'} />
          <span className="flex-1">{label}</span>
          {count > 0 && (
            <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-medium text-white">{count}</span>
          )}
        </>
      )}
    </NavLink>
  );
}

export function NavButton({ icon, children, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] text-ink-600 transition-colors ${
        danger ? 'hover:bg-red-50/70 hover:text-danger' : 'hover:bg-white/50 hover:text-ink-950'
      }`}
    >
      <Icon name={icon} size={16} />
      {children}
    </button>
  );
}
