import { useConfirm } from '../modals/confirmContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../hooks/useStore';
import { AgencyMark } from '../ui';
import { NavButton, NavItem, NavLabel, SidebarFrame } from './nav';

const WORKSPACE = [
  { label: 'Dashboard',    icon: 'grid',     to: '/dashboard' },
  { label: 'Calendar',     icon: 'calendar', to: '/calendar',  roles: ['Agency Administrator', 'Super Admin', 'Committee Member'] },
  { label: 'Activities',   icon: 'clock',    to: '/activities' },
  { label: 'Participants', icon: 'users',    to: '/participants' },
  { label: 'Budget',       icon: 'award',    to: '/budget',    roles: ['Agency Administrator', 'Super Admin'] },
  { label: 'Reports',      icon: 'chart',    to: '/reports' },
];

const ADMIN = [
  { label: 'Messaging',       icon: 'message',  to: '/messaging' },
  { label: 'About agency',    icon: 'building', to: '/about' },
  { label: 'Agency settings', icon: 'settings', to: '/settings', roles: ['Agency Administrator', 'Super Admin'] },
];

export function Sidebar({ open = false, onClose }) {
  const { role, logout } = useAuth();
  const confirm = useConfirm();
  const { profile } = useStore();
  const navigate = useNavigate();
  const visible = (items) => items.filter((i) => !i.roles || i.roles.includes(role));

  return (
    <SidebarFrame
      open={open}
      onClose={onClose}
      label="Main"
      brand={
        <div className="flex min-w-0 items-center gap-3">
          <AgencyMark size={40} />
          <div className="min-w-0 leading-tight">
            <strong className="block truncate text-[15px] font-medium text-ink-950">{profile.shortName}</strong>
            <small className="block truncate text-xs text-ink-700">Training and Extension</small>
          </div>
        </div>
      }
      footer={<NavButton icon="logout" danger onClick={async () => { if (await confirm({ tone: 'signout', title: 'Sign out of UniFyle?', message: 'You will need to sign in again to continue.', confirmLabel: 'Sign out' })) { logout(); navigate('/'); } }}>Sign out</NavButton>}
    >
      <div className="space-y-0.5">
        <NavLabel>Workspace</NavLabel>
        {visible(WORKSPACE).map((i) => <NavItem key={i.to} {...i} />)}
      </div>
      <div className="space-y-0.5">
        <NavLabel>Administration</NavLabel>
        {visible(ADMIN).map((i) => <NavItem key={i.to} {...i} />)}
      </div>
    </SidebarFrame>
  );
}
