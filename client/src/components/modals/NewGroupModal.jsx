import { useState } from 'react';
import { Button, Field, Modal, inputCls } from '../ui';
import { useStore } from '../../hooks/useStore';

/** NewGroupModal — start a message group for an activity or the whole agency. */
export default function NewGroupModal({ onCreate, onClose }) {
  const { activities } = useStore();
  const [name, setName] = useState('');
  const [type, setType] = useState('Activity group');
  const [activity, setActivity] = useState(activities[0]?.title ?? '');

  const finalName = name.trim() || (type === 'Activity group' ? activity : '');

  return (
    <Modal
      title="New group"
      subtitle="Members join from the mobile app or are added by you"
      onClose={onClose}
      width={480}
      footer={<><span /><div className="flex gap-2"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button disabled={!finalName} onClick={() => { onCreate({ name: finalName, type, members: 1, unread: 0 }); onClose(); }}>Create group</Button></div></>}
    >
      <div className="space-y-4 pb-2">
        <Field label="Group type">
          <select className={inputCls} value={type} onChange={(e) => setType(e.target.value)}><option>Activity group</option><option>Agency-wide group</option></select>
        </Field>
        {type === 'Activity group' && (
          <Field label="Activity">
            <select className={inputCls} value={activity} onChange={(e) => setActivity(e.target.value)}>{activities.map((a) => <option key={a.id}>{a.title}</option>)}</select>
          </Field>
        )}
        <Field label="Group name" hint={type === 'Activity group' ? 'Leave blank to use the activity name.' : undefined}>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder="e.g. Nursery Management Batch 3" />
        </Field>
      </div>
    </Modal>
  );
}
