/**
 * PageWrapper — page content, LEFT aligned and filling the container.
 * Spacing scale (same idea as Linear / Stripe / Notion):
 *   page padding 20 → 32 → 40px (top 24 → 32 → 40px) · title block → content 32px · sections 32px apart · cards 16px apart
 */
export function PageWrapper({ children, className = '' }) {
  return <div className={`px-5 pb-16 pt-6 sm:px-8 sm:pt-8 lg:px-10 lg:pt-10 ${className}`}>{children}</div>;
}

/** PageHeader — title, one-line description, actions on the right. */
export function PageHeader({ eyebrow, title, subtitle, children }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1.5 text-xs text-ink-400">{eyebrow}</p>}
        <h1 className="text-2xl font-medium leading-tight tracking-[-0.4px] text-ink-950">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-[680px] text-[13px] leading-relaxed text-ink-500">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-shrink-0 flex-wrap items-center gap-3">{children}</div>}
    </div>
  );
}

/** SectionLabel — small grey heading above a block (e.g. "Overview") */
export function SectionLabel({ children, action }) {
  return (
    <div className="mb-3 mt-8 flex items-center justify-between first:mt-0">
      <h2 className="text-xs font-normal text-ink-500">{children}</h2>
      {action}
    </div>
  );
}
