import { useConfirm } from '../modals/confirmContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../hooks/usePlatform';
import { Logo } from '../ui';
import { NavButton, NavItem, NavLabel, SidebarFrame } from './nav';

const GROUPS = [
  { label: 'Platform', items: [
    { label: 'Dashboard',    icon: 'grid',     to: '/platform', end: true },
    { label: 'Applications', icon: 'file',     to: '/platform/applications', badge: true },
    { label: 'Agencies',     icon: 'building', to: '/platform/agencies' },
  ] },
  { label: 'Management', items: [
    { label: 'Users & access',  icon: 'users',    to: '/platform/users' },
    { label: 'Global settings', icon: 'settings', to: '/platform/settings' },
  ] },
  { label: 'Governance', items: [{ label: 'Audit log', icon: 'clock', to: '/platform/audit' }] },
];

export function SuperAdminSidebar({ open = false, onClose }) {
  const { logout } = useAuth();
  const confirm = useConfirm();
  const { openApplications } = usePlatform();
  const navigate = useNavigate();

  return (
    <SidebarFrame
      open={open}
      onClose={onClose}
      label="Platform"
      brand={<Logo size={36} tagline="Platform console" />}
      footer={<NavButton icon="logout" danger onClick={async () => { if (await confirm({ tone: 'signout', title: 'Sign out of UniFyle?', message: 'You will need to sign in again to continue.', confirmLabel: 'Sign out' })) { logout(); navigate('/'); } }}>Sign out</NavButton>}
    >
      {GROUPS.map((g) => (
        <div key={g.label} className="space-y-0.5">
          <NavLabel>{g.label}</NavLabel>
          {g.items.map(({ badge, ...item }) => (
            <NavItem key={item.to} {...item} count={badge ? openApplications.length : 0} />
          ))}
        </div>
      ))}
    </SidebarFrame>
  );
}
