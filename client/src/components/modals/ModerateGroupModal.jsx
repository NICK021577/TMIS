import { useState } from 'react';
import { ActionIcon, Avatar, Badge, Button, Modal, Switch } from '../ui';
import { useConfirm } from './confirmContext';

const SEED = ['Dr. Marissa Flores', 'Juan Dela Cruz', 'Maria Santos', 'Rogelio Mendoza', 'Elena Garcia', 'Antonio Reyes'];

/** ModerateGroupModal — manage members and posting rules of a message group. */
export default function ModerateGroupModal({ group, onUpdate, onDelete, onClose, notify }) {
  const confirm = useConfirm();
  const [members, setMembers] = useState(() => SEED.map((name, i) => ({ name, muted: false, admin: i === 0 })));
  const [adminsOnly, setAdminsOnly] = useState(false);

  const mute = (n) => setMembers((l) => l.map((m) => (m.name === n ? { ...m, muted: !m.muted } : m)));
  const remove = async (m) => {
    if (!(await confirm({ tone: 'danger', title: `Remove ${m.name}?`, message: `They will no longer see messages in “${group.name}”.`, confirmLabel: 'Remove member' }))) return;
    setMembers((l) => l.filter((x) => x.name !== m.name));
    onUpdate({ members: Math.max(1, group.members - 1) });
  };
  const del = async () => {
    if (await confirm({ tone: 'danger', title: `Delete “${group.name}”?`, message: 'The group and its messages will be removed for everyone.', detail: 'This cannot be undone.', confirmLabel: 'Delete group' })) { onDelete(); onClose(); notify?.('Group deleted'); }
  };

  return (
    <Modal
      title="Moderate group"
      subtitle={`${group.name} · ${group.members} members`}
      onClose={onClose}
      width={520}
      footer={<><Button variant="danger" onClick={del}>Delete group</Button><Button onClick={() => { notify?.(`Moderation settings saved for ${group.name}`); onClose(); }}>Done</Button></>}
    >
      <div className="space-y-4 pb-2">
        <label className="glass-inset flex items-center justify-between gap-4 rounded-2xl px-4 py-3">
          <span><strong className="block text-[13px] font-medium text-ink-950">Only admins can post</strong><small className="text-xs text-ink-500">Members can read but not reply.</small></span>
          <Switch checked={adminsOnly} onChange={setAdminsOnly} label="Only admins can post" />
        </label>
        <ul className="space-y-1.5">
          {members.map((m) => (
            <li key={m.name} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/50">
              <Avatar name={m.name} size="sm" />
              <span className="min-w-0 flex-1"><strong className="block truncate text-[13px] font-medium text-ink-950">{m.name}</strong></span>
              {m.admin ? <Badge value="Admin" tone="info" variant="pill" /> : (
                <>
                  {m.muted && <Badge value="Muted" tone="warn" variant="pill" />}
                  <ActionIcon icon={m.muted ? 'bell' : 'eyeOff'} label={m.muted ? 'Unmute' : 'Mute'} onClick={() => mute(m.name)} />
                  <ActionIcon icon="trash" tone="danger" label="Remove from group" onClick={() => remove(m)} />
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}
