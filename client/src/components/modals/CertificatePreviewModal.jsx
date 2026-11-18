import { Button, Modal } from '../ui';
import { useStore } from '../../hooks/useStore';
import { downloadFile } from '../../lib/download';
import CertificateCanvas, { certificateDocument } from './CertificateCanvas';

/** Everything a certificate needs for one participant, shared by the preview, the download and the template editor. */
export function useCertificateProps(row, activity, template) {
  const { profile, logo } = useStore();
  return {
    name: row.name, activity: activity.title, agency: profile.name, date: activity.date, template, logo,
    initials: profile.shortName.slice(0, 2).toUpperCase(),
    number: `${profile.shortName}-${activity.id}-${String(row.id).padStart(4, '0')}`,
  };
}

/** CertificatePreviewModal — shows the certificate a participant receives, and downloads it. */
export default function CertificatePreviewModal({ row, activity, template, onClose, notify }) {
  const props = useCertificateProps(row, activity, template);
  return (
    <Modal
      title="Certificate"
      subtitle={`${row.name} · ${activity.title}`}
      onClose={onClose}
      width={760}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button icon="download" onClick={() => {
            downloadFile(`Certificate_${row.name.replace(/\s+/g, '_')}.html`, certificateDocument(props), 'text/html');
            notify?.(`Downloading certificate for ${row.name}`);
          }}>Download</Button>
        </>
      }
    >
      <div className="pb-2"><div className="overflow-hidden rounded-xl shadow-[0_14px_36px_rgba(40,70,160,0.16)] ring-1 ring-black/5"><CertificateCanvas {...props} /></div></div>
    </Modal>
  );
}
