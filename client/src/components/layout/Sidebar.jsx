import { NavLink, useNavigate } from 'react-router-dom';
import { Icon, Avatar } from '../ui';
import { useAuth } from '../../context/AuthContext';

const NAV_WORKSPACE = [
  { label: 'Dashboard',         icon: 'grid',     to: '/dashboard' },
  { label: 'Calendar',          icon: 'calendar', to: '/calendar',  roles: ['Agency Administrator', 'Super Admin', 'Committee Member'] },
  { label: 'Activities',        icon: 'clock',    to: '/activities' },
  { label: 'Participants',      icon: 'users',    to: '/participants' },
  { label: 'Budget',            icon: 'award',    to: '/budget',    roles: ['Agency Administrator', 'Super Admin'] },
  { label: 'Reports',           icon: 'chart',    to: '/reports' },
];

const NAV_ADMIN = [
  { label: 'Messaging',         icon: 'message',  to: '/messaging' },
  { label: 'About Agency',      icon: 'building', to: '/about' },
  { label: 'Agency Settings',   icon: 'settings', to: '/settings', roles: ['Agency Administrator', 'Super Admin'] },
];

function NavItem({ icon, label, to }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `w-full flex items-center gap-3 px-3 py-[11px] rounded-[9px] text-left text-xs font-medium transition-all duration-150 ${
          isActive
            ? 'bg-white/10 text-white shadow-[inset_3px_0_0_#f2b43c] [&_svg]:text-amber-500'
            : 'text-white/70 hover:bg-white/10 hover:text-white'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon name={icon} size={17} className={isActive ? 'text-amber-500' : 'opacity-75'} />
          {label}
        </>
      )}
    </NavLink>
  );
}

export function Sidebar() {
  const { user, role, can, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  const visibleWorkspace = NAV_WORKSPACE.filter(
    (item) => !item.roles || item.roles.includes(role)
  );
  const visibleAdmin = NAV_ADMIN.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  return (
    <aside className="fixed inset-y-0 left-0 w-[248px] bg-green-950 text-white flex flex-col z-20">

      {/* ── Brand ── */}
      <div className="h-[82px] flex items-center gap-3 px-6 border-b border-white/10 flex-shrink-0">
        <div className="w-[38px] h-[38px] grid place-items-center rounded-[11px] bg-amber-500 text-green-950 font-black text-sm tracking-tight select-none">
          TM
        </div>
        <div>
          <strong className="block text-xl font-bold leading-tight tracking-[0.4px]">TMIS</strong>
          <small className="block text-[9px] text-white/50 mt-0.5 leading-snug max-w-[130px]">
            Training Management Info System
          </small>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto px-[14px] py-[22px] space-y-[3px]">

        {/* Profile row */}
        <button className="w-full grid grid-cols-[36px_1fr_auto] items-center gap-2 px-2 pt-2 pb-3 text-left mb-2">
          <Avatar name={user?.name ?? 'User'} size="sm" className="bg-green-100 text-green-900" />
          <span>
            <strong className="block text-xs font-semibold leading-none">{user?.name ?? 'User'}</strong>
            <small className="block mt-1 text-[9px] text-white/50">{role}</small>
          </span>
          <Icon name="more" size={16} className="text-white/40" />
        </button>

        {/* Workspace section */}
        <p className="px-[11px] pb-2 text-[8px] tracking-[1.4px] font-bold text-white/40 uppercase">
          Workspace
        </p>
        {visibleWorkspace.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        {/* Administration section */}
        <p className="px-[11px] pt-5 pb-2 text-[8px] tracking-[1.4px] font-bold text-white/40 uppercase">
          Administration
        </p>
        {visibleAdmin.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      {/* ── Bottom ── */}
      <div className="border-t border-white/10 p-[14px] flex-shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-[11px] rounded-[9px] text-left text-xs font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Icon name="logout" size={17} className="opacity-75" />
          Log out
        </button>
        <p className="text-center text-[8px] text-white/25 mt-3 font-medium tracking-wide">
          Powered by TMIS
        </p>
      </div>
    </aside>
  );
}
