import { useConfirm } from '../modals/confirmContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../hooks/useStore';
import { AgencyMark } from '../ui';
import { NavButton, NavItem, NavLabel, SidebarFrame } from './nav';
import { useMenus } from '../../hooks/useMenus';
import { MENUS } from '../../lib/menus';

export function Sidebar({ open = false, onClose }) {
  const { logout } = useAuth();
  const allowed = useMenus();
  const confirm = useConfirm();
  const { profile } = useStore();
  const navigate = useNavigate();
  const group = (name) => MENUS.filter((m) => m.group === name && allowed.includes(m.key));

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
        {group('Workspace').map((i) => <NavItem key={i.to} label={i.label} icon={i.icon} to={i.to} />)}
      </div>
      <div className="space-y-0.5">
        <NavLabel>Administration</NavLabel>
        {group('Administration').map((i) => <NavItem key={i.to} label={i.label} icon={i.icon} to={i.to} />)}
      </div>
    </SidebarFrame>
  );
}
