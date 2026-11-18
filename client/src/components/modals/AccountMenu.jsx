import { useNavigate } from 'react-router-dom';
import { Avatar, Icon, Popover } from '../ui';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from './confirmContext';

/** AccountMenu — the avatar in the header. `links` differ between the agency and platform consoles. */
export default function AccountMenu({ links = [], compact = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const confirm = useConfirm();

  const signOut = async (close) => {
    close();
    if (await confirm({ tone: 'signout', title: 'Sign out of UniFyle?', message: 'You will need to sign in again to continue.', confirmLabel: 'Sign out' })) { logout(); navigate('/'); }
  };

  return (
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
            <button key={l.to} onClick={() => { close(); navigate(l.to); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] text-ink-800 transition-colors hover:bg-white/60">
              <Icon name={l.icon} size={16} className="text-ink-600" />{l.label}
            </button>
          ))}
          <button onClick={() => signOut(close)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] text-ink-800 transition-colors hover:bg-red-50/70 hover:text-danger">
            <Icon name="logout" size={16} />Sign out
          </button>
        </div>
      )}
    </Popover>
  );
}
