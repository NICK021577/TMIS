import { PageWrapper, PageHeader } from '../../layout/PageWrapper';
export default function Activities({ notify }) {
  return (
    <PageWrapper>
      <PageHeader eyebrow="WORKSPACE" title="Activities" subtitle="All training and extension activities.">
      </PageHeader>
      <div className="bg-white border border-line rounded-xl p-12 grid place-items-center text-center shadow-card">
        <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-700 grid place-items-center mb-3">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
        </div>
        <h2 className="text-lg font-bold text-ink-950">Activities</h2>
        <p className="text-xs text-ink-500 mt-1">This page is coming soon.</p>
      </div>
    </PageWrapper>
  );
}
