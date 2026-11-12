import { createContext, useContext, useState } from 'react';

/**
 * Roles in the system:
 *  - 'Super Admin'           → platform-level access
 *  - 'Agency Administrator'  → full access within their agency
 *  - 'Committee Member'      → view-only on most pages
 *  - 'Resource Person'       → limited view
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('unifyle:user')) ?? null; } catch { return null; }
  });
  // user shape: { name, email, role, agency }

  function login(userData) {
    setUser(userData);
    try { sessionStorage.setItem('unifyle:user', JSON.stringify(userData)); } catch { /* storage unavailable */ }
  }

  // Demo only: lets the console simulate other roles ("View as").
  function switchRole(nextRole) {
    setUser((u) => {
      const next = u ? { ...u, role: nextRole } : u;
      try { sessionStorage.setItem('unifyle:user', JSON.stringify(next)); } catch { /* storage unavailable */ }
      return next;
    });
  }

  function logout() {
    setUser(null);
    try { sessionStorage.removeItem('unifyle:user'); } catch { /* storage unavailable */ }
  }

  const isLoggedIn = !!user;
  const role = user?.role ?? null;

  // Permission helpers
  const can = {
    viewCalendar: (r) => ['Agency Administrator', 'Super Admin', 'Committee Member'].includes(r ?? role),
    viewBudget:   (r) => ['Agency Administrator', 'Super Admin'].includes(r ?? role),
    createActivity: (r) => ['Agency Administrator', 'Super Admin'].includes(r ?? role),
    viewSettings: (r) => ['Agency Administrator', 'Super Admin'].includes(r ?? role),
    viewPlatform: (r) => (r ?? role) === 'Super Admin',
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole, isLoggedIn, role, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
