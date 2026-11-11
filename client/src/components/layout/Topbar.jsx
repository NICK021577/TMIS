import { useLocation } from 'react-router-dom';
import { Icon, IconButton } from '../ui';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui';

/** Map route paths to human-readable page titles */
const PAGE_TITLES = {
  '/dashboard':    { title: 'Dashboard',          sub: 'Overview of activities and operations' },
  '/calendar':     { title: 'Calendar',           sub: 'Monthly view of scheduled activities' },
  '/activities':   { title: 'Activities',         sub: 'Manage and track training activities' },
  '/participants': { title: 'Participants',        sub: 'Registry of enrolled participants' },
  '/attendance':   { title: 'Attendance',         sub: 'Track participant check-ins' },
  '/budget':       { title: 'Budget',             sub: 'Annual budget and cost tracking' },
  '/reports':      { title: 'Reports & Analytics',sub: 'Data insights and outcome reports' },
  '/messaging':    { title: 'Messaging',          sub: 'Group announcements and threads' },
  '/about':        { title: 'About Agency',       sub: 'Agency profile and public information' },
  '/settings':     { title: 'Agency Settings',    sub: 'Branding, categories, and configuration' },
};

export function Topbar() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  // Match the current page (also handles /activities/:id)
  const baseRoute = '/' + pathname.split('/')[1];
  const page = PAGE_TITLES[baseRoute] ?? { title: 'TMIS', sub: '' };

  return (
    <header className="sticky top-0 z-10 h-16 bg-white border-b border-line flex items-center justify-between px-8 gap-6">

      {/* ── Page title ── */}
      <div className="min-w-0">
        <h1 className="text-[15px] font-bold text-ink-950 leading-tight tracking-[-0.3px] truncate">
          {page.title}
        </h1>
        {page.sub && (
          <p className="text-[10px] text-ink-500 mt-0.5 truncate">{page.sub}</p>
        )}
      </div>

      {/* ── Right actions ── */}
      <div className="flex items-center gap-2 flex-shrink-0">

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 h-9 rounded-lg border border-line bg-canvas text-ink-500 w-52">
          <Icon name="search" size={15} />
          <input
            type="text"
            placeholder="Search activities…"
            className="flex-1 bg-transparent text-xs text-ink-950 outline-none placeholder:text-ink-500"
          />
        </div>

        {/* Notifications */}
        <IconButton icon="bell" label="Notifications" size={36} />

        {/* Divider */}
        <div className="w-px h-5 bg-line mx-1" />

        {/* User chip */}
        <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-green-50 transition-colors">
          <Avatar name={user?.name ?? 'User'} size="sm" />
          <div className="text-left hidden lg:block">
            <strong className="block text-xs font-semibold text-ink-950 leading-none">
              {user?.name ?? 'User'}
            </strong>
            <small className="block text-[9px] text-ink-500 mt-0.5">
              {user?.agency ?? 'Agency'}
            </small>
          </div>
          <Icon name="chevron" size={14} className="text-ink-400" />
        </button>
      </div>
    </header>
  );
}
