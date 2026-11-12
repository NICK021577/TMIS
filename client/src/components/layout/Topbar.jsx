import { useLocation } from 'react-router-dom';
import { Icon, Avatar, AgencyMark } from '../ui';
import { useAuth } from '../../context/AuthContext';
import { HEADER_H } from './nav';

const ROUTES = {
  dashboard:    ['Workspace', 'Dashboard'],
  calendar:     ['Workspace', 'Calendar'],
  activities:   ['Workspace', 'Activities'],
  participants: ['Workspace', 'Participants'],
  budget:       ['Workspace', 'Budget'],
  reports:      ['Workspace', 'Reports'],
  messaging:    ['Administration', 'Messaging'],
  about:        ['Administration', 'About agency'],
  settings:     ['Administration', 'Agency settings'],
};

/**
 * Topbar — breadcrumb on the left; search, role switch, alerts and account grouped on the right.
 * The page title itself lives in the page (one H1 per screen).
 */
export function Topbar({ onMenu }) {
  const { user, switchRole } = useAuth();
  const { pathname } = useLocation();
  const [section, page] = ROUTES[pathname.split('/')[1]] ?? ['Workspace', ''];

  return (
    <header className={`flex ${HEADER_H} flex-shrink-0 items-center gap-4 px-5 sm:px-8 lg:px-10`}>
      {/* Left: menu (mobile) + breadcrumb */}
      <div className="flex min-w-0 items-center gap-3">
        <button onClick={onMenu} aria-label="Open menu" className="grid h-10 w-10 place-items-center rounded-full text-ink-600 hover:bg-white/60 lg:hidden">
          <Icon name="menu" size={18} />
        </button>
        <AgencyMark size={30} className="lg:hidden" />
        <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-2 text-[13px] sm:flex">
          <span className="text-ink-400">{section}</span>
          {page && <><Icon name="chevron" size={12} className="-rotate-90 text-ink-400" /><span className="truncate text-ink-800">{page}</span></>}
        </nav>
      </div>

      {/* Right: everything else, grouped */}
      <div className="ml-auto flex items-center gap-3">
        <label className="glass-input hidden h-10 w-[280px] items-center gap-2.5 rounded-full px-4 text-ink-500 md:flex">
          <Icon name="search" size={15} />
          <span className="sr-only">Search</span>
          <input type="text" placeholder="Search…" className="min-w-0 flex-1 bg-transparent text-[13px] text-ink-950 outline-none placeholder:text-ink-400" />
        </label>

        <label className="hidden items-center gap-2 text-xs text-ink-500 xl:flex">
          View as
          <select value={user?.role ?? ''} onChange={(e) => switchRole(e.target.value)} aria-label="View as role" className="glass-input h-10 rounded-full px-3.5 text-xs text-ink-800">
            {['Agency Administrator', 'Committee Member', 'Resource Person'].map((r) => <option key={r}>{r}</option>)}
          </select>
        </label>

        <button aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-full text-ink-600 transition-colors hover:bg-white/60">
          <Icon name="bell" size={18} />
          <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand-600 px-1 text-[9px] font-medium text-white">3</span>
        </button>

        <button className="flex items-center gap-3 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-white/60">
          <Avatar name={user?.name ?? 'User'} size="md" />
          <span className="hidden text-left lg:block">
            <strong className="block text-[13px] font-medium leading-none text-ink-950">{user?.name ?? 'User'}</strong>
            <small className="mt-1 block text-[11px] leading-none text-ink-500">{user?.role ?? 'Agency'}</small>
          </span>
        </button>
      </div>
    </header>
  );
}
