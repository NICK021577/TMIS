import { useConfirm } from '../modals/confirmContext';
import { useState } from 'react';
import { ActionIcon, Badge, Button, DataTable, Field, Icon, Modal, Panel, PanelTitle, inputCls } from '../ui';
import { useStore } from '../../hooks/useStore';

/** Asks for the new category's name. Names must be unique (ignoring case). */
function AddCategoryModal({ categories, onClose, onAdd }) {
  const [name, setName] = useState('');
  const trimmed = name.trim();
  const taken = categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase());
  const submit = (e) => {
    e.preventDefault();
    if (trimmed && !taken) onAdd(trimmed);
  };
  return (
    <Modal title="Add a category" subtitle="Offered when adding participants to your agency" onClose={onClose} width={440}
      footer={<><span /><div className="flex gap-2"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="add-category" icon="plus" disabled={!trimmed || taken}>Add category</Button></div></>}>
      <form id="add-category" onSubmit={submit} className="pb-2">
        <Field label="Name"><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nursery operator" autoFocus /></Field>
        {taken && <p className="mt-2 flex items-center gap-1.5 text-xs text-danger"><Icon name="alert" size={13} />A category with this name already exists.</p>}
      </form>
    </Modal>
  );
}

/** Participant categories: archiving keeps existing participants and activities intact. */
export default function CategoriesTab({ readOnly, notify }) {
  const { categories, setCategories, profile } = useStore();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState('');

  const add = (name) => {
    setCategories((l) => [...l, { id: Date.now(), name, archived: false }]);
    setAdding(false);
    notify?.(`Category “${name}” added`);
  };
  const rename = (c) => {
    if (draft.trim()) setCategories((l) => l.map((x) => (x.id === c.id ? { ...x, name: draft.trim() } : x)));
    setEditing(null);
  };
  const confirm = useConfirm();
  const toggle = async (c) => {
    if (!c.archived && !(await confirm({ tone: 'warn', title: `Archive “${c.name}”?`, message: 'It will no longer be offered when adding participants.', detail: 'Existing participants keep this category. You can restore it later.', confirmLabel: 'Archive' }))) return;
    setCategories((l) => l.map((x) => (x.id === c.id ? { ...x, archived: !x.archived } : x)));
    notify?.(c.archived ? `“${c.name}” restored` : `“${c.name}” archived. Existing participants are kept`);
  };

  const columns = [
    {
      key: 'name', label: 'Category',
      render: (c) => (editing === c.id ? (
        <input autoFocus className={`${inputCls} !h-8`} value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={() => rename(c)} onKeyDown={(e) => e.key === 'Enter' && rename(c)} aria-label="Rename category" />
      ) : <strong className="whitespace-nowrap font-medium text-ink-950">{c.name}</strong>),
    },
    { key: 'status', label: 'Status', render: (c) => <span className="whitespace-nowrap"><Badge value={c.archived ? 'Archived' : 'Active'} tone={c.archived ? 'muted' : 'ok'} /></span> },
    ...(readOnly ? [] : [{
      key: 'act', label: 'Actions', className: 'text-right',
      render: (c) => (
        <div className="flex justify-start gap-1">
          <ActionIcon icon="edit" tone="brand" label={`Rename ${c.name}`} onClick={() => { setEditing(c.id); setDraft(c.name); }} />
          {c.archived
            ? <ActionIcon icon="restore" tone="ok" label={`Restore ${c.name}`} onClick={() => toggle(c)} />
            : <ActionIcon icon="archive" tone="danger" label={`Archive ${c.name}`} onClick={() => toggle(c)} />}
        </div>
      ),
    }]),
  ];

  return (
    <Panel pad={false} className="overflow-hidden">
      <div className="p-5 pb-3">
        <PanelTitle title="Participant categories" subtitle={`Who ${profile.shortName}’s participants are. Archiving keeps existing participants and activities intact.`}>
          {!readOnly && <Button size="sm" icon="plus" onClick={() => setAdding(true)}>Add category</Button>}
        </PanelTitle>
      </div>
      <DataTable columns={columns} rows={categories} />
      {adding && <AddCategoryModal categories={categories} onClose={() => setAdding(false)} onAdd={add} />}
    </Panel>
  );
}
