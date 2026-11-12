import { useState } from 'react';
import { Button, DataTable, Drawer, Field, Panel, PanelTitle, inputCls } from '../ui';
import { useStore } from '../../hooks/useStore';
import { DATA_ACCESS } from '../../data/mockData';

function AddRoleDrawer({ onClose, onAdd }) {
  const [role, setRole] = useState('');
  const [access, setAccess] = useState(DATA_ACCESS[1]);
  return (
    <Drawer title="Add role" subtitle="Roles decide which agency records a user can see" onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button disabled={!role.trim()} onClick={() => { onAdd(role.trim(), access); onClose(); }}>Add role</Button></>}>
      <Field label="Role name"><input className={inputCls} value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Registration Staff" autoFocus /></Field>
      <Field label="Data access"><select className={inputCls} value={access} onChange={(e) => setAccess(e.target.value)}>{DATA_ACCESS.map((a) => <option key={a}>{a}</option>)}</select></Field>
    </Drawer>
  );
}

/** Role permissions: access rules for each system role. */
export default function RolesTab({ readOnly, notify }) {
  const { roles, setRoles } = useStore();
  const [adding, setAdding] = useState(false);

  const add = (role, access) => {
    setRoles((l) => [...l, { id: Date.now(), role, access, users: '0 users', updated: 'June 18, 2025' }]);
    notify?.(`Role “${role}” added`);
  };
  const setAccess = (r, access) => setRoles((l) => l.map((x) => (x.id === r.id ? { ...x, access, updated: 'June 18, 2025' } : x)));

  const columns = [
    { key: 'role', label: 'Role', render: (r) => <strong className="font-medium text-ink-950">{r.role}</strong> },
    {
      key: 'access', label: 'Data access',
      render: (r) => (readOnly || r.role === 'Agency Administrator' ? r.access : (
        <select value={r.access} onChange={(e) => setAccess(r, e.target.value)} aria-label={`Data access for ${r.role}`} className="glass-input h-8 rounded-full px-3 text-xs text-ink-800">
          {DATA_ACCESS.map((a) => <option key={a}>{a}</option>)}
        </select>
      )),
    },
    { key: 'users', label: 'Users' },
    { key: 'updated', label: 'Last updated', render: (r) => <span className="text-ink-600">{r.updated}</span> },
  ];

  return (
    <Panel pad={false} className="overflow-hidden">
      <div className="p-5 pb-3">
        <PanelTitle title="Role permissions" subtitle="Access rules for each system role">
          {!readOnly && <Button size="sm" icon="plus" onClick={() => setAdding(true)}>Add role</Button>}
        </PanelTitle>
      </div>
      <DataTable columns={columns} rows={roles} />
      {adding && <AddRoleDrawer onClose={() => setAdding(false)} onAdd={add} />}
    </Panel>
  );
}
