import { useCallback, useEffect, useState } from 'react';
import { Button, Callout, DataTable, Drawer, Field, Icon, Panel, PanelTitle, inputCls } from '../ui';
import { api } from '../../lib/api';
import { ACCESS_OPTIONS, accessLabel, niceDate } from '../../lib/roles';
import { ADMIN_ROLE, MENUS } from '../../lib/menus';

function AddRoleDrawer({ onClose, onAdd }) {
  const [name, setName] = useState('');
  const [access, setAccess] = useState(ACCESS_OPTIONS[1].value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const submit = async () => {
    setSaving(true);
    try { await onAdd(name.trim(), access); } catch (e) { setError(e.message); setSaving(false); }
  };
  return (
    <Drawer title="Add role" subtitle="Roles decide which agency records a user can see" onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button disabled={!name.trim() || saving} onClick={submit}>{saving ? 'Adding…' : 'Add role'}</Button></>}>
      {error && <p role="alert" className="mb-3 flex items-center gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] text-danger ring-1 ring-red-200"><Icon name="alert" size={15} />{error}</p>}
      <Field label="Role name"><input className={inputCls} value={name} onChange={(e) => { setName(e.target.value); setError(''); }} placeholder="e.g. Registration Staff" autoFocus /></Field>
      <Field label="Data access"><select className={inputCls} value={access} onChange={(e) => setAccess(e.target.value)}>{ACCESS_OPTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}</select></Field>
    </Drawer>
  );
}

/** Role permissions: access rules for each role. Saved in the database. */
export default function RolesTab({ readOnly, notify }) {
  const [roles, setRoles] = useState([]);
  const [state, setState] = useState('loading');   // loading | ready | error
  const [loadError, setLoadError] = useState('');
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setState('loading');
    try { setRoles((await api('/agency/roles')).roles); setState('ready'); }
    catch (e) { setLoadError(e.message); setState('error'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  /** Runs a change on the server and shows the refreshed list, or says why it was refused. */
  const change = async (run, done) => {
    try { const res = await run(); setRoles(res.roles); if (done) notify?.(done); }
    catch (e) { notify?.(e.message); }
  };

  const add = async (name, access) => {
    const res = await api('/agency/roles', { method: 'POST', body: { name, access } });
    setRoles(res.roles); setAdding(false); notify?.(`Role “${name}” added`);
  };
  const toggleMenu = (r, key) => {
    const has = r.menus.includes(key);
    change(() => api(`/agency/roles/${r.id}/menus`, { method: 'PUT', body: { menus: has ? r.menus.filter((k) => k !== key) : [...r.menus, key] } }), `Default menus for ${r.name} updated`);
  };
  const setAccess = (r, access) => change(() => api(`/agency/roles/${r.id}`, { method: 'PATCH', body: { access } }), `${r.name} can now see ${accessLabel(access).toLowerCase()}`);

  const columns = [
    { key: 'role', label: 'Role', render: (r) => <strong className="font-medium text-ink-950">{r.name}</strong> },
    {
      key: 'access', label: 'Data access',
      render: (r) => (readOnly || r.name === ADMIN_ROLE ? accessLabel(r.access) : (
        <select value={r.access} onChange={(e) => setAccess(r, e.target.value)} aria-label={`Data access for ${r.name}`} className="glass-input h-8 rounded-full px-3 text-xs text-ink-800">
          {ACCESS_OPTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
        </select>
      )),
    },
    { key: 'users', label: 'Users', render: (r) => `${r.users} ${r.users === 1 ? 'user' : 'users'}` },
    { key: 'updated', label: 'Last updated', render: (r) => <span className="text-ink-600">{niceDate(r.updated)}</span> },
  ];

  return (
    <Panel pad={false} className="overflow-hidden">
      <div className="p-5 pb-3">
        <PanelTitle title="Role permissions" subtitle="Access rules for each role">
          {!readOnly && state === 'ready' && <Button size="sm" icon="plus" onClick={() => setAdding(true)}>Add role</Button>}
        </PanelTitle>
      </div>
      {state === 'loading' && <p className="px-5 pb-6 text-[13px] text-ink-500">Loading roles…</p>}
      {state === 'error' && (
        <div className="flex items-center justify-between gap-3 px-5 pb-6 text-[13px] text-danger"><span>{loadError}</span><Button size="sm" variant="secondary" onClick={load}>Try again</Button></div>
      )}
      {state === 'ready' && (
        <>
          <DataTable columns={columns} rows={roles} />
          {adding && <AddRoleDrawer onClose={() => setAdding(false)} onAdd={add} />}

          <div className="border-t border-ink-100 p-5">
            <PanelTitle title="Default menus" subtitle="Which menus each role can open. These are the starting point for everyone with that role." />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-[13px]">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-ink-500">
                    <th className="py-2 pr-4 font-medium">Menu</th>
                    {roles.map((r) => <th key={r.id} className="px-3 py-2 text-center font-medium">{r.name}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {MENUS.map((m) => (
                    <tr key={m.key} className="border-t border-ink-100">
                      <td className="py-2.5 pr-4"><span className="flex items-center gap-2 text-ink-900"><Icon name={m.icon} size={14} className="text-ink-500" />{m.label}</span></td>
                      {roles.map((r) => {
                        const locked = r.name === ADMIN_ROLE || m.locked;
                        const on = locked || r.menus.includes(m.key);
                        return (
                          <td key={r.id} className="px-3 py-2.5 text-center">
                            <input
                              type="checkbox" checked={on} disabled={readOnly || locked}
                              onChange={() => toggleMenu(r, m.key)}
                              aria-label={`${m.label} for ${r.name}`}
                              className="h-4 w-4 accent-brand-600 disabled:opacity-50"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3"><Callout tone="info" icon="lock">Agency Administrators always see every menu and everyone keeps the Dashboard. To give one person a different set, use <strong className="font-medium">Menus</strong> on their row in Users.</Callout></div>
          </div>
        </>
      )}
    </Panel>
  );
}
