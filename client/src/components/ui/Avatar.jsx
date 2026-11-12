/** Avatar — initials on a soft blue gradient */
export function Avatar({ name = '', size = 'md', className = '' }) {
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const sizes = {
    xs: 'h-6 w-6 text-[9px]',
    sm: 'h-8 w-8 text-[11px]',
    md: 'h-9 w-9 text-xs',
    lg: 'h-14 w-14 text-base',
  };
  return (
    <span
      aria-label={name}
      className={`inline-grid flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-100 to-[#d9d4fa] font-medium text-brand-800 ring-2 ring-white ${sizes[size]} ${className}`}
    >
      {initials}
    </span>
  );
}
