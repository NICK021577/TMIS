/**
 * AppShell — full-bleed app layout (sidebar runs the full height, like Slack / Linear):
 *
 *   ┌────────────┬─────────────────────────────────┐
 *   │ sidebar    │ header                          │
 *   │ (brand,    ├─────────────────────────────────┤
 *   │  nav,      │ content sheet (scrolls)         │
 *   │  powered)  │                                 │
 *   └────────────┴─────────────────────────────────┘
 *
 * Only the content sheet scrolls. `style` lets the agency console override the
 * brand colour variables; `tint` makes the background follow the brand hue.
 */
export function AppShell({ header, sidebar, children, style, tint }) {
  return (
    <div className="app-bg flex h-screen overflow-hidden" style={style} data-tint={tint ? 'on' : undefined}>
      {sidebar}
      <div className="flex min-w-0 flex-1 flex-col">
        {header}
        <main id="main" className="sheet min-h-0 flex-1 overflow-y-auto max-lg:!rounded-none max-lg:!border-l-0 lg:rounded-tl-[24px]">
          {children}
        </main>
      </div>
      <div id="overlay-root" />
    </div>
  );
}
