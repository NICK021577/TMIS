import { useConfirm } from '../modals/confirmContext';
import { useState } from 'react';
import { Avatar, Badge, Button, Cell, DataTable, Drawer, Field, Panel, PanelTitle, inputCls } from '../ui';
import { useStore } from '../../hooks/useStore';

function InviteDrawer({ roles, onClose, onInvite }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(roles[0]?.role ?? 'Committee Member');
  const ok = /.+@.+\..+/.test(email);
  return (
    <Drawer title="Invite user" subtitle="They get an email to set up their account" onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button disabled={!ok} onClick={() => { onInvite(email.trim(), role); onClose(); }}>Send invitation</Button></>}>
      <Field label="Email address"><input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@agency.gov.ph" autoFocus /></Field>
      <Field label="Role"><select className={inputCls} value={role} onChange={(e) => setRole(e.target.value)}>{roles.map((r) => <option key={r.id}>{r.role}</option>)}</select></Field>
    </Drawer>
  );
}

/** Agency users: accounts with access to this tenant. */
export default function UsersTab({ readOnly, notify }) {
  const { users, setUsers, roles } = useStore();
  const [inviting, setInviting] = useState(false);
  const confirm = useConfirm();

  const invite = (email, role) => {
    const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    setUsers((l) => [...l, { id: Date.now(), name, email, role, status: 'Invited', updated: 'June 18, 2025' }]);
    notify?.(`Invitation sent to ${email}`);
  };
  const changeRole = (u, role) => setUsers((l) => l.map((x) => (x.id === u.id ? { ...x, role, updated: 'June 18, 2025' } : x)));
  const toggle = async (u) => {
    const ok = await (u.status === 'Suspended'
      ? confirm({ tone: 'info', title: `Reactivate ${u.name}?`, message: 'They will be able to sign in to this agency again.', confirmLabel: 'Reactivate' })
      : confirm({ tone: 'danger', title: `Suspend ${u.name}?`, message: 'They will be blocked from signing in to this agency until you reactivate them.', detail: 'Their records are kept.', confirmLabel: 'Suspend user' }));
    if (!ok) return;
    setUsers((l) => l.map((x) => (x.id === u.id ? { ...x, status: x.status === 'Suspended' ? 'Active' : 'Suspended' } : x)));
    notify?.(u.status === 'Suspended' ? `${u.name} reactivated` : `${u.name} can no longer sign in`);
  };

  const columns = [
    { key: 'name', label: 'User', render: (u) => <div className="flex items-center gap-3"><Avatar name={u.name} size="sm" /><Cell title={u.name} sub={u.email} /></div> },
    {
      key: 'role', label: 'Role',
      render: (u) => (readOnly ? u.role : (
        <select value={u.role} onChange={(e) => changeRole(u, e.target.value)} aria-label={`Role of ${u.name}`} className="glass-input h-8 rounded-full px-3 text-xs text-ink-800">
          {roles.map((r) => <option key={r.id}>{r.role}</option>)}
        </select>
      )),
    },
    { key: 'status', label: 'Status', render: (u) => <Badge value={u.status} /> },
    { key: 'updated', label: 'Last updated', render: (u) => <span className="text-ink-600">{u.updated}</span> },
    { key: 'act', label: '', className: 'text-right', render: (u) => !readOnly && u.role !== 'Agency Administrator' && <Button variant="ghost" size="sm" onClick={() => toggle(u)}>{u.status === 'Suspended' ? 'Reactivate' : 'Suspend'}</Button> },
  ];

  return (
    <Panel pad={false} className="overflow-hidden">
      <div className="p-5 pb-3">
        <PanelTitle title="Agency users" subtitle="Accounts with access to this tenant">
          {!readOnly && <Button size="sm" icon="plus" onClick={() => setInviting(true)}>Invite user</Button>}
        </PanelTitle>
      </div>
      <DataTable columns={columns} rows={users} />
      {inviting && <InviteDrawer roles={roles} onClose={() => setInviting(false)} onInvite={invite} />}
    </Panel>
  );
}
