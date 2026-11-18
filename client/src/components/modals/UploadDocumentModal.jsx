import { useRef, useState } from 'react';
import { Button, Field, Icon, Modal, inputCls } from '../ui';

const TYPES = ['Signed attendance sheet', 'Memo', 'Agreement', 'Certificate', 'Receipt', 'Report', 'Other'];
const MAX_MB = 10;
const size = (b) => (b < 1048576 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1048576).toFixed(1)} MB`);

/** UploadDocumentModal — attach a scanned document to the activity. */
export default function UploadDocumentModal({ onSave, onClose }) {
  const ref = useRef(null);
  const [file, setFile] = useState(null);
  const [type, setType] = useState(TYPES[0]);
  const [error, setError] = useState('');
  const [over, setOver] = useState(false);

  const pick = (f) => {
    if (!f) return;
    if (f.size > MAX_MB * 1048576) { setError(`File is larger than ${MAX_MB} MB.`); return; }
    setError(''); setFile(f);
  };

  return (
    <Modal
      title="Upload scan"
      subtitle="Add a scanned copy of a paper document to this activity"
      onClose={onClose}
      width={500}
      footer={
        <>
          <span />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button disabled={!file} icon="upload" onClick={() => {
              onSave({ id: Date.now(), file: file.name, type, uploaded: 'Jun 18, 2025', size: size(file.size), mime: file.type, url: URL.createObjectURL(file) });
              onClose();
            }}>Upload</Button>
          </div>
        </>
      }
    >
      <div className="space-y-4 pb-2">
        <input ref={ref} type="file" accept=".pdf,.jpg,.jpeg,.png" className="sr-only" id="doc-file" onChange={(e) => pick(e.target.files?.[0])} />
        <button
          type="button"
          onClick={() => ref.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files?.[0]); }}
          className={`flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors ${over ? 'border-brand-500 bg-brand-50' : error ? 'border-danger/60 bg-red-50/40' : 'border-ink-200 bg-white/60 hover:border-brand-400'}`}
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink-100 text-ink-600"><Icon name={file ? 'file' : 'upload'} size={19} /></span>
          {file ? (
            <>
              <strong className="max-w-full truncate text-[13px] font-medium text-ink-950">{file.name}</strong>
              <small className="text-xs text-ink-500">{size(file.size)} · click to replace</small>
            </>
          ) : (
            <>
              <strong className="text-[13px] font-medium text-ink-800">Choose a file or drag it here</strong>
              <small className="text-xs text-ink-500">PDF, JPG or PNG, up to {MAX_MB} MB</small>
            </>
          )}
        </button>
        {error && <p className="flex items-center gap-1.5 text-xs text-danger"><Icon name="alert" size={13} />{error}</p>}
        <Field label="Document type">
          <select className={inputCls} value={type} onChange={(e) => setType(e.target.value)}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
        </Field>
      </div>
    </Modal>
  );
}
