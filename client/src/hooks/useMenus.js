import { useAuth } from '../context/AuthContext';
import { ALL_MENUS, FALLBACK_MENUS } from '../lib/menus';

/** Menus the signed-in person can open. The server works them out (role defaults + their own changes). */
export function useMenus() {
  const { user, role } = useAuth();
  if (role === 'Super Admin' || role === 'Agency Administrator') return ALL_MENUS;
  return user?.menus ?? FALLBACK_MENUS;
}
