import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Icon, Popover } from '../ui';
import { useAuth } from '../../context/AuthContext';
import HelpModal from './HelpModal';

const item = 'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] text-ink-800 transition-colors hover:bg-white/60';

/**
 * AccountMenu — the avatar in the header. `links` differ between the agency and platform consoles.
 * Signing out lives at the bottom of the sidebar, not here.
 */
export default function AccountMenu({ links = [], compact = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [help, setHelp] = useState(false);

  return (
    <>
      <Popover
        width={264}
        trigger={({ open, toggle }) => (
          <button onClick={toggle} aria-expanded={open} aria-label="Account menu" className={`flex items-center gap-3 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-white/60 ${open ? 'bg-white/70' : ''}`}>
            <Avatar name={user?.name ?? 'User'} size="md" />
            <span className={`${compact ? 'hidden sm:block' : 'hidden text-left lg:block'}`}>
              <strong className="block text-[13px] font-medium leading-none text-ink-950">{user?.name ?? 'User'}</strong>
              {!compact && <small className="mt-1 block text-[11px] leading-none text-ink-500">{user?.role ?? 'Agency'}</small>}
            </span>
            <Icon name="chevron" size={13} className={`hidden text-ink-500 transition-transform sm:block ${open ? 'rotate-180' : ''}`} />
          </button>
        )}
      >
        {({ close }) => (
          <div className="p-2">
            <div className="flex items-center gap-3 rounded-xl px-3 py-3">
              <Avatar name={user?.name ?? 'User'} size="md" />
              <span className="min-w-0"><strong className="block truncate text-[13px] font-medium text-ink-950">{user?.name}</strong><small className="block truncate text-xs text-ink-500">{user?.email ?? user?.role}</small></span>
            </div>
            <div className="my-1 border-t border-[var(--glass-divider)]" />
            {links.map((l) => (
              <button key={l.to} onClick={() => { close(); navigate(l.to); }} className={item}>
                <Icon name={l.icon} size={16} className="text-ink-600" />{l.label}
              </button>
            ))}
            <button onClick={() => { close(); setHelp(true); }} className={item}>
              <Icon name="help" size={16} className="text-ink-600" />Help
            </button>
          </div>
        )}
      </Popover>
      {help && <HelpModal onClose={() => setHelp(false)} />}
    </>
  );
}
