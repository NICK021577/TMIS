import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toast } from './components/ui';
import { useToast } from './hooks/useToast';

// Layout
import MainLayout from './components/layout/MainLayout';

// Guest
import Login from './components/pages/Guest/Login';

// Admin pages (stubbed — to be built out)
import Dashboard    from './components/pages/Admin/Dashboard';
import Activities   from './components/pages/Admin/Activities';
import Participants from './components/pages/Admin/Participants';
import Attendance   from './components/pages/Admin/Attendance';
import Budget       from './components/pages/Admin/Budget';
import Reports      from './components/pages/Admin/Reports';
import Messaging    from './components/pages/Admin/Messaging';
import AboutAgency  from './components/pages/Admin/AboutAgency';
import Settings     from './components/pages/Admin/Settings';

// Super Admin
import Platform        from './components/pages/Super_Admin/Platform';
import RegisterAgency  from './components/pages/Super_Admin/RegisterAgency';

// Not Found
import NotFound from './components/pages/NotFound/NotFound';

function AppRoutes() {
  const { toast, notify } = useToast();

  return (
    <>
      <Routes>
        {/* ── Guest ── */}
        <Route path="/"  element={<Login />} />

        {/* ── Admin (wrapped in layout) ── */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard"    element={<Dashboard notify={notify} />} />
          <Route path="/activities"   element={<Activities notify={notify} />} />
          <Route path="/activities/:id" element={<Activities notify={notify} />} />
          <Route path="/participants" element={<Participants notify={notify} />} />
          <Route path="/attendance"   element={<Attendance notify={notify} />} />
          <Route path="/budget"       element={<Budget notify={notify} />} />
          <Route path="/reports"      element={<Reports notify={notify} />} />
          <Route path="/messaging"    element={<Messaging notify={notify} />} />
          <Route path="/about"        element={<AboutAgency />} />
          <Route path="/settings"     element={<Settings notify={notify} />} />
        </Route>

        {/* ── Super Admin ── */}
        <Route path="/platform"         element={<Platform notify={notify} />} />
        <Route path="/register-agency"  element={<RegisterAgency notify={notify} />} />

        {/* ── Fallback ── */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Toast message={toast} />
    </>
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
