import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

/**
 * MainLayout — the shell for all authenticated admin pages.
 *
 * Layout:
 *   [Sidebar 248px fixed] | [Topbar sticky + <Outlet /> scrollable]
 */
export default function MainLayout() {
  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar />

      {/* Main area offset by sidebar width */}
      <div className="ml-[248px] flex flex-col min-h-screen">
        <Topbar />

        {/* Page content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
