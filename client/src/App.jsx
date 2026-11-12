import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreProvider';
import { Toast } from './components/ui';
import { useToast } from './hooks/useToast';

// Layout
import MainLayout from './components/layout/MainLayout';

// Guest
import Login from './components/pages/Guest/Login';

// Admin pages (stubbed — to be built out)
import Dashboard    from './components/pages/Admin/Dashboard';
import Calendar     from './components/pages/Admin/Calendar';
import Activities   from './components/pages/Admin/Activities';
import ActivityWorkspace from './components/pages/Admin/ActivityWorkspace';
import Participants from './components/pages/Admin/Participants';
import Budget       from './components/pages/Admin/Budget';
import Reports      from './components/pages/Admin/Reports';
import Messaging    from './components/pages/Admin/Messaging';
import AboutAgency  from './components/pages/Admin/AboutAgency';
import Settings     from './components/pages/Admin/Settings';

// Super Admin
import SuperAdminLayout  from './components/layout/SuperAdminLayout';
import PlatformDashboard from './components/pages/Super_Admin/PlatformDashboard';
import Applications      from './components/pages/Super_Admin/Applications';
import Agencies          from './components/pages/Super_Admin/Agencies';
import PlatformUsers     from './components/pages/Super_Admin/PlatformUsers';
import GlobalSettings    from './components/pages/Super_Admin/GlobalSettings';
import AuditLog          from './components/pages/Super_Admin/AuditLog';
import RegisterAgency  from './components/pages/Super_Admin/RegisterAgency';

// Not Found
import NotFound from './components/pages/NotFound/NotFound';

function AppRoutes() {
  const { toast, notify } = useToast();

  return (
    <StoreProvider notify={notify}>
      <Routes>
        {/* ── Guest ── */}
        <Route path="/"  element={<Login />} />

        {/* ── Admin (wrapped in layout) ── */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard"    element={<Dashboard notify={notify} />} />
          <Route path="/calendar"     element={<Calendar notify={notify} />} />
          <Route path="/activities"   element={<Activities />} />
          <Route path="/activities/:id" element={<ActivityWorkspace notify={notify} />} />
          <Route path="/participants" element={<Participants notify={notify} />} />
          <Route path="/attendance"   element={<Navigate to="/activities" replace />} />
          <Route path="/budget"       element={<Budget notify={notify} />} />
          <Route path="/reports"      element={<Reports notify={notify} />} />
          <Route path="/messaging"    element={<Messaging notify={notify} />} />
          <Route path="/about"        element={<AboutAgency notify={notify} />} />
          <Route path="/settings"     element={<Settings notify={notify} />} />
        </Route>

        {/* ── Super Admin ── */}
        <Route path="/platform" element={<SuperAdminLayout notify={notify} />}>
          <Route index                element={<PlatformDashboard />} />
          <Route path="applications"  element={<Applications />} />
          <Route path="agencies"      element={<Agencies />} />
          <Route path="users"         element={<PlatformUsers />} />
          <Route path="settings"      element={<GlobalSettings />} />
          <Route path="audit"         element={<AuditLog />} />
        </Route>
        <Route path="/register-agency"  element={<RegisterAgency notify={notify} />} />

        {/* ── Fallback ── */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Toast message={toast} />
    </StoreProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
