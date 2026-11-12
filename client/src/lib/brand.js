/**
 * Agency brand colour helpers.
 * The brand colour drives primary buttons, active nav, tabs, focus rings and the logo tile.
 * Status colours (red / green / amber) never change per agency.
 */

export const BRAND_PRESETS = [
  { id: 'unifyle', label: 'UniFyle Blue',    note: 'Default look',          h: 220, s: 77, l: 57 },
  { id: 'forest',  label: 'PRRI Forest',     note: 'Sustainable agriculture', h: 152, s: 52, l: 34 },
  { id: 'ocean',   label: 'Government Blue', note: 'Public service',        h: 204, s: 72, l: 42 },
  { id: 'earth',   label: 'Field Earth',     note: 'Community extension',   h: 28,  s: 58, l: 42 },
];

export const SWATCHES = ['#3b72e6', '#1f8a5b', '#0f7fc4', '#b8662b', '#7c4ddb', '#c2417a', '#0f9d9a', '#d1881b', '#4c5fd5', '#5d6b82'];

/** White text must stay readable, so the shade is limited. */
export const SHADE_MIN = 28;
export const SHADE_MAX = 57;
export const clampShade = (l) => Math.min(SHADE_MAX, Math.max(SHADE_MIN, l));

const hsl = (h, s, l) => `hsl(${Math.round(h)} ${Math.round(s)}% ${Math.round(Math.min(98, Math.max(8, l)))}%)`;

/** 7-step palette from lightest to darkest, used for the live preview */
export function scale(brand) {
  const { h, s } = brand;
  const l = clampShade(brand.l);
  return [97, 90, 78, l + 10, l, l - 10, l - 20].map((x) => hsl(h, x > 85 ? s : s, x));
}

/** CSS variables that re-skin everything built with `brand-*` utilities */
export function brandVars(brand) {
  if (!brand || brand.preset === 'unifyle') return {};
  const { h, s } = brand;
  const l = clampShade(brand.l);
  return {
    '--color-brand-50':  hsl(h, s, 97),
    '--color-brand-100': hsl(h, s, 93),
    '--color-brand-200': hsl(h, s, 85),
    '--color-brand-400': hsl(h, s, l + 16),
    '--color-brand-500': hsl(h, s, l + 8),
    '--color-brand-600': hsl(h, s, l),
    '--color-brand-700': hsl(h, s, l - 8),
    '--color-brand-800': hsl(h, s, l - 15),
    '--color-brand-900': hsl(h, s, l - 22),
    '--color-brand-950': hsl(h, s, l - 28),
    '--bh': Math.round(h),
  };
}

export function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const to = (x) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${to(f(0))}${to(f(8))}${to(f(4))}`;
}

export function hexToHsl(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0, s = 0;
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1));
    h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export const initialsOf = (shortName) => (shortName || '').trim().slice(0, 2).toUpperCase();
