import { renderToStaticMarkup } from 'react-dom/server';

/**
 * CertificateCanvas — one certificate, drawn with inline styles only.
 * Sizes use container units (cqw), so it scales to any width and the same markup can be saved as a stand-alone page.
 */
export const CERT_STYLES = [
  { id: 'classic', label: 'Classic' },
  { id: 'modern',  label: 'Modern' },
  { id: 'minimal', label: 'Minimal' },
];
export const CERT_COLORS = ['#2f5fcc', '#1f6e4b', '#a0603a', '#7a3fd0', '#c2410c', '#1d2433'];
export const DEFAULT_TEMPLATE = {
  style: 'classic', accent: '#2f5fcc', title: 'Certificate of Completion', message: 'has successfully completed', showLogo: true,
  signers: [{ name: '', role: 'Agency Administrator', signature: null }, { name: '', role: 'Activity Lead', signature: null }],
};

const SERIF = 'Georgia, "Times New Roman", serif';
const SANS = 'Inter, ui-sans-serif, system-ui, sans-serif';

function Mark({ logo, initials, accent, size }) {
  if (logo) return <img src={logo} alt="" style={{ width: size, height: size, objectFit: 'contain' }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: '22%', background: accent, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: `calc(${size} * 0.38)`, fontFamily: SANS }}>{initials}</div>
  );
}

function Signers({ signers, accent, align = 'center' }) {
  return (
    <div style={{ display: 'flex', justifyContent: align === 'center' ? 'space-around' : 'flex-start', gap: '6cqw' }}>
      {signers.map((s, i) => (
        <div key={i} style={{ minWidth: '20cqw', textAlign: 'center' }}>
          {s.signature ? (
            <div style={{ height: '5cqw', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
              <img src={s.signature} alt="" style={{ maxHeight: '5cqw', maxWidth: '18cqw', objectFit: 'contain' }} />
            </div>
          ) : (
            <div style={{ height: '3cqw', fontFamily: SERIF, fontStyle: 'italic', fontSize: '1.9cqw', color: '#3a4256' }}>{s.name}</div>
          )}
          <div style={{ borderTop: `0.15cqw solid ${accent}`, paddingTop: '0.7cqw', fontSize: '1.25cqw', color: '#6b7590', fontFamily: SANS }}>
            {s.signature && s.name && <div style={{ color: '#3a4256', fontWeight: 600 }}>{s.name}</div>}
            {s.role}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CertificateCanvas({ name, activity, agency, date, number, template = DEFAULT_TEMPLATE, logo = null, initials = 'UF' }) {
  const t = { ...DEFAULT_TEMPLATE, ...template };
  const mark = t.showLogo ? <Mark logo={logo} initials={initials} accent={t.accent} size="7cqw" /> : null;
  const foot = <div style={{ fontSize: '1.15cqw', color: '#8d95ab', fontFamily: SANS }}>Certificate No. {number}</div>;
  const root = { containerType: 'inline-size', width: '100%' };
  const page = { width: '100%', aspectRatio: '1.414 / 1', boxSizing: 'border-box', background: '#fff', position: 'relative', overflow: 'hidden', color: '#1d2433' };

  if (t.style === 'modern') {
    return (
      <div style={root}>
        <div style={{ ...page, display: 'grid', gridTemplateColumns: '16cqw 1fr', fontFamily: SANS }}>
          <div style={{ background: t.accent, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '4cqw 0' }}>
            {mark ? <div style={{ background: '#fff', borderRadius: '1.4cqw', padding: '1cqw' }}>{mark}</div> : <span />}
            <div style={{ color: 'rgba(255,255,255,.85)', fontSize: '1.2cqw', letterSpacing: '.3em', writingMode: 'vertical-rl', textTransform: 'uppercase' }}>{agency}</div>
          </div>
          <div style={{ padding: '6cqw 6cqw 4cqw', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '1.4cqw', letterSpacing: '.28em', textTransform: 'uppercase', color: t.accent, fontWeight: 600 }}>{t.title}</div>
            <div style={{ marginTop: '4cqw', fontSize: '1.7cqw', color: '#6b7590' }}>This certifies that</div>
            <div style={{ margin: '1cqw 0 2cqw', fontSize: '6cqw', fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.05 }}>{name}</div>
            <div style={{ fontSize: '1.7cqw', color: '#6b7590' }}>{t.message}</div>
            <div style={{ marginTop: '.8cqw', fontSize: '2.6cqw', fontWeight: 600 }}>{activity}</div>
            <div style={{ marginTop: '.6cqw', fontSize: '1.6cqw', color: '#6b7590' }}>{date}</div>
            <div style={{ marginTop: 'auto' }}><Signers signers={t.signers} accent={t.accent} align="start" /><div style={{ marginTop: '2cqw' }}>{foot}</div></div>
          </div>
        </div>
      </div>
    );
  }

  if (t.style === 'minimal') {
    return (
      <div style={root}>
        <div style={{ ...page, padding: '3cqw', fontFamily: SANS }}>
          <div style={{ height: '100%', border: `0.2cqw solid ${t.accent}`, boxSizing: 'border-box', padding: '5cqw 6cqw', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            {mark}
            <div style={{ marginTop: '1.4cqw', fontSize: '1.3cqw', letterSpacing: '.3em', textTransform: 'uppercase', color: '#6b7590' }}>{agency}</div>
            <div style={{ marginTop: '4cqw', fontSize: '2.2cqw', fontWeight: 500, color: t.accent }}>{t.title}</div>
            <div style={{ margin: '3.4cqw 0 1.6cqw', fontSize: '5.6cqw', fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1.05 }}>{name}</div>
            <div style={{ fontSize: '1.6cqw', color: '#6b7590' }}>{t.message}</div>
            <div style={{ marginTop: '.8cqw', fontSize: '2.3cqw', fontWeight: 500 }}>{activity}</div>
            <div style={{ marginTop: '.6cqw', fontSize: '1.5cqw', color: '#6b7590' }}>{date}</div>
            <div style={{ marginTop: 'auto', width: '100%' }}><Signers signers={t.signers} accent={t.accent} /><div style={{ marginTop: '1.6cqw' }}>{foot}</div></div>
          </div>
        </div>
      </div>
    );
  }

  // classic
  return (
    <div style={root}>
      <div style={{ ...page, padding: '2.2cqw', fontFamily: SERIF }}>
        <div style={{ height: '100%', border: `0.9cqw double ${t.accent}`, boxSizing: 'border-box', padding: '3.6cqw 6cqw', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          {mark}
          <div style={{ marginTop: '1cqw', fontSize: '1.3cqw', letterSpacing: '.28em', textTransform: 'uppercase', color: '#6b7590', fontFamily: SANS }}>{agency}</div>
          <div style={{ marginTop: '2.4cqw', fontSize: '5cqw', fontWeight: 700, color: t.accent, letterSpacing: '-0.01em' }}>{t.title}</div>
          <div style={{ marginTop: '2.4cqw', fontSize: '1.8cqw', color: '#6b7590', fontStyle: 'italic' }}>This certifies that</div>
          <div style={{ margin: '1cqw 0', fontSize: '5cqw', fontStyle: 'italic', borderBottom: `0.15cqw solid ${t.accent}`, padding: '0 4cqw .4cqw' }}>{name}</div>
          <div style={{ fontSize: '1.8cqw', color: '#6b7590', fontStyle: 'italic' }}>{t.message}</div>
          <div style={{ marginTop: '.8cqw', fontSize: '2.6cqw', fontWeight: 700 }}>{activity}</div>
          <div style={{ marginTop: '.6cqw', fontSize: '1.6cqw', color: '#6b7590' }}>{date}</div>
          <div style={{ marginTop: 'auto', width: '100%' }}><Signers signers={t.signers} accent={t.accent} /><div style={{ marginTop: '1.4cqw' }}>{foot}</div></div>
        </div>
      </div>
    </div>
  );
}

/** A stand-alone, printable page for one certificate. */
export function certificateDocument(props) {
  const markup = renderToStaticMarkup(<CertificateCanvas {...props} />);
  return `<!doctype html><html lang="en"><meta charset="utf-8"><title>Certificate - ${String(props.name).replace(/[<>&]/g, '')}</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#eef3ff}.w{width:min(1100px,96vw);box-shadow:0 20px 60px rgba(40,60,140,.2)}@media print{body{background:#fff}.w{width:100%;box-shadow:none}}@page{size:landscape;margin:0}</style>
<div class="w">${markup}</div></html>`;
}
