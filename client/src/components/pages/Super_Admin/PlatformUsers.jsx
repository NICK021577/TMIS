import { useConfirm } from '../../modals/confirmContext';
import { useState } from 'react';
import { PageWrapper, PageHeader } from '../../layout/PageWrapper';
import { Avatar, Badge, Button, Cell, DataTable, Panel, SearchInput, Select, Tabs } from '../../ui';
import { usePlatform } from '../../../hooks/usePlatform';
import { PLATFORM_ADMINS, ROLES } from '../../../data/platformData';

function Admins() {
  const columns = [
    { key: 'name', label: 'Name', render: (u) => <div className="flex items-center gap-3"><Avatar name={u.name} size="sm" /><Cell title={u.name} sub={u.email} /></div> },
    { key: 'role', label: 'Role' },
    { key: 'lastSignIn', label: 'Last sign-in' },
    { key: 'status', label: 'Status', render: (u) => <Badge value={u.status} /> },
  ];
  return (
    <Panel pad={false} className="overflow-hidden">
      <DataTable columns={columns} rows={PLATFORM_ADMINS} />
    </Panel>
  );
}

function Accounts() {
  const { accounts, toggleAccount, resetPassword } = usePlatform();
  const confirm = useConfirm();
  const onToggle = async (u) => {
    const ok = await (u.status === 'Suspended'
      ? confirm({ tone: 'info', title: `Reactivate ${u.name}?`, message: 'They will be able to sign in again.', confirmLabel: 'Reactivate' })
      : confirm({ tone: 'danger', title: `Suspend ${u.name}?`, message: 'They will be signed out and blocked from signing in until you reactivate the account.', detail: 'Their records are kept.', confirmLabel: 'Suspend account' }));
    if (ok) toggleAccount(u);
  };
  const onReset = async (u) => {
    if (await confirm({ tone: 'warn', title: 'Send a password reset?', message: `A reset link will be emailed to ${u.email}.`, confirmLabel: 'Send reset email' })) resetPassword(u);
  };
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('All roles');

  const rows = accounts.filter(
    (a) => `${a.name} ${a.email}`.toLowerCase().includes(query.toLowerCase()) && (role === 'All roles' || a.role === role),
  );

  const columns = [
    { key: 'name', label: 'Account', render: (u) => <div className="flex items-center gap-3"><Avatar name={u.name} size="sm" /><Cell title={u.name} sub={u.email} /></div> },
    { key: 'role', label: 'Role' },
    {
      key: 'agencies', label: 'Agencies',
      render: (u) => (
        <div className="flex flex-wrap gap-1.5">
          {u.agencies.map((a) => <Badge key={a} value={a} tone="muted" variant="pill" />)}
        </div>
      ),
    },
    { key: 'status', label: 'Status', render: (u) => <Badge value={u.status} tone={u.status === 'Suspended' ? 'bad' : 'ok'} /> },
    {
      key: 'actions', label: '', className: 'text-right',
      render: (u) => (
        <div className="flex justify-start gap-2">
          <Button size="sm" variant="secondary" onClick={() => onReset(u)}>Reset password</Button>
          <Button size="sm" variant={u.status === 'Suspended' ? 'primary' : 'secondary'} onClick={() => onToggle(u)}>
            {u.status === 'Suspended' ? 'Reactivate' : 'Suspend'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Panel pad={false} className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 p-4">
        <SearchInput value={query} onChange={setQuery} placeholder="Search name or email…" className="w-full sm:w-72" />
        <Select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Role" className="sm:ml-auto">
          <option>All roles</option>
          {ROLES.map((r) => <option key={r}>{r}</option>)}
        </Select>
      </div>
      <DataTable columns={columns} rows={rows} empty="No account matches your filters." />
    </Panel>
  );
}

export default function PlatformUsers() {
  const [tab, setTab] = useState('accounts');
  return (
    <PageWrapper>
      <PageHeader
        eyebrow="Management"
        title="Users & access"
        subtitle="Platform administrators and every account on UniFyle. Agency Administrators manage their own staff’s roles."
      />
      <Tabs tabs={[{ id: 'accounts', label: 'All accounts' }, { id: 'admins', label: 'Platform admins' }]} value={tab} onChange={setTab} />
      {tab === 'accounts' ? <Accounts /> : <Admins />}
    </PageWrapper>
  );
}
