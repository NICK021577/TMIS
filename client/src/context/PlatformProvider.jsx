import { useCallback, useMemo, useState } from 'react';
import { PlatformContext } from './platformContext';
import { SEED_ACCOUNTS, SEED_AGENCIES, SEED_APPLICATIONS, SEED_AUDIT, SEED_SETTINGS } from '../data/platformData';

const OPEN = ['Pending', 'Under review', 'Needs info'];
const pad = (n) => String(n).padStart(2, '0');
const stamp = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export function PlatformProvider({ children, notify }) {
  const [applications, setApplications] = useState(SEED_APPLICATIONS);
  const [agencies, setAgencies] = useState(SEED_AGENCIES);
  const [accounts, setAccounts] = useState(SEED_ACCOUNTS);
  const [audit, setAudit] = useState(SEED_AUDIT);
  const [settings, setSettings] = useState(SEED_SETTINGS);

  const log = useCallback((action, target) => {
    setAudit((a) => [{ id: Date.now() + Math.random(), who: 'Super Administrator', action, target, at: stamp() }, ...a]);
  }, []);

  const decideApplication = useCallback((app, status, reason) => {
    setApplications((list) => list.map((x) => (x.id === app.id ? { ...x, status, reason } : x)));
    log(`${status === 'Approved' ? 'Approved' : status === 'Rejected' ? 'Rejected' : 'Requested info on'} application`, app.agency);
    if (status === 'Approved') {
      setAgencies((list) => [
        ...list,
        { id: app.acronym, name: app.agency, type: app.type, region: app.region, created: stamp().slice(0, 10), admin: app.contact, usage: 'New workspace', suspended: false },
      ]);
      notify?.(`Approved. Invitation email sent to ${app.contact}`);
    } else if (status === 'Rejected') {
      notify?.('Rejected. The reason is included in the applicant email');
    } else {
      notify?.(`Marked ${status}`);
    }
  }, [log, notify]);

  const createAgency = useCallback((name, type, acronym) => {
    const id = (acronym || name.slice(0, 6)).toUpperCase();
    setAgencies((list) => [...list, { id, name, type, region: '—', created: stamp().slice(0, 10), admin: 'Not assigned', usage: 'New workspace', suspended: false }]);
    log('Created agency directly', name);
    notify?.('Agency created without an application');
  }, [log, notify]);

  const toggleSuspend = useCallback((agency) => {
    const next = !agency.suspended;
    setAgencies((list) => list.map((a) => (a.id === agency.id ? { ...a, suspended: next } : a)));
    log(next ? 'Suspended agency' : 'Reactivated agency', agency.name);
    notify?.(next ? 'Agency suspended. Its users cannot sign in' : 'Agency reactivated');
  }, [log, notify]);

  const toggleAccount = useCallback((acc) => {
    const next = acc.status === 'Suspended' ? 'Active' : 'Suspended';
    setAccounts((list) => list.map((a) => (a.id === acc.id ? { ...a, status: next } : a)));
    log(next === 'Suspended' ? 'Suspended account' : 'Reactivated account', acc.name);
    notify?.(next === 'Suspended' ? `${acc.name} can no longer sign in` : `${acc.name} reactivated`);
  }, [log, notify]);

  const resetPassword = useCallback((acc) => {
    log('Sent password reset', acc.name);
    notify?.(`Password reset email sent to ${acc.email}`);
  }, [log, notify]);

  const updateSettings = useCallback((patch, what) => {
    setSettings((s) => ({ ...s, ...patch }));
    log('Updated global settings', what);
  }, [log]);

  const value = useMemo(() => ({
    applications, agencies, accounts, audit, settings,
    openApplications: applications.filter((a) => OPEN.includes(a.status)),
    decideApplication, createAgency, toggleSuspend, toggleAccount, resetPassword, updateSettings, notify,
  }), [applications, agencies, accounts, audit, settings, decideApplication, createAgency, toggleSuspend, toggleAccount, resetPassword, updateSettings, notify]);

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}
