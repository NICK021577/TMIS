import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell } from './AppShell';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useStore } from '../../hooks/useStore';
import { brandVars } from '../../lib/brand';

/**
 * Shell for all authenticated agency pages.
 * The agency's brand colour (Settings → Branding) is applied here as CSS variables,
 * so primary buttons, active nav and tabs follow it live.
 */
export default function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { brand } = useStore();
  return (
    <AppShell
      style={brandVars(brand)}
      tint={brand.tint}
      header={<Topbar onMenu={() => setMenuOpen(true)} />}
      sidebar={<Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />}
    >
      <Outlet />
    </AppShell>
  );
}
