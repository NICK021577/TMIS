import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AppShell } from './AppShell';
import { SuperAdminSidebar } from './SuperAdminSidebar';
import { SuperAdminTopbar } from './SuperAdminTopbar';
import { PlatformProvider } from '../../context/PlatformProvider';
import { useAuth } from '../../context/AuthContext';

/** Shell for the Platform console (/platform/*). Only the "Super Admin" role may enter. */
export default function SuperAdminLayout({ notify }) {
  const { role } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (role !== 'Super Admin') return <Navigate to="/" replace />;

  return (
    <PlatformProvider notify={notify}>
      <AppShell
        header={<SuperAdminTopbar onMenu={() => setMenuOpen(true)} />}
        sidebar={<SuperAdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />}
      >
        <Outlet />
      </AppShell>
    </PlatformProvider>
  );
}
