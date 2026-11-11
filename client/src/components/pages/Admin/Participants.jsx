import { PageWrapper, PageHeader } from '../../layout/PageWrapper';
export default function Participants() {
  return (
    <PageWrapper>
      <PageHeader eyebrow="WORKSPACE" title="Participants" subtitle="Registry of enrolled participants." />
      <div className="bg-white border border-line rounded-xl p-12 grid place-items-center text-center shadow-card">
        <p className="text-xs text-ink-500">Participants page — coming soon.</p>
      </div>
    </PageWrapper>
  );
}
