import { PageWrapper, PageHeader } from '../../layout/PageWrapper';
export default function Messaging() {
  return (
    <PageWrapper>
      <PageHeader eyebrow="ADMINISTRATION" title="Messaging" subtitle="Group announcements and threads." />
      <div className="bg-white border border-line rounded-xl p-12 grid place-items-center text-center shadow-card">
        <p className="text-xs text-ink-500">Messaging page — coming soon.</p>
      </div>
    </PageWrapper>
  );
}
