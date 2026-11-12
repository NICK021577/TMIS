import { useStore } from '../../hooks/useStore';
import { initialsOf } from '../../lib/brand';

/**
 * AgencyMark — the agency's uploaded logo, or (until they upload one) a neutral
 * outlined box with their initials in the brand colour.
 */
export function AgencyMark({ size = 40, className = '' }) {
  const { logo, profile } = useStore();
  return logo ? (
    <img src={logo} alt="" style={{ width: size, height: size }} className={`rounded-[28%] bg-white object-contain p-1 ring-1 ring-black/5 ${className}`} />
  ) : (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.34) }}
      className={`grid flex-shrink-0 place-items-center rounded-[28%] bg-white font-medium text-brand-700 ring-1 ring-brand-200 ${className}`}
    >
      {initialsOf(profile.shortName)}
    </span>
  );
}
