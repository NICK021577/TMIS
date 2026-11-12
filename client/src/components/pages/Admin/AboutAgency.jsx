import { PageWrapper, PageHeader } from '../../layout/PageWrapper';
import { Badge, Button, Icon, Panel, PanelTitle } from '../../ui';
import { AGENCY } from '../../../data/mockData';
import { useStore } from '../../../hooks/useStore';
import { AgencyMark } from '../../ui/AgencyMark';

export default function AboutAgency({ notify }) {
  const { activities, profile } = useStore();
  const upcoming = activities.filter((a) => a.status !== 'Completed');
  const values = profile.values.split(';').map((v) => v.trim()).filter(Boolean);
  return (
    <PageWrapper>
      <PageHeader
        eyebrow="Administration"
        title="About agency"
        subtitle="This is what participants see on your public agency page."
      >
        <Button variant="secondary" icon="link" onClick={() => notify?.('Public page link copied')}>Copy public link</Button>
      </PageHeader>

      <Panel pad={false} className="mb-5 overflow-hidden">
        <div className="h-28 bg-gradient-to-br from-brand-900 via-brand-700 to-brand-400" />
        <div className="flex flex-wrap items-end gap-4 px-6 pb-6">
          <AgencyMark size={80} className="-mt-10 ring-4 ring-white" />
          <div className="min-w-0 flex-1 pt-3">
            <h2 className="text-xl font-medium tracking-[-0.4px] text-ink-950">{profile.name}</h2>
            <p className="mt-1 text-[13px] text-ink-500">{profile.shortName} · {AGENCY.region} · {AGENCY.contact}</p>
          </div>
          <div className="glass-inset rounded-xl px-4 py-2 text-center">
            <strong className="block text-lg font-medium leading-none text-ink-950">{AGENCY.subscribers}</strong>
            <span className="text-xs text-ink-500">Subscribers</span>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <Panel>
            <PanelTitle title="Mission" />
            <p className="text-sm leading-relaxed text-ink-700">{profile.mission}</p>
          </Panel>
          <Panel>
            <PanelTitle title="Vision" />
            <p className="text-sm leading-relaxed text-ink-700">{profile.vision}</p>
          </Panel>
          <Panel>
            <PanelTitle title="Mandate" />
            <p className="text-sm leading-relaxed text-ink-700">{profile.mandate}</p>
          </Panel>
          <Panel>
            <PanelTitle title="Core values" />
            <div className="flex flex-wrap gap-2">
              {values.map((v) => (
                <span key={v} className="glass-inset rounded-full px-3.5 py-1.5 text-[13px] font-medium text-brand-800">{v}</span>
              ))}
            </div>
          </Panel>
        </div>

        <Panel className="h-fit">
          <PanelTitle title="Public activities" subtitle="Visible to participants" />
          <ul className="space-y-3">
            {upcoming.map((a) => (
              <li key={a.id} className="glass-inset flex items-start gap-3 rounded-xl p-3">
                <Icon name="calendar" size={18} className="mt-0.5 flex-shrink-0 text-brand-600" />
                <div className="min-w-0 flex-1">
                  <strong className="block text-[13px] font-medium leading-snug text-ink-950">{a.title}</strong>
                  <span className="text-xs text-ink-500">{a.date}</span>
                </div>
                <Badge value={a.status} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </PageWrapper>
  );
}
