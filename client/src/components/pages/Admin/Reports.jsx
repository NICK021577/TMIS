import { PageWrapper, PageHeader } from '../../layout/PageWrapper';
export default function Reports() {
  return (
    <PageWrapper>
      <PageHeader eyebrow="WORKSPACE" title="Reports & Analytics" subtitle="Data insights and outcome reports." />
      <div className="bg-white border border-line rounded-xl p-12 grid place-items-center text-center shadow-card">
        <p className="text-xs text-ink-500">Reports page — coming soon.</p>
      </div>
    </PageWrapper>
  );
}
