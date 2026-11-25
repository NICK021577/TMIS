import { Button, Icon, KeyValue, Modal } from '../ui';
import { downloadFile, downloadPlaceholder } from '../../lib/download';

/**
 * DocumentPreviewModal — view any document, output or attachment by name.
 * A file the user really uploaded is shown for real; a seeded one shows a stand-in page.
 */
export function downloadDoc(doc) {
  if (doc.url) {
    const a = Object.assign(document.createElement('a'), { href: doc.url, download: doc.file });
    document.body.appendChild(a); a.click(); a.remove();
  } else {
    downloadPlaceholder(doc.file, [doc.type ? `Type: ${doc.type}` : '', doc.size ? `Size: ${doc.size}` : '', doc.uploaded ? `Uploaded: ${doc.uploaded}` : ''].filter(Boolean));
  }
}

/** `details` adds rows under the preview; `onRemove` (optional) shows a Remove button for attachments the user may delete. */
export default function DocumentPreviewModal({ doc, onClose, notify, details = [], onRemove }) {
  const isImage = doc.mime?.startsWith('image/');
  const isPdf = doc.mime === 'application/pdf';

  return (
    <Modal
      title={doc.file}
      subtitle={[doc.type, doc.size].filter(Boolean).join(' · ') || 'Preview'}
      onClose={onClose}
      width={640}
      footer={
        <>
          {onRemove ? <Button variant="ghost" icon="trash" className="text-danger hover:text-danger" onClick={onRemove}>Remove</Button> : <span />}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>Close</Button>
            <Button icon="download" onClick={() => { downloadDoc(doc); notify?.(`Downloading ${doc.file}`); }}>Download</Button>
          </div>
        </>
      }
    >
      <div className="space-y-4 pb-2">
        <div className="glass-inset grid min-h-[260px] place-items-center overflow-hidden rounded-2xl p-4">
          {doc.url && isImage ? (
            <img src={doc.url} alt={doc.file} className="max-h-[360px] rounded-lg object-contain" />
          ) : doc.url && isPdf ? (
            <iframe title={doc.file} src={doc.url} className="h-[380px] w-full rounded-lg border-0 bg-white" />
          ) : (
            <div className="w-full max-w-[320px] rounded-lg bg-white p-6 shadow-[0_10px_30px_rgba(40,70,160,0.15)]">
              <span className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-brand-100 text-brand-700"><Icon name="file" size={18} /></span>
              <strong className="block text-[13px] font-medium text-ink-950">{doc.file}</strong>
              <div className="mt-4 space-y-2" aria-hidden="true">
                {[100, 92, 96, 60, 100, 84, 70].map((w, i) => <i key={i} className="block h-2 rounded-full bg-ink-100" style={{ width: `${w}%` }} />)}
              </div>
            </div>
          )}
        </div>
        <KeyValue rows={[
          ['File name', doc.file],
          ['Type', doc.type ?? '—'],
          ['Size', doc.size ?? '—'],
          ['Uploaded', doc.uploaded ?? '—'],
          ...details,
        ]} />
        {!doc.url && <p className="text-xs text-ink-500">This is a stand-in preview. Real documents appear here once files are uploaded.</p>}
      </div>
    </Modal>
  );
}

export { downloadFile };
