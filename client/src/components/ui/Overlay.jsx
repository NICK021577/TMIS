import { createPortal } from 'react-dom';

/**
 * Overlay — renders modals and drawers above the whole app, not inside the page.
 *
 * Why: the page sheet uses blur and clipping, which turns `position: fixed` into "fixed inside the sheet",
 * so a dialog opened from a page was cut off and sat inside it. The overlay root lives in AppShell, outside
 * the sheet but inside the app wrapper, so the agency brand colours still apply. Without a shell
 * (public pages) it falls back to the document body.
 */
export function Overlay({ children }) {
  const target = (typeof document !== 'undefined' && document.getElementById('overlay-root')) || (typeof document !== 'undefined' ? document.body : null);
  return target ? createPortal(children, target) : children;
}
