import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AppShell } from './AppShell';
import { PageTransition } from './PageTransition';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useStore } from '../../hooks/useStore';
import { brandVars } from '../../lib/brand';
import { useMenus } from '../../hooks/useMenus';
import { useAuth } from '../../context/AuthContext';
import { menuForPath } from '../../lib/menus';

/**
 * Shell for all authenticated agency pages.
 * The agency's brand colour (Settings → Branding) is applied here as CSS variables,
 * so primary buttons, active nav and tabs follow it live.
 */
export default function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { brand } = useStore();
  const { isLoggedIn } = useAuth();
  const allowed = useMenus();
  const { pathname } = useLocation();
  const menu = menuForPath(pathname);
  if (!isLoggedIn) return <Navigate to="/" replace />;
  // A menu the Agency Admin switched off is closed even if someone types its address
  if (menu && !allowed.includes(menu)) return <Navigate to="/dashboard" replace />;
  return (
    <AppShell
      style={brandVars(brand)}
      tint={brand.tint}
      header={<Topbar onMenu={() => setMenuOpen(true)} />}
      sidebar={<Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />}
    >
      <PageTransition />
    </AppShell>
  );
}
