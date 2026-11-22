import { useConfirm } from '../../modals/confirmContext';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageWrapper } from '../../layout/PageWrapper';
import { Badge, Button, Icon, Tabs } from '../../ui';
import { useStore } from '../../../hooks/useStore';
import AttendanceTab from '../../activity/AttendanceTab';
import { AccessContext, EditContext } from '../../activity/editContext';
import { useAuth } from '../../../context/AuthContext';
import { activityRole, canEditAnything, editSummary, tabLevel } from '../../../lib/activityAccess';
import BudgetTab from '../../activity/BudgetTab';
import { OverviewTab, ParticipantsTab, PlanTab, ResourcesTab, SessionsTab, StaffingTab } from '../../activity/tabsCore';
import { CertificatesTab, DocumentsTab, FeedbackTab, OutputsTab, ReentryTab } from '../../activity/tabsRecords';
import { ReportTab } from '../../activity/ReportTab';

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
  { id: 'report',       label: 'Report' },
];

/**
 * ActivityWorkspace — everything about one activity, one tab per concern.
 * Route: /activities/:id
 */
export default function ActivityWorkspace({ notify }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activities, details, restoreDetails, updateActivity, staffDays } = useStore();
  const { user, role } = useAuth();
  const [tab, setTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [snapshot, setSnapshot] = useState(null);
  const confirm = useConfirm();

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

  // What this person may edit here comes from their role in THIS activity (Staffing tab)
  const aRole = activityRole(staffDays, user?.email);
  const fullAccess = role === 'Agency Administrator' || role === 'Super Admin';
  const level = tabLevel(role, aRole, tab);
  const mayEdit = canEditAnything(role, aRole);
  const roleLabel = fullAccess ? 'Administrator' : aRole;

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
          {!mayEdit ? (
            <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-ink-100 px-3 py-1.5 text-xs text-ink-600"><Icon name="lock" size={13} />View only</span>
          ) : editing ? (
            <>
              <Button variant="secondary" onClick={async () => { if (await confirm({ tone: 'warn', title: 'Discard your changes?', message: 'Anything you changed since pressing Edit activity will be lost.', confirmLabel: 'Discard changes', cancelLabel: 'Keep editing' })) { if (snapshot) { restoreDetails(activity.id, snapshot.details); updateActivity(activity.id, { capacity: snapshot.capacity }); } setEditing(false); notify?.('Changes discarded'); } }}>Cancel</Button>
              <Button icon="check" onClick={() => { setEditing(false); notify?.('Changes saved'); }}>Save changes</Button>
            </>
          ) : (
            <Button variant="secondary" icon="edit" onClick={() => { setSnapshot({ details: details[activity.id] ?? null, capacity: activity.capacity }); setEditing(true); }}>Edit activity</Button>
          )}
        </div>
      </div>

      {editing && mayEdit && (
        <div className="mb-4 flex items-center gap-2.5 rounded-2xl bg-brand-100/70 px-4 py-2.5 text-[13px] text-brand-900">
          <Icon name="edit" size={15} />
          <span><strong className="font-medium">Editing mode.</strong> You can edit {editSummary(role, aRole)}.{aRole === 'Committee' || fullAccess ? '' : ' Everything else stays read-only.'} Press Save changes when you are done.</span>
        </div>
      )}
      {!mayEdit && (
        <div className="mb-4 flex items-center gap-2.5 rounded-2xl bg-ink-100/70 px-4 py-2.5 text-[13px] text-ink-700">
          <Icon name="lock" size={15} />
          <span>{aRole ? <>You are <strong className="font-medium">{aRole}</strong> in this activity, which has no editing rights here.</> : <>You are not assigned to this activity, so every module is read-only.</>}</span>
        </div>
      )}
      {mayEdit && roleLabel && !fullAccess && !editing && (
        <p className="mb-3 text-xs text-ink-500">Your role in this activity: <strong className="font-medium text-ink-800">{roleLabel}</strong>. You can edit {editSummary(role, aRole)}{aRole === 'Committee' ? '.' : '; other modules are read-only.'}</p>
      )}

      <Tabs tabs={TABS} value={tab} onChange={pick} />

      <EditContext.Provider value={editing && level === 'edit'}>
      <AccessContext.Provider value={{ level, editing, label: roleLabel }}>

      {tab === 'overview'     && <OverviewTab activity={activity} goTab={pick} notify={notify} />}
      {tab === 'plan'         && <PlanTab activity={activity} notify={notify} />}
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
      {tab === 'certificates' && <CertificatesTab activity={activity} notify={notify} />}
      {tab === 'report'       && <ReportTab activity={activity} notify={notify} />}
      </AccessContext.Provider>
      </EditContext.Provider>
    </PageWrapper>
  );
}
