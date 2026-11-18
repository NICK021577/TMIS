import { useConfirm } from '../modals/confirmContext';
import { useState } from 'react';
import { Badge, Button, DataTable, Field, Panel, PanelTitle, inputCls } from '../ui';
import { useStore } from '../../hooks/useStore';

/** Participant categories: archiving keeps existing participants and activities intact. */
export default function CategoriesTab({ readOnly, notify }) {
  const { categories, setCategories, profile } = useStore();
  const [name, setName] = useState('');
  const [qs, setQs] = useState('');
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState('');

  const add = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCategories((l) => [...l, { id: Date.now(), name: name.trim(), questions: qs.trim(), archived: false }]);
    notify?.(`Category “${name.trim()}” added`);
    setName(''); setQs('');
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
      ) : <strong className="font-medium text-ink-950">{c.name}</strong>),
    },
    { key: 'questions', label: 'Extra questions', render: (c) => <span className="text-ink-600">{c.questions || 'None'}</span> },
    { key: 'status', label: 'Status', render: (c) => <Badge value={c.archived ? 'Archived' : 'Active'} tone={c.archived ? 'muted' : 'ok'} /> },
    {
      key: 'act', label: '', className: 'text-right',
      render: (c) => !readOnly && (
        <div className="flex justify-start gap-1">
          <Button variant="ghost" size="sm" onClick={() => { setEditing(c.id); setDraft(c.name); }}>Rename</Button>
          <Button variant="ghost" size="sm" onClick={() => toggle(c)}>{c.archived ? 'Restore' : 'Archive'}</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[1fr_320px]">
      <Panel pad={false} className="overflow-hidden">
        <div className="p-5 pb-3"><PanelTitle title="Participant categories" subtitle={`Who ${profile.shortName}’s participants are. Archiving keeps existing participants and activities intact.`} /></div>
        <DataTable columns={columns} rows={categories.map((c) => ({ ...c, id: c.id }))} />
      </Panel>

      {!readOnly && (
        <Panel>
          <PanelTitle title="Add a category" />
          <form onSubmit={add} className="space-y-4">
            <Field label="Name"><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nursery operator" /></Field>
            <Field label="Extra questions (optional)" hint="Separate with semicolons, e.g. Rubber farm area; Years of experience">
              <input className={inputCls} value={qs} onChange={(e) => setQs(e.target.value)} />
            </Field>
            <Button type="submit" icon="plus" disabled={!name.trim()}>Add category</Button>
          </form>
        </Panel>
      )}
    </div>
  );
}
