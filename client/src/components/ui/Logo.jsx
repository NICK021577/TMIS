import mark from '../../assets/unifyle/unifyle-mark.svg';

/** Logo — UniFyle folder mark, optionally with the wordmark beside it. */
export function Logo({ size = 40, wordmark = true, tagline, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src={mark}
        alt={wordmark ? '' : 'UniFyle'}
        width={size}
        height={size}
        className="select-none object-contain drop-shadow-[0_4px_8px_rgba(42,111,240,0.25)]"
        style={{ width: size, height: size }}
        draggable={false}
      />
      {wordmark && (
        <span className="leading-tight">
          <strong className="block text-[15px] font-semibold tracking-[-0.2px] text-ink-950">UniFyle</strong>
          {tagline && <span className="block text-[11px] text-ink-500">{tagline}</span>}
        </span>
      )}
    </span>
  );
}
