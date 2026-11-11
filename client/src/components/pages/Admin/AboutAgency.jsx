import { PageWrapper, PageHeader } from '../../layout/PageWrapper';
export default function AboutAgency() {
  return (
    <PageWrapper>
      <PageHeader eyebrow="ADMINISTRATION" title="About Agency" subtitle="Agency profile and public information." />
      <div className="bg-white border border-line rounded-xl p-12 grid place-items-center text-center shadow-card">
        <p className="text-xs text-ink-500">About Agency page — coming soon.</p>
      </div>
    </PageWrapper>
  );
}
