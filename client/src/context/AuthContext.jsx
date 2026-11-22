import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

/**
 * Roles in the system:
 *  - 'Super Admin'           → platform-level access
 *  - 'Agency Administrator'  → full access within their agency
 *  - 'Committee Member'      → view-only on most pages
 *  - 'Resource Person'       → limited view
 * The role and the menus a person may open come from the server at sign-in and are refreshed on every page load.
 */

const AuthContext = createContext(null);

const KEY = 'unifyle:user';
const save = (u) => { try { sessionStorage.setItem(KEY, JSON.stringify(u)); } catch { /* storage unavailable */ } };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(KEY)) ?? null; } catch { return null; }
  });
  // user shape: { id, name, email, role, agency, agencyName, menus }  (the session itself is an httpOnly cookie)

  function login(userData) {
    setUser(userData);
    save(userData);
  }

  function logout() {
    api('/users/logout', { method: 'POST' }).catch(() => { /* the saved session is dropped either way */ });
    setUser(null);
    try { sessionStorage.removeItem(KEY); } catch { /* storage unavailable */ }
  }

  // Refresh the role and menus from the server (an administrator may have changed them), and drop a session the
  // server no longer accepts (expired, suspended). A server that cannot be reached keeps the saved session.
  useEffect(() => {
    if (!user) return undefined;
    let live = true;
    api('/users/me')
      .then(({ session: fresh }) => { if (live) setUser((u) => { if (!u) return u; const next = { ...u, ...fresh }; save(next); return next; }); })
      .catch((err) => { if (live && (err.status === 401 || err.status === 403)) { setUser(null); try { sessionStorage.removeItem(KEY); } catch { /* storage unavailable */ } } });
    return () => { live = false; };
    // runs once per page load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn, role, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
