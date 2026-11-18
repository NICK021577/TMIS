import { useEffect, useState } from 'react';
import { Link, matchPath, useLocation } from 'react-router-dom';
import { Icon, AgencyMark } from '../ui';
import AccountMenu from '../modals/AccountMenu';
import NotificationsPopover from '../modals/NotificationsPopover';
import SearchModal from '../modals/SearchModal';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../hooks/useStore';
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
  const { activities } = useStore();
  const [searching, setSearching] = useState(false);
  useEffect(() => {
    const onKey = (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearching(true); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const [section, page] = ROUTES[pathname.split('/')[1]] ?? ['Workspace', ''];
  // /activities/:id adds a third crumb with the activity's name
  const detailId = matchPath('/activities/:id', pathname)?.params.id;
  const detail = detailId ? activities.find((a) => String(a.id) === detailId)?.title ?? 'Activity' : null;

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
          {page && (
            <>
              <Icon name="chevron" size={12} className="-rotate-90 text-ink-400" />
              {detail
                ? <Link to="/activities" className="text-ink-500 hover:text-ink-950">{page}</Link>
                : <span className="truncate text-ink-800">{page}</span>}
            </>
          )}
          {detail && (
            <>
              <Icon name="chevron" size={12} className="-rotate-90 flex-shrink-0 text-ink-400" />
              <span className="max-w-[320px] truncate text-ink-800" title={detail} aria-current="page">{detail}</span>
            </>
          )}
        </nav>
      </div>

      {/* Right: everything else, grouped */}
      <div className="ml-auto flex items-center gap-3">
        <button type="button" onClick={() => setSearching(true)} aria-label="Search" className="glass-input hidden h-10 w-[280px] items-center gap-2.5 rounded-full px-4 text-left text-ink-500 md:flex">
          <Icon name="search" size={15} />
          <span className="flex-1 text-[13px] text-ink-400">Search…</span>
          <kbd className="rounded-md bg-white/80 px-1.5 py-0.5 text-[10px] text-ink-500 ring-1 ring-black/5">Ctrl K</kbd>
        </button>
        <button type="button" onClick={() => setSearching(true)} aria-label="Search" className="grid h-10 w-10 place-items-center rounded-full text-ink-600 transition-colors hover:bg-white/60 md:hidden"><Icon name="search" size={18} /></button>

        <label className="hidden items-center gap-2 text-xs text-ink-500 xl:flex">
          View as
          <select value={user?.role ?? ''} onChange={(e) => switchRole(e.target.value)} aria-label="View as role" className="glass-input h-10 rounded-full px-3.5 text-xs text-ink-800">
            {['Agency Administrator', 'Committee Member', 'Resource Person'].map((r) => <option key={r}>{r}</option>)}
          </select>
        </label>

        <NotificationsPopover />
        <AccountMenu links={[{ label: 'About agency', to: '/about', icon: 'building' }, { label: 'Agency settings', to: '/settings', icon: 'settings' }]} />
      </div>
      {searching && <SearchModal onClose={() => setSearching(false)} />}
    </header>
  );
}
