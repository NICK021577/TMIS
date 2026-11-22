import { useCallback, useEffect, useState } from 'react';
import { useConfirm } from '../modals/confirmContext';
import { ActionIcon, Avatar, Badge, Button, Callout, Cell, DataTable, Drawer, Field, Icon, Modal, Panel, PanelTitle, Switch, inputCls } from '../ui';
import { api } from '../../lib/api';
import { copyText } from '../../lib/download';
import { niceDate } from '../../lib/roles';
import { ADMIN_ROLE, MENUS } from '../../lib/menus';

/** Adds a person to the agency. They get a temporary password and choose their own when they first sign in. */
function AddUserDrawer({ roles, onClose, onAdd }) {
  const [f, setF] = useState({ firstName: '', lastName: '', email: '', roleId: roles.find((r) => r.name === 'Committee Member')?.id ?? roles[0]?.id ?? '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const ok = f.firstName.trim() && f.lastName.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()) && f.roleId;
  const set = (patch) => { setF((p) => ({ ...p, ...patch })); setError(''); };
  const submit = async () => {
    setSaving(true);
    try { await onAdd({ ...f, firstName: f.firstName.trim(), lastName: f.lastName.trim(), email: f.email.trim() }); }
    catch (e) { setError(e.message); setSaving(false); }
  };
  return (
    <Drawer title="Add user" subtitle="Creates their account with a temporary password" onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button disabled={!ok || saving} onClick={submit}>{saving ? 'Adding…' : 'Add user'}</Button></>}>
      {error && <p role="alert" className="mb-3 flex items-center gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] text-danger ring-1 ring-red-200"><Icon name="alert" size={15} />{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name"><input className={inputCls} value={f.firstName} onChange={(e) => set({ firstName: e.target.value })} autoFocus /></Field>
        <Field label="Last name"><input className={inputCls} value={f.lastName} onChange={(e) => set({ lastName: e.target.value })} /></Field>
      </div>
      <Field label="Email address"><input type="email" className={inputCls} value={f.email} onChange={(e) => set({ email: e.target.value })} placeholder="name@agency.gov.ph" /></Field>
      <Field label="Role"><select className={inputCls} value={f.roleId} onChange={(e) => set({ roleId: Number(e.target.value) })}>{roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></Field>
    </Drawer>
  );
}

/** Shown once: the temporary password cannot be read again after this window closes. */
function CredentialsModal({ email, password, onClose }) {
  const [copied, setCopied] = useState(false);
  return (
    <Modal title="Account created" subtitle="Share these sign-in details with the person" onClose={onClose} width={480}
      footer={<><span /><Button onClick={onClose}>Done</Button></>}>
      <div className="space-y-4 pb-2">
        <dl className="glass-inset space-y-3 rounded-2xl p-4 text-[13px]">
          <div><dt className="text-xs text-ink-500">Email</dt><dd className="mt-0.5 text-ink-950">{email}</dd></div>
          <div><dt className="text-xs text-ink-500">Temporary password</dt><dd className="mt-0.5 flex items-center justify-between gap-3"><code className="rounded-md bg-white/80 px-2 py-1 text-[14px] tracking-wide text-ink-950">{password}</code>
            <Button size="sm" variant="secondary" onClick={async () => { setCopied(await copyText(password)); }}>{copied ? 'Copied' : 'Copy'}</Button></dd></div>
        </dl>
        <Callout tone="warn" icon="lock">This password is shown only now and is not stored anywhere you can read it. They will be asked to choose their own password when they first sign in.</Callout>
      </div>
    </Modal>
  );
}

/** One person's menus: starts from their role's defaults, the admin can switch single menus on or off. */
function MenusDrawer({ person, role, onClose, onChange }) {
  const base = role?.menus ?? [];
  const override = person.menuOverride ?? {};
  const full = person.role === ADMIN_ROLE;
  const on = (key) => (key in override ? override[key] : base.includes(key));
  const custom = Object.keys(override).length;
  const flip = (key) => {
    const next = { ...override };
    const want = !on(key);
    if (want === base.includes(key)) delete next[key]; else next[key] = want;   // same as the role default = no override
    onChange(person, next);
  };
  return (
    <Drawer title={`Menus for ${person.name}`} subtitle={`${person.role} · ${custom ? `${custom} change${custom > 1 ? 's' : ''} from the role defaults` : 'using the role defaults'}`} onClose={onClose} width={580}
      footer={<><Button variant="secondary" disabled={!custom} onClick={() => onChange(person, {})}>Reset to role defaults</Button><Button onClick={onClose}>Done</Button></>}>
      {full && <p className="mb-3 flex items-center gap-2 rounded-2xl bg-brand-100/60 px-4 py-3 text-[13px] text-brand-900"><Icon name="lock" size={14} />Agency Administrators always see every menu.</p>}
      <ul className="divide-y divide-ink-100">
        {MENUS.map((m) => {
          const locked = full || m.locked;
          const changed = m.key in override;
          return (
            <li key={m.key} className="flex items-center gap-3 py-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink-100 text-ink-600"><Icon name={m.icon} size={15} /></span>
              <span className="min-w-0 flex-1">
                <strong className="block text-[13px] font-medium text-ink-950">{m.label}</strong>
                <small className="text-xs text-ink-500">{locked ? 'Always on' : changed ? `Changed (role default: ${base.includes(m.key) ? 'on' : 'off'})` : 'Role default'}</small>
              </span>
              <Switch checked={locked || on(m.key)} onChange={() => !locked && flip(m.key)} label={`${m.label} for ${person.name}`} />
            </li>
          );
        })}
      </ul>
    </Drawer>
  );
}

/** Agency users: accounts with access to this agency. Everything here is saved in the database. */
export default function UsersTab({ readOnly, notify }) {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [state, setState] = useState('loading');   // loading | ready | error
  const [loadError, setLoadError] = useState('');
  const [adding, setAdding] = useState(false);
  const [menuFor, setMenuFor] = useState(null);
  const [created, setCreated] = useState(null);     // { email, password }
  const confirm = useConfirm();

  const load = useCallback(async () => {
    setState('loading');
    try {
      const [u, r] = await Promise.all([api('/agency/users'), api('/agency/roles')]);
      setUsers(u.users); setRoles(r.roles); setState('ready');
    } catch (e) { setLoadError(e.message); setState('error'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  /** Runs a change on the server and shows the refreshed list, or says why it was refused. */
  const change = async (run, done) => {
    try { const res = await run(); setUsers(res.users); if (done) notify?.(done); return res; }
    catch (e) { notify?.(e.message); return null; }
  };

  const add = async (f) => {
    const res = await api('/agency/users', { method: 'POST', body: f });
    setUsers(res.users);
    setAdding(false);
    if (res.tempPassword) setCreated({ email: f.email.toLowerCase(), password: res.tempPassword });
    else notify?.(`${f.email} already has an account and was added to your agency`);
  };
  const changeRole = (u, roleId) => change(() => api(`/agency/users/${u.id}`, { method: 'PATCH', body: { roleId } }), `${u.name} is now ${roles.find((r) => r.id === roleId)?.name}`);
  const setOverride = (u, override) => change(() => api(`/agency/users/${u.id}/menus`, { method: 'PUT', body: { override } }), Object.keys(override).length ? `Menus for ${u.name} customised` : `${u.name} now uses the ${u.role} defaults`);
  const toggle = async (u) => {
    const ok = await (u.status === 'Suspended'
      ? confirm({ tone: 'info', title: `Reactivate ${u.name}?`, message: 'They will be able to sign in to this agency again.', confirmLabel: 'Reactivate' })
      : confirm({ tone: 'danger', title: `Suspend ${u.name}?`, message: 'They will be blocked from signing in to this agency until you reactivate them.', detail: 'Their records are kept.', confirmLabel: 'Suspend user' }));
    if (!ok) return;
    change(() => api(`/agency/users/${u.id}`, { method: 'PATCH', body: { status: u.status === 'Suspended' ? 'active' : 'suspended' } }),
      u.status === 'Suspended' ? `${u.name} reactivated` : `${u.name} can no longer sign in`);
  };

  const columns = [
    { key: 'name', label: 'User', render: (u) => <div className="flex items-center gap-3"><Avatar name={u.name} size="sm" /><Cell title={u.name} sub={u.email} /></div> },
    {
      key: 'role', label: 'Role',
      render: (u) => (readOnly || u.role === ADMIN_ROLE ? u.role : (
        <select value={u.roleId} onChange={(e) => changeRole(u, Number(e.target.value))} aria-label={`Role of ${u.name}`} className="glass-input h-8 rounded-full px-3 text-xs text-ink-800">
          {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      )),
    },
    {
      key: 'menus', label: 'Menus',
      render: (u) => (
        <span className="flex items-center gap-2 whitespace-nowrap text-ink-600">
          <span>{u.menus.length} of {MENUS.length}</span>
          {Object.keys(u.menuOverride).length > 0 && <span className="flex-shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-900">Custom</span>}
        </span>
      ),
    },
    { key: 'status', label: 'Status', render: (u) => <Badge value={u.status} /> },
    { key: 'updated', label: 'Last updated', render: (u) => <span className="text-ink-600">{niceDate(u.updated)}</span> },
    ...(readOnly ? [] : [{
      key: 'act', label: 'Actions', className: 'text-right', render: (u) => (
        <div className="flex justify-start gap-1">
          <ActionIcon icon="menu" tone="brand" label={`Menus for ${u.name}`} onClick={() => setMenuFor(u.id)} />
          {u.role !== ADMIN_ROLE && (u.status === 'Suspended'
            ? <ActionIcon icon="refresh" tone="ok" label={`Reactivate ${u.name}`} onClick={() => toggle(u)} />
            : <ActionIcon icon="lock" tone="danger" label={`Suspend ${u.name}`} onClick={() => toggle(u)} />)}
        </div>
      ),
    }]),
  ];

  const menuPerson = users.find((x) => x.id === menuFor);
  return (
    <Panel pad={false} className="overflow-hidden">
      <div className="p-5 pb-3">
        <PanelTitle title="Agency users" subtitle="Accounts with access to this agency">
          {!readOnly && state === 'ready' && <Button size="sm" icon="plus" onClick={() => setAdding(true)}>Add user</Button>}
        </PanelTitle>
      </div>
      {state === 'loading' && <p className="px-5 pb-6 text-[13px] text-ink-500">Loading users…</p>}
      {state === 'error' && (
        <div className="flex items-center justify-between gap-3 px-5 pb-6 text-[13px] text-danger"><span>{loadError}</span><Button size="sm" variant="secondary" onClick={load}>Try again</Button></div>
      )}
      {state === 'ready' && <DataTable columns={columns} rows={users} />}
      {menuPerson && <MenusDrawer person={menuPerson} role={roles.find((r) => r.id === menuPerson.roleId)} onClose={() => setMenuFor(null)} onChange={setOverride} />}
      {adding && <AddUserDrawer roles={roles} onClose={() => setAdding(false)} onAdd={add} />}
      {created && <CredentialsModal email={created.email} password={created.password} onClose={() => setCreated(null)} />}
    </Panel>
  );
}
