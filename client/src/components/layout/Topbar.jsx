import { Link, matchPath, useLocation } from 'react-router-dom';
import { Icon, AgencyMark } from '../ui';
import AccountMenu from '../modals/AccountMenu';
import NotificationsPopover from '../modals/NotificationsPopover';
import SearchBox from './SearchBox';
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
 * Topbar — breadcrumb on the left; search, alerts and account grouped on the right.
 * The page title itself lives in the page (one H1 per screen).
 */
export function Topbar({ onMenu }) {
  const { pathname } = useLocation();
  const { activities, profile } = useStore();
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
        <SearchBox />

        <NotificationsPopover />
        <AccountMenu links={[{ label: 'About agency', to: `/a/${profile.shortName.toLowerCase()}`, icon: 'building' }]} />
      </div>
    </header>
  );
}
