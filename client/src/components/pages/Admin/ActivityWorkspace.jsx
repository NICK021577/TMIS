import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageWrapper } from '../../layout/PageWrapper';
import { Badge, Button, Icon, Tabs } from '../../ui';
import { useStore } from '../../../hooks/useStore';
import AttendanceTab from '../../activity/AttendanceTab';
import BudgetTab from '../../activity/BudgetTab';
import { OverviewTab, ParticipantsTab, PlanTab, ResourcesTab, SessionsTab, StaffingTab } from '../../activity/tabsCore';
import { CertificatesTab, DocumentsTab, FeedbackTab, OutputsTab, ReentryTab } from '../../activity/tabsRecords';

const TABS = [
  { id: 'overview',     label: 'Overview' },
  { id: 'plan',         label: 'Plan & Agencies' },
  { id: 'sessions',     label: 'Sessions' },
  { id: 'staffing',     label: 'Staffing' },
  { id: 'participants', label: 'Participants' },
  { id: 'attendance',   label: 'Attendance' },
  { id: 'resources',    label: 'Resources' },
  { id: 'budget',       label: 'Budget' },
  { id: 'documents',    label: 'Documents' },
  { id: 'outputs',      label: 'Outputs' },
  { id: 'feedback',     label: 'Feedback' },
  { id: 'reentry',      label: 'Reentry Plans' },
  { id: 'certificates', label: 'Certificates' },
];

/**
 * ActivityWorkspace — everything about one activity, one tab per concern.
 * Route: /activities/:id
 */
export default function ActivityWorkspace({ notify }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activities } = useStore();
  const [tab, setTab] = useState('overview');

  const activity = activities.find((a) => String(a.id) === id);

  if (!activity) {
    return (
      <PageWrapper>
        <div className="glass-panel mx-auto mt-10 grid max-w-md place-items-center gap-3 rounded-[18px] p-10 text-center">
          <Icon name="search" size={22} className="text-ink-400" />
          <strong className="text-sm font-medium text-ink-950">Activity not found</strong>
          <Button onClick={() => navigate('/activities')}>Back to activities</Button>
        </div>
      </PageWrapper>
    );
  }

  const pick = setTab;

  return (
    <PageWrapper>
      <Link to="/activities" className="mb-4 inline-flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink-950">
        <Icon name="back" size={14} /> Back to activities
      </Link>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-3">
            <Badge value={activity.status} />
            <span className="text-xs text-ink-500">{activity.type}</span>
          </div>
          <h1 className="text-[22px] font-medium leading-tight tracking-[-0.3px] text-ink-950">{activity.title}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-ink-500">
            <span className="inline-flex items-center gap-1.5"><Icon name="calendar" size={14} />{activity.date}</span>
            <span className="inline-flex items-center gap-1.5"><Icon name="location" size={14} />{activity.venue}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon="edit" onClick={() => notify?.('Edit activity form opened')}>Edit activity</Button>
          <Button variant="secondary" icon="more" aria-label="More" />
        </div>
      </div>

      <Tabs tabs={TABS} value={tab} onChange={pick} />

      {tab === 'overview'     && <OverviewTab activity={activity} goTab={pick} notify={notify} />}
      {tab === 'plan'         && <PlanTab notify={notify} />}
      {tab === 'sessions'     && <SessionsTab notify={notify} />}
      {tab === 'staffing'     && <StaffingTab notify={notify} />}
      {tab === 'participants' && <ParticipantsTab activity={activity} goTab={pick} notify={notify} />}
      {tab === 'attendance'   && <AttendanceTab activity={activity} notify={notify} />}
      {tab === 'resources'    && <ResourcesTab notify={notify} />}
      {tab === 'budget'       && <BudgetTab activity={activity} />}
      {tab === 'documents'    && <DocumentsTab notify={notify} />}
      {tab === 'outputs'      && <OutputsTab notify={notify} />}
      {tab === 'feedback'     && <FeedbackTab notify={notify} />}
      {tab === 'reentry'      && <ReentryTab notify={notify} />}
      {tab === 'certificates' && <CertificatesTab notify={notify} />}
    </PageWrapper>
  );
}
