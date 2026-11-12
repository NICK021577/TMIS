import { useNavigate } from 'react-router-dom';
import { PageWrapper, PageHeader } from '../../layout/PageWrapper';
import { Button, Cell, Icon, Metric, Panel, PanelTitle } from '../../ui';
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

      {oldest.length > 0 && (
        <button
          onClick={() => navigate('/platform/applications')}
          className="banner-pastel mb-5 flex w-full items-center gap-4 rounded-[20px] p-5 text-left ring-1 ring-white/80 transition-transform hover:-translate-y-0.5"
        >
          <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-white/70 text-brand-700 ring-1 ring-white"><Icon name="file" size={20} /></span>
          <span className="min-w-0 flex-1">
            <strong className="block text-[15px] font-medium text-ink-950">{openApplications.length} agency {openApplications.length === 1 ? 'application needs' : 'applications need'} a decision</strong>
            <span className="block truncate text-[13px] text-ink-600">Oldest: {oldest[0].agency} · submitted {oldest[0].submitted}</span>
          </span>
          <span className="hidden items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-[13px] font-medium text-white sm:inline-flex">Review <Icon name="arrow" size={14} /></span>
        </button>
      )}

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
