import { useState } from 'react';
import { Button, Field, Modal, inputCls } from '../ui';

const label = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', weekday: 'long' });

/** AddDayModal — add another day that needs its own staff assignments. */
export default function AddDayModal({ nextNumber, onAdd, onClose }) {
  const [date, setDate] = useState('2025-06-20');
  return (
    <Modal
      title="Add another day"
      subtitle={`This becomes Day ${nextNumber} of the activity`}
      onClose={onClose}
      width={420}
      footer={
        <>
          <span />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button disabled={!date} onClick={() => { onAdd(label(date)); onClose(); }}>Add day</Button>
          </div>
        </>
      }
    >
      <div className="pb-2">
        <Field label="Date" hint="Use this when staff are needed on a day that is not yet listed, such as a follow-up or make-up day.">
          <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} autoFocus />
        </Field>
      </div>
    </Modal>
  );
}
