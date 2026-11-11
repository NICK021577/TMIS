import { PageWrapper, PageHeader } from '../../layout/PageWrapper';
export default function Settings() {
  return (
    <PageWrapper>
      <PageHeader eyebrow="ADMINISTRATION" title="Agency Settings" subtitle="Branding, categories, and configuration." />
      <div className="bg-white border border-line rounded-xl p-12 grid place-items-center text-center shadow-card">
        <p className="text-xs text-ink-500">Settings page — coming soon.</p>
      </div>
    </PageWrapper>
  );
}
