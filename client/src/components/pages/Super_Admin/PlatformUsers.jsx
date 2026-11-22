import { useConfirm } from '../../modals/confirmContext';
import { useMemo, useState } from 'react';
import { PageWrapper, PageHeader } from '../../layout/PageWrapper';
import { Avatar, Badge, Button, Callout, Cell, DataTable, Drawer, Icon, KeyValue, Metric, Panel, SearchInput, Select, Tabs } from '../../ui';
import { usePlatform } from '../../../hooks/usePlatform';
import { PLATFORM_ADMINS, ROLES } from '../../../data/platformData';

const STAFF_ROLES = ROLES.filter((r) => r !== 'Participant');
const STATUSES = ['Active', 'Invited', 'Suspended'];

/** Memberships in scope: all of them, or only the selected agency's. */
const scoped = (acc, agency) => (agency === 'All agencies' ? acc.memberships : acc.memberships.filter((m) => m.agency === agency));

/** What to show as the account's status: a suspended account wins; otherwise what its (scoped) memberships say. */
function statusOf(acc, agency) {
  if (acc.status === 'Suspended') return 'Suspended';
  const ms = scoped(acc, agency);
  if (ms.length && ms.every((m) => m.status === 'Invited')) return 'Invited';
  if (ms.length && ms.every((m) => m.status === 'Suspended')) return 'Suspended';
  return 'Active';
}

const statusTone = (s) => (s === 'Suspended' ? 'bad' : s === 'Invited' ? 'warn' : 'ok');

/** Is this membership the only active Agency Administrator of its agency? Removing it would leave the agency without one. */
const isLastAdmin = (accounts, acc, m) =>
  m.role === 'Agency Administrator' &&
  !accounts.some((a) => a.id !== acc.id && a.status !== 'Suspended' && a.memberships.some((x) => x.agency === m.agency && x.role === 'Agency Administrator' && x.status === 'Active'));

/* ───────────── platform admins ───────────── */

function Admins() {
  const columns = [
    { key: 'name', label: 'Name', render: (u) => <div className="flex items-center gap-3"><Avatar name={u.name} size="sm" /><Cell title={u.name} sub={u.email} /></div> },
    { key: 'role', label: 'Role' },
    { key: 'lastSignIn', label: 'Last sign-in' },
    { key: 'status', label: 'Status', render: (u) => <Badge value={u.status} /> },
  ];
  return (
    <div className="space-y-4">
      <Callout tone="info" icon="lock">Platform administrator accounts are dedicated: they are not members of any agency and never see an agency’s private records.</Callout>
      <Panel pad={false} className="overflow-hidden">
        <DataTable columns={columns} rows={PLATFORM_ADMINS} />
      </Panel>
    </div>
  );
}

/* ───────────── account drawer ───────────── */

function AccountDrawer({ id, onClose }) {
  const { accounts, agencies, toggleAccount, toggleMembership, removeMembership, resetPassword } = usePlatform();
  const confirm = useConfirm();
  const acc = accounts.find((a) => a.id === id);
  if (!acc) return null;
  const agencyName = (aid) => agencies.find((x) => x.id === aid)?.name ?? aid;
  const suspended = acc.status === 'Suspended';

  const onToggleAccount = async () => {
    const ok = await (suspended
      ? confirm({ tone: 'info', title: `Reactivate ${acc.name}?`, message: 'They will be able to sign in again, with the access they had in each agency.', confirmLabel: 'Reactivate account' })
      : confirm({ tone: 'danger', title: `Suspend ${acc.name}?`, message: 'They will be signed out and blocked from every agency until you reactivate the account.', detail: 'Their records are kept.', confirmLabel: 'Suspend account' }));
    if (ok) toggleAccount(acc);
  };
  const onReset = async () => {
    if (await confirm({ tone: 'warn', title: 'Send a password reset?', message: `A reset link will be emailed to ${acc.email}.`, confirmLabel: 'Send reset email' })) resetPassword(acc);
  };
  const onToggleMembership = async (m) => {
    const off = m.status !== 'Suspended';
    const ok = await (off
      ? confirm({ tone: 'danger', title: `Suspend ${acc.name} in ${m.agency}?`, message: `They lose access to ${agencyName(m.agency)} only. Their other agencies are not affected.`, confirmLabel: 'Suspend access' })
      : confirm({ tone: 'info', title: `Restore ${acc.name} in ${m.agency}?`, message: `They can open ${agencyName(m.agency)} again.`, confirmLabel: 'Restore access' }));
    if (ok) toggleMembership(acc, m.agency);
  };
  const onRemove = async (m) => {
    if (await confirm({ tone: 'danger', title: `Remove ${acc.name} from ${m.agency}?`, message: `They leave ${agencyName(m.agency)}. The account and their other agencies are kept.`, detail: 'The agency’s records they created stay with the agency.', confirmLabel: 'Remove from agency' })) removeMembership(acc, m.agency);
  };

  const footer = (
    <>
      <Button variant="secondary" onClick={onReset}>Reset password</Button>
      <Button variant={suspended ? 'primary' : 'danger'} onClick={onToggleAccount}>{suspended ? 'Reactivate account' : 'Suspend account'}</Button>
    </>
  );

  return (
    <Drawer title={acc.name} subtitle={acc.email} onClose={onClose} footer={footer} width={540}>
      <KeyValue rows={[
        ['Account status', <Badge key="s" value={acc.status} tone={acc.status === 'Suspended' ? 'bad' : 'ok'} />],
        ['Last sign-in', acc.lastSignIn],
        ['Agencies', `${acc.memberships.length} ${acc.memberships.length === 1 ? 'agency' : 'agencies'}`],
      ]} />

      <section className="space-y-2">
        <h3 className="text-[11px] font-medium uppercase tracking-wide text-ink-500">Agencies and roles</h3>
        {acc.memberships.length === 0 && <p className="glass-inset rounded-2xl p-4 text-[13px] text-ink-500">This account isn’t a member of any agency.</p>}
        <ul className="space-y-2">
          {acc.memberships.map((m) => {
            const last = isLastAdmin(accounts, acc, m);
            return (
              <li key={m.agency} className="glass-inset rounded-2xl p-3.5">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-white text-brand-700"><Icon name="building" size={16} /></span>
                  <span className="min-w-0 flex-1">
                    <strong className="block text-[13px] font-medium text-ink-950">{agencyName(m.agency)}</strong>
                    <small className="text-xs text-ink-500">{m.agency} · {m.role} · {m.status === 'Invited' ? 'invited' : 'joined'} {m.joined}</small>
                  </span>
                  <Badge value={m.status} tone={statusTone(m.status)} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {m.status !== 'Invited' && (
                    <Button size="sm" variant="secondary" disabled={last && m.status !== 'Suspended'} onClick={() => onToggleMembership(m)}>
                      {m.status === 'Suspended' ? 'Restore access' : 'Suspend access'}
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" disabled={last} onClick={() => onRemove(m)}>Remove from agency</Button>
                  {last && <small className="text-[11px] text-amber-700">Only Agency Administrator of {m.agency}. Assign another first.</small>}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="text-[13px] leading-relaxed text-ink-600">
        One account works across every agency. Roles and access are set per agency by its own Agency Administrators; here you can suspend access to one agency or the whole account.
      </p>
    </Drawer>
  );
}

/* ───────────── accounts ───────────── */

function Accounts({ kind }) {
  const { accounts, agencies } = usePlatform();
  const [query, setQuery] = useState('');
  const [agency, setAgency] = useState('All agencies');
  const [role, setRole] = useState('All roles');
  const [status, setStatus] = useState('All statuses');
  const [openId, setOpenId] = useState(null);

  const participants = kind === 'participants';
  const roleOptions = participants ? ['Participant'] : STAFF_ROLES;

  // The tab decides who is listed: staff and admins, or participants.
  const inTab = useMemo(
    () => accounts.filter((a) => a.memberships.some((m) => (participants ? m.role === 'Participant' : m.role !== 'Participant')) || (!participants && a.memberships.length === 0)),
    [accounts, participants],
  );

  const q = query.trim().toLowerCase();
  const hidden = participants && q.length < 2;   // participant data is personal: search first, never browse the whole list

  const rows = hidden ? [] : inTab.filter((a) => {
    const ms = scoped(a, agency).filter((m) => (participants ? m.role === 'Participant' : m.role !== 'Participant'));
    if (agency !== 'All agencies' && ms.length === 0) return false;
    if (role !== 'All roles' && !ms.some((m) => m.role === role)) return false;
    if (status !== 'All statuses' && statusOf(a, agency) !== status) return false;
    return !q || `${a.name} ${a.email}`.toLowerCase().includes(q);
  });

  const columns = [
    { key: 'name', label: 'Account', render: (u) => <div className="flex items-center gap-3"><Avatar name={u.name} size="sm" /><Cell title={u.name} sub={u.email} /></div> },
    {
      key: 'memberships', label: 'Agencies and roles',
      render: (u) => (
        <div className="flex flex-wrap gap-1.5">
          {u.memberships.length === 0 && <span className="text-xs text-ink-400">No agency yet</span>}
          {u.memberships.map((m) => {
            const match = agency === 'All agencies' || m.agency === agency;
            return (
              <span key={m.agency} title={`${m.agency}: ${m.role}, ${m.status.toLowerCase()}`}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] ${match ? 'bg-brand-50 text-brand-900 ring-1 ring-brand-100' : 'bg-ink-100/70 text-ink-400'}`}>
                <strong className="font-medium">{m.agency}</strong><span className="opacity-60">·</span>{m.role}
                {m.status !== 'Active' && <i className={`h-1.5 w-1.5 rounded-full ${m.status === 'Suspended' ? 'bg-red-500' : 'bg-amber-500'}`} />}
              </span>
            );
          })}
        </div>
      ),
    },
    { key: 'status', label: 'Status', render: (u) => { const s = statusOf(u, agency); return <Badge value={s} tone={statusTone(s)} />; } },
    { key: 'lastSignIn', label: 'Last sign-in', render: (u) => <span className="whitespace-nowrap text-ink-600">{u.lastSignIn}</span> },
    { key: 'actions', label: '', render: (u) => <Button size="sm" variant="secondary" onClick={() => setOpenId(u.id)}>Manage</Button> },
  ];

  const empty = hidden
    ? 'Participant accounts are personal data. Search by name or email to find one.'
    : 'No account matches your filters.';

  return (
    <>
      <Panel pad={false} className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-4">
          <SearchInput value={query} onChange={setQuery} placeholder="Search name or email…" className="w-full sm:w-72" />
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <Select value={agency} onChange={(e) => setAgency(e.target.value)} aria-label="Agency">
              <option>All agencies</option>
              {agencies.map((a) => <option key={a.id} value={a.id}>{a.id} · {a.name}</option>)}
            </Select>
            <Select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Role">
              <option>All roles</option>
              {roleOptions.map((r) => <option key={r}>{r}</option>)}
            </Select>
            <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
              <option>All statuses</option>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-[var(--glass-divider)] px-5 py-2 text-xs text-ink-500">
          <span>{hidden ? `${inTab.length} participant accounts` : `${rows.length} shown`}{agency !== 'All agencies' ? ` in ${agency}` : ''}</span>
          {(agency !== 'All agencies' || role !== 'All roles' || status !== 'All statuses' || query) && (
            <button type="button" className="font-medium text-brand-700 hover:text-brand-900" onClick={() => { setQuery(''); setAgency('All agencies'); setRole('All roles'); setStatus('All statuses'); }}>Clear filters</button>
          )}
        </div>
        <DataTable columns={columns} rows={rows} onRowClick={(u) => setOpenId(u.id)} empty={empty} />
      </Panel>
      {openId && <AccountDrawer id={openId} onClose={() => setOpenId(null)} />}
    </>
  );
}

/* ───────────── page ───────────── */

export default function PlatformUsers() {
  const { accounts } = usePlatform();
  const [tab, setTab] = useState('staff');
  const staff = accounts.filter((a) => a.memberships.some((m) => m.role !== 'Participant'));
  const multi = accounts.filter((a) => a.memberships.length > 1).length;

  return (
    <PageWrapper>
      <PageHeader
        eyebrow="Management"
        title="Users & access"
        subtitle="One account per person, across every agency. Roles are set per agency by its Agency Administrators."
      />

      <div className="mb-5 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Metric label="Accounts" value={accounts.length} note="One per email" icon="users" />
        <Metric label="Agency administrators" value={accounts.filter((a) => a.memberships.some((m) => m.role === 'Agency Administrator')).length} note="Across all agencies" icon="shield" />
        <Metric label="In several agencies" value={multi} note="One login, many workspaces" icon="building" />
        <Metric label="Suspended" value={accounts.filter((a) => a.status === 'Suspended').length} note="Cannot sign in" tone="warn" icon="alert" />
      </div>

      <Tabs
        tabs={[{ id: 'staff', label: `Staff & admins (${staff.length})` }, { id: 'participants', label: 'Participants' }, { id: 'admins', label: 'Platform admins' }]}
        value={tab} onChange={setTab}
      />
      {tab === 'admins' ? <Admins /> : <Accounts key={tab} kind={tab} />}
    </PageWrapper>
  );
}
