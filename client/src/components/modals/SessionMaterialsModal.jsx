import { useRef, useState } from 'react';
import { ActionIcon, Button, Icon, Modal } from '../ui';
import { useConfirm } from './confirmContext';
import DocumentPreviewModal, { downloadDoc } from './DocumentPreviewModal';

const size = (b) => (b < 1048576 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1048576).toFixed(1)} MB`);

/** SessionMaterialsModal — handouts and slides attached to one session. Editable only in edit mode. */
export default function SessionMaterialsModal({ session, editing, onChange, onClose, notify }) {
  const ref = useRef(null);
  const confirm = useConfirm();
  const [viewing, setViewing] = useState(null);

  // Seeded sessions only know how many files they have, so name them.
  const materials = session.materials ?? Array.from({ length: session.files }, (_, i) => ({
    id: `seed-${session.id}-${i}`, file: `Session${session.id}_Material_${i + 1}.pdf`, type: 'Session material', size: `${(0.4 + i * 0.3).toFixed(1)} MB`, uploaded: 'Jun 10, 2025',
  }));
  const save = (next) => onChange({ ...session, materials: next, files: next.length });

  const add = (f) => {
    if (!f) return;
    save([...materials, { id: Date.now(), file: f.name, type: 'Session material', size: size(f.size), uploaded: 'Jun 18, 2025', mime: f.type, url: URL.createObjectURL(f) }]);
    notify?.(`${f.name} attached`);
  };
  const remove = async (m) => {
    if (await confirm({ tone: 'danger', title: 'Remove this material?', message: `“${m.file}” will no longer be available for this session.`, confirmLabel: 'Remove' })) save(materials.filter((x) => x.id !== m.id));
  };

  return (
    <Modal
      title="Session materials"
      subtitle={session.title}
      onClose={onClose}
      width={540}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <>
            <input ref={ref} type="file" className="sr-only" id="material-file" onChange={(e) => { add(e.target.files?.[0]); e.target.value = ''; }} />
            <Button icon="upload" disabled={!editing} onClick={() => ref.current?.click()}>Add material</Button>
          </>
        </>
      }
    >
      <div className="pb-2">
        {materials.length ? (
          <ul className="space-y-2">
            {materials.map((m) => (
              <li key={m.id} className="glass-inset flex items-center gap-3 rounded-2xl px-3.5 py-3">
                <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-white text-brand-600"><Icon name="file" size={16} /></span>
                <span className="min-w-0 flex-1"><strong className="block truncate text-[13px] font-medium text-ink-950">{m.file}</strong><small className="text-xs text-ink-500">{m.size}</small></span>
                <ActionIcon icon="eye" label="View" onClick={() => setViewing(m)} />
                <ActionIcon icon="download" label="Download" tone="brand" onClick={() => { downloadDoc(m); notify?.(`Downloading ${m.file}`); }} />
                <ActionIcon icon="trash" label="Remove" tone="danger" disabled={!editing} onClick={() => remove(m)} />
              </li>
            ))}
          </ul>
        ) : <p className="py-8 text-center text-[13px] text-ink-500">No materials yet.{editing ? ' Use Add material to attach a file.' : ' Press Edit activity to add one.'}</p>}
      </div>
      {viewing && <DocumentPreviewModal doc={viewing} onClose={() => setViewing(null)} notify={notify} />}
    </Modal>
  );
}
