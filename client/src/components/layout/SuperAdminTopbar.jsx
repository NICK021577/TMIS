import { useLocation } from 'react-router-dom';
import { Icon } from '../ui';
import AccountMenu from '../modals/AccountMenu';
import { useAuth } from '../../context/AuthContext';
import { HEADER_H } from './nav';

const PAGES = {
  '':            ['Platform', 'Dashboard'],
  applications:  ['Platform', 'Applications'],
  agencies:      ['Platform', 'Agencies'],
  users:         ['Management', 'Users & access'],
  settings:      ['Management', 'Global settings'],
  audit:         ['Governance', 'Audit log'],
};

export function SuperAdminTopbar({ onMenu }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [section, page] = PAGES[pathname.split('/')[2] ?? ''] ?? ['Platform', ''];

  return (
    <header className={`flex ${HEADER_H} flex-shrink-0 items-center gap-4 px-5 sm:px-8 lg:px-10`}>
      <div className="flex min-w-0 items-center gap-3">
        <button onClick={onMenu} aria-label="Open menu" className="grid h-10 w-10 place-items-center rounded-full text-ink-600 hover:bg-white/60 lg:hidden">
          <Icon name="menu" size={18} />
        </button>
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-[13px]">
          <span className="text-ink-400">{section}</span>
          {page && <><Icon name="chevron" size={12} className="-rotate-90 text-ink-400" /><span className="truncate text-ink-800">{page}</span></>}
        </nav>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <span className="glass-inset hidden items-center gap-2 rounded-full px-3.5 py-2 text-xs text-brand-800 sm:inline-flex">
          <Icon name="shield" size={14} />
          Super Administrator
        </span>
        <AccountMenu compact links={[{ label: 'Global settings', to: '/platform/settings', icon: 'settings' }]} />
      </div>
    </header>
  );
}
