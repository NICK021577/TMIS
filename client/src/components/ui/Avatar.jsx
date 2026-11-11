/**
 * Avatar — initials-based user avatar
 */
export function Avatar({ name = '', size = 'md', className = '' }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const sizes = {
    xs: 'w-6  h-6  text-[9px]',
    sm: 'w-8  h-8  text-[10px]',
    md: 'w-9  h-9  text-xs',
    lg: 'w-14 h-14 text-base',
  };

  return (
    <span
      aria-label={name}
      className={`inline-grid place-items-center rounded-full bg-green-100 text-green-900 font-bold flex-shrink-0 ${sizes[size]} ${className}`}
    >
      {initials}
    </span>
  );
}
