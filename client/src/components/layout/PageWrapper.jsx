/**
 * PageWrapper — consistent max-width + padding for page content.
 * Wrap each page's inner content with this.
 *
 * Usage:
 *   <PageWrapper>
 *     <PageHeader title="Dashboard" ... />
 *     ...content...
 *   </PageWrapper>
 */
export function PageWrapper({ children, className = '' }) {
  return (
    <div className={`max-w-[1500px] mx-auto px-8 py-7 pb-16 ${className}`}>
      {children}
    </div>
  );
}

/**
 * PageHeader — standardized page heading with optional action slot
 */
export function PageHeader({ eyebrow, title, subtitle, children }) {
  return (
    <div className="flex items-start justify-between gap-5 mb-6">
      <div>
        {eyebrow && (
          <p className="text-[8px] font-black text-green-700 tracking-[1.4px] uppercase mb-1.5">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-bold text-ink-950 leading-tight tracking-[-0.55px]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 text-xs text-ink-600">{subtitle}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
          {children}
        </div>
      )}
    </div>
  );
}
