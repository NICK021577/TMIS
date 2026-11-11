import { Icon } from './Icon';

/**
 * Button — primary / secondary / ghost / danger variants
 */
export function Button({
  children,
  variant = 'primary',
  icon,
  iconRight,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  size = 'md',
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-lg border transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap';

  const sizes = {
    sm: 'h-8  px-3  text-xs',
    md: 'h-9  px-4  text-xs',
    lg: 'h-11 px-5  text-sm',
  };

  const variants = {
    primary:
      'bg-green-700 text-white border-transparent shadow-sm hover:bg-green-800 active:bg-green-900',
    secondary:
      'bg-white text-ink-800 border-line hover:bg-green-50 active:bg-green-100',
    ghost:
      'bg-transparent text-green-700 border-transparent hover:bg-green-50',
    danger:
      'bg-danger text-white border-transparent hover:bg-red-700',
    'ghost-white':
      'bg-transparent text-white/80 border-white/20 hover:bg-white/10 hover:text-white',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {icon && <Icon name={icon} size={size === 'sm' ? 14 : 16} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === 'sm' ? 14 : 16} />}
    </button>
  );
}

/**
 * IconButton — square icon-only button
 */
export function IconButton({ icon, onClick, label, variant = 'default', size = 36, className = '' }) {
  const variants = {
    default: 'bg-white border-line text-ink-600 hover:bg-green-50',
    ghost:   'bg-transparent border-transparent text-white/70 hover:bg-white/10 hover:text-white',
    green:   'bg-green-100 border-transparent text-green-700 hover:bg-green-200',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{ width: size, height: size }}
      className={`inline-grid place-items-center rounded-lg border transition-colors ${variants[variant]} ${className}`}
    >
      <Icon name={icon} size={size * 0.47} />
    </button>
  );
}
