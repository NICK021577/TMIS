import { useState } from 'react';
import { Button, Field, Modal, inputCls } from '../ui';
import { useStore } from '../../hooks/useStore';
import { AGENCY_TYPES } from '../../data/platformData';

const NEW = '__new__';

/**
 * Picks a partner from the agency's directory, or adds a new one on the spot (just a name and a type).
 * Partners never need an account here, so any organization can be added.
 *
 *   <PartnerSelect value={id|null} onChange={(id|null) => …} noneLabel="None (our own money)" exclude={[ids]} />
 */
export default function PartnerSelect({ value, onChange, noneLabel, placeholder = 'Choose a partner…', exclude = [], disabled, ariaLabel = 'Partner agency', className = '' }) {
  const { partners, addPartner } = useStore();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState(AGENCY_TYPES[0]);

  const options = partners.filter((p) => (!p.archived || p.id === value) && !exclude.includes(p.id));
  const exists = name.trim() && partners.some((p) => p.name.toLowerCase() === name.trim().toLowerCase());
  const pick = (v) => {
    if (v === NEW) { setAdding(true); return; }
    onChange(v === '' ? null : Number.isNaN(Number(v)) ? v : Number(v));
  };
  const close = () => { setAdding(false); setName(''); setType(AGENCY_TYPES[0]); };
  const save = (e) => {
    e?.preventDefault();
    if (!name.trim()) return;
    onChange(addPartner(name, type));   // a name that already exists reuses that partner
    close();
  };

  return (
    <div className={`min-w-0 ${className}`}>
      <select className={inputCls} aria-label={ariaLabel} disabled={disabled} value={value ?? ''} onChange={(e) => pick(e.target.value)}>
        {noneLabel ? <option value="">{noneLabel}</option> : <option value="" disabled>{placeholder}</option>}
        {options.map((p) => <option key={p.id} value={p.id}>{p.name}{p.archived ? ' (archived)' : ''}</option>)}
        <option value={NEW}>＋ New partner…</option>
      </select>
      {adding && (
        <Modal title="Add a partner" subtitle="Only a name and a type. The partner does not need an account." onClose={close} width={480}
          footer={<><span /><div className="flex gap-2"><Button variant="secondary" onClick={close}>Cancel</Button><Button disabled={!name.trim()} onClick={save}>{exists ? 'Use this partner' : 'Add partner'}</Button></div></>}>
          <form onSubmit={save} className="space-y-4 pb-2">
            <Field label="Name" hint={exists ? 'Already in your directory. It will be used instead of adding a copy.' : undefined}>
              <input autoFocus className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Department of Agriculture Region IX" aria-label="New partner name" />
            </Field>
            <Field label="Type"><select className={inputCls} value={type} onChange={(e) => setType(e.target.value)} aria-label="New partner type">{AGENCY_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
          </form>
        </Modal>
      )}
    </div>
  );
}
