import { useNavigate } from 'react-router-dom';
import { PageWrapper, PageHeader } from '../../layout/PageWrapper';
import { Button, Cell, HeroArt, Icon, Metric, Panel, PanelTitle } from '../../ui';
import { usePlatform } from '../../../hooks/usePlatform';

export default function PlatformDashboard() {
  const navigate = useNavigate();
  const { agencies, openApplications, accounts, audit } = usePlatform();
  const suspended = agencies.filter((a) => a.suspended).length;
  const oldest = [...openApplications].sort((a, b) => a.submitted.localeCompare(b.submitted));

  return (
    <PageWrapper>
      <PageHeader
        eyebrow="Platform"
        title="Platform dashboard"
        subtitle="Agencies, applications and recent activity across UniFyle."
      >
        <Button icon="plus" onClick={() => navigate('/platform/agencies')}>Create agency</Button>
      </PageHeader>

      <section className="banner-pastel relative mb-5 min-h-[220px] overflow-hidden rounded-[20px] p-6 ring-1 ring-white/80 sm:p-8">
        <HeroArt />
        <div className="relative flex h-full max-w-[520px] flex-col items-start">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-950 text-white"><Icon name="file" size={17} /></span>
            <span className="text-[17px] font-medium text-ink-950">Applications</span>
          </div>
          {oldest.length > 0 ? (
            <>
              <p className="text-[13px] leading-relaxed text-ink-600">
                <strong className="font-medium text-ink-950">{openApplications.length} agency {openApplications.length === 1 ? 'application needs' : 'applications need'} a decision.</strong>{' '}
                The oldest is {oldest[0].agency}, submitted {oldest[0].submitted}. Check their documents, then approve, request more information or reject.
              </p>
              <Button className="mt-6" onClick={() => navigate('/platform/applications')}>Review applications</Button>
            </>
          ) : (
            <>
              <p className="text-[13px] leading-relaxed text-ink-600">You are all caught up. New agency sign-ups appear here as soon as they are submitted.</p>
              <Button className="mt-6" variant="secondary" onClick={() => navigate('/platform/applications')}>View all applications</Button>
            </>
          )}
        </div>
      </section>

      <div className="mb-5 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Metric label="Active agencies" value={agencies.length - suspended} note={`${agencies.length} total`} icon="building" />
        <Metric label="Pending applications" value={openApplications.length} note="Awaiting a decision" tone="warn" icon="file" />
        <Metric label="Suspended agencies" value={suspended} note="Users cannot sign in" icon="alert" />
        <Metric label="Accounts" value={accounts.length} note="Across all agencies" icon="users" />
      </div>

      <Panel pad={false} className="overflow-hidden">
        <div className="p-5 pb-3">
          <PanelTitle title="Recent activity" subtitle="Latest sensitive actions on the platform">
            <Button variant="ghost" size="sm" iconRight="arrow" onClick={() => navigate('/platform/audit')}>View audit log</Button>
          </PanelTitle>
        </div>
        <ul>
          {audit.slice(0, 5).map((e) => (
            <li key={e.id} className="mx-2 flex items-center gap-4 rounded-xl border-b border-[var(--glass-divider)] px-3 py-3 last:border-0">
              <span className="glass-inset grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl text-brand-700"><Icon name="clock" size={17} /></span>
              <Cell title={e.action} sub={e.target} />
              <span className="ml-auto hidden text-xs text-ink-500 sm:block">{e.who}</span>
              <span className="text-xs tabular-nums text-ink-500">{e.at}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </PageWrapper>
  );
}
