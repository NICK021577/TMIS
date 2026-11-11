import { PageWrapper, PageHeader } from '../../layout/PageWrapper';
export default function Attendance() {
  return (
    <PageWrapper>
      <PageHeader eyebrow="WORKSPACE" title="Attendance" subtitle="Track participant check-ins." />
      <div className="bg-white border border-line rounded-xl p-12 grid place-items-center text-center shadow-card">
        <p className="text-xs text-ink-500">Attendance page — coming soon.</p>
      </div>
    </PageWrapper>
  );
}
