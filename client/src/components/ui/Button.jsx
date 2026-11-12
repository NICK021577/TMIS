import { Icon } from './Icon';

/**
 * Button — pill shaped. primary (solid blue) / secondary (white outline) / ghost / danger
 */
export function Button({
  children, variant = 'primary', icon, iconRight, onClick, type = 'button',
  disabled = false, className = '', size = 'md', ...rest
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full border font-medium whitespace-nowrap transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50';

  const sizes = {
    sm: 'h-8 px-3.5 text-xs',
    md: 'h-9 px-4 text-[13px]',
    lg: 'h-11 px-6 text-sm',
  };

  const variants = {
    primary:   'border-transparent bg-brand-600 text-white shadow-[0_4px_12px_rgba(59,114,230,0.28)] hover:bg-brand-700 active:bg-brand-800',
    secondary: 'border-white bg-white/75 text-ink-800 shadow-[0_1px_4px_rgba(70,100,200,0.10)] ring-1 ring-black/5 hover:bg-white',
    ghost:     'border-transparent bg-transparent text-brand-700 hover:bg-white/60',
    danger:    'border-transparent bg-danger text-white hover:bg-red-700',
    'ghost-white': 'border-white/30 bg-transparent text-white hover:bg-white/15',
  };

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
      {icon && <Icon name={icon} size={size === 'sm' ? 14 : 15} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === 'sm' ? 14 : 15} />}
    </button>
  );
}

/** IconButton — round icon-only button */
export function IconButton({ icon, onClick, label, variant = 'default', size = 36, className = '' }) {
  const variants = {
    default: 'border-white bg-white/75 text-ink-600 ring-1 ring-black/5 hover:bg-white hover:text-ink-950',
    ghost:   'border-transparent bg-transparent text-ink-500 hover:bg-white/60 hover:text-ink-950',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{ width: size, height: size }}
      className={`inline-grid place-items-center rounded-full border transition-colors ${variants[variant]} ${className}`}
    >
      <Icon name={icon} size={Math.round(size * 0.46)} />
    </button>
  );
}
